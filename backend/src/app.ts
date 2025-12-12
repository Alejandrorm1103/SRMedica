/**
 * Configuración principal de la aplicación Fastify
 * Registra plugins, middlewares y módulos de rutas
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import swagger from './plugins/swagger.plugin';
import db from './plugins/db.plugin';
import auth from './plugins/auth.plugin';
import errors from './plugins/error.plugin';

import guardPlugin from './plugins/guard.plugin';
import configPlugin from './plugins/config.plugin';

import authModule from './modules/auth/index';
import usersModule from './modules/users/index';
import doctorsModule from './modules/doctors/index';
import patientsModule from './modules/patients/index';
import administratorsModule from './modules/administrators/index';
import appointmentsModule from './modules/appointments/index';

import notificationsModule from './modules/notifications/index';
import healthModule from './modules/health/index';
import statsModule from './modules/stats/index';
import testModule from '../test/e2e/endpoints/test-endpoints/index';

import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

/** Construye y configura la instancia de Fastify */
export async function buildApp() {
  const app = Fastify({
    logger: true,
    ajv: { customOptions: { strict: false, keywords: ['example'] } }
  });

  // Seguridad
  app.register(helmet, { global: true });

  // Rate limiting global
  app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_req, context) => ({
      ok: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.',
        retryAfter: context.after,
      }
    })
  });

  // CORS
  app.register(cors, {
    origin: true,
    credentials: true
  });

  // Plugins core
  await app.register(swagger);
  await app.register(db);
  await app.register(auth);
  await app.register(sensible);
  await app.register(errors);
  await app.register(guardPlugin);
  await app.register(configPlugin);

  // Esperar a que los decoradores estén disponibles
  await app.after();

  // Health checks
  app.register(healthModule, { prefix: '/health' });

  // Módulos de negocio
  app.register(authModule, { prefix: '/auth' });
  app.register(usersModule, { prefix: '/users' });
  app.register(doctorsModule, { prefix: '/doctors' });
  app.register(patientsModule, { prefix: '/patients' });
  app.register(administratorsModule, { prefix: '/administrators' });
  app.register(appointmentsModule, { prefix: '/appointments' });
  app.register(notificationsModule, { prefix: '/notifications' });
  app.register(statsModule, { prefix: '/stats' });

  // Testing (solo desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    app.register(testModule, { prefix: '/test' });
  }

  // Endpoint de diagnóstico


  return app;
}
