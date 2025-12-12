# Módulo de Autenticación

## Descripción
Maneja toda la lógica de autenticación, registro, verificación de email y gestión de sesiones.

## Características

### ✅ Registro de Usuarios
- Registro de pacientes, médicos y administradores
- Hash de contraseñas con bcrypt
- Verificación de email para pacientes
- Activación manual para médicos y administradores

### ✅ Autenticación
- Login con email y contraseña
- Tokens JWT para access (15 min)
- Refresh tokens opacos con rotación automática (15 días)
- Revocación de sesiones

### ✅ Recuperación de Contraseña
- Solicitud de recuperación por email
- Tokens de un solo uso con expiración (1 hora)
- Cambio de contraseña con revocación de sesiones

### ✅ Gestión de Sesiones
- Sesiones con session_key único
- Refresh token rotation
- Revocación individual y masiva

## Endpoints Principales

### POST `/auth/register`
Registra un nuevo usuario (paciente, médico o administrador)

### POST `/auth/login`
Inicia sesión y retorna access + refresh token

### POST `/auth/refresh`
Renueva el access token usando el refresh token

### POST `/auth/logout`
Cierra sesión y revoca el refresh token

### POST `/auth/recover/init`
Inicia el proceso de recuperación de contraseña

### POST `/auth/recover/finish`
Completa la recuperación con el token recibido por email

### POST `/auth/verify-email`
Verifica el email del usuario con el token enviado

## Modelos

- **Usuario**: Datos base del usuario
- **Sesion**: Sesiones activas con refresh tokens
- **AuthToken**: Tokens efímeros (verify_email, reset_password)

## Seguridad

- ✅ Passwords hasheados con bcrypt (10 rounds)
- ✅ JWT con expiración corta (15 min)
- ✅ Refresh tokens opacos con rotación
- ✅ Tokens de un solo uso para operaciones sensibles
- ✅ Security stamp para invalidar sesiones
- ✅ Rate limiting en endpoints críticos

## Flujos

### Registro de Paciente
1. POST `/auth/register` con rol `paciente`
2. Se envía email de verificación
3. Usuario hace clic en link del email
4. POST `/auth/verify-email` con token
5. Cuenta activada

### Registro de Médico/Admin
1. POST `/auth/register` con rol `medico` o `administrador`
2. Admin activa la cuenta manualmente
3. POST `/auth/activate` (solo admin)
4. Usuario puede hacer login

### Login
1. POST `/auth/login` con email/password
2. Retorna `{ access, refresh, user }`
3. Cliente guarda tokens
4. Usa access token en header `Authorization: Bearer {token}`

### Refresh
1. Access token expira (15 min)
2. POST `/auth/refresh` con refresh token
3. Retorna nuevo par de tokens
4. Refresh anterior se revoca automáticamente
