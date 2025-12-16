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
    favoritosID?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Artist {
    id: string;
    name: string;
    image?: string | null;
    popularity?: number | null;
    genres?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Album {
    id: string;
    name: string;
    artistID: string;
    cover?: string;
    popularity?: number | null;
    createdAt: string;
    updatedAt: string;
    artist?: {
        id: string;
        name: string;
    };
}

export interface Track {
    id: string;
    path: string;
    name: string;
    duration: number;
    thumbnail: string;
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
    artists?: TrackArtist[];
}

export interface Lyrics {
    id: string;
    trackID: string;
    syncedLyrics: string | null;
    createdAt: string;
    updatedAt: string;
}

export type LyricsResponse = Lyrics;

export interface SyncedLyricLine {
    timestamp: number;
    text: string;
}

export type ArtistRole = 'PRIMARY' | 'FEATURED';

export interface TrackArtist {
    id: string;
    trackId: string;
    artistId: string;
    role: ArtistRole;
    artist?: Artist;
}

export interface Playlist {
    id: string;
    name: string;
    userID: string;
    createdAt: string;
    updatedAt: string;
    trackCount?: number;
    cover?: string;
    tracks?: Track[];
    user?: User;
}

export interface PlaylistTrack {
    id: string;
    playlistId: string;
    trackId: string;
    position: number | null;
    addedAt: string;
}

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

export interface PlayerTrack extends Track {
    audioUrl: string;
}

export type RepeatMode = 'off' | 'all' | 'one';
