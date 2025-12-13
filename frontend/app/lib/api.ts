// API client for Sonare backend

const API_BASE_URL = '/api';

// Types
export interface User {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    password: string;
}

// Pagination
export interface PaginationQuery {
    page: number;
    limit: number;
}

// Artist
export interface Artist {
    id: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

// Album
export interface Album {
    id: string;
    name: string;
    artistId?: string;
    artist?: Artist;
    thumbnail?: string;
    releaseYear?: number;
    createdAt?: string;
    updatedAt?: string;
}

// Track
export interface Track {
    id: string;
    name: string;
    path: string;
    duration: number;
    thumbnail: string;
    albumID: string;
    trackNumber?: number;
    album?: {
        id: string;
        name: string;
        artistID: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Playlist
export interface Playlist {
    id: string;
    name: string;
    userId: string;
    tracks?: Track[];
    createdAt?: string;
    updatedAt?: string;
}

// Search Results
export interface SearchResults {
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
    relatedTracks: Record<string, Track[]>;
}

// API Error class
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Token storage - SSR safe
const TOKEN_KEY = 'sonare_access_token';
const REFRESH_TOKEN_KEY = 'sonare_refresh_token';
const USER_KEY = 'sonare_user';

const isBrowser = typeof window !== 'undefined';

export const tokenStorage = {
    getAccessToken: (): string | null => {
        if (!isBrowser) return null;
        return localStorage.getItem(TOKEN_KEY);
    },
    setAccessToken: (token: string): void => {
        if (!isBrowser) return;
        localStorage.setItem(TOKEN_KEY, token);
    },
    getRefreshToken: (): string | null => {
        if (!isBrowser) return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },
    setRefreshToken: (token: string): void => {
        if (!isBrowser) return;
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },
    getUser: (): User | null => {
        if (!isBrowser) return null;
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },
    setUser: (user: User): void => {
        if (!isBrowser) return;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clear: (): void => {
        if (!isBrowser) return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};

// Generic fetch wrapper
async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth token if available
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
        let errorData: unknown = null;
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        if (isJson) {
            try {
                errorData = await response.json();
                if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
                    errorMessage = (errorData as { message: string }).message;
                }
            } catch {
                // Ignore JSON parse errors
            }
        }

        throw new ApiError(errorMessage, response.status, errorData);
    }

    if (isJson) {
        return response.json();
    }

    return {} as T;
}

// Auth API
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await fetchApi<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        // Store tokens and user
        tokenStorage.setAccessToken(response.accessToken);
        tokenStorage.setRefreshToken(response.refreshToken);
        tokenStorage.setUser(response.user);

        return response;
    },

    register: async (credentials: RegisterCredentials): Promise<User> => {
        const response = await fetchApi<User>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        return response;
    },

    refresh: async (): Promise<AuthResponse> => {
        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
            throw new ApiError('No refresh token available', 401);
        }

        const response = await fetchApi<AuthResponse>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });

        // Update stored tokens
        tokenStorage.setAccessToken(response.accessToken);
        tokenStorage.setRefreshToken(response.refreshToken);
        tokenStorage.setUser(response.user);

        return response;
    },

    logout: async (): Promise<void> => {
        const refreshToken = tokenStorage.getRefreshToken();

        if (refreshToken) {
            try {
                await fetchApi('/auth/logout', {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken }),
                });
            } catch {
                // Ignore logout errors - we'll clear local storage anyway
            }
        }

        tokenStorage.clear();
    },
};

