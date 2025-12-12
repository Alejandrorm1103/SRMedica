/**
 * Repositorio de autenticación e identidad
 * Maneja operaciones de base de datos para usuarios, sesiones, roles y tokens
 */

import type { FastifyInstance } from 'fastify';
import type { Usuario, Sesion } from './auth.model';

export class AuthRepository {
  constructor(private app: FastifyInstance) { }

  /* ======================
   * Usuarios & roles
   * ====================== */

  async findByEmail(email: string): Promise<Usuario | null> {
    const user = await this.app.prisma.usuario.findUnique({
      where: { email },
    });
    if (!user) { return null; }
    return {
      id: Number(user.id),
      email: user.email,
      username: user.username,
      telefono: user.telefono,
      estado: user.estado,
      email_confirmado: user.emailConfirmado,
      fecha_creacion: user.fechaCreacion,
      fecha_actualizacion: user.fechaActualizacion,
    } as Usuario;
  }

  async findUserByEmailAll(email: string): Promise<any | null> {
    const user = await this.app.prisma.usuario.findUnique({
      where: { email },
    });
    if (!user) { return null; }
    return {
      ...user,
      id: Number(user.id),
      email_confirmado: user.emailConfirmado,
      password_hash: user.passwordHash,
      fecha_creacion: user.fechaCreacion,
      fecha_actualizacion: user.fechaActualizacion,
    };
  }

  async getPasswordHashByEmail(email: string): Promise<{ id: number; password_hash: string } | null> {
    const user = await this.app.prisma.usuario.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
    if (!user) { return null; }
    return { id: Number(user.id), password_hash: user.passwordHash };
  }

  async getById(id: number): Promise<Usuario | null> {
    const user = await this.app.prisma.usuario.findUnique({
      where: { id },
    });
    if (!user) { return null; }
    return {
      id: Number(user.id),
      email: user.email,
      username: user.username,
      telefono: user.telefono,
      estado: user.estado,
      email_confirmado: user.emailConfirmado,
      fecha_creacion: user.fechaCreacion,
      fecha_actualizacion: user.fechaActualizacion,
    } as Usuario;
  }

  async findUserByIdAll(id: number): Promise<any | null> {
    const user = await this.app.prisma.usuario.findUnique({
      where: { id },
    });
    if (!user) { return null; }
    return {
      ...user,
      id: Number(user.id),
      email_confirmado: user.emailConfirmado,
      password_hash: user.passwordHash,
      fecha_creacion: user.fechaCreacion,
      fecha_actualizacion: user.fechaActualizacion,
    };
  }

  async createUsuario(email: string, passwordHash: string): Promise<Usuario> {
    const user = await this.app.prisma.usuario.create({
      data: {
        email,
        passwordHash,
        username: email,
        emailConfirmado: false,
        estado: false,
      },
    });
    return {
      id: Number(user.id),
      email: user.email,
      username: user.username,
      telefono: user.telefono,
      estado: user.estado,
      email_confirmado: user.emailConfirmado,
      fecha_creacion: user.fechaCreacion,
      fecha_actualizacion: user.fechaActualizacion,
    } as Usuario;
  }

  async createUsuarioFull(u: {
    email: string; password_hash: string; telefono?: string | null;
    username?: string | null; email_confirmado?: boolean; estado?: boolean;
  }): Promise<number> {
    const user = await this.app.prisma.usuario.create({
      data: {
        email: u.email,
        passwordHash: u.password_hash,
        telefono: u.telefono,
        username: u.username ?? u.email,
        emailConfirmado: u.email_confirmado ?? false,
        estado: u.estado ?? false,
      },
    });
    return Number(user.id);
  }

  async setPassword(usuarioId: number, passwordHash: string) {
    await this.app.prisma.usuario.update({
      where: { id: usuarioId },
      data: { passwordHash },
    });
    return true;
  }

