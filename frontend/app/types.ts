// Type definitions for the frontend

// User types
export interface User {
    id: string;
    name: string;
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    country?: string | null;
    birthdate?: string | null;
    avatarUrl?: string | null;
    roleID: string;
    createdAt: string;
    updatedAt: string;
}

// Artist types
export interface Artist {
    id: string;
    name: string;
    // Spotify metadata
    image?: string | null;
    popularity?: number | null;
    genres?: string[];
    createdAt: string;
    updatedAt: string;
}

// Album types
export interface Album {
    id: string;
    name: string;
    artistID: string;
    cover?: string;
    // Spotify metadata
    popularity?: number | null;
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
    // Spotify metadata
    popularity?: number | null;
    spotifyId?: string | null;
    albumID?: string | null;
    artistID?: string;
    createdAt: string;
    updatedAt: string;
    album?: {
        id: string;
        name: string;
        artistID: string;
        cover?: string | null;
    };
    // All artists on this track
    artists?: TrackArtist[];
}

// Track-Artist relationship
export type ArtistRole = 'PRIMARY' | 'FEATURED';

export interface TrackArtist {
    id: string;
    trackId: string;
    artistId: string;
    role: ArtistRole;
    artist?: Artist;
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
    displayName: string;
    firstName: string;
    lastName: string;
    bio?: string;
    country?: string;
    birthdate?: string;
}

export interface UserProfileUpdateRequest {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    country?: string;
    birthdate?: string;
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
