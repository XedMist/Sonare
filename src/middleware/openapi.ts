export const openApiDoc = {
    openapi: "3.0.0",
    info: {
        title: "Sonare API",
        version: "1.0.0",
        description: "API documentation for Sonare music streaming service",
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    paths: {
        "/api/auth/login": {
            post: {
                summary: "User login",
                tags: ["Authentication"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    username: {
                                        type: "string",
                                        description: "The username",
                                    },
                                    password: {
                                        type: "string",
                                        description: "The user's password",
                                    },
                                },
                                required: ["username", "password"],
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Login successful",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        accessToken: {
                                            type: "string",
                                            description: "JWT access token",
                                        },
                                        refreshToken: {
                                            type: "string",
                                            description: "JWT refresh token",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Invalid credentials",
                    },
                },
            },
        },
        "/api/auth/register": {
            post: {
                summary: "User registration",
                tags: ["Authentication"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string",
                                        description: "The username",
                                    },
                                    password: {
                                        type: "string",
                                        description: "The user's password",
                                    },
                                },
                                required: ["name", "password"],
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "User created successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "string",
                                        },
                                        name: {
                                            type: "string",
                                        },
                                        roleID: {
                                            type: "string",
                                        },
                                        createdAt: {
                                            type: "string",
                                            format: "date-time",
                                        },
                                        updatedAt: {
                                            type: "string",
                                            format: "date-time",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "409": {
                        description: "User already exists",
                    },
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
                            schema: {
                                type: "object",
                                properties: {
                                    refreshToken: {
                                        type: "string",
                                        description: "The refresh token",
                                    },
                                },
                                required: ["refreshToken"],
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Token refreshed successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        accessToken: {
                                            type: "string",
                                            description: "New JWT access token",
                                        },
                                        refreshToken: {
                                            type: "string",
                                            description: "New refresh token",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Invalid or expired refresh token",
                    },
                },
            },
        },
        "/api/auth/logout": {
            post: {
                summary: "Logout and revoke refresh token",
                tags: ["Authentication"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    refreshToken: {
                                        type: "string",
                                        description: "The refresh token to revoke",
                                    },
                                },
                                required: ["refreshToken"],
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Logged out successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid refresh token",
                    },
                },
            },
        },
        "/api/artists": {
            get: {
                summary: "Get all artists",
                tags: ["Artists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 0,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 10,
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "List of artists",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            name: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: "Create a new artist",
                tags: ["Artists"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string",
                                        description: "The name of the artist",
                                    },
                                },
                                required: ["name"],
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Artist created successfully",
                    },
                },
            },
        },
        "/api/artists/{id}": {
            get: {
                summary: "Get artist by ID",
                tags: ["Artists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Artist details",
                    },
                    "404": {
                        description: "Artist not found",
                    },
                },
            },
            delete: {
                summary: "Delete artist",
                tags: ["Artists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "204": {
                        description: "Artist deleted successfully",
                    },
                    "404": {
                        description: "Artist not found",
                    },
                },
            },
        },
        "/api/artists/{id}/albums": {
            get: {
                summary: "Get albums by artist",
                tags: ["Artists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "page",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 0,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 10,
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "List of albums",
                    },
                },
            },
        },
        "/api/artists/{id}/tracks": {
            get: {
                summary: "Get tracks by artist",
                tags: ["Artists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "page",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 0,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 10,
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "List of tracks",
                    },
                },
            },
        },
        "/api/artists/{id}/singles": {
            get: {
                summary: "Get singles by artist",
                tags: ["Artists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "integer", default: 0 },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", default: 10 },
                    },
                ],
                responses: {
                    "200": { description: "List of singles (tracks)" },
                },
            },
        },
        "/api/albums": {
            get: {
                summary: "Get all albums",
                tags: ["Albums"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 0,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 10,
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "List of albums",
                    },
                },
            },
        },
        "/api/albums/{id}": {
            get: {
                summary: "Get album by ID",
                tags: ["Albums"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Album details",
                    },
                    "404": {
                        description: "Album not found",
                    },
                },
            },
        },
        "/api/albums/{id}/tracks": {
            get: {
                summary: "Get tracks of an album",
                tags: ["Albums"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "page",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 0,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 10,
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "List of tracks",
                    },
                },
            },
        },
        "/api/tracks": {
            get: {
                summary: "Get all tracks",
                tags: ["Tracks"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 0,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 10,
                        },
                    },
                    {
                        name: "name",
                        in: "query",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "artistID",
                        in: "query",
                        schema: {
                            type: "string",
                        },
                    },
                    {
                        name: "albumID",
                        in: "query",
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "List of tracks",
                    },
                },
            },
        },
        "/api/tracks/{id}": {
            get: {
                summary: "Get track by ID",
                tags: ["Tracks"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Track details",
                    },
                    "404": {
                        description: "Track not found",
                    },
                },
            },
        },
        "/api/tracks/{id}/file": {
            get: {
                summary: "Stream track file",
                tags: ["Tracks"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Presigned URL to download/stream audio",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { url: { type: "string", format: "uri" } },
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Track not found",
                    },
                },
            },
        },
        "/api/tracks/{id}/thumbnail": {
            get: {
                summary: "Get track thumbnail",
                tags: ["Tracks"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Presigned URL to thumbnail or null",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        thumbnail: {
                                            description: "Presigned URL or null",
                                            type: "string",
                                            format: "uri",
                                            nullable: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Track not found",
                    },
                },
            },
        },
        "/api/playlists": {
            get: {
                summary: "Get all playlists",
                tags: ["Playlists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 0,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 10,
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Paginated list of playlists",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        items: { type: "array", items: { type: "object" } },
                                        page: { type: "integer" },
                                        limit: { type: "integer" },
                                        total: { type: "integer" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: "Create a new playlist",
                tags: ["Playlists"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string",
                                    },
                                    userID: {
                                        type: "string",
                                    },
                                },
                                required: ["name", "userID"],
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Playlist created successfully",
                    },
                },
            },
        },
        "/api/playlists/{id}": {
            get: {
                summary: "Get playlist by ID",
                tags: ["Playlists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Playlist details",
                    },
                    "404": {
                        description: "Playlist not found",
                    },
                },
            },
            delete: {
                summary: "Delete playlist",
                tags: ["Playlists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    "204": {
                        description: "Playlist deleted successfully",
                    },
                    "404": {
                        description: "Playlist not found",
                    },
                },
            },
        },
        "/api/playlists/{id}/tracks": {
            post: {
                summary: "Add track to playlist",
                tags: ["Playlists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    trackID: {
                                        type: "string",
                                    },
                                },
                                required: ["trackID"],
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Track added to playlist",
                    },
                },
            },
        },
        "/api/playlists/{id}/tracks/{trackID}": {
            delete: {
                summary: "Remove track from playlist",
                tags: ["Playlists"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                    { name: "trackID", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": { description: "Track removed from playlist" },
                },
            },
        },
        "/api/me": {
            get: {
                summary: "Get current user profile",
                tags: ["User"],
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "User profile",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        role: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/me/playlists": {
            get: {
                summary: "Get current user's playlists",
                tags: ["User"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 0,
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            default: 10,
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "List of user's playlists",
                    },
                },
            },
        },
        "/api/me/favorites": {
            get: {
                summary: "Get user's favorite tracks",
                tags: ["User"],
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "List of favorite tracks",
                    },
                },
            },
            put: {
                summary: "Add track to favorites",
                tags: ["User"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    trackID: { type: "string" },
                                },
                                required: ["trackID"],
                            },
                        },
                    },
                },
                responses: {
                    "204": {
                        description: "Track added to favorites",
                    },
                },
            },
            delete: {
                summary: "Remove track from favorites",
                tags: ["User"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    trackID: { type: "string" },
                                },
                                required: ["trackID"],
                            },
                        },
                    },
                },
                responses: {
                    "204": {
                        description: "Track removed from favorites",
                    },
                },
            },
        },
        "/api/search": {
            get: {
                summary: "Search for artists, albums, and tracks",
                tags: ["Search"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "q",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                        description: "Search query",
                    },
                    {
                        name: "type",
                        in: "query",
                        schema: { type: "string", default: "artist,album,track" },
                        description: "Comma-separated list of types to search",
                    },
                ],
                responses: {
                    "200": {
                        description: "Search results",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        artists: { type: "array", items: { type: "object" } },
                                        albums: { type: "array", items: { type: "object" } },
                                        tracks: { type: "array", items: { type: "object" } },
                                        relatedTracks: {
                                            type: "object",
                                            description: "Mapping of track IDs to related tracks from the same album (or artist when no album)",
                                            additionalProperties: {
                                                type: "array",
                                                items: { type: "object" }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export default openApiDoc;
