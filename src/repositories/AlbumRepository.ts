import { db } from '@/db/db.ts'
import type { Album, Track } from "../model/entity/index.ts";
import { PrismaMapper } from "../model/mappers.ts";

export default class AlbumRepository {
    async findAll({ take, skip }: { skip?: number; take?: number }): Promise<Album[]> {
        const albums = await db.album.findMany({
            orderBy: {
                popularity: 'desc'
            },
            skip,
            take
        });
        return albums.map(PrismaMapper.toAlbum);
    }

    async findById({ id }: Pick<Album, 'id'>): Promise<Album | null> {
        const album = await db.album.findUnique({
            where: { id },
        });
        return album ? PrismaMapper.toAlbum(album) : null;
    }

    async getTracksOfAlbum({ id }: Pick<Album, 'id'>, { take, skip }: { skip?: number, take?: number }): Promise<Track[]> {
        const tracks = await db.track.findMany({
            where: { albumID: id },
            orderBy: {
                popularity: 'desc'
            },
            skip,
            take,
        });
        return tracks.map(PrismaMapper.toTrack);
    }
}
