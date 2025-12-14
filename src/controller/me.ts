import { Hono } from "hono";

import MeService from "@/services/MeService.ts";

import { DTOMapper } from "@/model/mappers.ts";
import { requirePermission } from "@/middleware/AuthMiddleware"
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { PlaylistTrackActionSchema } from "@/model/dto/PlaylistDTO.ts";
import { PaginationQuerySchema } from "@/model/dto";
import { Capability } from "@/generated/prisma/client";

const meController = new Hono();
const service = new MeService();

meController.get("/", requirePermission(Capability.READ, "me"), async (c) => {
    const userID = c.get("userId");
    const me = await service.getMe(userID);
    return c.json(DTOMapper.toUserResponse(me));
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
