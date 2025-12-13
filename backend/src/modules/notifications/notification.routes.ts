import type { FastifyInstance } from 'fastify';
import { makeNotificationService } from '@/core/injector';
import { SetPreferenceDTO } from './notification.schema';

export default async function routes(app: FastifyInstance) {
  const svc = makeNotificationService(app);

  // ==================== CONSULTAS ====================

  // Obtener mis notificaciones
  app.get('/mine', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Mis notificaciones',
      description: 'Obtiene las notificaciones del usuario autenticado paginadas.',
      querystring: {
        type: 'object',
        properties: { limit: { type: 'number', default: 50, description: 'Límite de notificaciones a recuperar' } }
      },
      response: {
        200: {
          description: 'Lista de notificaciones',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'array', items: { type: 'object', additionalProperties: true } } }
        }
      }
    }
  }, async (req, rep) => {
    const limit = Number((req.query as any).limit) || 50;
    const notifications = await svc.listMine((req.user as any)?.id, limit);
    return rep.send({ ok: true, data: notifications });
  });

  // Obtener notificaciones no leídas
  app.get('/unread', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Notificaciones no leídas',
      response: {
        200: {
          description: 'Lista de notificaciones no leídas',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'array', items: { type: 'object', additionalProperties: true } } }
        }
      }
    }
  }, async (req, rep) => {
    const notifications = await svc.getUnread((req.user as any)?.id);
    return rep.send({ ok: true, data: notifications });
  });

  // Contador de no leídas
  app.get('/unread-count', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Contador de notificaciones no leídas',
      response: {
        200: {
          description: 'Número de notificaciones sin leer',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'object', properties: { count: { type: 'number' } } } }
        }
      }
    }
  }, async (req, rep) => {
    const count = await svc.getUnreadCount((req.user as any)?.id);
    return rep.send({ ok: true, data: { count } });
  });

  // Notificaciones por cita
  app.get('/appointment/:citaId', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Notificaciones de una cita',
      params: { type: 'object', properties: { citaId: { type: 'number' } } },
      response: {
        200: {
          description: 'Notificaciones asociadas a la cita',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'array', items: { type: 'object', additionalProperties: true } } }
        }
      }
    }
  }, async (req, rep) => {
    const citaId = Number((req.params as any).citaId);
    const notifications = await svc.listByAppointment(citaId);
    return rep.send({ ok: true, data: notifications });
  });

  // ==================== ACCIONES ====================

  // Marcar como leída
  app.patch('/:id/read', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Marcar notificación como leída',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { description: 'Marcada como leída', type: 'object', properties: { ok: { type: 'boolean', example: true } } }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const result = await svc.markAsRead(id, (req.user as any)?.id);
    return rep.send(result);
  });

  // Marcar todas como leídas
  app.patch('/read-all', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Marcar todas como leídas',
      response: {
        200: { description: 'Todas marcadas como leídas', type: 'object', properties: { ok: { type: 'boolean', example: true } } }
      }
    }
  }, async (req, rep) => {
    const result = await svc.markAllAsRead((req.user as any)?.id);
    return rep.send(result);
  });

  // ==================== PREFERENCIAS ====================

  // Obtener preferencias
  app.get('/preferences', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Obtener preferencias de notificaciones',
      response: {
        200: {
          description: 'Preferencias del usuario',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'object' } }
        }
      }
    }
  }, async (req, rep) => {
    const preferences = await svc.getPreferences((req.user as any)?.id);
    return rep.send({ ok: true, data: preferences });
  });

  // Establecer preferencia
  app.post('/preferences', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Establecer preferencia de canal',
      body: {
        type: 'object',
        required: ['canal', 'habilitado'],
        properties: { canal: { type: 'string', enum: ['email', 'sms', 'push'] }, habilitado: { type: 'boolean' } }
      },
      response: {
        200: { description: 'Preferencia actualizada', type: 'object', properties: { ok: { type: 'boolean', example: true } } }
      }
    }
  }, async (req, rep) => {
    const dto = SetPreferenceDTO.parse(req.body);
    const result = await svc.setPreference((req.user as any)?.id, dto);
    return rep.send(result);
  });

  // ==================== ENVÍOS ====================

  // Reintentar envío
  app.post('/envios/:envioId/retry', {
    preHandler: [app.authenticate, app.requireRoles(['administrador'])],
    schema: {
      tags: ['Notifications'],
      summary: 'Reintentar envío de notificación',
      params: { type: 'object', properties: { envioId: { type: 'number' } } },
      response: {
        200: { description: 'Reintento encolado', type: 'object', properties: { ok: { type: 'boolean', example: true } } }
      }
    }
  }, async (req, rep) => {
    const envioId = Number((req.params as any).envioId);
    const result = await svc.retryEnvio(envioId);
    return rep.send(result);
  });
}
