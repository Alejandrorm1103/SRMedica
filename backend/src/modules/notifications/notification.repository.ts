import type { FastifyInstance } from 'fastify';
import type { Notificacion } from './notification.model';

export class NotificationRepository {
  constructor(private app: FastifyInstance) { }

  // ==================== CONSULTAS ====================

  async listByUsuario(usuarioId: number, limit = 50) {
    return this.app.prisma.notificacion.findMany({
      where: { usuarioId, estado: true },
      orderBy: { fechaCreacion: 'desc' },
      take: limit,
    });
  }

  async getUnread(usuarioId: number) {
    return this.app.prisma.notificacion.findMany({
      where: {
        usuarioId,
        estado: true,
        payload: {
          path: ['leida'],
          equals: false,
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async getUnreadCount(usuarioId: number) {
    return this.app.prisma.notificacion.count({
      where: {
        usuarioId,
        estado: true,
        payload: {
          path: ['leida'],
          equals: false,
        },
      },
    });
  }

  async getById(id: number) {
    return this.app.prisma.notificacion.findUnique({
      where: { id },
    });
  }

  async listByAppointment(citaId: number) {
    return this.app.prisma.notificacion.findMany({
      where: { citaId, estado: true },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  // ==================== ACCIONES ====================

  async markAsRead(notificationId: number) {
    const notification = await this.app.prisma.notificacion.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('NOT_FOUND: Notificación no encontrada');
    }

    const payload = notification.payload as any || {};
    payload.leida = true;

    await this.app.prisma.notificacion.update({
      where: { id: notificationId },
      data: { payload },
    });
  }

  async markAllAsRead(usuarioId: number) {
    const notifications = await this.app.prisma.notificacion.findMany({
      where: {
        usuarioId,
        estado: true,
      },
    });

    for (const notification of notifications) {
      const payload = notification.payload as any || {};
      if (!payload.leida) {
        payload.leida = true;
        await this.app.prisma.notificacion.update({
          where: { id: notification.id },
          data: { payload },
        });
      }
    }
  }

  // ==================== CREACIÓN ====================

  async createNotification(usuarioId: number, tipo: string, payload: any, citaId?: number) {
    // Agregar flag de leída al payload
    const fullPayload = {
      ...payload,
      leida: false,
    };

    return this.app.prisma.notificacion.create({
      data: {
        usuarioId,
        tipo,
        payload: fullPayload,
        citaId: citaId || null,
      },
    });
  }

  // ==================== PREFERENCIAS ====================

  async setPreference(usuarioId: number, canalId: number, habilitado: boolean) {
    await this.app.prisma.preferenciaNotificacion.upsert({
      where: { usuarioId_canalId: { usuarioId, canalId } },
      create: { usuarioId, canalId, habilitado },
      update: { habilitado },
    });
  }

  async getPreferences(usuarioId: number) {
    return this.app.prisma.preferenciaNotificacion.findMany({
      where: { usuarioId, estado: true },
      include: {
        canales_notificaciones: true,
      },
    });
  }

  // ==================== ENVÍOS ====================

  async retryEnvio(envioId: number) {
    await this.app.prisma.envioNotificacion.update({
      where: { id: envioId },
      data: {
        estadoEnvio: 'pendiente',
        intentos: { increment: 1 },
      },
    });
  }
}
