import { apiClient } from "./client";
import { DEFAULT_PAGE_SIZE } from "../config";
import type { Artist, Album, Track } from "../types";

interface GetArtistsParams {
  page?: number;
  limit?: number;
}

// Simple response wrapper to maintain compatibility with components
interface ListResponse<T> {
  data: T[];
}

export async function getArtists(params: GetArtistsParams = {}): Promise<ListResponse<Artist>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  // Backend returns array directly
  const data = await apiClient<Artist[]>(`/artists?${queryParams}`);
  return { data };
}

export async function getArtist(id: string): Promise<Artist> {
  return apiClient<Artist>(`/artists/${id}`);
}

export async function getArtistAlbums(id: string, params: GetArtistsParams = {}): Promise<ListResponse<Album>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  // Backend returns array directly
  const data = await apiClient<Album[]>(`/artists/${id}/albums?${queryParams}`);
  return { data };
}

export async function getArtistTracks(id: string, params: GetArtistsParams = {}): Promise<ListResponse<Track>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  // Backend returns array directly
  const data = await apiClient<Track[]>(`/artists/${id}/tracks?${queryParams}`);
  return { data };
}
