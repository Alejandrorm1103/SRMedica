import type { FastifyInstance } from 'fastify';
import type { Appointment } from './appointment.model';

export class AppointmentRepository {
  constructor(private app: FastifyInstance) { }

  async insertHorario(medicoId: number, diaSemana: number, horaInicio: string, horaFin: string) {
    const inicioDate = new Date(`1970-01-01T${horaInicio}Z`);
    const finDate = new Date(`1970-01-01T${horaFin}Z`);

    // Check if exists (active or inactive)
    const existing = await this.app.prisma.horarioMedico.findFirst({
      where: {
        medicoId,
        diaSemana,
        horaInicio: inicioDate,
        horaFin: finDate,
      },
    });

    if (existing) {
      // Restore if exists
      await this.app.prisma.horarioMedico.update({
        where: { id: existing.id },
        data: { estado: true },
      });
    } else {
      // Create new
      await this.app.prisma.horarioMedico.create({
        data: {
          medicoId,
          diaSemana,
          horaInicio: inicioDate,
          horaFin: finDate,
        },
      });
    }
  }

  async createCita(data: { pacienteId: number; medicoId: number; inicio: string; fin: string; estadoId: number; motivo?: string }) {
    const cita = await this.app.prisma.cita.create({
      data: {
        pacienteId: data.pacienteId,
        medicoId: data.medicoId,
        estadoCitaId: data.estadoId,
        inicio: new Date(data.inicio),
        fin: new Date(data.fin),
        motivo: data.motivo,
      },
    });
    return {
      id: Number(cita.id),
      paciente_id: Number(cita.pacienteId),
      medico_id: Number(cita.medicoId),
      estado_cita_id: Number(cita.estadoCitaId),
      inicio: cita.inicio,
      fin: cita.fin,
      motivo: cita.motivo,
    } as Appointment;
  }

  async addHistorial(citaId: number, estadoAnteriorId: number | null, estadoNuevoId: number, actorUsuarioId: number, motivo?: string) {
    await this.app.prisma.historialCita.create({
      data: {
        citaId,
        estadoAnteriorId,
        estadoNuevoId,
        cambiadoPorUsuarioId: actorUsuarioId,
        motivo,
      },
    });
  }

  async getById(id: number) {
    const cita = await this.app.prisma.cita.findUnique({
      where: { id },
    });
    if (!cita) { return null; }
    return {
      id: Number(cita.id),
      paciente_id: Number(cita.pacienteId),
      medico_id: Number(cita.medicoId),
      estado_cita_id: Number(cita.estadoCitaId),
      inicio: cita.inicio,
      fin: cita.fin,
      motivo: cita.motivo,
      motivo_cancelacion_id: cita.motivoCancelacionId ? Number(cita.motivoCancelacionId) : null,
      cancelada_por_usuario_id: cita.canceladaPorUsuarioId ? Number(cita.canceladaPorUsuarioId) : null,
    } as Appointment;
  }

  async updateCita(id: number, fields: Partial<{ inicio: string; fin: string; estado_cita_id: number; motivo_cancelacion_id: number; cancelada_por_usuario_id: number }>) {
    const data: any = {};
    if (fields.inicio) { data.inicio = new Date(fields.inicio); }
    if (fields.fin) { data.fin = new Date(fields.fin); }
    if (fields.estado_cita_id) { data.estadoCitaId = fields.estado_cita_id; }
    if (fields.motivo_cancelacion_id) { data.motivoCancelacionId = fields.motivo_cancelacion_id; }
    if (fields.cancelada_por_usuario_id) { data.canceladaPorUsuarioId = fields.cancelada_por_usuario_id; }

    const cita = await this.app.prisma.cita.update({
      where: { id },
      data,
    });
    return {
      id: Number(cita.id),
      paciente_id: Number(cita.pacienteId),
      medico_id: Number(cita.medicoId),
      estado_cita_id: Number(cita.estadoCitaId),
      inicio: cita.inicio,
      fin: cita.fin,
      motivo: cita.motivo,
      motivo_cancelacion_id: cita.motivoCancelacionId ? Number(cita.motivoCancelacionId) : null,
      cancelada_por_usuario_id: cita.canceladaPorUsuarioId ? Number(cita.canceladaPorUsuarioId) : null,
    } as Appointment;
  }

