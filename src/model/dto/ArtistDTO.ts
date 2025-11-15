import { z } from 'zod';

// Artist DTOs
export const ArtistResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
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
