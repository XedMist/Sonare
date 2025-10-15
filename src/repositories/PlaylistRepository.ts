import { playlistsTable, playlistsToTracksTable } from "@/db/schema.ts";
import type { CreatePlaylist, Playlist } from "@/model/Playlist.ts";
import { db } from "@/db/db.ts";
import { eq, and } from "drizzle-orm";

export default class PlaylistRepository {
  async findAll(): Promise<Playlist[]> {
    return await db.select().from(playlistsTable);
  }

  async insert(p: CreatePlaylist): Promise<Playlist> {
    const result = await db.insert(playlistsTable).values({
      name: p.name,
      userId: p.userId,
    }).returning();
    return result[0];
  }

  async findById(id: number): Promise<Playlist | null> {
    const playlist = await db.select().from(playlistsTable).where(
      eq(playlistsTable.id, id),
    );
    return playlist.length === 0 ? null : playlist[0];
  }

  async findByUserId(userId: number): Promise<Playlist[]> {
    const playlists = await db.select().from(playlistsTable).where(
      eq(playlistsTable.userId, userId),
    );
    return playlists;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(playlistsTable).where(
      eq(playlistsTable.id, id),
    ).returning();
    return result.length !== 0;
  }

  async getTrackIds(playlistId: number): Promise<number[]> {
    const tracks = await db.select({ trackId: playlistsToTracksTable.trackId })
      .from(playlistsToTracksTable)
      .where(eq(playlistsToTracksTable.playlistId, playlistId));
    return tracks.map(t => t.trackId);
  }

  async addTrack(playlistId: number, trackId: number): Promise<void> {
    const existing = await db.select()
      .from(playlistsToTracksTable)
      .where(
        and(
          eq(playlistsToTracksTable.playlistId, playlistId),
          eq(playlistsToTracksTable.trackId, trackId)
        )
      );
    
    if (existing.length === 0) {
      await db.insert(playlistsToTracksTable).values({
        playlistId,
        trackId,
      });
    }
  }

  async removeTrack(playlistId: number, trackId: number): Promise<void> {
    await db.delete(playlistsToTracksTable).where(
      and(
        eq(playlistsToTracksTable.playlistId, playlistId),
        eq(playlistsToTracksTable.trackId, trackId)
      )
    );
  }
}
