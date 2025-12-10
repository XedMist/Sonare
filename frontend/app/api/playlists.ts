import { apiClient } from "./client";
import { DEFAULT_PAGE_SIZE } from "../config";
import type { Playlist } from "../types";

interface GetPlaylistsParams {
  page?: number;
  limit?: number;
}

// Simple response wrapper to maintain compatibility with components
interface ListResponse<T> {
  data: T[];
}

export async function getPlaylists(params: GetPlaylistsParams = {}): Promise<ListResponse<Playlist>> {
  const { page = 0, limit = DEFAULT_PAGE_SIZE } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  // Backend returns array directly
  const data = await apiClient<Playlist[]>(`/playlists?${queryParams}`);
  return { data };
}

export async function getPlaylist(id: string): Promise<Playlist> {
  return apiClient<Playlist>(`/playlists/${id}`);
}

export async function createPlaylist(data: { name: string; userID: string }): Promise<Playlist> {
  return apiClient<Playlist>("/playlists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deletePlaylist(id: string): Promise<void> {
  await apiClient(`/playlists/${id}`, {
    method: "DELETE",
  });
}

// Placeholder endpoints for future backend support
export async function addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
  // TODO: Implement when backend endpoint is available
  console.warn("addTrackToPlaylist is not yet implemented on the backend");
  throw new Error("Not implemented: addTrackToPlaylist");
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  // TODO: Implement when backend endpoint is available
  console.warn("removeTrackFromPlaylist is not yet implemented on the backend");
  throw new Error("Not implemented: removeTrackFromPlaylist");
}
