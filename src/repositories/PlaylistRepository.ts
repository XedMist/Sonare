import { db } from "../db/db.ts";
import type { Playlist } from "../generated/prisma/client.d.ts";


// Get, post, get id, delete id
export default class PlaylistRepository { 
    async findAll({skip, take} : {skip?: number, take?: number}): Promise<Playlist[]> {
        return await db.playlist.findMany({ skip, take });
    }

    async findById({id} : Pick<Playlist, "id">): Promise<Playlist | null> {
        return await db.playlist.findUnique({
            where: {
                id: id,
            }
        });
    }

    async create(playlist: Pick<Playlist, "name" | "userID">): Promise<Playlist> {
        return await db.playlist.create({
            data: {
                name: playlist.name,
                user: {
                    connect: {
                        id: playlist.userID
                    }
                }
            }
        });
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
}

