import { publicApiClient, tokenStorage } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "../types";

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await publicApiClient<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });

    tokenStorage.setAccessToken(response.accessToken);
    tokenStorage.setRefreshToken(response.refreshToken);

    return response;
}

export async function register(data: RegisterRequest): Promise<User> {
    const response = await publicApiClient<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await publicApiClient<AuthResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
    });

    tokenStorage.setAccessToken(response.accessToken);
    if (response.refreshToken) {
        tokenStorage.setRefreshToken(response.refreshToken);
    }

    return response;
}

export async function logout(): Promise<void> {
    const refreshTokenValue = tokenStorage.getRefreshToken();

    if (refreshTokenValue) {
        try {
            await publicApiClient("/auth/logout", {
                method: "POST",
                body: JSON.stringify({ refreshToken: refreshTokenValue }),
            });
        } catch {
            // Ignore errors 
        }
    }

    tokenStorage.clearTokens();
}
