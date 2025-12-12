# Sonare API Reference

This document describes the HTTP API exposed by the Sonare backend so that an automated agent can interact with it reliably.

- **Base URL**: `http://localhost:3000/api`
- **Protocol**: JSON over HTTP
- **Authentication**: Bearer JWT in the `Authorization` header for all protected endpoints.

Example authenticated request:

`Authorization: Bearer <token>`

---

## Authentication

### POST `/auth/register`

Create a new user account.

- **Auth**: Public
- **Body** (JSON):
  - `name` (string, required) – unique username.
  - `password` (string, required) – user password.
- **Responses**:
  - `201 Created` – user created.
    - Body: user object with at least:
      - `id` (string)
      - `name` (string)
      - `createdAt` (ISO datetime)
      - `updatedAt` (ISO datetime)
  - `400 Bad Request` – invalid body or username already exists.

### POST `/auth/login`

Authenticate a user and obtain a JWT.

- **Auth**: Public
- **Body** (JSON):
  - `name` (string, required)
  - `password` (string, required)
- **Responses**:
  - `200 OK` – valid credentials.
    - Body:
      - `token` (string) – JWT to use as `Authorization: Bearer <token>`.
      - `user` (object) – authenticated user info (same shape as in register response).
  - `401 Unauthorized` – invalid credentials.

---

## Common Data Models

All IDs are MongoDB ObjectId-like strings.

### User

- `id` (string)
- `name` (string)
- `roleID` (string)
- `createdAt` (string, ISO datetime)
- `updatedAt` (string, ISO datetime)

### Artist

- `id` (string)
- `name` (string)
- `createdAt` (string)
- `updatedAt` (string)

### Album

- `id` (string)
- `name` (string)
- `artistID` (string)
- `createdAt` (string)
- `updatedAt` (string)

### Track

- `id` (string)
- `name` (string)
- `duration` (number, seconds)
- `thumbnail` (string, URL)
- `path` (string, URL or storage path)
- `albumID` (string | null)
- `artistID` (string)
- `createdAt` (string)
- `updatedAt` (string)

### Playlist

- `id` (string)
- `name` (string)
- `userID` (string)
- `createdAt` (string)
- `updatedAt` (string)

### PlaylistTrack (internal item)

- `id` (string)
- `playlistId` (string)
- `trackId` (string)
- `position` (number | null)
- `addedAt` (string)

---

## Current User (`/me`)

### GET `/me`

Return information about the currently authenticated user.

- **Auth**: Required
- **Responses**:
  - `200 OK` – current user data.
    - Body: `User` object.
  - `401 Unauthorized` – missing or invalid token.

---

## Artists (`/artists`)

All artist endpoints require authentication.

### GET `/artists`

List artists.

- **Auth**: Required
- **Query parameters** (optional):
  - `q` (string) – filter by name substring.
  - Pagination parameters may exist (e.g. `page`, `limit`).
- **Responses**:
  - `200 OK`
    - Body: array of `Artist` objects.

### GET `/artists/{id}`

Get details of a single artist.

- **Auth**: Required
- **Path params**:
  - `id` (string) – artist ID.
- **Responses**:
  - `200 OK` – artist found.
    - Body: `Artist` object.
  - `404 Not Found` – artist does not exist.

---

## Albums (`/albums`)

All album endpoints require authentication.

### GET `/albums`

List albums.

- **Auth**: Required
- **Query parameters** (optional):
  - `artistId` (string) – filter by artist.
  - `q` (string) – filter by album name substring.
- **Responses**:
  - `200 OK`
    - Body: array of `Album` objects.

### GET `/albums/{id}`

Get details of a single album, possibly including its tracks.

- **Auth**: Required
- **Path params**:
  - `id` (string) – album ID.
- **Responses**:
  - `200 OK` – album found.
    - Body: `Album` object, optionally with an embedded `tracks` array of `Track`.
  - `404 Not Found` – album does not exist.

---

## Tracks (`/tracks`)

All track endpoints require authentication.

### GET `/tracks`

List tracks.

- **Auth**: Required
- **Query parameters** (optional):
  - `albumId` (string) – filter by album.
  - `artistId` (string) – filter by artist.
  - `q` (string) – filter by track name substring.
- **Responses**:
  - `200 OK`
    - Body: array of `Track` objects.

### GET `/tracks/{id}`

Get a single track.

