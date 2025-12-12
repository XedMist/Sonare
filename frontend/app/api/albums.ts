import { apiClient } from "./client";
import { DEFAULT_PAGE_SIZE } from "../config";
import type { Album, Track } from "../types";

interface GetAlbumsParams {
  page?: number;
  limit?: number;
}

// Simple response wrapper to maintain compatibility with components
interface ListResponse<T> {
  data: T[];
}

export async function getAlbums(params: GetAlbumsParams = {}): Promise<ListResponse<Album>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  // Backend returns array directly
  const data = await apiClient<Album[]>(`/albums?${queryParams}`);
  return { data };
}

export async function getAlbum(id: string): Promise<Album> {
  return apiClient<Album>(`/albums/${id}`);
}

export async function getAlbumTracks(id: string, params: GetAlbumsParams = {}): Promise<ListResponse<Track>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  // Backend returns array directly
  const data = await apiClient<Track[]>(`/albums/${id}/tracks?${queryParams}`);
  return { data };
}
