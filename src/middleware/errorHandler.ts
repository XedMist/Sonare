import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import {
    AppError,
    ValidationError,
    ConflictError,
    NotFoundError,
    InternalServerError,
    BadRequestError,
} from '@/error/ApiError';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const problemHeaders = { 'content-type': 'application/problem+json' };

export const errorHandler: ErrorHandler = (err, c) => {
    const instance = c.req.path ?? new URL(c.req.url).pathname;
    const traceId = c.get('requestId');

    if (err instanceof HTTPException) {
        return c.json(
            {
                type: 'about:blank',
                title: err.message,
                status: err.status,
                instance,
                traceId,
            },
            err.status as ContentfulStatusCode,
            problemHeaders
        );
    }

    if (err instanceof AppError) {
        return c.json(err.toProblem(instance, traceId), err.status as ContentfulStatusCode, problemHeaders);
    }

    if (err instanceof ZodError) {
        const appErr = new ValidationError('Peticion invalida', err.flatten());
        return c.json(appErr.toProblem(instance, traceId), appErr.status as ContentfulStatusCode, problemHeaders);
    }

    const anyErr = err as any;

    // Prisma P2002: Unique constraint violation
    if (anyErr?.code === 'P2002') {
        const appErr = new ConflictError('Unique constraint violated');
        return c.json(appErr.toProblem(instance, traceId), appErr.status as ContentfulStatusCode, problemHeaders);
    }

    // Prisma P2025: Record not found
    if (anyErr?.code === 'P2025') {
        const appErr = new NotFoundError('Record not found');
        return c.json(appErr.toProblem(instance, traceId), appErr.status as ContentfulStatusCode, problemHeaders);
    }

    // Prisma P2023: Malformed ID 
    if (anyErr?.code === 'P2023') {
        const appErr = new BadRequestError("Formato de ID invalido");
        return c.json(appErr.toProblem(instance, traceId), appErr.status as ContentfulStatusCode, problemHeaders);
    }

    console.error('Unhandled error:', err);
    const appErr = new InternalServerError();
    return c.json(appErr.toProblem(instance, traceId), appErr.status as ContentfulStatusCode, problemHeaders);
};
