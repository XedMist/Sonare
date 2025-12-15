import { z } from 'zod';
import { UserResponseSchema } from './UserDTO.js';

// Playlist DTOs
export const PlaylistResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  userID: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  trackCount: z.number().optional(),
  cover: z.string().optional(),
  user: UserResponseSchema.optional(),
});

export const PlaylistCreateSchema = z.object({
  name: z.string().min(1).max(100),
  userID: z.string(),
});

export const PlaylistUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

// PlaylistTrack DTOs
export const PlaylistTrackResponseSchema = z.object({
  id: z.string(),
  playlistId: z.string(),
  trackId: z.string(),
  position: z.number().nullable(),
  addedAt: z.date(),
});

export const PlaylistTrackCreateSchema = z.object({
  playlistId: z.string(),
  trackId: z.string(),
  position: z.number().nullable().optional(),
});

export const PlaylistTrackActionSchema = z.object({
  trackID: z.string(),
});

export type PlaylistResponse = z.infer<typeof PlaylistResponseSchema>;
export type PlaylistCreate = z.infer<typeof PlaylistCreateSchema>;
export type PlaylistUpdate = z.infer<typeof PlaylistUpdateSchema>;
export type PlaylistTrackResponse = z.infer<typeof PlaylistTrackResponseSchema>;
export type PlaylistTrackCreate = z.infer<typeof PlaylistTrackCreateSchema>;
export type PlaylistTrackAction = z.infer<typeof PlaylistTrackActionSchema>;
