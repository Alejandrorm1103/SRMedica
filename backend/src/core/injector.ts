/**
 * Inyector de dependencias centralizado
 * Proporciona factory functions para crear instancias de servicios con sus repositorios
 */

import type { FastifyInstance } from 'fastify';

import { AuthService } from '@/modules/auth/auth.service';
import { AuthRepository } from '@/modules/auth/auth.repository';

import { UserService } from '@/modules/users/user.service';
import { UserRepository } from '@/modules/users/user.repository';

import { DoctorService } from '@/modules/doctors/doctor.service';
import { DoctorRepository } from '@/modules/doctors/doctor.repository';

import { PatientService } from '@/modules/patients/patient.service';
import { PatientRepository } from '@/modules/patients/patient.repository';

import { AppointmentService } from '@/modules/appointments/appointment.service';
import { AppointmentRepository } from '@/modules/appointments/appointment.repository';

import { NotificationService } from '@/modules/notifications/notification.service';
import { NotificationRepository } from '@/modules/notifications/notification.repository';

export function makeAuthService(app: FastifyInstance) {
  return new AuthService(app, new AuthRepository(app));
}

export function makeUserService(app: FastifyInstance) {
  return new UserService(app, new UserRepository(app));
}

export function makeDoctorService(app: FastifyInstance) {
  return new DoctorService(app, new DoctorRepository(app));
}

export function makePatientService(app: FastifyInstance) {
  return new PatientService(app, new PatientRepository(app));
}

export function makeAppointmentService(app: FastifyInstance) {
  return new AppointmentService(app, new AppointmentRepository(app));
}

export function makeNotificationService(app: FastifyInstance) {
  return new NotificationService(app, new NotificationRepository(app));
}
