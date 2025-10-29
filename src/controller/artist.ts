import ArtistService from "../services/ArtistService.ts";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {ArtistCreateOneSchema, ArtistFindManySchema} from '@/generated/zod/schemas'

const router = new Hono();
const service = new ArtistService();

router.get("/",
    
    zValidator("query", ArtistFindManySchema),
    async (c) => {

    const artists = await service.findAll();
    return c.json(artists);
});

router.post(
    "/",
    zValidator("json", ArtistCreateOneSchema),
    async (c) => {
        const body = c.req.valid("json");
        const created = await service.create({
            name: body.data.name,
        });

        return c.json(created, 201);
    },
);

router.get("/:id", async (c) => {
    const { id } = c.req.param();
    const artist = await service.findById({ id });

    if (artist) {
        return c.json(artist);
    } else {
        return c.json({ message: "Artist not found" }, 404);
    }
});

router.delete("/:id", async (c) => {
    const { id } = c.req.param();
    const deleted = await service.delete({ id });

    if (deleted) {
      return c.body(null, 204);
    } else {
      return c.json({ message: "Artist not found" }, 404);
    }
});

export default router;
