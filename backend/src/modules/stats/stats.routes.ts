/**
 * Rutas de estadísticas para administradores
 */

import type { FastifyPluginAsync } from 'fastify';
import { StatsService } from './stats.service';

const statsRoutes: FastifyPluginAsync = async (app) => {
    const service = new StatsService(app);

    /**
     * GET /stats/dashboard
     * Obtener estadísticas del dashboard
     */
    app.get(
        '/dashboard',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Stats'],
                summary: 'Obtener estadísticas del dashboard',
                description: 'Obtiene todas las estadísticas necesarias para el panel de administración',
            },
        },
        async (req, reply) => {
            const stats = await service.getDashboardStats();
            return reply.send({ success: true, data: stats });
        }
    );

    /**
     * GET /stats/pending-doctors
     * Obtener médicos pendientes
     */
    app.get(
        '/pending-doctors',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Stats'],
                summary: 'Obtener médicos pendientes de activación',
            },
        },
        async (req, reply) => {
            const doctors = await service.getPendingDoctors();
            return reply.send({ success: true, data: doctors });
        }
    );

    /**
     * GET /stats/pending-patients
     * Obtener pacientes pendientes
     */
    app.get(
        '/pending-patients',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Stats'],
                summary: 'Obtener pacientes pendientes de verificación',
            },
        },
        async (req, reply) => {
            const patients = await service.getPendingPatients();
            return reply.send({ success: true, data: patients });
        }
    );

    /**
     * GET /stats/active-doctors
     * Obtener médicos activos
     */
    app.get(
        '/active-doctors',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Stats'],
                summary: 'Obtener lista de médicos activos',
            },
        },
        async (req, reply) => {
            const doctors = await service.getActiveDoctorsList();
            return reply.send({ success: true, data: doctors });
        }
    );

    /**
     * GET /stats/active-patients
     * Obtener pacientes activos
     */
    app.get(
        '/active-patients',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Stats'],
                summary: 'Obtener lista de pacientes activos',
            },
        },
        async (req, reply) => {
            const patients = await service.getActivePatientsList();
            return reply.send({ success: true, data: patients });
        }
    );
};

export default statsRoutes;
