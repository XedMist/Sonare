import { NotFoundError, ForbiddenError, UnauthorizedError } from "@/error/ApiError.ts";
import type { Track } from "@/model/entity/index.ts";
import TrackRepository from "@/repositories/TrackRepository.ts";
import UserRepository from "@/repositories/UserRepository.ts";


export default class TrackService {
    private trackRepository = new TrackRepository();

    async findAll(name: string | undefined, albumID: string | undefined, artistID: string | undefined, pagination: { skip?: number, take?: number } | undefined): Promise<Track[]> {
        return await this.trackRepository.findAll({ name }, { id: albumID }, { id: artistID }, pagination ?? {});
    }

    async findById(id: string): Promise<Track> {
        const track = await this.trackRepository.findById({ id });
        if (!track) throw new NotFoundError("Pista no encontrada")
        return track;
    }

    async getThumbnail(id: string): Promise<string | null> {
        const track = await this.findById(id)
        return track === null ? track : track.thumbnail;
    }

    private getMimeType(extension?: string): string {
        const mimeTypes: Record<string, string> = {
            "flac": "audio/flac",
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "ogg": "audio/ogg",
            "opus": "audio/opus",
            "m4a": "audio/mp4",
            "aac": "audio/aac",
        };
        return mimeTypes[extension || ""] || "application/octet-stream";
    }

    async delete(id: string, userId: string): Promise<void> {
        const track = await this.trackRepository.findByIdWithArtist(id);
        if (!track) throw new NotFoundError("No se encontro la pista");

        const userRepo = new UserRepository();
        const user = await userRepo.findByIdWithPermissions(userId);

        if (!user) throw new UnauthorizedError("Usuario no encontrado");

        if (user.role.name === 'User') {
             throw new ForbiddenError("No tienes permiso para eliminar esta pista");
        }

        if (user.role.name === 'Artist') {
            if (user.name !== track.artist.name) {
                 throw new ForbiddenError("No tienes permiso para eliminar esta pista (no eres el creador)");
            }
        }
        
        await this.trackRepository.delete(id);
    }
}
