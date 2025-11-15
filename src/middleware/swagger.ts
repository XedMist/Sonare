import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiDoc } from "./openapi.ts";

const swaggerMiddleware = new Hono();

swaggerMiddleware.get("/doc", (c) => c.json(openApiDoc));
swaggerMiddleware.get("/ui", swaggerUI({ url: "/api/swagger/doc" }));

export default swaggerMiddleware;
