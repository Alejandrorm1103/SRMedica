/**
 * Repositorio de Administradores
 * Maneja operaciones de base de datos para administradores
 */

import type { FastifyInstance } from 'fastify';
import type { Administrador, AdministradorWithUser } from './administrator.model';

export class AdministratorRepository {
    constructor(private app: FastifyInstance) { }

    /**
     * Obtener administrador por ID de usuario
     */
    async getByUserId(usuarioId: number): Promise<AdministradorWithUser | null> {
        const admin = await this.app.prisma.administrador.findUnique({
            where: { usuarioId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        telefono: true,
                        estado: true,
                        emailConfirmado: true,
                    },
                },
            },
        });

        if (!admin) { return null; }

        return {
            id: Number(admin.id),
            usuarioId: Number(admin.usuarioId),
            tipoDocumentoId: admin.tipoDocumentoId ? Number(admin.tipoDocumentoId) : null,
            numeroDocumento: admin.numeroDocumento,
            primerNombre: admin.primerNombre,
            segundoNombre: admin.segundoNombre,
            primerApellido: admin.primerApellido,
            segundoApellido: admin.segundoApellido,
            fechaNacimiento: admin.fechaNacimiento,
            sexoId: admin.sexoId ? Number(admin.sexoId) : null,
            direccionLinea1: admin.direccionLinea1,
            direccionLinea2: admin.direccionLinea2,
            ciudad: admin.ciudad,
            departamento: admin.departamento,
            pais: admin.pais,
            codigoPostal: admin.codigoPostal,
            estado: admin.estado,
            fechaCreacion: admin.fechaCreacion,
            fechaActualizacion: admin.fechaActualizacion,
            usuario: {
                id: Number(admin.usuario.id),
                email: admin.usuario.email,
                username: admin.usuario.username,
                telefono: admin.usuario.telefono,
                estado: admin.usuario.estado,
                emailConfirmado: admin.usuario.emailConfirmado,
            },
        };
    }

    /**
     * Obtener administrador por ID con información de usuario
     */
    async getByIdWithUser(id: number): Promise<AdministradorWithUser | null> {
        const admin = await this.app.prisma.administrador.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        telefono: true,
                        estado: true,
                        emailConfirmado: true,
                    },
                },
            },
        });

        if (!admin) { return null; }

        return {
            id: Number(admin.id),
            usuarioId: Number(admin.usuarioId),
            tipoDocumentoId: admin.tipoDocumentoId ? Number(admin.tipoDocumentoId) : null,
            numeroDocumento: admin.numeroDocumento,
            primerNombre: admin.primerNombre,
            segundoNombre: admin.segundoNombre,
            primerApellido: admin.primerApellido,
            segundoApellido: admin.segundoApellido,
            fechaNacimiento: admin.fechaNacimiento,
            sexoId: admin.sexoId ? Number(admin.sexoId) : null,
            direccionLinea1: admin.direccionLinea1,
            direccionLinea2: admin.direccionLinea2,
            ciudad: admin.ciudad,
            departamento: admin.departamento,
            pais: admin.pais,
            codigoPostal: admin.codigoPostal,
            estado: admin.estado,
            fechaCreacion: admin.fechaCreacion,
            fechaActualizacion: admin.fechaActualizacion,
            usuario: {
                id: Number(admin.usuario.id),
                email: admin.usuario.email,
                username: admin.usuario.username,
                telefono: admin.usuario.telefono,
                estado: admin.usuario.estado,
                emailConfirmado: admin.usuario.emailConfirmado,
            },
        };
    }

    /**
     * Listar todos los administradores
     */
    async list(filters?: {
        estado?: boolean;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<AdministradorWithUser[]> {
        const where: any = {};

        if (filters?.estado !== undefined) {
            where.estado = filters.estado;
        }

        if (filters?.search) {
            where.OR = [
                { primerNombre: { contains: filters.search, mode: 'insensitive' } },
                { primerApellido: { contains: filters.search, mode: 'insensitive' } },
                { numeroDocumento: { contains: filters.search, mode: 'insensitive' } },
                { usuario: { email: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }

        const admins = await this.app.prisma.administrador.findMany({
            where,
            include: {
                usuario: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        telefono: true,
                        estado: true,
                        emailConfirmado: true,
                    },
                },
            },
            take: filters?.limit || 50,
            skip: filters?.offset || 0,
            orderBy: { fechaCreacion: 'desc' },
        });

        return admins.map(admin => ({
            id: Number(admin.id),
            usuarioId: Number(admin.usuarioId),
            tipoDocumentoId: admin.tipoDocumentoId ? Number(admin.tipoDocumentoId) : null,
            numeroDocumento: admin.numeroDocumento,
            primerNombre: admin.primerNombre,
            segundoNombre: admin.segundoNombre,
            primerApellido: admin.primerApellido,
            segundoApellido: admin.segundoApellido,
            fechaNacimiento: admin.fechaNacimiento,
            sexoId: admin.sexoId ? Number(admin.sexoId) : null,
            direccionLinea1: admin.direccionLinea1,
            direccionLinea2: admin.direccionLinea2,
            ciudad: admin.ciudad,
            departamento: admin.departamento,
            pais: admin.pais,
            codigoPostal: admin.codigoPostal,
            estado: admin.estado,
            fechaCreacion: admin.fechaCreacion,
            fechaActualizacion: admin.fechaActualizacion,
            usuario: {
                id: Number(admin.usuario.id),
                email: admin.usuario.email,
                username: admin.usuario.username,
                telefono: admin.usuario.telefono,
                estado: admin.usuario.estado,
                emailConfirmado: admin.usuario.emailConfirmado,
            },
        }));
    }

    /**
     * Actualizar perfil de administrador
     */
    async update(id: number, data: Partial<Omit<Administrador, 'id' | 'usuarioId' | 'fechaCreacion' | 'fechaActualizacion'>>): Promise<Administrador> {
        const updated = await this.app.prisma.administrador.update({
            where: { id },
            data: {
                tipoDocumentoId: data.tipoDocumentoId,
                numeroDocumento: data.numeroDocumento,
                primerNombre: data.primerNombre,
                segundoNombre: data.segundoNombre,
                primerApellido: data.primerApellido,
                segundoApellido: data.segundoApellido,
                fechaNacimiento: data.fechaNacimiento,
                sexoId: data.sexoId,
                direccionLinea1: data.direccionLinea1,
                direccionLinea2: data.direccionLinea2,
                ciudad: data.ciudad,
                departamento: data.departamento,
                pais: data.pais,
                codigoPostal: data.codigoPostal,
                estado: data.estado,
            },
        });

        return {
            id: Number(updated.id),
            usuarioId: Number(updated.usuarioId),
            tipoDocumentoId: updated.tipoDocumentoId ? Number(updated.tipoDocumentoId) : null,
            numeroDocumento: updated.numeroDocumento,
            primerNombre: updated.primerNombre,
            segundoNombre: updated.segundoNombre,
            primerApellido: updated.primerApellido,
            segundoApellido: updated.segundoApellido,
            fechaNacimiento: updated.fechaNacimiento,
            sexoId: updated.sexoId ? Number(updated.sexoId) : null,
            direccionLinea1: updated.direccionLinea1,
            direccionLinea2: updated.direccionLinea2,
            ciudad: updated.ciudad,
            departamento: updated.departamento,
            pais: updated.pais,
            codigoPostal: updated.codigoPostal,
            estado: updated.estado,
            fechaCreacion: updated.fechaCreacion,
            fechaActualizacion: updated.fechaActualizacion,
        };
    }

    /**
     * Cambiar estado de administrador
     */
    async toggleStatus(id: number, estado: boolean): Promise<void> {
        await this.app.prisma.administrador.update({
            where: { id },
            data: { estado },
        });
    }

    /**
     * Contar administradores
     */
    async count(filters?: { estado?: boolean }): Promise<number> {
        const where: any = {};
        if (filters?.estado !== undefined) {
            where.estado = filters.estado;
        }
        return await this.app.prisma.administrador.count({ where });
    }
}
