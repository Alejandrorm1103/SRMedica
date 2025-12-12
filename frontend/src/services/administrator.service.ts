import api from './api';

export interface Administrator {
    id: number;
    usuarioId: number;
    tipoDocumentoId?: number | null;
    numeroDocumento?: string | null;
    primerNombre: string;
    segundoNombre?: string | null;
    primerApellido: string;
    segundoApellido?: string | null;
    fechaNacimiento?: string | null;
    sexoId?: number | null;
    direccionLinea1?: string | null;
    direccionLinea2?: string | null;
    ciudad?: string | null;
    departamento?: string | null;
    pais?: string | null;
    codigoPostal?: string | null;
    estado: boolean;
    fechaCreacion: string;
    fechaActualizacion: string;
}

export interface AdministratorWithUser extends Administrator {
    usuario: {
        id: number;
        email: string;
        username?: string | null;
        telefono?: string | null;
        estado: boolean;
        emailConfirmado: boolean;
    };
}

export interface UpdateAdministratorDTO {
    tipo_documento_id?: number | null;
    numero_documento?: string | null;
    primer_nombre?: string;
    segundo_nombre?: string | null;
    primer_apellido?: string;
    segundo_apellido?: string | null;
    fecha_nacimiento?: string | null;
    sexo_id?: number | null;
    direccion_linea1?: string | null;
    direccion_linea2?: string | null;
    ciudad?: string | null;
    departamento?: string | null;
    pais?: string | null;
    codigo_postal?: string | null;
}

export const administratorService = {
    /**
     * Obtener perfil del administrador autenticado
     */
    async getMyProfile(): Promise<AdministratorWithUser> {
        const response = await api.get<AdministratorWithUser>('/administrators/me');
        return response.data;
    },

    /**
     * Actualizar perfil del administrador autenticado
     */
    async updateMyProfile(data: UpdateAdministratorDTO): Promise<Administrator> {
        const response = await api.put<Administrator>('/administrators/me', data);
        return response.data;
    },

    /**
     * Listar todos los administradores (solo para admins)
     */
    async list(params?: {
        estado?: boolean;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        data: AdministratorWithUser[];
        total: number;
        limit: number;
        offset: number;
    }> {
        const response = await api.get('/administrators', { params });
        return response.data;
    },

    /**
     * Obtener administrador por ID (solo para admins)
     */
    async getById(id: number): Promise<AdministratorWithUser> {
        const response = await api.get<AdministratorWithUser>(`/administrators/${id}`);
        return response.data;
    },

    /**
     * Actualizar administrador por ID (solo para admins)
     */
    async updateById(id: number, data: UpdateAdministratorDTO): Promise<Administrator> {
        const response = await api.put<Administrator>(`/administrators/${id}`, data);
        return response.data;
    },

    /**
     * Cambiar estado de administrador (solo para admins)
     */
    async toggleStatus(id: number, estado: boolean): Promise<{ success: boolean; message: string }> {
        const response = await api.patch(`/administrators/${id}/status`, { estado });
        return response.data;
    },
};
