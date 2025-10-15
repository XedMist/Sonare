import TrackRepository from "../repositories/TrackRepository.ts";
import type { Track } from "../model/Track.ts";

export default class TrackService {
  repo = new TrackRepository();

  async findAll(): Promise<Track[]> {
    return await this.repo.findAll();
  }

  async findById(id: number): Promise<Track | null> {
    return await this.repo.findById(id);
  }

  async downloadTrack(
    id: number,
  ): Promise<{ data: Uint8Array; mimeType: string } | null> {
    const track = await this.repo.findById(id);
    if (!track) return null;

    const data = await Deno.readFile(track.path);

    const extension = track.path.split(".").pop()?.toLowerCase();
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
