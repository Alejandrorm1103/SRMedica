-- ==========================================
-- SCRIPT CONSOLIDADO: DATOS_INSERTS.SQL
-- ==========================================

BEGIN;

-- ==========================================
-- 1. LIMPIEZA TOTAL (Orden Seguro)
-- ==========================================
DELETE FROM core.notificaciones;
DELETE FROM core.citas;
DELETE FROM core.horarios_medicos;
DELETE FROM core.medicos_especialidades;
DELETE FROM auth.sesiones;
DELETE FROM auth.auth_tokens;
DELETE FROM auth.usuarios_roles;
DELETE FROM core.administradores;
DELETE FROM core.medicos;
DELETE FROM core.pacientes;
DELETE FROM auth.usuarios;

-- ==========================================
-- 2. REINICIAR SECUENCIAS
-- ==========================================
ALTER SEQUENCE auth.usuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE core.pacientes_id_seq RESTART WITH 1;
ALTER SEQUENCE core.medicos_id_seq RESTART WITH 1;
ALTER SEQUENCE core.administradores_id_seq RESTART WITH 1;
ALTER SEQUENCE core.horarios_medicos_id_seq RESTART WITH 1;
ALTER SEQUENCE core.citas_id_seq RESTART WITH 1;
ALTER SEQUENCE core.notificaciones_id_seq RESTART WITH 1;

-- ==========================================
-- 3. CREAR ADMINISTRADORES
-- ==========================================

-- Admin 1: Super Admin
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'admin@srmedica.com',
  '$2b$10$1MfbpJIav5eyI1zTgLnA5e7jDASlJ.ftyIFCmxd3qYf5WmYlNdwq2',
  'admin@srmedica.com',
  true,
  true,
  '+57 300 111 1111'
);

INSERT INTO core.administradores (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id)
VALUES (
  1,
  1,
  '1234567890',
  'Carlos',
  'Administrador',
  1
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (1, (SELECT id FROM auth.roles WHERE codigo = 'administrador'));

-- Admin 2: Admin Secundario
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'admin2@srmedica.com',
  '$2b$10$1MfbpJIav5eyI1zTgLnA5e7jDASlJ.ftyIFCmxd3qYf5WmYlNdwq2',
  'admin2@srmedica.com',
  true,
  true,
  '+57 300 111 1112'
);

INSERT INTO core.administradores (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id)
VALUES (
  2,
  1,
  '1234567891',
  'María',
  'Rodríguez',
  2
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (2, (SELECT id FROM auth.roles WHERE codigo = 'administrador'));

-- ==========================================
-- 4. CREAR MÉDICOS
-- ==========================================

-- Médico 1: Activo - Cardiología
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dr.garcia@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dr.garcia@srmedica.com',
  true,
  true,
  '+57 300 222 0001'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, sexo_id, registro_profesional)
