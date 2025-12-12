/**
 * Servicio de gestión de pacientes
 * Maneja operaciones CRUD y estado de pacientes
 */

import type { FastifyInstance } from 'fastify';
import { PatientRepository } from './patient.repository';

export class PatientService {
  constructor(private app: FastifyInstance, private repo: PatientRepository) { }

  /** Crea un nuevo paciente */
  create(data: { usuarioId: number; primer_nombre: string; primer_apellido: string }) {
    return this.repo.create(data);
  }

  /** Actualiza datos de un paciente */
  update(id: number, data: Partial<{ primer_nombre: string; primer_apellido: string }>) {
    return this.repo.update(id, data as any);
  }

  /** Lista pacientes con paginación */
  list(page = 1, size = 20) { return this.repo.list(page, size); }

  /** Obtiene un paciente por ID */
  getById(id: number) { return this.repo.getById(id); }

  /** Obtiene un paciente por ID de usuario */
  getByUsuario(usuarioId: number) { return this.repo.getByUsuario(usuarioId); }

  /** Actualiza un paciente por ID de usuario */
  updateByUsuario(usuarioId: number, data: Partial<{ primer_nombre: string; primer_apellido: string }>) {
    return this.repo.updateByUsuario(usuarioId, data as any);
  }

  /** Activa o desactiva un paciente */
  setEstado(id: number, estado: boolean) { return this.repo.setEstado(id, estado); }
}
