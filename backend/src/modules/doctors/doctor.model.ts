export interface Doctor {
    id: number;
    usuario_id: number;
    registro_profesional: string;
    resumen_perfil?: string | null;
    primer_nombre?: string;
    segundo_nombre?: string | null;
    primer_apellido?: string;
    segundo_apellido?: string | null;
    tipo_documento?: string | null;
    numero_documento?: string | null;
    sexo?: string | null;
    fecha_nacimiento?: string | Date | null;
    telefono?: string | null; // De la tabla usuarios
    direccion?: string | null;
    ciudad?: string | null;
    departamento?: string | null;
    pais?: string | null;
    estado: boolean;
    especialidades?: Array<{ nombre: string; codigo: string }>;
}
