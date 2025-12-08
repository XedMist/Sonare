import UserRepository from "@/repositories/UserRepository.ts";
import PlaylistRepository from "@/repositories/PlaylistRepository";
import type { User, Playlist, Track } from '@/model/entity/index.ts'
import { NotFoundError } from "@/error/ApiError.ts";
import { db } from "@/db/db.ts";
import { PrismaMapper } from "@/model/mappers.ts";

export default class MeService {

    private userRepository = new UserRepository();
    private playlistRepository = new PlaylistRepository();

    async getMe(userID: string): Promise<User> {
        const user = await this.userRepository.findByIdWithPermissions(userID);
        if (!user) {
            throw new NotFoundError("No se encontro el usuario");
        }
        return user;
    }

    async getMyPlaylists(userID: string, pagination: { skip?: number, take?: number } | undefined): Promise<Playlist[]> {
        const userPlaylists = await this.playlistRepository.findByUserID(userID);
        return userPlaylists.slice(pagination?.skip ?? 0, (pagination?.take ? (pagination.skip ?? 0) + pagination.take : undefined));
    }

    async getMyFavorites(userID: string): Promise<Track[]> {
        const user = await this.getMe(userID);
        if (!user.favoritosID) {
            return [];
        }
        return await this.playlistRepository.getTracksInPlaylist(user.favoritosID);
    }

    async likeTrack(userID: string, trackID: string): Promise<void> {
        const user = await this.getMe(userID);
        if (!user.favoritosID) {
            throw new NotFoundError("El usuario no tiene una playlist de favoritos");
        }
        await this.playlistRepository.addTrackToPlaylist(user.favoritosID, trackID);
    }

    async unlikeTrack(userID: string, trackID: string): Promise<void> {
        const user = await this.getMe(userID);
        if (!user.favoritosID) {
            throw new NotFoundError("El usuario no tiene una playlist de favoritos");
        }
        await this.playlistRepository.removeTrackFromPlaylist(user.favoritosID, trackID);
    }

}