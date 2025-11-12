import { Hono } from "hono";
import userRouter from "./controller/user.ts";
import artistRouter from "./controller/artist.ts";
import albumRouter from "./controller/album.ts";
import trackRouter from "./controller/track.ts";
import playlistRouter from "./controller/playlist.ts";
import loginRouter from "./controller/login.ts";
import { logger } from "hono/logger";
import swaggerMiddleware from "./middleware/swagger.ts";

import {jwt} from "hono/jwt";
import type { JwtVariables } from 'hono/jwt';

const authMiddleware = jwt({
    secret: process.env.JWT_SECRET ?? 'secreto',
});

const app = new Hono();
app.use(logger());
const api = app.basePath("/api");

api.use("/users/*", authMiddleware).route("/users", userRouter);
api.use("/artists/*", authMiddleware).route("/artists", artistRouter);
api.use("/albums/*", authMiddleware).route("/albums", albumRouter);
api.use("/tracks/*", authMiddleware).route("/tracks", trackRouter);
api.use("/playlists/*", authMiddleware).route("/playlists", playlistRouter);
api.route("/login", loginRouter);
api.route("/swagger", swaggerMiddleware);

export default app;
