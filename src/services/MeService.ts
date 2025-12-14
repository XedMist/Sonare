import UserRepository from "@/repositories/UserRepository.ts";
import PlaylistRepository from "@/repositories/PlaylistRepository";
import type { User, Playlist, Track } from '@/model/entity/index.ts'
import { NotFoundError, ValidationError } from "@/error/ApiError.ts";
import { StorageService } from '@/services/StorageService.ts';
import type { UserProfileUpdate } from '@/model/dto/UserDTO.ts';
import { randomUUID } from 'crypto';

export default class MeService {

    private userRepository = new UserRepository();
    private playlistRepository = new PlaylistRepository();
    private storageService = new StorageService();
    private bucketInit?: Promise<void>;

    private async ensureBucket() {
        if (!this.bucketInit) {
            this.bucketInit = this.storageService.initialize();
        }
        await this.bucketInit;
    }

    private async withAvatarUrl(user: User): Promise<User> {
        if (user.avatarObjectKey) {
            try {
                const url = await this.storageService.getPresignedUrl(user.avatarObjectKey);
                user.avatarUrl = url;
            } catch (error) {
                console.error('Error generating avatar URL', error);
                user.avatarUrl = null;
            }
        } else {
            user.avatarUrl = null;
        }
        return user;
    }

    async getMe(userID: string): Promise<User> {
        const user = await this.userRepository.findByIdWithPermissions(userID);
        if (!user) {
            throw new NotFoundError("No se encontro el usuario");
        }
        return this.withAvatarUrl(user);
    }

    async updateProfile(userID: string, payload: UserProfileUpdate): Promise<User> {
        const updateData: {
            displayName?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            bio?: string | null;
            country?: string | null;
            birthdate?: Date | null;
        } = {};

        if (payload.displayName !== undefined) updateData.displayName = payload.displayName;
        if (payload.firstName !== undefined) updateData.firstName = payload.firstName;
        if (payload.lastName !== undefined) updateData.lastName = payload.lastName;
        if (payload.bio !== undefined) updateData.bio = payload.bio;
        if (payload.country !== undefined) updateData.country = payload.country;
        if (payload.birthdate !== undefined) updateData.birthdate = payload.birthdate;

        const updated = await this.userRepository.updateProfile(userID, updateData);
        return this.withAvatarUrl(updated);
    }

    async updateAvatar(userID: string, file: { buffer: Buffer; mimeType: string; size: number; fileName?: string; }): Promise<User> {
        if (file.size > 5 * 1024 * 1024) {
            throw new ValidationError('La imagen supera el limite de 5MB');
        }

        if (!file.mimeType.startsWith('image/')) {
            throw new ValidationError('Solo se permiten imagenes');
        }

        const user = await this.getMe(userID);
        await this.ensureBucket();

        if (user.avatarObjectKey) {
            await this.storageService.deleteFile(user.avatarObjectKey).catch((err) => {
                console.warn('No se pudo eliminar el avatar anterior', err);
            });
        }

        const objectKey = `avatars/${user.id}/${randomUUID()}`;

        await this.storageService.uploadBuffer(objectKey, file.buffer, {
            'Content-Type': file.mimeType,
            ...(file.fileName ? { 'X-Amz-Meta-File-Name': file.fileName } : {}),
        });

        const updated = await this.userRepository.updateAvatar(userID, objectKey);
        return this.withAvatarUrl(updated);
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