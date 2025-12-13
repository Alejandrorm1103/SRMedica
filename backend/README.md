# SRMedica Backend

API REST para el sistema de gestión médica SR Medica, construida con **Fastify**, **TypeScript**, **Prisma ORM** y **PostgreSQL**.

---

## 🚀 Inicio Rápido

### **Requisitos**
- Node.js 20+
- PostgreSQL 14+

### **Instalación**

```bash
# 1. Clonar variables de entorno
cp .env.example .env

# 2. Configurar DATABASE_URL en .env
# DATABASE_URL=postgres://usuario:password@localhost:5432/srmedica_db

# 3. Instalar dependencias
npm install

# 4. Ejecutar migraciones de Prisma
npx prisma migrate dev

# 5. Iniciar servidor de desarrollo
npm run dev
```

La API corre en `http://localhost:3000` y la documentación Swagger en `/docs`.

---

---

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo con hot-reload
npm run build    # Compilar TypeScript a JavaScript
npm start        # Ejecutar servidor en producción
npm run lint     # Ejecutar linter
npm test         # Ejecutar tests
```

---

## 🔧 Configuración

Asegúrate de configurar las siguientes variables en tu archivo `.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://usuario:password@localhost:5432/srmedica_db
JWT_SECRET=tu_secreto_super_seguro

# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
FRONTEND_URL=http://localhost:5173
```

---

## 📦 Tecnologías Principales

- **[Fastify](https://fastify.dev/)** - Framework web de alto rendimiento
- **[Prisma](https://www.prisma.io/)** - ORM moderno para TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional
- **[Resend](https://resend.com/)** - Servicio de emails transaccionales
- **[Zod](https://zod.dev/)** - Validación de esquemas TypeScript-first

---

## 📖 API Documentation

Una vez que el servidor esté corriendo, visita:

- **Swagger UI:** `http://localhost:3000/docs`
- **OpenAPI JSON:** `http://localhost:3000/docs/json`

---

## 🏗️ Arquitectura

### **Módulos Activos**
- **auth** - Autenticación y gestión de sesiones
- **users** - Gestión de usuarios
- **doctors** - Gestión de médicos
- **patients** - Gestión de pacientes
- **administrators** - Gestión de administradores
- **appointments** - Gestión de citas y horarios
- **notifications** - Sistema de notificaciones
- **stats** - Estadísticas del sistema
- **health** - Health checks

---

## 🎯 Estado del Proyecto

- ✅ Build funcional
- ✅ Autenticación con JWT
- ✅ Sistema de emails con Resend
- ✅ Validación con Zod
- ✅ Seguridad con Helmet y Rate Limiting
- ✅ Documentación Swagger

---

**Desarrollado para SR Medica** 🏥

