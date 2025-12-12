import { apiClient } from "./client";
import { DEFAULT_PAGE_SIZE } from "../config";
import { apiCache, cacheKeys } from "../lib/cache";
import type { Album, Track } from "../types";

interface GetAlbumsParams {
  page?: number;
  limit?: number;
  name?: string;
  artistID?: string;
}

// Simple response wrapper to maintain compatibility with components
interface ListResponse<T> {
  data: T[];
}

export async function getAlbums(params: GetAlbumsParams = {}): Promise<ListResponse<Album>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE, name, artistID } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  if (name) queryParams.set("name", name);
  if (artistID) queryParams.set("artistID", artistID);
  
  const cacheKey = cacheKeys.albums({ page, limit, name, artistID });
  
  // Use cache for album lists (30 second TTL)
  const data = await apiCache.getOrFetch(
    cacheKey,
    () => apiClient<Album[]>(`/albums?${queryParams}`),
    30 * 1000
  );
  
  return { data };
}

export async function getAlbum(id: string): Promise<Album> {
  const cacheKey = cacheKeys.album(id);
  
  return apiCache.getOrFetch(
    cacheKey,
    () => apiClient<Album>(`/albums/${id}`),
    60 * 1000 // 1 minute cache for individual albums
  );
}

export async function getAlbumTracks(id: string, params: GetAlbumsParams = {}): Promise<ListResponse<Track>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  const cacheKey = cacheKeys.albumTracks(id);
  
  const data = await apiCache.getOrFetch(
    cacheKey,
    () => apiClient<Track[]>(`/albums/${id}/tracks?${queryParams}`),
    60 * 1000
  );
  
  return { data };
}
