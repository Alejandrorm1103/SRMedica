/**
 * Schemas de validación para Administradores
 */

import { z } from 'zod';

export const UpdateAdministratorSchema = z.object({
    tipo_documento_id: z.number().int().positive().optional().nullable(),
    numero_documento: z.string().max(50).optional().nullable(),
    primer_nombre: z.string().min(1).max(60).optional(),
    segundo_nombre: z.string().max(60).optional().nullable(),
    primer_apellido: z.string().min(1).max(60).optional(),
    segundo_apellido: z.string().max(60).optional().nullable(),
    fecha_nacimiento: z.string().datetime().optional().nullable(),
    sexo_id: z.number().int().positive().optional().nullable(),
    direccion_linea1: z.string().max(150).optional().nullable(),
    direccion_linea2: z.string().max(150).optional().nullable(),
    ciudad: z.string().max(100).optional().nullable(),
    departamento: z.string().max(100).optional().nullable(),
    pais: z.string().max(100).optional().nullable(),
    codigo_postal: z.string().max(20).optional().nullable(),
});

export type TUpdateAdministratorDTO = z.infer<typeof UpdateAdministratorSchema>;

export const ToggleStatusSchema = z.object({
    estado: z.boolean(),
});

export type TToggleStatusDTO = z.infer<typeof ToggleStatusSchema>;
