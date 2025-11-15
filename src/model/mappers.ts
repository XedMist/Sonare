import type { 
  User as PrismaUser, 
  Artist as PrismaArtist, 
  Album as PrismaAlbum, 
  Track as PrismaTrack,
  Playlist as PrismaPlaylist,
  PlaylistTrack as PrismaPlaylistTrack,
  Role as PrismaRole,
  Permision as PrismaPermission
} from '../generated/prisma/index.js';

import type {
  User,
  Artist,
  Album,
  Track,
  Playlist,
  PlaylistTrack,
  Role,
  Permission,
  Capability
} from './entity/index.ts';

import type {
  UserResponse,
  ArtistResponse,
  AlbumResponse,
  TrackResponse,
  PlaylistResponse,
  PlaylistTrackResponse,
  RoleResponse,
  PermissionResponse
} from './dto/index.ts';

// Prisma to Entity Mappers
export class PrismaMapper {
  static toUser(prisma: PrismaUser): User {
    return {
      id: prisma.id,
      name: prisma.name,
      password: prisma.password,
      roleID: prisma.roleID,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };
  }

  static toArtist(prisma: PrismaArtist): Artist {
    return {
      id: prisma.id,
      name: prisma.name,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };
  }

  static toAlbum(prisma: PrismaAlbum): Album {
    return {
      id: prisma.id,
      name: prisma.name,
      artistID: prisma.artistID,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };
  }

  static toTrack(prisma: PrismaTrack): Track {
    return {
      id: prisma.id,
      path: prisma.path,
      name: prisma.name,
      duration: prisma.duration,
      thumbnail: prisma.thumbnail,
      albumID: prisma.albumID,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };
  }

  static toPlaylist(prisma: PrismaPlaylist): Playlist {
    return {
      id: prisma.id,
      name: prisma.name,
      userID: prisma.userID,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };
  }

  static toPlaylistTrack(prisma: PrismaPlaylistTrack): PlaylistTrack {
    return {
      id: prisma.id,
      playlistId: prisma.playlistId,
      trackId: prisma.trackId,
      position: prisma.position,
      addedAt: prisma.addedAt,
    };
  }

  static toRole(prisma: PrismaRole): Role {
    return {
      id: prisma.id,
      name: prisma.name,
      permissionsID: prisma.permisionsID,
    };
  }

  static toPermission(prisma: PrismaPermission): Permission {
    return {
      id: prisma.id,
      capability: prisma.capability as Capability,
      resource: prisma.resource,
      rolesID: prisma.rolesID,
    };
  }
}

// Entity to DTO Response Mappers
export class DTOMapper {
  static toUserResponse(entity: User): UserResponse {
    return {
      id: entity.id,
      name: entity.name,
      roleID: entity.roleID,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toArtistResponse(entity: Artist): ArtistResponse {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toAlbumResponse(entity: Album): AlbumResponse {
    return {
      id: entity.id,
      name: entity.name,
      artistID: entity.artistID,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toTrackResponse(entity: Track): TrackResponse {
    return {
      id: entity.id,
      path: entity.path,
      name: entity.name,
      duration: entity.duration,
      thumbnail: entity.thumbnail,
      albumID: entity.albumID,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPlaylistResponse(entity: Playlist): PlaylistResponse {
    return {
      id: entity.id,
      name: entity.name,
      userID: entity.userID,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPlaylistTrackResponse(entity: PlaylistTrack): PlaylistTrackResponse {
    return {
      id: entity.id,
      playlistId: entity.playlistId,
      trackId: entity.trackId,
      position: entity.position,
      addedAt: entity.addedAt,
    };
  }

  static toRoleResponse(entity: Role): RoleResponse {
    return {
      id: entity.id,
      name: entity.name,
      permissionsID: entity.permissionsID,
    };
  }

  static toPermissionResponse(entity: Permission): PermissionResponse {
    return {
      id: entity.id,
      capability: entity.capability,
      resource: entity.resource,
      rolesID: entity.rolesID,
    };
  }
}
