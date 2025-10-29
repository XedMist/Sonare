import type { Track } from "../generated/prisma/index.d.ts";
import TrackRepository from "../repositories/TrackRepository.ts";
import {readFileSync} from 'node:fs'


export default class TrackService {
  repo = new TrackRepository();

  async findAll(): Promise<Track[]> {
    return await this.repo.findAll();
  }

  async findById(id: Pick<Track, "id">): Promise<Track | null> {
    return await this.repo.findById(id);
  }

<<<<<<< HEAD
  async downloadTrack(id: Pick<Track, "id">): Promise<{ data: Uint8Array; mimeType: string } | null> {
||||||| 4691fd2
  async downloadTrack(id: number): Promise<{ data: Uint8Array; mimeType: string } | null> {
=======
  async downloadTrack(
    id: number,
  ): Promise<{ data: Uint8Array; mimeType: string } | null> {
>>>>>>> main
    const track = await this.repo.findById(id);
    if (!track) return null;

<<<<<<< HEAD
    const data = readFileSync(track.path);
    
    const extension = track.path.split('.').pop()?.toLowerCase();
||||||| 4691fd2
    const data = await Deno.readFile(track.path);
    
    const extension = track.path.split('.').pop()?.toLowerCase();
=======
    const data = await Deno.readFile(track.path);

    const extension = track.path.split(".").pop()?.toLowerCase();
>>>>>>> main
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
