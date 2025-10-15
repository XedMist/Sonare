import ArtistService from "../services/ArtistService.ts";
import { zValidator } from "@hono/zod-validator";
import { artistSchema } from "../model/Artist.ts";
import { Hono } from "hono";

const router = new Hono();
const service = new ArtistService();

router.get("/", async (c) => {
  const artists = await service.findAll();
  return c.json(artists);
});

router.post(
  "/",
  zValidator("json", artistSchema.omit({ id: true })),
  async (c) => {
    const body = c.req.valid("json");
    const created = await service.create(body);

    return c.json(created, 201);
  },
);

export default router;
