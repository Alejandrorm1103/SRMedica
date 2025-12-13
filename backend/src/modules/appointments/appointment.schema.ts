import { z } from 'zod';

// Schema para definir disponibilidad horaria
// Schema para definir disponibilidad horaria
export const DefineAvailabilityDTO = z.object({
  medicoId: z.number().positive().optional(),
  diaSemana: z.number().int().min(1).max(7),
  horaInicio: z.string(), // "HH:MM"
  horaFin: z.string(),   // "HH:MM"
});

// Schema para agendar una cita
export const BookDTO = z.object({
  pacienteId: z.number().optional(),
  medicoId: z.number().positive(),
  inicio: z.string().datetime(),
  fin: z.string().datetime(),
  motivo: z.string().optional(),
});

// Schema para reprogramar una cita
export const RescheduleDTO = z.object({
  inicio: z.string().datetime(),
  fin: z.string().datetime(),
});

// Schema para cancelar una cita
export const CancelDTO = z.object({
  motivoCancelacionCodigo: z.string(),
});

// Schema para actualizar horario
export const UpdateScheduleDTO = z.object({
  inicio: z.string().datetime(),
  fin: z.string().datetime(),
});

// Schema para búsqueda de médicos
export const SearchDoctorsDTO = z.object({
  query: z.string().optional(),
  especialidadId: z.number().positive().optional(),
});

// Schema para consultar disponibilidad
export const GetAvailabilityDTO = z.object({
  medicoId: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});
