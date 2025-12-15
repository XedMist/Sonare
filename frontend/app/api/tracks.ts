import { apiClient } from "./client";
import { DEFAULT_PAGE_SIZE } from "../config";
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

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
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
  
  // Backend returns paginated response
  const response = await apiClient<PaginatedResponse<Track>>(`/tracks?${queryParams}`);
  return { data: response.data };
}

export async function getTrack(id: string): Promise<Track> {
  return apiClient<Track>(`/tracks/${id}`);
}

// Get the audio file URL for a track (returns presigned URL from the API)
export async function getTrackAudioUrl(id: string): Promise<string> {
  const response = await apiClient<{ url: string }>(`/tracks/${id}/file`);
  return response.url;
}

// Fetch the thumbnail URL for a track (returns presigned URL from the API)
export async function fetchTrackThumbnail(id: string): Promise<string | null> {
  try {
    const response = await apiClient<{ thumbnail: string | null }>(`/tracks/${id}/thumbnail`);
    return response.thumbnail;
  } catch {
    return null;
  }
}
