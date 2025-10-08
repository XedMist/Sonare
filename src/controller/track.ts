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

router.get("/:id", async (c) => {
  const { id } = c.req.param();
  const track = await service.findById(Number(id));

  if (track) {
    return c.json(track);
  } else {
    return c.json({ message: "Track not found" }, 404);
  }
});

router.get("/:id/file", async (c) => {
  const { id } = c.req.param();
  const track = await service.downloadTrack(Number(id));

  if (track) {
    return c.json(track);
  } else {
    return c.json({ message: "Track not found" }, 404);
  }
});

export default router;
