import { PrismaClient } from './generated/prisma/client';
import { parseFile } from 'music-metadata';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();
const MEDIA_DIR = path.join(process.cwd(), 'media');

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac', '.wma', '.alac', '.aiff'];

async function getDuration(filePath: string): Promise<number> {
  try {
    const metadata = await parseFile(filePath);
    return Math.floor(metadata.format.duration || 0);
  } catch (error) {
    console.error("Error reading metadata for ${filePath}:", error);
    return 0;
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function main() {
  try {
    const artists = await fs.readdir(MEDIA_DIR);

    for (const artistName of artists) {
      const artistPath = path.join(MEDIA_DIR, artistName);
      if (!(await isDirectory(artistPath))) continue;

      console.log(`Processing Artist: ${artistName}`);

      // Find or create artist
      let dbArtist = await prisma.artist.findFirst({ where: { name: artistName } });
      if (!dbArtist) {
        dbArtist = await prisma.artist.create({ data: { name: artistName } });
      }

      const artistItems = await fs.readdir(artistPath);

      for (const item of artistItems) {
        const itemPath = path.join(artistPath, item);
        
        if (await isDirectory(itemPath)) {
          // It's an album
          const albumName = item;
          console.log(`Processing Album: ${albumName}`);

          let dbAlbum = await prisma.album.findFirst({
            where: { name: albumName, artistID: dbArtist.id }
          });

          if (!dbAlbum) {
            dbAlbum = await prisma.album.create({
              data: {
                name: albumName,
                artistID: dbArtist.id
              }
            });
          }

          const tracks = await fs.readdir(itemPath);
          for (const trackFile of tracks) {
             const trackPath = path.join(itemPath, trackFile);
             if (await isDirectory(trackPath)) continue;

             const ext = path.extname(trackFile).toLowerCase();
             if (!AUDIO_EXTENSIONS.includes(ext)) continue;

             const duration = await getDuration(trackPath);
             const trackName = path.parse(trackFile).name;
             const relativePath = path.relative(process.cwd(), trackPath);

             const existingTrack = await prisma.track.findFirst({
                where: {
                    name: trackName,
                    albumID: dbAlbum.id
                }
             });

             if (!existingTrack) {
                 await prisma.track.create({
                     data: {
                         name: trackName,
                         path: relativePath,
                         duration: duration,
                         thumbnail: '',
                         albumID: dbAlbum.id,
                         artistID: dbArtist.id
                     }
                 });
                 console.log(`Added track: ${trackName}`);
             }
          }

        } else {
          // It's a track directly under artist
          const trackFile = item;
          const trackPath = itemPath;
          
          const ext = path.extname(trackFile).toLowerCase();
          if (!AUDIO_EXTENSIONS.includes(ext)) continue;

          const duration = await getDuration(trackPath);
          const trackName = path.parse(trackFile).name;
          const relativePath = path.relative(process.cwd(), trackPath);

          const existingTrack = await prisma.track.findFirst({
              where: {
                  name: trackName,
                  artistID: dbArtist.id,
                  albumID: null
              }
          });

          if (!existingTrack) {
              await prisma.track.create({
                  data: {
                      name: trackName,
                      path: relativePath,
                      duration: duration,
                      thumbnail: '',
                      artistID: dbArtist.id
                  }
              });
              console.log(`Added single track: ${trackName}`);
          }
        }
      }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
