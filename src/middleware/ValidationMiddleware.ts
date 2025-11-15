import { zValidator } from '@hono/zod-validator';
import type { ZodSchema } from 'zod';
import { ValidationError } from '@/error/ApiError';

type Target = 'json' | 'query' | 'form' | 'param' | 'header' | 'cookie';

export const validate = <T extends ZodSchema>(target: Target, schema: T) =>
    zValidator(target, schema, (result) => {
        if (!result.success) {
            throw new ValidationError('Peticion erronea', result.error);
        }
    });
