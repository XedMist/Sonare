import PlaylistService from "../services/PlaylistService.ts";
import { zValidator } from "@hono/zod-validator";
import { playlistCreateSchema } from "../model/Playlist.ts";
import { Hono } from "hono";
import * as z from "zod";

const router = new Hono();
const service = new PlaylistService();

router.get("/", async (c) => {
  const playlists = await service.findAll();
  return c.json(playlists);
});

// El zValidator comprueba que lo que se pase en el curpo de la
// peticion es lo que se espera. El omit es para que no pasen la id
router.post(
  "/",
  zValidator("json", playlistCreateSchema),
  async (c) => {
    const body = c.req.valid("json");
    const created = await service.create(body);

    if (created) {
      return c.json(created, 201);
    } else {
      return c.json(
        { message: "Invalid user or tracks not found" },
        400,
      );
    }
  },
);

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const playlist = await service.findById(Number(id));

  if (playlist) {
    return c.json(playlist);
  } else {
    return c.json({ message: "Playlist not found" }, 404);
  }
});

// Endpoint para obtener playlists por usuario
router.get("/user/:userId", async (c) => {
  const { userId } = c.req.param();
  const playlists = await service.findByUserId(Number(userId));
  return c.json(playlists);
});

// Endpoint para obtener la duración total de una playlist
router.get("/:id/duration", async (c) => {
  const { id } = c.req.param();
  const duration = await service.getTotalDuration(Number(id));

  if (duration !== null) {
    return c.json({ playlistId: Number(id), totalDuration: duration });
  } else {
    return c.json({ message: "Playlist not found" }, 404);
  }
});

// Endpoint para añadir un track a una playlist
router.post(
  "/:id/tracks",
  zValidator("json", z.object({ trackId: z.number() })),
  async (c) => {
    const { id } = c.req.param();
    const { trackId } = c.req.valid("json");
    const playlist = await service.addTrack(Number(id), trackId);

    if (playlist) {
      return c.json(playlist);
    } else {
      return c.json({ message: "Playlist or track not found" }, 404);
    }
  },
);

// Endpoint para eliminar un track de una playlist
router.delete("/:id/tracks/:trackId", async (c) => {
  const { id, trackId } = c.req.param();
  const playlist = await service.removeTrack(Number(id), Number(trackId));

  if (playlist) {
    return c.json(playlist);
  } else {
    return c.json({ message: "Playlist not found" }, 404);
  }
});

router.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const deleted = await service.delete(Number(id));

  if (deleted) {
    return c.body(null, 204);
  } else {
    return c.json({ message: "Playlist not found" }, 404);
  }
});

export default router;
