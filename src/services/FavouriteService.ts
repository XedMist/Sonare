import FavouriteRepository from '@/repositories/FavouriteRepository';
import PlaylistRepository from "@/repositories/PlaylistRepository.ts";
import type { Playlist, Track } from '@/model/entity/index.ts'
import { NotFoundError } from "@/error/ApiError.ts";

export default class FavouriteService {
    private favouriteRepository = new FavouriteRepository();
    private playlistRepository = new PlaylistRepository();
    
    async getFavouritePlaylistByUserId(userID: string): Promise<Playlist> {
        const playlist = await this.favouriteRepository.findFavouriteByUserId(userID);
        if (!playlist){
            throw new NotFoundError("No se encontro la playlist de favoritos del usuario");
        }
        return playlist;
    }

    async addTrackToFavouritePlaylist(userID: string, trackID: string): Promise<Playlist> {
        const playlist = await this.favouriteRepository.findFavouriteByUserId(userID);
        if (!playlist){
            throw new NotFoundError("No se encontro la playlist de favoritos del usuario");
        }
        const updatedPlaylist = await this.playlistRepository.addTrackToPlaylist(playlist.id, trackID);
        return updatedPlaylist;
    }

    async removeTrackFromFavouritePlaylist(userID: string, trackID: string): Promise<Playlist> {
        const playlist = await this.favouriteRepository.findFavouriteByUserId(userID);
        if (!playlist){
            throw new NotFoundError("No se encontro la playlist de favoritos del usuario");
        }
        const updatedPlaylist = await this.playlistRepository.removeTrackFromPlaylist(playlist.id, trackID);
        return updatedPlaylist;
    }

    async getTracksInFavouritePlaylist(userID: string): Promise<Track[]> {
        const playlist = await this.favouriteRepository.findFavouriteByUserId(userID);
        if (!playlist){
            throw new NotFoundError("No se encontro la playlist de favoritos del usuario");
        }
        const tracksPlaylist = await this.playlistRepository.getTracksInPlaylist(playlist.id);
        return tracksPlaylist;
    }


}