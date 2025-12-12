import type { FastifyInstance } from 'fastify'; import routes from './patient.routes'; export default async function patientsModule(app: FastifyInstance){ app.register(routes); }
