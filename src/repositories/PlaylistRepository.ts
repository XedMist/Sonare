import { db } from "../db/db.ts";
import type { Playlist } from "../generated/prisma/client.d.ts";
import type { Track } from "../generated/prisma/index.d.ts";

export default class PlaylistRepository {
  async findAll({take, skip}: {skip?:number; take?:number}): Promise<Playlist[]> {
    return await db.playlist.findMany({take, skip});
  }

  async findById({ id }: Pick<Playlist, "id">): Promise<Playlist | null> {
    return await db.playlist.findUnique({
      where: {
        id,
      },
    });
  }

  async insert(playlist: Omit<Playlist, "id">): Promise<Playlist> {
    return await db.playlist.create({
      data: playlist,
    });
  }

  async getPlaylistsByName(name: string): Promise<Playlist[]> {
    return await db.playlist.findMany({
      where: {
        name: { contains: name, mode: "insensitive" },
      },
    });
  }

  async getPlaylistsByUser(userID: string): Promise<Playlist[]> {
    return await db.playlist.findMany({
      where: {
        userID
      },
    });
  }
}

