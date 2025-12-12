import { Hono } from "hono";

import ArtistService from "@/services/ArtistService.ts";
import { StorageService } from "@/services/StorageService.ts";

import { PaginationQuerySchema } from "@/model/dto/CommonDTO.ts";
import { ArtistCreateSchema } from "@/model/dto/ArtistDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { NotFoundError } from "@/error/ApiError.ts";
import { requirePermission } from '@/middleware/AuthMiddleware'
import { Capability } from "@/generated/prisma/client";

const artistController = new Hono();
const service = new ArtistService();
const storageService = new StorageService();


artistController.get("/", validate("query", PaginationQuerySchema), requirePermission(Capability.READ, "artists"), async (c) => {
    const { page, limit } = c.req.valid('query')
    const artists = await service.findAll({ skip: page, take: limit });
    return c.json(artists.map(DTOMapper.toArtistResponse));
});

artistController.post("/", validate("json", ArtistCreateSchema), requirePermission(Capability.CREATE, "artists"), async (c) => {
    const body = c.req.valid("json");
    const artist = await service.create(body.name);
    return c.json(DTOMapper.toArtistResponse(artist), 201);
});

artistController.get("/:id", requirePermission(Capability.READ, "artists"), async (c) => {
    const { id } = c.req.param();
    const artist = await service.findByID(id);
    return c.json(DTOMapper.toArtistResponse(artist));
});

artistController.delete("/:id", requirePermission(Capability.DELETE, "artists"), async (c) => {
    const { id } = c.req.param();
    const deleted = await service.delete(id);
    if (!deleted) {
        throw new NotFoundError("No se encontro el artista");
    }

    return c.body(null, 204);
});

artistController.get("/:id/albums", requirePermission(Capability.READ, "artists"), validate("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const { id } = c.req.param();

    const albums = await service.getAlbumsByArtist(id, { skip: page, take: limit });
    
    const response = await Promise.all(albums.map(async (album) => {
        const dto = DTOMapper.toAlbumResponse(album);
        if (dto.cover) {
             dto.cover = await storageService.getPresignedUrl(dto.cover);
        }
        return dto;
    }));

    return c.json(response);
});

artistController.get("/:id/tracks", requirePermission(Capability.READ, "artists"), validate("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const { id } = c.req.param();

    const tracks = await service.getTracksByArtist(id, { skip: page, take: limit });
    
    const response = await Promise.all(tracks.map(async (track) => {
        const dto = DTOMapper.toTrackResponse(track);
        if (dto.thumbnail) {
             dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
        }
        return dto;
    }));

    return c.json(response);
});

artistController.get("/:id/singles", requirePermission(Capability.READ, "artists"), validate("query", PaginationQuerySchema), async (c) => {
    const { page, limit } = c.req.valid('query')
    const { id } = c.req.param();

    const singles = await service.getSinglesByArtist(id, { skip: page, take: limit });
    
    const response = await Promise.all(singles.map(async (track) => {
        const dto = DTOMapper.toTrackResponse(track);
        if (dto.thumbnail) {
             dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
        }
        return dto;
    }));

    return c.json(response);
});

export default artistController;
