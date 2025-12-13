import { z } from 'zod';

// Artist DTOs
export const ArtistResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Spotify metadata
  image: z.string().nullable().optional(),
  popularity: z.number().nullable().optional(),
  genres: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ArtistCreateSchema = z.object({
  name: z.string().min(1).max(100),
});

export const ArtistUpdateSchema = z.object({
  name: z.string().min(1).max(100),
});

export type ArtistResponse = z.infer<typeof ArtistResponseSchema>;
export type ArtistCreate = z.infer<typeof ArtistCreateSchema>;
export type ArtistUpdate = z.infer<typeof ArtistUpdateSchema>;
