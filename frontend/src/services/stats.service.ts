import api from './api';

export interface DashboardStats {
    totalUsers: number;
    activeDoctors: number;
    activePatients: number;
    pendingDoctors: number;
    pendingPatients: number;
    appointmentsToday: number;
}

export interface Especialidad {
    id: number;
    codigo: string;
    nombre: string;
}

export interface PendingDoctor {
    id: number;
    usuarioId: number;
    primerNombre: string;
    segundoNombre?: string | null;
    primerApellido: string;
    segundoApellido?: string | null;
    registroProfesional: string;
    email: string;
    fechaCreacion: string;
}

export interface PendingPatient {
    id: number;
    usuarioId: number;
    primerNombre: string;
    segundoNombre?: string | null;
    primerApellido: string;
    segundoApellido?: string | null;
    email: string;
    fechaCreacion: string;
}

export interface ActiveDoctor extends PendingDoctor {
    estado: boolean;
    especialidades: Especialidad[];
    tipoDocumentoId?: number;
    numeroDocumento?: string;
    telefono?: string;
    direccion?: string;
}

export interface ActivePatient extends PendingPatient {
    estado: boolean;
    tipoDocumentoId?: number;
    numeroDocumento?: string;
    telefono?: string;
    direccion?: string;
    fechaNacimiento?: string;
    sexoId?: number;
    grupoSanguineo?: string;
    altura?: number;
    peso?: number;
}

export const statsService = {
    /**
     * Obtener estadísticas del dashboard
     */
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get<{ success: boolean; data: DashboardStats }>('/stats/dashboard');
        return response.data.data;
    },

    /**
     * Obtener médicos pendientes de activación
     */
    async getPendingDoctors(): Promise<PendingDoctor[]> {
        const response = await api.get<{ success: boolean; data: PendingDoctor[] }>('/stats/pending-doctors');
        return response.data.data;
    },

    /**
     * Obtener pacientes pendientes de verificación
     */
    async getPendingPatients(): Promise<PendingPatient[]> {
        const response = await api.get<{ success: boolean; data: PendingPatient[] }>('/stats/pending-patients');
        return response.data.data;
    },

    /**
     * Obtener médicos activos
     */
    async getActiveDoctors(): Promise<ActiveDoctor[]> {
        const response = await api.get<{ success: boolean; data: ActiveDoctor[] }>('/stats/active-doctors');
        return response.data.data;
    },

    /**
     * Obtener pacientes activos
     */
    async getActivePatients(): Promise<ActivePatient[]> {
        const response = await api.get<{ success: boolean; data: ActivePatient[] }>('/stats/active-patients');
        return response.data.data;
    },
};
