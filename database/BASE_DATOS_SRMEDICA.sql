-- ==========================================
-- CREACIÓN DE BASE DE DATOS: SRMedica V2
-- Versión optimizada con solo tablas actualmente en uso
-- ==========================================

-- 1) Base de datos
CREATE DATABASE srmedica_db
  WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_CO.UTF-8'
    LC_CTYPE = 'es_CO.UTF-8'
    TEMPLATE = template0;

-- 2) Usuario de aplicación
CREATE ROLE srmedica_app LOGIN PASSWORD 'Cambia_Esta_Contraseña_Segura!';

-- 3) Permiso de conexión
GRANT CONNECT ON DATABASE srmedica_db TO srmedica_app;

-- 4) Definir search_path por defecto
ALTER DATABASE srmedica_db SET search_path = auth, cat, core, public;


-----------------------------------------------------------------------------------------------------------------------------------------------------------


/* ============================================================
   PREPARACIÓN GENERAL
   ============================================================ */
-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Creación de esquemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS cat;
CREATE SCHEMA IF NOT EXISTS core;


/* ============================================================
   PRIVILEGIOS PARA EL ROL DE APLICACIÓN
   ============================================================ */

-- Dar uso de esquemas al rol
GRANT USAGE ON SCHEMA auth, cat, core TO srmedica_app;

-- Privilegios por defecto para tablas y secuencias futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA auth, cat, core
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO srmedica_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth, cat, core
GRANT USAGE, SELECT ON SEQUENCES TO srmedica_app;

-- Search path por rol
ALTER ROLE srmedica_app IN DATABASE srmedica_db
SET search_path = auth, cat, core, public;


/* ============================================================
   1) ESQUEMA AUTH - Autenticación y Autorización
   ============================================================ */

-- ---------- auth.usuarios ----------
DROP TABLE IF EXISTS auth.usuarios CASCADE;
CREATE TABLE auth.usuarios (
  id                      BIGSERIAL PRIMARY KEY,
  username                VARCHAR(256),
  normalized_username     VARCHAR(256),
  email                   CITEXT NOT NULL,
  email_confirmado        BOOLEAN NOT NULL DEFAULT FALSE,
  telefono                VARCHAR(30),
  telefono_confirmado     BOOLEAN NOT NULL DEFAULT FALSE,
  password_hash           TEXT NOT NULL,
  security_stamp          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  concurrency_stamp       TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  two_factor_habilitado   BOOLEAN NOT NULL DEFAULT FALSE,
  lockout_habilitado      BOOLEAN NOT NULL DEFAULT FALSE,
  lockout_fin             TIMESTAMPTZ,
  intentos_fallidos       INTEGER NOT NULL DEFAULT 0,
  estado                  BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_auth_usuarios_email UNIQUE (email),
  CONSTRAINT uq_auth_usuarios_username UNIQUE (username)
);

