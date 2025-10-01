import type { Album } from "../model/Album.ts";

// Si fuera de verdad se deberia llamar a la base de datos
// Para la prueba se utiliza un mapa
let nextId = 1;
const store = new Map<number, Album>();

export default class AlbumRepository {
  // No hace falta el async pero lo dejo para imitar a como se
  // haria con una base de datos real
  async findAll(): Promise<Album[]> {
    return Array.from(store.values());
  }

  async insert(a: Omit<Album, "id">): Promise<Album> {
    const album: Album = { id: nextId++, ...a };
    store.set(album.id, album);
    return album;
  }

  async findById(id: number): Promise<Album | null> {
    return store.get(id) || null;
  }

  async delete(id: number): Promise<boolean> {
    return store.delete(id);
  }
}
