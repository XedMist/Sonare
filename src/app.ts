import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import {
    artistController,
    albumController,
    trackController,
    playlistController,
    authController,
    meController,
    searchController,
    lyricsController,
    docsController,
} from "@/controller/index.ts";

import swaggerMiddleware from "@/middleware/swagger.ts";
import { authMiddleware } from "@/middleware/AuthMiddleware.ts";
import { requestContext } from '@/middleware/requestContext.ts'
import { errorHandler } from "@/middleware/errorHandler.ts";
import { StorageService } from "@/services/StorageService.ts";
import { rateLimiter } from "./middleware/rateLimiter";
import { Scalar } from '@scalar/hono-api-reference'

await new StorageService().initialize({ failOnError: true });

const app = new Hono();

app.use(logger());
app.use("*", cors())
app.use('*', requestContext())
app.onError(errorHandler)

const api = app.basePath("/api");
api.use(rateLimiter({
    capacity: 20 * 5,
    refillRate: 20,
    cost: (c) => (c.req.method === 'POST' ? 5 : 1),
}));

// Rutas publicas 
api.route("/auth", authController);
api.route("/docs", docsController);

// Rutas con auth 
api.use("/artists/*", authMiddleware);
api.use("/albums/*", authMiddleware);
api.use("/tracks/*", authMiddleware);
api.use("/playlists/*", authMiddleware);
api.use("/me/*", authMiddleware);
api.use("/search/*", authMiddleware);
api.use("/lyrics/*", authMiddleware);

api.route("/artists", artistController);
api.route("/albums", albumController);
api.route("/tracks", trackController);
api.route("/playlists", playlistController);
api.route("/me", meController);
api.route("/search", searchController);
api.route("/lyrics", lyricsController);

export default app;
