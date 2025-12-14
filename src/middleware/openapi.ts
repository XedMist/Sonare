const paginationParams = [
  {
    name: "page",
    in: "query",
    description: "Zero-based page offset",
    schema: { type: "integer", minimum: 0, default: 0 },
  },
  {
    name: "limit",
    in: "query",
    description: "Result size (1-100)",
    schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
] as const;

const trackFilterParams = [
  ...paginationParams,
  {
    name: "name",
    in: "query",
    description: "Track name filter (case insensitive contains)",
    schema: { type: "string" },
  },
  {
    name: "artistID",
    in: "query",
    description: "Filter by artist id",
    schema: { type: "string" },
  },
  {
    name: "albumID",
    in: "query",
    description: "Filter by album id",
    schema: { type: "string" },
  },
] as const;

export const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Sonare API",
    version: "1.2.0",
    description: "REST API documentation for Sonare's music streaming platform.",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: { type: "string", description: "JWT bearer token" },
          refreshToken: { type: "string" },
        },
        required: ["accessToken", "refreshToken"],
      },
      RefreshTokenRequest: {
        type: "object",
        properties: {
          refreshToken: { type: "string" },
        },
        required: ["refreshToken"],
      },
      UserLoginRequest: {
        type: "object",
        properties: {
          username: { type: "string", minLength: 3, maxLength: 30 },
          password: { type: "string", minLength: 6, maxLength: 100 },
        },
        required: ["username", "password"],
      },
      UserRegisterRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 3, maxLength: 30 },
          password: { type: "string", minLength: 6, maxLength: 100 },
          displayName: { type: "string", minLength: 1, maxLength: 60 },
          firstName: { type: "string", minLength: 1, maxLength: 60 },
          lastName: { type: "string", minLength: 1, maxLength: 60 },
          bio: { type: "string", maxLength: 280 },
          country: { type: "string", minLength: 2, maxLength: 2, description: "ISO 3166-1 alpha-2" },
          birthdate: { type: "string", format: "date" },
        },
        required: ["name", "password", "displayName", "firstName", "lastName"],
      },
      UserProfileUpdateRequest: {
        type: "object",
        properties: {
          displayName: { type: "string", minLength: 1, maxLength: 60 },
          firstName: { type: "string", minLength: 1, maxLength: 60 },
          lastName: { type: "string", minLength: 1, maxLength: 60 },
          bio: { type: "string", maxLength: 280 },
          country: { type: "string", minLength: 2, maxLength: 2 },
          birthdate: { type: "string", format: "date" },
        },
      },
      AvatarUploadRequest: {
        type: "object",
        properties: {
          avatar: {
            type: "string",
            format: "binary",
            description: "Image file (max validated server-side)",
          },
        },
        required: ["avatar"],
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          displayName: { type: "string", nullable: true },
          firstName: { type: "string", nullable: true },
          lastName: { type: "string", nullable: true },
          bio: { type: "string", nullable: true },
          country: { type: "string", nullable: true },
          birthdate: { type: "string", format: "date", nullable: true },
          avatarUrl: { type: "string", format: "uri", nullable: true },
          roleID: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "roleID", "createdAt", "updatedAt"],
      },
      ArtistResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          image: { type: "string", format: "uri", nullable: true },
          popularity: { type: "number", nullable: true },
          genres: { type: "array", items: { type: "string" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "createdAt", "updatedAt"],
      },
      ArtistCreateRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
        },
        required: ["name"],
      },
      AlbumResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          cover: { type: "string", format: "uri", nullable: true },
          popularity: { type: "number", nullable: true },
          artistID: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "artistID", "createdAt", "updatedAt"],
      },
      AlbumWithArtistSummary: {
        allOf: [
          { $ref: "#/components/schemas/AlbumResponse" },
          {
            type: "object",
            properties: {
              artist: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
          },
        ],
      },
      TrackAlbumSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          cover: { type: "string", format: "uri", nullable: true },
          artistID: { type: "string" },
        },
        required: ["id", "name", "artistID"],
      },
      TrackResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          path: { type: "string" },
          name: { type: "string" },
          duration: { type: "integer" },
          thumbnail: { type: "string", format: "uri", nullable: true },
          popularity: { type: "number", nullable: true },
          spotifyId: { type: "string", nullable: true },
          albumID: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          album: {
            $ref: "#/components/schemas/TrackAlbumSummary",
          },
        },
        required: ["id", "path", "name", "duration", "createdAt", "updatedAt"],
      },
      PlaylistResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          userID: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "userID", "createdAt", "updatedAt"],
      },
      PlaylistCreateRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          userID: { type: "string" },
        },
        required: ["name", "userID"],
      },
      PlaylistTrackActionRequest: {
        type: "object",
        properties: {
          trackID: { type: "string" },
        },
        required: ["trackID"],
      },
      FavoriteActionRequest: {
        $ref: "#/components/schemas/PlaylistTrackActionRequest",
      },
      TrackFileResponse: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri" },
        },
        required: ["url"],
      },
      TrackThumbnailResponse: {
        type: "object",
        properties: {
          thumbnail: { type: "string", format: "uri", nullable: true },
        },
        required: ["thumbnail"],
      },
      SearchResponse: {
        type: "object",
        properties: {
          artists: { type: "array", items: { $ref: "#/components/schemas/ArtistResponse" } },
          albums: { type: "array", items: { $ref: "#/components/schemas/AlbumResponse" } },
          tracks: { type: "array", items: { $ref: "#/components/schemas/TrackResponse" } },
          relatedTracks: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { $ref: "#/components/schemas/TrackResponse" },
            },
          },
        },
        required: ["artists", "albums", "tracks", "relatedTracks"],
      },
      UnifiedSearchItem: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["artist", "album", "track"] },
          id: { type: "string" },
          name: { type: "string" },
          score: { type: "number" },
          artist: { $ref: "#/components/schemas/ArtistResponse" },
          album: { $ref: "#/components/schemas/AlbumWithArtistSummary" },
          track: { $ref: "#/components/schemas/TrackResponse" },
        },
        required: ["type", "id", "name", "score"],
      },
      UnifiedSearchResponse: {
        type: "object",
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/UnifiedSearchItem" } },
          relatedTracks: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { $ref: "#/components/schemas/TrackResponse" },
            },
          },
        },
        required: ["items", "relatedTracks"],
      },
    },
  },
  paths: {
    "/api/auth/login": {
      post: {
        summary: "Authenticate a user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserLoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthTokens" },
              },
            },
          },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Create a new user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          "409": { description: "User already exists" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        summary: "Refresh access token",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshTokenRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "New access token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                  },
                  required: ["accessToken"],
                },
              },
            },
          },
          "401": { description: "Refresh token expired or invalid" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Revoke a refresh token",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshTokenRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Token revoked",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
          "400": { description: "Refresh token not found" },
        },
      },
    },

    "/api/artists": {
      get: {
        summary: "List artists",
        tags: ["Artists"],
        security: [{ bearerAuth: [] }],
        parameters: paginationParams,
        responses: {
          "200": {
            description: "Artist list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/ArtistResponse" } },
              },
            },
          },
        },
      },
      post: {
        summary: "Create artist",
        tags: ["Artists"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ArtistCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Artist created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ArtistResponse" },
              },
            },
          },
        },
      },
    },
    "/api/artists/{id}": {
      get: {
        summary: "Artist details",
        tags: ["Artists"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Artist",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ArtistResponse" },
              },
            },
          },
          "404": { description: "Artist not found" },
        },
      },
      delete: {
        summary: "Delete artist",
        tags: ["Artists"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "204": { description: "Deleted" },
          "404": { description: "Artist not found" },
        },
      },
    },
    "/api/artists/{id}/albums": {
      get: {
        summary: "Albums by artist",
        tags: ["Artists"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          ...paginationParams,
        ],
        responses: {
          "200": {
            description: "Albums",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/AlbumResponse" } },
              },
            },
          },
        },
      },
    },
    "/api/artists/{id}/tracks": {
      get: {
        summary: "Tracks by artist",
        tags: ["Artists"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          ...paginationParams,
        ],
        responses: {
          "200": {
            description: "Tracks",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/TrackResponse" } },
              },
            },
          },
        },
      },
    },
    "/api/artists/{id}/singles": {
      get: {
        summary: "Singles by artist",
        tags: ["Artists"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          ...paginationParams,
        ],
        responses: {
          "200": {
            description: "Singles",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/TrackResponse" } },
              },
            },
          },
        },
      },
    },

    "/api/albums": {
      get: {
        summary: "List albums",
        tags: ["Albums"],
        security: [{ bearerAuth: [] }],
        parameters: paginationParams,
        responses: {
          "200": {
            description: "Albums",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/AlbumResponse" } },
              },
            },
          },
        },
      },
    },
    "/api/albums/{id}": {
      get: {
        summary: "Album details",
        tags: ["Albums"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Album",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AlbumResponse" },
              },
            },
          },
          "404": { description: "Album not found" },
        },
      },
    },
    "/api/albums/{id}/tracks": {
      get: {
        summary: "Tracks in album",
        tags: ["Albums"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          ...paginationParams,
        ],
        responses: {
          "200": {
            description: "Tracks",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/TrackResponse" } },
              },
            },
          },
        },
      },
    },

    "/api/tracks": {
      get: {
        summary: "List tracks",
        tags: ["Tracks"],
        security: [{ bearerAuth: [] }],
        parameters: trackFilterParams,
        responses: {
          "200": {
            description: "Tracks",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/TrackResponse" } },
              },
            },
          },
        },
      },
    },
    "/api/tracks/{id}": {
      get: {
        summary: "Track details",
        tags: ["Tracks"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Track",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TrackResponse" },
              },
            },
          },
          "404": { description: "Track not found" },
        },
      },
    },
    "/api/tracks/{id}/file": {
      get: {
        summary: "Get streaming URL",
        tags: ["Tracks"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Presigned URL",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TrackFileResponse" },
              },
            },
          },
          "404": { description: "Track not found" },
        },
      },
    },
    "/api/tracks/{id}/thumbnail": {
      get: {
        summary: "Get thumbnail URL",
        tags: ["Tracks"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Thumbnail (if any)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TrackThumbnailResponse" },
              },
            },
          },
        },
      },
    },

    "/api/playlists": {
      get: {
        summary: "List playlists",
        tags: ["Playlists"],
        security: [{ bearerAuth: [] }],
        parameters: paginationParams,
        responses: {
          "200": {
            description: "Playlists",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/PlaylistResponse" } },
              },
            },
          },
        },
      },
      post: {
        summary: "Create playlist",
        tags: ["Playlists"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlaylistCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Playlist",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PlaylistResponse" },
              },
            },
          },
        },
      },
    },
    "/api/playlists/{id}": {
      get: {
        summary: "Playlist details",
        tags: ["Playlists"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Playlist",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PlaylistResponse" },
              },
            },
          },
          "404": { description: "Playlist not found" },
        },
      },
      delete: {
        summary: "Delete playlist",
        tags: ["Playlists"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "204": { description: "Deleted" },
          "404": { description: "Playlist not found" },
        },
      },
    },
    "/api/playlists/{id}/tracks": {
      put: {
        summary: "Add track",
        tags: ["Playlists"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlaylistTrackActionRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated playlist",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PlaylistResponse" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Remove track",
        tags: ["Playlists"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlaylistTrackActionRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated playlist",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PlaylistResponse" },
              },
            },
          },
        },
      },
    },

    "/api/me": {
      get: {
        summary: "Current profile",
        tags: ["Me"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Update profile",
        tags: ["Me"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserProfileUpdateRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
        },
      },
    },
    "/api/me/avatar": {
      post: {
        summary: "Upload avatar",
        tags: ["Me"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/AvatarUploadRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "User with new avatar",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
        },
      },
    },
    "/api/me/playlists": {
      get: {
        summary: "My playlists",
        tags: ["Me"],
        security: [{ bearerAuth: [] }],
        parameters: paginationParams,
        responses: {
          "200": {
            description: "Playlists",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/PlaylistResponse" } },
              },
            },
          },
        },
      },
    },
    "/api/me/favorites": {
      get: {
        summary: "My favourite tracks",
        tags: ["Me"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Favorite tracks",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/TrackResponse" } },
              },
            },
          },
        },
      },
      put: {
        summary: "Add favorite",
        tags: ["Me"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FavoriteActionRequest" },
            },
          },
        },
        responses: {
          "204": { description: "Track added" },
        },
      },
      delete: {
        summary: "Remove favorite",
        tags: ["Me"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FavoriteActionRequest" },
            },
          },
        },
        responses: {
          "204": { description: "Track removed" },
        },
      },
    },

    "/api/search": {
      get: {
        summary: "Search artists, albums, tracks",
        tags: ["Search"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description: "Search term (min 3 chars)",
            schema: { type: "string", minLength: 3 },
          },
          {
            name: "type",
            in: "query",
            description: "Comma separated resource types",
            schema: { type: "string", default: "artist,album,track" },
          },
        ],
        responses: {
          "200": {
            description: "Search result grouped by resource",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchResponse" },
              },
            },
          },
        },
      },
    },
    "/api/search/unified": {
      get: {
        summary: "Unified ranked search",
        tags: ["Search"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description: "Search term (min 3 chars)",
            schema: { type: "string", minLength: 3 },
          },
        ],
        responses: {
          "200": {
            description: "Mixed list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UnifiedSearchResponse" },
              },
            },
          },
        },
      },
    },
  },
};
