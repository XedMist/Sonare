import { PrismaClient } from './generated/prisma/client';
import { StorageService } from './services/StorageService.ts';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();
const storageService = new StorageService();

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    console.log("Starting album cover migration...");
    await storageService.initialize();

    const albums = await prisma.album.findMany({
        include: {
            artist: true
        }
    });

    console.log(`Found ${albums.length} albums.`);

    let updatedCount = 0;

    for (const album of albums) {
        const artistName = album.artist.name;
        const albumName = album.name;
        
        // Construct potential paths
        // Assuming structure: media/{Artist}/{Album}.{ext}
        const baseDir = path.join(process.cwd(), 'media', artistName);
        
        let foundPath: string | null = null;
        let extension: string | null = null;

        for (const ext of EXTENSIONS) {
            const candidatePath = path.join(baseDir, `${albumName}${ext}`);
            if (await fileExists(candidatePath)) {
                foundPath = candidatePath;
                extension = ext;
                break;
            }
        }

        if (foundPath && extension) {
            console.log(`Found cover for [${albumName}]: ${foundPath}`);
            
            // Define object key for MinIO
            // We can store it as {artistId}/{albumId}/cover{ext} or similar to keep it organized
            // Or mirror the file structure: media/{Artist}/{Album}.{ext}
            // Let's use the ID-based structure for cleanliness in the bucket, or keep it consistent with tracks?
            // The tracks were uploaded to {artistId}/{albumId}/{songName} (based on previous context, or maybe just path?)
            // Let's check how tracks are stored.
            // In the previous turn's output: "Uploaded cover to 6939920f306bb5aa921e61f6/null/Cada día de la semana.jpg"
            // It seems the key structure used in `download-covers.ts` was derived from `track.path` logic or similar?
            // Ah, in `download-covers.ts`:
            // const parsedPath = path.parse(audioPath);
            // const imageKey = path.join(parsedPath.dir, `${parsedPath.name}.jpg`);
            // And `audioPath` comes from `track.path`.
            // If `track.path` is `media/Artist/Album/Song.m4a`, then `imageKey` is `media/Artist/Album/Song.jpg`.
            
            // However, for the ALBUM cover, we want it associated with the album.
            // If we follow the user's "same depth" logic for the source, maybe we should store it similarly in MinIO?
            // But MinIO is an object store.
            // Let's store it as `covers/${album.id}${extension}` to avoid collisions and encoding issues.
            // OR `media/${artistName}/${albumName}${extension}` to mirror source.
            // Let's stick to mirroring the source path structure but relative to media root?
            // Actually, `track.path` in DB seems to be relative path string.
            
            // Let's look at `migrate-to-minio.ts` (from context memory) or `download-covers.ts` output.
            // Output: "Uploaded cover to 6939920f306bb5aa921e61f6/null/Cada día de la semana.jpg"
            // This looks like `{artistId}/{albumId}/{songName}.jpg`.
            // So for album cover, maybe `{artistId}/{albumId}/cover${extension}`?
            
            const objectKey = `${album.artist.id}/${album.id}/cover${extension}`;
            
            try {
                // Determine mime type
                const mimeType = extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : 
                                 extension === '.png' ? 'image/png' : 
                                 extension === '.webp' ? 'image/webp' : 'application/octet-stream';

                await storageService.uploadFile(objectKey, foundPath, { 'Content-Type': mimeType });
                
                await prisma.album.update({
                    where: { id: album.id },
                    data: { cover: objectKey }
                });
                
                console.log(`  Uploaded to ${objectKey}`);
                updatedCount++;
            } catch (err) {
                console.error(`  Failed to upload ${foundPath}:`, err);
            }

        } else {
            console.warn(`No cover found for album: ${albumName} (Artist: ${artistName})`);
        }
    }

    console.log(`Finished. Updated ${updatedCount} albums.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
