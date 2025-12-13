// Tipados básicos de tablas auth.* según tu SQL
export interface Usuario {
  id: number;
  email: string;
  username: string | null;
  telefono: string | null;
  estado: boolean;
  email_confirmado: boolean; // Added this as it was used in repo
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}
export interface Sesion {
  id: number;
  usuario_id: number;
  refresh_hash: string;
  expira_en: Date;
  revocada: boolean;
}
