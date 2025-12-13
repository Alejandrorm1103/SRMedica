/**
 * Utilidades para respuestas de API estandarizadas
 */

/** Crea una respuesta exitosa */
export const ok = <T>(data: T) => ({ ok: true, data });

/** Crea una respuesta paginada */
export const paged = <T>(data: T, total: number, page: number, size: number) =>
  ({ ok: true, data, meta: { total, page, size } });
