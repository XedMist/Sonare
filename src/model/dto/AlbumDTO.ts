import { z } from 'zod';

// Album DTOs
export const AlbumResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  artistID: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AlbumWithArtistResponseSchema = AlbumResponseSchema.extend({
  artist: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const AlbumCreateSchema = z.object({
  name: z.string().min(1).max(100),
  artistID: z.string(),
});

export const AlbumUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  artistID: z.string().optional(),
});

export type AlbumResponse = z.infer<typeof AlbumResponseSchema>;
export type AlbumWithArtistResponse = z.infer<typeof AlbumWithArtistResponseSchema>;
export type AlbumCreate = z.infer<typeof AlbumCreateSchema>;
export type AlbumUpdate = z.infer<typeof AlbumUpdateSchema>;
