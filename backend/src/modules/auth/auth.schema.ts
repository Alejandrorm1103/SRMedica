import { z } from 'zod';

/** Roles permitidos */
export const RoleEnum = z.enum(['paciente', 'medico', 'administrador']);

/** Login DTO (igual que antes) */
export const LoginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/** Register DTO (extendido con tus campos y reglas) */
export const RegisterDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  telefono: z.string().min(7).max(30),

  // Nombres y apellidos en camelCase como los venías usando
  primerNombre: z.string().min(2),
  segundoNombre: z.string().optional(),
  primerApellido: z.string().min(2),
  segundoApellido: z.string().optional(),

  // Datos adicionales de perfil
  tipoDocumentoId: z.number().int().optional(),
  numeroDocumento: z.string().optional(),
  fechaNacimiento: z.string().optional(), // Formato YYYY-MM-DD
  sexoId: z.number().int().optional(),
  direccion: z.string().optional(),

  // Para saber flujo y dónde crear el registro (paciente/medico/admin)
  rol: RoleEnum,

  // Solo para médicos (código de cat.especialidades)
  especialidadCodigo: z.string().optional(),
  registroProfesional: z.string().optional(),
}).superRefine((v, ctx) => {
  if (v.rol === 'medico') {
    if (!v.registroProfesional) { ctx.addIssue({ code: 'custom', path: ['registroProfesional'], message: 'registroProfesional requerido cuando rol=medico' }); }
    if (!v.especialidadCodigo) { ctx.addIssue({ code: 'custom', path: ['especialidadCodigo'], message: 'especialidadCodigo requerido cuando rol=medico' }); }
  }
});

/** Refresh DTO (igual que antes; si no viene, se toma de cookie) */
export const RefreshDTO = z.object({
  refreshToken: z.string().optional(),
});

/** Recover Init DTO (igual que antes) */
export const RecoverDTO = z.object({
  email: z.string().email(),
});

/** Reset DTO (igual que antes: token + nueva contraseña) */
export const ResetDTO = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

/** Verify Email DTO (para pacientes: token compuesto 'key.secret') */
export const VerifyEmailDTO = z.object({
  token: z.string().min(20),
});

/** Activate User DTO (admin habilita médicos u otros) */
export const ActivateUserDTO = z.object({
  usuarioId: z.number().int().positive(),
});

/** Change Password DTO (usuario logueado; nueva 2 veces) */
export const ChangePasswordDTO = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(v => v.newPassword === v.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/* ====== Tipos ====== */
export type TRole = z.infer<typeof RoleEnum>;
export type TLoginDTO = z.infer<typeof LoginDTO>;
export type TRegisterDTO = z.infer<typeof RegisterDTO>;
export type TRefreshDTO = z.infer<typeof RefreshDTO>;
export type TRecoverDTO = z.infer<typeof RecoverDTO>;
export type TResetDTO = z.infer<typeof ResetDTO>;
export type TVerifyEmailDTO = z.infer<typeof VerifyEmailDTO>;
export type TActivateUserDTO = z.infer<typeof ActivateUserDTO>;
export type TChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;
