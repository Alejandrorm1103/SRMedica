/**
 * Convierte una fecha a formato ISO 8601
 */
export const toIso = (d: Date | string | number) => new Date(d).toISOString();
