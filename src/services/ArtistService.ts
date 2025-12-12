import { NotFoundError } from "@/error/ApiError.ts";
import type { Artist, Track, Album } from "@/model/entity/index.ts";
import ArtistRepository from "@/repositories/ArtistRepository.ts";

export default class ArtistService {
    private artistRepository = new ArtistRepository();

    async findAll(pagination: { skip?: number, take?: number } | undefined): Promise<Artist[]> {
        return await this.artistRepository.findAll(pagination ?? {});
    }

    async findByID(id: string): Promise<Artist> {
        const artist = await this.artistRepository.findById({ id });
        if (!artist) throw new NotFoundError("No se encontro el artista")
        return artist
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

    async getSinglesByArtist(id: string, pagination: { skip?: number, take?: number } | undefined): Promise<Track[]> {
        return await this.artistRepository.getSinglesOfArtist(id, pagination ?? {});
    }
}
