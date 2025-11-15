import { db } from "../db/db.ts";

import type { Album, Artist, Track } from "../model/entity/index.ts";
import { PrismaMapper } from "../model/mappers.ts";

export default class ArtistRepository {

    async getAlbumsOfArtist(artistId: string, { skip, take }: { skip?: number, take?: number }): Promise<Album[]> {
        const albums = await db.album.findMany({
            where: {
                artistID: {
                    equals: artistId,
                }
            },
            skip,
            take
        });
        return albums.map(PrismaMapper.toAlbum);
    }

    async getTracksOfArtist(artistId: string, { skip, take }: { skip?: number, take?: number }): Promise<Track[]> {
        const tracks = await db.track.findMany({
            where: {
                album: {
                    artistID: {
                        equals: artistId,
                    }
                }
            },
            skip,
            take
        });
        return tracks.map(PrismaMapper.toTrack);
    }

    async findAll({ skip, take }: { skip?: number, take?: number }): Promise<Artist[]> {
        const artists = await db.artist.findMany({ skip, take });
        return artists.map(PrismaMapper.toArtist);
    }

    async findById({ id }: Pick<Artist, "id">): Promise<Artist | null> {
        const artist = await db.artist.findUnique({
            where: {
                id: id,
            }
        });
        return artist ? PrismaMapper.toArtist(artist) : null;
    }


    async insert(artist: Pick<Artist, "name">): Promise<Artist> {
        const created = await db.artist.create({
            data: {
                name: artist.name
            }
        });
        return PrismaMapper.toArtist(created);
    }

    async delete({ id }: Pick<Artist, "id">): Promise<boolean> {
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

    async update(id: string, name: string): Promise<Artist> {
        const updated = await db.artist.update({
            where: {
                id: id,
            },
            data: {
                name: name
            }
        });
        return PrismaMapper.toArtist(updated);
    }
}
