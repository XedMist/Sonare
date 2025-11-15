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
  password: string;
  roleID: string;
  role?: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Artist {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Album {
  id: string;
  name: string;
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
  albumID: string;
  album?: Album;
  createdAt: Date;
  updatedAt: Date;
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
