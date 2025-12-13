import type { FastifyInstance } from 'fastify';
import type { Doctor } from './doctor.model';

/** DoctorRepository: acceso a core.medicos */
export class DoctorRepository {
  constructor(private app: FastifyInstance) { }

  private mapToModel(m: any): Doctor {
    return {
      id: Number(m.id),
      usuario_id: Number(m.usuarioId),
      registro_profesional: m.registroProfesional,
      resumen_perfil: m.resumenPerfil,
      primer_nombre: m.primerNombre,
      segundo_nombre: m.segundoNombre,
      primer_apellido: m.primerApellido,
      segundo_apellido: m.segundoApellido,
      tipo_documento: m.tipos_documentos?.codigo,
      numero_documento: m.numeroDocumento,
      sexo: m.sexos?.codigo,
      fecha_nacimiento: m.fechaNacimiento ? new Date(m.fechaNacimiento).toISOString().split('T')[0] : null,
      telefono: m.usuario?.telefono || null,
      direccion: m.direccionLinea1,
      ciudad: m.ciudad,
      departamento: m.departamento,
      pais: m.pais,
      estado: m.estado,
      especialidades: m.especialidades?.map((e: any) => ({
        nombre: e.especialidad?.nombre,
        codigo: e.especialidad?.codigo,
      })) || [],
    };
  }

  async create(data: any): Promise<Doctor> {
    const medico = await this.app.prisma.medico.create({
      data: {
        usuarioId: data.usuarioId,
        registroProfesional: data.registroProfesional,
        primerNombre: data.primerNombre,
        segundoNombre: data.segundoNombre,
        primerApellido: data.primerApellido,
        segundoApellido: data.segundoApellido,
        resumenPerfil: data.resumenPerfil,
        numeroDocumento: data.numeroDocumento,
        direccionLinea1: data.direccion,
        ciudad: data.ciudad,
        departamento: data.departamento,
        pais: data.pais,
        estado: true,
        sexos: data.sexo ? { connect: { codigo: data.sexo } } : undefined,
        tipos_documentos: data.tipoDocumento ? { connect: { codigo: data.tipoDocumento } } : undefined,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
      } as any,
      include: { sexos: true, tipos_documentos: true, usuario: true, especialidades: { include: { especialidad: true } } }
    });
    return this.mapToModel(medico);
  }

  async update(id: number, data: any): Promise<Doctor> {
    const medico = await this.app.prisma.medico.update({
      where: { id },
      data: {
        registroProfesional: data.registroProfesional,
        primerNombre: data.primerNombre,
        primerApellido: data.primerApellido,
        segundoNombre: data.segundoNombre,
        segundoApellido: data.segundoApellido,
        resumenPerfil: data.resumenPerfil,
        numeroDocumento: data.numeroDocumento,
        direccionLinea1: data.direccion,
        ciudad: data.ciudad,
        departamento: data.departamento,
        pais: data.pais,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
        sexos: data.sexo ? { connect: { codigo: data.sexo } } : undefined,
        tipos_documentos: data.tipoDocumento ? { connect: { codigo: data.tipoDocumento } } : undefined,
      },
      include: { sexos: true, tipos_documentos: true, usuario: true, especialidades: { include: { especialidad: true } } }
    });
    return this.mapToModel(medico);
  }

  async updateByUsuario(usuarioId: number, data: any): Promise<Doctor> {
    const medico = await this.app.prisma.medico.update({
      where: { usuarioId },
      data: {
        registroProfesional: data.registroProfesional,
        primerNombre: data.primerNombre,
        primerApellido: data.primerApellido,
        segundoNombre: data.segundoNombre,
        segundoApellido: data.segundoApellido,
        resumenPerfil: data.resumenPerfil,
        numeroDocumento: data.numeroDocumento,
        direccionLinea1: data.direccion,
        ciudad: data.ciudad,
        departamento: data.departamento,
        pais: data.pais,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
        sexos: data.sexo ? { connect: { codigo: data.sexo } } : undefined,
        tipos_documentos: data.tipoDocumento ? { connect: { codigo: data.tipoDocumento } } : undefined,
      },
      include: { sexos: true, tipos_documentos: true, usuario: true, especialidades: { include: { especialidad: true } } }
    });
    return this.mapToModel(medico);
  }

  async getByUsuario(usuarioId: number): Promise<Doctor | null> {
    const medico = await this.app.prisma.medico.findUnique({
      where: { usuarioId },
      include: { sexos: true, tipos_documentos: true, usuario: true, especialidades: { include: { especialidad: true } } }
    });
    if (!medico) { return null; }
    return this.mapToModel(medico);
  }

  async getById(id: number): Promise<Doctor | null> {
    const medico = await this.app.prisma.medico.findUnique({
      where: { id },
      include: { sexos: true, tipos_documentos: true, usuario: true, especialidades: { include: { especialidad: true } } }
    });
    if (!medico) { return null; }
    return this.mapToModel(medico);
  }

  async list(page = 1, size = 20): Promise<{ data: Doctor[]; total: number }> {
    const skip = (page - 1) * size;
    const [medicos, total] = await Promise.all([
      this.app.prisma.medico.findMany({
        skip,
        take: size,
        orderBy: { id: 'desc' },
        include: { sexos: true, tipos_documentos: true, usuario: true, especialidades: { include: { especialidad: true } } }
      }),
      this.app.prisma.medico.count(),
    ]);

    return {
      data: medicos.map(m => this.mapToModel(m)),
      total,
    };
  }

  async setEstado(id: number, estado: boolean) {
    await this.app.prisma.medico.update({
      where: { id },
      data: { estado },
    });
    return true;
  }

  async setEspecialidades(medicoId: number, ids: number[]) {
    await this.app.prisma.$transaction(async (tx) => {
      await tx.medicoEspecialidad.deleteMany({ where: { medicoId } });
      for (const id of ids) {
        await tx.medicoEspecialidad.create({
          data: { medicoId, especialidadId: id },
        });
      }
    });
    return true;
  }
}
