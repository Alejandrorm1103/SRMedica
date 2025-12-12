/**
 * Servicio de gestión de usuarios
 * Maneja operaciones CRUD y listados paginados de usuarios
 */

import type { FastifyInstance } from 'fastify';
import { UserRepository } from './user.repository';
import { UserListQuery, UserUpdateDTO } from './user.schema';
import type { z } from 'zod';
import type { PaginationParams } from '@/shared/schemas/common.schema';
import { executePaginatedQuery } from '@/utils/pagination.util';

export class UserService {
  constructor(private app: FastifyInstance, private repo: UserRepository) { }

  /** Obtiene un usuario por ID */
  getById(id: number) { return this.repo.getById(id); }

  /** Actualiza datos de un usuario */
  update(id: number, dto: z.infer<typeof UserUpdateDTO>) { return this.repo.update(id, dto as any); }

  /** Lista usuarios con paginación básica */
  list(q: z.infer<typeof UserListQuery>) { return this.repo.list(q.page ?? 1, q.size ?? 20, q.estado); }

  /** Lista usuarios con paginación consistente */
  async listPaginated(params: PaginationParams) {
    return executePaginatedQuery(
      () => this.app.prisma.usuario.count(),
      (options) => this.app.prisma.usuario.findMany({
        ...options,
        select: {
          id: true,
          email: true,
          username: true,
          telefono: true,
          estado: true,
          emailConfirmado: true,
          fechaCreacion: true,
        },
        orderBy: { fechaCreacion: 'desc' },
      }),
      params
    );
  }
}
