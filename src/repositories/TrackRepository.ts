import { db } from "@/db/db.ts";
import type { Track, Album, Artist } from "../model/entity/index.ts";
import { PrismaMapper } from "../model/mappers.ts";

export default class TrackRepository {
    async findAll({ name }: Pick<Track, "name"> | { name: undefined }, album: Pick<Album, "id"> | { id: undefined }, artist: Pick<Artist, "id"> | { id: undefined }, { skip, take }: { skip?: number, take?: number }): Promise<Track[]> {
        const tracks = await db.track.findMany({
            where: {
                name,
                albumID: album.id,
                album: {
                    artistID: artist.id
                }
            },
            skip, take
        });
        return tracks.map(PrismaMapper.toTrack);
    }

    async findById({ id }: Pick<Track, 'id'>): Promise<Track | null> {
        const track = await db.track.findUnique({
            where: {
                id,
            }
        });
        return track ? PrismaMapper.toTrack(track) : null;
    }
}
