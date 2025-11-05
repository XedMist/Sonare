import { db } from "../db/db.ts";

import type { Album, Artist, Track } from "../generated/prisma/index.d.ts";

export default class ArtistRepository {

    async getAlbumsOfArtist(artistId: string, { skip, take }: { skip?: number, take?: number }): Promise<Album[]> {
        return await db.album.findMany({
            where: {
                artistID: {
                    equals: artistId,
                }
            },
            skip,
            take
        })
    }

    async getTracksOfArtist(artistId: string, { skip, take }: { skip?: number, take?: number }): Promise<Track[]> {
        return await db.track.findMany({
            where: {
                album: {
                    artistID: {
                        equals: artistId,
                    }
                }
            },
            skip,
            take
        })
    }

    async findAll({ skip, take }: { skip?: number, take?: number }): Promise<Artist[]> {
        return await db.artist.findMany({ skip, take })
    }

    async findById({ id }: Pick<Artist, "id">): Promise<Artist | null> {
        return await db.artist.findUnique({
            where: {
                id: id,
            }
        })
    }


    async insert(artist: Pick<Artist, "name">): Promise<Artist> {
        return await db.artist.create({
            data: {
                name: artist.name
            }
        })
    }

    async delete({ id }: Partial<Album>): Promise<boolean> {
        try {
            await db.artist.delete({
                where: {
                    id: id,
                },
            })
            return true;
        } catch (_) {
            return false;
        }
    }

    async update(id: string, name: string) {
        await db.artist.update({
            where: {
                id: id,
            },
            data: {
                name: name
            }
        })
    }
}
