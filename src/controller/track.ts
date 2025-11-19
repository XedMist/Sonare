import { Hono } from "hono";
import { z } from 'zod';
import { stream } from "hono/streaming"

import TrackService from "@/services/TrackService.ts";
import { PaginationQuerySchema } from "@/model/dto/CommonDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { requirePermission } from "@/middleware/AuthMiddleware";
import { Capability } from "@/generated/prisma/client";

const router = new Hono();
const service = new TrackService();

const QuerySchema = PaginationQuerySchema.extend({
    name: z.string().optional(),
    artistID: z.string().optional(),
    albumID: z.string().optional(),
});

router.get("/", validate("query", QuerySchema), requirePermission(Capability.READ, "tracks"), async (c) => {
    const { page, limit, name, albumID, artistID } = c.req.valid('query')
    const tracks = await service.findAll(name, albumID, artistID, { skip: page, take: limit });
    return c.json(tracks.map(DTOMapper.toTrackResponse));
});

router.get("/:id", requirePermission(Capability.READ, "tracks"), async (c) => {
    const { id } = c.req.param();
    const track = await service.findById(id);
    return track ? c.json(DTOMapper.toTrackResponse(track)) : c.json({ message: "Track not found" }, 404);
});

router.get("/:id/file", requirePermission(Capability.READ, "tracks"), async (c) => {
    const { id } = c.req.param();
    const track = await service.findById(id);

    const file = Bun.file(track.path);
    c.header("Content-Type", "audio/mp4")

    return stream(c, async (stream) => {
        stream.pipe(file.stream());
    })
});

router.get("/:id/thumbnail", requirePermission(Capability.READ, "tracks"), async (c) => {
    const { id } = c.req.param();
    const thumbnail = await service.getThumbnail(id)
    return c.json({ thumbnail })
})

export default router;
