/**
 * Rutas de Administradores
 */

import type { FastifyPluginAsync } from 'fastify';
import { AdministratorService } from './administrator.service';
import { UpdateAdministratorSchema, ToggleStatusSchema } from './administrator.schema';

const administratorRoutes: FastifyPluginAsync = async (app) => {
    const service = new AdministratorService(app);

    // ==========================================
    // Rutas del administrador autenticado
    // ==========================================

    /**
     * GET /administrators/me
     * Obtener perfil del administrador autenticado
     */
    app.get(
        '/me',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Administrators'],
                summary: 'Obtener mi perfil de administrador',
                description: 'Obtiene el perfil del administrador autenticado',
                response: {
                    200: {
                        description: 'Perfil del administrador',
                        type: 'object',
                        additionalProperties: true
                    }
                }
            },
        },
        async (req, reply) => {
            const profile = await service.getMyProfile(req.user!.id);
            return reply.send(profile);
        }
    );

    /**
     * PUT /administrators/me
     * Actualizar perfil del administrador autenticado
     */
    app.put(
        '/me',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Administrators'],
                summary: 'Actualizar mi perfil de administrador',
                description: 'Actualiza el perfil del administrador autenticado',
                body: {
                    type: 'object',
                    properties: {
                        tipo_documento_id: { type: 'number', nullable: true },
                        numero_documento: { type: 'string', maxLength: 50, nullable: true },
                        primer_nombre: { type: 'string', minLength: 1, maxLength: 60 },
                        segundo_nombre: { type: 'string', maxLength: 60, nullable: true },
                        primer_apellido: { type: 'string', minLength: 1, maxLength: 60 },
                        segundo_apellido: { type: 'string', maxLength: 60, nullable: true },
                        fecha_nacimiento: { type: 'string', format: 'date-time', nullable: true },
                        sexo_id: { type: 'number', nullable: true },
                        direccion_linea1: { type: 'string', maxLength: 150, nullable: true },
                        direccion_linea2: { type: 'string', maxLength: 150, nullable: true },
                        ciudad: { type: 'string', maxLength: 100, nullable: true },
                        departamento: { type: 'string', maxLength: 100, nullable: true },
                        pais: { type: 'string', maxLength: 100, nullable: true },
                        codigo_postal: { type: 'string', maxLength: 20, nullable: true },
                    },
                },
                response: {
                    200: {
                        description: 'Perfil actualizado exitosamente',
                        type: 'object',
                        additionalProperties: true
                    }
                }
            },
        },
        async (req, reply) => {
            const validated = UpdateAdministratorSchema.parse(req.body);
            const updated = await service.updateMyProfile(req.user!.id, validated);
            return reply.send(updated);
        }
    );

    // ==========================================
    // Rutas de gestión (solo administradores)
    // ==========================================

    /**
     * GET /administrators
     * Listar todos los administradores
     */
    app.get(
        '/',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Administrators'],
                summary: 'Listar administradores',
                description: 'Lista todos los administradores con filtros opcionales',
                querystring: {
                    type: 'object',
                    properties: {
                        estado: { type: 'boolean' },
                        search: { type: 'string' },
                        limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
                        offset: { type: 'number', minimum: 0, default: 0 },
                    },
                },
                response: {
                    200: {
                        description: 'Lista de administradores paginada',
                        type: 'object',
                        properties: {
                            data: { type: 'array', items: { type: 'object' } },
                            total: { type: 'number' }
                        }
                    }
                }
            },
        },
        async (req, reply) => {
            const { estado, search, limit, offset } = req.query as any;
            const result = await service.listAll({
                estado: estado !== undefined ? Boolean(estado) : undefined,
                search,
                limit: limit ? Number(limit) : undefined,
                offset: offset ? Number(offset) : undefined,
            });
            return reply.send(result);
        }
    );

    /**
     * GET /administrators/:id
     * Obtener administrador por ID
     */
    app.get(
        '/:id',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Administrators'],
                summary: 'Obtener administrador por ID',
                description: 'Obtiene la información completa de un administrador',
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'number' },
                    },
                },
                response: {
                    200: {
                        description: 'Detalle del administrador',
                        type: 'object',
                        additionalProperties: true
                    },
                    404: { description: 'Administrador no encontrado', type: 'object' }
                }
            },
        },
        async (req, reply) => {
            const { id } = req.params as { id: number };
            const admin = await service.getById(Number(id));
            return reply.send(admin);
        }
    );

    /**
     * PUT /administrators/:id
     * Actualizar administrador por ID
     */
    app.put(
        '/:id',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Administrators'],
                summary: 'Actualizar administrador por ID',
                description: 'Actualiza la información de un administrador específico',
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'number' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        tipo_documento_id: { type: 'number', nullable: true },
                        numero_documento: { type: 'string', maxLength: 50, nullable: true },
                        primer_nombre: { type: 'string', minLength: 1, maxLength: 60 },
                        segundo_nombre: { type: 'string', maxLength: 60, nullable: true },
                        primer_apellido: { type: 'string', minLength: 1, maxLength: 60 },
                        segundo_apellido: { type: 'string', maxLength: 60, nullable: true },
                        fecha_nacimiento: { type: 'string', format: 'date-time', nullable: true },
                        sexo_id: { type: 'number', nullable: true },
                        direccion_linea1: { type: 'string', maxLength: 150, nullable: true },
                        direccion_linea2: { type: 'string', maxLength: 150, nullable: true },
                        ciudad: { type: 'string', maxLength: 100, nullable: true },
                        departamento: { type: 'string', maxLength: 100, nullable: true },
                        pais: { type: 'string', maxLength: 100, nullable: true },
                        codigo_postal: { type: 'string', maxLength: 20, nullable: true },
                    },
                },
                response: {
                    200: { description: 'Administrador actualizado', type: 'object', additionalProperties: true }
                }
            },
        },
        async (req, reply) => {
            const { id } = req.params as { id: number };
            const validated = UpdateAdministratorSchema.parse(req.body);
            const updated = await service.updateById(Number(id), validated);
            return reply.send(updated);
        }
    );

    /**
     * PATCH /administrators/:id/status
     * Activar/Desactivar administrador
     */
    app.patch(
        '/:id/status',
        {
            preHandler: [app.authenticate, app.requireRoles(['administrador'])],
            schema: {
                tags: ['Administrators'],
                summary: 'Cambiar estado de administrador',
                description: 'Activa o desactiva un administrador',
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'number' },
                    },
                },
                body: {
                    type: 'object',
                    required: ['estado'],
                    properties: {
                        estado: { type: 'boolean' },
                    },
                },
                response: {
                    200: { description: 'Estado actualizado correctamente', type: 'object' }
                }
            },
        },
        async (req, reply) => {
            const { id } = req.params as { id: number };
            const { estado } = ToggleStatusSchema.parse(req.body);
            const result = await service.toggleStatus(Number(id), estado);
            return reply.send(result);
        }
    );
};

export default administratorRoutes;
