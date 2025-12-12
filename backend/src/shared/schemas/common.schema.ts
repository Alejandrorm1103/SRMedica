import { z } from 'zod';

/**
 * Esquemas de validación comunes reutilizables en todo el proyecto
 */

// ========================================
// Validadores Básicos
// ========================================

/**
 * Validador de email
 */
export const emailSchema = z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim();

/**
 * Validador de contraseña
 * Requisitos: mínimo 8 caracteres
 */
export const passwordSchema = z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga');

/**
 * Validador de teléfono (formato internacional)
 * Acepta: +57 300 1234567, +1 555 1234567, etc.
 */
export const phoneSchema = z
    .string()
    .regex(
        /^\+?[1-9]\d{1,14}$/,
        'Formato de teléfono inválido. Use formato internacional: +57 300 1234567'
    )
    .trim();

/**
 * Validador de nombre (primer nombre, apellido, etc.)
 */
export const nameSchema = z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
    .trim();

/**
 * Validador de ID numérico
 */
export const idSchema = z.coerce.number().int().positive();

/**
 * Validador de UUID
 */
export const uuidSchema = z.string().uuid('UUID inválido');

// ========================================
// Paginación
// ========================================

/**
 * Esquema de paginación estándar
 */
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * Tipo TypeScript para paginación
 */
export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Esquema de respuesta paginada
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        data: z.array(itemSchema),
        pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
        }),
    });

// ========================================
// Fechas
// ========================================

/**
 * Validador de fecha ISO 8601
 */
export const dateSchema = z.string().datetime('Fecha inválida. Use formato ISO 8601');

/**
 * Validador de fecha (solo fecha, sin hora)
 */
export const dateOnlySchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Use YYYY-MM-DD');

/**
 * Validador de rango de fechas
 */
export const dateRangeSchema = z.object({
    startDate: dateSchema,
    endDate: dateSchema,
});

// ========================================
// Búsqueda y Filtros
// ========================================

/**
 * Esquema de búsqueda genérica
 */
export const searchSchema = z.object({
    q: z.string().min(1).max(100).optional(),
    ...paginationSchema.shape,
});

/**
 * Esquema de ordenamiento
 */
export const sortSchema = z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ========================================
// Respuestas API
// ========================================

/**
 * Esquema de respuesta exitosa genérica
 */
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        ok: z.literal(true),
        data: dataSchema,
    });

/**
 * Esquema de respuesta de error
 */
export const errorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
    }),
});

// ========================================
// Validadores Específicos del Dominio
// ========================================

/**
 * Validador de rol de usuario
 */
export const roleSchema = z.enum(['admin', 'medico', 'paciente']);

/**
 * Validador de estado de cita
 */
export const appointmentStatusSchema = z.enum([
    'pendiente',
    'confirmada',
    'en_curso',
    'completada',
    'cancelada',
]);

/**
 * Validador de tipo de documento
 */
export const documentTypeSchema = z.enum(['CC', 'TI', 'CE', 'PA']);

/**
 * Validador de género
 */
export const genderSchema = z.enum(['M', 'F', 'Otro']);

// ========================================
// Utilidades
// ========================================

/**
 * Validador de booleano desde string
 * Acepta: "true", "false", "1", "0"
 */
export const booleanStringSchema = z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean());

/**
 * Validador de array de IDs desde string
 * Acepta: "1,2,3" → [1, 2, 3]
 */
export const idsArraySchema = z
    .string()
    .transform((val) => val.split(',').map(Number))
    .pipe(z.array(z.number().int().positive()));
