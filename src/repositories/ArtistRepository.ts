import type { Artist } from "../model/Artist.ts";

// Si fuera de verdad se deberia llamar a la base de datos
// Para la prueba se utiliza un mapa
let nextId = 1;
const store = new Map<number, Artist>();

export default class ArtistRepository {
  // No hace falta el async pero lo dejo para imitar a como se
  // haria con una base de datos real
  async findAll(): Promise<Artist[]> {
    return Array.from(store.values());
  }

  async insert(a: Omit<Artist, "id">): Promise<Artist> {
    const artist: Artist = { id: nextId++, ...a };
    store.set(artist.id, artist);
    return artist;
  }

  async findById(id: number): Promise<Artist | null> {
    return store.get(id) || null;
  }

  async delete(id: number): Promise<boolean> {
    return store.delete(id);
  }
}