- **Auth**: Required
- **Path params**:
  - `id` (string) – track ID.
- **Responses**:
  - `200 OK`
    - Body: `Track` object.
  - `404 Not Found` – track not found.

### GET `/tracks/{id}/file`

Stream the audio file for a track.

- **Auth**: Required
- **Path params**:
  - `id` (string) – track ID.
- **Responses**:
  - `200 OK`
    - Content-Type: `audio/mp4`
    - Body: audio file stream.
  - `404 Not Found` – track not found.

### GET `/tracks/{id}/thumbnail`

Get the thumbnail image for a track.

- **Auth**: Required
- **Path params**:
  - `id` (string) – track ID.
- **Responses**:
  - `200 OK`
    - Content-Type: `image/jpeg`, `image/png`, `image/gif`, or `image/webp` (based on file extension)
    - Body: image file stream.
  - `404 Not Found` – track or thumbnail not found.

---

## Playlists (`/playlists`)

All playlist endpoints require authentication. Playlists always belong to the current user.

### GET `/playlists`

List playlists belonging to the current user.

- **Auth**: Required
- **Responses**:
  - `200 OK`
    - Body: array of `Playlist` objects.

### POST `/playlists`

Create a new playlist for the current user.

- **Auth**: Required
- **Body** (JSON):
  - `name` (string, required)
- **Responses**:
  - `201 Created`
    - Body: created `Playlist` object.
  - `400 Bad Request` – invalid body.

### GET `/playlists/{id}`

Get details of a single playlist, including its tracks.

- **Auth**: Required
- **Path params**:
  - `id` (string) – playlist ID.
- **Responses**:
  - `200 OK`
    - Body: object with at least:
      - `playlist` (Playlist)
      - `tracks` (array of `Track`)
  - `404 Not Found` – playlist not found or not owned by current user.

### PATCH `/playlists/{id}`

Update playlist metadata (e.g., name).

- **Auth**: Required
- **Body** (JSON):
  - `name` (string, optional)
- **Responses**:
  - `200 OK` – playlist updated.
    - Body: updated `Playlist` object.
  - `404 Not Found` – playlist not found or not owned by current user.

### DELETE `/playlists/{id}`

Delete a playlist.

- **Auth**: Required
- **Responses**:
  - `204 No Content` – playlist deleted.
  - `404 Not Found` – playlist not found or not owned by current user.

### POST `/playlists/{id}/tracks`

Add one or more tracks to a playlist.

- **Auth**: Required
- **Body** (JSON):
  - `trackIds` (array of string, required) – tracks to add.
  - `position` (number, optional) – insert position.
- **Responses**:
  - `200 OK`
    - Body: updated playlist representation (implementation-dependent; can be playlist + tracks array).
  - `404 Not Found` – playlist not found or not owned by current user.

### DELETE `/playlists/{id}/tracks/{trackId}`

Remove a track from a playlist.

- **Auth**: Required
- **Path params**:
  - `id` (string) – playlist ID.
  - `trackId` (string) – track ID.
- **Responses**:
  - `204 No Content` – track removed.
  - `404 Not Found` – playlist or track not found.

---

## Search (`/search`)

All search endpoints require authentication.

### GET `/search`

Full-text search across artists, albums, tracks, and playlists.

- **Auth**: Required
- **Query parameters**:
  - `q` (string, required) – search term.
- **Responses**:
  - `200 OK`
    - Body: object with combined results, for example:
      - `artists` (array of `Artist`)
      - `albums` (array of `Album`)
      - `tracks` (array of `Track`)
      - `playlists` (array of `Playlist`)

---

## Error Handling

Errors are normalized by a global error handler. The typical error body has the form:

```json
{
  "status": number,
  "message": string,
  "code": string | null,
  "details": any | null
}
```

- `400` – validation or bad input.
- `401` – missing/invalid authentication.
- `403` – forbidden by role/capabilities.
- `404` – resource not found.
- `500` – unexpected server error.

---

## Swagger / OpenAPI

A machine-readable OpenAPI spec and Swagger UI are exposed under the public route:

- **GET `/swagger/json`** – raw OpenAPI JSON.
- **GET `/swagger/ui`** – interactive Swagger UI.

Both live under the base path `/api/swagger`. An agent that understands OpenAPI can fetch `/api/swagger/json` and derive the full, precise schema of all endpoints, inputs, and responses.
