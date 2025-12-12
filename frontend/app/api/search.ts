import { apiClient } from "./client";
import type { Artist, Album, Track } from "../types";

export interface SearchResults {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
  relatedTracks: Record<string, Track[]>;
}

export type SearchType = "artist" | "album" | "track";

/**
 * Search for artists, albums, and tracks using the unified search endpoint.
 * @param query - Search query (minimum 3 characters)
 * @param types - Array of types to search for (default: all)
 */
export async function search(
  query: string,
  types: SearchType[] = ["artist", "album", "track"]
): Promise<SearchResults> {
  if (query.length < 3) {
    return { artists: [], albums: [], tracks: [], relatedTracks: {} };
  }

  const queryParams = new URLSearchParams({
    q: query,
    type: types.join(","),
  });

  return apiClient<SearchResults>(`/search?${queryParams}`);
}
