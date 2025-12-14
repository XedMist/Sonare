import { z } from 'zod';

// Common validation schemas
export const PaginationQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default(0).pipe(z.number().min(0)),
    limit: z.string().regex(/^\d+$/).transform(Number).default(10).pipe(z.number().min(1).max(100)),
});

export const IdParamSchema = z.object({
    id: z.string().min(1),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type IdParam = z.infer<typeof IdParamSchema>;

