import { db } from "@/db/db.ts";
import type { Track, Album, Artist } from "@prisma/client";

export default class TrackRepository {
    async findAll({ name }: Pick<Track, "name"> | { name: undefined }, album: Pick<Album, "id"> | { id: undefined }, artist: Pick<Artist, "id"> | { id: undefined }, { skip, take }: { skip?: number, take?: number }): Promise<Track[]> {
        return await db.track.findMany({
            where: {
                name,
                albumID: album.id,
                album: {
                    artistID: artist.id
                }
            },
            skip, take
        });
    }

    async findById({ id }: Pick<Track, 'id'>): Promise<Track | null> {
        return await db.track.findUnique({
            where: {
                id,
            }
        })
    }
}
