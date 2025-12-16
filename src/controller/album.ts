import { Hono } from "hono";
import AlbumService from "@/services/AlbumService.ts";
import { StorageService } from "@/services/StorageService.ts";
import { PaginationQuerySchema } from "@/model/dto/CommonDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { requirePermission } from "@/middleware/AuthMiddleware";
import { Capability } from "@/generated/prisma/client";
import { paginated } from "@/util/pagination";
import type { AlbumResponse, TrackResponse } from "@/model/dto";

const albumController = new Hono();
const storageService = new StorageService();

const service = new AlbumService();

albumController
    .get("/",
        validate("query", PaginationQuerySchema),
        requirePermission(Capability.READ, "albums"),
        async (c) => {
            const { page, limit } = c.req.valid('query')
            const albums = await service.findAll({ skip: limit * page, take: limit });

            const response = await Promise.all(albums.map(async (album) => {
                const dto = DTOMapper.toAlbumResponse(album);
                if (dto.cover) {
                    dto.cover = await storageService.getPresignedUrl(dto.cover);
                }
                return dto;
            }));
            return c.json(paginated<AlbumResponse>(response, page, limit));
        });

albumController
    .get("/:id",
        requirePermission(Capability.READ, "albums"),
        async (c) => {
            const { id } = c.req.param();
            const album = await service.findByID(id);

            const dto = DTOMapper.toAlbumResponse(album);
            if (dto.cover) {
                dto.cover = await storageService.getPresignedUrl(dto.cover);
            }

            return c.json(dto);
        });

albumController
    .get("/:id/tracks",
        validate("query", PaginationQuerySchema),
        requirePermission(Capability.READ, "albums"),
        async (c) => {
            const { page, limit } = c.req.valid('query')
            const { id } = c.req.param();

            const tracks = await service.getTracksOfAlbum(id, { skip: page * limit, take: limit });

            const response = await Promise.all(tracks.map(async (track) => {
                const dto = DTOMapper.toTrackResponse(track);
                if (dto.thumbnail) {
                    dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
                }
                return dto;
            }));

            return c.json(paginated<TrackResponse>(response, page, limit));
        });

albumController
    .delete("/:id",
        requirePermission(Capability.DELETE, "albums"),
        async (c) => {
            const { id } = c.req.param();
            const userId = c.get('userId'); // Assuming userId is set by auth middleware

            await service.delete(id, userId);

            return c.body(null, 204);
        });

export default albumController;
