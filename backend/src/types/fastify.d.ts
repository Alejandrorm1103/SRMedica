/**
 * Extensiones de tipos para Fastify
 * Declara propiedades personalizadas agregadas por plugins
 */

import type { FastifyReply } from 'fastify';
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number;
      email: string;
      roles: string[];
      sessionId?: number;
      iat?: number;
      exp?: number;
    };
  }

  interface FastifyInstance {
    /** Configuración validada de variables de entorno */
    config: {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: number;
      DATABASE_URL: string;
      JWT_SECRET: string;
      [k: string]: unknown;
    };

    /** Middleware de autenticación JWT */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    /** Guards de autorización */
    guard: {
      requireRole: (role: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void | undefined>;
      requireRoles: (rolesAllowed: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void | undefined>;
      requireSelfOrRoles: (idParam: string, rolesAllowed: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void | undefined>;
      requirePatient: (request: FastifyRequest, reply: FastifyReply) => Promise<void | undefined>;
      requireDoctor: (request: FastifyRequest, reply: FastifyReply) => Promise<void | undefined>;
      requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void | undefined>;
    };
  }
}
