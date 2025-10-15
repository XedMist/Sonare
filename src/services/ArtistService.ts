import ArtistRepository from "../repositories/ArtistRepository.ts";
import type { Artist } from "../model/Artist.ts";

export default class ArtistService {
  repo = new ArtistRepository();

  async findAll(): Promise<Artist[]> {
    return await this.repo.findAll();
  }

  async create(payload: Omit<Artist, "id">): Promise<Artist> {
    return await this.repo.insert(payload);
  }
}
