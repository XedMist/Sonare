import { apiClient } from "./client";
import type { LyricsResponse } from "../types";

export async function getLyrics(trackID: string): Promise<LyricsResponse> {
    return apiClient<LyricsResponse>(`/lyrics/${trackID}`);
}
