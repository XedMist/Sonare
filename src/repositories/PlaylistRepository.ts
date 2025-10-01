import type { Playlist } from "../model/Playlist.ts";

// Si fuera de verdad se deberia llamar a la base de datos
// Para la prueba se utiliza un mapa
let nextId = 1;
const store = new Map<number, Playlist>();

export default class PlaylistRepository {
  // No hace falta el async pero lo dejo para imitar a como se
  // haria con una base de datos real
  async findAll(): Promise<Playlist[]> {
    return Array.from(store.values());
  }

  async insert(p: Omit<Playlist, "id">): Promise<Playlist> {
    const playlist: Playlist = { id: nextId++, ...p };
    store.set(playlist.id, playlist);
    return playlist;
  }

  async findById(id: number): Promise<Playlist | null> {
    return store.get(id) || null;
  }

  async findByUserId(userId: number): Promise<Playlist[]> {
    return Array.from(store.values()).filter((playlist) =>
      playlist.userId === userId
    );
  }

  async update(id: number, playlist: Playlist): Promise<Playlist | null> {
    if (store.has(id)) {
      store.set(id, playlist);
      return playlist;
    }
    return null;
  }

  async delete(id: number): Promise<boolean> {
    return store.delete(id);
  }
}
