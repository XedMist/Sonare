import * as z from "zod";

// La interfaz del tipo Playlist
export interface Playlist {
  id: number;
  name: string;
  userId: number;
  trackIds: number[];
}

// El esquema para validar el cuerpo de los POST
export const playlistSchema = z.object({
  id: z.number(),
  name: z.string(),
  userId: z.number(),
  trackIds: z.array(z.number()).default([]),
});
