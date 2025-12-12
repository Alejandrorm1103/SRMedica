/**
 * Servicio completo de gestión de citas médicas
 * Incluye: horarios, disponibilidad, reservas, búsqueda de médicos y notificaciones
 */

import type { FastifyInstance } from 'fastify';
import { AppointmentRepository } from './appointment.repository';
import { DefineAvailabilityDTO, BookDTO, RescheduleDTO, CancelDTO } from './appointment.schema';
import { NotificationService } from '../notifications/notification.service';
import { NotificationRepository } from '../notifications/notification.repository';

export class AppointmentService {
  private notificationService: NotificationService;

  constructor(private app: FastifyInstance, private repo: AppointmentRepository) {
    const notificationRepo = new NotificationRepository(app);
    this.notificationService = new NotificationService(app, notificationRepo);
  }

  // ==================== HORARIOS MÉDICOS ====================

  /** Define disponibilidad horaria de un médico */
  async defineAvailability(dto: ReturnType<typeof DefineAvailabilityDTO.parse>, actor: { id: number }) {
    // Verificar que el usuario sea médico
    const medicoId = await this.repo.findMedicoByUsuario(actor.id);
    if (!medicoId) {
      throw new Error('UNAUTHORIZED: Solo médicos pueden definir horarios');
    }

    // Insertar el horario
    await this.repo.insertHorario(medicoId, dto.diaSemana, dto.horaInicio, dto.horaFin);

    return { ok: true, message: 'Horario creado exitosamente' };
  }

  /** Obtener horarios de un médico */
  async getMySchedules(actor: { id: number }) {
    const medicoId = await this.repo.findMedicoByUsuario(actor.id);
    if (!medicoId) {
      throw new Error('UNAUTHORIZED: Solo médicos tienen horarios');
    }

    const horarios = await this.repo.getHorariosByMedico(medicoId);

    // Formatear horas para el frontend
    return horarios.map(h => ({
      ...h,
      horaInicio: h.horaInicio.toISOString().split('T')[1]?.substring(0, 5) || '00:00',
      horaFin: h.horaFin.toISOString().split('T')[1]?.substring(0, 5) || '00:00',
    }));
  }

  /** Obtener horarios de un médico específico (para pacientes) */
  async getDoctorSchedules(medicoId: number) {
    const horarios = await this.repo.getHorariosByMedico(medicoId);

    // Formatear horas para el frontend
    return horarios.map(h => ({
      ...h,
      horaInicio: h.horaInicio.toISOString().split('T')[1]?.substring(0, 5) || '00:00',
      horaFin: h.horaFin.toISOString().split('T')[1]?.substring(0, 5) || '00:00',
    }));
  }

  /** Actualizar un horario */
  async updateSchedule(id: number, inicio: string, fin: string, actor: { id: number }) {
    const horario = await this.repo.getHorarioById(id);
    if (!horario) {
      throw new Error('NOT_FOUND: Horario no encontrado');
    }

    const medicoId = await this.repo.findMedicoByUsuario(actor.id);
    if (!medicoId || Number(horario.medicoId) !== medicoId) {
      throw new Error('UNAUTHORIZED: No puedes modificar este horario');
    }

    // Actualizar horario no implementado - requiere rediseño
    throw new Error('NOT_IMPLEMENTED: updateSchedule needs to be redesigned');
  }

  /** Eliminar un horario */
  async deleteSchedule(id: number, actor: { id: number }) {
    const horario = await this.repo.getHorarioById(id);
    if (!horario) {
      throw new Error('NOT_FOUND: Horario no encontrado');
    }

    const medicoId = await this.repo.findMedicoByUsuario(actor.id);
    if (!medicoId || Number(horario.medicoId) !== medicoId) {
      throw new Error('UNAUTHORIZED: No puedes eliminar este horario');
    }

    return this.repo.deleteHorario(id);
  }

