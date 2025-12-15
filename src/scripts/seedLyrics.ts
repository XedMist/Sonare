import { db } from "@/db/db";
import { StorageService } from "@/services/StorageService";
import LyricsService from "@/services/LyricsService";

async function main() {
    console.log("Starting lyrics population...");

    const storageService = new StorageService();
    await storageService.initialize();

    const lyricsService = new LyricsService();

    // specific helper to avoid repository limits or just use prisma directly
    const tracks = await db.track.findMany({
        select: { id: true, path: true, name: true }
    });

    console.log(`Found ${tracks.length} tracks.`);

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const track of tracks) {
        try {
            // Assuming path is like "artist/album/song.mp3" or similar
            // We want "artist/album/song.lrc"
            const lrcPath = track.path.substring(0, track.path.lastIndexOf(".")) + ".lrc";
            
            console.log(`Checking lyrics for ${track.name} at ${lrcPath}...`);
            const lyricsContent = await storageService.getFileContent(lrcPath);

            if (lyricsContent) {
                // Check if lyrics already exist to avoid duplication error or use upsert logic if service supports it
                // The service createLyrics throws if exists. 
                // Let's use service but catch "already exist" error or check first.
                
                try {
                    await lyricsService.createLyrics(track.id, lyricsContent);
                    console.log(`✅ Created lyrics for ${track.name}`);
                    createdCount++;
                } catch (err: any) {
                    if (err.message && err.message.includes("already exist")) {
                        console.log(`⚠️ Lyrics for ${track.name} already exist. Updating...`);
                         await lyricsService.updateLyrics(track.id, { syncedLyrics: lyricsContent });
                         createdCount++; // Counting updates as success too
                    } else {
                        throw err;
                    }
                }
            } else {
                console.log(`❌ No lyrics file found at ${lrcPath}`);
                skippedCount++;
            }

        } catch (err) {
            console.error(`Error processing track ${track.name} (${track.id}):`, err);
            errorCount++;
        }
    }

    console.log(`\nPopulation finished.`);
    console.log(`Created/Updated: ${createdCount}`);
    console.log(`Skipped (Not Found): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
