import { apiClient } from "./client";
import { DEFAULT_PAGE_SIZE } from "../config";
import { apiCache, cacheKeys } from "../lib/cache";
import type { Artist, Album, Track } from "../types";

interface GetArtistsParams {
  page?: number;
  limit?: number;
  name?: string;
}

// Simple response wrapper to maintain compatibility with components
interface ListResponse<T> {
  data: T[];
}

export async function getArtists(params: GetArtistsParams = {}): Promise<ListResponse<Artist>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE, name } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  if (name) queryParams.set("name", name);
  
  const cacheKey = cacheKeys.artists({ page, limit, name });
  
  const data = await apiCache.getOrFetch(
    cacheKey,
    () => apiClient<Artist[]>(`/artists?${queryParams}`),
    30 * 1000
  );
  
  return { data };
}

export async function getArtist(id: string): Promise<Artist> {
  const cacheKey = cacheKeys.artist(id);
  
  return apiCache.getOrFetch(
    cacheKey,
    () => apiClient<Artist>(`/artists/${id}`),
    60 * 1000
  );
}

export async function getArtistAlbums(id: string, params: GetArtistsParams = {}): Promise<ListResponse<Album>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  const cacheKey = cacheKeys.artistAlbums(id);
  
  const data = await apiCache.getOrFetch(
    cacheKey,
    () => apiClient<Album[]>(`/artists/${id}/albums?${queryParams}`),
    60 * 1000
  );
  
  return { data };
}

export async function getArtistTracks(id: string, params: GetArtistsParams = {}): Promise<ListResponse<Track>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  const cacheKey = cacheKeys.artistTracks(id);
  
  const data = await apiCache.getOrFetch(
    cacheKey,
    () => apiClient<Track[]>(`/artists/${id}/tracks?${queryParams}`),
    60 * 1000
  );
  
  return { data };
}
