import type { FastifyInstance } from 'fastify';
import { makeUserService, makeAuthService } from '@/core/injector';
import { UserUpdateDTO } from './user.schema';
import { paginationSchema } from '@/shared/schemas/common.schema';


export default async function routes(app: FastifyInstance) {
  const svc = makeUserService(app);
  const authSvc = makeAuthService(app);

  /* ========= GET USER BY ID ========= */
  app.get('/:id', {
    preHandler: [app.authenticate, app.requireRoles(['administrador'])],
    schema: {
      tags: ['Users'],
      summary: 'Obtener usuario por ID',
      description: 'Devuelve los detalles de un usuario específico.',
      params: {
        type: 'object',
        properties: { id: { type: 'number', description: 'ID del usuario' } }
      },
      response: {
        200: {
          description: 'Usuario encontrado',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'object' } }
        },
        404: {
          description: 'Usuario no encontrado',
          type: 'object',
          properties: { ok: { type: 'boolean', example: false }, error: { type: 'object' } }
        }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const u = await svc.getById(id);
    if (!u) { return rep.notFound(); }
    return rep.send({ ok: true, data: u });
  });

  /* ========= UPDATE USER ========= */
  app.patch('/:id', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Actualizar usuario',
      description: 'Actualiza datos básicos del usuario (nombre, apellido, teléfono, etc).',
      params: {
        type: 'object',
        properties: { id: { type: 'number', description: 'ID del usuario a actualizar' } }
      },
      body: {
        type: 'object',
        properties: {
          primerNombre: { type: 'string', example: 'Pedro' },
          primerApellido: { type: 'string', example: 'Gomez' },
          telefono: { type: 'string', example: '+57 300 111 2233' },
          direccion: { type: 'string', example: 'Calle Falsa 123' },
          numeroDocumento: { type: 'string' },
          fechaNacimiento: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: {
          description: 'Usuario actualizado',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'object' } }
        }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const dto = UserUpdateDTO.parse(req.body);
    const u = await svc.update(id, dto);
    return rep.send({ ok: true, data: u });
  });

  /* ========= LIST USERS (PAGINATED) ========= */
  app.get('/', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Listar usuarios',
      description: 'Obtiene una lista paginada de usuarios con filtros opcionales de búsqueda.',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          size: { type: 'number', default: 20 },
          search: { type: 'string', description: 'Buscar por nombre o email' }
        }
      },
      response: {
        200: {
          description: 'Lista de usuarios',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            data: { type: 'array', items: { type: 'object' } },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                page: { type: 'number' },
                size: { type: 'number' },
                last_page: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (req, rep) => {
    const params = paginationSchema.parse(req.query);
    const result = await svc.listPaginated(params);
    return rep.send({ ok: true, ...result });
  });

  /* ========= ASSIGN ROLE ========= */
  app.put('/:id/roles/:codigo', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Asignar rol a usuario',
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          codigo: { type: 'string', enum: ['administrador', 'medico', 'paciente'] }
        }
      },
      response: {
        200: { description: 'Rol asignado', type: 'object', properties: { ok: { type: 'boolean', example: true } } },
        401: { type: 'object', properties: { ok: { type: 'boolean' }, error: { type: 'object' } } },
        403: { type: 'object', properties: { ok: { type: 'boolean' }, error: { type: 'object' } } }
      }
    }
  }, async (req, rep) => {
    const { id, codigo } = (req.params as any);
    const out = await authSvc.addRol(Number(id), String(codigo));
    return rep.send(out);
  });

  /* ========= TOGGLE STATUS ========= */
  app.patch('/:id/status', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Activar/Desactivar usuario',
      params: {
        type: 'object',
        properties: { id: { type: 'number' } }
      },
      body: {
        type: 'object',
        required: ['estado'],
        properties: { estado: { type: 'boolean', description: 'true para activar, false para desactivar' } }
      },
      response: {
        200: { description: 'Estado actualizado', type: 'object', properties: { ok: { type: 'boolean', example: true } } },
        401: { type: 'object', properties: { ok: { type: 'boolean' }, error: { type: 'object' } } }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const body = (req.body as any) ?? {};
    const out = await authSvc.setEstado(id, Boolean(body.estado));
    return rep.send(out);
  });
}
