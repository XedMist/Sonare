import { apiClient } from "./client";
import { DEFAULT_PAGE_SIZE } from "../config";
import type { Playlist, Track, PaginatedResponse } from "../types";

interface GetPlaylistsParams {
  page?: number;
  limit?: number;
}

// Simple response wrapper to maintain compatibility with components
interface ListResponse<T> {
  data: T[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export async function getPlaylists(params: GetPlaylistsParams = {}): Promise<ListResponse<Playlist>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  const response = await apiClient<PaginatedResponse<Playlist>>(`/playlists?${queryParams}`);
  return {
    data: response.data ?? [],
    page: response.page,
    limit: response.limit,
    total: response.total,
    totalPages: response.totalPages,
  };
}

export async function getPlaylist(id: string): Promise<Playlist> {
  // Backend returns playlist without tracks - fetch them separately
  return apiClient<Playlist>(`/playlists/${id}`);
}

// Fetch tracks for a playlist (new endpoint)
export async function getPlaylistTracks(id: string): Promise<Track[]> {
  return apiClient<Track[]>(`/playlists/${id}/tracks`);
}

// Combined helper to get playlist with tracks
export async function getPlaylistWithTracks(id: string): Promise<{ playlist: Playlist; tracks: Track[] }> {
  const [playlist, tracks] = await Promise.all([
    getPlaylist(id),
    getPlaylistTracks(id),
  ]);
  return { playlist, tracks };
}

// Backend expects only { name } - userID is derived from JWT
export async function createPlaylist(data: { name: string; userID: string }): Promise<Playlist> {
  return apiClient<Playlist>("/playlists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePlaylist(id: string, data: { name: string }): Promise<Playlist> {
  return apiClient<Playlist>(`/playlists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePlaylist(id: string): Promise<void> {
  await apiClient(`/playlists/${id}`, {
    method: "DELETE",
  });
}

// Backend: PUT /:id/tracks with { trackID } - adds one track at a time
export async function addTrackToPlaylist(
  playlistId: string, 
  trackId: string
): Promise<Playlist> {
  return apiClient<Playlist>(`/playlists/${playlistId}/tracks`, {
    method: "PUT",
    body: JSON.stringify({ trackID: trackId }),
  });
}

// Helper to add multiple tracks sequentially
export async function addTracksToPlaylist(
  playlistId: string, 
  trackIds: string[]
): Promise<Playlist> {
  let result: Playlist | null = null;
  for (const trackId of trackIds) {
    result = await addTrackToPlaylist(playlistId, trackId);
  }
  // Return final playlist state, or fetch if empty
  if (!result) {
    result = await getPlaylist(playlistId);
  }
  return result;
}

// Backend: DELETE /:id/tracks with { trackID } in body
export async function removeTrackFromPlaylist(
  playlistId: string, 
  trackId: string
): Promise<void> {
  await apiClient(`/playlists/${playlistId}/tracks`, {
    method: "DELETE",
    body: JSON.stringify({ trackID: trackId }),
  });
}
