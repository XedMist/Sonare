import { Hono } from "hono";
import { Scalar } from "@scalar/hono-api-reference";

const scalarController = new Hono();

scalarController.get('/scalar', Scalar({ url: '/doc' }))

export default scalarController;
