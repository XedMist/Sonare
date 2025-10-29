import type { Album } from "../generated/prisma/index.d.ts";
import AlbumRepository from "../repositories/AlbumRepository.ts";

export default class AlbumService {
  repo = new AlbumRepository();

  async getAlbumsFromArtist(id: number): Promise<Album[]> {
      return await this.repo.getAlbumsFromArtist(id)
  }
  async getAlbums(example: Album): Promise<Album[]> {
      return await this.repo.getAlbums(example)
  }
}
