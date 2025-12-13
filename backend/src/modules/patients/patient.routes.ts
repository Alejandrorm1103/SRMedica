import type { FastifyInstance, FastifyRequest } from 'fastify';
import { makePatientService } from '@/core/injector';
import { ok, paged } from '@/utils/response.util';
import { PatientUpsertDTO } from './patient.schema';
import { z } from 'zod';

// Tipos para las peticiones
type GetByIdParams = { id: number };
type ListQuery = { page?: number; size?: number };
type UpdateStatusBody = { estado: boolean };
type UpsertBody = z.infer<typeof PatientUpsertDTO>;

/**
 * Patients Routes
 * CRUD + endpoints /me
 */
export default async function routes(app: FastifyInstance) {
  const svc = makePatientService(app);

  // ======================
  // ME ENDPOINTS (must be registered BEFORE /:id routes)
  // ======================

  // Me (get)
  app.get(
    '/me',
    {
      preHandler: [app.authenticate, app.requirePatient()],
      schema: {
        tags: ['Patients'],
        summary: 'Obtener mi perfil de paciente',
        description: 'Retorna los datos del paciente autenticado.',
        response: {
          200: {
            description: 'Perfil del paciente',
            type: 'object',
            properties: { ok: { type: 'boolean', example: true }, data: { type: 'object', additionalProperties: true } }
          }
        }
      }
    },
    async (req, rep) => {
      const userId = Number(req.user.id);
      if (!userId || isNaN(userId)) {
        req.log.error({ user: req.user }, 'Invalid user ID in /patients/me');
        return rep.status(400).send({ ok: false, error: { code: 'INVALID_TOKEN', message: 'Invalid user ID' } });
      }
      const p = await svc.getByUsuario(userId);
      if (!p) { return rep.send(ok(null)); }
      return rep.send(ok(p));
    }
  );

  // Me (update)
  app.patch<{ Body: Partial<UpsertBody> }>(
    '/me',
    {
      preHandler: [app.authenticate, app.requirePatient()],
      schema: {
        tags: ['Patients'],
        summary: 'Actualizar mi perfil (Paciente)',
        description: 'Permite al paciente actualizar sus datos personales.',
        body: {
          type: 'object',
          properties: {
            direccion: { type: 'string', example: 'Nueva Dirección #123' },
            telefono: { type: 'string', example: '3001234567' }
          }
        },
        response: {
          200: {
            description: 'Perfil actualizado',
            type: 'object',
            properties: { ok: { type: 'boolean', example: true }, data: { type: 'object', additionalProperties: true } }
          }
        }
      }
    },
    async (req, rep) => {
      const userId = Number(req.user.id);
      if (!userId || isNaN(userId)) {
        return rep.status(400).send({ ok: false, error: { code: 'INVALID_TOKEN', message: 'Invalid user ID' } });
      }
      // Nota: Aquí deberíamos validar el body parcial, pero por brevedad lo pasamos
      const p = await svc.updateByUsuario(userId, req.body as any);
      return rep.send(ok(p));
    }
  );

  // ======================
  // ADMIN CRUD ENDPOINTS
  // ======================

  // Create
  app.post<{ Body: UpsertBody }>(
    '/',
    {
      preHandler: [app.authenticate, app.requireRoles(['administrador'])],
      schema: {
        tags: ['Patients'],
        summary: 'Crear paciente (Admin)',
        body: {
          type: 'object',
          required: ['usuarioId'],
          properties: {
            usuarioId: { type: 'number', example: 100 },
            tipoSangre: { type: 'string', example: 'O+' }
          }
        },
        response: {
          201: {
            description: 'Paciente creado',
            type: 'object',
            properties: { ok: { type: 'boolean', example: true }, data: { type: 'object' } }
          }
        }
      }
    },
    async (req, rep) => {
      // Validación básica con Zod (opcional si se integra fastify-type-provider-zod)
      const body = PatientUpsertDTO.parse(req.body);
      const created = await svc.create(body as any);
      return rep.code(201).send(ok(created));
    }
  );

  // List
  app.get<{ Querystring: ListQuery }>(
    '/',
    {
      preHandler: [app.authenticate, app.requireRoles(['administrador'])],
      schema: {
        tags: ['Patients'],
        summary: 'Listar pacientes (Admin)',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', default: 1 },
            size: { type: 'number', default: 20 }
          }
        },
        response: {
          200: {
            description: 'Lista paginada de pacientes',
            type: 'object',
            properties: {
              ok: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object' } },
              meta: { type: 'object' }
            }
          }
        }
      }
    },
    async (req, rep) => {
      const page = Number(req.query.page ?? 1);
      const size = Number(req.query.size ?? 20);
      const out = await svc.list(page, size);
      return rep.send(paged(out.data, out.total, page, size));
    }
  );

  // Get by ID (must be AFTER /me)
  app.get<{ Params: GetByIdParams }>(
    '/:id',
    {
      preHandler: [app.authenticate, app.requireRoles(['administrador'])],
      schema: {
        tags: ['Patients'],
        summary: 'Obtener paciente por ID',
        params: { type: 'object', properties: { id: { type: 'number' } } },
        response: {
          200: { description: 'Paciente encontrado', type: 'object', properties: { ok: { type: 'boolean', example: true }, data: { type: 'object', additionalProperties: true } } },
          404: { description: 'No encontrado', type: 'object' }
        }
      }
    },
    async (req, rep) => {
      const { id } = req.params;
      const p = await svc.getById(Number(id));
      if (!p) { return rep.notFound(); }
      return rep.send(ok(p));
    }
  );

  // Update (by id)
  app.put<{ Params: GetByIdParams; Body: UpsertBody }>(
    '/:id',
    {
      preHandler: [app.authenticate, app.requireRoles(['administrador'])],
      schema: {
        tags: ['Patients'],
        summary: 'Actualizar paciente (Admin)',
        params: { type: 'object', properties: { id: { type: 'number' } } },
        body: {
          type: 'object',
          properties: {
            tipoSangre: { type: 'string' },
            eps: { type: 'string' }
          }
        },
        response: {
          200: { description: 'Actualizado', type: 'object', properties: { ok: { type: 'boolean', example: true }, data: { type: 'object' } } }
        }
      }
    },
    async (req, rep) => {
      const { id } = req.params;
      const body = PatientUpsertDTO.parse(req.body);
      const updated = await svc.update(Number(id), body as any);
      return rep.send(ok(updated));
    }
  );

  // Status toggle
  app.patch<{ Params: GetByIdParams; Body: UpdateStatusBody }>(
    '/:id/status',
    {
      preHandler: [app.authenticate, app.requireRoles(['administrador'])],
      schema: {
        tags: ['Patients'],
        summary: 'Activar/Desactivar paciente',
        params: { type: 'object', properties: { id: { type: 'number' } } },
        body: {
          type: 'object',
          required: ['estado'],
          properties: { estado: { type: 'boolean' } }
        },
        response: {
          200: { description: 'Estado actualizado', type: 'object', properties: { ok: { type: 'boolean', example: true } } }
        }
      }
    },
    async (req, rep) => {
      const { id } = req.params;
      const { estado } = req.body;
      await svc.setEstado(Number(id), Boolean(estado));
      return rep.send(ok({ message: 'Estado actualizado' }));
    }
  );
}
