import TrackService from "../services/TrackService.ts";
import { zValidator } from "@hono/zod-validator";
import { trackSchema } from "../model/Track.ts";
import { Hono } from "hono";

const router = new Hono();
const service = new TrackService();

router.get("/", async (c) => {
  const tracks = await service.findAll();
  return c.json(tracks);
});

// El zValidator comprueba que lo que se pase en el curpo de la
// peticion es lo que se espera. El omit es para que no pasen la id
router.post(
  "/",
  zValidator("json", trackSchema.omit({ id: true })),
  async (c) => {
    const body = c.req.valid("json");
    const created = await service.create(body);

    return c.json(created, 201);
  },
);

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const track = await service.findById(Number(id));

  if (track) {
    return c.json(track);
  } else {
    return c.json({ message: "Track not found" }, 404);
  }
});

// Endpoint adicional para obtener tracks por album
router.get("/album/:albumId", async (c) => {
  const { albumId } = c.req.param();
  const tracks = await service.findByAlbumId(Number(albumId));
  return c.json(tracks);
});

router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const track = await service.delete(Number(id));

  if (track) {
    return c.json({ message: "Track deleted" });
  } else {
    return c.json({ message: "Track not found" }, 404);
  }
});

export default router;
