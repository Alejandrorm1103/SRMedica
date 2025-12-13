// src/plugins/config.plugin.ts
import fp from 'fastify-plugin';
import { env } from '@/config/env';

/**
 * Plugin de configuración que decora la instancia de Fastify
 * con todas las variables de entorno validadas por Zod
 */
export default fp(async (app) => {
  app.decorate('config', env);
  app.log.info('Config plugin loaded with validated environment variables');
});
