import { Hono } from "hono";
import { logger } from "hono/logger";

import {
    artistController,
    albumController,
    trackController,
    playlistController,
    authController,
    meController,
    searchController,
    lyricsController,
} from "@/controller/index.ts";


import swaggerMiddleware from "@/middleware/swagger.ts";
import { authMiddleware } from "@/middleware/AuthMiddleware.ts";
import { requestContext } from '@/middleware/requestContext.ts'
import { errorHandler } from "@/middleware/errorHandler.ts";
import { StorageService } from "@/services/StorageService.ts";

await new StorageService().initialize({ failOnError: true });

const app = new Hono();

app.use(logger());
app.use('*', requestContext())
app.onError(errorHandler)

const api = app.basePath("/api");


// Rutas publicas 
api.route("/auth", authController);
api.route("/swagger", swaggerMiddleware);

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
