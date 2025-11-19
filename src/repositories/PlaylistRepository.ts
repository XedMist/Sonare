import { db } from "../db/db.ts";
import type { Playlist, Track } from "../model/entity/index.ts";
import { PrismaMapper } from "../model/mappers.ts";


// Get, post, get id, delete id
export default class PlaylistRepository { 
    async findAll({skip, take} : {skip?: number, take?: number}): Promise<Playlist[]> {
        const playlists = await db.playlist.findMany({ skip, take });
        return playlists.map(PrismaMapper.toPlaylist);
    }

    async findById({id} : Pick<Playlist, "id">): Promise<Playlist | null> {
        const playlist = await db.playlist.findUnique({
            where: {
                id: id,
            }
        });
        return playlist ? PrismaMapper.toPlaylist(playlist) : null;
    }

    async create(playlist: Pick<Playlist, "name" | "userID">): Promise<Playlist> {
        const created = await db.playlist.create({
            data: {
                name: playlist.name,
                user: {
                    connect: {
                        id: playlist.userID
                    }
                }
            }
        });
        return PrismaMapper.toPlaylist(created);
    }
    
    async delete({id} : Pick<Playlist, "id">): Promise<boolean> {
        try {
            await db.playlist.delete({
                where: {
                    id: id,
                }
            });
            return true;
        } catch (_) {
            return false;
        }
    }

    async getTracksInPlaylist(playlistID: string): Promise<Track[]> {
        const playlist = await db.playlist.findUnique({
            where: { id: playlistID },
            include: { items: { include: { track: true } } }
        });
        if (!playlist) {
            return [];
        }
        return playlist.items.map(item => PrismaMapper.toTrack(item.track));
    }

    async addTrackToPlaylist(playlistID: string, trackID: string): Promise<Playlist> {
        const updated = await db.playlist.update({
            where: { id: playlistID },
            data: {
                items: {
                    connect: {
                        id: trackID
                    }
                }
            }
        });
        return PrismaMapper.toPlaylist(updated);
    }

    async removeTrackFromPlaylist(playlistID: string, trackID: string): Promise<Playlist> {
        const updated = await db.playlist.update({
            where: { id: playlistID },
            data: {
                items: {
                    disconnect: {
                        id: trackID
                    }
                }
            }
        });
        return PrismaMapper.toPlaylist(updated);
    }

    
}