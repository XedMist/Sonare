import { PrismaClient } from './generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for duplicates in the database...");

    // 1. Check for duplicate Artists
    console.log("\n--- Checking Artists ---");
    const artists = await prisma.artist.findMany();
    const artistMap = new Map<string, string[]>(); // name -> ids[]

    for (const artist of artists) {
        const name = artist.name.toLowerCase().trim();
        if (!artistMap.has(name)) {
            artistMap.set(name, []);
        }
        artistMap.get(name)?.push(artist.id);
    }

    let duplicateArtists = 0;
    for (const [name, ids] of artistMap.entries()) {
        if (ids.length > 1) {
            console.log(`Duplicate Artist: "${name}" (IDs: ${ids.join(', ')})`);
            duplicateArtists++;
        }
    }
    if (duplicateArtists === 0) console.log("No duplicate artists found.");


    // 2. Check for duplicate Albums
    console.log("\n--- Checking Albums ---");
    const albums = await prisma.album.findMany({
        include: { artist: true }
    });
    const albumMap = new Map<string, string[]>(); // "artistID|albumName" -> ids[]

    for (const album of albums) {
        const key = `${album.artistID}|${album.name.toLowerCase().trim()}`;
        if (!albumMap.has(key)) {
            albumMap.set(key, []);
        }
        albumMap.get(key)?.push(album.id);
    }

    let duplicateAlbums = 0;
    for (const [key, ids] of albumMap.entries()) {
        if (ids.length > 1) {
            const [artistId, albumName] = key.split('|');
            // Find artist name for better logging
            const artist = albums.find(a => a.artistID === artistId)?.artist.name || artistId;
            console.log(`Duplicate Album: "${albumName}" by ${artist} (IDs: ${ids.join(', ')})`);
            duplicateAlbums++;
        }
    }
    if (duplicateAlbums === 0) console.log("No duplicate albums found.");


    // 3. Check for duplicate Tracks
    console.log("\n--- Checking Tracks ---");
    const tracks = await prisma.track.findMany({
        include: { artist: true, album: true }
    });
    const trackMap = new Map<string, string[]>(); // "artistID|albumID|trackName" -> ids[]

    for (const track of tracks) {
        const albumId = track.albumID || 'null';
        const key = `${track.artistID}|${albumId}|${track.name.toLowerCase().trim()}`;
        
        if (!trackMap.has(key)) {
            trackMap.set(key, []);
        }
        trackMap.get(key)?.push(track.id);
    }

    let duplicateTracks = 0;
    for (const [key, ids] of trackMap.entries()) {
        if (ids.length > 1) {
            const [artistId, albumId, trackName] = key.split('|');
            const sampleTrack = tracks.find(t => t.id === ids[0]);
            const artistName = sampleTrack?.artist.name || artistId;
            const albumName = sampleTrack?.album?.name || (albumId === 'null' ? 'Single' : albumId);
            
            console.log(`Duplicate Track: "${trackName}" by ${artistName} [${albumName}] (IDs: ${ids.join(', ')})`);
            duplicateTracks++;
        }
    }
    if (duplicateTracks === 0) console.log("No duplicate tracks found.");

    console.log("\nCheck complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