  async setPasswordAndRotateStamp(usuarioId: number, passwordHash: string) {
    await this.app.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        passwordHash,
        // Prisma doesn't have gen_random_uuid() directly in update, but we can generate it in JS or use raw query if strictly needed.
        // For simplicity, let's generate a UUID here or just a random string.
        securityStamp: crypto.randomUUID(),
      },
    });
    return true;
  }

  async addRol(usuarioId: number, rolCodigo: string) {
    const rol = await this.app.prisma.rol.findUnique({ where: { codigo: rolCodigo } });
    if (!rol) { throw new Error('ROL_NOT_FOUND'); }

    await this.app.prisma.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId, rolId: rol.id } },
      create: { usuarioId, rolId: rol.id },
      update: {},
    });
    return true;
  }

  async setEstado(usuarioId: number, estado: boolean) {
    await this.app.prisma.usuario.update({
      where: { id: usuarioId },
      data: { estado },
    });
    return true;
  }

  async setEmailVerified(usuarioId: number) {
    await this.app.prisma.usuario.update({
      where: { id: usuarioId },
      data: { emailConfirmado: true, estado: true },
    });
    return true;
  }

  async activateUser(usuarioId: number) {
    await this.app.prisma.usuario.update({
      where: { id: usuarioId },
      data: { estado: true, emailConfirmado: true },
    });
    return true;
  }

  async getRolesByUserId(userId: number): Promise<string[]> {
    const roles = await this.app.prisma.usuarioRol.findMany({
      where: { usuarioId: userId },
      include: { rol: true },
    });
    return roles.map(r => r.rol.codigo);
  }

  /* ======================
   * Perfiles
   * ====================== */

  async createPaciente(usuarioId: number, p: {
    primer_nombre: string; segundo_nombre?: string | null;
    primer_apellido: string; segundo_apellido?: string | null;
    tipo_documento_id?: number; numero_documento?: string;
    fecha_nacimiento?: Date; sexo_id?: number; direccion?: string;
  }) {
    await this.app.prisma.paciente.create({
      data: {
        usuarioId,
        primerNombre: p.primer_nombre,
        segundoNombre: p.segundo_nombre,
        primerApellido: p.primer_apellido,
        segundoApellido: p.segundo_apellido,
        tipo_documento_id: p.tipo_documento_id ? BigInt(p.tipo_documento_id) : null,
        numeroDocumento: p.numero_documento,
        fechaNacimiento: p.fecha_nacimiento,
        sexo_id: p.sexo_id ? BigInt(p.sexo_id) : null,
        direccionLinea1: p.direccion,
      },
    });
  }

  async createMedico(usuarioId: number, p: {
    primer_nombre: string; segundo_nombre?: string | null;
    primer_apellido: string; segundo_apellido?: string | null;
    registro_profesional: string; especialidad_codigo?: string;
    tipo_documento_id?: number; numero_documento?: string;
    fecha_nacimiento?: Date; sexo_id?: number; direccion?: string;
  }) {
    const medico = await this.app.prisma.medico.create({
      data: {
        usuarioId,
        primerNombre: p.primer_nombre,
        segundoNombre: p.segundo_nombre,
        primerApellido: p.primer_apellido,
        segundoApellido: p.segundo_apellido,
        registroProfesional: p.registro_profesional,
        tipo_documento_id: p.tipo_documento_id ? BigInt(p.tipo_documento_id) : null,
        numeroDocumento: p.numero_documento,
        fechaNacimiento: p.fecha_nacimiento,
        sexo_id: p.sexo_id ? BigInt(p.sexo_id) : null,
        direccionLinea1: p.direccion,
      },
    });

    if (p.especialidad_codigo) {
      const esp = await this.app.prisma.especialidad.findUnique({ where: { codigo: p.especialidad_codigo } });
      if (!esp) { throw new Error('ESPECIALIDAD_NOT_FOUND'); }

      await this.app.prisma.medicoEspecialidad.upsert({
        where: { medicoId_especialidadId: { medicoId: medico.id, especialidadId: esp.id } },
        create: { medicoId: medico.id, especialidadId: esp.id },
        update: {},
      });
    }
  }

  async createAdmin(usuarioId: number, p: {
    primer_nombre: string; segundo_nombre?: string | null;
    primer_apellido: string; segundo_apellido?: string | null;
    tipo_documento_id?: number; numero_documento?: string;
    fecha_nacimiento?: Date; sexo_id?: number; direccion?: string;
  }) {
    await this.app.prisma.administrador.create({
      data: {
        usuarioId,
        primerNombre: p.primer_nombre,
        segundoNombre: p.segundo_nombre,
        primerApellido: p.primer_apellido,
        segundoApellido: p.segundo_apellido,
        // Admin model uses camelCase properties mapped to snake_case columns
        tipoDocumentoId: p.tipo_documento_id ? BigInt(p.tipo_documento_id) : null,
        numeroDocumento: p.numero_documento,
        fechaNacimiento: p.fecha_nacimiento,
        sexoId: p.sexo_id ? BigInt(p.sexo_id) : null,
        direccionLinea1: p.direccion,
      },
    });
  }

  /* ======================
   * Sesiones
   * ====================== */

  async createSesion(usuarioId: number, refreshHash: string, expiraEn: Date, ip?: string, ua?: string): Promise<Sesion> {
    const sesion = await this.app.prisma.sesion.create({
      data: {
        usuarioId,
        refreshHash,
        ip,
        userAgent: ua,
        expiraEn,
      },
    });
    return {
      id: Number(sesion.id),
      usuario_id: Number(sesion.usuarioId),
      refresh_hash: sesion.refreshHash,
      expira_en: sesion.expiraEn,
      revocada: sesion.revocada,
    } as Sesion;
  }

  async createSesionWithKey(usuarioId: number, sessionKey: string, refreshHash: string, expiraEn: Date, ip?: string, ua?: string) {
    const sesion = await this.app.prisma.sesion.create({
      data: {
        usuarioId,
        sessionKey,
        refreshHash,
        ip,
        userAgent: ua,
        expiraEn,
      },
    });
    return {
      id: Number(sesion.id),
      usuario_id: Number(sesion.usuarioId),
      session_key: sesion.sessionKey!,
      expira_en: sesion.expiraEn,
      revocada: sesion.revocada,
    };
  }

  async findSesionByHash(hash: string): Promise<Sesion | null> {
    const sesion = await this.app.prisma.sesion.findFirst({
      where: { refreshHash: hash },
    });
    if (!sesion) { return null; }
    return {
      id: Number(sesion.id),
      usuario_id: Number(sesion.usuarioId),
      refresh_hash: sesion.refreshHash,
      expira_en: sesion.expiraEn,
      revocada: sesion.revocada,
    } as Sesion;
  }

  async getSesionByKey(sessionKey: string) {
    const sesion = await this.app.prisma.sesion.findFirst({
      where: {
        sessionKey,
        revocada: false,
        expiraEn: { gt: new Date() }
      },
    });
    if (!sesion) { return null; }
    return {
      id: Number(sesion.id),
      usuario_id: Number(sesion.usuarioId),
      session_key: sesion.sessionKey!,
      refresh_hash: sesion.refreshHash,
      expira_en: sesion.expiraEn,
      revocada: sesion.revocada,
    };
  }

  async revokeSesion(id: number) {
    await this.app.prisma.sesion.update({
      where: { id },
      data: { revocada: true },
    });
  }

  async revokeAllSesionesByUser(usuarioId: number) {
    await this.app.prisma.sesion.updateMany({
      where: { usuarioId, revocada: false },
      data: { revocada: true },
    });
  }

  /* ======================
   * Tokens efímeros
   * ====================== */

  async createAuthToken(
    usuarioId: number,
    tipo: 'verify_email' | 'reset_password',
    tokenKey: string,
    tokenHash: string,
    expiraEn: Date
  ) {
    await this.app.prisma.authToken.create({
      data: {
        usuarioId,
        tipo,
        tokenKey,
        tokenHash,
        expiraEn,
      },
    });
  }

  async consumeAuthToken(tipo: 'verify_email' | 'reset_password', tokenKey: string) {
    const token = await this.app.prisma.authToken.findFirst({
      where: {
        tipo,
        tokenKey,
        usado: false,
        expiraEn: { gt: new Date() },
      },
    });
    if (!token) { return null; }
    return {
      id: Number(token.id),
      usuario_id: Number(token.usuarioId),
      tipo: token.tipo as any,
      token_key: token.tokenKey,
      token_hash: token.tokenHash,
      expira_en: token.expiraEn,
      usado: token.usado,
    };
  }

  async markTokenUsed(id: number) {
    await this.app.prisma.authToken.update({
      where: { id },
      data: { usado: true },
    });
  }
}
