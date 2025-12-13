import { publicApiClient, apiClient, tokenStorage } from "./client";
import type { AuthTokens, LoginRequest, RegisterRequest, User } from "../types";

// Backend returns { accessToken, refreshToken } - no user object
export async function login(credentials: LoginRequest): Promise<AuthTokens> {
    // Backend expects { username, password }
    const response = await publicApiClient<AuthTokens>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
        }),
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

export async function getProfile(): Promise<User> {
    return apiClient<User>("/me");
}

// Refresh returns only { accessToken } per backend
export async function refreshToken(refreshTokenValue: string): Promise<{ accessToken: string }> {
    const response = await publicApiClient<{ accessToken: string }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    tokenStorage.setAccessToken(response.accessToken);

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
