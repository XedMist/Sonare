import * as z from "zod";

export interface Track {
  id: number;
  path: string;
  name: string;
  duration: number; // seconds
  thumbnail?: string | null;
}

export const trackCreateSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  duration: z.number().min(1),
  thumbnail: z.string().nullable().optional(),
});

export const trackUpdateSchema = trackCreateSchema.partial();

export const trackSchema = z.object({
  id: z.number(),
  path: z.string().min(1),
  name: z.string().min(1),
  duration: z.number().min(1),
  thumbnail: z.string().nullable().optional(),
});

export type TrackCreate = z.infer<typeof trackCreateSchema>;
export type TrackUpdate = z.infer<typeof trackUpdateSchema>;
