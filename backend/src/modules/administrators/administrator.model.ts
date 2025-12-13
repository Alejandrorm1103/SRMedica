/**
 * Modelo de datos para Administrador
 */

export interface Administrador {
    id: number;
    usuarioId: number;
    tipoDocumentoId?: number | null;
    numeroDocumento?: string | null;
    primerNombre: string;
    segundoNombre?: string | null;
    primerApellido: string;
    segundoApellido?: string | null;
    fechaNacimiento?: Date | null;
    sexoId?: number | null;
    direccionLinea1?: string | null;
    direccionLinea2?: string | null;
    ciudad?: string | null;
    departamento?: string | null;
    pais?: string | null;
    codigoPostal?: string | null;
    estado: boolean;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}

export interface AdministradorWithUser extends Administrador {
    usuario: {
        id: number;
        email: string;
        username?: string | null;
        telefono?: string | null;
        estado: boolean;
        emailConfirmado: boolean;
    };
}
