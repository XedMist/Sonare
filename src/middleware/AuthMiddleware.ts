import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';
import AuthService from '@/services/AuthService.ts';
import { ForbiddenError } from '@/error/ApiError';

type Variables = JwtVariables & {
    userId: string;
    userName: string;
    userRole: string;
};

export const authMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const jwtSecret = process.env.JWT_SECRET ?? 'secreto'; // TODO: Cambiar esto

    const jwtMw = jwt({ secret: jwtSecret });
    await jwtMw(c, async () => { });

    const payload = c.get('jwtPayload');
    if (!payload) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('userId', payload.sub);
    c.set('userName', payload.name);
    c.set('userRole', payload.role);

    await next();
});

export const requirePermission = (capability: string, resource: string) => {
    return createMiddleware<{ Variables: Variables }>(async (c, next) => {
        const userId = c.get('userId');
        const authService = new AuthService();

        const hasPermission = await authService.checkPermission(userId, capability, resource);

        if (!hasPermission) {
            throw new ForbiddenError("No tiene permisos para realizar esa accion")
        }

        await next();
    });
};
