import { Hono } from "hono";

import ArtistService from "@/services/ArtistService.ts";

import { PaginationQuerySchema } from "@/model/dto/CommonDTO.ts";
import { ArtistCreateSchema } from "@/model/dto/ArtistDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { NotFoundError } from "@/error/ApiError.ts";

const artistController = new Hono();
const service = new ArtistService();


artistController.get("/", validate("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const artists = await service.findAll({ skip: page, take: limit });
    return c.json(artists.map(DTOMapper.toArtistResponse));
});

artistController.post("/", validate("json", ArtistCreateSchema), async (c) => {
    const body = c.req.valid("json");
    const artist = await service.create(body.name);
    return c.json(DTOMapper.toArtistResponse(artist), 201);
});

artistController.get("/:id", async (c) => {
    const { id } = c.req.param();
    const artist = await service.findByID(id);
    return c.json(DTOMapper.toArtistResponse(artist));
});

artistController.delete("/:id", async (c) => {
    const { id } = c.req.param();
    const deleted = await service.delete(id);
    if (!deleted) {
        throw new NotFoundError("No se encontro el artista");
    }

    return c.body(null, 204);
});

artistController.get("/:id/albums", validate("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const { id } = c.req.param();

    const albums = await service.getAlbumsByArtist(id, { skip: page, take: limit });
    return c.json(albums.map(DTOMapper.toAlbumResponse));
});

artistController.get("/:id/tracks", validate("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const { id } = c.req.param();

    const tracks = await service.getTracksByArtist(id, { skip: page, take: limit });
    return c.json(tracks.map(DTOMapper.toTrackResponse));
});

export default artistController;
