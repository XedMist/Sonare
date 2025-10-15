import AlbumRepository from "../repositories/AlbumRepository.ts";
import type { Album } from "../model/Album.ts";

export default class AlbumService {
  repo = new AlbumRepository();

  async getAlbumsFromArtist(id: number): Promise<Album[]> {
    return await this.repo.getAlbumsFromArtist(id);
  }
  async getAlbums(example: Album): Promise<Album[]> {
    return await this.repo.getAlbums(example);
  }
}
