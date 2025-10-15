import * as z from "zod";

// La interfaz del tipo Playlist
export interface Playlist {
  id: number;
  name: string;
  userId: number;
}

export const playlistCreateSchema = z.object({
  name: z.string().min(1),
  userId: z.number().min(1),
  tracksIds: z.array(z.number()).default([]),
});

export const playlistUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  trackIds: z.array(z.number().int().positive()).optional(),
});

export const playlistIdSchema = z.object({ id: z.number().int().positive() });

export type CreatePlaylist = z.infer<typeof playlistCreateSchema>;
export type UpdatePlaylist = z.infer<typeof playlistUpdateSchema>;
