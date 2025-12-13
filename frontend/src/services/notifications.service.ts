import api from './api';

// ==================== INTERFACES ====================

export interface Notificacion {
    id: number;
    usuarioId: number;
    citaId?: number;
    tipo: string;
    payload: {
        mensaje: string;
        leida: boolean;
        [key: string]: any;
    };
    estado: boolean;
    fechaCreacion: string;
}

export interface PreferenciaNotificacion {
    id: number;
    usuarioId: number;
    canalId: number;
    habilitado: boolean;
    canales_notificaciones: {
        id: number;
        codigo: string;
        nombre: string;
    };
}

// ==================== SERVICIO ====================

export const notificationsService = {
    // ==================== CONSULTAS ====================

    // Obtener mis notificaciones
    async getMyNotifications(limit = 50) {
        const response = await api.get<{ ok: boolean; data: Notificacion[] }>('/notifications/mine', {
            params: { limit },
        });
        return response.data.data || [];
    },

    // Obtener notificaciones no leídas
    async getUnread() {
        const response = await api.get<{ ok: boolean; data: Notificacion[] }>('/notifications/unread');
        return response.data.data;
    },

    // Contador de no leídas
    async getUnreadCount() {
        const response = await api.get<{ ok: boolean; data: { count: number } }>('/notifications/unread-count');
        return response.data.data.count;
    },

    // Notificaciones por cita
    async getByAppointment(citaId: number) {
        const response = await api.get<{ ok: boolean; data: Notificacion[] }>(`/notifications/appointment/${citaId}`);
        return response.data.data;
    },

    // ==================== ACCIONES ====================

    // Marcar como leída
    async markAsRead(id: number) {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    // Marcar todas como leídas
    async markAllAsRead() {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },

    // ==================== PREFERENCIAS ====================

    // Obtener preferencias
    async getPreferences() {
        const response = await api.get<{ ok: boolean; data: PreferenciaNotificacion[] }>('/notifications/preferences');
        return response.data.data;
    },

    // Establecer preferencia
    async setPreference(canalId: number, habilitado: boolean) {
        const response = await api.post('/notifications/preferences', { canalId, habilitado });
        return response.data;
    },
};

export default notificationsService;
