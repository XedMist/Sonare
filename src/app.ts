import { Hono } from "hono";
import userRouter from "./controller/user.ts";
import artistRouter from "./controller/artist.ts";
import albumRouter from "./controller/album.ts";
import trackRouter from "./controller/track.ts";
import playlistRouter from "./controller/playlist.ts";
import { logger } from "hono/logger";
import swaggerMiddleware from "./middleware/swagger.ts";

const app = new Hono();
app.use(logger());

app.route("/api/users", userRouter);
app.route("/api/artists", artistRouter);
app.route("/api/albums", albumRouter);
app.route("/api/tracks", trackRouter);
app.route("/api/playlists", playlistRouter);
app.route("/api/swagger", swaggerMiddleware);

export default app;
