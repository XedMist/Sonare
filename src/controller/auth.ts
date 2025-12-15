import { Hono } from "hono";
import { z } from "zod";
import AuthService from "@/services/AuthService.ts";
import UserService from "@/services/UserService.ts";
import { UserCreateSchema, UserLoginSchema } from "@/model/dto/UserDTO.ts";
import { DTOMapper } from "@/model/mappers.ts";
import { validate } from "@/middleware/ValidationMiddleware.ts";

const authController = new Hono();

const authService = new AuthService();
const userService = new UserService();

const RefreshTokenSchema = z.object({
    refreshToken: z.string()
});

authController
    .post("/login",
        validate("json", UserLoginSchema),
        async (c) => {
            const { username, password } = c.req.valid('json');
            const result = await authService.login(username, password);

            return c.json(result);
        });

authController
    .post("/register",
        validate("json", UserCreateSchema),
        async (c) => {
            const body = c.req.valid("json");
            const user = await userService.create(body);

            return c.json(DTOMapper.toUserResponse(user), 201);
        });

authController
    .post("/refresh",
        validate("json", RefreshTokenSchema),
        async (c) => {
            const { refreshToken } = c.req.valid('json');
            const result = await authService.refreshAccessToken(refreshToken);

            return c.json(result);
        });

authController
    .post("/logout",
        validate("json", RefreshTokenSchema),
        async (c) => {
            const { refreshToken } = c.req.valid('json');
            const revoked = await authService.revokeRefreshToken(refreshToken);
            const message = revoked ? "Sesion cerrada de forma exitosa" : "El token de refresh es invalido";
            return c.json({ message }, revoked ? 200 : 400)
        });

export default authController;
