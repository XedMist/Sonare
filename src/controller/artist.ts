import ArtistService from "../services/ArtistService.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from 'zod'
import { Hono } from "hono";
import { ArtistCreateInputObjectSchema } from "@/generated/zod/schemas/index.ts";

const artistController = new Hono();
const service = new ArtistService();

const PaginationQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default(0).pipe(z.number().min(0)),
    limit: z.string().regex(/^\d+$/).transform(Number).default(10).pipe(z.number().min(1).max(100)),
});


artistController.get("/", zValidator("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const artists = await service.findAll({ skip: page, take: limit });
    return c.json(artists);
});

artistController.post("/", zValidator("json", ArtistCreateInputObjectSchema), async (c) => {
    const body = c.req.valid("json");
    const artist = await service.create(body.name);
    return c.json(artist, 201);
});

artistController.get("/:id", async (c) => {
    const { id } = c.req.param();
    const artist = await service.findByID(id);
    return c.json(artist);
});

artistController.delete("/:id", async (c) => {
    const { id } = c.req.param();
    await service.delete(id);
    return c.body(null, 204);
});

artistController.get("/:id/albums", zValidator("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const { id } = c.req.param();

    const artists = await service.getAlbumsByArtist(id, { skip: page, take: limit });
    return c.json(artists);
});

artistController.get("/:id/tracks", zValidator("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const { id } = c.req.param();

    const artists = await service.getTracksByArtist(id, { skip: page, take: limit });
    return c.json(artists);
});

export default artistController;
