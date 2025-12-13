export interface Appointment {
    id: number;
    paciente_id: number;
    medico_id: number;
    inicio: Date;
    fin: Date;
    estado_cita_id: number;
    motivo?: string | null;
    motivo_cancelacion_id?: number | null;
    cancelada_por_usuario_id?: number | null;
}
