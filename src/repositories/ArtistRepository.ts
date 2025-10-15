import type { Artist } from "../model/Artist.ts";
import { db } from "../db/db.ts";
import { artistsTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export default class ArtistRepository {
  async findAll(): Promise<Artist[]> {
    return await db.select().from(artistsTable);
  }

  async insert(a: Omit<Artist, "id">): Promise<Artist> {
    const result = await db.insert(artistsTable).values(a).returning();
    return result[0];
  }

  async findById(id: number): Promise<Artist | null> {
    const artist = await db.select().from(artistsTable).where(
      eq(artistsTable.id, id),
    );
    return artist.length === 0 ? null : artist[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(artistsTable).where(
      eq(artistsTable.id, id),
    ).returning();
    return result.length !== 0;
  }
}
