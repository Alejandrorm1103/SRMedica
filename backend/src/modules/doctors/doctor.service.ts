/**
 * Servicio de gestión de médicos
 * Maneja operaciones CRUD, especialidades y estado de médicos
 */

import type { FastifyInstance } from 'fastify';
import { DoctorRepository } from './doctor.repository';

export class DoctorService {
  constructor(private app: FastifyInstance, private repo: DoctorRepository) { }

  /** Crea un nuevo médico */
  create(data: { usuarioId: number; registro_profesional: string }) { return this.repo.create(data); }

  /** Actualiza datos de un médico */
  update(id: number, data: Partial<{ registro_profesional: string; resumen_perfil: string }>) { return this.repo.update(id, data as any); }

  /** Lista médicos con paginación */
  list(page = 1, size = 20) { return this.repo.list(page, size); }

  /** Obtiene un médico por ID */
  getById(id: number) { return this.repo.getById(id); }

  /** Obtiene un médico por ID de usuario */
  getByUsuario(usuarioId: number) { return this.repo.getByUsuario(usuarioId); }

  /** Actualiza un médico por ID de usuario */
  updateByUsuario(usuarioId: number, data: Partial<{ registro_profesional: string; resumen_perfil: string }>) { return this.repo.updateByUsuario(usuarioId, data as any); }

  /** Activa o desactiva un médico */
  setEstado(id: number, estado: boolean) { return this.repo.setEstado(id, estado); }

  /** Asigna especialidades a un médico */
  setEspecialidades(medicoId: number, ids: number[]) { return this.repo.setEspecialidades(medicoId, ids); }
}