  /** Obtener disponibilidad real de un médico */
  async getAvailability(medicoId: number, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const { horarios, citas } = await this.repo.getAvailabilitySlots(medicoId, start, end);

    // Calcular slots disponibles (horarios desglosados en intervalos de 30 min)
    const DURATION_MS = 30 * 60 * 1000; // 30 minutos

    const availableSlots = horarios.flatMap(horario => {
      const slots = [];
      let currentTime = new Date(horario.inicio).getTime();
      const endTime = new Date(horario.fin).getTime();

      while (currentTime + DURATION_MS <= endTime) {
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(currentTime + DURATION_MS);

        // Verificar conflictos para este slot específico
        const conflictingCitas = citas.filter(cita =>
          (cita.inicio < slotEnd && cita.fin > slotStart) // Overlap simple condition
        );

        slots.push({
          horario: {
            id: Number(horario.horarioId),
            inicio: slotStart.toISOString(),
            fin: slotEnd.toISOString(),
          },
          ocupado: conflictingCitas.length > 0,
          citas: conflictingCitas.map(c => ({
            id: c.id,
            inicio: c.inicio,
            fin: c.fin,
          })),
        });

        currentTime += DURATION_MS;
      }
      return slots;
    });

    return availableSlots;
  }

  // ==================== BÚSQUEDA DE MÉDICOS ====================

  /** Buscar médicos por nombre o especialidad */
  async searchDoctors(query?: string, especialidadId?: number) {
    const medicos = await this.repo.searchDoctors(query, especialidadId);

    return medicos.map(m => ({
      id: m.id,
      primerNombre: m.primerNombre,
      segundoNombre: m.segundoNombre,
      primerApellido: m.primerApellido,
      segundoApellido: m.segundoApellido,
      registroProfesional: m.registroProfesional,
      email: m.usuario.email,
      telefono: m.usuario.telefono,
      especialidades: m.especialidades.map(e => ({
        id: e.especialidad.id,
        codigo: e.especialidad.codigo,
        nombre: e.especialidad.nombre,
      })),
    }));
  }

  /** Obtener detalles de un médico */
  async getDoctorDetails(medicoId: number) {
    const medico = await this.repo.getDoctorWithDetails(medicoId);
    if (!medico) {
      throw new Error('NOT_FOUND: Médico no encontrado');
    }

    return {
      id: medico.id,
      primerNombre: medico.primerNombre,
      segundoNombre: medico.segundoNombre,
      primerApellido: medico.primerApellido,
      segundoApellido: medico.segundoApellido,
      registroProfesional: medico.registroProfesional,
      resumenPerfil: medico.resumenPerfil,
      email: medico.usuario.email,
      telefono: medico.usuario.telefono,
      especialidades: medico.especialidades.map(e => ({
        id: e.especialidad.id,
        codigo: e.especialidad.codigo,
        nombre: e.especialidad.nombre,
      })),
    };
  }

  // ==================== GESTIÓN DE CITAS ====================

  /** Reserva una cita médica */
  async book(dto: ReturnType<typeof BookDTO.parse>, actor: { id: number }) {
    // 1. Identificar al paciente desde el usuario autenticado
    const pacienteId = await this.repo.findPacienteByUsuario(actor.id);
    if (!pacienteId) {
      throw new Error('UNAUTHORIZED: Solo pacientes pueden agendar citas');
    }

    // Validar disponibilidad del médico
    const inicio = new Date(dto.inicio);
    const fin = new Date(dto.fin);

    const isAvailable = await this.repo.checkDoctorAvailability(dto.medicoId, inicio, fin);
    if (!isAvailable) {
      throw new Error('CONFLICT: El médico no está disponible en ese horario');
    }

    // Crear la cita
    const estadoProgramadaId = await this.repo.resolveEstadoId('programada');
    const cita = await this.repo.createCita({
      pacienteId: pacienteId, // Usar ID resuelto, no del DTO (seguridad)
      medicoId: dto.medicoId,
      inicio: dto.inicio,
      fin: dto.fin,
      estadoId: estadoProgramadaId,
      motivo: dto.motivo,
    });

    // Registrar en historial
    await this.repo.addHistorial(cita.id, null, estadoProgramadaId, actor.id, 'Creación de cita');

    // Crear notificaciones automáticas
    try {
      // Obtener datos del médico y paciente para las notificaciones
      const medico = await this.app.prisma.medico.findUnique({
        where: { id: dto.medicoId },
        include: { usuario: true },
      });

      const paciente = await this.app.prisma.paciente.findUnique({
        where: { id: dto.pacienteId },
        include: { usuario: true },
      });

      if (medico && paciente) {
        const medicoNombre = `${medico.primerNombre} ${medico.primerApellido}`;
        const pacienteNombre = `${paciente.primerNombre} ${paciente.primerApellido}`;

        await this.notificationService.createAppointmentCreatedNotification(
          cita.id,
          Number(medico.usuarioId),
          Number(paciente.usuarioId),
          inicio,
          medicoNombre,
          pacienteNombre
        );
      }
    } catch (error) {
      // No fallar si las notificaciones fallan
      console.error('Error creating notifications:', error);
    }

    return cita;
  }

