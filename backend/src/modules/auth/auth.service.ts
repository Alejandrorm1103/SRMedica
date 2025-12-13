/**
 * Servicio de autenticación y gestión de sesiones
 * 
 * Características:
 * - Password hashing con bcrypt
 * - Tokens JWT para access
 * - Refresh tokens opacos con rotación automática
 * - Verificación de email y activación de usuarios
 * - Recuperación y cambio de contraseña
 */

import type { FastifyInstance } from 'fastify';
import { AuthRepository } from './auth.repository';
import {
  TLoginDTO, TRegisterDTO, TRecoverDTO, TResetDTO,
  TVerifyEmailDTO, TActivateUserDTO, TChangePasswordDTO
} from './auth.schema';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { signAccessToken } from '@/utils/jwt.util';
import { emailService } from '@/shared/services/email.service';
import { AppError } from '@/core/app-error';

const ACCESS_TTL_MIN = 15;
const REFRESH_TTL_DAYS = 15;
const VERIFY_TTL_HOURS = 24;
const RESET_TTL_HOURS = 1;

function addDays(d: Date, days: number) { const x = new Date(d); x.setDate(x.getDate() + days); return x; }
function addHours(d: Date, h: number) { const x = new Date(d); x.setHours(x.getHours() + h); return x; }

export class AuthService {
  constructor(private app: FastifyInstance, private repo: AuthRepository) { }

  /* ======================
   * Helpers
   * ====================== */

  private async genTokenPair() {
    const tokenKey = randomBytes(12).toString('base64url');
    const secret = randomBytes(32).toString('base64url');
    const tokenHash = await bcrypt.hash(secret, 10);
    return { tokenKey, secret, tokenHash };
  }

  private async genRefreshPair() {
    const sessionKey = randomBytes(16).toString('base64url');
    const refreshSecret = randomBytes(48).toString('base64url');
    const refreshHash = await bcrypt.hash(refreshSecret, 10);
    const expira = addDays(new Date(), REFRESH_TTL_DAYS);
    return { sessionKey, refreshSecret, refreshHash, expira };
  }

  private mapNamesFromDTO(dto: TRegisterDTO) {
    return {
      primer_nombre: dto.primerNombre,
      segundo_nombre: (dto as any).segundoNombre ?? null,
      primer_apellido: dto.primerApellido,
      segundo_apellido: (dto as any).segundoApellido ?? null,
    };
  }

  /* ======================
   * Public API
   * ====================== */

  async me(userId: number) {
    return this.repo.getById(userId);
  }

