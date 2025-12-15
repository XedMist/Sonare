// La idea es seguir el RFC 7807

export type ProblemDetails = {
    type: string;   // URI con la referencia del problema
    title: string;
    status: number;
    detail?: string;    // Especifico del problema
    instance?: string;  // Otra URI
    code?: string;
    errors?: unknown;
    traceId?: string;
};

export class AppError extends Error {
    status: number;
    title: string;
    type: string;
    code?: string;
    details?: unknown;

    constructor(
        title: string,
        status: number,
        opts?: { detail?: string; type?: string; code?: string; details?: unknown }
    ) {
        super(opts?.detail ?? title);
        this.title = title;
        this.status = status;
        this.type = opts?.type ?? 'about:blank';
        this.code = opts?.code;
        this.details = opts?.details;
    }

    toProblem(instance?: string, traceId?: string): ProblemDetails {
        return {
            type: this.type,
            title: this.title,
            status: this.status,
            detail: this.message,
            instance,
            code: this.code,
            errors: this.details,
            traceId,
        };
    }
}

// Wrappers de los errores mas comunes
export class BadRequestError extends AppError {
    constructor(detail?: string, details?: unknown) {
        super('Bad Request', 400, { detail, type: 'https://httpstatuses.com/400', details });
    }
}

export class ValidationError extends AppError {
    constructor(detail: string, details?: unknown) {
        super('Unprocessable Entity', 422, { detail, type: 'https://httpstatuses.com/422', details });
    }
}

export class UnauthorizedError extends AppError {
    constructor(detail?: string) {
        super('Unauthorized', 401, { detail, type: 'https://httpstatuses.com/401' });
    }
}

export class ForbiddenError extends AppError {
    constructor(detail?: string) {
        super('Forbidden', 403, { detail, type: 'https://httpstatuses.com/403' });
    }
}

export class NotFoundError extends AppError {
    constructor(detail?: string) {
        super('Not Found', 404, { detail, type: 'https://httpstatuses.com/404' });
    }
}

export class ConflictError extends AppError {
    constructor(detail?: string) {
        super('Conflict', 409, { detail, type: 'https://httpstatuses.com/409' });
    }
}

export class TooManyRequestsError extends AppError {
    constructor(detail?: string) {
        super('Too Many Requests', 429, { detail, type: 'https://httpstatuses.com/429' });
    }
}

export class InternalServerError extends AppError {
    constructor(detail?: string) {
        super('Internal Server Error', 500, { detail, type: 'https://httpstatuses.com/500' });
    }
}

export class NotAcceptableError extends AppError {
    constructor(detail?: string) {
        super('Not Acceptable', 406, { detail, type: 'https://httpstatuses.com/406' });
    }
}
