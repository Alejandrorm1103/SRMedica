/**
 * Servicio completo de notificaciones
 * Maneja creación automática de notificaciones, lectura, y preferencias
 */

import type { FastifyInstance } from 'fastify';
import { NotificationRepository } from './notification.repository';
import type { SetPreferenceDTO } from './notification.schema';
import type { z } from 'zod';

export class NotificationService {
  constructor(private app: FastifyInstance, private repo: NotificationRepository) { }

  // ==================== CONSULTAS ====================

  /** Lista notificaciones del usuario actual */
  async listMine(usuarioId: number, limit = 50) {
    return this.repo.listByUsuario(usuarioId, limit);
  }

  /** Obtener notificaciones no leídas */
  async getUnread(usuarioId: number) {
    return this.repo.getUnread(usuarioId);
  }

  /** Contar notificaciones no leídas */
  async getUnreadCount(usuarioId: number) {
    return this.repo.getUnreadCount(usuarioId);
  }

  /** Lista notificaciones por cita */
  async listByAppointment(citaId: number) {
    return this.repo.listByAppointment(citaId);
  }

  // ==================== ACCIONES ====================

  /** Marcar notificación como leída */
  async markAsRead(notificationId: number, usuarioId: number) {
    const notification = await this.repo.getById(notificationId);
    if (!notification || Number(notification.usuarioId) !== usuarioId) {
      throw new Error('UNAUTHORIZED: No puedes marcar esta notificación');
    }

    await this.repo.markAsRead(notificationId);
    return { ok: true, message: 'Notificación marcada como leída' };
  }

  /** Marcar todas las notificaciones como leídas */
  async markAllAsRead(usuarioId: number) {
    await this.repo.markAllAsRead(usuarioId);
    return { ok: true, message: 'Todas las notificaciones marcadas como leídas' };
  }

  // ==================== CREACIÓN DE NOTIFICACIONES ====================

  /** Crear notificación de cuenta activada */
  async createAccountActivatedNotification(usuarioId: number, rol: 'medico' | 'paciente') {
    const tipo = 'cuenta_activada';
    const payload = {
      mensaje: `Tu cuenta de ${rol} ha sido activada exitosamente. Ya puedes usar todas las funcionalidades del sistema.`,
      rol,
    };

    return this.repo.createNotification(usuarioId, tipo, payload);
  }

  /** Crear notificación de nuevo registro (para admin) */
  async createNewRegistrationNotification(adminUsuarioId: number, tipo: 'medico' | 'paciente', nombre: string, email: string) {
    const tipoNotif = tipo === 'medico' ? 'medico_registrado' : 'paciente_registrado';
    const payload = {
      mensaje: `Nuevo ${tipo} registrado: ${nombre} (${email}). Pendiente de activación.`,
      nombre,
      email,
      tipo,
    };

    return this.repo.createNotification(adminUsuarioId, tipoNotif, payload);
  }

  /** Crear notificación de cita creada */
  async createAppointmentCreatedNotification(citaId: number, medicoUsuarioId: number, pacienteUsuarioId: number, fecha: Date, medicoNombre: string, pacienteNombre: string) {
    // Notificación para el médico
    await this.repo.createNotification(medicoUsuarioId, 'cita_nueva', {
      mensaje: `Nueva cita agendada con ${pacienteNombre}`,
      citaId,
      fecha: fecha.toISOString(),
      pacienteNombre,
    }, citaId);

    // Notificación para el paciente
    await this.repo.createNotification(pacienteUsuarioId, 'cita_creada', {
      mensaje: `Cita agendada con Dr(a). ${medicoNombre}`,
      citaId,
      fecha: fecha.toISOString(),
      medicoNombre,
    }, citaId);
  }

  /** Crear notificación de cita confirmada */
  async createAppointmentConfirmedNotification(citaId: number, pacienteUsuarioId: number, fecha: Date, medicoNombre: string) {
    await this.repo.createNotification(pacienteUsuarioId, 'cita_confirmada', {
      mensaje: `Dr(a). ${medicoNombre} confirmó tu cita`,
      citaId,
      fecha: fecha.toISOString(),
      medicoNombre,
    }, citaId);
  }

  /** Crear notificación de cita cancelada */
  async createAppointmentCancelledNotification(citaId: number, destinatarioUsuarioId: number, fecha: Date, canceladoPor: 'medico' | 'paciente', nombre: string) {
    const tipo = canceladoPor === 'medico' ? 'cita_cancelada_medico' : 'cita_cancelada_paciente';
    const mensaje = canceladoPor === 'medico'
      ? `Dr(a). ${nombre} canceló la cita`
      : `${nombre} canceló la cita`;

    await this.repo.createNotification(destinatarioUsuarioId, tipo, {
      mensaje,
      citaId,
      fecha: fecha.toISOString(),
      nombre,
    }, citaId);
  }

  /** Crear notificación de cita reprogramada */
  async createAppointmentRescheduledNotification(citaId: number, destinatarioUsuarioId: number, nuevaFecha: Date, reprogramadoPor: 'medico' | 'paciente', nombre: string) {
    const tipo = reprogramadoPor === 'medico' ? 'cita_reprogramada_medico' : 'cita_reprogramada_paciente';
    const mensaje = reprogramadoPor === 'medico'
      ? `Dr(a). ${nombre} reprogramó la cita`
      : `${nombre} reprogramó la cita`;

    await this.repo.createNotification(destinatarioUsuarioId, tipo, {
      mensaje,
      citaId,
      nuevaFecha: nuevaFecha.toISOString(),
      nombre,
    }, citaId);
  }

  /** Crear notificación de recordatorio de cita */
  async createAppointmentReminderNotification(citaId: number, usuarioId: number, fecha: Date, nombreOtraParte: string, rol: 'medico' | 'paciente') {
    const mensaje = rol === 'paciente'
      ? `Recordatorio: Tienes una cita mañana con Dr(a). ${nombreOtraParte}`
      : `Recordatorio: Tienes una cita mañana con ${nombreOtraParte}`;

    await this.repo.createNotification(usuarioId, 'recordatorio_cita', {
      mensaje,
      citaId,
      fecha: fecha.toISOString(),
      nombreOtraParte,
    }, citaId);
  }

  // ==================== PREFERENCIAS ====================

  /** Establece preferencia de canal de notificación */
  async setPreference(usuarioId: number, dto: z.infer<typeof SetPreferenceDTO>) {
    await this.repo.setPreference(usuarioId, dto.canalId, dto.habilitado);
    return { ok: true, message: 'Preferencia actualizada' };
  }

  /** Obtener preferencias del usuario */
  async getPreferences(usuarioId: number) {
    return this.repo.getPreferences(usuarioId);
  }

  // ==================== ENVÍOS ====================

  /** Reintenta el envío de una notificación */
  async retryEnvio(envioId: number) {
    await this.repo.retryEnvio(envioId);
    return { ok: true, message: 'Reintento programado' };
  }
}
