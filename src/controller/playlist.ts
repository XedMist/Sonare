import { Hono } from "hono";

import PlaylistService from "@/services/PlaylistService.ts";

import { PaginationQuerySchema } from "@/model/dto/CommonDTO.ts";
import { PlaylistCreateSchema } from "@/model/dto/PlaylistDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { NotFoundError } from "@/error/ApiError.ts";

const playlistController = new Hono();

const service = new PlaylistService();

playlistController.get("/", validate("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const playlists = await service.findAll({ skip: page, take: limit });
    return c.json(playlists.map(DTOMapper.toPlaylistResponse));
});

playlistController.post("/", validate("json", PlaylistCreateSchema), async (c) => {
    const body = c.req.valid("json");
    const playlist = await service.create(body.name, body.userID);
    return c.json(DTOMapper.toPlaylistResponse(playlist), 201);
});

playlistController.get("/:id", async (c) => {
    const { id } = c.req.param();
    const playlist = await service.findByID(id);
    return c.json(DTOMapper.toPlaylistResponse(playlist));
});

playlistController.delete("/:id", async (c) => {
    const { id } = c.req.param();
    const deleted = await service.delete(id);
    if (!deleted) {
        throw new NotFoundError("Playlist no encontrada");
    }

    return c.body(null, 204);
});



export default playlistController;
