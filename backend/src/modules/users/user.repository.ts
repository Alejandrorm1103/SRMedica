import type { FastifyInstance } from 'fastify';
import type { User } from './user.model';

/** UserRepository: acceso a auth.usuarios */
export class UserRepository {
  constructor(private app: FastifyInstance) { }

  async getById(id: number): Promise<User | null> {
    const user = await this.app.prisma.usuario.findUnique({
      where: { id },
    });
    if (!user) {
      return null;
    }
    return {
      id: Number(user.id),
      email: user.email,
      username: user.username,
      telefono: user.telefono,
      estado: user.estado,
      fecha_creacion: user.fechaCreacion,
      fecha_actualizacion: user.fechaActualizacion,
    };
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    // Only update allowed fields
    const updateData: any = {};
    if (data.username !== undefined) { updateData.username = data.username; }
    if (data.telefono !== undefined) { updateData.telefono = data.telefono; }

    const user = await this.app.prisma.usuario.update({
      where: { id },
      data: updateData,
    });

    return {
      id: Number(user.id),
      email: user.email,
      username: user.username,
      telefono: user.telefono,
      estado: user.estado,
      fecha_creacion: user.fechaCreacion,
      fecha_actualizacion: user.fechaActualizacion,
    };
  }

  async list(page = 1, size = 20, estado?: boolean): Promise<{ data: User[]; total: number }> {
    const skip = (page - 1) * size;
    const where: any = {};
    if (typeof estado === 'boolean') { where.estado = estado; }

    const [users, total] = await Promise.all([
      this.app.prisma.usuario.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: 'desc' },
      }),
      this.app.prisma.usuario.count({ where }),
    ]);

    const data = users.map(user => ({
      id: Number(user.id),
      email: user.email,
      username: user.username,
      telefono: user.telefono,
      estado: user.estado,
      fecha_creacion: user.fechaCreacion,
      fecha_actualizacion: user.fechaActualizacion,
    }));

    return { data, total };
  }
}
