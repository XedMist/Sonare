import { z } from 'zod';

// Track DTOs
const TrackAlbumSchema = z.object({
  id: z.string(),
  name: z.string(),
  cover: z.string().nullable().optional(),
  artistID: z.string(),
});

export const TrackResponseSchema = z.object({
  id: z.string(),
  path: z.string(),
  name: z.string(),
  duration: z.number(),
  thumbnail: z.string(),
  // Spotify metadata
  popularity: z.number().nullable().optional(),
  albumID: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  album: TrackAlbumSchema.optional(),
});

export const TrackWithAlbumResponseSchema = TrackResponseSchema.extend({
  album: TrackAlbumSchema,
});

export const TrackCreateSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1).max(200),
  duration: z.number().min(0),
  thumbnail: z.string(),
  albumID: z.string(),
});

export const TrackUpdateSchema = z.object({
  path: z.string().min(1).optional(),
  name: z.string().min(1).max(200).optional(),
  duration: z.number().min(0).optional(),
  thumbnail: z.string().optional(),
  albumID: z.string().optional(),
});

export type TrackResponse = z.infer<typeof TrackResponseSchema>;
export type TrackWithAlbumResponse = z.infer<typeof TrackWithAlbumResponseSchema>;
export type TrackCreate = z.infer<typeof TrackCreateSchema>;
export type TrackUpdate = z.infer<typeof TrackUpdateSchema>;
