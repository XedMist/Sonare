import { db } from "../db/db.ts";
import type { Playlist } from "../generated/prisma/client.d.ts";

export default class PlaylistRepository {
  async findAll(): Promise<Playlist[]> {
    return await db.playlist.findMany();
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

    async getTracksFromPlaylist(playlistId: string): Promise<Track[]> {
    const items = await db.playlistTrack.findMany({
      where: { playlistId },
      orderBy: [{ position: "asc" }, { addedAt: "asc" }],
      select: { track: true },
    });

    return items.map((i) => i.track);
  }

  // Returns PlaylistTrack entries with the embedded Track, useful if you also need position/addedAt
  async getPlaylistWithTracks(
    playlistId: string,
  ): Promise<(PlaylistTrack & { track: Track })[] | null> {
    const playlist = await db.playlist.findUnique({
      where: { id: playlistId },
      include: {
        items: {
          orderBy: [{ position: "asc" }, { addedAt: "asc" }],
          include: { track: true },
        },
      },
    });

    if (!playlist) return null;
    return playlist.items as (PlaylistTrack & { track: Track })[];
  }

}

