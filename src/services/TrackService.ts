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
  async downloadTrack(id: number): Promise<Uint8Array | null> {
    const track = await this.repo.findById(id);
    if (!track) return null;

    return await Deno.readFile(track.path);
  }
}
