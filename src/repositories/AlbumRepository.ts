import { db } from '@/db/db.ts'
import type { Album , Artist } from '../generated/prisma/index.d.ts';

export default class AlbumRepository {
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
  }

  async getAlbums(example: Album): Promise<Album[]> {
    const filters: { name?: { contains: string; mode: 'insensitive' } } = {}
    if (example?.name && example.name.trim().length > 0) {
      filters.name = { contains: example.name, mode: 'insensitive' }
    }

    return await db.album.findMany({
      where: filters,
      take: undefined,
      skip: undefined,
    })
  }
}
