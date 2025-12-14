import { Hono } from "hono";

import { z } from 'zod';

import PlaylistService from "@/services/PlaylistService.ts";

import { PaginationQuerySchema } from "@/model/dto/CommonDTO.ts";
import { PlaylistCreateSchema, PlaylistTrackActionSchema, PlaylistUpdateSchema, type PlaylistResponse } from "@/model/dto/PlaylistDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { requirePermission } from "@/middleware/AuthMiddleware";
import { NotFoundError } from "@/error/ApiError.ts";
import { Capability } from "@/generated/prisma/client";
import { paginated } from "@/util/pagination";
import { PlaylistGuard, requireOwner } from "@/middleware/guard";

const playlistController = new Hono();

const service = new PlaylistService();

const guard = new PlaylistGuard();

const ShuffleQuerySchema = z.object({
    order: z.enum(["default", "shuffle"]).default("default")
});


playlistController.get("/", validate("query", PaginationQuerySchema), requirePermission(Capability.READ, "playlists"), async (c) => {
    const { page, limit } = c.req.valid('query')
    const playlists = await service.findAll({ skip: limit * page, take: limit });
    const dtos = playlists.map(DTOMapper.toPlaylistResponse)
    return c.json(paginated<PlaylistResponse>(dtos, page, limit));
});

playlistController.post("/", validate("json", PlaylistCreateSchema), requirePermission(Capability.CREATE, "playlists"), async (c) => {
    const body = c.req.valid("json");
    const playlist = await service.create(body.name, body.userID);
    return c.json(DTOMapper.toPlaylistResponse(playlist), 201);
});


playlistController.get("/:id", requirePermission(Capability.READ, "playlists"), async (c) => {
    const { id } = c.req.param();
    const playlist = await service.findByID(id);
    return c.json(DTOMapper.toPlaylistResponse(playlist));
});

playlistController.get("/:id/tracks", validate("query", ShuffleQuerySchema), requirePermission(Capability.READ, "playlists"), async (c) => {
    const { id } = c.req.param();
    const { order } = c.req.valid('query');
    if (order === 'default') {
        const tracks = await service.getTracksInPlaylist(id);
        return c.json(tracks.map(DTOMapper.toPlaylistTrackResponse));
    } else {
        const tracks = await service.shuffle(id);
        return c.json(tracks.map(DTOMapper.toPlaylistTrackResponse));
    }
});

playlistController.patch("/:id", validate("json", PlaylistUpdateSchema), requirePermission(Capability.UPDATE, "playlists"), async (c) => {
    const { id } = c.req.param();
    const body = c.req.valid("json");
    if (!body.name) {
        return c.json({ message: "Name is required" }, 400);
    }
    const updated = await service.update(id, body.name);
    return c.json(DTOMapper.toPlaylistResponse(updated));
});

playlistController.post("/:id/tracks",
    validate("json", PlaylistTrackActionSchema),
    requirePermission(Capability.UPDATE, "playlists"),
    requireOwner(guard),
    async (c) => {

        const { id } = c.req.param();

        const { trackID } = c.req.valid("json");

        const updated = await service.addTrackToPlaylist(id, trackID);

        return c.json(DTOMapper.toPlaylistResponse(updated));
    });

playlistController.delete("/:id/tracks/:trackID", requirePermission(Capability.UPDATE, "playlists"), async (c) => {
    const { id, trackID } = c.req.param();

    const updated = await service.removeTrackFromPlaylist(id, trackID);

    return c.json(DTOMapper.toPlaylistResponse(updated));
});

playlistController.delete("/:id", requirePermission(Capability.DELETE, "playlists"), async (c) => {
    const { id } = c.req.param();
    const deleted = await service.delete(id);
    if (!deleted) {
        throw new NotFoundError("Playlist no encontrada");
    }

    return c.body(null, 204);
});



export default playlistController;
