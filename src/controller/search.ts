import { Hono } from "hono";
import { z } from "zod";

import SearchService from "@/services/SearchService.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { requirePermission } from "@/middleware/AuthMiddleware";
import { Capability } from "@/generated/prisma/client";

const searchController = new Hono();
const service = new SearchService();

const SearchQuerySchema = z.object({
    q: z.string().min(3),
    type: z.string().optional().default("artist,album,track")
});

searchController.get("/", validate("query", SearchQuerySchema), requirePermission(Capability.READ, "tracks"), async (c) => {
    const { q, type } = c.req.valid("query");
    const types = type.split(",");
    
    const result = await service.search(q, types);

    return c.json({
        artists: result.artists.map(DTOMapper.toArtistResponse),
        albums: result.albums.map(DTOMapper.toAlbumResponse),
        tracks: result.tracks.map(DTOMapper.toTrackResponse)
    });
});

export default searchController;
