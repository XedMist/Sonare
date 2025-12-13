// Type definitions for the frontend

// User types
export interface User {
    id: string;
    name: string;
    roleID: string;
    createdAt: string;
    updatedAt: string;
}

// Artist types
export interface Artist {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

// Album types
export interface Album {
    id: string;
    name: string;
    artistID: string;
    createdAt: string;
    updatedAt: string;
    artist?: {
        id: string;
        name: string;
    };
}

// Track types
export interface Track {
    id: string;
    path: string;
    name: string;
    duration: number;
    thumbnail: string;
    albumID: string;
    createdAt: string;
    updatedAt: string;
    album?: {
        id: string;
        name: string;
        artistID: string;
    };
}

// Playlist types
export interface Playlist {
    id: string;
    name: string;
    userID: string;
    createdAt: string;
    updatedAt: string;
    tracks?: Track[];
}

export interface PlaylistTrack {
    id: string;
    playlistId: string;
    trackId: string;
    position: number | null;
    addedAt: string;
}

// Auth types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// API Response types
export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    status: number;
}

// Player types
export interface PlayerTrack extends Track {
    audioUrl: string;
}

export type RepeatMode = 'off' | 'all' | 'one';
