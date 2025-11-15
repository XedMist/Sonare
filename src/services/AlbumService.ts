import { NotFoundError } from "@/error/ApiError.ts";
import type { Album, Track } from "@/model/entity/index.ts";
import AlbumRepository from "@/repositories/AlbumRepository.ts";

export default class AlbumService {
    private albumRepository = new AlbumRepository();

    async findByID(id: string): Promise<Album> {
        const album = await this.albumRepository.findById({ id });
        if (!album) throw new NotFoundError("No se encontro el album")
        return album;
    }

    async findAll(pagination: { skip?: number, take?: number } | undefined): Promise<Album[]> {
        return await this.albumRepository.findAll(pagination ?? {});
    }

    async getTracksOfAlbum(id: string, pagination: { skip?: number, take?: number } | undefined): Promise<Track[]> {
        return await this.albumRepository.getTracksOfAlbum({ id }, pagination ?? {});
    }
}
