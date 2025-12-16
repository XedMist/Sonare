import { Hono } from "hono";
import { z } from 'zod';
import TrackService from "@/services/TrackService.ts";
import { StorageService } from "@/services/StorageService.ts";
import { PaginationQuerySchema } from "@/model/dto/CommonDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { requirePermission } from "@/middleware/AuthMiddleware";
import { Capability } from "@/generated/prisma/client";
import { paginated } from "@/util/pagination";
import type { TrackResponse } from "@/model/dto";

const trackController = new Hono();

const trackService = new TrackService();
const storageService = new StorageService();

const QuerySchema = PaginationQuerySchema.extend({
    name: z.string().optional(),
    artistID: z.string().optional(),
    albumID: z.string().optional(),
});

trackController
    .get("/",
        validate("query", QuerySchema),
        requirePermission(Capability.READ, "tracks"),
        async (c) => {
            const { page, limit, name, albumID, artistID } = c.req.valid('query')
            const tracks = await trackService.findAll(name, albumID, artistID, { skip: page * limit, take: limit });

            const response = await Promise.all(tracks.map(async (track) => {
                const dto = DTOMapper.toTrackResponse(track);
                if (dto.thumbnail) {
                    dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
                }
                return dto;
            }));

            return c.json(paginated<TrackResponse>(response, page, limit));
        });

trackController
    .get("/:id",
        requirePermission(Capability.READ, "tracks"),
        async (c) => {
            const { id } = c.req.param();
            const track = await trackService.findById(id);

            const dto = DTOMapper.toTrackResponse(track);
            if (dto.thumbnail) {
                dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
            }

            return c.json(dto);
        });

trackController
    .get("/:id/file",
        requirePermission(Capability.READ, "tracks"),
        async (c) => {
            const { id } = c.req.param();
            const track = await trackService.findById(id);

            const url = await storageService.getPresignedUrl(track.path);

            // TODO: Redirigir
            return c.json({ url });
        });

trackController
    .get("/:id/thumbnail",
        requirePermission(Capability.READ, "tracks"),
        async (c) => {
            const { id } = c.req.param();
            const thumbnailPath = await trackService.getThumbnail(id);

            if (!thumbnailPath) {
                return c.json({ thumbnail: null });
            }

            const url = await storageService.getPresignedUrl(thumbnailPath);

            // TODO: Redirigir
            return c.json({ thumbnail: url });
        })

trackController
    .delete("/:id",
        requirePermission(Capability.DELETE, "tracks"),
        async (c) => {
            const { id } = c.req.param();
            const userId = c.get('userId');

            await trackService.delete(id, userId);

            return c.body(null, 204);
        });


export default trackController;
