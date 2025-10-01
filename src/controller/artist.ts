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

// El zValidator comprueba que lo que se pase en el curpo de la
// peticion es lo que se espera. El omit es para que no pasen la id
router.post(
  "/",
  zValidator("json", artistSchema.omit({ id: true })),
  async (c) => {
    const body = c.req.valid("json");
    const created = await service.create(body);

    return c.json(created, 201);
  },
);

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const artist = await service.findById(Number(id));

  if (artist) {
    return c.json(artist);
  } else {
    return c.json({ message: "Artist not found" }, 404);
  }
});

router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const artist = await service.delete(Number(id));

  if (artist) {
    return c.json({ message: "Artist deleted" });
  } else {
    return c.json({ message: "Artist not found" }, 404);
  }
});

export default router;
