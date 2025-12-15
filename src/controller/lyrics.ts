import { Hono } from "hono";

import LyricsService from "@/services/LyricsService.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";
import { requirePermission } from "@/middleware/AuthMiddleware.ts";
import { Capability } from "@/generated/prisma/client";
import { LyricsCreateSchema, LyricsUpdateSchema } from "@/model/dto/LyricsDTO.ts";

const lyricsController = new Hono();
const service = new LyricsService();

lyricsController.get("/:trackID", requirePermission(Capability.READ, "lyrics"), async (c) => {
    const { trackID } = c.req.param();
    const lyrics = await service.getLyricsByTrackID(trackID);
    const dto = DTOMapper.toLyricsResponse(lyrics);
    return c.json(dto);
});

lyricsController.post("/", validate("json", LyricsCreateSchema), requirePermission(Capability.CREATE, "lyrics"), async (c) => {    const data = c.req.valid("json");
    if (!data.syncedLyrics) {
        return c.json({ error: "Synced lyrics are required" }, 400);
    }
    const created = await service.createLyrics(data.trackID, data.syncedLyrics);
    const dto = DTOMapper.toLyricsResponse(created);
    return c.json(dto, 201);
});

lyricsController.put("/:trackID", validate("json", LyricsUpdateSchema), requirePermission(Capability.UPDATE, "lyrics"), async (c) => {
    const { trackID } = c.req.param();
    const data = c.req.valid("json");
    if (!data.syncedLyrics) {
        return c.json({ error: "Synced lyrics are required" }, 400);
    }
    const updated = await service.updateLyrics(trackID, { syncedLyrics: data.syncedLyrics });
    const dto = DTOMapper.toLyricsResponse(updated);
    return c.json(dto);
});

lyricsController.delete("/:trackID", requirePermission(Capability.DELETE, "lyrics"), async (c) => {
    const { trackID } = c.req.param();
    await service.deleteLyrics(trackID);
    return c.body(null, 204);
});

export { lyricsController };

