import { Hono } from "hono";
import { z } from "zod";

import SearchService from "@/services/SearchService.ts";
import { StorageService } from "@/services/StorageService.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { requirePermission } from "@/middleware/AuthMiddleware";
import { Capability } from "@/generated/prisma/client";

const searchController = new Hono();
const service = new SearchService();
const storageService = new StorageService();

const SearchQuerySchema = z.object({
    q: z.string().min(3),
    type: z.string().optional().default("artist,album,track")
});

searchController.get("/", validate("query", SearchQuerySchema), requirePermission(Capability.READ, "tracks"), async (c) => {
    const { q, type } = c.req.valid("query");
    const types = type.split(",");
    
    const result = await service.search(q, types);

    const tracks = await Promise.all(result.tracks.map(async (track) => {
        const dto = DTOMapper.toTrackResponse(track);
        if (dto.thumbnail) {
             dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
        }
        return dto;
    }));

    const relatedTracks: Record<string, any[]> = {};
    for (const [trackId, trackList] of Object.entries(result.relatedTracks)) {
         relatedTracks[trackId] = await Promise.all(trackList.map(async (track) => {
            const dto = DTOMapper.toTrackResponse(track);
            if (dto.thumbnail) {
                 dto.thumbnail = await storageService.getPresignedUrl(dto.thumbnail);
            }
            return dto;
        }));
    }

    const albums = await Promise.all(result.albums.map(async (album) => {
        const dto = DTOMapper.toAlbumResponse(album);
        if (dto.cover) {
             dto.cover = await storageService.getPresignedUrl(dto.cover);
        }
        return dto;
    }));

    return c.json({
        artists: result.artists.map(DTOMapper.toArtistResponse),
        albums: albums,
        tracks: tracks,
        relatedTracks
    });
});

export default searchController;
