import { PrismaClient } from './generated/prisma/client';
import { StorageService } from './services/StorageService.ts';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();
const storageService = new StorageService();

function getMimeType(extension?: string): string {
    const mimeTypes: Record<string, string> = {
        "flac": "audio/flac",
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "ogg": "audio/ogg",
        "opus": "audio/opus",
        "m4a": "audio/mp4",
        "aac": "audio/aac",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "lrc": "text/plain",
    };
    return mimeTypes[extension?.replace('.', '') || ""] || "application/octet-stream";
}

async function main() {
    console.log("Starting migration to MinIO...");
    await storageService.initialize();
    
    const tracks = await prisma.track.findMany({
        include: {
            album: true,
            artist: true
        }
    });

    console.log(`Found ${tracks.length} tracks to migrate.`);

    for (const track of tracks) {
        let localPath = path.resolve(process.cwd(), track.path);
        
        // If track.path is already migrated (doesn't start with media), try to reconstruct local path
        if (!track.path.startsWith('media')) {
             const artistName = track.artist.name;
             const albumName = track.album?.name || ''; 
             
             // We need to find the extension.
             const searchDir = path.join(process.cwd(), 'media', artistName, albumName);
             
             try {
                 const files = await fs.readdir(searchDir);
                 const audioFile = files.find(f => path.parse(f).name === track.name && ['.mp3', '.m4a', '.flac', '.wav', '.ogg', '.opus', '.aac'].includes(path.extname(f).toLowerCase()));
                 
                 if (audioFile) {
                     localPath = path.join(searchDir, audioFile);
                 } else {
                     console.warn(`Could not find local file for ${track.name} in ${searchDir}`);
                     continue;
                 }
             } catch (e) {
                 console.warn(`Could not access directory ${searchDir} for ${track.name}`);
                 continue;
             }
        }
        
        try {
            await fs.access(localPath);
        } catch (e) {
            console.warn(`File not found locally: ${localPath}. Skipping upload.`);
            continue;
        }

        console.log(`Migrating: ${track.name} (${localPath})`);

        // Construct new object key: artist_id/album_id/filename.mp3
        const filename = path.basename(localPath);
        const newKey = `${track.artistID}/${track.albumID}/${filename}`;
        const ext = path.extname(filename).toLowerCase();
        const mimeType = getMimeType(ext);

        try {
            // Upload Audio (Only if not already migrated? Or overwrite to be safe?)
            // Since we are re-running, let's overwrite.
            await storageService.uploadFile(newKey, localPath, {
                'Content-Type': mimeType,
            });
            
            // Handle Siblings (Thumbnail & Lyrics)
            const dir = path.dirname(localPath);
            const nameWithoutExt = path.parse(localPath).name;
            
            // 1. Thumbnail
            let thumbnailKey = track.thumbnail;
            // If thumbnail is already a minio key (contains /), we might want to keep it or update it.
            // But if we found a local file, we prefer to upload it.
            
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
            
            for (const imgExt of imageExtensions) {
                const imgPath = path.join(dir, nameWithoutExt + imgExt);
                try {
                    await fs.access(imgPath);
                    const imgFilename = nameWithoutExt + imgExt;
                    const imgKey = `${track.artistID}/${track.albumID}/${imgFilename}`;
                    await storageService.uploadFile(imgKey, imgPath, {
                        'Content-Type': getMimeType(imgExt)
                    });
                    thumbnailKey = imgKey;
                    console.log(`  ✓ Uploaded thumbnail: ${imgFilename}`);
                    break; 
                } catch (e) {
                    // Not found
                }
            }

            // 2. Lyrics
            let lyricsKey = track.lyrics;
            const lrcPath = path.join(dir, nameWithoutExt + '.lrc');
            try {
                await fs.access(lrcPath);
                const lrcFilename = nameWithoutExt + '.lrc';
                const lrcKey = `${track.artistID}/${track.albumID}/${lrcFilename}`;
                await storageService.uploadFile(lrcKey, lrcPath, {
                    'Content-Type': 'text/plain'
                });
                lyricsKey = lrcKey;
                console.log(`  ✓ Uploaded lyrics: ${lrcFilename}`);
            } catch (e) {
                // No lyrics
            }

            // Update DB
            await prisma.track.update({
                where: { id: track.id },
                data: { 
                    path: newKey,
                    thumbnail: thumbnailKey,
                    lyrics: lyricsKey
                }
            });
            
            console.log(`✓ Migrated audio to ${newKey}`);
        } catch (err) {
            console.error(`✗ Failed to migrate ${track.name}:`, err);
        }
    }
    
    console.log("Migration complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
