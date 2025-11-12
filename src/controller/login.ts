import LoginService from "../services/LoginService.ts";
import { Hono } from "hono";
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const loginController = new Hono();
const service = new LoginService();

const LoginBodySchema = z.object({
    username: z.string().min(3).max(30),
    password: z.string().min(6).max(100),
});

loginController.post("/", zValidator("json", LoginBodySchema), async (c) => {
    const { username, password } = c.req.valid('json')
    const result = await service.login(username, password);
    if (result) {
        return c.json(result);
    } else {
        return c.status(401);
    }
});

export default loginController;