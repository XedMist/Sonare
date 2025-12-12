import { Hono } from "hono";

import AlbumService from "@/services/AlbumService.ts";
import { StorageService } from "@/services/StorageService.ts";
import { PaginationQuerySchema } from "@/model/dto/CommonDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { requirePermission } from "@/middleware/AuthMiddleware";
import { Capability } from "@/generated/prisma/client";

const albumController = new Hono();
const service = new AlbumService();
const storageService = new StorageService();

albumController.get("/", validate("query", PaginationQuerySchema), requirePermission(Capability.READ, "albums"), async (c) => {
    const { page, limit } = c.req.valid('query')
    const albums = await service.findAll({ skip: page, take: limit });
    return c.json(albums.map(DTOMapper.toAlbumResponse));
});

albumController.get("/:id", requirePermission(Capability.READ, "albums"), async (c) => {
    const { id } = c.req.param();
    const album = await service.findByID(id);
    return c.json(DTOMapper.toAlbumResponse(album));
});

albumController.get("/:id/tracks", validate("query", PaginationQuerySchema), requirePermission(Capability.READ, "albums"), async (c) => {
    const { page, limit } = c.req.valid('query')
    const { id } = c.req.param();

    const tracks = await service.getTracksOfAlbum(id, { skip: page, take: limit });
    
    const response = await Promise.all(tracks.map(async (track) => {
        const dto = DTOMapper.toTrackResponse(track);
        if (dto.thumbnail) {
             dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
        }
        return dto;
    }));

    return c.json(response);
});

export default albumController;
