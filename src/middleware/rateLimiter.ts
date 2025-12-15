import { TooManyRequestsError } from "@/error/ApiError"
import type { Context } from "hono"
import { createMiddleware } from "hono/factory"
import type { Variables } from "hono/types"

type Bucket = {
    tokens: number
    lastRefill: number,
}
export type TokenBucketOptions = {
    capacity: number
    refillRate: number // por segundo
    maxIdleTimeMs?: number

    keyGenerator?: (c: Context) => string
    cost?: number | ((c: Context) => number)
}

export const rateLimiter = (opts: TokenBucketOptions) => {
    const {
        capacity,
        refillRate,
        cost = 1,
        maxIdleTimeMs = 10 * 60 * 1000, // 10 minutos
        keyGenerator = (c) =>
            c.req.header('x-forwarded-for') ??
            c.req.header('cf-connecting-ip') ??
            'unknown'
    } = opts;

    const buckets = new Map<string, Bucket>();

    // Limpieza periodica
    const cleanupInterval = setInterval(() => {
        const now = Date.now()
        for (const [key, bucket] of buckets) {
            if (now - bucket.lastRefill > maxIdleTimeMs) {
                buckets.delete(key)
            }
        }
    }, Math.min(maxIdleTimeMs, 60_000))


    cleanupInterval.unref?.()

    return createMiddleware<{ Variables: Variables }>(async (c, next) => {
        const key = keyGenerator(c)
        const now = Date.now()
        const requestCost = typeof cost === 'function' ? cost(c) : cost

        let bucket = buckets.get(key)

        if (!bucket) {
            bucket = {
                tokens: capacity,
                lastRefill: now,
            }
            buckets.set(key, bucket)
        }


        // Refill 
        const elapsedSeconds = (now - bucket.lastRefill) / 1000
        if (elapsedSeconds > 0) {
            const refillAmount = elapsedSeconds * refillRate
            bucket.tokens = Math.min(capacity, bucket.tokens + refillAmount)
            bucket.lastRefill = now
        }


        // Cabeceras 
        c.header('X-RateLimit-Limit', capacity.toString())
        c.header(
            'X-RateLimit-Remaining',
            Math.max(0, Math.floor(bucket.tokens)).toString()
        )


        if (bucket.tokens < requestCost) {
            const retryAfterSeconds = Math.ceil(
                (requestCost - bucket.tokens) / refillRate
            )


            c.header('Retry-After', retryAfterSeconds.toString())
            throw new TooManyRequestsError();
        }

        // Consume
        bucket.tokens -= requestCost

        await next()
    });
}
