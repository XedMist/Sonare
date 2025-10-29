<<<<<<< HEAD
import { db } from "../db/db.ts";
import type { Playlist } from "../generated/prisma/client.d.ts";
import type { Track } from "../generated/prisma/index.d.ts";
||||||| 4691fd2
import { playlistsTable, playlistsToTracksTable } from "@/db/schema.ts";
import type { CreatePlaylist, Playlist } from "@/model/Playlist.ts";
import { db } from "@/db/db.ts";
import { eq, and } from "drizzle-orm";
=======
import { playlistsTable, playlistsToTracksTable } from "@/db/schema.ts";
import type { CreatePlaylist, Playlist } from "@/model/Playlist.ts";
import { db } from "@/db/db.ts";
import { and, eq } from "drizzle-orm";
>>>>>>> main

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

<<<<<<< HEAD
  async getPlaylistsByUser(userID: string): Promise<Playlist[]> {
    return await db.playlist.findMany({
      where: {
        userID
      },
    });
||||||| 4691fd2
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
=======
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
    return tracks.map((t) => t.trackId);
  }

  async addTrack(playlistId: number, trackId: number): Promise<void> {
    const existing = await db.select()
      .from(playlistsToTracksTable)
      .where(
        and(
          eq(playlistsToTracksTable.playlistId, playlistId),
          eq(playlistsToTracksTable.trackId, trackId),
        ),
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
        eq(playlistsToTracksTable.trackId, trackId),
      ),
    );
>>>>>>> main
  }
}

