/**
 * Servicio de Administradores
 * Lógica de negocio para administradores
 */

import type { FastifyInstance } from 'fastify';
import { AdministratorRepository } from './administrator.repository';
import type { TUpdateAdministratorDTO } from './administrator.schema';

export class AdministratorService {
    private repo: AdministratorRepository;

    constructor(private app: FastifyInstance) {
        this.repo = new AdministratorRepository(app);
    }

    /**
     * Obtener perfil del administrador autenticado
     */
    async getMyProfile(usuarioId: number) {
        const admin = await this.repo.getByUserId(usuarioId);
        if (!admin) {
            throw this.app.httpErrors.notFound('Perfil de administrador no encontrado');
        }
        return admin;
    }

    /**
     * Actualizar perfil del administrador autenticado
     */
    async updateMyProfile(usuarioId: number, data: TUpdateAdministratorDTO) {
        const admin = await this.repo.getByUserId(usuarioId);
        if (!admin) {
            throw this.app.httpErrors.notFound('Perfil de administrador no encontrado');
        }

        const updateData: any = {};
        if (data.tipo_documento_id !== undefined) {updateData.tipoDocumentoId = data.tipo_documento_id;}
        if (data.numero_documento !== undefined) {updateData.numeroDocumento = data.numero_documento;}
        if (data.primer_nombre !== undefined) {updateData.primerNombre = data.primer_nombre;}
        if (data.segundo_nombre !== undefined) {updateData.segundoNombre = data.segundo_nombre;}
        if (data.primer_apellido !== undefined) {updateData.primerApellido = data.primer_apellido;}
        if (data.segundo_apellido !== undefined) {updateData.segundoApellido = data.segundo_apellido;}
        if (data.fecha_nacimiento !== undefined) {updateData.fechaNacimiento = data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null;}
        if (data.sexo_id !== undefined) {updateData.sexoId = data.sexo_id;}
        if (data.direccion_linea1 !== undefined) {updateData.direccionLinea1 = data.direccion_linea1;}
        if (data.direccion_linea2 !== undefined) {updateData.direccionLinea2 = data.direccion_linea2;}
        if (data.ciudad !== undefined) {updateData.ciudad = data.ciudad;}
        if (data.departamento !== undefined) {updateData.departamento = data.departamento;}
        if (data.pais !== undefined) {updateData.pais = data.pais;}
        if (data.codigo_postal !== undefined) {updateData.codigoPostal = data.codigo_postal;}

        return await this.repo.update(admin.id, updateData);
    }

    /**
     * Listar todos los administradores (solo para admins)
     */
    async listAll(filters?: {
        estado?: boolean;
        search?: string;
        limit?: number;
        offset?: number;
    }) {
        const admins = await this.repo.list(filters);
        const total = await this.repo.count({ estado: filters?.estado });

        return {
            data: admins,
            total,
            limit: filters?.limit || 50,
            offset: filters?.offset || 0,
        };
    }

    /**
     * Obtener administrador por ID (solo para admins)
     */
    async getById(id: number) {
        const admin = await this.repo.getByIdWithUser(id);
        if (!admin) {
            throw this.app.httpErrors.notFound('Administrador no encontrado');
        }
        return admin;
    }

    /**
     * Actualizar administrador por ID (solo para admins)
     */
    async updateById(id: number, data: TUpdateAdministratorDTO) {
        const admin = await this.repo.getByIdWithUser(id);
        if (!admin) {
            throw this.app.httpErrors.notFound('Administrador no encontrado');
        }

        const updateData: any = {};
        if (data.tipo_documento_id !== undefined) {updateData.tipoDocumentoId = data.tipo_documento_id;}
        if (data.numero_documento !== undefined) {updateData.numeroDocumento = data.numero_documento;}
        if (data.primer_nombre !== undefined) {updateData.primerNombre = data.primer_nombre;}
        if (data.segundo_nombre !== undefined) {updateData.segundoNombre = data.segundo_nombre;}
        if (data.primer_apellido !== undefined) {updateData.primerApellido = data.primer_apellido;}
        if (data.segundo_apellido !== undefined) {updateData.segundoApellido = data.segundo_apellido;}
        if (data.fecha_nacimiento !== undefined) {updateData.fechaNacimiento = data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null;}
        if (data.sexo_id !== undefined) {updateData.sexoId = data.sexo_id;}
        if (data.direccion_linea1 !== undefined) {updateData.direccionLinea1 = data.direccion_linea1;}
        if (data.direccion_linea2 !== undefined) {updateData.direccionLinea2 = data.direccion_linea2;}
        if (data.ciudad !== undefined) {updateData.ciudad = data.ciudad;}
        if (data.departamento !== undefined) {updateData.departamento = data.departamento;}
        if (data.pais !== undefined) {updateData.pais = data.pais;}
        if (data.codigo_postal !== undefined) {updateData.codigoPostal = data.codigo_postal;}

        return await this.repo.update(id, updateData);
    }

    /**
     * Cambiar estado de administrador (solo para admins)
     */
    async toggleStatus(id: number, estado: boolean) {
        const admin = await this.repo.getByIdWithUser(id);
        if (!admin) {
            throw this.app.httpErrors.notFound('Administrador no encontrado');
        }

        await this.repo.toggleStatus(id, estado);
        return { success: true, message: `Administrador ${estado ? 'activado' : 'desactivado'} correctamente` };
    }
}
