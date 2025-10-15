import PlaylistRepository from "../repositories/PlaylistRepository.ts";
import TrackRepository from "../repositories/TrackRepository.ts";
import UserRepository from "../repositories/UserRepository.ts";
import type { PlaylistDTO, CreatePlaylist } from "../model/Playlist.ts";
import { db } from "@/db/db.ts";
import { sql } from "drizzle-orm";
import { playlistsToTracksTable, tracksTable } from "@/db/schema.ts";
import { eq } from "drizzle-orm";

export default class PlaylistService {
  repo = new PlaylistRepository();
  trackRepo = new TrackRepository();
  userRepo = new UserRepository();

  async findAll(): Promise<PlaylistDTO[]> {
    const playlists = await this.repo.findAll();
    const dtos: PlaylistDTO[] = [];
    for (const playlist of playlists) {
      const trackIds = await this.repo.getTrackIds(playlist.id);
      dtos.push({ ...playlist, trackIds });
    }
    return dtos;
  }

  async create(payload: CreatePlaylist): Promise<PlaylistDTO | null> {
    const user = await this.userRepo.findById(payload.userId);
    if (!user) {
      return null;
    }

    if (payload.trackIds && payload.trackIds.length > 0) {
      const tracks = await this.trackRepo.findByIds(payload.trackIds);
      if (tracks.length !== payload.trackIds.length) {
        return null;
      }
    }

    const playlist = await this.repo.insert(payload);
    
    if (payload.trackIds && payload.trackIds.length > 0) {
      for (const trackId of payload.trackIds) {
        await this.repo.addTrack(playlist.id, trackId);
      }
    }

    return { ...playlist, trackIds: payload.trackIds || [] };
  }

  async findById(id: number): Promise<PlaylistDTO | null> {
    const playlist = await this.repo.findById(id);
    if (!playlist) return null;

    const trackIds = await this.repo.getTrackIds(id);
    return { ...playlist, trackIds };
  }

  async findByUserId(userId: number): Promise<PlaylistDTO[]> {
    const playlists = await this.repo.findByUserId(userId);
    const dtos: PlaylistDTO[] = [];
    for (const playlist of playlists) {
      const trackIds = await this.repo.getTrackIds(playlist.id);
      dtos.push({ ...playlist, trackIds });
    }
    return dtos;
  }

  async delete(id: number): Promise<boolean> {
    const playlist = await this.repo.findById(id);
    if (!playlist) return false;
    return this.repo.delete(id);
  }

  async addTrack(playlistId: number, trackId: number): Promise<PlaylistDTO | null> {
    const playlist = await this.repo.findById(playlistId);
    if (!playlist) return null;

    const track = await this.trackRepo.findById(trackId);
    if (!track) return null;

    await this.repo.addTrack(playlistId, trackId);

    const trackIds = await this.repo.getTrackIds(playlistId);
    return { ...playlist, trackIds };
  }

  async removeTrack(playlistId: number, trackId: number): Promise<PlaylistDTO | null> {
    const playlist = await this.repo.findById(playlistId);
    if (!playlist) return null;

    await this.repo.removeTrack(playlistId, trackId);

    const trackIds = await this.repo.getTrackIds(playlistId);
    return { ...playlist, trackIds };
  }

  async getTotalDuration(playlistId: number): Promise<number | null> {
    const playlist = await this.repo.findById(playlistId);
    if (!playlist) return null;
    // TODO: mover a repository
    const result = await db.select({
      total: sql<number>`COALESCE(SUM(${tracksTable.duration}), 0)`,
    })
      .from(playlistsToTracksTable)
      .leftJoin(tracksTable, eq(playlistsToTracksTable.trackId, tracksTable.id))
      .where(eq(playlistsToTracksTable.playlistId, playlistId));

    return result[0].total;
  }
}
