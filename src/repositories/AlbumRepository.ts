import { db } from '@/db/db.ts'
import type { Album, Track, Artist } from "../model/entity/index.ts";
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

    async findByIdWithArtist(id: string): Promise<(Album & { artist: Artist }) | null> {
        const album = await db.album.findUnique({
            where: { id },
            include: { artist: true }
        });
        if (!album) return null;
        return {
            ...PrismaMapper.toAlbum(album),
            artist: PrismaMapper.toArtist(album.artist)
        };
    }

    async delete(id: string): Promise<boolean> {
        try {
            await db.album.delete({ where: { id } });
            return true;
        } catch {
            return false;
        }
    }
}
