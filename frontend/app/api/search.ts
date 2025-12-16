import { apiClient } from "./client";
import type { Artist, Album, Track } from "../types";

export interface SearchResults {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
  relatedTracks: Record<string, Track[]>;
}

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

export async function search(query: string, type: string = "artist,album,track", signal?: AbortSignal): Promise<SearchResults> {
  const queryParams = new URLSearchParams({
    q: query,
    type: type,
  });

  return apiClient<SearchResults>(`/search?${queryParams}`, { 
    signal,
    headers: {
      "Accept": "application/vnd.sonare.search-v1+json"
    }
  });
}

export async function searchUnified(query: string, signal?: AbortSignal): Promise<UnifiedSearchResponse> {
  const queryParams = new URLSearchParams({
    q: query,
  });
  return apiClient<UnifiedSearchResponse>(`/search?${queryParams}`, {
    signal,
    headers: {
      "Accept": "application/vnd.sonare.search-v2+json"
    }
  });
}
