import type { FastifyInstance } from 'fastify';
import { makeAppointmentService } from '@/core/injector';
import { DefineAvailabilityDTO, BookDTO, RescheduleDTO, CancelDTO } from './appointment.schema';

export default async function routes(app: FastifyInstance) {
  const svc = makeAppointmentService(app);

  // ==================== HORARIOS MÉDICOS ====================

  // Crear horario de disponibilidad (solo médicos)
  app.post('/schedules', {
    preHandler: [app.authenticate, app.requireDoctor()],
    schema: {
      tags: ['Appointments'],
      summary: 'Crear horario de disponibilidad',
      description: 'El médico define sus horarios de atención semanales.',
      body: {
        type: 'object',
        required: ['diaSemana', 'horaInicio', 'horaFin'],
        properties: {
          diaSemana: { type: 'number', minimum: 1, maximum: 7, description: '1=Lunes, 7=Domingo' },
          horaInicio: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', example: '08:00' },
          horaFin: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', example: '12:00' }
        }
      },
      response: {
        201: {
          description: 'Horario creado',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'object' } }
        }
      }
    }
  }, async (req, rep) => {
    const dto = DefineAvailabilityDTO.parse(req.body);
    const out = await svc.defineAvailability(dto, { id: (req.user as any)?.id });
    return rep.code(201).send(out);
  });

  // Obtener mis horarios (médico)
  app.get('/schedules/mine', {
    preHandler: [app.authenticate, app.requireDoctor()],
    schema: {
      tags: ['Appointments'],
      summary: 'Mis horarios de disponibilidad',
      response: {
        200: {
          description: 'Lista de horarios configurados',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'array', items: { type: 'object', additionalProperties: true } } }
        }
      }
    }
  }, async (req, rep) => {
    const horarios = await svc.getMySchedules({ id: (req.user as any)?.id });
    return rep.send({ ok: true, data: horarios });
  });

  // Obtener horarios de un médico específico (público para pacientes)
  app.get('/schedules/doctor/:medicoId', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Horarios de un médico',
      params: { type: 'object', properties: { medicoId: { type: 'number' } } },
      response: {
        200: {
          description: 'Horarios del médico',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'array', items: { type: 'object', additionalProperties: true } } }
        }
      }
    }
  }, async (req, rep) => {
    const medicoId = Number((req.params as any).medicoId);
    const horarios = await svc.getDoctorSchedules(medicoId);
    return rep.send({ ok: true, data: horarios });
  });

  // Actualizar horario
  app.put('/schedules/:id', {
    preHandler: [app.authenticate, app.requireDoctor()],
    schema: {
      tags: ['Appointments'],
      summary: 'Actualizar horario',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        properties: {
          inicio: { type: 'string', example: '09:00' },
          fin: { type: 'string', example: '13:00' }
        }
      },
      response: {
        200: { description: 'Horario actualizado', type: 'object', properties: { ok: { type: 'boolean', example: true } } }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const { inicio, fin } = req.body as any;
    const updated = await svc.updateSchedule(id, inicio, fin, { id: (req.user as any)?.id });
    return rep.send({ ok: true, data: updated });
  });

  // Eliminar horario
  app.delete('/schedules/:id', {
    preHandler: [app.authenticate, app.requireDoctor()],
    schema: {
      tags: ['Appointments'],
      summary: 'Eliminar horario',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { description: 'Horario eliminado', type: 'object', properties: { ok: { type: 'boolean', example: true } } }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    await svc.deleteSchedule(id, { id: (req.user as any)?.id });
    return rep.send({ ok: true, message: 'Horario eliminado' });
  });

  // Obtener disponibilidad real de un médico
  app.get('/availability/:medicoId', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Consultar disponibilidad',
      description: 'Devuelve los slots disponibles para un médico en un rango de fechas.',
      params: { type: 'object', properties: { medicoId: { type: 'number' } } },
      querystring: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string', format: 'date', example: '2025-01-01' },
          endDate: { type: 'string', format: 'date', example: '2025-01-07' }
        }
      },
      response: {
        200: {
          description: 'Disponibilidad calculada',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'array', items: { type: 'object', additionalProperties: true } } }
        }
      }
    }
  }, async (req, rep) => {
    const medicoId = Number((req.params as any).medicoId);
    const { startDate, endDate } = req.query as any;
    const availability = await svc.getAvailability(medicoId, startDate, endDate);
    return rep.send({ ok: true, data: availability });
  });

  // ==================== BÚSQUEDA DE MÉDICOS ====================

  // Buscar médicos
  app.get('/doctors/search', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Buscar médicos',
      description: 'Busca médicos por nombre o especialidad.',
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Nombre del médico' },
          especialidadId: { type: 'number', description: 'ID de especialidad' }
        }
      },
      response: {
        200: {
          description: 'Resultados búsqueda',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'array', items: { type: 'object', additionalProperties: true } } }
        }
      }
    }
  }, async (req, rep) => {
    const { query, especialidadId } = req.query as any;
    const medicos = await svc.searchDoctors(query, especialidadId ? Number(especialidadId) : undefined);
    return rep.send({ ok: true, data: medicos });
  });

  // Obtener detalles de un médico
  app.get('/doctors/:medicoId', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Detalles públicos de un médico',
      params: { type: 'object', properties: { medicoId: { type: 'number' } } },
      response: {
        200: {
          description: 'Detalle médico',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'object', additionalProperties: true } }
        }
      }
    }
  }, async (req, rep) => {
    const medicoId = Number((req.params as any).medicoId);
    const medico = await svc.getDoctorDetails(medicoId);
    return rep.send({ ok: true, data: medico });
  });

  // ==================== GESTIÓN DE CITAS ====================

  // Agendar cita
  app.post('/', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Agendar cita',
      description: 'Reserva una cita con un médico en un horario específico.',
      body: {
        type: 'object',
        required: ['medicoId', 'inicio', 'fin'],
        properties: {
          medicoId: { type: 'number', example: 5 },
          inicio: { type: 'string', format: 'date-time' },
          fin: { type: 'string', format: 'date-time' },
          motivo: { type: 'string', example: 'Dolor de cabeza' }
        }
      },
      response: {
        201: {
          description: 'Cita agendada',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true }, data: { type: 'object' } }
        }
      }
    }
  }, async (req, rep) => {
    const dto = BookDTO.parse(req.body);
    const out = await svc.book(dto, { id: (req.user as any)?.id });
    return rep.code(201).send({ ok: true, data: out });
  });

  // Confirmar cita (solo médico)
  app.patch('/:id/confirm', {
    preHandler: [app.authenticate, app.requireDoctor()],
    schema: {
      tags: ['Appointments'],
      summary: 'Confirmar cita (Médico)',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: { 200: { description: 'Cita confirmada', type: 'object', properties: { ok: { type: 'boolean' } } } }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const out = await svc.confirm(id, { id: (req.user as any)?.id });
    return rep.send({ ok: true, data: out });
  });

  // Completar cita (solo médico)
  app.patch('/:id/complete', {
    preHandler: [app.authenticate, app.requireDoctor()],
    schema: {
      tags: ['Appointments'],
      summary: 'Completar cita (Médico)',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: { 200: { description: 'Cita completada', type: 'object', properties: { ok: { type: 'boolean' } } } }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const out = await svc.complete(id, { id: (req.user as any)?.id });
    return rep.send({ ok: true, data: out });
  });

  // Marcar no asistió (solo médico)
  app.patch('/:id/no-show', {
    preHandler: [app.authenticate, app.requireDoctor()],
    schema: {
      tags: ['Appointments'],
      summary: 'Marcar No Asistió (Médico)',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: { 200: { description: 'Marcada como no asistió', type: 'object', properties: { ok: { type: 'boolean' } } } }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const out = await svc.markNoShow(id, { id: (req.user as any)?.id });
    return rep.send({ ok: true, data: out });
  });

  // Reprogramar cita
  app.patch('/:id/reschedule', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Reprogramar cita',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['nuevaFecha', 'nuevaHoraInicio'],
        properties: {
          nuevaFecha: { type: 'string', format: 'date' },
          nuevaHoraInicio: { type: 'string', example: '11:00' }
        }
      },
      response: { 200: { description: 'Cita reprogramada', type: 'object', properties: { ok: { type: 'boolean' } } } }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const dto = RescheduleDTO.parse(req.body);
    const out = await svc.reschedule(id, dto, { id: (req.user as any)?.id });
    return rep.send({ ok: true, data: out });
  });

  // Cancelar cita
  app.patch('/:id/cancel', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Cancelar cita',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        properties: { motivo: { type: 'string' } }
      },
      response: { 200: { description: 'Cita cancelada', type: 'object', properties: { ok: { type: 'boolean' } } } }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const dto = CancelDTO.parse(req.body);
    const out = await svc.cancel(id, dto, { id: (req.user as any)?.id });
    return rep.send({ ok: true, data: out });
  });

  // ==================== CONSULTAS DE CITAS ====================

  // Citas de hoy
  app.get('/today', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Citas de hoy',
    }
  }, async (req, rep) => {
    const citas = await svc.getToday({ id: (req.user as any)?.id });
    return rep.send({ ok: true, data: citas });
  });

  // Próximas citas
  app.get('/upcoming', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Próximas citas',
      querystring: {
        type: 'object',
        properties: { limit: { type: 'number', default: 10 } }
      },
    }
  }, async (req, rep) => {
    const limit = Number((req.query as any).limit) || 10;
    const citas = await svc.getUpcoming({ id: (req.user as any)?.id }, limit);
    return rep.send({ ok: true, data: citas });
  });

  // Historial de citas
  app.get('/history', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Historial de citas',
      querystring: {
        type: 'object',
        properties: { limit: { type: 'number', default: 20 } }
      },
    }
  }, async (req, rep) => {
    const limit = Number((req.query as any).limit) || 20;
    const citas = await svc.getHistory({ id: (req.user as any)?.id }, limit);
    return rep.send({ ok: true, data: citas });
  });

  // Mis citas (todas)
  app.get('/mine', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Mis citas (Todas)',
      description: 'Obtiene todas las citas del usuario actual.',
    }
  }, async (req, rep) => {
    const out = await svc.listMine({ id: (req.user as any)?.id });
    return rep.send({ ok: true, data: out });
  });

  // Detalle de cita
  app.get('/:id', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Detalle de cita',
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { description: 'Detalle de la cita', type: 'object', properties: { ok: { type: 'boolean', example: true }, data: { type: 'object', additionalProperties: true } } },
        404: { description: 'Cita no encontrada', type: 'object' }
      }
    }
  }, async (req, rep) => {
    const id = Number((req.params as any).id);
    const c = await svc.get(id);
    if (!c) {
      return rep.notFound();
    }
    return rep.send({ ok: true, data: c });
  });

  // Listado general de citas (admin)
  app.get('/', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Appointments'],
      summary: 'Listado general de citas (Admin)',
    }
  }, async (_req, rep) => {
    const list = await svc.list();
    return rep.send({ ok: true, data: list });
  });
}
