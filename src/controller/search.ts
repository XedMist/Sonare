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

const UnifiedSearchQuerySchema = z.object({
    q: z.string().min(3),
});

searchController
    .get("/unified",
        validate("query", UnifiedSearchQuerySchema),
        requirePermission(Capability.READ, "tracks"),
        async (c) => {
            const { q } = c.req.valid("query");

            const result = await service.searchUnified(q);

            // Process items with presigned URLs
            const items = await Promise.all(result.items.map(async (item) => {
                if (item.type === 'artist' && item.artist) {
                    const dto = DTOMapper.toArtistResponse(item.artist);
                    if (dto.image) {
                        dto.image = await storageService.getPresignedUrl(dto.image);
                    }
                    return { ...item, artist: dto };
                } else if (item.type === 'album' && item.album) {
                    // Build album response manually to preserve partial artist
                    const albumDto = {
                        id: item.album.id,
                        name: item.album.name,
                        cover: item.album.cover ? await storageService.getPresignedUrl(item.album.cover) : undefined,
                        artistID: item.album.artistID,
                        createdAt: item.album.createdAt,
                        updatedAt: item.album.updatedAt,
                        artist: item.album.artist,
                    };
                    return { ...item, album: albumDto };
                } else if (item.type === 'track' && item.track) {
                    // Build track response manually to preserve partial album
                    const trackDto = {
                        id: item.track.id,
                        path: item.track.path,
                        name: item.track.name,
                        duration: item.track.duration,
                        thumbnail: item.track.thumbnail ? await storageService.getPresignedUrl(item.track.thumbnail) : undefined,
                        albumID: item.track.albumID,
                        createdAt: item.track.createdAt,
                        updatedAt: item.track.updatedAt,
                        album: item.track.album,
                    };
                    return { ...item, track: trackDto };
                }
                return item;
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

            return c.json({ items, relatedTracks });
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

    const artists = await Promise.all(result.artists.map(async (artist) => {
        const dto = DTOMapper.toArtistResponse(artist);
        if (dto.image) {
            dto.image = await storageService.getPresignedUrl(dto.image);
        }
        return dto;
    }));

    return c.json({
        artists: artists,
        albums: albums,
        tracks: tracks,
        relatedTracks
    });
});

export default searchController;
