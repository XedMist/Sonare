import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

//  Esto es la especificacion de la api
const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "API Documentation",
    version: "1.0.0",
    description: "API documentation for Sonare",
  },
  paths: {
    "/api/users": {
      get: {
        summary: "Finds all users",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
      post: {
        summary: "Adds an user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the user",
                  },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
          },
        },
      },
    },
  },
};

const swaggerMiddleware = new Hono();

swaggerMiddleware.get("/doc", (c) => c.json(openApiDoc));
swaggerMiddleware.get("/ui", swaggerUI({ url: "/api/swagger/doc" }));

export default swaggerMiddleware;
