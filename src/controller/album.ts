import AlbumService from "../services/AlbumService.ts";
import { Hono } from "hono";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'


const albumController = new Hono();
const service = new AlbumService();

const PaginationQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default(0).pipe(z.number().min(0)),
    limit: z.string().regex(/^\d+$/).transform(Number).default(10).pipe(z.number().min(1).max(100)),
});


albumController.get("/", zValidator("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const albums = await service.findAll({ skip: page, take: limit });
    return c.json(albums);
});

albumController.get("/:id", async (c) => {
    const { id } = c.req.param();
    const album = await service.findByID(id);
    return c.json(album);
});

albumController.get("/:id/tracks", zValidator("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const { id } = c.req.param();

    const albums = await service.getTracksOfAlbum(id, { skip: page, take: limit });
    return c.json(albums);
});

export default albumController;
