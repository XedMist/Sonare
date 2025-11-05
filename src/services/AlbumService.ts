import type { Album, Track } from "../generated/prisma/index.d.ts";
import AlbumRepository from "../repositories/AlbumRepository.ts";

export default class AlbumService {
    repo = new AlbumRepository();

    async findByID(id: string): Promise<Album | null> {
        return await this.repo.findById({ id });
    }

    async findAll(pagination: { skip?: number, take?: number } | undefined): Promise<Album[]> {
        return await this.repo.findAll(pagination ?? {});
    }

    async getTracksOfAlbum(id: string, pagination: { skip?: number, take?: number } | undefined): Promise<Track[]> {
        return await this.repo.getTracksOfAlbum({ id }, pagination ?? {});
    }
}
