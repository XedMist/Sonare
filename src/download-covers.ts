import { PrismaClient } from './generated/prisma/client';
import { StorageService } from './services/StorageService.ts';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();
const storageService = new StorageService();

interface SpotifyLink {
    artist: string;
    album: string | null;
    song: string;
    filepath: string;
    spotify_url: string;
}

async function getSpotifyImage(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Look for og:image
        const match = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (match && match[1]) {
            return match[1];
        }
        
        // Fallback: look for twitter:image
        const match2 = html.match(/<meta name="twitter:image" content="([^"]+)"/);
        if (match2 && match2[1]) {
            return match2[1];
        }

        return null;
    } catch (error) {
        console.error(`Error fetching Spotify page ${url}:`, error);
        return null;
    }
}

async function downloadImage(url: string): Promise<Buffer | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error(`Error downloading image ${url}:`, error);
        return null;
    }
}

async function main() {
    console.log("Starting cover download script...");
    
    // Initialize Storage Service
    await storageService.initialize();

    // Load Spotify Links
    const linksPath = path.join(process.cwd(), 'spotify_links.json');
    let spotifyLinks: SpotifyLink[] = [];
    try {
        const data = await fs.readFile(linksPath, 'utf-8');
        spotifyLinks = JSON.parse(data);
        console.log(`Loaded ${spotifyLinks.length} links from spotify_links.json`);
    } catch (error) {
        console.error("Could not load spotify_links.json", error);
        return;
    }

    // Fetch all tracks from DB
    const tracks = await prisma.track.findMany({
        include: {
            artist: true,
            album: true
        }
    });
    console.log(`Found ${tracks.length} tracks in database.`);

    let updatedCount = 0;
    let missingLinkCount = 0;
    let downloadFailCount = 0;

    for (const track of tracks) {
        // Try to find matching link
        // Strategy 1: Match by filepath (if stored in DB path matches JSON filepath)
        // The JSON filepath starts with ./media/, DB path starts with media/
        // Let's normalize.
        
        let linkEntry = spotifyLinks.find(l => {
            const jsonPath = l.filepath.replace(/^\.\//, ''); // remove ./
            return jsonPath === track.path;
        });

        // Strategy 2: Match by Artist and Song name
        if (!linkEntry) {
            linkEntry = spotifyLinks.find(l => 
                l.artist === track.artist.name && 
                l.song === track.name
            );
        }

        if (!linkEntry) {
            console.warn(`No Spotify link found for: ${track.artist.name} - ${track.name}`);
            missingLinkCount++;
            continue;
        }

        console.log(`Processing: ${track.artist.name} - ${track.name}`);
        
        const imageUrl = await getSpotifyImage(linkEntry.spotify_url);
        if (!imageUrl) {
            console.warn(`  Could not extract image URL from ${linkEntry.spotify_url}`);
            downloadFailCount++;
            continue;
        }

        const imageBuffer = await downloadImage(imageUrl);
        if (!imageBuffer) {
            console.warn(`  Could not download image from ${imageUrl}`);
            downloadFailCount++;
            continue;
        }

        // Determine object key
        // We want to store it alongside the audio file if possible, or in a standard structure.
        // Track path is like "media/Artist/Album/Song.m4a"
        // We can replace extension with .jpg
        const audioPath = track.path;
        const parsedPath = path.parse(audioPath);
        const imageKey = path.join(parsedPath.dir, `${parsedPath.name}.jpg`);

        // Upload to MinIO
        try {
            await storageService.uploadBuffer(imageKey, imageBuffer, { 'Content-Type': 'image/jpeg' });
            console.log(`  Uploaded cover to ${imageKey}`);

            // Update DB
            await prisma.track.update({
                where: { id: track.id },
                data: { thumbnail: imageKey }
            });
            updatedCount++;
        } catch (error) {
            console.error(`  Error uploading/updating for ${track.name}:`, error);
        }
        
        // Be nice to Spotify servers
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("------------------------------------------------");
    console.log(`Summary:`);
    console.log(`Total Tracks: ${tracks.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Missing Links: ${missingLinkCount}`);
    console.log(`Download/Extract Failures: ${downloadFailCount}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