  /** Reprograma una cita existente */
  async reschedule(id: number, dto: ReturnType<typeof RescheduleDTO.parse>, actor: { id: number }) {
    const cita = await this.repo.getById(id);
    if (!cita) {
      throw new Error('NOT_FOUND: Cita no encontrada');
    }

    // Validar disponibilidad en el nuevo horario
    const inicio = new Date(dto.inicio);
    const fin = new Date(dto.fin);

    const isAvailable = await this.repo.checkDoctorAvailability(cita.medico_id, inicio, fin, id);
    if (!isAvailable) {
      throw new Error('CONFLICT: El médico no está disponible en ese horario');
    }

    // Actualizar la cita
    const estadoReprogramadaId = await this.repo.resolveEstadoId('reprogramada');
    const updated = await this.repo.updateCita(id, {
      inicio: dto.inicio,
      fin: dto.fin,
      estado_cita_id: estadoReprogramadaId,
    });

    // Registrar en historial
    await this.repo.addHistorial(id, cita.estado_cita_id, estadoReprogramadaId, actor.id, 'Reprogramación');

    return updated;
  }

  /** Cancela una cita */
  async cancel(id: number, dto: ReturnType<typeof CancelDTO.parse>, actor: { id: number }) {
    const cita = await this.repo.getById(id);
    if (!cita) {
      throw new Error('NOT_FOUND: Cita no encontrada');
    }

    // Determinar si es médico o paciente quien cancela
    const medicoId = await this.repo.findMedicoByUsuario(actor.id);
    const estadoCodigo = medicoId ? 'cancelada_medico' : 'cancelada_paciente';

    const estadoCancelId = await this.repo.resolveEstadoId(estadoCodigo);
    const motivoId = await this.repo.resolveMotivoId(dto.motivoCancelacionCodigo);

    const updated = await this.repo.updateCita(id, {
      estado_cita_id: estadoCancelId,
      motivo_cancelacion_id: motivoId,
      cancelada_por_usuario_id: actor.id,
    });

    // Registrar en historial
    await this.repo.addHistorial(id, cita.estado_cita_id, estadoCancelId, actor.id, dto.motivoCancelacionCodigo);

    // Crear notificaciones automáticas
    try {
      const medico = await this.app.prisma.medico.findUnique({
        where: { id: Number(cita.medico_id) },
        include: { usuario: true },
      });

      const paciente = await this.app.prisma.paciente.findUnique({
        where: { id: Number(cita.paciente_id) },
        include: { usuario: true },
      });

      if (medico && paciente) {
        const medicoNombre = `${medico.primerNombre} ${medico.primerApellido}`;
        const pacienteNombre = `${paciente.primerNombre} ${paciente.primerApellido}`;
        const canceladoPor = medicoId ? 'medico' : 'paciente';
        const nombreCancelador = medicoId ? medicoNombre : pacienteNombre;

        // Notificar a la otra parte
        const destinatarioId = medicoId ? paciente.usuarioId : medico.usuarioId;
        await this.notificationService.createAppointmentCancelledNotification(
          cita.id,
          Number(destinatarioId),
          new Date(cita.inicio),
          canceladoPor,
          nombreCancelador
        );
      }
    } catch (error) {
      console.error('Error creating notifications:', error);
    }

    return updated;
  }

