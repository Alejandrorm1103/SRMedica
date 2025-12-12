export interface Notificacion {
    id: number;
    usuario_id: number;
    cita_id?: number | null;
    tipo: string;
    fecha_creacion: Date;
}
