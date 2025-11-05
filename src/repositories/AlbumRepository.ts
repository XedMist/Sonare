import { db } from '@/db/db.ts'
import type { Album, Artist, Track } from '@prisma/client';

export default class AlbumRepository {
    async findAll({ take, skip }: { skip?: number; take?: number }): Promise<Album[]> {
        return await db.album.findMany({ skip, take })
    }

    async findById({ id }: Pick<Album, 'id'>): Promise<Album | null> {
        return await db.album.findUnique({
            where: { id },
        })
    }

    async getTracksOfAlbum({ id }: Pick<Album, 'id'>, { take, skip }: { skip?: number, take?: number }): Promise<Track[]> {
        return await db.track.findMany({
            where: { albumID: id },
            skip,
            take,
        })
    }
}
