import type { 
  User as PrismaUser, 
  Artist as PrismaArtist, 
  Album as PrismaAlbum, 
  Track as PrismaTrack,
  Playlist as PrismaPlaylist,
  PlaylistTrack as PrismaPlaylistTrack,
  Role as PrismaRole,
  Permision as PrismaPermission
} from '@/generated/prisma/client.ts';

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
      displayName: prisma.displayName ?? null,
      firstName: prisma.firstName ?? null,
      lastName: prisma.lastName ?? null,
      bio: prisma.bio ?? null,
      country: prisma.country ?? null,
      birthdate: prisma.birthdate ?? null,
      avatarObjectKey: prisma.avatarObjectKey ?? null,
      password: prisma.password,
      roleID: prisma.roleID,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      favoritosID: prisma.favoritosID ?? undefined,
    };
  }

  static toArtist(prisma: PrismaArtist): Artist {
    return {
      id: prisma.id,
      name: prisma.name,
      image: prisma.image,
      popularity: prisma.popularity,
      genres: prisma.genres,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };
  }

  static toAlbum(prisma: PrismaAlbum): Album {
    return {
      id: prisma.id,
      name: prisma.name,
      cover: prisma.cover,
      popularity: prisma.popularity,
      artistID: prisma.artistID,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };
  }

  static toTrack(prisma: PrismaTrack & { album?: PrismaAlbum | null }): Track {
    return {
      id: prisma.id,
      path: prisma.path,
      name: prisma.name,
      duration: prisma.duration,
      thumbnail: prisma.thumbnail,
      popularity: prisma.popularity,
      spotifyId: prisma.spotifyId,
      albumID: prisma.albumID ?? undefined,
      album: prisma.album ? PrismaMapper.toAlbum(prisma.album) : undefined,
      artistID: prisma.artistID,
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
      displayName: entity.displayName ?? null,
      firstName: entity.firstName ?? null,
      lastName: entity.lastName ?? null,
      bio: entity.bio ?? null,
      country: entity.country ?? null,
      birthdate: entity.birthdate ?? null,
      avatarUrl: entity.avatarUrl ?? null,
      roleID: entity.roleID,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toArtistResponse(entity: Artist): ArtistResponse {
    return {
      id: entity.id,
      name: entity.name,
      image: entity.image,
      popularity: entity.popularity,
      genres: entity.genres,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toAlbumResponse(entity: Album): AlbumResponse {
    return {
      id: entity.id,
      name: entity.name,
      cover: entity.cover,
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
      albumID: entity.albumID ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      album: entity.album
        ? {
            id: entity.album.id,
            name: entity.album.name,
            cover: entity.album.cover ?? undefined,
            artistID: entity.album.artistID,
          }
        : undefined,
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
