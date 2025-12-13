/**
 * Plugin de base de datos Prisma
 * Conecta Prisma al inicio y lo desconecta al cerrar la aplicación
 */

import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/prisma';

const dbPlugin: FastifyPluginAsync = async (app) => {
  try {
    await prisma.$connect();
    app.log.info('Prisma connected');
  } catch (err) {
    app.log.error(err, 'Prisma connection failed');
    throw err;
  }

  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
};

export default fp(dbPlugin);
