import type { FastifyInstance } from 'fastify';
import routes from './auth.routes';

export default async function authModule(app: FastifyInstance) {
  app.register(routes);
}