  async resolveEstadoId(codigo: string): Promise<number> {
    const estado = await this.app.prisma.estadoCita.findUnique({
      where: { codigo },
    });
    if (!estado) {
      throw new Error('CAT_ESTADO_NOT_FOUND');
    }
    return Number(estado.id);
  }

  async resolveMotivoId(codigo: string): Promise<number> {
    const motivo = await this.app.prisma.motivoCancelacionCita.findUnique({
      where: { codigo },
    });
    if (!motivo) {
      throw new Error('CAT_MOTIVO_NOT_FOUND');
    }
    return Number(motivo.id);
  }

  async findPacienteByUsuario(userId: number) {
    const paciente = await this.app.prisma.paciente.findUnique({
      where: { usuarioId: userId },
    });
    return paciente ? Number(paciente.id) : null;
  }

  async findMedicoByUsuario(userId: number) {
    const medico = await this.app.prisma.medico.findUnique({
      where: { usuarioId: userId },
    });
    return medico ? Number(medico.id) : null;
  }

  async listByPaciente(pacienteId: number) {
    const citas = await this.app.prisma.cita.findMany({
      where: { pacienteId },
      orderBy: { inicio: 'desc' },
    });
    return citas.map(c => ({
      id: Number(c.id),
      paciente_id: Number(c.pacienteId),
      medico_id: Number(c.medicoId),
      estado_cita_id: Number(c.estadoCitaId),
      inicio: c.inicio,
      fin: c.fin,
      motivo: c.motivo,
      motivo_cancelacion_id: c.motivoCancelacionId ? Number(c.motivoCancelacionId) : null,
      cancelada_por_usuario_id: c.canceladaPorUsuarioId ? Number(c.canceladaPorUsuarioId) : null,
    } as Appointment));
  }

  async listByMedico(medicoId: number) {
    const citas = await this.app.prisma.cita.findMany({
      where: { medicoId },
      orderBy: { inicio: 'desc' },
    });
    return citas.map(c => ({
      id: Number(c.id),
      paciente_id: Number(c.pacienteId),
      medico_id: Number(c.medicoId),
      estado_cita_id: Number(c.estadoCitaId),
      inicio: c.inicio,
      fin: c.fin,
      motivo: c.motivo,
      motivo_cancelacion_id: c.motivoCancelacionId ? Number(c.motivoCancelacionId) : null,
      cancelada_por_usuario_id: c.canceladaPorUsuarioId ? Number(c.canceladaPorUsuarioId) : null,
    } as Appointment));
  }

  async list(limit = 100) {
    return this.app.prisma.cita.findMany({
      take: limit,
      orderBy: { inicio: 'desc' },
      include: {
        paciente: {
          select: {
            id: true,
            primerNombre: true,
            primerApellido: true,
            usuario: {
              select: { email: true }
            }
          },
        },
        medico: {
          select: {
            id: true,
            primerNombre: true,
            primerApellido: true,
            especialidades: {
              include: {
                especialidad: true,
              },
            },
          },
        },
        estadoCita: true,
      },
    });
  }

  // ==================== HORARIOS MÉDICOS ====================