VALUES (
  3,
  1,
  '2000000001',
  'Juan',
  'Carlos',
  'García',
  'López',
  1,
  'MP-12345'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (3, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES (1, (SELECT id FROM cat.especialidades WHERE codigo = 'cardiologia'));

-- Médico 2: Activo - Pediatría
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dra.martinez@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dra.martinez@srmedica.com',
  true,
  true,
  '+57 300 222 0002'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, registro_profesional)
VALUES (
  4,
  1,
  '2000000002',
  'Ana',
  'Martínez',
  2,
  'MP-12346'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (4, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES (2, (SELECT id FROM cat.especialidades WHERE codigo = 'pediatria'));

-- Médico 3: Activo - Medicina General
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dr.rodriguez@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dr.rodriguez@srmedica.com',
  true,
  true,
  '+57 300 222 0003'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, registro_profesional)
VALUES (
  5,
  1,
  '2000000003',
  'Pedro',
  'Rodríguez',
  1,
  'MP-12347'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (5, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES (3, (SELECT id FROM cat.especialidades WHERE codigo = 'medicina_general'));

-- Médico 4: Activo - Dermatología
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dra.lopez@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dra.lopez@srmedica.com',
  true,
  true,
  '+57 300 222 0004'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, registro_profesional)
VALUES (
  6,
  1,
  '2000000004',
  'Laura',
  'López',
  2,
  'MP-12348'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (6, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES (4, (SELECT id FROM cat.especialidades WHERE codigo = 'dermatologia'));

-- Médico 5: Activo - Ginecología (con 2 especialidades)
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dra.hernandez@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dra.hernandez@srmedica.com',
  true,
  true,
  '+57 300 222 0005'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, registro_profesional)
VALUES (
  7,
  1,
  '2000000005',
  'Carmen',
  'Hernández',
  2,
  'MP-12349'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (7, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES 
  (5, (SELECT id FROM cat.especialidades WHERE codigo = 'ginecologia_obstetricia')),
  (5, (SELECT id FROM cat.especialidades WHERE codigo = 'medicina_familiar'));

-- Médico 6: Activo - Oftalmología
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dr.gomez@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dr.gomez@srmedica.com',
  true,
  true,
  '+57 300 222 0006'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, registro_profesional)
VALUES (
  8,
  1,
  '2000000006',
  'Miguel',
  'Gómez',
  1,
  'MP-12350'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (8, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES (6, (SELECT id FROM cat.especialidades WHERE codigo = 'oftalmologia'));

-- Médico 7: Activo - Traumatología
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dr.diaz@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dr.diaz@srmedica.com',
  true,
  true,
  '+57 300 222 0007'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, registro_profesional)
VALUES (
  9,
  1,
  '2000000007',
  'Roberto',
  'Díaz',
  1,
  'MP-12351'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (9, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES (7, (SELECT id FROM cat.especialidades WHERE codigo = 'traumatologia'));

-- Médico 8: Activo - Psiquiatría y Psicología
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dra.sanchez@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dra.sanchez@srmedica.com',
  true,
  true,
  '+57 300 222 0008'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, registro_profesional)
VALUES (
  10,
  1,
  '2000000008',
  'Patricia',
  'Sánchez',
  2,
  'MP-12352'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (10, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES 
  (8, (SELECT id FROM cat.especialidades WHERE codigo = 'psiquiatria')),
  (8, (SELECT id FROM cat.especialidades WHERE codigo = 'psicologia_clinica'));

-- Médico 9: PENDIENTE DE ACTIVACIÓN - Neurología
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dr.torres@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dr.torres@srmedica.com',
  true,
  false,
  '+57 300 222 0009'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, registro_profesional)
VALUES (
  11,
  1,
  '2000000009',
  'Fernando',
  'Torres',
  1,
  'MP-12353'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (11, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES (9, (SELECT id FROM cat.especialidades WHERE codigo = 'neurologia'));

-- Médico 10: PENDIENTE DE ACTIVACIÓN - Endocrinología
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'dra.ramirez@srmedica.com',
  '$2b$10$oulEBZe8TrpLR757yuxtz.khQarT2CFxFCw325JRkgjkuXnq6fKoK',
  'dra.ramirez@srmedica.com',
  true,
  false,
  '+57 300 222 0010'
);

INSERT INTO core.medicos (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, registro_profesional)
VALUES (
  12,
  1,
  '2000000010',
  'Sofía',
  'Ramírez',
  2,
  'MP-12354'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (12, (SELECT id FROM auth.roles WHERE codigo = 'medico'));

INSERT INTO core.medicos_especialidades (medico_id, especialidad_id)
VALUES (10, (SELECT id FROM cat.especialidades WHERE codigo = 'endocrinologia'));

-- ==========================================
-- 5. CREAR PACIENTES
-- ==========================================

-- Paciente 1: Activo y Verificado
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente1@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente1@gmail.com',
  true,
  true,
  '+57 300 333 0001'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, sexo_id, fecha_nacimiento)
VALUES (
  13,
  1,
  '3000000001',
  'Andrés',
  'Felipe',
  'Pérez',
  'Gómez',
  1,
  '1990-05-15'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (13, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- Paciente 2: Activo y Verificado
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente2@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente2@gmail.com',
  true,
  true,
  '+57 300 333 0002'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, fecha_nacimiento)
VALUES (
  14,
  1,
  '3000000002',
  'María',
  'González',
  2,
  '1985-08-22'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (14, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- Paciente 3: Activo y Verificado
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente3@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente3@gmail.com',
  true,
  true,
  '+57 300 333 0003'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, fecha_nacimiento)
VALUES (
  15,
  1,
  '3000000003',
  'Luis',
  'Martínez',
  1,
  '1992-03-10'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (15, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- Paciente 4: Activo y Verificado
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente4@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente4@gmail.com',
  true,
  true,
  '+57 300 333 0004'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, fecha_nacimiento)
VALUES (
  16,
  1,
  '3000000004',
  'Carolina',
  'López',
  2,
  '1988-11-30'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (16, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- Paciente 5: Activo y Verificado
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente5@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente5@gmail.com',
  true,
  true,
  '+57 300 333 0005'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, fecha_nacimiento)
VALUES (
  17,
  1,
  '3000000005',
  'Diego',
  'Hernández',
  1,
  '1995-07-18'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (17, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- Paciente 6: Activo y Verificado
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente6@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente6@gmail.com',
  true,
  true,
  '+57 300 333 0006'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, fecha_nacimiento)
VALUES (
  18,
  1,
  '3000000006',
  'Valentina',
  'Díaz',
  2,
  '1993-12-05'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (18, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- Paciente 7: Activo y Verificado
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente7@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente7@gmail.com',
  true,
  true,
  '+57 300 333 0007'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, fecha_nacimiento)
VALUES (
  19,
  1,
  '3000000007',
  'Santiago',
  'Gómez',
  1,
  '1991-04-25'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (19, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- Paciente 8: Activo y Verificado
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente8@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente8@gmail.com',
  true,
  true,
  '+57 300 333 0008'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, fecha_nacimiento)
VALUES (
  20,
  1,
  '3000000008',
  'Isabella',
  'Torres',
  2,
  '1994-09-14'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (20, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- Paciente 9: SIN VERIFICAR EMAIL
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente9@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente9@gmail.com',
  false,
  false,
  '+57 300 333 0009'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, fecha_nacimiento)
VALUES (
  21,
  1,
  '3000000009',
  'Mateo',
  'Ramírez',
  1,
  '1996-02-28'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (21, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- Paciente 10: SIN VERIFICAR EMAIL
INSERT INTO auth.usuarios (email, password_hash, username, email_confirmado, estado, telefono)
VALUES (
  'paciente10@gmail.com',
  '$2b$10$8S0MvrGCKarKnjTxX4hknuSyykglo4/9PZx2DOgkSnes9hQ4Gsx4G',
  'paciente10@gmail.com',
  false,
  false,
  '+57 300 333 0010'
);

INSERT INTO core.pacientes (usuario_id, tipo_documento_id, numero_documento, primer_nombre, primer_apellido, sexo_id, fecha_nacimiento)
VALUES (
  22,
  1,
  '3000000010',
  'Camila',
  'Sánchez',
  2,
  '1997-06-12'
);

INSERT INTO auth.usuarios_roles (usuario_id, rol_id)
VALUES (22, (SELECT id FROM auth.roles WHERE codigo = 'paciente'));

-- ==========================================
-- 6. CREAR HORARIOS RECURRENTES
-- ==========================================

-- Dr. García (Cardiología) - Médico ID 1
INSERT INTO core.horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, estado) VALUES
  (1, 1, '09:00', '13:00', true), (1, 1, '15:00', '18:00', true),
  (1, 2, '09:00', '13:00', true), (1, 2, '15:00', '18:00', true),
  (1, 3, '09:00', '13:00', true), (1, 3, '15:00', '18:00', true),
  (1, 4, '09:00', '13:00', true), (1, 4, '15:00', '18:00', true),
  (1, 5, '09:00', '13:00', true);

-- Dra. Martínez (Pediatría) - Médico ID 2
INSERT INTO core.horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, estado) VALUES
  (2, 1, '08:00', '12:00', true), (2, 1, '14:00', '17:00', true),
  (2, 2, '08:00', '12:00', true), (2, 2, '14:00', '17:00', true),
  (2, 3, '08:00', '12:00', true), (2, 3, '14:00', '17:00', true),
  (2, 4, '08:00', '12:00', true), (2, 4, '14:00', '17:00', true),
  (2, 5, '08:00', '12:00', true), (2, 5, '14:00', '17:00', true);

-- Dr. Rodríguez (Medicina General) - Médico ID 3
INSERT INTO core.horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, estado) VALUES
  (3, 1, '07:00', '14:00', true), (3, 2, '07:00', '14:00', true),
  (3, 3, '07:00', '14:00', true), (3, 4, '07:00', '14:00', true),
  (3, 5, '07:00', '14:00', true), (3, 6, '07:00', '14:00', true);

-- Dra. López (Dermatología) - Médico ID 4
INSERT INTO core.horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, estado) VALUES
  (4, 2, '10:00', '14:00', true), (4, 2, '16:00', '19:00', true),
  (4, 4, '10:00', '14:00', true), (4, 4, '16:00', '19:00', true);

-- Dra. Hernández (Ginecología) - Médico ID 5
INSERT INTO core.horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, estado) VALUES
  (5, 1, '09:00', '13:00', true), (5, 3, '09:00', '13:00', true), (5, 5, '09:00', '13:00', true);

-- Dr. Gómez (Oftalmología) - Médico ID 6
INSERT INTO core.horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, estado) VALUES
  (6, 1, '08:00', '13:00', true), (6, 1, '15:00', '18:00', true),
  (6, 2, '08:00', '13:00', true), (6, 2, '15:00', '18:00', true),
  (6, 3, '08:00', '13:00', true), (6, 3, '15:00', '18:00', true),
  (6, 4, '08:00', '13:00', true), (6, 4, '15:00', '18:00', true),
  (6, 5, '08:00', '13:00', true), (6, 5, '15:00', '18:00', true);

-- Dr. Díaz (Traumatología) - Médico ID 7
INSERT INTO core.horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, estado) VALUES
  (7, 1, '14:00', '20:00', true), (7, 2, '14:00', '20:00', true),
  (7, 3, '14:00', '20:00', true), (7, 4, '14:00', '20:00', true), (7, 5, '14:00', '20:00', true);

-- Dra. Sánchez (Psiquiatría) - Médico ID 8
INSERT INTO core.horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, estado) VALUES
  (8, 1, '10:00', '14:00', true), (8, 1, '16:00', '19:00', true),
  (8, 2, '10:00', '14:00', true), (8, 2, '16:00', '19:00', true),
  (8, 3, '10:00', '14:00', true), (8, 3, '16:00', '19:00', true),
  (8, 4, '10:00', '14:00', true), (8, 4, '16:00', '19:00', true);

-- ==========================================
-- 7. CREAR CITAS (SIN SOLAPAMIENTO)
-- ==========================================

-- MÉDICO 1: 7 pasadas, 12 hoy, 8 futuras
INSERT INTO core.citas (paciente_id, medico_id, inicio, fin, motivo, estado_cita_id) VALUES
  -- PASADAS (7)
  (1,1,CURRENT_DATE-7+TIME'09:00',CURRENT_DATE-7+TIME'10:00','Control',4),
  (2,1,CURRENT_DATE-6+TIME'10:00',CURRENT_DATE-6+TIME'11:00','Revisión',4),
  (3,1,CURRENT_DATE-5+TIME'15:00',CURRENT_DATE-5+TIME'16:00','ECG',4),
  (4,1,CURRENT_DATE-4+TIME'09:00',CURRENT_DATE-4+TIME'10:00','Consulta',4),
  (5,1,CURRENT_DATE-3+TIME'16:00',CURRENT_DATE-3+TIME'17:00','Control',4),
  (6,1,CURRENT_DATE-2+TIME'10:00',CURRENT_DATE-2+TIME'11:00','Chequeo',4),
  (7,1,CURRENT_DATE-1+TIME'15:00',CURRENT_DATE-1+TIME'16:00','Resultados',4),
  -- HOY (12)
  (1,1,CURRENT_DATE+TIME'09:00',CURRENT_DATE+TIME'09:30','Control',2),
  (2,1,CURRENT_DATE+TIME'09:30',CURRENT_DATE+TIME'10:00','Revisión',2),
  (3,1,CURRENT_DATE+TIME'10:00',CURRENT_DATE+TIME'10:30','ECG',3),
  (4,1,CURRENT_DATE+TIME'10:30',CURRENT_DATE+TIME'11:00','Consulta',2),
  (5,1,CURRENT_DATE+TIME'11:00',CURRENT_DATE+TIME'11:30','Control',2),
  (6,1,CURRENT_DATE+TIME'11:30',CURRENT_DATE+TIME'12:00','Chequeo',2),
  (7,1,CURRENT_DATE+TIME'12:00',CURRENT_DATE+TIME'12:30','Resultados',2),
  (8,1,CURRENT_DATE+TIME'15:00',CURRENT_DATE+TIME'15:30','Primera',2),
  (1,1,CURRENT_DATE+TIME'15:30',CURRENT_DATE+TIME'16:00','Mensual',2),
  (2,1,CURRENT_DATE+TIME'16:00',CURRENT_DATE+TIME'16:30','Medicamentos',2),
  (3,1,CURRENT_DATE+TIME'16:30',CURRENT_DATE+TIME'17:00','Eco',2),
  (4,1,CURRENT_DATE+TIME'17:00',CURRENT_DATE+TIME'17:30','Esfuerzo',2),
  -- FUTURAS (8)
  (5,1,CURRENT_DATE+2+TIME'09:00',CURRENT_DATE+2+TIME'10:00','Control',1),
  (6,1,CURRENT_DATE+3+TIME'10:00',CURRENT_DATE+3+TIME'11:00','Revisión',1),
  (7,1,CURRENT_DATE+4+TIME'15:00',CURRENT_DATE+4+TIME'16:00','ECG',1),
  (8,1,CURRENT_DATE+5+TIME'09:00',CURRENT_DATE+5+TIME'10:00','Consulta',1),
  (1,1,CURRENT_DATE+6+TIME'16:00',CURRENT_DATE+6+TIME'17:00','Control',1),
  (2,1,CURRENT_DATE+7+TIME'10:00',CURRENT_DATE+7+TIME'11:00','Chequeo',1),
  (3,1,CURRENT_DATE+8+TIME'15:00',CURRENT_DATE+8+TIME'16:00','Resultados',1),
  (4,1,CURRENT_DATE+9+TIME'09:00',CURRENT_DATE+9+TIME'10:00','Seguimiento',1);

-- MÉDICO 2: 9 pasadas, 15 hoy, 6 futuras
INSERT INTO core.citas (paciente_id, medico_id, inicio, fin, motivo, estado_cita_id) VALUES
  -- PASADAS (9)
  (1,2,CURRENT_DATE-9+TIME'08:00',CURRENT_DATE-9+TIME'09:00','Crecimiento',4),
  (2,2,CURRENT_DATE-8+TIME'14:00',CURRENT_DATE-8+TIME'15:00','Vacuna',4),
  (3,2,CURRENT_DATE-7+TIME'09:00',CURRENT_DATE-7+TIME'10:00','Consulta',4),
  (4,2,CURRENT_DATE-6+TIME'15:00',CURRENT_DATE-6+TIME'16:00','Revisión',4),
  (5,2,CURRENT_DATE-5+TIME'08:00',CURRENT_DATE-5+TIME'09:00','Peso',4),
  (6,2,CURRENT_DATE-4+TIME'14:00',CURRENT_DATE-4+TIME'15:00','Chequeo',4),
  (7,2,CURRENT_DATE-3+TIME'10:00',CURRENT_DATE-3+TIME'11:00','Primera',4),
  (8,2,CURRENT_DATE-2+TIME'16:00',CURRENT_DATE-2+TIME'17:00','Desarrollo',4),
  (1,2,CURRENT_DATE-1+TIME'09:00',CURRENT_DATE-1+TIME'10:00','Vacunas',4),
  -- HOY (15)
  (1,2,CURRENT_DATE+TIME'08:00',CURRENT_DATE+TIME'08:30','Crecimiento',2),
  (2,2,CURRENT_DATE+TIME'08:30',CURRENT_DATE+TIME'09:00','Vacuna',2),
  (3,2,CURRENT_DATE+TIME'09:00',CURRENT_DATE+TIME'09:30','Consulta',3),
  (4,2,CURRENT_DATE+TIME'09:30',CURRENT_DATE+TIME'10:00','Revisión',2),
  (5,2,CURRENT_DATE+TIME'10:00',CURRENT_DATE+TIME'10:30','Peso',2),
  (6,2,CURRENT_DATE+TIME'10:30',CURRENT_DATE+TIME'11:00','Chequeo',2),
  (7,2,CURRENT_DATE+TIME'11:00',CURRENT_DATE+TIME'11:30','Primera',2),
  (8,2,CURRENT_DATE+TIME'11:30',CURRENT_DATE+TIME'12:00','Desarrollo',2),
  (1,2,CURRENT_DATE+TIME'14:00',CURRENT_DATE+TIME'14:30','Vacunas',2),
  (2,2,CURRENT_DATE+TIME'14:30',CURRENT_DATE+TIME'15:00','Seguimiento',2),
  (3,2,CURRENT_DATE+TIME'15:00',CURRENT_DATE+TIME'15:30','Físico',2),
  (4,2,CURRENT_DATE+TIME'15:30',CURRENT_DATE+TIME'16:00','Nutricional',2),
  (5,2,CURRENT_DATE+TIME'16:00',CURRENT_DATE+TIME'16:30','Crecimiento',2),
  (6,2,CURRENT_DATE+TIME'16:30',CURRENT_DATE+TIME'17:00','General',2),
  -- FUTURAS (6)
  (8,2,CURRENT_DATE+2+TIME'08:00',CURRENT_DATE+2+TIME'09:00','Crecimiento',1),
  (1,2,CURRENT_DATE+3+TIME'14:00',CURRENT_DATE+3+TIME'15:00','Vacuna',1),
  (2,2,CURRENT_DATE+4+TIME'09:00',CURRENT_DATE+4+TIME'10:00','Consulta',1),
  (3,2,CURRENT_DATE+5+TIME'15:00',CURRENT_DATE+5+TIME'16:00','Revisión',1),
  (4,2,CURRENT_DATE+6+TIME'08:00',CURRENT_DATE+6+TIME'09:00','Peso',1),
  (5,2,CURRENT_DATE+7+TIME'14:00',CURRENT_DATE+7+TIME'15:00','Chequeo',1);

-- MÉDICO 3: 6 pasadas, 13 hoy, 9 futuras
INSERT INTO core.citas (paciente_id, medico_id, inicio, fin, motivo, estado_cita_id) VALUES
  -- PASADAS (6)
  (1,3,CURRENT_DATE-6+TIME'07:00',CURRENT_DATE-6+TIME'08:00','Chequeo',4),
  (2,3,CURRENT_DATE-5+TIME'09:00',CURRENT_DATE-5+TIME'10:00','Gripe',4),
  (3,3,CURRENT_DATE-4+TIME'11:00',CURRENT_DATE-4+TIME'12:00','Exámenes',4),
  (4,3,CURRENT_DATE-3+TIME'08:00',CURRENT_DATE-3+TIME'09:00','Diabetes',4),
  (5,3,CURRENT_DATE-2+TIME'12:00',CURRENT_DATE-2+TIME'13:00','Consulta',4),
  (6,3,CURRENT_DATE-1+TIME'07:00',CURRENT_DATE-1+TIME'08:00','Anual',4),
  -- HOY (13)
  (1,3,CURRENT_DATE+TIME'07:00',CURRENT_DATE+TIME'07:30','Chequeo',2),
  (2,3,CURRENT_DATE+TIME'07:30',CURRENT_DATE+TIME'08:00','Gripe',2),
  (3,3,CURRENT_DATE+TIME'08:00',CURRENT_DATE+TIME'08:30','Exámenes',3),
  (4,3,CURRENT_DATE+TIME'08:30',CURRENT_DATE+TIME'09:00','Diabetes',2),
  (5,3,CURRENT_DATE+TIME'09:00',CURRENT_DATE+TIME'09:30','Consulta',2),
  (6,3,CURRENT_DATE+TIME'09:30',CURRENT_DATE+TIME'10:00','Anual',2),
  (7,3,CURRENT_DATE+TIME'10:00',CURRENT_DATE+TIME'10:30','Resultados',2),
  (8,3,CURRENT_DATE+TIME'10:30',CURRENT_DATE+TIME'11:00','Primera',2),
  (1,3,CURRENT_DATE+TIME'11:00',CURRENT_DATE+TIME'11:30','Mensual',2),
  (2,3,CURRENT_DATE+TIME'11:30',CURRENT_DATE+TIME'12:00','Medicamentos',2),
  (3,3,CURRENT_DATE+TIME'12:00',CURRENT_DATE+TIME'12:30','Consulta',2),
  (4,3,CURRENT_DATE+TIME'12:30',CURRENT_DATE+TIME'13:00','Seguimiento',2),
  (5,3,CURRENT_DATE+TIME'13:00',CURRENT_DATE+TIME'13:30','Control',2),
  -- FUTURAS (9)
  (6,3,CURRENT_DATE+2+TIME'07:00',CURRENT_DATE+2+TIME'08:00','Chequeo',1),
  (7,3,CURRENT_DATE+3+TIME'09:00',CURRENT_DATE+3+TIME'10:00','Gripe',1),
  (8,3,CURRENT_DATE+4+TIME'11:00',CURRENT_DATE+4+TIME'12:00','Exámenes',1),
  (1,3,CURRENT_DATE+5+TIME'08:00',CURRENT_DATE+5+TIME'09:00','Diabetes',1),
  (2,3,CURRENT_DATE+6+TIME'12:00',CURRENT_DATE+6+TIME'13:00','Consulta',1),
  (3,3,CURRENT_DATE+7+TIME'07:00',CURRENT_DATE+7+TIME'08:00','Anual',1),
  (4,3,CURRENT_DATE+8+TIME'10:00',CURRENT_DATE+8+TIME'11:00','Resultados',1),
  (5,3,CURRENT_DATE+9+TIME'09:00',CURRENT_DATE+9+TIME'10:00','Primera',1),
  (6,3,CURRENT_DATE+10+TIME'11:00',CURRENT_DATE+10+TIME'12:00','Mensual',1);

-- MÉDICO 4: 5 pasadas, 8 hoy, 7 futuras
INSERT INTO core.citas (paciente_id, medico_id, inicio, fin, motivo, estado_cita_id) VALUES
  -- PASADAS (5)
  (1,4,CURRENT_DATE-8+TIME'10:00',CURRENT_DATE-8+TIME'11:00','Lunares',4),
  (2,4,CURRENT_DATE-6+TIME'16:00',CURRENT_DATE-6+TIME'17:00','Acné',4),
  (3,4,CURRENT_DATE-4+TIME'11:00',CURRENT_DATE-4+TIME'12:00','Consulta',4),
  (4,4,CURRENT_DATE-3+TIME'17:00',CURRENT_DATE-3+TIME'18:00','Tratamiento',4),
  (5,4,CURRENT_DATE-1+TIME'10:00',CURRENT_DATE-1+TIME'11:00','Piel',4),
  -- HOY (8)
  (1,4,CURRENT_DATE+TIME'10:00',CURRENT_DATE+TIME'10:30','Lunares',2),
  (2,4,CURRENT_DATE+TIME'10:30',CURRENT_DATE+TIME'11:00','Acné',2),
  (3,4,CURRENT_DATE+TIME'11:00',CURRENT_DATE+TIME'11:30','Consulta',3),
  (4,4,CURRENT_DATE+TIME'11:30',CURRENT_DATE+TIME'12:00','Tratamiento',2),
  (5,4,CURRENT_DATE+TIME'16:00',CURRENT_DATE+TIME'16:30','Piel',2),
  (6,4,CURRENT_DATE+TIME'16:30',CURRENT_DATE+TIME'17:00','Primera',2),
  (7,4,CURRENT_DATE+TIME'17:00',CURRENT_DATE+TIME'17:30','Chequeo',2),
  (8,4,CURRENT_DATE+TIME'17:30',CURRENT_DATE+TIME'18:00','Consulta',2),
  -- FUTURAS (7)
  (1,4,CURRENT_DATE+3+TIME'10:00',CURRENT_DATE+3+TIME'11:00','Lunares',1),
  (2,4,CURRENT_DATE+5+TIME'16:00',CURRENT_DATE+5+TIME'17:00','Acné',1),
  (3,4,CURRENT_DATE+7+TIME'11:00',CURRENT_DATE+7+TIME'12:00','Consulta',1),
  (4,4,CURRENT_DATE+10+TIME'17:00',CURRENT_DATE+10+TIME'18:00','Tratamiento',1),
  (5,4,CURRENT_DATE+12+TIME'10:00',CURRENT_DATE+12+TIME'11:00','Piel',1),
  (6,4,CURRENT_DATE+14+TIME'16:00',CURRENT_DATE+14+TIME'17:00','Primera',1),    
  (7,4,CURRENT_DATE+17+TIME'11:00',CURRENT_DATE+17+TIME'12:00','Chequeo',1);

-- MÉDICO 5: 8 pasadas, 11 hoy, 5 futuras
INSERT INTO core.citas (paciente_id, medico_id, inicio, fin, motivo, estado_cita_id) VALUES
  -- PASADAS (8)
  (1,5,CURRENT_DATE-10+TIME'09:00',CURRENT_DATE-10+TIME'10:00','Ginecológica',4),
  (2,5,CURRENT_DATE-8+TIME'10:00',CURRENT_DATE-8+TIME'11:00','Prenatal',4),
  (3,5,CURRENT_DATE-6+TIME'11:00',CURRENT_DATE-6+TIME'12:00','Revisión',4),
  (4,5,CURRENT_DATE-5+TIME'09:00',CURRENT_DATE-5+TIME'10:00','Ecografía',4),
  (5,5,CURRENT_DATE-4+TIME'12:00',CURRENT_DATE-4+TIME'13:00','Embarazo',4),
  (6,5,CURRENT_DATE-3+TIME'10:00',CURRENT_DATE-3+TIME'11:00','Planificación',4),
  (7,5,CURRENT_DATE-2+TIME'09:00',CURRENT_DATE-2+TIME'10:00','Primera',4),
  (8,5,CURRENT_DATE-1+TIME'11:00',CURRENT_DATE-1+TIME'12:00','Chequeo',4),
  -- HOY (7 - SIN SOLAPAMIENTO)
  (1,5,CURRENT_DATE+TIME'09:00',CURRENT_DATE+TIME'09:30','Ginecológica',2),
  (2,5,CURRENT_DATE+TIME'09:30',CURRENT_DATE+TIME'10:00','Prenatal',2),
  (3,5,CURRENT_DATE+TIME'10:00',CURRENT_DATE+TIME'10:30','Revisión',3),
  (4,5,CURRENT_DATE+TIME'10:30',CURRENT_DATE+TIME'11:00','Ecografía',2),
  (5,5,CURRENT_DATE+TIME'11:00',CURRENT_DATE+TIME'11:30','Embarazo',2),
  (6,5,CURRENT_DATE+TIME'11:30',CURRENT_DATE+TIME'12:00','Planificación',2),
  (7,5,CURRENT_DATE+TIME'12:00',CURRENT_DATE+TIME'12:30','Primera',2),
  -- FUTURAS (5)
  (4,5,CURRENT_DATE+2+TIME'09:00',CURRENT_DATE+2+TIME'10:00','Ginecológica',1),
  (5,5,CURRENT_DATE+4+TIME'10:00',CURRENT_DATE+4+TIME'11:00','Prenatal',1),
  (6,5,CURRENT_DATE+6+TIME'11:00',CURRENT_DATE+6+TIME'12:00','Revisión',1),
  (7,5,CURRENT_DATE+9+TIME'09:00',CURRENT_DATE+9+TIME'10:00','Ecografía',1),
  (8,5,CURRENT_DATE+11+TIME'12:00',CURRENT_DATE+11+TIME'13:00','Embarazo',1);

-- MÉDICO 6: 10 pasadas, 14 hoy, 10 futuras
INSERT INTO core.citas (paciente_id, medico_id, inicio, fin, motivo, estado_cita_id) VALUES
  -- PASADAS (10)
  (1,6,CURRENT_DATE-10+TIME'08:00',CURRENT_DATE-10+TIME'09:00','Vista',4),
  (2,6,CURRENT_DATE-9+TIME'15:00',CURRENT_DATE-9+TIME'16:00','Lentes',4),
  (3,6,CURRENT_DATE-8+TIME'09:00',CURRENT_DATE-8+TIME'10:00','Glaucoma',4),
  (4,6,CURRENT_DATE-7+TIME'16:00',CURRENT_DATE-7+TIME'17:00','Consulta',4),
  (5,6,CURRENT_DATE-6+TIME'10:00',CURRENT_DATE-6+TIME'11:00','Retina',4),
  (6,6,CURRENT_DATE-5+TIME'15:00',CURRENT_DATE-5+TIME'16:00','Graduación',4),
  (7,6,CURRENT_DATE-4+TIME'08:00',CURRENT_DATE-4+TIME'09:00','Miopía',4),
  (8,6,CURRENT_DATE-3+TIME'17:00',CURRENT_DATE-3+TIME'18:00','Primera',4),
  (1,6,CURRENT_DATE-2+TIME'09:00',CURRENT_DATE-2+TIME'10:00','Chequeo',4),
  (2,6,CURRENT_DATE-1+TIME'16:00',CURRENT_DATE-1+TIME'17:00','Tratamiento',4),
  -- HOY (14)
  (1,6,CURRENT_DATE+TIME'08:00',CURRENT_DATE+TIME'08:30','Vista',2),
  (2,6,CURRENT_DATE+TIME'08:30',CURRENT_DATE+TIME'09:00','Lentes',2),
  (3,6,CURRENT_DATE+TIME'09:00',CURRENT_DATE+TIME'09:30','Glaucoma',3),
  (4,6,CURRENT_DATE+TIME'09:30',CURRENT_DATE+TIME'10:00','Consulta',2),
  (5,6,CURRENT_DATE+TIME'10:00',CURRENT_DATE+TIME'10:30','Retina',2),
  (6,6,CURRENT_DATE+TIME'10:30',CURRENT_DATE+TIME'11:00','Graduación',2),
  (7,6,CURRENT_DATE+TIME'11:00',CURRENT_DATE+TIME'11:30','Miopía',2),
  (8,6,CURRENT_DATE+TIME'11:30',CURRENT_DATE+TIME'12:00','Primera',2),
  (1,6,CURRENT_DATE+TIME'12:00',CURRENT_DATE+TIME'12:30','Chequeo',2),
  (2,6,CURRENT_DATE+TIME'15:00',CURRENT_DATE+TIME'15:30','Tratamiento',2),
  (3,6,CURRENT_DATE+TIME'15:30',CURRENT_DATE+TIME'16:00','Examen',2),
  (4,6,CURRENT_DATE+TIME'16:00',CURRENT_DATE+TIME'16:30','Control',2),
  (5,6,CURRENT_DATE+TIME'16:30',CURRENT_DATE+TIME'17:00','Consulta',2),
  (6,6,CURRENT_DATE+TIME'17:00',CURRENT_DATE+TIME'17:30','Revisión',2),
  -- FUTURAS (10)
  (7,6,CURRENT_DATE+2+TIME'08:00',CURRENT_DATE+2+TIME'09:00','Vista',1),
  (8,6,CURRENT_DATE+3+TIME'15:00',CURRENT_DATE+3+TIME'16:00','Lentes',1),
  (1,6,CURRENT_DATE+4+TIME'09:00',CURRENT_DATE+4+TIME'10:00','Glaucoma',1),
  (2,6,CURRENT_DATE+5+TIME'16:00',CURRENT_DATE+5+TIME'17:00','Consulta',1),
  (3,6,CURRENT_DATE+6+TIME'10:00',CURRENT_DATE+6+TIME'11:00','Retina',1),
  (4,6,CURRENT_DATE+7+TIME'15:00',CURRENT_DATE+7+TIME'16:00','Graduación',1),
  (5,6,CURRENT_DATE+8+TIME'08:00',CURRENT_DATE+8+TIME'09:00','Miopía',1),
  (6,6,CURRENT_DATE+9+TIME'17:00',CURRENT_DATE+9+TIME'18:00','Primera',1),
  (7,6,CURRENT_DATE+10+TIME'09:00',CURRENT_DATE+10+TIME'10:00','Chequeo',1),
  (8,6,CURRENT_DATE+12+TIME'16:00',CURRENT_DATE+12+TIME'17:00','Tratamiento',1);

-- MÉDICO 7: 7 pasadas, 10 hoy, 8 futuras
INSERT INTO core.citas (paciente_id, medico_id, inicio, fin, motivo, estado_cita_id) VALUES
  -- PASADAS (7)
  (1,7,CURRENT_DATE-7+TIME'14:00',CURRENT_DATE-7+TIME'15:00','Rodilla',4),
  (2,7,CURRENT_DATE-6+TIME'18:00',CURRENT_DATE-6+TIME'19:00','Fractura',4),
  (3,7,CURRENT_DATE-5+TIME'15:00',CURRENT_DATE-5+TIME'16:00','Consulta',4),
  (4,7,CURRENT_DATE-4+TIME'16:00',CURRENT_DATE-4+TIME'17:00','Yeso',4),
  (5,7,CURRENT_DATE-3+TIME'17:00',CURRENT_DATE-3+TIME'18:00','Espalda',4),
  (6,7,CURRENT_DATE-2+TIME'14:00',CURRENT_DATE-2+TIME'15:00','Post-op',4),
  (7,7,CURRENT_DATE-1+TIME'19:00',CURRENT_DATE-1+TIME'20:00','Primera',4),
  -- HOY (10)
  (1,7,CURRENT_DATE+TIME'14:00',CURRENT_DATE+TIME'14:30','Rodilla',2),
  (2,7,CURRENT_DATE+TIME'14:30',CURRENT_DATE+TIME'15:00','Fractura',2),
  (3,7,CURRENT_DATE+TIME'15:00',CURRENT_DATE+TIME'15:30','Consulta',3),
  (4,7,CURRENT_DATE+TIME'15:30',CURRENT_DATE+TIME'16:00','Yeso',2),
  (5,7,CURRENT_DATE+TIME'16:00',CURRENT_DATE+TIME'16:30','Espalda',2),
  (6,7,CURRENT_DATE+TIME'16:30',CURRENT_DATE+TIME'17:00','Post-op',2),
  (7,7,CURRENT_DATE+TIME'17:00',CURRENT_DATE+TIME'17:30','Primera',2),
  (8,7,CURRENT_DATE+TIME'17:30',CURRENT_DATE+TIME'18:00','Lesión',2),
  (1,7,CURRENT_DATE+TIME'18:00',CURRENT_DATE+TIME'18:30','Tratamiento',2),
  (2,7,CURRENT_DATE+TIME'18:30',CURRENT_DATE+TIME'19:00','Control',2),
  -- FUTURAS (8)
  (3,7,CURRENT_DATE+2+TIME'14:00',CURRENT_DATE+2+TIME'15:00','Rodilla',1),
  (4,7,CURRENT_DATE+3+TIME'18:00',CURRENT_DATE+3+TIME'19:00','Fractura',1),
  (5,7,CURRENT_DATE+4+TIME'15:00',CURRENT_DATE+4+TIME'16:00','Consulta',1),
  (6,7,CURRENT_DATE+5+TIME'16:00',CURRENT_DATE+5+TIME'17:00','Yeso',1),
  (7,7,CURRENT_DATE+6+TIME'17:00',CURRENT_DATE+6+TIME'18:00','Espalda',1),
  (8,7,CURRENT_DATE+7+TIME'14:00',CURRENT_DATE+7+TIME'15:00','Post-op',1),
  (1,7,CURRENT_DATE+9+TIME'19:00',CURRENT_DATE+9+TIME'20:00','Primera',1),
  (2,7,CURRENT_DATE+11+TIME'15:00',CURRENT_DATE+11+TIME'16:00','Lesión',1);

-- MÉDICO 8: 6 pasadas, 9 hoy, 7 futuras
INSERT INTO core.citas (paciente_id, medico_id, inicio, fin, motivo, estado_cita_id) VALUES
  -- PASADAS (6)
  (1,8,CURRENT_DATE-6+TIME'10:00',CURRENT_DATE-6+TIME'11:00','Psiquiátrica',4),
  (2,8,CURRENT_DATE-5+TIME'16:00',CURRENT_DATE-5+TIME'17:00','Terapia',4),
  (3,8,CURRENT_DATE-4+TIME'11:00',CURRENT_DATE-4+TIME'12:00','Evaluación',4),
  (4,8,CURRENT_DATE-3+TIME'17:00',CURRENT_DATE-3+TIME'18:00','Medicación',4),
  (5,8,CURRENT_DATE-2+TIME'12:00',CURRENT_DATE-2+TIME'13:00','Ansiedad',4),
  (6,8,CURRENT_DATE-1+TIME'18:00',CURRENT_DATE-1+TIME'19:00','Primera',4),
  -- HOY (9)
  (1,8,CURRENT_DATE+TIME'10:00',CURRENT_DATE+TIME'10:30','Psiquiátrica',2),
  (2,8,CURRENT_DATE+TIME'10:30',CURRENT_DATE+TIME'11:00','Terapia',2),
  (3,8,CURRENT_DATE+TIME'11:00',CURRENT_DATE+TIME'11:30','Evaluación',3),
  (4,8,CURRENT_DATE+TIME'11:30',CURRENT_DATE+TIME'12:00','Medicación',2),
  (5,8,CURRENT_DATE+TIME'12:00',CURRENT_DATE+TIME'12:30','Ansiedad',2),
  (6,8,CURRENT_DATE+TIME'16:00',CURRENT_DATE+TIME'16:30','Primera',2),
  (7,8,CURRENT_DATE+TIME'16:30',CURRENT_DATE+TIME'17:00','Cognitiva',2),
  (8,8,CURRENT_DATE+TIME'17:00',CURRENT_DATE+TIME'17:30','Chequeo',2),
  (1,8,CURRENT_DATE+TIME'17:30',CURRENT_DATE+TIME'18:00','Tratamiento',2),
  -- FUTURAS (7)
  (2,8,CURRENT_DATE+2+TIME'10:00',CURRENT_DATE+2+TIME'11:00','Psiquiátrica',1),
  (3,8,CURRENT_DATE+4+TIME'16:00',CURRENT_DATE+4+TIME'17:00','Terapia',1),
  (4,8,CURRENT_DATE+6+TIME'11:00',CURRENT_DATE+6+TIME'12:00','Evaluación',1),
  (5,8,CURRENT_DATE+8+TIME'17:00',CURRENT_DATE+8+TIME'18:00','Medicación',1),
  (6,8,CURRENT_DATE+10+TIME'12:00',CURRENT_DATE+10+TIME'13:00','Ansiedad',1),
  (7,8,CURRENT_DATE+13+TIME'18:00',CURRENT_DATE+13+TIME'19:00','Primera',1),
  (8,8,CURRENT_DATE+15+TIME'11:00',CURRENT_DATE+15+TIME'12:00','Cognitiva',1);

-- ==========================================
-- 8. NOTIFICACIONES
-- ==========================================

-- Notificaciones para MÉDICO 1 (usuario_id=3) - 12 citas HOY
INSERT INTO core.notificaciones (usuario_id, cita_id, tipo, payload, estado) VALUES
  -- Para pacientes
  (13,8,'cita_creada','{"mensaje":"Tu cita con Dr. García (Cardiología) ha sido confirmada para hoy 09:00"}',true),
  (14,9,'cita_creada','{"mensaje":"Tu cita con Dr. García (Cardiología) ha sido confirmada para hoy 09:30"}',true),
  (15,10,'cita_creada','{"mensaje":"Tu cita con Dr. García (Cardiología) ha sido programada para hoy 10:00"}',true),
  (16,11,'cita_creada','{"mensaje":"Tu cita con Dr. García (Cardiología) ha sido confirmada para hoy 10:30"}',true),
  (17,12,'cita_creada','{"mensaje":"Tu cita con Dr. García (Cardiología) ha sido confirmada para hoy 11:00"}',true),
  -- Para médico
  (3,8,'cita_creada','{"mensaje":"Andrés Pérez ha agendado una cita contigo hoy 09:00"}',true),
  (3,9,'cita_creada','{"mensaje":"María González ha agendado una cita contigo hoy 09:30"}',true),
  (3,10,'cita_creada','{"mensaje":"Luis Martínez ha agendado una cita contigo hoy 10:00"}',true),
  (3,11,'cita_creada','{"mensaje":"Carolina López ha agendado una cita contigo hoy 10:30"}',true),
  (3,12,'cita_creada','{"mensaje":"Diego Hernández ha agendado una cita contigo hoy 11:00"}',true);

-- Notificaciones para MÉDICO 2 (usuario_id=4) - 14 citas HOY
INSERT INTO core.notificaciones (usuario_id, cita_id, tipo, payload, estado) VALUES
  -- Para pacientes
  (13,28,'cita_creada','{"mensaje":"Tu cita con Dra. Martínez (Pediatría) ha sido confirmada para hoy 08:00"}',true),
  (14,29,'cita_creada','{"mensaje":"Tu cita con Dra. Martínez (Pediatría) ha sido confirmada para hoy 08:30"}',true),
  (15,30,'cita_creada','{"mensaje":"Tu cita con Dra. Martínez (Pediatría) ha sido programada para hoy 09:00"}',true),
  (16,31,'cita_creada','{"mensaje":"Tu cita con Dra. Martínez (Pediatría) ha sido confirmada para hoy 09:30"}',true),
  (17,32,'cita_creada','{"mensaje":"Tu cita con Dra. Martínez (Pediatría) ha sido confirmada para hoy 10:00"}',true),
  -- Para médico
  (4,28,'cita_creada','{"mensaje":"Andrés Pérez ha agendado una cita contigo hoy 08:00"}',true),
  (4,29,'cita_creada','{"mensaje":"María González ha agendado una cita contigo hoy 08:30"}',true),
  (4,30,'cita_creada','{"mensaje":"Luis Martínez ha agendado una cita contigo hoy 09:00"}',true),
  (4,31,'cita_creada','{"mensaje":"Carolina López ha agendado una cita contigo hoy 09:30"}',true),
  (4,32,'cita_creada','{"mensaje":"Diego Hernández ha agendado una cita contigo hoy 10:00"}',true);

-- Notificaciones para MÉDICO 3 (usuario_id=5) - 13 citas HOY
INSERT INTO core.notificaciones (usuario_id, cita_id, tipo, payload, estado) VALUES
  -- Para pacientes
  (13,43,'cita_creada','{"mensaje":"Tu cita con Dr. Rodríguez (Medicina General) ha sido confirmada para hoy 07:00"}',true),
  (14,44,'cita_creada','{"mensaje":"Tu cita con Dr. Rodríguez (Medicina General) ha sido confirmada para hoy 07:30"}',true),
  (15,45,'cita_creada','{"mensaje":"Tu cita con Dr. Rodríguez (Medicina General) ha sido programada para hoy 08:00"}',true),
  (16,46,'cita_creada','{"mensaje":"Tu cita con Dr. Rodríguez (Medicina General) ha sido confirmada para hoy 08:30"}',true),
  (17,47,'cita_creada','{"mensaje":"Tu cita con Dr. Rodríguez (Medicina General) ha sido confirmada para hoy 09:00"}',true),
  -- Para médico
  (5,43,'cita_creada','{"mensaje":"Andrés Pérez ha agendado una cita contigo hoy 07:00"}',true),
  (5,44,'cita_creada','{"mensaje":"María González ha agendado una cita contigo hoy 07:30"}',true),
  (5,45,'cita_creada','{"mensaje":"Luis Martínez ha agendado una cita contigo hoy 08:00"}',true),
  (5,46,'cita_creada','{"mensaje":"Carolina López ha agendado una cita contigo hoy 08:30"}',true),
  (5,47,'cita_creada','{"mensaje":"Diego Hernández ha agendado una cita contigo hoy 09:00"}',true);

-- Notificaciones para MÉDICO 4 (usuario_id=6) - 8 citas HOY
INSERT INTO core.notificaciones (usuario_id, cita_id, tipo, payload, estado) VALUES
  -- Para pacientes
  (13,62,'cita_creada','{"mensaje":"Tu cita con Dra. López (Dermatología) ha sido confirmada para hoy 10:00"}',true),
  (14,63,'cita_creada','{"mensaje":"Tu cita con Dra. López (Dermatología) ha sido confirmada para hoy 10:30"}',true),
  (15,64,'cita_creada','{"mensaje":"Tu cita con Dra. López (Dermatología) ha sido programada para hoy 11:00"}',true),
  (16,65,'cita_creada','{"mensaje":"Tu cita con Dra. López (Dermatología) ha sido confirmada para hoy 11:30"}',true),
  -- Para médico
  (6,62,'cita_creada','{"mensaje":"Andrés Pérez ha agendado una cita contigo hoy 10:00"}',true),
  (6,63,'cita_creada','{"mensaje":"María González ha agendado una cita contigo hoy 10:30"}',true),
  (6,64,'cita_creada','{"mensaje":"Luis Martínez ha agendado una cita contigo hoy 11:00"}',true),
  (6,65,'cita_creada','{"mensaje":"Carolina López ha agendado una cita contigo hoy 11:30"}',true);

-- Notificaciones para MÉDICO 5 (usuario_id=7) - 7 citas HOY
INSERT INTO core.notificaciones (usuario_id, cita_id, tipo, payload, estado) VALUES
  -- Para pacientes
  (13,79,'cita_creada','{"mensaje":"Tu cita con Dra. Hernández (Ginecología) ha sido confirmada para hoy 09:00"}',true),
  (14,80,'cita_creada','{"mensaje":"Tu cita con Dra. Hernández (Ginecología) ha sido confirmada para hoy 09:30"}',true),
  (15,81,'cita_creada','{"mensaje":"Tu cita con Dra. Hernández (Ginecología) ha sido programada para hoy 10:00"}',true),
  (16,82,'cita_creada','{"mensaje":"Tu cita con Dra. Hernández (Ginecología) ha sido confirmada para hoy 10:30"}',true),
  -- Para médico
  (7,79,'cita_creada','{"mensaje":"Andrés Pérez ha agendado una cita contigo hoy 09:00"}',true),
  (7,80,'cita_creada','{"mensaje":"María González ha agendado una cita contigo hoy 09:30"}',true),
  (7,81,'cita_creada','{"mensaje":"Luis Martínez ha agendado una cita contigo hoy 10:00"}',true),
  (7,82,'cita_creada','{"mensaje":"Carolina López ha agendado una cita contigo hoy 10:30"}',true);

-- Notificaciones para MÉDICO 6 (usuario_id=8) - 14 citas HOY
INSERT INTO core.notificaciones (usuario_id, cita_id, tipo, payload, estado) VALUES
  -- Para pacientes
  (13,92,'cita_creada','{"mensaje":"Tu cita con Dr. Gómez (Oftalmología) ha sido confirmada para hoy 08:00"}',true),
  (14,93,'cita_creada','{"mensaje":"Tu cita con Dr. Gómez (Oftalmología) ha sido confirmada para hoy 08:30"}',true),
  (15,94,'cita_creada','{"mensaje":"Tu cita con Dr. Gómez (Oftalmología) ha sido programada para hoy 09:00"}',true),
  (16,95,'cita_creada','{"mensaje":"Tu cita con Dr. Gómez (Oftalmología) ha sido confirmada para hoy 09:30"}',true),
  (17,96,'cita_creada','{"mensaje":"Tu cita con Dr. Gómez (Oftalmología) ha sido confirmada para hoy 10:00"}',true),
  -- Para médico
  (8,92,'cita_creada','{"mensaje":"Andrés Pérez ha agendado una cita contigo hoy 08:00"}',true),
  (8,93,'cita_creada','{"mensaje":"María González ha agendado una cita contigo hoy 08:30"}',true),
  (8,94,'cita_creada','{"mensaje":"Luis Martínez ha agendado una cita contigo hoy 09:00"}',true),
  (8,95,'cita_creada','{"mensaje":"Carolina López ha agendado una cita contigo hoy 09:30"}',true),
  (8,96,'cita_creada','{"mensaje":"Diego Hernández ha agendado una cita contigo hoy 10:00"}',true);

-- Notificaciones para MÉDICO 7 (usuario_id=9) - 10 citas HOY
INSERT INTO core.notificaciones (usuario_id, cita_id, tipo, payload, estado) VALUES
  -- Para pacientes
  (13,117,'cita_creada','{"mensaje":"Tu cita con Dr. Díaz (Traumatología) ha sido confirmada para hoy 14:00"}',true),
  (14,118,'cita_creada','{"mensaje":"Tu cita con Dr. Díaz (Traumatología) ha sido confirmada para hoy 14:30"}',true),
  (15,119,'cita_creada','{"mensaje":"Tu cita con Dr. Díaz (Traumatología) ha sido programada para hoy 15:00"}',true),
  (16,120,'cita_creada','{"mensaje":"Tu cita con Dr. Díaz (Traumatología) ha sido confirmada para hoy 15:30"}',true),
  (17,121,'cita_creada','{"mensaje":"Tu cita con Dr. Díaz (Traumatología) ha sido confirmada para hoy 16:00"}',true),
  -- Para médico
  (9,117,'cita_creada','{"mensaje":"Andrés Pérez ha agendado una cita contigo hoy 14:00"}',true),
  (9,118,'cita_creada','{"mensaje":"María González ha agendado una cita contigo hoy 14:30"}',true),
  (9,119,'cita_creada','{"mensaje":"Luis Martínez ha agendado una cita contigo hoy 15:00"}',true),
  (9,120,'cita_creada','{"mensaje":"Carolina López ha agendado una cita contigo hoy 15:30"}',true),
  (9,121,'cita_creada','{"mensaje":"Diego Hernández ha agendado una cita contigo hoy 16:00"}',true);

-- Notificaciones para MÉDICO 8 (usuario_id=10) - 9 citas HOY
INSERT INTO core.notificaciones (usuario_id, cita_id, tipo, payload, estado) VALUES
  -- Para pacientes
  (13,134,'cita_creada','{"mensaje":"Tu cita con Dra. Sánchez (Psiquiatría) ha sido confirmada para hoy 10:00"}',true),
  (14,135,'cita_creada','{"mensaje":"Tu cita con Dra. Sánchez (Psiquiatría) ha sido confirmada para hoy 10:30"}',true),
  (15,136,'cita_creada','{"mensaje":"Tu cita con Dra. Sánchez (Psiquiatría) ha sido programada para hoy 11:00"}',true),
  (16,137,'cita_creada','{"mensaje":"Tu cita con Dra. Sánchez (Psiquiatría) ha sido confirmada para hoy 11:30"}',true),
  (17,138,'cita_creada','{"mensaje":"Tu cita con Dra. Sánchez (Psiquiatría) ha sido confirmada para hoy 12:00"}',true),
  -- Para médico
  (10,134,'cita_creada','{"mensaje":"Andrés Pérez ha agendado una cita contigo hoy 10:00"}',true),
  (10,135,'cita_creada','{"mensaje":"María González ha agendado una cita contigo hoy 10:30"}',true),
  (10,136,'cita_creada','{"mensaje":"Luis Martínez ha agendado una cita contigo hoy 11:00"}',true),
  (10,137,'cita_creada','{"mensaje":"Carolina López ha agendado una cita contigo hoy 11:30"}',true),
  (10,138,'cita_creada','{"mensaje":"Diego Hernández ha agendado una cita contigo hoy 12:00"}',true);

-- Notificaciones de recordatorio (algunas citas de hoy)
INSERT INTO core.notificaciones (usuario_id, cita_id, tipo, payload, estado) VALUES
  (13,8,'recordatorio','{"mensaje":"Recuerda que tienes cita hoy a las 09:00 con Dr. García. Llega 10 min antes"}',true),
  (14,29,'recordatorio','{"mensaje":"Recuerda que tienes cita hoy a las 08:30 con Dra. Martínez. Llega 10 min antes"}',true),
  (15,45,'recordatorio','{"mensaje":"Recuerda que tienes cita hoy a las 08:00 con Dr. Rodríguez. Llega 10 min antes"}',true),
  (16,65,'recordatorio','{"mensaje":"Recuerda que tienes cita hoy a las 11:30 con Dra. López. Llega 10 min antes"}',true);

-- Notificaciones de sistema (bienvenida)
INSERT INTO core.notificaciones (usuario_id, tipo, payload, estado) VALUES
  (13,'sistema','{"mensaje":"¡Bienvenido a SRMedica! Gracias por registrarte"}',true),
  (14,'sistema','{"mensaje":"¡Bienvenido a SRMedica! Gracias por registrarte"}',true),
  (3,'sistema','{"mensaje":"Tu cuenta de médico ha sido activada. Configura tus horarios"}',true),
  (4,'sistema','{"mensaje":"Tu cuenta de médico ha sido activada. Configura tus horarios"}',true);

-- ==========================================
-- 9. VERIFICACIÓN
-- ==========================================

SELECT 'USUARIOS CREADOS' as info;

SELECT 
  r.codigo as rol,
  COUNT(*) as cantidad
FROM auth.usuarios u
JOIN auth.usuarios_roles ur ON u.id = ur.usuario_id
JOIN auth.roles r ON ur.rol_id = r.id
GROUP BY r.codigo
ORDER BY r.codigo;

SELECT 'MÉDICOS POR ESTADO' as info;

SELECT 
  CASE WHEN u.estado = true THEN 'Activos' ELSE 'Inactivos' END as estado,
  COUNT(*) as cantidad
FROM auth.usuarios u
JOIN auth.usuarios_roles ur ON u.id = ur.usuario_id
JOIN auth.roles r ON ur.rol_id = r.id
WHERE r.codigo = 'medico'
GROUP BY u.estado;

SELECT 'PACIENTES POR VERIFICACIÓN' as info;

SELECT 
  CASE WHEN u.email_confirmado = true THEN 'Verificados' ELSE 'Sin Verificar' END as estado,
  COUNT(*) as cantidad
FROM auth.usuarios u
JOIN auth.usuarios_roles ur ON u.id = ur.usuario_id
JOIN auth.roles r ON ur.rol_id = r.id
WHERE r.codigo = 'paciente'
GROUP BY u.email_confirmado;

SELECT 'MÉDICOS CON ESPECIALIDADES' as info;

SELECT 
  m.id,
  u.email,
  m.primer_nombre || ' ' || m.primer_apellido as nombre,
  STRING_AGG(e.nombre, ', ') as especialidades
FROM core.medicos m
JOIN auth.usuarios u ON m.usuario_id = u.id
LEFT JOIN core.medicos_especialidades me ON m.id = me.medico_id
LEFT JOIN cat.especialidades e ON me.especialidad_id = e.id
GROUP BY m.id, u.email, m.primer_nombre, m.primer_apellido
ORDER BY m.id;

SELECT '=== RESUMEN ===' as info;
SELECT 'Horarios' as tipo, COUNT(*)::TEXT as cantidad FROM core.horarios_medicos
UNION ALL SELECT 'Citas', COUNT(*)::TEXT FROM core.citas
UNION ALL SELECT 'Notificaciones', COUNT(*)::TEXT FROM core.notificaciones;

COMMIT;


-- ==========================================
-- CREDENCIALES DE ACCESO
-- ==========================================

/*
✅ ADMINISTRADORES (2):
   admin@srmedica.com / Admin123!
   admin2@srmedica.com / Admin123!

✅ MÉDICOS ACTIVOS (8):
   dr.garcia@srmedica.com / Medico123! (Cardiología)
   dra.martinez@srmedica.com / Medico123! (Pediatría)
   dr.rodriguez@srmedica.com / Medico123! (Medicina General)
   dra.lopez@srmedica.com / Medico123! (Dermatología)
   dra.hernandez@srmedica.com / Medico123! (Ginecología + Medicina Familiar)
   dr.gomez@srmedica.com / Medico123! (Oftalmología)
   dr.diaz@srmedica.com / Medico123! (Traumatología)
   dra.sanchez@srmedica.com / Medico123! (Psiquiatría + Psicología Clínica)

⏳ MÉDICOS INACTIVOS (2) - Para activar desde admin:
   dr.torres@srmedica.com / Medico123! (Neurología)
   dra.ramirez@srmedica.com / Medico123! (Endocrinología)

✅ PACIENTES VERIFICADOS (8):
   paciente1@gmail.com / Paciente123!
   paciente2@gmail.com / Paciente123!
   paciente3@gmail.com / Paciente123!
   paciente4@gmail.com / Paciente123!
   paciente5@gmail.com / Paciente123!
   paciente6@gmail.com / Paciente123!
   paciente7@gmail.com / Paciente123!
   paciente8@gmail.com / Paciente123!

⏳ PACIENTES SIN VERIFICAR (2) - Para verificar desde admin:
   paciente9@gmail.com / Paciente123!
   paciente10@gmail.com / Paciente123!

TOTAL: 22 usuarios de prueba
NOTA: Algunos médicos tienen múltiples especialidades
*/
