import type { FastifyInstance } from 'fastify'; import routes from './appointment.routes'; export default async function appointmentsModule(app: FastifyInstance){ app.register(routes); }
