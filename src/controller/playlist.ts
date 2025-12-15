import { Hono } from "hono";
import { db } from "@/db/db.ts";
import { z } from 'zod';
import PlaylistService from "@/services/PlaylistService.ts";
import { StorageService } from "@/services/StorageService.ts";
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
const storageService = new StorageService();

const ShuffleQuerySchema = z.object({
    order: z.enum(["default", "shuffle"]).default("default")
});


playlistController
    .get("/",
        validate("query", PaginationQuerySchema),
        requirePermission(Capability.READ, "playlists"),
        async (c) => {
            const { page, limit } = c.req.valid('query')
            const playlists = await service.findAll({ skip: limit * page, take: limit });

            const userID = c.get("userId") as string
            const role = c.get("userRole") as string

            if (role === "ADMIN") {
                const dtos = await Promise.all(playlists.map(async (p) => {
                    const dto = DTOMapper.toPlaylistResponse(p);
                    if (dto.cover) {
                        dto.cover = await storageService.getPresignedUrl(dto.cover);
                    }
                    return dto;
                }));
                return c.json(paginated<PlaylistResponse>(dtos, page, limit));
            }

            const dtos = await Promise.all(playlists.filter((p) => p.userID === userID).map(async (p) => {
                const dto = DTOMapper.toPlaylistResponse(p);
                if (dto.cover) {
                    dto.cover = await storageService.getPresignedUrl(dto.cover);
                }
                return dto;
            }));

            return c.json(paginated<PlaylistResponse>(dtos, page, limit));
        });

playlistController
    .post("/",
        validate("json", PlaylistCreateSchema),
        requirePermission(Capability.CREATE, "playlists"),
        async (c) => {
            const body = c.req.valid("json");
            const userID = c.get("userId") as string;
            const playlist = await service.create(body.name, userID);

            return c.json(DTOMapper.toPlaylistResponse(playlist), 201);
        });


playlistController
    .get("/:id",
        requirePermission(Capability.READ, "playlists"),
        requireOwner(guard),
        async (c) => {
            const { id } = c.req.param();
            const playlist = await service.findByID(id);

            const dto = DTOMapper.toPlaylistResponse(playlist);
            if (dto.cover) {
                dto.cover = await storageService.getPresignedUrl(dto.cover);
            }

            return c.json(dto);
        });

playlistController
    .get("/:id/tracks",
        validate("query", ShuffleQuerySchema),
        requirePermission(Capability.READ, "playlists"),
        requireOwner(guard),
        async (c) => {
            const { id } = c.req.param();
            const { order } = c.req.valid('query');
            const tracks = order === 'shuffle' ? await service.shuffle(id) : await service.getTracksInPlaylist(id);

            const response = await Promise.all(tracks.map(async (track) => {
                const dto = DTOMapper.toTrackResponse(track);
                if (dto.thumbnail) {
                    dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
                }
                if (dto.album?.cover) {
                    dto.album.cover = await storageService.getPresignedUrl(dto.album.cover);
                }
                return dto;
            }));

            return c.json(response);
        });

playlistController
    .patch("/:id",
        validate("json", PlaylistUpdateSchema),
        requirePermission(Capability.UPDATE, "playlists"),
        requireOwner(guard),
        async (c) => {
            const { id } = c.req.param();
            const body = c.req.valid("json");

            if (!body.name) {
                return c.json({ message: "Name is required" }, 400);
            }

            // Check if it's the favorites playlist
            const userID = c.get("userId") as string;
            const user = await db.user.findUnique({ where: { id: userID } });
            if (user?.favoritosID === id) {
                return c.json({ message: "Cannot rename favorites playlist" }, 403);
            }

            const updated = await service.update(id, body.name);
            return c.json(DTOMapper.toPlaylistResponse(updated));
        });

playlistController
    .post("/:id/tracks",
        validate("json", PlaylistTrackActionSchema),
        requirePermission(Capability.UPDATE, "playlists"),
        requireOwner(guard),
        async (c) => {
            const { id } = c.req.param();
            const { trackID } = c.req.valid("json");

            const updated = await service.addTrackToPlaylist(id, trackID);

            return c.json(DTOMapper.toPlaylistResponse(updated), 201);
        });

playlistController
    .delete("/:id/tracks/:trackID",
        requirePermission(Capability.UPDATE, "playlists"),
        requireOwner(guard),
        async (c) => {
            const { id, trackID } = c.req.param();
            const deleted = await service.removeTrackFromPlaylist(id, trackID);

            if (!deleted) {
                throw new NotFoundError(`La track ${trackID} no existe en la playlist con id ${id}`);
            }

            return c.body(null, 204);
        });

playlistController
    .delete("/:id",
        requirePermission(Capability.DELETE, "playlists"),
        requireOwner(guard),
        async (c) => {
            const { id } = c.req.param();
            
            // Check protection
            try {
                const userID = c.get("userId") as string;
                const user = await db.user.findUnique({ where: { id: userID } });
                if (user?.favoritosID === id) {
                    return c.json({ message: "Cannot delete favorites playlist" }, 403);
                }
            } catch (e) {
                console.error("Error checking favorites protection", e);
            }

            const deleted = await service.delete(id);

            if (!deleted) {
                throw new NotFoundError(`La playlist con id ${id} no fue encontrada`);
            }

            return c.body(null, 204);
        });

export default playlistController;
