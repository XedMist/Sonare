import { apiClient } from "./client";
import type { User, UserProfileUpdateRequest } from "../types";

export async function updateProfile(data: UserProfileUpdateRequest): Promise<User> {
  return apiClient<User>("/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", file);

  return apiClient<User>("/me/avatar", {
    method: "PUT",
    body: formData,
  });
}

export async function getFavorites(): Promise<import("../types").Track[]> {
  return apiClient<import("../types").Track[]>("/me/favorites");
}

export async function addToFavorites(trackID: string): Promise<void> {
  return apiClient("/me/favorites", {
    method: "POST",
    body: JSON.stringify({ trackID }),
  });
}

export async function removeFromFavorites(trackID: string): Promise<void> {
  return apiClient(`/me/favorites/${trackID}`, {
    method: "DELETE",
  });
}
