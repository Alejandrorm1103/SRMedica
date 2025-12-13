import type { FastifyInstance } from 'fastify'; import routes from './doctor.routes'; export default async function doctorsModule(app: FastifyInstance){ app.register(routes); }
