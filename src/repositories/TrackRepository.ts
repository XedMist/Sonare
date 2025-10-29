import { db } from "@/db/db.ts";
import type { Track } from "../generated/prisma/index.d.ts";

export default class TrackRepository {
  async findAll(): Promise<Track[]> {
    return await db.track.findMany();
  }

  async findById({id}: Pick<Track, 'id'>): Promise<Track | null> {
    return await db.track.findUnique({
      where: {
        id,
      }
    })
  }

  async getTracksFromAlbum(albumID: string): Promise<Track[]> {
    return await db.track.findMany({
      where: { albumID},
    });
  }

  async getTracksFromArtist(artistID: string): Promise<Track[]> {
    return await db.track.findMany({
      where: { 
        album: { artistID }
      },
    });
  }

}
