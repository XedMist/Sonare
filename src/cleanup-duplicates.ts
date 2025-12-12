import { PrismaClient } from './generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting duplicate cleanup...");

    const tracks = await prisma.track.findMany({
        include: { artist: true, album: true }
    });
    const trackMap = new Map<string, typeof tracks>(); // "artistID|albumID|trackName" -> tracks[]

    for (const track of tracks) {
        const albumId = track.albumID || 'null';
        const key = `${track.artistID}|${albumId}|${track.name.toLowerCase().trim()}`;
        
        if (!trackMap.has(key)) {
            trackMap.set(key, []);
        }
        trackMap.get(key)?.push(track);
    }

    let deletedCount = 0;
    let updatedPlaylistCount = 0;

    for (const [key, duplicates] of trackMap.entries()) {
        if (duplicates.length > 1) {
            console.log(`Processing duplicates for: ${duplicates[0].name}`);

            // Strategy: Keep the one that looks most "migrated" (path doesn't start with media/ or ./)
            // If equal, keep the oldest created one (stable ID).
            
            duplicates.sort((a, b) => {
                const aMigrated = !a.path.startsWith('media') && !a.path.startsWith('./');
                const bMigrated = !b.path.startsWith('media') && !b.path.startsWith('./');

                if (aMigrated && !bMigrated) return -1; // a comes first (keep)
                if (!aMigrated && bMigrated) return 1;  // b comes first (keep)
                
                // If both migrated or both local, prefer the one with thumbnail
                if (a.thumbnail && !b.thumbnail) return -1;
                if (!a.thumbnail && b.thumbnail) return 1;

                // Fallback to creation date (keep oldest)
                return a.createdAt.getTime() - b.createdAt.getTime();
            });

            const master = duplicates[0];
            const toDelete = duplicates.slice(1);

            console.log(`  Keeping: ${master.id} (Path: ${master.path})`);
            
            for (const duplicate of toDelete) {
                console.log(`  Deleting: ${duplicate.id} (Path: ${duplicate.path})`);

                // 1. Update Playlists
                const playlistItems = await prisma.playlistTrack.findMany({
                    where: { trackId: duplicate.id }
                });

                if (playlistItems.length > 0) {
                    console.log(`    Updating ${playlistItems.length} playlist entries...`);
                    // Update them to point to master
                    // Note: We might create duplicate playlist entries if the master is already in the playlist.
                    // For simplicity, let's just update. If it fails due to unique constraints (if any), we might need to delete.
                    // Prisma schema doesn't seem to enforce unique (playlistId, trackId) but let's be safe.
                    
                    for (const item of playlistItems) {
                        await prisma.playlistTrack.update({
                            where: { id: item.id },
                            data: { trackId: master.id }
                        });
                    }
                    updatedPlaylistCount += playlistItems.length;
                }

                // 2. Delete Track
                await prisma.track.delete({
                    where: { id: duplicate.id }
                });
                deletedCount++;
            }
        }
    }

    console.log("------------------------------------------------");
    console.log(`Cleanup complete.`);
    console.log(`Deleted Tracks: ${deletedCount}`);
    console.log(`Updated Playlist Entries: ${updatedPlaylistCount}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
