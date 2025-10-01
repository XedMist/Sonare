import AlbumRepository from "../repositories/AlbumRepository.ts";
import TrackRepository from "../repositories/TrackRepository.ts";
import type { Album } from "../model/Album.ts";

export default class AlbumService {
  repo = new AlbumRepository();
  trackRepo = new TrackRepository();

  async findAll(): Promise<Album[]> {
    return this.repo.findAll();
  }

  // El omit es para no tener que pasar el id al crear el album
  // De eso se encarga el repo
  async create(payload: Omit<Album, "id">): Promise<Album> {
    return this.repo.insert(payload);
  }

  async findById(id: number): Promise<Album | null> {
    return this.repo.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const album = await this.repo.findById(id);
    if (!album) return false;

    // Al eliminar un album, eliminamos también sus tracks asociados
    const tracks = await this.trackRepo.findByAlbumId(id);
    for (const track of tracks) {
      await this.trackRepo.delete(track.id);
    }

    return this.repo.delete(id);
  }
}
