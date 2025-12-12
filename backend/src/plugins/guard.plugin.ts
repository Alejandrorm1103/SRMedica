/**
 * Plugin de guards (middlewares de autorización)
 * Decora la instancia de Fastify con funciones de control de acceso
 */

import fp from 'fastify-plugin';
import * as guardMiddleware from '@/middlewares/guard.middleware';

export default fp(async (app) => {
  // Decorar con las funciones individuales
  app.decorate('guard', {
    requireRole: guardMiddleware.requireRoleToken,
    requireRoles: guardMiddleware.requireRolesToken,
    requireSelfOrRoles: guardMiddleware.requireSelfOrRolesToken,
    requirePatient: guardMiddleware.requirePatient,
    requireDoctor: guardMiddleware.requireDoctor,
    requireAdmin: guardMiddleware.requireAdmin,
  });
});
