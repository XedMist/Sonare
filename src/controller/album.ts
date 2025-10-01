import AlbumService from "../services/AlbumService.ts";
import { zValidator } from "@hono/zod-validator";
import { albumSchema } from "../model/Album.ts";
import { Hono } from "hono";

const router = new Hono();
const service = new AlbumService();

router.get("/", async (c) => {
  const albums = await service.findAll();
  return c.json(albums);
});

// El zValidator comprueba que lo que se pase en el curpo de la
// peticion es lo que se espera. El omit es para que no pasen la id
router.post(
  "/",
  zValidator("json", albumSchema.omit({ id: true })),
  async (c) => {
    const body = c.req.valid("json");
    const created = await service.create(body);

    return c.json(created, 201);
  },
);

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const album = await service.findById(Number(id));

  if (album) {
    return c.json(album);
  } else {
    return c.json({ message: "Album not found" }, 404);
  }
});

router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const album = await service.delete(Number(id));

  if (album) {
    return c.json({ message: "Album deleted" });
  } else {
    return c.json({ message: "Album not found" }, 404);
  }
});

export default router;
