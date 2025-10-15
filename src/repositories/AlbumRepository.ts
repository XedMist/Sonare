import { eq } from "drizzle-orm";
import { albumsTable, albumsToArtistsTable } from "../db/schema.ts";
import type { Album } from "../model/Album.ts";
import { db } from '@/db/db.ts'

export default class AlbumRepository {
  async getAlbumsFromArtist(id: number): Promise<Album[]> {
    const result = await db.select({
      id: albumsTable.id,
      name: albumsTable.name,
    }).from(albumsTable)
      .leftJoin(albumsToArtistsTable, eq(albumsTable.id, albumsToArtistsTable.albumId))
      .where(eq(albumsToArtistsTable.artistId, id));
    
    return result.map(a => ({ id: a.id, name: a.name, artistIds: [], trackIds: [] }));
  }

  async getAlbums(example: Album): Promise<Album[]> {
    const result = await db.select({
      id: albumsTable.id,
      name: albumsTable.name,
    }).from(albumsTable)
      .where(eq(albumsTable.name, example.name));
    
    return result.map(a => ({ id: a.id, name: a.name, artistIds: [], trackIds: [] }));
  }

  async findById(id: number): Promise<Album | null> {
    const result = await db.select({
      id: albumsTable.id,
      name: albumsTable.name,
    }).from(albumsTable)
      .where(eq(albumsTable.id, id));
    
    if (result.length === 0) return null;
    return { id: result[0].id, name: result[0].name, artistIds: [], trackIds: [] };
  }
}
