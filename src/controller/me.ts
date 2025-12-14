import { Hono } from "hono";

import MeService from "@/services/MeService.ts";

import { DTOMapper } from "@/model/mappers.ts";
import { requirePermission } from "@/middleware/AuthMiddleware"
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { PlaylistTrackActionSchema } from "@/model/dto/PlaylistDTO.ts";
import { PaginationQuerySchema } from "@/model/dto";
import { Capability } from "@/generated/prisma/client";
import { UserProfileUpdateSchema } from '@/model/dto/UserDTO.ts';
import { ValidationError } from '@/error/ApiError.ts';
import { Buffer } from 'node:buffer';

const meController = new Hono();
const service = new MeService();

meController.get("/", requirePermission(Capability.READ, "me"), async (c) => {
    const userID = c.get("userId");
    const me = await service.getMe(userID);
    return c.json(DTOMapper.toUserResponse(me));
});

meController.patch("/", validate("json", UserProfileUpdateSchema), requirePermission(Capability.UPDATE, "me"), async (c) => {
    const userID = c.get("userId");
    const payload = c.req.valid("json");
    const updated = await service.updateProfile(userID, payload);
    return c.json(DTOMapper.toUserResponse(updated));
});

meController.post("/avatar", requirePermission(Capability.UPDATE, "me"), async (c) => {
    const userID = c.get("userId");
    const body = await c.req.parseBody();
    const rawFile = Array.isArray(body.avatar) ? body.avatar[0] : body.avatar;

    if (!rawFile || typeof (rawFile as any).arrayBuffer !== 'function') {
        throw new ValidationError('No se ha adjuntado ninguna imagen');
    }

    const upload = rawFile as {
        arrayBuffer: () => Promise<ArrayBuffer>;
        type?: string;
        size?: number;
        name?: string;
    };

    const arrayBuffer = await upload.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const updated = await service.updateAvatar(userID, {
        buffer,
        mimeType: upload.type ?? 'application/octet-stream',
        size: typeof upload.size === 'number' ? upload.size : buffer.byteLength,
        fileName: upload.name,
    });

    return c.json(DTOMapper.toUserResponse(updated));
});

meController.get("/playlists", validate("query", PaginationQuerySchema), requirePermission(Capability.READ, "me"), async (c) => {
    const userID = c.get("userId");
    const { page: skip, limit: take } = c.req.valid("query");
    const playlists = await service.getMyPlaylists(userID, { skip, take });
    return c.json(playlists.map(DTOMapper.toPlaylistResponse));
});

meController.get("/favorites", requirePermission(Capability.READ, "me"), async (c) => {
    const userID = c.get("userId");
    const favorites = await service.getMyFavorites(userID);
    return c.json(favorites.map(DTOMapper.toTrackResponse));
});

meController.put("/favorites", validate("json", PlaylistTrackActionSchema), requirePermission(Capability.UPDATE, "me"), async (c) => {
    const userID = c.get("userId");
    const { trackID } = c.req.valid("json");
    await service.likeTrack(userID, trackID);
    return c.body(null, 204);
});

meController.delete("/favorites", validate("json", PlaylistTrackActionSchema), requirePermission(Capability.UPDATE, "me"), async (c) => {
    const userID = c.get("userId");
    const { trackID } = c.req.valid("json");
    await service.unlikeTrack(userID, trackID);
    return c.body(null, 204);
});


export default meController;