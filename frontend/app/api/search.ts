import { apiClient } from "./client";
import type { Artist, Album, Track } from "../types";

export interface SearchResponse {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
  relatedTracks: Record<string, Track[]>;
}

// Unified search item types
export type SearchItemType = 'artist' | 'album' | 'track';

export interface UnifiedSearchItem {
  type: SearchItemType;
  id: string;
  name: string;
  score: number;
  artist?: Artist;
  album?: Album;
  track?: Track;
}

export interface UnifiedSearchResponse {
  items: UnifiedSearchItem[];
  relatedTracks: Record<string, Track[]>;
}

export async function search(query: string, type: string = "artist,album,track"): Promise<SearchResponse> {
  const queryParams = new URLSearchParams({
    q: query,
    type: type,
  });
  return apiClient<SearchResponse>(`/search?${queryParams}`);
}

export async function searchUnified(query: string): Promise<UnifiedSearchResponse> {
  const queryParams = new URLSearchParams({
    q: query,
  });
  return apiClient<UnifiedSearchResponse>(`/search/unified?${queryParams}`);
}
