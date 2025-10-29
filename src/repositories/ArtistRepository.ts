import { db } from "../db/db.ts";
import type { Album, Artist } from "../generated/prisma/index.d.ts";
import type { PrismaClientKnownRequestError } from "../generated/prisma/runtime/library.d.ts";
export default class ArtistRepository {
  async getAlbums(artistId: string, pagination: {limit: number, offset: number} | undefined): Promise<Album[]> {
      return await db.album.findMany({
          where: {
            artistID: {
              equals: artistId,            }
          },
          skip: pagination ? pagination.offset : pagination,
          take: pagination ? pagination.limit : pagination,
      })
  }

  async findAll(): Promise<Artist[]> {
    return await db.artist.findMany()
  }

  async findById({ id }: Pick<Album, "id">): Promise<Artist | null> {
    return await db.artist.findUnique({
      where: { 
        id: id, 
      }
    })
  }

  async insert(artist: Pick<Artist, "name">) {
    await db.artist.create({
      data: {
        name: artist.name
      }
    })
  }

  async delete({ id, name }: Partial<Album>): Promise<boolean> {
    try {
    await db.artist.delete({
      where: {
        id: id,
        name: name
      },
    })
    return true;
  } catch(_) {
    return false;
  }
}

  async update(id: string, name: string) {
    await db.artist.update({
      where: {
        id: id,
      },
      data: {
        name: name
      }
    })
  }
}
