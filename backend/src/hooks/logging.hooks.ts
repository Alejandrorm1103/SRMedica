/**
 * Hooks de logging para Fastify
 * Registran información de requests, responses y errores
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

/** Hook para logging de peticiones entrantes */
export async function logRequestHook(
    request: FastifyRequest,
    _reply: FastifyReply
): Promise<void> {
    request.log.info({
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
    }, 'Incoming request');
}

/**
 * Hook onRequest para validar headers requeridos
 */
export async function validateHeadersHook(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    // Ejemplo: validar que todas las peticiones tengan Content-Type en POST/PUT
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers['content-type'];
        if (!contentType) {
            return reply.code(400).send({
                ok: false,
                error: {
                    code: 'MISSING_CONTENT_TYPE',
                    message: 'Content-Type header is required',
                },
            });
        }
    }
}

/**
 * Hook onResponse para logging de respuestas
 */
export async function logResponseHook(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    request.log.info({
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.getResponseTime(),
    }, 'Request completed');
}

/**
 * Hook onError para logging centralizado de errores
 */
export async function logErrorHook(
    request: FastifyRequest,
    _reply: FastifyReply,
    error: Error
): Promise<void> {
    request.log.error({
        method: request.method,
        url: request.url,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
    }, 'Request error');
}
