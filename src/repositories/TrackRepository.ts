import { type Track, trackSchema } from "@/model/Track.ts";
import { db } from "@/db/db.ts";
import { tracksTable } from "@/db/schema.ts";
import { eq, inArray } from "drizzle-orm";

export default class TrackRepository {
  async findAll(): Promise<Track[]> {
    return await db.select().from(tracksTable);
  }

  async findById(id: number): Promise<Track | null> {
    const track = await db.select().from(tracksTable)
      .where(eq(tracksTable.id, id));
    return track.length == 0 ? null : trackSchema.parse(track[0]);
  }

  async findByIds(ids: number[]): Promise<Track[]> {
    if (ids.length === 0) return [];
    const tracks = await db.select().from(tracksTable)
      .where(inArray(tracksTable.id, ids));
    return tracks.map(t => trackSchema.parse(t));
  }
}
