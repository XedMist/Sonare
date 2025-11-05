import type { Track } from "../generated/prisma/index.d.ts";
import TrackRepository from "../repositories/TrackRepository.ts";
import { readFileSync } from 'node:fs'


export default class TrackService {
    repo = new TrackRepository();

    async findAll(name: string | undefined, albumID: string | undefined, artistID: string | undefined, pagination: { skip?: number, take?: number } | undefined): Promise<Track[]> {
        return await this.repo.findAll({ name }, { id: albumID }, { id: artistID }, pagination ?? {});
    }

    async findById(id: string): Promise<Track | null> {
        return await this.repo.findById({ id });
    }

    async getThumbnail(id: string): Promise<string | null> {
        const track = await this.findById(id)
        return track === null ? track : track.thumbnail;
    }

    async downloadTrack(id: Pick<Track, "id">): Promise<{ data: Uint8Array; mimeType: string } | null> {
        const track = await this.repo.findById(id);
        if (!track) return null;

        const data = readFileSync(track.path);
        const extension = track.path.split('.').pop()?.toLowerCase();

        const mimeType = this.getMimeType(extension);

        return { data, mimeType };
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
}
