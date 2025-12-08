import { db } from "@/db/db.ts";
import { PrismaMapper } from "@/model/mappers.ts";
import type { Album, Artist, Track } from "@/model/entity/index.ts";

export interface SearchResult {
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
}

export default class SearchService {
    async search(query: string, types: string[] = ["artist", "album", "track"]): Promise<SearchResult> {
        const result: SearchResult = {
            artists: [],
            albums: [],
            tracks: []
        };

        if (!query) return result;

        const promises = [];

        if (types.includes("artist")) {
            promises.push(
                db.artist.findMany({
                    where: { name: { contains: query, mode: "insensitive" } },
                    take: 5
                }).then(artists => result.artists = artists.map(PrismaMapper.toArtist))
            );
        }

        if (types.includes("album")) {
            promises.push(
                db.album.findMany({
                    where: { name: { contains: query, mode: "insensitive" } },
                    take: 5,
                    include: { artist: true }
                }).then(albums => result.albums = albums.map(PrismaMapper.toAlbum))
            );
        }

        if (types.includes("track")) {
            promises.push(
                db.track.findMany({
                    where: { name: { contains: query, mode: "insensitive" } },
                    take: 10,
                    include: { artist: true, album: true }
                }).then(tracks => result.tracks = tracks.map(PrismaMapper.toTrack))
            );
        }

        await Promise.all(promises);

        return result;
    }
}
