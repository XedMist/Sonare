import PlaylistRepository from "@/repositories/PlaylistRepository.ts";
import type { Playlist, PlaylistTrack, Track } from '@/model/entity/index.ts'
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

    async update(id: string, name: string): Promise<Playlist> {
        const playlist = await this.playlistRepository.findById({ id });
        if (!playlist) throw new NotFoundError("No se encontro la playlist");

        const updated = await this.playlistRepository.update({ id, name });
        if (!updated) throw new NotFoundError("No se pudo actualizar la playlist");
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return await this.playlistRepository.delete({ id });
    }

    async getTracksInPlaylist(playlistID: string): Promise<PlaylistTrack[]> {
        const playlist = await this.playlistRepository.findById({ id: playlistID });
        if (!playlist) {
            throw new NotFoundError("No se encontro la playlist");
        }
        const tracksPlaylist = await this.playlistRepository.getPlaylistTracks(playlistID);
        return tracksPlaylist;
    }

    async addTrackToPlaylist(playlistID: string, trackID: string): Promise<Playlist> {
        const playlist = await this.playlistRepository.findById({ id: playlistID });
        if (!playlist) {
            throw new NotFoundError("No se encontro la playlist");
        }
        const updatedPlaylist = await this.playlistRepository.addTrackToPlaylist(playlistID, trackID);
        return updatedPlaylist;
    }

    async removeTrackFromPlaylist(playlistID: string, trackID: string): Promise<Playlist> {
        const playlist = await this.playlistRepository.findById({ id: playlistID });
        if (!playlist) {
            throw new NotFoundError("No se encontro la playlist");
        }
        const updatedPlaylist = await this.playlistRepository.removeTrackFromPlaylist(playlistID, trackID);
        return updatedPlaylist;
    }

    async getPlaylistTracks(playlistID: string): Promise<PlaylistTrack[]> {
        const playlist = await this.playlistRepository.findById({ id: playlistID });
        if (!playlist) {
            throw new NotFoundError("No se encontro la playlist");
        }
        return await this.playlistRepository.getPlaylistTracks(playlistID);
    }

    // Returns a PlaylistTracks[] but it doesnt mutate
    async shuffle(playlistID: string): Promise<PlaylistTrack[]> {
        const playlist = await this.playlistRepository.findById({ id: playlistID });
        if (!playlist) {
            throw new NotFoundError("No se encontro la playlist");
        }
        const playlistTracks = await this.playlistRepository.getPlaylistTracks(playlistID);
        // Fisher-Yates shuffle algorithm
        const shuffled = [...playlistTracks];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

}
