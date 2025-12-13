import type { FastifyInstance } from 'fastify';
import { makeDoctorService } from '@/core/injector';

/**
 * Doctors Routes
 * CRUD + /me + specialties
 */
export default async function routes(app: FastifyInstance) {
  const svc = makeDoctorService(app);

  // ======================
  // ME ENDPOINTS (must be registered BEFORE /:id routes)
  // ======================

  // Me (get)
  app.get('/me', {
    preHandler: [app.authenticate, app.requireDoctor()],
    schema: {
      tags: ['Doctors'],
      summary: 'Obtener mi perfil médico',
      description: 'Retorna la información del médico autenticado, incluyendo specialties y datos profesionales.',
      response: {
        200: {
          description: 'Perfil médico encontrado',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            data: {
              type: 'object',
              additionalProperties: true
            }
          }
        }
      }
    }
  }, async (req, rep) => {
    const userId = Number((req.user as any)?.id);
    if (!userId || isNaN(userId)) {
      return rep.status(400).send({ ok: false, error: { code: 'INVALID_TOKEN', message: 'Invalid user ID' } });
    }
    const d = await svc.getByUsuario(userId);
    if (!d) { return rep.send({ ok: true, data: null }); }
    return rep.send({ ok: true, data: d });
  });

  // Me (update)
  app.patch('/me', {
    preHandler: [app.authenticate, app.requireDoctor()],
    schema: {
      tags: ['Doctors'],
      summary: 'Actualizar mi perfil médico',
      description: 'Permite al médico actualizar su presentación y otros datos profesionales.',
      body: {
        type: 'object',
        properties: {
          presentacion: { type: 'string', example: 'Especialista con 10 años de experiencia...' },
          registro_profesional: { type: 'string' }
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
  }, async (req, rep) => {
    const userId = Number((req.user as any)?.id);
    if (!userId || isNaN(userId)) {
      return rep.status(400).send({ ok: false, error: { code: 'INVALID_TOKEN', message: 'Invalid user ID' } });
    }
    const d = await svc.updateByUsuario(userId, req.body as any);
    return rep.send({ ok: true, data: d });
  });

  // ======================
  // ADMIN CRUD ENDPOINTS
  // ======================

  // Create
  app.post('/', {
    preHandler: [app.authenticate, app.requireRoles(['administrador'])],
    schema: {
      tags: ['Doctors'],
      summary: 'Crear médico (Admin)',
      description: 'Crea un perfil médico asociado a un usuario existente.',
      body: {
        type: 'object',
        required: ['usuarioId', 'registro_profesional'],
        properties: {
          usuarioId: { type: 'number', example: 123 },
          registro_profesional: { type: 'string', example: 'RM-55555' }
        }
      },
      response: {
        201: {
          description: 'Médico creado',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'object' } }
        }
      }
    }
  }, async (req, rep) => {
    const body = req.body as any;
    const created = await svc.create({ usuarioId: Number(body.usuarioId), registro_profesional: String(body.registro_profesional) });
    return rep.code(201).send({ ok: true, data: created });
  });

  // List
  app.get('/', {
    preHandler: [app.authenticate, app.requireRoles(['administrador'])],
    schema: {
      tags: ['Doctors'],
      summary: 'Listar médicos (Admin)',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          size: { type: 'number', default: 20 }
        }
      },
      response: {
        200: {
          description: 'Lista paginada de médicos',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            data: { type: 'array', items: { type: 'object' } },
            meta: { type: 'object' }
          }
        }
      }
    }
  }, async (req, rep) => {
    const page = Number((req.query as any).page ?? 1);
    const size = Number((req.query as any).size ?? 20);
    const out = await svc.list(page, size);
    return rep.send({ ok: true, data: out.data, meta: { total: out.total, page, size } });
  });

  // Get by ID (must be AFTER /me)
  app.get('/:id', {
    preHandler: [app.authenticate, app.requireRoles(['administrador'])],
    schema: {
      tags: ['Doctors'],
      summary: 'Obtener médico por ID',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { description: 'Médico encontrado', type: 'object', properties: { ok: { type: 'boolean', example: true }, data: { type: 'object', additionalProperties: true } } },
        404: { description: 'Médico no encontrado', type: 'object' }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const d = await svc.getById(id);
    if (!d) { return rep.notFound(); }
    return rep.send({ ok: true, data: d });
  });

  // Update by id
  app.put('/:id', {
    preHandler: [app.authenticate, app.requireRoles(['administrador'])],
    schema: {
      tags: ['Doctors'],
      summary: 'Actualizar médico (Admin)',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        properties: {
          registro_profesional: { type: 'string' },
          presentacion: { type: 'string' }
        }
      },
      response: {
        200: { description: 'Actualizado', type: 'object', properties: { ok: { type: 'boolean' }, data: { type: 'object', additionalProperties: true } } }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const updated = await svc.update(id, req.body as any);
    return rep.send({ ok: true, data: updated });
  });

  // Status toggle
  app.patch('/:id/status', {
    preHandler: [app.authenticate, app.requireRoles(['administrador'])],
    schema: {
      tags: ['Doctors'],
      summary: 'Activar/Desactivar médico',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['estado'],
        properties: { estado: { type: 'boolean' } }
      },
      response: {
        200: { description: 'Estado cambiado', type: 'object', properties: { ok: { type: 'boolean' } } }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const { estado } = (req.body as any);
    await svc.setEstado(id, Boolean(estado));
    return rep.send({ ok: true });
  });

  // Specialties
  app.post('/:id/specialties', {
    preHandler: [app.authenticate, app.requireRoles(['administrador'])],
    schema: {
      tags: ['Doctors'],
      summary: 'Asignar especialidades',
      description: 'Reemplaza las especialidades actuales del médico por las enviadas.',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['especialidadIds'],
        properties: {
          especialidadIds: { type: 'array', items: { type: 'number' }, example: [1, 5] }
        }
      },
      response: {
        200: { description: 'Especialidades asignadas', type: 'object', properties: { ok: { type: 'boolean' } } }
      }
    }
  }, async (req, rep) => {
    const medicoId = Number((req.params as any).id);
    const ids = ((req.body as any)?.especialidadIds ?? []) as number[];
    await svc.setEspecialidades(medicoId, ids);
    return rep.send({ ok: true });
  });
}
