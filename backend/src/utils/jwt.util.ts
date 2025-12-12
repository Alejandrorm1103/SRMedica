/**
 * Utilidades para generación de tokens JWT
 */

import type { FastifyInstance } from 'fastify';
import type { FastifyJWT } from '@fastify/jwt';

/** Genera un access token con expiración de 24h */
export async function signAccessToken(app: FastifyInstance, payload: FastifyJWT['payload']) {
  return app.jwt.sign(payload, { expiresIn: '24h' });
}

/** Genera un refresh token con expiración de 24h */
export async function signRefreshToken(app: FastifyInstance, payload: any) {
  return app.jwt.sign(payload, { expiresIn: '24h' });
}
