import PlaylistRepository from "../repositories/PlaylistRepository.ts";
import TrackRepository from "../repositories/TrackRepository.ts";
import UserRepository from "../repositories/UserRepository.ts";
import { db } from "../db/db.ts";
import type { Playlist } from "../generated/prisma/client.d.ts";

export default class PlaylistService {
  repo = new PlaylistRepository();
  trackRepo = new TrackRepository();
  userRepo = new UserRepository();

  async findAll(): Promise<Playlist[]> {
    const playlists = await this.repo.findAll({});
    return playlists;
  }
}
