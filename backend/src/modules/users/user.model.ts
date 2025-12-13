export interface User {
    id: number;
    email: string;
    username: string | null;
    telefono: string | null;
    estado: boolean;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
}

export interface UserPublic {
    id: number;
    email: string;
    telefono?: string | null;
    estado: boolean;
    fecha_creacion: Date;
}
