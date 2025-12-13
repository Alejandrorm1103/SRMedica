/**
 * Utilidades para control de acceso basado en roles (RBAC)
 */

import type { FastifyInstance } from 'fastify';

/** Obtiene los roles de un usuario desde la base de datos */
export async function getUserRoles(app: FastifyInstance, userId: number): Promise<string[]> {
  const db = (app as any).db;
  if (!db || typeof db.query !== 'function') {
    throw new Error('DB_NOT_ATTACHED');
  }
  const r = await db.query(
    `SELECT r.codigo
       FROM auth.usuarios_roles ur
       JOIN auth.roles r ON r.id = ur.rol_id
      WHERE ur.usuario_id = $1`,
    [userId]
  );
  return r.rows.map((x: any) => x.codigo);
}

/** Verifica si el usuario tiene al menos uno de los roles permitidos */
export function hasAnyRole(userRoles: string[], allowed: string[]) {
  return allowed.some((r) => userRoles.includes(r));
}
