import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

//  Esto es la especificacion de la api
const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "API Documentation",
    version: "1.0.0",
    description: "API documentation for Sonare",
  },
  paths: {
    "/api/users": {
      get: {
        summary: "Finds all users",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
      post: {
        summary: "Adds an user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the user",
                  },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
          },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        summary: "Finds a user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
          "404": {
            description: "User not found",
          },
        },
      },
      delete: {
        summary: "Deletes a user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "204": {
            description: "User deleted successfully",
          },
          "404": {
            description: "User not found",
          },
        },
      },
    },
    "/api/artists": {
      get: {
        summary: "Finds all artists",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
      post: {
        summary: "Adds an artist",
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
        summary: "Finds an artist by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
          "404": {
            description: "Artist not found",
          },
        },
      },
      delete: {
        summary: "Deletes an artist by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
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
    "/api/albums": {
      get: {
        summary: "Finds all albums",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
      post: {
        summary: "Adds an album",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the album",
                  },
                  artistIds: {
                    type: "array",
                    items: {
                      type: "integer",
                    },
                    description: "Array of artist IDs",
                    default: [],
                  },
                  trackIds: {
                    type: "array",
                    items: {
                      type: "integer",
                    },
                    description: "Array of track IDs",
                    default: [],
                  },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Album created successfully",
          },
        },
      },
    },
    "/api/albums/{id}": {
      get: {
        summary: "Finds an album by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
          "404": {
            description: "Album not found",
          },
        },
      },
      delete: {
        summary: "Deletes an album by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "204": {
            description: "Album deleted successfully",
          },
          "404": {
            description: "Album not found",
          },
        },
      },
    },
    "/api/tracks": {
      get: {
        summary: "Finds all tracks",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
      post: {
        summary: "Adds a track",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the track",
                  },
                  duration: {
                    type: "number",
                    description: "Duration in seconds",
                    minimum: 0,
                  },
                  path: {
                    type: "string",
                    description: "File path to the track",
                  },
                  albumId: {
                    type: "integer",
                    description: "ID of the album (optional)",
                  },
                  genres: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "Rock",
                        "Pop",
                        "Jazz",
                        "Classical",
                        "Hip-Hop",
                        "Electronic",
                        "Country",
                        "Reggae",
                        "Blues",
                        "Folk",
                        "Metal",
                        "Punk",
                        "R&B",
                        "Soul",
                        "Funk",
                        "Disco",
                        "Gospel",
                        "Ska",
                        "Techno",
                        "House",
                      ],
                    },
                    description: "Array of music genres",
                    default: [],
                  },
                },
                required: ["name", "duration", "path"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Track created successfully",
          },
        },
      },
    },
    "/api/tracks/{id}": {
      get: {
        summary: "Finds a track by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
          "404": {
            description: "Track not found",
          },
        },
      },
      delete: {
        summary: "Deletes a track by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "204": {
            description: "Track deleted successfully",
          },
          "404": {
            description: "Track not found",
          },
        },
      },
    },
    "/api/tracks/album/{albumId}": {
      get: {
        summary: "Finds all tracks by album ID",
        parameters: [
          {
            name: "albumId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/playlists": {
      get: {
        summary: "Finds all playlists",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
      post: {
        summary: "Creates a new playlist",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the playlist",
                  },
                  userId: {
                    type: "integer",
                    description: "ID of the user who owns the playlist",
                  },
                  trackIds: {
                    type: "array",
                    items: {
                      type: "integer",
                    },
                    description: "Array of track IDs",
                    default: [],
                  },
                },
                required: ["name", "userId"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Playlist created successfully",
          },
          "400": {
            description: "Invalid user or tracks not found",
          },
        },
      },
    },
    "/api/playlists/{id}": {
      get: {
        summary: "Finds a playlist by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
          "404": {
            description: "Playlist not found",
          },
        },
      },
      delete: {
        summary: "Deletes a playlist by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Playlist deleted successfully",
          },
          "404": {
            description: "Playlist not found",
          },
        },
      },
    },
    "/api/playlists/user/{userId}": {
      get: {
        summary: "Finds all playlists by user ID",
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/playlists/{id}/duration": {
      get: {
        summary: "Gets the total duration of a playlist",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
          },
          "404": {
            description: "Playlist not found",
          },
        },
      },
    },
    "/api/playlists/{id}/tracks": {
      post: {
        summary: "Adds a track to a playlist",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
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
                  trackId: {
                    type: "integer",
                    description: "ID of the track to add",
                  },
                },
                required: ["trackId"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Track added successfully",
          },
          "404": {
            description: "Playlist or track not found",
          },
        },
      },
    },
    "/api/playlists/{id}/tracks/{trackId}": {
      delete: {
        summary: "Removes a track from a playlist",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
          {
            name: "trackId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          "200": {
            description: "Track removed successfully",
          },
          "404": {
            description: "Playlist not found",
          },
        },
      },
    },
  },
};

const swaggerMiddleware = new Hono();

swaggerMiddleware.get("/doc", (c) => c.json(openApiDoc));
swaggerMiddleware.get("/ui", swaggerUI({ url: "/api/swagger/doc" }));

export default swaggerMiddleware;
