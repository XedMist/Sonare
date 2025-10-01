import type { Track } from "../model/Track.ts";

// Si fuera de verdad se deberia llamar a la base de datos
// Para la prueba se utiliza un mapa
let nextId = 1;
const store = new Map<number, Track>();

export default class TrackRepository {
  // No hace falta el async pero lo dejo para imitar a como se
  // haria con una base de datos real
  async findAll(): Promise<Track[]> {
    return Array.from(store.values());
  }

  async insert(t: Omit<Track, "id">): Promise<Track> {
    const track: Track = { id: nextId++, ...t };
    store.set(track.id, track);
    return track;
  }

  async findById(id: number): Promise<Track | null> {
    return store.get(id) || null;
  }

  async findByAlbumId(albumId: number): Promise<Track[]> {
    return Array.from(store.values()).filter((track) =>
      track.albumId === albumId
    );
  }

  async delete(id: number): Promise<boolean> {
    return store.delete(id);
  }
}
