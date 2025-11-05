import type { Artist, Track, Album } from "../generated/prisma/index.d.ts";
import ArtistRepository from "../repositories/ArtistRepository.ts";

export default class ArtistService {
    private artistRepository = new ArtistRepository();

    async findAll(pagination: { skip?: number, take?: number } | undefined): Promise<Artist[]> {
        return await this.artistRepository.findAll(pagination ?? {});
    }

    async findByID(id: string): Promise<Artist | null> {
        return await this.artistRepository.findById({ id });
    }

    async create(name: string): Promise<Artist> {
        return await this.artistRepository.insert({ name });
    }

    async delete(id: string): Promise<boolean> {
        return await this.artistRepository.delete({ id });
    }

    async getAlbumsByArtist(id: string, pagination: { skip?: number, take?: number } | undefined): Promise<Album[]> {
        return await this.artistRepository.getAlbumsOfArtist(id, pagination ?? {});
    }

    async getTracksByArtist(id: string, pagination: { skip?: number, take?: number } | undefined): Promise<Track[]> {
        return await this.artistRepository.getTracksOfArtist(id, pagination ?? {});
    }
}
