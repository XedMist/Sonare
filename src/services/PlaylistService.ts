import PlaylistRepository from "@/repositories/PlaylistRepository.ts";
import type { Playlist, Track } from '@/model/entity/index.ts'
import { NotFoundError } from "@/error/ApiError.ts";

export default class PlaylistService {
    
    private playlistRepository = new PlaylistRepository();

    async findAll(pagination: { skip?: number, take?: number } | undefined): Promise<Playlist[]> {
        return await this.playlistRepository.findAll(pagination ?? {});
    }

    async findByID(id: string): Promise<Playlist> {
        const playlist = await this.playlistRepository.findById({ id });
        if (!playlist) throw new NotFoundError("No se encontro la playlist");
        return playlist;
    }

    async create(name: string, userID: string): Promise<Playlist> {
        return await this.playlistRepository.create({ name, userID });
    }

    async delete(id: string): Promise<boolean> {
        return await this.playlistRepository.delete({ id });
    }

    async getTracksInPlaylist(playlistID: string): Promise<Track[]> {
        const playlist = await this.playlistRepository.findById({ id: playlistID });
        if (!playlist){
            throw new NotFoundError("No se encontro la playlist");
        }
        const tracksPlaylist = await this.playlistRepository.getTracksInPlaylist(playlistID);
        return tracksPlaylist;
    }

    async addTrackToPlaylist(playlistID: string, trackID: string): Promise<Playlist> {
        const playlist = await this.playlistRepository.findById({ id: playlistID });
        if (!playlist){
            throw new NotFoundError("No se encontro la playlist");
        }
        const updatedPlaylist = await this.playlistRepository.addTrackToPlaylist(playlistID, trackID);
        return updatedPlaylist;
    }

    async removeTrackFromPlaylist(playlistID: string, trackID: string): Promise<Playlist> {
        const playlist = await this.playlistRepository.findById({ id: playlistID });
        if (!playlist){
            throw new NotFoundError("No se encontro la playlist");
        }
        const updatedPlaylist = await this.playlistRepository.removeTrackFromPlaylist(playlistID, trackID);
        return updatedPlaylist;
    }
}
