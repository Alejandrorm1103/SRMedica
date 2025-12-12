import type { FastifyInstance } from 'fastify';
import routes from './test.routes';

export default async function testModule(app: FastifyInstance) {
    app.register(routes);
}
