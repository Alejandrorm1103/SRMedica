import { z } from 'zod';

export const PatientUpsertDTO = z.object({
  usuarioId: z.number().optional(), // Optional for updates where userId is taken from token
  primerNombre: z.string().min(1),
  segundoNombre: z.string().optional().nullable(),
  primerApellido: z.string().min(1),
  segundoApellido: z.string().optional().nullable(),
  tipoDocumento: z.string().optional().nullable(),
  numeroDocumento: z.string().optional().nullable(),
  sexo: z.string().optional().nullable(),
  fechaNacimiento: z.string().optional().nullable(), // ISO Date string
  direccion: z.string().optional().nullable(),
  ciudad: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),
});

