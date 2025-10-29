import PlaylistRepository from "../repositories/PlaylistRepository.ts";
import TrackRepository from "../repositories/TrackRepository.ts";
import UserRepository from "../repositories/UserRepository.ts";
import type { Playlist } from '../generated/prisma/index.d.ts'

export default class PlaylistService {
    repo = new PlaylistRepository();
    trackRepo = new TrackRepository();
    userRepo = new UserRepository();
}