CREATE INDEX IF NOT EXISTS idx_auth_usuarios_email ON auth.usuarios (email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_usuarios_normalized_username ON auth.usuarios (normalized_username);

-- Funciones y triggers de normalización
CREATE OR REPLACE FUNCTION auth.fn_sync_normalizados()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.normalized_username := CASE WHEN NEW.username IS NOT NULL THEN UPPER(NEW.username) ELSE NULL END;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION auth.fn_touch_fecha_actualizacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.fecha_actualizacion := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_normalizados_ins ON auth.usuarios;
DROP TRIGGER IF EXISTS trg_sync_normalizados_upd ON auth.usuarios;
DROP TRIGGER IF EXISTS trg_touch_updated_at ON auth.usuarios;

CREATE TRIGGER trg_sync_normalizados_ins
BEFORE INSERT ON auth.usuarios
FOR EACH ROW EXECUTE FUNCTION auth.fn_sync_normalizados();

CREATE TRIGGER trg_sync_normalizados_upd
BEFORE UPDATE OF username ON auth.usuarios
FOR EACH ROW EXECUTE FUNCTION auth.fn_sync_normalizados();

CREATE TRIGGER trg_touch_updated_at
BEFORE UPDATE ON auth.usuarios
FOR EACH ROW EXECUTE FUNCTION auth.fn_touch_fecha_actualizacion();

-- ---------- auth.roles ----------
CREATE TABLE IF NOT EXISTS auth.roles (
  id                  BIGSERIAL PRIMARY KEY,
  codigo              VARCHAR(50) NOT NULL UNIQUE,
  nombre              VARCHAR(100) NOT NULL,
  descripcion         TEXT,
  estado              BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- auth.usuarios_roles ----------
CREATE TABLE IF NOT EXISTS auth.usuarios_roles (
  usuario_id          BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  rol_id              BIGINT NOT NULL REFERENCES auth.roles(id) ON DELETE RESTRICT,
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, rol_id)
);

-- ---------- auth.sesiones ----------
CREATE TABLE IF NOT EXISTS auth.sesiones (
  id                  BIGSERIAL PRIMARY KEY,
  usuario_id          BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  refresh_hash        TEXT NOT NULL,
  ip                  INET,
  user_agent          TEXT,
  expira_en           TIMESTAMPTZ NOT NULL,
  revocada            BOOLEAN NOT NULL DEFAULT FALSE,
  session_key         TEXT,
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sesiones_usuario ON auth.sesiones (usuario_id);

-- ---------- auth.auth_tokens ----------
CREATE TABLE IF NOT EXISTS auth.auth_tokens (
  id             BIGSERIAL PRIMARY KEY,
  usuario_id     BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  tipo           VARCHAR(40) NOT NULL,
  token_key      TEXT NOT NULL,
  token_hash     TEXT NOT NULL,
  expira_en      TIMESTAMPTZ NOT NULL,
  usado          BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


/* ============================================================
   2) ESQUEMA CAT - Catálogos y Parámetricas
   ============================================================ */

CREATE TABLE IF NOT EXISTS cat.tipos_documentos (
  id                    BIGSERIAL PRIMARY KEY,
  codigo                VARCHAR(20) NOT NULL UNIQUE,
  nombre                VARCHAR(80) NOT NULL,
  descripcion           TEXT,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat.sexos (
  id                    BIGSERIAL PRIMARY KEY,
  codigo                VARCHAR(20) NOT NULL UNIQUE,
  nombre                VARCHAR(60) NOT NULL,
  descripcion           TEXT,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat.especialidades (
  id                    BIGSERIAL PRIMARY KEY,
  codigo                VARCHAR(50) NOT NULL UNIQUE,
  nombre                VARCHAR(150) NOT NULL,
  descripcion           TEXT,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat.estados_citas (
  id                    BIGSERIAL PRIMARY KEY,
  codigo                VARCHAR(50) NOT NULL UNIQUE,
  nombre                VARCHAR(120) NOT NULL,
  descripcion           TEXT,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat.motivos_cancelaciones_citas (
  id                    BIGSERIAL PRIMARY KEY,
  codigo                VARCHAR(50) NOT NULL UNIQUE,
  nombre                VARCHAR(200) NOT NULL,
  descripcion           TEXT,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat.canales_notificaciones (
  id                    BIGSERIAL PRIMARY KEY,
  codigo                VARCHAR(50) NOT NULL UNIQUE,
  nombre                VARCHAR(120) NOT NULL,
  descripcion           TEXT,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


/* ============================================================
   3) ESQUEMA CORE - Entidades Principales
   ============================================================ */

-- ---------- core.pacientes ----------
CREATE TABLE IF NOT EXISTS core.pacientes (
  id                    BIGSERIAL PRIMARY KEY,
  usuario_id            BIGINT NOT NULL UNIQUE REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  tipo_documento_id     BIGINT REFERENCES cat.tipos_documentos(id),
  numero_documento      VARCHAR(50),
  primer_nombre         VARCHAR(60) NOT NULL,
  segundo_nombre        VARCHAR(60),
  primer_apellido       VARCHAR(60) NOT NULL,
  segundo_apellido      VARCHAR(60),
  fecha_nacimiento      DATE,
  sexo_id               BIGINT REFERENCES cat.sexos(id),
  direccion_linea1      VARCHAR(150),
  direccion_linea2      VARCHAR(150),
  ciudad                VARCHAR(100),
  departamento          VARCHAR(100),
  pais                  VARCHAR(100),
  codigo_postal         VARCHAR(20),
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON core.pacientes (tipo_documento_id, numero_documento);

-- ---------- core.medicos ----------
CREATE TABLE IF NOT EXISTS core.medicos (
  id                    BIGSERIAL PRIMARY KEY,
  usuario_id            BIGINT NOT NULL UNIQUE REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  tipo_documento_id     BIGINT REFERENCES cat.tipos_documentos(id),
  numero_documento      VARCHAR(50),
  primer_nombre         VARCHAR(60) NOT NULL,
  segundo_nombre        VARCHAR(60),
  primer_apellido       VARCHAR(60) NOT NULL,
  segundo_apellido      VARCHAR(60),
  fecha_nacimiento      DATE,
  sexo_id               BIGINT REFERENCES cat.sexos(id),
  direccion_linea1      VARCHAR(150),
  direccion_linea2      VARCHAR(150),
  ciudad                VARCHAR(100),
  departamento          VARCHAR(100),
  pais                  VARCHAR(100),
  codigo_postal         VARCHAR(20),
  registro_profesional  VARCHAR(80) NOT NULL,
  resumen_perfil        TEXT,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medicos_documento ON core.medicos (tipo_documento_id, numero_documento);
ALTER TABLE core.medicos ADD CONSTRAINT uq_medicos_registro_profesional UNIQUE (registro_profesional);

-- ---------- core.administradores ----------
CREATE TABLE IF NOT EXISTS core.administradores (
  id                    BIGSERIAL PRIMARY KEY,
  usuario_id            BIGINT NOT NULL UNIQUE REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  tipo_documento_id     BIGINT REFERENCES cat.tipos_documentos(id),
  numero_documento      VARCHAR(50),
  primer_nombre         VARCHAR(60) NOT NULL,
  segundo_nombre        VARCHAR(60),
  primer_apellido       VARCHAR(60) NOT NULL,
  segundo_apellido      VARCHAR(60),
  fecha_nacimiento      DATE,
  sexo_id               BIGINT REFERENCES cat.sexos(id),
  direccion_linea1      VARCHAR(150),
  direccion_linea2      VARCHAR(150),
  ciudad                VARCHAR(100),
  departamento          VARCHAR(100),
  pais                  VARCHAR(100),
  codigo_postal         VARCHAR(20),
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_administradores_documento ON core.administradores (tipo_documento_id, numero_documento);

-- ---------- core.medicos_especialidades ----------
CREATE TABLE IF NOT EXISTS core.medicos_especialidades (
  medico_id             BIGINT NOT NULL REFERENCES core.medicos(id) ON DELETE CASCADE,
  especialidad_id       BIGINT NOT NULL REFERENCES cat.especialidades(id) ON DELETE RESTRICT,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (medico_id, especialidad_id)
);

-- ---------- core.horarios_medicos ----------
DROP TABLE IF EXISTS core.horarios_medicos CASCADE;
CREATE TABLE core.horarios_medicos (
  id                  BIGSERIAL PRIMARY KEY,
  medico_id           BIGINT NOT NULL REFERENCES core.medicos(id) ON DELETE CASCADE,
  dia_semana          SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio         TIME NOT NULL,
  hora_fin            TIME NOT NULL,
  estado              BOOLEAN DEFAULT TRUE,
  fecha_creacion      TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  CHECK (hora_inicio < hora_fin),
  UNIQUE (medico_id, dia_semana, hora_inicio, hora_fin)
);
CREATE INDEX idx_horarios_medico ON core.horarios_medicos (medico_id, dia_semana);

-- ---------- core.citas ----------
CREATE TABLE IF NOT EXISTS core.citas (
  id                       BIGSERIAL PRIMARY KEY,
  paciente_id              BIGINT NOT NULL REFERENCES core.pacientes(id) ON DELETE RESTRICT,
  medico_id                BIGINT NOT NULL REFERENCES core.medicos(id) ON DELETE RESTRICT,
  estado_cita_id           BIGINT NOT NULL REFERENCES cat.estados_citas(id) ON DELETE RESTRICT,
  inicio                   TIMESTAMPTZ NOT NULL,
  fin                      TIMESTAMPTZ NOT NULL,
  enlace_video             TEXT,
  motivo                   TEXT,
  motivo_cancelacion_id    BIGINT REFERENCES cat.motivos_cancelaciones_citas(id) ON DELETE RESTRICT,
  cancelada_por_usuario_id BIGINT REFERENCES auth.usuarios(id) ON DELETE SET NULL,
  estado                   BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (fin > inicio),
  fecha_creacion           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT citas_medico_no_solape
  EXCLUDE USING gist (
    medico_id WITH =,
    tstzrange(inicio, fin) WITH &&
  )
);

CREATE INDEX IF NOT EXISTS idx_citas_medico_inicio ON core.citas (medico_id, inicio);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_inicio ON core.citas (paciente_id, inicio);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON core.citas (estado_cita_id);

-- ---------- core.historiales_citas ----------
CREATE TABLE IF NOT EXISTS core.historiales_citas (
  id                       BIGSERIAL PRIMARY KEY,
  cita_id                  BIGINT NOT NULL REFERENCES core.citas(id) ON DELETE CASCADE,
  estado_anterior_id       BIGINT REFERENCES cat.estados_citas(id),
  estado_nuevo_id          BIGINT NOT NULL REFERENCES cat.estados_citas(id),
  cambiado_por_usuario_id  BIGINT NOT NULL REFERENCES auth.usuarios(id),
  motivo                   TEXT,
  estado                   BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_historiales_citas_cita ON core.historiales_citas (cita_id, fecha_creacion DESC);

-- ---------- core.notificaciones ----------
CREATE TABLE IF NOT EXISTS core.notificaciones (
  id                    BIGSERIAL PRIMARY KEY,
  usuario_id            BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  cita_id               BIGINT REFERENCES core.citas(id) ON DELETE CASCADE,
  tipo                  VARCHAR(80) NOT NULL,
  payload               JSONB,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_usuario ON core.notificaciones (usuario_id, fecha_creacion DESC);

-- ---------- core.envios_notificaciones ----------
CREATE TABLE IF NOT EXISTS core.envios_notificaciones (
  id                        BIGSERIAL PRIMARY KEY,
  notificacion_id           BIGINT NOT NULL REFERENCES core.notificaciones(id) ON DELETE CASCADE,
  canal_id                  BIGINT NOT NULL REFERENCES cat.canales_notificaciones(id) ON DELETE RESTRICT,
  destinatario_usuario_id   BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE RESTRICT,
  estado_envio              VARCHAR(30) NOT NULL CHECK (estado_envio IN ('pendiente','enviado','entregado','fallido')),
  intentos                  SMALLINT NOT NULL DEFAULT 0 CHECK (intentos >= 0),
  ultimo_error              TEXT,
  estado                    BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_envios_dest ON core.envios_notificaciones (destinatario_usuario_id, estado_envio);

-- ---------- core.preferencias_notificaciones ----------
CREATE TABLE IF NOT EXISTS core.preferencias_notificaciones (
  id                    BIGSERIAL PRIMARY KEY,
  usuario_id            BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  canal_id              BIGINT NOT NULL REFERENCES cat.canales_notificaciones(id) ON DELETE RESTRICT,
  habilitado            BOOLEAN NOT NULL DEFAULT TRUE,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, canal_id)
);

-- ---------- core.aceptaciones_politicas ----------
CREATE TABLE IF NOT EXISTS core.aceptaciones_politicas (
  id                    BIGSERIAL PRIMARY KEY,
  usuario_id            BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  codigo_politica       VARCHAR(60) NOT NULL,
  version               VARCHAR(40) NOT NULL,
  aceptado              BOOLEAN NOT NULL DEFAULT TRUE,
  ip                    INET,
  user_agent            TEXT,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, codigo_politica, version)
);

-- ---------- core.auditorias ----------
CREATE TABLE IF NOT EXISTS core.auditorias (
  id                    BIGSERIAL PRIMARY KEY,
  usuario_id            BIGINT REFERENCES auth.usuarios(id) ON DELETE SET NULL,
  entidad               VARCHAR(120) NOT NULL,
  entidad_id            BIGINT,
  accion                VARCHAR(30) NOT NULL,
  dif_json              JSONB,
  ip                    INET,
  user_agent            TEXT,
  estado                BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aud_entidad ON core.auditorias (entidad, entidad_id);


/* ============================================================
   4) FUNCIONES Y TRIGGERS GLOBALES
   ============================================================ */

-- Función global para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION public.fn_touch_fecha_actualizacion()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.fecha_actualizacion := NOW();
  RETURN NEW;
END $$;

-- Aplicar trigger de updated_at a todas las tablas
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT 'auth.roles' tbl UNION ALL
    SELECT 'auth.usuarios_roles' UNION ALL
    SELECT 'auth.sesiones' UNION ALL
    SELECT 'cat.especialidades' UNION ALL
    SELECT 'cat.estados_citas' UNION ALL
    SELECT 'cat.canales_notificaciones' UNION ALL
    SELECT 'cat.motivos_cancelaciones_citas' UNION ALL
    SELECT 'cat.tipos_documentos' UNION ALL
    SELECT 'cat.sexos' UNION ALL
    SELECT 'core.pacientes' UNION ALL
    SELECT 'core.medicos' UNION ALL
    SELECT 'core.administradores' UNION ALL
    SELECT 'core.medicos_especialidades' UNION ALL
    SELECT 'core.horarios_medicos' UNION ALL
    SELECT 'core.citas' UNION ALL
    SELECT 'core.historiales_citas' UNION ALL
    SELECT 'core.notificaciones' UNION ALL
    SELECT 'core.envios_notificaciones' UNION ALL
    SELECT 'core.preferencias_notificaciones' UNION ALL
    SELECT 'core.auditorias' UNION ALL
    SELECT 'core.aceptaciones_politicas'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_touch_updated_at ON %s;', r.tbl);
    EXECUTE format('CREATE TRIGGER trg_touch_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_actualizacion();', r.tbl);
  END LOOP;
END $$;



/* ============================================================
   POBLACIÓN DE CATÁLOGOS BASE
   ============================================================ */
BEGIN;

-- Roles base del sistema
INSERT INTO auth.roles (codigo, nombre, descripcion) VALUES
  ('paciente', 'Paciente', 'Rol de paciente que agenda y asiste a citas.'),
  ('medico', 'Médico', 'Rol de médico que atiende citas y carga notas.'),
  ('administrador', 'Administrador', 'Gestión operativa: usuarios, catálogos, etc.')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- CAT.TIPOS_DOCUMENTOS
-- ============================================================
INSERT INTO cat.tipos_documentos (codigo, nombre, descripcion) VALUES
  ('cc', 'Cédula de ciudadanía', 'Documento nacional de identificación (CO).'),
  ('ce', 'Cédula de extranjería', 'Identificación para extranjeros (CO).'),
  ('ti', 'Tarjeta de identidad', 'Menores de edad (CO).'),
  ('pt', 'Pasaporte', 'Documento de viaje.'),
  ('nit', 'NIT', 'Número de identificación tributaria.')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- CAT.SEXOS
-- ============================================================
INSERT INTO cat.sexos (codigo, nombre, descripcion) VALUES
  ('f', 'Femenino', 'Persona de sexo femenino.'),
  ('m', 'Masculino', 'Persona de sexo masculino.'),
  ('x', 'No binario', 'Persona no binaria.'),
  ('nd', 'No declara', 'Prefiere no declarar.')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- CAT.ESPECIALIDADES
-- ============================================================
INSERT INTO cat.especialidades (codigo, nombre, descripcion) VALUES
  ('medicina_general', 'Medicina General', 'Atención primaria y orientación general.'),
  ('pediatria', 'Pediatría', 'Salud de niños y adolescentes.'),
  ('ginecologia_obstetricia','Ginecología y Obstetricia','Salud sexual y reproductiva.'),
  ('medicina_interna', 'Medicina Interna', 'Atención integral del adulto.'),
  ('cardiologia', 'Cardiología', 'Sistema cardiovascular.'),
  ('dermatologia', 'Dermatología', 'Piel, cabello y uñas.'),
  ('neurologia', 'Neurología', 'Sistema nervioso.'),
  ('psiquiatria', 'Psiquiatría', 'Salud mental.'),
  ('psicologia_clinica', 'Psicología Clínica', 'Intervención psicológica.'),
  ('otorrinolaringologia', 'Otorrinolaringología', 'Oído, nariz y garganta.'),
  ('oftalmologia', 'Oftalmología', 'Salud visual.'),
  ('endocrinologia', 'Endocrinología', 'Trastornos hormonales.'),
  ('gastroenterologia', 'Gastroenterología', 'Sistema digestivo.'),
  ('neumologia', 'Neumología', 'Sistema respiratorio.'),
  ('reumatologia', 'Reumatología', 'Trastornos reumáticos.'),
  ('urologia', 'Urología', 'Sistema urinario y masculino.'),
  ('traumatologia', 'Traumatología', 'Lesiones músculo-esqueléticas.'),
  ('nutricion', 'Nutrición', 'Asesoría nutricional.'),
  ('fisioterapia', 'Fisioterapia', 'Rehabilitación física.'),
  ('medicina_familiar', 'Medicina Familiar', 'Atención integral de familias.')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- CAT.ESTADOS_CITAS
-- ============================================================
-- Estados pensados para telemedicina (video/chat)
INSERT INTO cat.estados_citas (codigo, nombre, descripcion) VALUES
  ('programada', 'Programada', 'Cita creada con horario asignado.'),
  ('confirmada', 'Confirmada', 'Confirmada por paciente y/o médico.'),
  ('en_curso', 'En curso', 'Atención iniciada (videollamada/chat).'),
  ('completada', 'Completada', 'Atención finalizada correctamente.'),
  ('reprogramada', 'Reprogramada', 'Cita movida a otra fecha/hora.'),
  ('cancelada_paciente', 'Cancelada por paciente','Cancelación iniciada por el paciente.'),
  ('cancelada_medico', 'Cancelada por médico','Cancelación iniciada por el médico.'),
  ('no_asistio', 'No asistió', 'Paciente no ingresó a la sesión.')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- CAT.CANALES_NOTIFICACIONES
-- ============================================================
INSERT INTO cat.canales_notificaciones (codigo, nombre, descripcion) VALUES
  ('email', 'Correo electrónico', 'Notificaciones vía email.'),
  ('sms', 'SMS', 'Mensajes de texto al móvil.'),
  ('in_app', 'In-App', 'Notificaciones dentro de la aplicación.'),
  ('whatsapp','WhatsApp', 'Mensajes a través de WhatsApp.')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- CAT.MOTIVOS_CANCELACIONES_CITAS
-- ============================================================
INSERT INTO cat.motivos_cancelaciones_citas (codigo, nombre, descripcion) VALUES
  ('paciente_cancela', 'Cancelado por el Paciente', 'El paciente solicitó cancelar (Fix Code)'),
  ('paciente_no_puede', 'Paciente no puede asistir', 'Indisponibilidad o cambio de planes del paciente.'),
  ('medico_no_disponible', 'Médico no disponible', 'Imprevistos o agenda del médico.'),
  ('problemas_tecnicos', 'Problemas técnicos', 'Falla de conexión, audio o video.'),
  ('emergencia', 'Emergencia', 'Evento de fuerza mayor.'),
  ('reprogramacion', 'Reprogramación solicitada', 'Cambio coordinado a otra fecha/hora.'),
  ('duplicado', 'Cita duplicada', 'Registro repetido por error.')
ON CONFLICT (codigo) DO NOTHING;

COMMIT;


/* ============================================================
   5) PERMISOS FINALES
   ============================================================ */


-- Otorgar permisos en tablas existentes
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, cat, core TO srmedica_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth, cat, core TO srmedica_app;


/* ============================================================
   FIN DEL SCRIPT
   ============================================================ */

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Base de datos SRMedica V2 creada exitosamente';
  RAISE NOTICE 'Tablas activas: 23';
  RAISE NOTICE 'Esquemas: auth, cat, core';
END $$;
