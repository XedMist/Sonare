import { Hono } from "hono";
import userRouter from "./controller/user.ts";
import artistRouter from "./controller/artist.ts";
import { logger } from "hono/logger";
import swaggerMiddleware from "./middleware/swagger.ts";

const app = new Hono();
app.use(logger());

app.route("/api/users", userRouter);
app.route("/api/artists", artistRouter);
app.route("/api/swagger", swaggerMiddleware);

export default app;