  async register(dto: TRegisterDTO & { telefono: string; rol: 'paciente' | 'medico' | 'administrador'; especialidadCodigo?: string }) {
    const email = dto.email.toLowerCase();
    const exists = await this.repo.findByEmail(email);
    if (exists) { throw new AppError('EMAIL_IN_USE', 409); }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usuarioId = await this.repo.createUsuarioFull({
      email,
      password_hash: passwordHash,
      telefono: dto.telefono ?? null,
      username: email,
      email_confirmado: dto.rol === 'administrador',
      estado: dto.rol === 'administrador',
    });

    await this.repo.addRol(usuarioId, dto.rol);

    const nombres = this.mapNamesFromDTO(dto);

    // Preparar objeto de datos extendido para el perfil
    const profileData = {
      ...nombres,
      tipo_documento_id: dto.tipoDocumentoId,
      numero_documento: dto.numeroDocumento,
      fecha_nacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : undefined,
      sexo_id: dto.sexoId,
      direccion: dto.direccion,
    };

    if (dto.rol === 'paciente') {
      await this.repo.createPaciente(usuarioId, profileData);

      const { tokenKey, secret, tokenHash } = await this.genTokenPair();
      await this.repo.createAuthToken(usuarioId, 'verify_email', tokenKey, tokenHash, addHours(new Date(), VERIFY_TTL_HOURS));

      const verifyToken = `${tokenKey}.${secret}`;
      const emailPreviewUrl = await emailService.sendVerificationEmail(email, verifyToken);

      return {
        userId: usuarioId,
        message: 'Verification email sent',
        emailPreviewUrl // Solo en desarrollo
      };
    }

    if (dto.rol === 'medico') {
      await this.repo.createMedico(usuarioId, {
        ...profileData,
        registro_profesional: (dto as any).registroProfesional,
        especialidad_codigo: dto.especialidadCodigo,
      });

      // Enviar email informativo al médico
      const doctorName = `${nombres.primer_nombre} ${nombres.primer_apellido}`;
      const emailPreviewUrl = await emailService.sendDoctorRegistrationEmail(email, doctorName);

      return {
        userId: usuarioId,
        pending: 'activation',
        emailPreviewUrl // Solo en desarrollo
      };
    }

    await this.repo.createAdmin(usuarioId, profileData);

    const user = await this.repo.getById(usuarioId);
    const roles = await this.repo.getRolesByUserId(usuarioId);
    const payload = { id: user!.id, email: user!.email, roles };
    const access = await signAccessToken(this.app, payload);

    const { sessionKey, refreshSecret, refreshHash, expira } = await this.genRefreshPair();
    await this.repo.createSesionWithKey(usuarioId, sessionKey, refreshHash, expira);
    const refresh = `${sessionKey}.${refreshSecret}`;

    return { user, access, refresh };
  }

  async login(dto: TLoginDTO) {
    const email = dto.email.toLowerCase();

    const cred = await this.repo.getPasswordHashByEmail(email);
    if (!cred) { throw new AppError('Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS'); }
    const ok = await bcrypt.compare(dto.password, cred.password_hash);
    if (!ok) { throw new AppError('Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS'); }

    const user = await this.repo.findUserByEmailAll?.(email) ?? await this.repo.getById(cred.id);
    if (!user) { throw new AppError('Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS'); }

    const roles = await this.repo.getRolesByUserId(user.id);
    const isPaciente = roles.includes('paciente');
    if (!user.estado || (isPaciente && user.email_confirmado === false)) {
      throw new AppError('Tu cuenta no está activa. Contacta al administrador.', 403, 'ACCOUNT_NOT_ACTIVE');
    }

    const payload = { id: user.id, email: user.email, roles };
    const access = await signAccessToken(this.app, payload);
    const { sessionKey, refreshSecret, refreshHash, expira } = await this.genRefreshPair();
    await this.repo.createSesionWithKey(user.id, sessionKey, refreshHash, expira);
    const refresh = `${sessionKey}.${refreshSecret}`;

    return { user: { id: user.id, email: user.email, roles }, access, refresh };
  }

  async refresh(token: string) {
    const [sessionKey, refreshSecret] = (token ?? '').split('.');
    if (!sessionKey || !refreshSecret) { throw new AppError('INVALID_REFRESH', 401); }

    const ses = await this.repo.getSesionByKey(sessionKey);
    if (!ses || ses.revocada || new Date(ses.expira_en) < new Date()) { throw new AppError('INVALID_REFRESH', 401); }

    const ok = await bcrypt.compare(refreshSecret, ses.refresh_hash);
    if (!ok) { throw new AppError('INVALID_REFRESH', 401); }

    const user = await this.repo.findUserByIdAll?.(ses.usuario_id) ?? await this.repo.getById(ses.usuario_id);
    if (!user || !user.estado) { throw new AppError('INVALID_REFRESH', 401); }

    const roles = await this.repo.getRolesByUserId(user.id);
    const payload = { id: user.id, email: user.email, roles };

    await this.repo.revokeSesion(ses.id);

    const access = await signAccessToken(this.app, payload);
    const { sessionKey: newKey, refreshSecret: newSecret, refreshHash, expira } = await this.genRefreshPair();
    await this.repo.createSesionWithKey(user.id, newKey, refreshHash, expira);
    const refresh = `${newKey}.${newSecret}`;

    return { user: { id: user.id, email: user.email, roles }, access, refresh };
  }

