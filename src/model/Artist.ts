import * as z from "zod";

export interface Artist {
  id: number;
  name: string;
}

export const artistCreateSchema = z.object({
  name: z.string().min(1),
});
export const artistUpdateSchema = artistCreateSchema.partial();

export const artistSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type ArtistCreate = z.infer<typeof artistCreateSchema>;
export type ArtistUpdate = z.infer<typeof artistUpdateSchema>;
