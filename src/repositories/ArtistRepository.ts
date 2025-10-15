import type { Artist } from "../model/Artist.ts";
import { db } from "../db/db.ts";
import { artistsTable } from "../db/schema.ts";

export default class ArtistRepository {
  async findAll(): Promise<Artist[]> {
    return await db.select().from(artistsTable);
  }

  async insert(a: Omit<Artist, "id">): Promise<Artist> {
    const result = await db.insert(artistsTable).values(a).returning();
    return result[0];
  }
}
