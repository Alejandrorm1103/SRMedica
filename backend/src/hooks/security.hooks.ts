/**
 * Hooks de seguridad para Fastify
 * Incluyen rate limiting, validación de usuarios y sanitización de inputs
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

/** Hook para rate limiting personalizado por usuario */
export async function userRateLimitHook(
    request: FastifyRequest,
    _reply: FastifyReply
): Promise<void> {
    // Implementación de ejemplo
    // En producción, usar Redis para tracking
    const userId = (request as any).user?.id;

    if (userId) {
        // Aquí iría la lógica de rate limiting por usuario
        request.log.debug({ userId }, 'User rate limit check');
    }
}

/**
 * Hook preHandler para validar que el usuario esté verificado
 */
export async function requireVerifiedUserHook(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const user = (request as any).user;

    if (!user) {
        return reply.code(401).send({
            ok: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        });
    }

    if (!user.activo) {
        return reply.code(403).send({
            ok: false,
            error: {
                code: 'ACCOUNT_NOT_VERIFIED',
                message: 'Please verify your email address',
            },
        });
    }
}

/**
 * Hook preHandler para sanitizar inputs
 */
export async function sanitizeInputHook(
    request: FastifyRequest,
    _reply: FastifyReply
): Promise<void> {
    // Sanitizar query params
    if (request.query && typeof request.query === 'object') {
        for (const key in request.query) {
            const value = (request.query as any)[key];
            if (typeof value === 'string') {
                // Remover espacios en blanco al inicio y final
                (request.query as any)[key] = value.trim();
            }
        }
    }

    // Sanitizar body
    if (request.body && typeof request.body === 'object') {
        for (const key in request.body) {
            const value = (request.body as any)[key];
            if (typeof value === 'string') {
                (request.body as any)[key] = value.trim();
            }
        }
    }
}
