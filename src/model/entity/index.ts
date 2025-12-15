export enum Capability {
  READ = 'READ',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
  UPDATE = 'UPDATE'
}

export interface Permission {
  id: string;
  capability: Capability;
  resource: string;
  rolesID: string[];
}

export interface Role {
  id: string;
  name: string;
  permissionsID: string[];
  permissions?: Permission[];
}

export interface User {
  id: string;
  name: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  country?: string | null;
  birthdate?: Date | null;
  avatarObjectKey?: string | null;
  avatarUrl?: string | null;
  password: string;
  roleID: string;
  role?: Role;
  createdAt: Date;
  updatedAt: Date;
  favoritosID?: string;
}

export interface Artist {
  id: string;
  name: string;
  // Spotify metadata
  image?: string | null;
  popularity?: number | null;
  genres?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Album {
  id: string;
  name: string;
  cover?: string | null;
  // Spotify metadata
  popularity?: number | null;
  artistID: string;
  artist?: Artist;
  createdAt: Date;
  updatedAt: Date;
}

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
  album?: Album;
  artistID?: string;
  artist?: Artist;
  // All artists on this track
  artists?: TrackArtist[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lyrics {
    id: string;
    trackID: string;
    syncedLyrics: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SyncedLyricLine {
    timestamp: number; // in milliseconds
    text: string;
}

export enum ArtistRole {
  PRIMARY = 'PRIMARY',
  FEATURED = 'FEATURED'
}

export interface TrackArtist {
  id: string;
  trackId: string;
  artistId: string;
  role: ArtistRole;
  track?: Track;
  artist?: Artist;
}

export interface Playlist {
  id: string;
  name: string;
  userID: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistTrack {
  id: string;
  playlistId: string;
  trackId: string;
  position: number | null;
  addedAt: Date;
  playlist?: Playlist;
  track?: Track;
}
