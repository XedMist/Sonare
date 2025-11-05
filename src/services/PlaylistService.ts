import PlaylistRepository from "../repositories/PlaylistRepository.ts";
import type { Playlist } from '../generated/prisma/index.d.ts'

export default class PlaylistService {
    private playlistRepository = new PlaylistRepository();

    async findAll(pagination: { skip?: number, take?: number } | undefined): Promise<Playlist[]> {
        return await this.playlistRepository.findAll(pagination ?? {});
    }

    async findByID(id: string): Promise<Playlist | null> {
        return await this.playlistRepository.findById({ id });
    }

    async create(name: string, userID: string): Promise<Playlist> {
        return await this.playlistRepository.create({ name, userID });
    }

    async delete(id: string): Promise<boolean> {
        return await this.playlistRepository.delete({ id });
    }
}
