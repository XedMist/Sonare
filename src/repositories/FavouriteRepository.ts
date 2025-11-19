import {db} from "../db/db.ts";
import type { Playlist } from "../model/entity/index.ts";
import { PrismaMapper } from "../model/mappers.ts";

export default class FavouriteRepository {
    async findFavouriteByUserId(userID: string): Promise<Playlist | null> {
        const user = await db.user.findUnique({
            where: {
                id: userID,
            },
            select: {
                favoritosID: true,
            },
        });
        if (!user || !user.favoritosID) return null;

        const playlist = await db.playlist.findUnique({
            where: {
                id: user.favoritosID,
            },
        });

        return playlist ? PrismaMapper.toPlaylist(playlist) : null;
    }
}