import type { FastifyPluginAsync } from 'fastify';
import statsRoutes from './stats.routes';

const statsModule: FastifyPluginAsync = async (app) => {
    app.register(statsRoutes);
};

export default statsModule;
