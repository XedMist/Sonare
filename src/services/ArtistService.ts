import ArtistRepository from "../repositories/ArtistRepository.ts";
import type { Artist } from "../model/Artist.ts";

export default class ArtistService {
  repo = new ArtistRepository();

  async findAll(): Promise<Artist[]> {
    return this.repo.findAll();
  }

  // El omit es para no tener que pasar el id al crear el artista
  // De eso se encarga el repo
  async create(payload: Omit<Artist, "id">): Promise<Artist> {
    return this.repo.insert(payload);
  }

  async findById(id: number): Promise<Artist | null> {
    return this.repo.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const artist = await this.repo.findById(id);
    if (artist) return this.repo.delete(id);
    return false;
  }
}
