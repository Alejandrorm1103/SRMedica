/**
 * Constantes globales del proyecto
 */

// ========================================
// Roles de Usuario
// ========================================

export const ROLES = {
    Admin: 'admin',
    Medico: 'medico',
    Paciente: 'paciente',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// ========================================
// Estados de Citas
// ========================================

export const APPOINTMENT_STATUS = {
    Pendiente: 'pendiente',
    Confirmada: 'confirmada',
    EnCurso: 'en_curso',
    Completada: 'completada',
    Cancelada: 'cancelada',
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

// ========================================
// Tipos de Documento
// ========================================

export const DOCUMENT_TYPES = {
    CC: 'CC',  // Cédula de Ciudadanía
    TI: 'TI',  // Tarjeta de Identidad
    CE: 'CE',  // Cédula de Extranjería
    PA: 'PA',  // Pasaporte
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

// ========================================
// Géneros
// ========================================

export const GENDERS = {
    Masculino: 'M',
    Femenino: 'F',
    Otro: 'Otro',
} as const;

export type Gender = typeof GENDERS[keyof typeof GENDERS];

// ========================================
// Estados de Notificación
// ========================================

export const NOTIFICATION_STATUS = {
    Pendiente: 'pendiente',
    Enviada: 'enviada',
    Leida: 'leida',
    Error: 'error',
} as const;

export type NotificationStatus = typeof NOTIFICATION_STATUS[keyof typeof NOTIFICATION_STATUS];

// ========================================
// Canales de Notificación
// ========================================

export const NOTIFICATION_CHANNELS = {
    Email: 'email',
    SMS: 'sms',
    Push: 'push',
    InApp: 'in_app',
} as const;

export type NotificationChannel = typeof NOTIFICATION_CHANNELS[keyof typeof NOTIFICATION_CHANNELS];

// ========================================
// Prioridades
// ========================================

export const PRIORITIES = {
    Baja: 'baja',
    Media: 'media',
    Alta: 'alta',
    Urgente: 'urgente',
} as const;

export type Priority = typeof PRIORITIES[keyof typeof PRIORITIES];

// ========================================
// Configuración de Paginación
// ========================================

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

// ========================================
// Configuración de JWT
// ========================================

export const JWT = {
    ACCESS_TOKEN_EXPIRY: '1h',
    REFRESH_TOKEN_EXPIRY: '7d',
    VERIFY_EMAIL_TOKEN_EXPIRY: '24h',
    RESET_PASSWORD_TOKEN_EXPIRY: '1h',
} as const;

// ========================================
// Configuración de Rate Limiting
// ========================================

export const RATE_LIMIT = {
    GLOBAL_MAX: 100,
    GLOBAL_WINDOW: '1 minute',
    AUTH_MAX: 5,
    AUTH_WINDOW: '15 minutes',
} as const;

// ========================================
// Mensajes de Error Comunes
// ========================================

export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION_ERROR: 'Error de validación',
    INTERNAL_ERROR: 'Error interno del servidor',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
    USER_NOT_FOUND: 'Usuario no encontrado',
    INVALID_TOKEN: 'Token inválido o expirado',
} as const;

// ========================================
// Códigos de Error
// ========================================

export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_TOKEN: 'INVALID_TOKEN',
    DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