  /** Confirmar una cita (solo médico) */
  async confirm(id: number, actor: { id: number }) {
    const cita = await this.repo.getById(id);
    if (!cita) {
      throw new Error('NOT_FOUND: Cita no encontrada');
    }

    const medicoId = await this.repo.findMedicoByUsuario(actor.id);
    if (!medicoId || cita.medico_id !== medicoId) {
      throw new Error('UNAUTHORIZED: Solo el médico asignado puede confirmar la cita');
    }

    const estadoConfirmadaId = await this.repo.resolveEstadoId('confirmada');
    const updated = await this.repo.updateCita(id, {
      estado_cita_id: estadoConfirmadaId,
    });

    await this.repo.addHistorial(id, cita.estado_cita_id, estadoConfirmadaId, actor.id, 'Confirmación de cita');

    // Crear notificaciones automáticas
    try {
      const medico = await this.app.prisma.medico.findUnique({
        where: { id: Number(cita.medico_id) },
        include: { usuario: true },
      });

      const paciente = await this.app.prisma.paciente.findUnique({
        where: { id: Number(cita.paciente_id) },
        include: { usuario: true },
      });

      if (medico && paciente) {
        const medicoNombre = `${medico.primerNombre} ${medico.primerApellido}`;

        await this.notificationService.createAppointmentConfirmedNotification(
          cita.id,
          Number(paciente.usuarioId),
          new Date(cita.inicio),
          medicoNombre
        );
      }
    } catch (error) {
      console.error('Error creating notifications:', error);
    }

    return updated;
  }

  /** Marcar cita como completada */
  async complete(id: number, actor: { id: number }) {
    const cita = await this.repo.getById(id);
    if (!cita) {
      throw new Error('NOT_FOUND: Cita no encontrada');
    }

    const medicoId = await this.repo.findMedicoByUsuario(actor.id);
    if (!medicoId || cita.medico_id !== medicoId) {
      throw new Error('UNAUTHORIZED: Solo el médico asignado puede completar la cita');
    }

    const estadoCompletadaId = await this.repo.resolveEstadoId('completada');
    const updated = await this.repo.updateCita(id, {
      estado_cita_id: estadoCompletadaId,
    });

    await this.repo.addHistorial(id, cita.estado_cita_id, estadoCompletadaId, actor.id, 'Cita completada');

    return updated;
  }

  /** Marcar como no asistió */
  async markNoShow(id: number, actor: { id: number }) {
    const cita = await this.repo.getById(id);
    if (!cita) {
      throw new Error('NOT_FOUND: Cita no encontrada');
    }

    const medicoId = await this.repo.findMedicoByUsuario(actor.id);
    if (!medicoId || cita.medico_id !== medicoId) {
      throw new Error('UNAUTHORIZED: Solo el médico asignado puede marcar no asistió');
    }

    const estadoNoAsistioId = await this.repo.resolveEstadoId('no_asistio');
    const updated = await this.repo.updateCita(id, {
      estado_cita_id: estadoNoAsistioId,
    });

    await this.repo.addHistorial(id, cita.estado_cita_id, estadoNoAsistioId, actor.id, 'Paciente no asistió');

    return updated;
  }

  // ==================== CONSULTAS ====================

  /** Obtiene una cita por ID con detalles completos */
  async get(id: number) {
    return this.repo.getCitaWithDetails(id);
  }

  /** Citas de hoy del usuario actual */
  async getToday(actor: { id: number }) {
    return this.repo.getCitasToday(actor.id);
  }

  /** Próximas citas del usuario actual */
  async getUpcoming(actor: { id: number }, limit = 10) {
    return this.repo.getCitasUpcoming(actor.id, limit);
  }

  /** Historial de citas del usuario actual */
  async getHistory(actor: { id: number }, limit = 20) {
    return this.repo.getCitasHistory(actor.id, limit);
  }

  /** Lista las citas del usuario actual (paciente o médico) */
  async listMine(actor: { id: number }) {
    const p = await this.repo.findPacienteByUsuario(actor.id);
    if (p) {
      return this.repo.listByPaciente(p);
    }
    const m = await this.repo.findMedicoByUsuario(actor.id);
    if (m) {
      return this.repo.listByMedico(m);
    }
    return [];
  }

  /** Lista todas las citas (admin) */
  list() {
    return this.repo.list(100);
  }
}
