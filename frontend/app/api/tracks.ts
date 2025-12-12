import { apiClient, tokenStorage } from "./client";
import { API_BASE_URL, DEFAULT_PAGE_SIZE } from "../config";
import type { Track } from "../types";

interface GetTracksParams {
  page?: number;
  limit?: number;
  name?: string;
  albumID?: string;
  artistID?: string;
}

// Simple response wrapper to maintain compatibility with components
interface ListResponse<T> {
  data: T[];
}

export async function getTracks(params: GetTracksParams = {}): Promise<ListResponse<Track>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE, name, albumID, artistID } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  if (name) queryParams.set("name", name);
  if (albumID) queryParams.set("albumID", albumID);
  if (artistID) queryParams.set("artistID", artistID);
  
  // Backend returns array directly
  const data = await apiClient<Track[]>(`/tracks?${queryParams}`);
  return { data };
}

export async function getTrack(id: string): Promise<Track> {
  return apiClient<Track>(`/tracks/${id}`);
}

// Get the audio file URL for a track (with token as query param for authenticated access)
export function getTrackAudioUrl(id: string): string {
  const token = tokenStorage.getAccessToken();
  const url = `${API_BASE_URL}/tracks/${id}/file`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}

// Get the thumbnail image URL for a track (no auth required)
export function getTrackThumbnailUrl(id: string): string {
  return `${API_BASE_URL}/tracks/${id}/thumbnail`;
}
