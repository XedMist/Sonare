import { NotFoundError, ForbiddenError, UnauthorizedError } from "@/error/ApiError.ts";
import type { Album, Track } from "@/model/entity/index.ts";
import AlbumRepository from "@/repositories/AlbumRepository.ts";
import UserRepository from "@/repositories/UserRepository.ts";

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

    async delete(id: string, userId: string): Promise<void> {
        const album = await this.albumRepository.findByIdWithArtist(id);
        if (!album) throw new NotFoundError("No se encontro el album");

        const userRepo = new UserRepository();
        const user = await userRepo.findByIdWithPermissions(userId);
        
        if (!user) throw new UnauthorizedError("Usuario no encontrado");

        if (user.role.name === 'User') {
            throw new ForbiddenError("No tienes permiso para eliminar este album");
        }

        if (user.role.name === 'Artist') {
            if (user.name !== album.artist.name) {
                 throw new ForbiddenError("No tienes permiso para eliminar este album (no eres el creador)");
            }
        }

        await this.albumRepository.delete(id);
    }
}
