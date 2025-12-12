import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
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

    // Try to get token from Authorization header first, then from query parameter
    let token: string | undefined;
    
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    } else {
        // Fallback to query parameter (for img src, audio src, etc.)
        token = c.req.query('token') ?? undefined;
    }

    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const payload = await verify(token, jwtSecret);
        
        if (!payload) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        c.set('jwtPayload', payload);
        c.set('userId', payload.sub as string);
        c.set('userName', payload.name as string);
        c.set('userRole', payload.role as string);

        await next();
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }
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
