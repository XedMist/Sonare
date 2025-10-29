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

<<<<<<< HEAD
  async getTracksFromAlbum(albumID: string): Promise<Track[]> {
    return await db.track.findMany({
      where: { albumID},
    });
||||||| 4691fd2
  async findByIds(ids: number[]): Promise<Track[]> {
    if (ids.length === 0) return [];
    const tracks = await db.select().from(tracksTable)
      .where(inArray(tracksTable.id, ids));
    return tracks.map(t => trackSchema.parse(t));
=======
  async findByIds(ids: number[]): Promise<Track[]> {
    if (ids.length === 0) return [];
    const tracks = await db.select().from(tracksTable)
      .where(inArray(tracksTable.id, ids));
    return tracks.map((t) => trackSchema.parse(t));
>>>>>>> main
  }

  async getTracksFromArtist(artistID: string): Promise<Track[]> {
    return await db.track.findMany({
      where: { 
        album: { artistID }
      },
    });
  }

}
