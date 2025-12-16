import { NotAcceptableError } from '@/error/ApiError';
import { createMiddleware } from 'hono/factory';
import type { Variables } from 'hono/types';

export type ApiVersion = "v1" | "v2";

export const mediaVersion = (defaultVersion: ApiVersion = "v1") => {
    return createMiddleware<{ Variables: { apiVersion: ApiVersion } }>(async (c, next) => {
        const accept = c.req.header('accept') ?? ''

        let version: ApiVersion = defaultVersion;

        if (accept.includes("vnd.sonare.search-v2+json")) {
            version = "v2";
        } else if (accept.includes("vnd.sonare.search-v1+json")) {
            version = "v1";
        }
        c.set("apiVersion", version);
        await next();
    });
}
