import { API_BASE_URL } from "../config";
import type { ApiError } from "../types";

// Token storage keys
const ACCESS_TOKEN_KEY = "sonare_access_token";
const REFRESH_TOKEN_KEY = "sonare_refresh_token";

// Token management
export const tokenStorage = {
    getAccessToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },
    setAccessToken: (token: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },
    getRefreshToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },
    setRefreshToken: (token: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },
    clearTokens: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};

// Custom error class for API errors
export class ApiClientError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiClientError";
        this.status = status;
    }
}

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Refresh the access token
async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            tokenStorage.clearTokens();
            return null;
        }

        const data = await response.json();
        tokenStorage.setAccessToken(data.accessToken);
        if (data.refreshToken) {
            tokenStorage.setRefreshToken(data.refreshToken);
        }
        return data.accessToken;
    } catch {
        tokenStorage.clearTokens();
        return null;
    }
}

// Authenticated fetch wrapper
export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    const makeRequest = async (token: string | null): Promise<Response> => {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }

        return fetch(url, {
            ...options,
            headers,
        });
    };

    let accessToken = tokenStorage.getAccessToken();
    let response = await makeRequest(accessToken);

    if (response.status === 401 && tokenStorage.getRefreshToken()) {
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = refreshAccessToken();
        }

        const newToken = await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        if (newToken) {
            response = await makeRequest(newToken);
        } else {
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
            throw new ApiClientError("Session expired. Please log in again.", 401);
        }
    }

    if (!response.ok) {
        let errorMessage = "An error occurred";
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            errorMessage = response.statusText || errorMessage;
        }
        throw new ApiClientError(errorMessage, response.status);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;

    try {
        return JSON.parse(text) as T;
    } catch {
        return text as unknown as T;
    }
}

// Unauthenticated fetch for public endpoints
export async function publicApiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        let errorMessage = "An error occurred";
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            errorMessage = response.statusText || errorMessage;
        }
        throw new ApiClientError(errorMessage, response.status);
    }

    const text = await response.text();
    if (!text) return {} as T;

    try {
        return JSON.parse(text) as T;
    } catch {
        return text as unknown as T;
    }
}
