import type { FastifyInstance } from 'fastify';
import type { Patient } from './patient.model';

/** PatientRepository: acceso a core.pacientes */
export class PatientRepository {
  constructor(private app: FastifyInstance) { }

  private mapToModel(p: any): Patient {
    return {
      id: Number(p.id),
      usuario_id: Number(p.usuarioId),
      primer_nombre: p.primerNombre,
      segundo_nombre: p.segundoNombre,
      primer_apellido: p.primerApellido,
      segundo_apellido: p.segundoApellido,
      tipo_documento: p.tipos_documentos?.codigo,
      numero_documento: p.numeroDocumento,
      sexo: p.sexos?.codigo,
      fecha_nacimiento: p.fechaNacimiento ? new Date(p.fechaNacimiento).toISOString().split('T')[0] : null,
      telefono: p.usuario?.telefono || null,
      direccion: p.direccionLinea1,
      ciudad: p.ciudad,
      departamento: p.departamento,
      pais: p.pais,
      estado: p.estado,
    };
  }

  async create(data: any): Promise<Patient> {
    const paciente = await this.app.prisma.paciente.create({
      data: {
        usuarioId: data.usuarioId,
        primerNombre: data.primerNombre,
        primerApellido: data.primerApellido,
        segundoNombre: data.segundoNombre,
        segundoApellido: data.segundoApellido,
        numeroDocumento: data.numeroDocumento,
        direccionLinea1: data.direccion,
        ciudad: data.ciudad,
        departamento: data.departamento,
        pais: data.pais,
        estado: true,
        // Relations
        sexos: data.sexo ? { connect: { codigo: data.sexo } } : undefined,
        tipos_documentos: data.tipoDocumento ? { connect: { codigo: data.tipoDocumento } } : undefined,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
      } as any,
      include: { sexos: true, tipos_documentos: true, usuario: true }
    });
    return this.mapToModel(paciente);
  }

  async update(id: number, data: any): Promise<Patient> {
    const paciente = await this.app.prisma.paciente.update({
      where: { id },
      data: {
        primerNombre: data.primerNombre,
        primerApellido: data.primerApellido,
        segundoNombre: data.segundoNombre,
        segundoApellido: data.segundoApellido,
        numeroDocumento: data.numeroDocumento,
        direccionLinea1: data.direccion,
        ciudad: data.ciudad,
        departamento: data.departamento,
        pais: data.pais,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
        sexos: data.sexo ? { connect: { codigo: data.sexo } } : undefined,
        tipos_documentos: data.tipoDocumento ? { connect: { codigo: data.tipoDocumento } } : undefined,
      },
      include: { sexos: true, tipos_documentos: true, usuario: true }
    });
    return this.mapToModel(paciente);
  }

  async updateByUsuario(usuarioId: number, data: any): Promise<Patient> {
    const paciente = await this.app.prisma.paciente.update({
      where: { usuarioId },
      data: {
        primerNombre: data.primerNombre,
        primerApellido: data.primerApellido,
        segundoNombre: data.segundoNombre,
        segundoApellido: data.segundoApellido,
        numeroDocumento: data.numeroDocumento,
        direccionLinea1: data.direccion,
        ciudad: data.ciudad,
        departamento: data.departamento,
        pais: data.pais,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
        sexos: data.sexo ? { connect: { codigo: data.sexo } } : undefined,
        tipos_documentos: data.tipoDocumento ? { connect: { codigo: data.tipoDocumento } } : undefined,
      },
      include: { sexos: true, tipos_documentos: true, usuario: true }
    });
    return this.mapToModel(paciente);
  }

  async getByUsuario(usuarioId: number): Promise<Patient | null> {
    console.log(`[PatientRepo] getByUsuario called with ID: ${usuarioId} (type: ${typeof usuarioId})`);
    const paciente = await this.app.prisma.paciente.findUnique({
      where: { usuarioId },
      include: { sexos: true, tipos_documentos: true, usuario: true }
    });
    console.log(`[PatientRepo] found:`, paciente);
    if (!paciente) { return null; }
    return this.mapToModel(paciente);
  }

  async getById(id: number): Promise<Patient | null> {
    const paciente = await this.app.prisma.paciente.findUnique({
      where: { id },
      include: { sexos: true, tipos_documentos: true, usuario: true }
    });
    if (!paciente) { return null; }
    return this.mapToModel(paciente);
  }

  async list(page = 1, size = 20): Promise<{ data: Patient[]; total: number }> {
    const skip = (page - 1) * size;
    const [pacientes, total] = await Promise.all([
      this.app.prisma.paciente.findMany({
        skip,
        take: size,
        orderBy: { id: 'desc' },
        include: { sexos: true, tipos_documentos: true, usuario: true }
      }),
      this.app.prisma.paciente.count(),
    ]);

    return {
      data: pacientes.map(p => this.mapToModel(p)),
      total,
    };
  }

  async setEstado(id: number, estado: boolean) {
    await this.app.prisma.paciente.update({
      where: { id },
      data: { estado },
    });
    return true;
  }
}
