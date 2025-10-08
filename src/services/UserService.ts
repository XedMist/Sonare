import UserRepository from "../repositories/UserRepository.ts";
import PlaylistRepository from "../repositories/PlaylistRepository.ts";
import type { User } from "../model/User.ts";

export default class UserService {
  repo = new UserRepository();
  playlistRepo = new PlaylistRepository();

  async findAll(): Promise<User[]> {
    return await this.repo.findAll();
  }

  // El omit es para no tener que pasar el id al crear el usuario
  // De eso se encarga el repo
  async create(payload: Omit<User, "id">): Promise<User> {
    return await this.repo.insert(payload);
  }

  async findById(id: number): Promise<User | null> {
    return await this.repo.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const user = await this.repo.findById(id);
    if (!user) return false;

    // Al eliminar un usuario, eliminamos también sus playlists asociadas
    const playlists = await this.playlistRepo.findByUserId(id);
    for (const playlist of playlists) {
      await this.playlistRepo.delete(playlist.id);
    }

    return this.repo.delete(id);
  }
}
