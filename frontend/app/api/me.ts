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
    method: "POST",
    body: formData,
  });
}
