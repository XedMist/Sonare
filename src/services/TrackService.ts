import TrackRepository from "../repositories/TrackRepository.ts";
import type { Track } from "../model/Track.ts";

export default class TrackService {
  repo = new TrackRepository();

  async findAll(): Promise<Track[]> {
    return this.repo.findAll();
  }

  // El omit es para no tener que pasar el id al crear el track
  // De eso se encarga el repo
  async create(payload: Omit<Track, "id">): Promise<Track> {
    return this.repo.insert(payload);
  }

  async findById(id: number): Promise<Track | null> {
    return this.repo.findById(id);
  }

  async findByAlbumId(albumId: number): Promise<Track[]> {
    return this.repo.findByAlbumId(albumId);
  }

  async delete(id: number): Promise<boolean> {
    const track = await this.repo.findById(id);
    if (track) return this.repo.delete(id);
    return false;
  }
}
