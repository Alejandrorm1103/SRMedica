import api from './api';

// ==================== INTERFACES ====================

export interface Horario {
    id: number;
    medicoId: number;
    diaSemana: number;       // 1=Lunes, 7=Domingo
    horaInicio: string;      // "HH:MM"
    horaFin: string;         // "HH:MM"
    estado: boolean;
    fecha_creacion: string;
}

export interface Especialidad {
    id: number;
    codigo: string;
    nombre: string;
}

export interface Medico {
    id: number;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    registroProfesional: string;
    resumenPerfil?: string;
    email: string;
    telefono?: string;
    especialidades: Especialidad[];
}

export interface Cita {
    id: number;
    pacienteId: number;
    medicoId: number;
    estadoCitaId: number;
    inicio: string;
    fin: string;
    motivo?: string;
    motivoCancelacionId?: number;
    canceladaPorUsuarioId?: number;
    paciente?: {
        id: number;
        primerNombre: string;
        primerApellido: string;
    };
    medico?: {
        id: number;
        primerNombre: string;
        primerApellido: string;
        especialidades?: Array<{
            especialidad: Especialidad;
        }>;
    };
    estadoCita?: {
        id: number;
        codigo: string;
        nombre: string;
    };
    motivoCancelacion?: {
        id: number;
        codigo: string;
        nombre: string;
    };
}

export interface CitaDetallada extends Cita {
    historiales?: Array<{
        id: number;
        estadoAnteriorId?: number;
        estadoNuevoId: number;
        cambiadoPorUsuarioId: number;
        motivo?: string;
        fechaCreacion: string;
    }>;
}

// ==================== HORARIOS MÉDICOS ====================

export const appointmentsService = {
    // Crear horario de disponibilidad (solo médicos)
    async createSchedule(data: { medicoId: number; diaSemana: number; horaInicio: string; horaFin: string }) {
        const response = await api.post('/appointments/schedules', data);
        return response.data;
    },

    // Obtener mis horarios (médico)
    async getMySchedules() {
        const response = await api.get<{ ok: boolean; data: Horario[] }>('/appointments/schedules/mine');
        return response.data.data || [];
    },

    // Obtener horarios de un médico específico
    async getDoctorSchedules(medicoId: number) {
        const response = await api.get<{ ok: boolean; data: Horario[] }>(`/appointments/schedules/doctor/${medicoId}`);
        return response.data.data;
    },

    // Actualizar horario
    async updateSchedule(id: number, data: { diaSemana: number; horaInicio: string; horaFin: string }) {
        const response = await api.put(`/appointments/schedules/${id}`, data);
        return response.data;
    },

    // Eliminar horario
    async deleteSchedule(id: number) {
        const response = await api.delete(`/appointments/schedules/${id}`);
        return response.data;
    },

    // Obtener disponibilidad real de un médico
    async getAvailability(medicoId: number, startDate: string, endDate: string) {
        const response = await api.get(`/appointments/availability/${medicoId}`, {
            params: { startDate, endDate },
        });
        return response.data.data || [];
    },

    // ==================== BÚSQUEDA DE MÉDICOS ====================

    // Buscar médicos
    async searchDoctors(query?: string, especialidadId?: number) {
        const response = await api.get<{ ok: boolean; data: Medico[] }>('/appointments/doctors/search', {
            params: { query, especialidadId },
        });
        return response.data.data;
    },

    // Obtener detalles de un médico
    async getDoctorDetails(medicoId: number) {
        const response = await api.get<{ ok: boolean; data: Medico }>(`/appointments/doctors/${medicoId}`);
        return response.data.data;
    },

    // ==================== GESTIÓN DE CITAS ====================

    // Agendar cita
    async bookAppointment(data: {
        pacienteId?: number;
        medicoId: number;
        inicio: string;
        fin: string;
        motivo?: string;
    }) {
        const response = await api.post('/appointments', data);
        return response.data.data;
    },

    // Confirmar cita (solo médico)
    async confirmAppointment(id: number) {
        const response = await api.patch(`/appointments/${id}/confirm`);
        return response.data.data;
    },

    // Completar cita (solo médico)
    async completeAppointment(id: number) {
        const response = await api.patch(`/appointments/${id}/complete`);
        return response.data.data;
    },

    // Marcar no asistió (solo médico)
    async markNoShow(id: number) {
        const response = await api.patch(`/appointments/${id}/no-show`);
        return response.data.data;
    },

    // Reprogramar cita
    async rescheduleAppointment(id: number, data: { inicio: string; fin: string }) {
        const response = await api.patch(`/appointments/${id}/reschedule`, data);
        return response.data.data;
    },

    // Cancelar cita
    async cancelAppointment(id: number, motivoCancelacionCodigo: string) {
        const response = await api.patch(`/appointments/${id}/cancel`, { motivoCancelacionCodigo });
        return response.data.data;
    },

    // ==================== CONSULTAS DE CITAS ====================

    // Citas de hoy
    async getToday() {
        const response = await api.get<{ ok: boolean; data: Cita[] }>('/appointments/today');
        return response.data.data || [];
    },

    // Próximas citas
    async getUpcoming(limit = 10) {
        const response = await api.get<{ ok: boolean; data: Cita[] }>('/appointments/upcoming', {
            params: { limit },
        });
        return response.data.data || [];
    },

    // Historial de citas
    async getHistory(limit = 20) {
        const response = await api.get<{ ok: boolean; data: Cita[] }>('/appointments/history', {
            params: { limit },
        });
        return response.data.data || [];
    },

    // Mis citas (todas)
    async getMyAppointments() {
        const response = await api.get<{ ok: boolean; data: Cita[] }>('/appointments/mine');
        return response.data.data || [];
    },

    // Detalle de cita
    async getAppointmentDetails(id: number) {
        const response = await api.get<{ ok: boolean; data: CitaDetallada }>(`/appointments/${id}`);
        return response.data.data;
    },

    // Listado general (admin)
    async getAllAppointments() {
        const response = await api.get<{ ok: boolean; data: Cita[] }>('/appointments');
        return response.data.data;
    },
};

export default appointmentsService;
