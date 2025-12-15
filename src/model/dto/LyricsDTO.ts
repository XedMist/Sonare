import { z } from "zod";

export interface LyricsResponse {
    id: string;
    trackID: string;
    syncedLyrics: string | null;
    createdAt: string;
    updatedAt: string;
}

export const LyricsCreateSchema = z.object({
    trackID: z.string().min(1),
    syncedLyrics: z.string().nullable(),
});

export const LyricsUpdateSchema = z.object({
    syncedLyrics: z.string().nullable(),
});