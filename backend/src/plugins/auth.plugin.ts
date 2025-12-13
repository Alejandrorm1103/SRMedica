/**
 * Plugin de autenticación y autorización
 * Configura JWT, cookies y decoradores de guards para control de acceso
 */

import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '@/middlewares/auth.middleware';
import {
  requireRoleToken,
  requireRolesToken,
  requireSelfOrRolesToken,
  requirePatient,
  requireDoctor,
  requireAdmin,
} from '@/middlewares/guard.middleware';

const plugin: FastifyPluginAsync = async (app) => {
  const SKIP = String(process.env.SKIP_GUARDS || '').toLowerCase() === 'true';

  app.register(cookie);
  app.register(jwt, { secret: process.env.JWT_SECRET || 'dev_secret', sign: { expiresIn: '24h' } });

  // Decorador de autenticación
  app.decorate('authenticate', authenticate);

  // Guards de autorización (los decoradores individuales se mantienen por compatibilidad)
  if (SKIP) {
    // Modo desarrollo: guards deshabilitados
    app.decorate('requireRole', (_role: string) => async () => { });
    app.decorate('requireRoles', (_roles: string[]) => async () => { });
    app.decorate('requireSelfOrRoles', (_idParam: string, _roles: string[]) => async () => { });
    app.decorate('requirePatient', () => async (_req: any, _rep: any) => { });
    app.decorate('requireDoctor', () => async (_req: any, _rep: any) => { });
    app.decorate('requireAdmin', () => async (_req: any, _rep: any) => { });
  } else {
    // Modo producción: guards activos
    app.decorate('requireRole', (role: string) => requireRoleToken(role));
    app.decorate('requireRoles', (roles: string[]) => requireRolesToken(roles));
    app.decorate('requireSelfOrRoles', (idParam: string, roles: string[]) =>
      requireSelfOrRolesToken(idParam, roles)
    );
    app.decorate('requirePatient', () => requirePatient);
    app.decorate('requireDoctor', () => requireDoctor);
    app.decorate('requireAdmin', () => requireAdmin);
  }
};

export default fp(plugin);
