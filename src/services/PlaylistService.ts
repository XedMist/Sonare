import PlaylistRepository from "../repositories/PlaylistRepository.ts";
import TrackRepository from "../repositories/TrackRepository.ts";
import UserRepository from "../repositories/UserRepository.ts";
import type { Playlist } from "../model/Playlist.ts";

export default class PlaylistService {
  repo = new PlaylistRepository();
  trackRepo = new TrackRepository();
  userRepo = new UserRepository();

  async findAll(): Promise<Playlist[]> {
    return this.repo.findAll();
  }

  // El omit es para no tener que pasar el id al crear el playlist
  // De eso se encarga el repo
  async create(payload: Omit<Playlist, "id">): Promise<Playlist | null> {
    // Verificar que el usuario existe
    const user = await this.userRepo.findById(payload.userId);
    if (!user) {
      return null;
    }

    // Verificar que todos los tracks existen
    for (const trackId of payload.trackIds) {
      const track = await this.trackRepo.findById(trackId);
      if (!track) {
        return null;
      }
    }

    return this.repo.insert(payload);
  }

  async findById(id: number): Promise<Playlist | null> {
    return this.repo.findById(id);
  }

  async findByUserId(userId: number): Promise<Playlist[]> {
    return this.repo.findByUserId(userId);
  }

  async delete(id: number): Promise<boolean> {
    const playlist = await this.repo.findById(id);
    if (playlist) return this.repo.delete(id);
    return false;
  }

  // Añadir un track a una playlist
  async addTrack(playlistId: number, trackId: number): Promise<Playlist | null> {
    const playlist = await this.repo.findById(playlistId);
    if (!playlist) return null;

    const track = await this.trackRepo.findById(trackId);
    if (!track) return null;

    // Evitar duplicados
    if (!playlist.trackIds.includes(trackId)) {
      playlist.trackIds.push(trackId);
      return this.repo.update(playlistId, playlist);
    }

    return playlist;
  }

  // Eliminar un track de una playlist
  async removeTrack(
    playlistId: number,
    trackId: number,
  ): Promise<Playlist | null> {
    const playlist = await this.repo.findById(playlistId);
    if (!playlist) return null;

    playlist.trackIds = playlist.trackIds.filter((id) => id !== trackId);
    return this.repo.update(playlistId, playlist);
  }

  // Obtener la duración total de una playlist
  async getTotalDuration(playlistId: number): Promise<number | null> {
    const playlist = await this.repo.findById(playlistId);
    if (!playlist) return null;

    let totalDuration = 0;
    for (const trackId of playlist.trackIds) {
      const track = await this.trackRepo.findById(trackId);
      if (track) {
        totalDuration += track.duration;
      }
    }

    return totalDuration;
  }
}