  async logout(refreshToken: string) {
    const [sessionKey, refreshSecret] = (refreshToken ?? '').split('.');
    if (!sessionKey || !refreshSecret) { return { ok: true }; }
    const ses = await this.repo.getSesionByKey(sessionKey);
    if (!ses) { return { ok: true }; }
    const ok = await bcrypt.compare(refreshSecret, ses.refresh_hash);
    if (!ok) { return { ok: true }; }
    await this.repo.revokeSesion(ses.id);
    return { ok: true };
  }

  async recoverInit(dto: TRecoverDTO) {
    const user = await this.repo.findByEmail(dto.email.toLowerCase());
    if (!user) { return { ok: true }; }
    const { tokenKey, secret, tokenHash } = await this.genTokenPair();
    await this.repo.createAuthToken(user.id, 'reset_password', tokenKey, tokenHash, addHours(new Date(), RESET_TTL_HOURS));

    const resetToken = `${tokenKey}.${secret}`;
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { ok: true };
  }

  async recoverFinish(dto: TResetDTO) {
    const [tokenKey, secret] = dto.token.split('.');
    if (!tokenKey || !secret) { throw new AppError('INVALID_TOKEN', 401); }

    const row = await this.repo.consumeAuthToken('reset_password', tokenKey);
    if (!row) { throw new AppError('INVALID_TOKEN', 401); }
    const ok = await bcrypt.compare(secret, row.token_hash);
    if (!ok) { throw new AppError('INVALID_TOKEN', 401); }

    await this.repo.markTokenUsed(row.id);

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.repo.setPasswordAndRotateStamp(row.usuario_id, newHash);
    await this.repo.revokeAllSesionesByUser(row.usuario_id);

    return { ok: true };
  }

  async verifyEmail(dto: TVerifyEmailDTO) {
    const [tokenKey, secret] = dto.token.split('.');
    if (!tokenKey || !secret) { throw new AppError('INVALID_TOKEN', 401); }
    const row = await this.repo.consumeAuthToken('verify_email', tokenKey);
    if (!row) { throw new AppError('INVALID_OR_EXPIRED', 401); }
    const ok = await bcrypt.compare(secret, row.token_hash);
    if (!ok) { throw new AppError('INVALID_OR_EXPIRED', 401); }
    await this.repo.markTokenUsed(row.id);
    await this.repo.setEmailVerified(row.usuario_id);
    return { ok: true };
  }

  async activateUser(dto: TActivateUserDTO) {
    await this.repo.activateUser(dto.usuarioId);
    return { ok: true };
  }

  async deactivateUser(dto: TActivateUserDTO) {
    await this.repo.setEstado(dto.usuarioId, false);
    await this.repo.revokeAllSesionesByUser(dto.usuarioId);
    return { ok: true };
  }

  async changePassword(userId: number, dto: TChangePasswordDTO) {
    const user = await this.repo.findUserByIdAll?.(userId) ?? await this.repo.getById(userId);
    if (!user) { throw new AppError('NOT_FOUND', 404); }
    const ok = await bcrypt.compare(dto.oldPassword, user.password_hash);
    if (!ok) { throw new AppError('BAD_OLD_PASSWORD', 401); }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.repo.setPasswordAndRotateStamp(userId, newHash);
    await this.repo.revokeAllSesionesByUser(userId);

    return { ok: true };
  }

  async addRol(usuarioId: number, rolCodigo: string) {
    await this.repo.addRol(usuarioId, rolCodigo);
    return { ok: true };
  }

  async setEstado(usuarioId: number, estado: boolean) {
    await this.repo.setEstado(usuarioId, estado);
    return { ok: true };
  }
}
