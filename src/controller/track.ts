import { zValidator } from "@hono/zod-validator";
import TrackService from "../services/TrackService.ts";
import { Hono } from "hono";
import { TrackFindManySchema } from '../generated/zod/schemas'
import { z } from 'zod'

const router = new Hono();
const service = new TrackService();

const QuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default(1).pipe(z.number().min(1)),
    limit: z.string().regex(/^\d+$/).transform(Number).default(10).pipe(z.number().min(1).max(100)),
    name: z.string().optional(),
    artistID: z.string().optional(),
    albumID: z.string().optional(),
});

router.get("/", zValidator("query", QuerySchema), async (c) => {
    const { page, limit, name, albumID, artistID } = c.req.valid('query')
    const tracks = await service.findAll(name, albumID, artistID, { skip: page, take: limit });
    return c.json(tracks);
});

router.get("/:id", async (c) => {
    const { id } = c.req.param();
    const track = await service.findById(id);
    return track === null ? c.json(404) : c.json(track);
});

router.get("/:id/file", async (c) => {
    const { id } = c.req.param();
    const result = await service.downloadTrack({ id });

    if (result !== null) {
        c.header("Content-Type", result.mimeType);
        return c.body(result.data as any);
    } else {
        return c.json({ message: "Track not found" }, 404);
    }
});

router.get("/:id/thumbnail", async (c) => {
    const { id } = c.req.param();
    const thumbnail = await service.getThumbnail(id)
    return c.json(thumbnail)
})

export default router;
