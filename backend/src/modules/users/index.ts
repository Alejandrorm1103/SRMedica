import type { FastifyInstance } from 'fastify'; import routes from './user.routes'; export default async function usersModule(app: FastifyInstance){ app.register(routes); }