// Artists API
export const artistsApi = {
    list: async (pagination: PaginationQuery): Promise<Artist[]> => {
        return fetchApi<Artist[]>(`/artists?page=${pagination.page}&limit=${pagination.limit}`);
    },

    get: async (id: string): Promise<Artist> => {
        return fetchApi<Artist>(`/artists/${id}`);
    },

    create: async (name: string): Promise<Artist> => {
        return fetchApi<Artist>('/artists', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    delete: async (id: string): Promise<void> => {
        await fetchApi(`/artists/${id}`, { method: 'DELETE' });
    },

    getAlbums: async (id: string, pagination: PaginationQuery): Promise<Album[]> => {
        return fetchApi<Album[]>(`/artists/${id}/albums?page=${pagination.page}&limit=${pagination.limit}`);
    },

    getTracks: async (id: string, pagination: PaginationQuery): Promise<Track[]> => {
        return fetchApi<Track[]>(`/artists/${id}/tracks?page=${pagination.page}&limit=${pagination.limit}`);
    },
};

// Albums API
export const albumsApi = {
    list: async (pagination: PaginationQuery): Promise<Album[]> => {
        return fetchApi<Album[]>(`/albums?page=${pagination.page}&limit=${pagination.limit}`);
    },

    get: async (id: string): Promise<Album> => {
        return fetchApi<Album>(`/albums/${id}`);
    },

    getTracks: async (id: string, pagination: PaginationQuery): Promise<Track[]> => {
        return fetchApi<Track[]>(`/albums/${id}/tracks?page=${pagination.page}&limit=${pagination.limit}`);
    },
};

// Tracks API
export interface TrackFilters {
    name?: string;
    artistID?: string;
    albumID?: string;
}

export const tracksApi = {
    list: async (pagination: PaginationQuery, filters?: TrackFilters): Promise<Track[]> => {
        const params = new URLSearchParams({
            page: String(pagination.page),
            limit: String(pagination.limit),
        });
        if (filters?.name) params.append('name', filters.name);
        if (filters?.artistID) params.append('artistID', filters.artistID);
        if (filters?.albumID) params.append('albumID', filters.albumID);

        return fetchApi<Track[]>(`/tracks?${params.toString()}`);
    },

    get: async (id: string): Promise<Track> => {
        return fetchApi<Track>(`/tracks/${id}`);
    },

    getFileUrl: async (id: string): Promise<{ url: string }> => {
        return fetchApi<{ url: string }>(`/tracks/${id}/file`);
    },

    getThumbnail: async (id: string): Promise<{ thumbnail: string | null }> => {
        return fetchApi<{ thumbnail: string | null }>(`/tracks/${id}/thumbnail`);
    },
};

// Playlists API
export const playlistsApi = {
    list: async (pagination: PaginationQuery): Promise<Playlist[]> => {
        return fetchApi<Playlist[]>(`/playlists?page=${pagination.page}&limit=${pagination.limit}`);
    },

    get: async (id: string): Promise<Playlist> => {
        return fetchApi<Playlist>(`/playlists/${id}`);
    },

    create: async (name: string, userID: string): Promise<Playlist> => {
        return fetchApi<Playlist>('/playlists', {
            method: 'POST',
            body: JSON.stringify({ name, userID }),
        });
    },

    delete: async (id: string): Promise<void> => {
        await fetchApi(`/playlists/${id}`, { method: 'DELETE' });
    },

    addTrack: async (playlistId: string, trackID: string): Promise<Playlist> => {
        return fetchApi<Playlist>(`/playlists/${playlistId}/tracks`, {
            method: 'PUT',
            body: JSON.stringify({ trackID }),
        });
    },

    removeTrack: async (playlistId: string, trackID: string): Promise<Playlist> => {
        return fetchApi<Playlist>(`/playlists/${playlistId}/tracks`, {
            method: 'DELETE',
            body: JSON.stringify({ trackID }),
        });
    },
};

// Me API (current user)
export const meApi = {
    get: async (): Promise<User> => {
        return fetchApi<User>('/me');
    },

    getPlaylists: async (pagination: PaginationQuery): Promise<Playlist[]> => {
        return fetchApi<Playlist[]>(`/me/playlists?page=${pagination.page}&limit=${pagination.limit}`);
    },

    getFavorites: async (): Promise<Track[]> => {
        return fetchApi<Track[]>('/me/favorites');
    },

    addFavorite: async (trackID: string): Promise<void> => {
        await fetchApi('/me/favorites', {
            method: 'PUT',
            body: JSON.stringify({ trackID }),
        });
    },

    removeFavorite: async (trackID: string): Promise<void> => {
        await fetchApi('/me/favorites', {
            method: 'DELETE',
            body: JSON.stringify({ trackID }),
        });
    },
};

// Search API
export const searchApi = {
    search: async (query: string, types?: string[]): Promise<SearchResults> => {
        const params = new URLSearchParams({ q: query });
        if (types && types.length > 0) {
            params.append('type', types.join(','));
        }
        return fetchApi<SearchResults>(`/search?${params.toString()}`);
    },
};

export default fetchApi;
