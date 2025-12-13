/**
 * Servicio de estadísticas para el panel de administración
 */

import type { FastifyInstance } from 'fastify';

export class StatsService {
    constructor(private app: FastifyInstance) { }

    /**
     * Contar total de usuarios (Solo activos: médicos y pacientes)
     */
    async getTotalUsers(): Promise<number> {
        const [activeDoctors, activePatients] = await Promise.all([
            this.getActiveDoctors(),
            this.getActivePatients(),
        ]);
        return activeDoctors + activePatients;
    }

    /**
     * Contar médicos activos
     */
    async getActiveDoctors(): Promise<number> {
        const count = await this.app.prisma.medico.count({
            where: {
                usuario: {
                    estado: true,
                },
            },
        });
        return count;
    }

    /**
     * Contar pacientes activos
     */
    async getActivePatients(): Promise<number> {
        const count = await this.app.prisma.paciente.count({
            where: {
                usuario: {
                    estado: true,
                    emailConfirmado: true,
                },
            },
        });
        return count;
    }

    /**
     * Contar citas de hoy
     */
    async getAppointmentsToday(): Promise<number> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const count = await this.app.prisma.cita.count({
            where: {
                inicio: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                estado: true,
            },
        });
        return count;
    }

    /**
     * Obtener médicos pendientes de activación
     */
    async getPendingDoctors() {
        const doctors = await this.app.prisma.medico.findMany({
            where: {
                usuario: {
                    estado: false,
                },
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        email: true,
                        fechaCreacion: true,
                    },
                },
            },
        });

        return doctors.map(d => ({
            id: Number(d.id),
            usuarioId: Number(d.usuarioId),
            primerNombre: d.primerNombre,
            segundoNombre: d.segundoNombre,
            primerApellido: d.primerApellido,
            segundoApellido: d.segundoApellido,
            registroProfesional: d.registroProfesional,
            email: d.usuario.email,
            fechaCreacion: d.usuario.fechaCreacion,
        }));
    }

    /**
     * Obtener pacientes pendientes de activación o verificación
     */
    async getPendingPatients() {
        const patients = await this.app.prisma.paciente.findMany({
            where: {
                usuario: {
                    OR: [
                        { estado: false },
                        { emailConfirmado: false }
                    ]
                },
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        email: true,
                        emailConfirmado: true,
                        estado: true,
                        fechaCreacion: true,
                    },
                },
            },
        });

        return patients.map(p => ({
            id: Number(p.id),
            usuarioId: Number(p.usuarioId),
            primerNombre: p.primerNombre,
            segundoNombre: p.segundoNombre,
            primerApellido: p.primerApellido,
            segundoApellido: p.segundoApellido,
            email: p.usuario.email,
            fechaCreacion: p.usuario.fechaCreacion,
        }));
    }

    /**
     * Obtener todas las estadísticas del dashboard
     */
    async getDashboardStats() {
        const [totalUsers, activeDoctors, activePatients, pendingDoctors, pendingPatients, appointmentsToday] = await Promise.all([
            this.getTotalUsers(),
            this.getActiveDoctors(),
            this.getActivePatients(),
            this.getPendingDoctors(),
            this.getPendingPatients(),
            this.getAppointmentsToday(),
        ]);

        const stats = {
            totalUsers,
            activeDoctors,
            activePatients,
            pendingDoctors: pendingDoctors.length,
            pendingPatients: pendingPatients.length,
            appointmentsToday,
        };



        return stats;
    }

    /**
     * Obtener lista de médicos activos con detalles
     */
    async getActiveDoctorsList() {
        const doctors = await this.app.prisma.medico.findMany({
            where: {
                usuario: {
                    estado: true,
                },
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        email: true,
                        estado: true,
                        fechaCreacion: true,
                        telefono: true,
                    },
                },
                especialidades: {
                    include: {
                        especialidad: {
                            select: {
                                id: true,
                                codigo: true,
                                nombre: true,
                            },
                        },
                    },
                },
            },
        });

        return doctors.map(d => ({
            id: Number(d.id),
            usuarioId: Number(d.usuarioId),
            primerNombre: d.primerNombre,
            segundoNombre: d.segundoNombre,
            primerApellido: d.primerApellido,
            segundoApellido: d.segundoApellido,
            registroProfesional: d.registroProfesional,
            tipoDocumentoId: d.tipo_documento_id ? Number(d.tipo_documento_id) : undefined,
            numeroDocumento: d.numeroDocumento,
            telefono: d.usuario.telefono,
            direccion: d.direccionLinea1,
            email: d.usuario.email,
            estado: d.usuario.estado,
            fechaCreacion: d.usuario.fechaCreacion,
            especialidades: d.especialidades.map((me: any) => ({
                id: Number(me.especialidad.id),
                codigo: me.especialidad.codigo,
                nombre: me.especialidad.nombre,
            })),
        }));
    }

    /**
     * Obtener lista de pacientes activos con detalles
     */
    async getActivePatientsList() {
        const patients = await this.app.prisma.paciente.findMany({
            where: {
                usuario: {
                    estado: true,
                    emailConfirmado: true,
                },
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        email: true,
                        estado: true,
                        fechaCreacion: true,
                        telefono: true,
                    },
                },
            },
        });

        return patients.map(p => ({
            id: Number(p.id),
            usuarioId: Number(p.usuarioId),
            primerNombre: p.primerNombre,
            segundoNombre: p.segundoNombre,
            primerApellido: p.primerApellido,
            segundoApellido: p.segundoApellido,
            tipoDocumentoId: p.tipo_documento_id ? Number(p.tipo_documento_id) : undefined,
            numeroDocumento: p.numeroDocumento,
            telefono: p.usuario.telefono,
            direccion: p.direccionLinea1,
            fechaNacimiento: p.fechaNacimiento,
            sexoId: p.sexo_id ? Number(p.sexo_id) : undefined,
            email: p.usuario.email,
            estado: p.usuario.estado,
            fechaCreacion: p.usuario.fechaCreacion,
        }));
    }
}
