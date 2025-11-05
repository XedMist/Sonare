import PlaylistService from "../services/PlaylistService.ts";
import { zValidator } from "@hono/zod-validator";
import { playlistCreateSchema } from "../model/Playlist.ts";
import { Hono } from "hono";
import * as z from "zod";
import { PlaylistCreateInputObjectSchema } from "@/generated/zod/schemas/index.ts";

const playlistController = new Hono();
const service = new PlaylistService();

const PaginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1).pipe(z.number().min(1)),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10).pipe(z.number().min(1).max(100)),
});

const PlaylistCreateSchema = z.object({
  name: z.string().min(1).max(100),
  userID: z.string().min(1),
});


playlistController.get("/", zValidator("query", PaginationQuerySchema), async (c) => {
  const { page, limit } = c.req.valid('query')
  const playlists = await service.findAll({ skip: page, take: limit });
  return c.json(playlists);
});

playlistController.post("/", zValidator("json", PlaylistCreateSchema), async (c) => {
  const body = c.req.valid("json");
  const playlist = await service.create(body.name, body.userID);
  return c.json(playlist, 201);
});

playlistController.get("/:id", async (c) => {
  const {id} = c.req.param();
  const playlist = await service.findByID(id);
  return c.json(playlist);
});

playlistController.delete("/:id", async (c) => {
  const { id } = c.req.param();
  await service.delete(id);
  return c.body(null, 204);
});



export default playlistController;
