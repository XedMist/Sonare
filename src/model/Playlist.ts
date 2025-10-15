import * as z from "zod";

export interface Playlist {
  id: number;
  name: string;
  userId: number;
}

export interface PlaylistDTO {
  id: number;
  name: string;
  userId: number;
  trackIds: number[];
}

export const playlistCreateSchema = z.object({
  name: z.string().min(1),
  userId: z.number().min(1),
  trackIds: z.array(z.number()).default([]),
});

export const playlistUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  trackIds: z.array(z.number().int().positive()).optional(),
});

export const playlistDTOSchema = z.object({
  id: z.number(),
  name: z.string(),
  userId: z.number(),
  trackIds: z.array(z.number()),
});

export const playlistSchema = z.object({
  id: z.number(),
  name: z.string(),
  userId: z.number(),
});

export const playlistIdSchema = z.object({ id: z.number().int().positive() });

export type CreatePlaylist = z.infer<typeof playlistCreateSchema>;
export type UpdatePlaylist = z.infer<typeof playlistUpdateSchema>;