  async getHorariosByMedico(medicoId: number) {
    return this.app.prisma.horarioMedico.findMany({
      where: { medicoId, estado: true },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  async getHorarioById(id: number) {
    return this.app.prisma.horarioMedico.findUnique({
      where: { id },
    });
  }

  async updateHorario(id: number, diaSemana: number, horaInicio: string, horaFin: string) {
    return this.app.prisma.horarioMedico.update({
      where: { id },
      data: {
        diaSemana,
        horaInicio: new Date(`1970-01-01T${horaInicio}Z`),
        horaFin: new Date(`1970-01-01T${horaFin}Z`),
      },
    });
  }

  async deleteHorario(id: number) {
    return this.app.prisma.horarioMedico.update({
      where: { id },
      data: { estado: false },
    });
  }

  // ==================== DISPONIBILIDAD ====================

  async getAvailabilitySlots(medicoId: number, startDate: Date, endDate: Date) {
    // 1. Obtener horarios recurrentes del médico
    const horariosRecurrentes = await this.app.prisma.horarioMedico.findMany({
      where: { medicoId, estado: true },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });

    // 2. Generar slots para cada día en el rango
    const slots = [];
    const currentDate = new Date(startDate);
    // Asegurar que iteramos en UTC para no tener problemas de cambio de día por zona horaria
    const utcEndDate = new Date(endDate);

    while (currentDate < utcEndDate) {
      const dayOfWeek = currentDate.getUTCDay(); // 0=Domingo, 1=Lunes (en UTC)
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;

      // Buscar horarios para este día de la semana
      const horariosDelDia = horariosRecurrentes.filter(h => h.diaSemana === adjustedDay);

      for (const horario of horariosDelDia) {
        // Construir fecha inicio slot en UTC con compensación de zona horaria (UTC-5)
        const inicio = new Date(currentDate);
        const horaIStr = horario.horaInicio.toISOString().split('T')[1]?.substring(0, 5) || '00:00';
        const [hI, mI] = horaIStr.split(':');
        inicio.setUTCHours(parseInt(hI || '0') + 5, parseInt(mI || '0'), 0, 0);

        // Construir fecha fin slot en UTC con compensación
        const fin = new Date(currentDate);
        const horaFStr = horario.horaFin.toISOString().split('T')[1]?.substring(0, 5) || '00:00';
        const [hF, mF] = horaFStr.split(':');
        fin.setUTCHours(parseInt(hF || '0') + 5, parseInt(mF || '0'), 0, 0);

        // Si fin es menor que inicio, asume que cruza medianoche (no manejado aquí simplificadamente, pero por si acaso)
        if (fin <= inicio) {
          fin.setUTCDate(fin.getUTCDate() + 1);
        }

        slots.push({ inicio, fin, horarioId: horario.id });
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // 3. Obtener citas existentes
    // Buscamos cualquier cita que SOLAPE con el rango del día solicitado
    // (StartA <= EndB) and (EndA >= StartB)
    const citas = await this.app.prisma.cita.findMany({
      where: {
        medicoId,
        estado: true,
        // Citas que terminan DESPUÉS del inicio del rango Y empiezan ANTES del fin del rango
        fin: { gt: startDate },
        inicio: { lt: endDate },
      },
      orderBy: { inicio: 'asc' },
    });

    // 4. Devolver todos los slots y las citas para procesamiento granular
    return { horarios: slots, citas };
  }

  // ==================== BÚSQUEDA DE MÉDICOS ====================

  async searchDoctors(query?: string, especialidadId?: number) {
    const where: any = {
      estado: true,
      usuario: {
        estado: true,
      },
    };

    if (query) {
      where.OR = [
        { primerNombre: { contains: query, mode: 'insensitive' } },
        { primerApellido: { contains: query, mode: 'insensitive' } },
      ];
    }

    const medicos = await this.app.prisma.medico.findMany({
      where,
      include: {
        especialidades: {
          where: especialidadId ? { especialidadId } : undefined,
          include: {
            especialidad: true,
          },
        },
        usuario: {
          select: {
            email: true,
            telefono: true,
          },
        },
      },
      take: 50,
    });

    // Si se filtró por especialidad, solo devolver médicos que la tengan
    if (especialidadId) {
      return medicos.filter(m => m.especialidades.length > 0);
    }

    return medicos;
  }

  async getDoctorWithDetails(medicoId: number) {
    return this.app.prisma.medico.findUnique({
      where: { id: medicoId },
      include: {
        especialidades: {
          include: {
            especialidad: true,
          },
        },
        usuario: {
          select: {
            email: true,
            telefono: true,
          },
        },
      },
    });
  }

  // ==================== CONSULTAS AVANZADAS DE CITAS ====================

  async getCitasToday(userId: number) {
    const pacienteId = await this.findPacienteByUsuario(userId);
    const medicoId = await this.findMedicoByUsuario(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = {
      inicio: { gte: today, lt: tomorrow },
      estado: true,
    };

    if (pacienteId) {
      where.pacienteId = pacienteId;
    } else if (medicoId) {
      where.medicoId = medicoId;
    } else {
      return [];
    }

    return this.app.prisma.cita.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            primerNombre: true,
            primerApellido: true,
          },
        },
        medico: {
          select: {
            id: true,
            primerNombre: true,
            primerApellido: true,
            especialidades: {
              include: {
                especialidad: true,
              },
            },
          },
        },
        estadoCita: true,
      },
      orderBy: { inicio: 'asc' },
    });
  }

  async getCitasUpcoming(userId: number, limit = 10) {
    const pacienteId = await this.findPacienteByUsuario(userId);
    const medicoId = await this.findMedicoByUsuario(userId);

    const now = new Date();

    const where: any = {
      inicio: { gte: now },
      estado: true,
    };

    if (pacienteId) {
      where.pacienteId = pacienteId;
    } else if (medicoId) {
      where.medicoId = medicoId;
    } else {
      return [];
    }

    return this.app.prisma.cita.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            primerNombre: true,
            primerApellido: true,
          },
        },
        medico: {
          select: {
            id: true,
            primerNombre: true,
            primerApellido: true,
            especialidades: {
              include: {
                especialidad: true,
              },
            },
          },
        },
        estadoCita: true,
      },
      orderBy: { inicio: 'asc' },
      take: limit,
    });
  }

  async getCitasHistory(userId: number, limit = 20) {
    const pacienteId = await this.findPacienteByUsuario(userId);
    const medicoId = await this.findMedicoByUsuario(userId);

    const now = new Date();

    const where: any = {
      inicio: { lt: now },
      estado: true,
    };

    if (pacienteId) {
      where.pacienteId = pacienteId;
    } else if (medicoId) {
      where.medicoId = medicoId;
    } else {
      return [];
    }

    return this.app.prisma.cita.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            primerNombre: true,
            primerApellido: true,
          },
        },
        medico: {
          select: {
            id: true,
            primerNombre: true,
            primerApellido: true,
            especialidades: {
              include: {
                especialidad: true,
              },
            },
          },
        },
        estadoCita: true,
      },
      orderBy: { inicio: 'desc' },
      take: limit,
    });
  }

  async getCitaWithDetails(id: number) {
    return this.app.prisma.cita.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            id: true,
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
          },
        },
        medico: {
          select: {
            id: true,
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
            especialidades: {
              include: {
                especialidad: true,
              },
            },
          },
        },
        estadoCita: true,
        motivoCancelacion: true,
        historiales: {
          orderBy: { fechaCreacion: 'desc' },
          take: 10,
        },
      },
    });
  }

  // ==================== VALIDACIONES ====================

  async checkDoctorAvailability(medicoId: number, inicio: Date, fin: Date, excludeCitaId?: number) {
    const where: any = {
      medicoId,
      estado: true,
      OR: [
        {
          AND: [
            { inicio: { lte: inicio } },
            { fin: { gt: inicio } },
          ],
        },
        {
          AND: [
            { inicio: { lt: fin } },
            { fin: { gte: fin } },
          ],
        },
        {
          AND: [
            { inicio: { gte: inicio } },
            { fin: { lte: fin } },
          ],
        },
      ],
    };

    if (excludeCitaId) {
      where.id = { not: excludeCitaId };
    }

    const conflictingCitas = await this.app.prisma.cita.findMany({ where });
    return conflictingCitas.length === 0;
  }
}

