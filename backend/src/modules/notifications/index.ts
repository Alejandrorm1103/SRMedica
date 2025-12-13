import type { FastifyInstance } from 'fastify'; import routes from './notification.routes'; export default async function notificationsModule(app: FastifyInstance){ app.register(routes); }
