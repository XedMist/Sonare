import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiDoc } from "@/middleware/openapi.ts";
import { Scalar } from "@scalar/hono-api-reference";

const docsController = new Hono();

docsController.get("/spec", (c) => c.json(openApiDoc));
docsController.get("/swagger", swaggerUI({ url: "/api/docs/spec" }));
docsController.get("/scalar", Scalar({ url: "/api/docs/spec" }));

export default docsController;
