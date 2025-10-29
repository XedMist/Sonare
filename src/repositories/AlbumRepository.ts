<<<<<<< HEAD
import { db } from '@/db/db.ts'
import type { Album , Artist } from '../generated/prisma/index.d.ts';
||||||| 4691fd2
import { eq } from "drizzle-orm";
import { albumsTable, albumsToArtistsTable } from "../db/schema.ts";
import type { Album } from "../model/Album.ts";
import { db } from '@/db/db.ts'
=======
import { eq } from "drizzle-orm";
import { albumsTable, albumsToArtistsTable } from "../db/schema.ts";
import type { Album } from "../model/Album.ts";
import { db } from "@/db/db.ts";
>>>>>>> main

export default class AlbumRepository {
<<<<<<< HEAD
  async findAll({ take, skip }: { skip?: number; take?: number }): Promise<Album[]> {
    return await db.album.findMany({ skip, take })
  }

  async findById({ id }: Pick<Album, 'id'>): Promise<Album | null> {
    return await db.album.findUnique({
      where: { id },
    })
  }

  async insert(
    album: Omit<Album, 'id'> | { name: string },
    artist: Artist,
  ): Promise<Album> {
    const name = (album as { name: string }).name
    return await db.album.create({
      data: {
        name,
        artist: { connect: { id: artist.id } },
      },
    })
  }

  async getAlbumsFromArtist(artistId: number): Promise<Album[]> {
    return await db.album.findMany({
      where: { artistID: String(artistId) },
    })
||||||| 4691fd2
  async getAlbumsFromArtist(id: number): Promise<Album[]> {
    const result = await db.select({
      id: albumsTable.id,
      name: albumsTable.name,
    }).from(albumsTable)
      .leftJoin(albumsToArtistsTable, eq(albumsTable.id, albumsToArtistsTable.albumId))
      .where(eq(albumsToArtistsTable.artistId, id));
    
    return result.map(a => ({ id: a.id, name: a.name, artistIds: [], trackIds: [] }));
=======
  async getAlbumsFromArtist(id: number): Promise<Album[]> {
    const result = await db.select({
      id: albumsTable.id,
      name: albumsTable.name,
    }).from(albumsTable)
      .leftJoin(
        albumsToArtistsTable,
        eq(albumsTable.id, albumsToArtistsTable.albumId),
      )
      .where(eq(albumsToArtistsTable.artistId, id));

    return result.map((a) => ({
      id: a.id,
      name: a.name,
      artistIds: [],
      trackIds: [],
    }));
>>>>>>> main
  }

  async getAlbums(example: Album): Promise<Album[]> {
<<<<<<< HEAD
    const filters: { name?: { contains: string; mode: 'insensitive' } } = {}
    if (example?.name && example.name.trim().length > 0) {
      filters.name = { contains: example.name, mode: 'insensitive' }
    }
||||||| 4691fd2
    const result = await db.select({
      id: albumsTable.id,
      name: albumsTable.name,
    }).from(albumsTable)
      .where(eq(albumsTable.name, example.name));
    
    return result.map(a => ({ id: a.id, name: a.name, artistIds: [], trackIds: [] }));
  }
=======
    const result = await db.select({
      id: albumsTable.id,
      name: albumsTable.name,
    }).from(albumsTable)
      .where(eq(albumsTable.name, example.name));

    return result.map((a) => ({
      id: a.id,
      name: a.name,
      artistIds: [],
      trackIds: [],
    }));
  }
>>>>>>> main

<<<<<<< HEAD
    return await db.album.findMany({
      where: filters,
      take: undefined,
      skip: undefined,
    })
||||||| 4691fd2
  async findById(id: number): Promise<Album | null> {
    const result = await db.select({
      id: albumsTable.id,
      name: albumsTable.name,
    }).from(albumsTable)
      .where(eq(albumsTable.id, id));
    
    if (result.length === 0) return null;
    return { id: result[0].id, name: result[0].name, artistIds: [], trackIds: [] };
=======
  async findById(id: number): Promise<Album | null> {
    const result = await db.select({
      id: albumsTable.id,
      name: albumsTable.name,
    }).from(albumsTable)
      .where(eq(albumsTable.id, id));

    if (result.length === 0) return null;
    return {
      id: result[0].id,
      name: result[0].name,
      artistIds: [],
      trackIds: [],
    };
>>>>>>> main
  }
}
