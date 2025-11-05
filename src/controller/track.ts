import { zValidator } from "@hono/zod-validator";
import TrackService from "../services/TrackService.ts";
import { Hono } from "hono";
import { TrackFindManySchema } from '../generated/zod/schemas'
import { z } from 'zod';
import { stream } from "hono/streaming"
import { bodyLimit } from "hono/body-limit";

const router = new Hono();
const service = new TrackService();

const QuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default(0).pipe(z.number().min(0)),
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
    const track = await service.findById(id);

    if (track === null) {
        return c.json({ message: "Track not found" }, 404);
    }

    const file = Bun.file(track.path);
    c.header("Content-Type", "audio/mp4")
    return stream(c, async (stream) => {
        stream.pipe(file.stream());
    })
});

router.get("/:id/thumbnail", async (c) => {
    const { id } = c.req.param();
    const thumbnail = await service.getThumbnail(id)
    return c.json(thumbnail)
})

export default router;
