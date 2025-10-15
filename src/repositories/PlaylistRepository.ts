import { playlistsTable } from "@/db/schema.ts";
import type { CreatePlaylist, Playlist } from "@/model/Playlist.ts";
import { db } from "@/db/db.ts";
import { eq } from "drizzle-orm";

export default class PlaylistRepository {
  async findAll(): Promise<Playlist[]> {
    return await db.select().from(playlistsTable);
  }

  async insert(p: CreatePlaylist): Promise<Playlist> {
    const result = await db.insert(playlistsTable).values(p).returning();
    return result[0];
  }
  async findById(id: number): Promise<Playlist[] | null> {
    const playlist = await db.select().from(playlistsTable).where(
      eq(playlistsTable.userId, id),
    );
    return playlist.length == 0 ? null : playlist;
  }
  async findByUserId(id: number): Promise<Playlist[] | null> {
    const playlist = await db.select().from(playlistsTable).where(
      eq(playlistsTable.userId, id),
    );
    return playlist.length == 0 ? null : playlist;
  }
}
