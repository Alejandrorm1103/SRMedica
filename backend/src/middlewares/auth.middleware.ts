/**
 * Middleware de autenticación JWT
 * Verifica el token JWT y adjunta el usuario al request
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';

/** Verifica el token JWT del usuario */
export async function authenticate(req: FastifyRequest, rep: FastifyReply) {
    const SKIP = String(process.env.SKIP_GUARDS || '').toLowerCase() === 'true';

    if (SKIP) {
        // Modo desarrollo: usuario de prueba
        const id = Number(process.env.DEBUG_USER_ID || 1);
        const roles = String(process.env.DEBUG_USER_ROLES || 'paciente')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        (req as any).user = { id, roles };
        return;
    }

    try {
        await req.jwtVerify();
    } catch {
        return rep.unauthorized('INVALID_TOKEN');
    }
}
