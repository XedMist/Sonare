import { Hono } from "hono";
import { z } from 'zod';

import TrackService from "@/services/TrackService.ts";
import { StorageService } from "@/services/StorageService.ts";
import { PaginationQuerySchema } from "@/model/dto/CommonDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { requirePermission } from "@/middleware/AuthMiddleware";
import { Capability } from "@/generated/prisma/client";

const router = new Hono();
const service = new TrackService();
const storageService = new StorageService();

const QuerySchema = PaginationQuerySchema.extend({
    name: z.string().optional(),
    artistID: z.string().optional(),
    albumID: z.string().optional(),
});

router.get("/", validate("query", QuerySchema), requirePermission(Capability.READ, "tracks"), async (c) => {
    const { page, limit, name, albumID, artistID } = c.req.valid('query')
    const tracks = await service.findAll(name, albumID, artistID, { skip: page, take: limit });
    
    const response = await Promise.all(tracks.map(async (track) => {
        const dto = DTOMapper.toTrackResponse(track);
        if (dto.thumbnail) {
             dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
        }
        return dto;
    }));

    return c.json(response);
});

router.get("/:id", requirePermission(Capability.READ, "tracks"), async (c) => {
    const { id } = c.req.param();
    const track = await service.findById(id);
    
    if (!track) return c.json({ message: "Track not found" }, 404);

    const dto = DTOMapper.toTrackResponse(track);
    if (dto.thumbnail) {
        dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
    }
    return c.json(dto);
});

router.get("/:id/file", requirePermission(Capability.READ, "tracks"), async (c) => {
    const { id } = c.req.param();
    const track = await service.findById(id);

    const url = await storageService.getPresignedUrl(track.path);
    return c.json({ url });
});

router.get("/:id/thumbnail", requirePermission(Capability.READ, "tracks"), async (c) => {
    const { id } = c.req.param();
    const thumbnailPath = await service.getThumbnail(id);
    
    if (!thumbnailPath) {
        return c.json({ thumbnail: null });
    }

    const url = await storageService.getPresignedUrl(thumbnailPath);
    return c.json({ thumbnail: url });
})

export default router;
