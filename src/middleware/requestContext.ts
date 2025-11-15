import type { MiddlewareHandler } from 'hono';
import { randomUUID } from 'crypto';

export const requestContext = (): MiddlewareHandler => {
    return async (c, next) => {
        const id = randomUUID();
        c.set('requestId', id);
        await next();
        c.header('X-Request-Id', id);
    };
};
