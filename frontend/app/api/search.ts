import { apiClient } from "./client";
import type { Artist, Album, Track } from "../types";

export interface SearchResponse {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
  relatedTracks: Record<string, Track[]>;
}

export async function search(query: string, type: string = "artist,album,track"): Promise<SearchResponse> {
  const queryParams = new URLSearchParams({
    q: query,
    type: type,
  });
  return apiClient<SearchResponse>(`/search?${queryParams}`);
}
