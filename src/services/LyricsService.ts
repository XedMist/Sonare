import LyricsRepository from "@/repositories/LyricsRepository.ts";
import TrackRepository from "@/repositories/TrackRepository.ts";
import { NotFoundError } from "@/error/ApiError.ts";
import type { Lyrics } from "@/model/entity";

export default class LyricsService {
    private lyricsRepository = new LyricsRepository();
    private trackRepository = new TrackRepository();

    async getLyricsByTrackID(trackID: string): Promise<Lyrics> {
        const lyrics = await this.lyricsRepository.findByTrackID(trackID);
        if (!lyrics) {
            throw new NotFoundError(`Lyrics for track ID ${trackID} not found.`);
        }
        return lyrics;
    }

    async getLyricsByID(lyricsID: string): Promise<Lyrics> {
        const lyrics = await this.lyricsRepository.findById(lyricsID);
        if (!lyrics) {
            throw new NotFoundError(`Lyrics with ID ${lyricsID} not found.`);
        }
        return lyrics;
    }

    async createLyrics(trackID: string, syncedLyrics: string): Promise<Lyrics> {
        const track = await this.trackRepository.findById({ id: trackID });
        if (!track) {
            throw new NotFoundError(`Track with ID ${trackID} not found.`);
        }

        const existingLyrics = await this.lyricsRepository.findByTrackID(trackID);
        if (existingLyrics) {
            throw new Error(`Lyrics for track ID ${trackID} already exist.`);
        }

        const newLyrics = await this.lyricsRepository.create({
            trackID,
            syncedLyrics,
        });
        return newLyrics;
    }

    async updateLyrics(trackID: string, data: { syncedLyrics: string }): Promise<Lyrics> {
        const existing = await this.lyricsRepository.findByTrackID(trackID);
        if (!existing) {
            throw new NotFoundError(`Lyrics for track ${trackID} not found`);
        }

        const updated = await this.lyricsRepository.update(existing.id, {
            syncedLyrics: data.syncedLyrics,
        });
        if (!updated) {
            throw new Error(`Failed to update lyrics for track ID ${trackID}.`);
        }
        return updated;
    }

    async deleteLyrics(trackID: string): Promise<void> {
        const existing = await this.lyricsRepository.findByTrackID(trackID);
        if (!existing) {
            throw new NotFoundError(`Lyrics for track ${trackID} not found`);
        }

        const success = await this.lyricsRepository.deleteLyrics(existing.id);
        if (!success) {
            throw new Error(`Failed to delete lyrics for track ID ${trackID}.`);
        }
    }
}