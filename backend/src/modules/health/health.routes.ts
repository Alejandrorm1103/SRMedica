import type { FastifyInstance } from 'fastify';
import { emailService } from '@/shared/services/email.service';

/**
 * Módulo de Health Check
 * Verifica el estado de la aplicación y sus dependencias
 */
export default async function healthRoutes(app: FastifyInstance) {
    /**
     * Health check básico
     * GET /health
     */
    app.get('/health', {
        schema: {
            description: 'Health check básico de la aplicación',
            tags: ['Health'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        timestamp: { type: 'string' },
                    }
                }
            }
        }
    }, async (req, reply) => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    });

    /**
     * Health check detallado con verificación de dependencias
     * GET /health/detailed
     */
    app.get('/health/detailed', {
        schema: {
            description: 'Health check detallado con verificación de dependencias',
            tags: ['Health'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        timestamp: { type: 'string' },
                        uptime: { type: 'number' },
                        checks: { type: 'object' },
                    }
                }
            }
        }
    }, async (req, reply) => {
        const checks: Record<string, string> = {
            database: 'unknown',
            email: 'unknown',
        };

        let overallStatus = 'ok';

        // Check database connection
        try {
            await app.prisma.$queryRaw`SELECT 1`;
            checks.database = 'healthy';
            req.log.debug('Database health check passed');
        } catch (error) {
            checks.database = 'unhealthy';
            overallStatus = 'degraded';
            req.log.error({ error }, 'Database health check failed');
        }

        // Check email service configuration
        checks.email = (emailService as any).isConfigured ? 'healthy' : 'unhealthy';
        if (checks.email === 'unhealthy') {
            overallStatus = 'degraded';
        }

        const statusCode = overallStatus === 'ok' ? 200 : 503;

        return reply.code(statusCode).send({
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB',
            },
            checks,
        });
    });

    /**
     * Readiness check (para Kubernetes)
     * GET /health/ready
     */
    app.get('/health/ready', {
        schema: {
            description: 'Readiness probe para Kubernetes',
            tags: ['Health'],
        }
    }, async (req, reply) => {
        try {
            await app.prisma.$queryRaw`SELECT 1`;
            return reply.code(200).send({ ready: true });
        } catch (error) {
            req.log.error({ error }, 'Readiness check failed');
            return reply.code(503).send({ ready: false });
        }
    });

    /**
     * Liveness check (para Kubernetes)
     * GET /health/live
     */
    app.get('/health/live', {
        schema: {
            description: 'Liveness probe para Kubernetes',
            tags: ['Health'],
        }
    }, async (req, reply) => {
        return { alive: true };
    });
}
