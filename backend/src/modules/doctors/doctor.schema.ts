import { z } from 'zod';

export const DoctorUpsertDTO = z.object({
  usuarioId: z.number().optional(),
  registroProfesional: z.string().min(1),
  resumenPerfil: z.string().optional().nullable(),
  primerNombre: z.string().optional(), // Doctors usually have names, making optional to support partial updates if needed
  segundoNombre: z.string().optional().nullable(),
  primerApellido: z.string().optional(),
  segundoApellido: z.string().optional().nullable(),
  tipoDocumento: z.string().optional().nullable(),
  numeroDocumento: z.string().optional().nullable(),
  sexo: z.string().optional().nullable(),
  fechaNacimiento: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  ciudad: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),
});

export const SetEspecialidadesDTO = z.object({ especialidadIds: z.array(z.number()).nonempty() });
export type TDoctorUpsertDTO = z.infer<typeof DoctorUpsertDTO>;

