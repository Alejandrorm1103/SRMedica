# SRMedica Frontend

Interfaz de usuario moderna para el sistema de gestión médica SR Medica, construida con **React**, **TypeScript**, **Vite** y **TailwindCSS**.

---

## 🚀 Inicio Rápido

### **Requisitos**
- Node.js 20+
- Backend de SRMedica corriendo en `http://localhost:3000`

### **Instalación**

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
echo "VITE_API_URL=http://localhost:3000" > .env

# 3. Iniciar servidor de desarrollo
npm run dev
```

La aplicación corre en `http://localhost:5173`

---

## 📚 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes UI base (shadcn/ui)
│   ├── Admin*.tsx      # Componentes de administrador
│   ├── Doctor*.tsx     # Componentes de médico
│   ├── Patient*.tsx    # Componentes de paciente
│   └── ...
├── services/           # Servicios API
│   ├── api.ts         # Cliente Axios configurado
│   ├── auth.service.ts
│   ├── appointments.service.ts
│   └── ...
├── context/           # Contextos React
│   └── AuthContext.tsx
├── constants/         # Constantes y catálogos
└── config/           # Configuración
```

---

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo con hot-reload
npm run build    # Build de producción
npm run preview  # Preview del build de producción
npm run lint     # Ejecutar linter
```

---

## 🎨 Características

### **Sistema de Autenticación**
- ✅ Login unificado con selector de rol
- ✅ Registro unificado (Paciente/Médico/Administrador)
- ✅ Verificación de email para pacientes
- ✅ Activación manual para médicos
- ✅ Recuperación de contraseña

### **Panel de Administrador**
- ✅ Dashboard con estadísticas
- ✅ Gestión de usuarios (médicos y pacientes)
- ✅ Activación de médicos pendientes
- ✅ Gestión de citas

### **Panel de Médico**
- ✅ Dashboard con citas del día
- ✅ Gestión de horarios de disponibilidad
- ✅ Gestión de citas (confirmar, completar, cancelar)
- ✅ Sistema de notificaciones
- ✅ Perfil profesional

### **Panel de Paciente**
- ✅ Búsqueda de médicos por especialidad
- ✅ Visualización de disponibilidad en tiempo real
- ✅ Agendamiento de citas
- ✅ Gestión de citas (reprogramar, cancelar)
- ✅ Sistema de notificaciones
- ✅ Perfil personal

---

## 📦 Tecnologías Principales

- **[React 18](https://react.dev/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Vite](https://vitejs.dev/)** - Build tool ultra-rápido
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI accesibles
- **[React Router](https://reactrouter.com/)** - Enrutamiento
- **[Axios](https://axios-http.com/)** - Cliente HTTP
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificaciones toast
- **[date-fns](https://date-fns.org/)** - Utilidades de fechas

---

## 🔧 Configuración

### **Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000
```

---

## 🎯 Roles y Permisos

### **Administrador**
- Gestión completa de usuarios
- Activación de médicos
- Visualización de todas las citas
- Estadísticas del sistema

### **Médico**
- Gestión de horarios de disponibilidad
- Gestión de citas asignadas
- Confirmación y completado de citas
- Perfil profesional con especialidades

### **Paciente**
- Búsqueda de médicos
- Agendamiento de citas
- Gestión de citas propias
- Perfil personal

---

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

---

## 🎨 Sistema de Diseño

### **Colores**
- Primary: Azul médico profesional
- Secondary: Verde salud
- Accent: Naranja energético
- Neutral: Grises equilibrados

### **Componentes UI**
Basados en **shadcn/ui** con personalización:
- Botones con estados hover/active
- Inputs con validación visual
- Modals accesibles
- Dropdowns y selects
- Calendarios y date pickers
- Tablas responsivas
- Badges y alertas

---

## 🚀 Build de Producción

```bash
# Compilar para producción
npm run build

# Preview del build
npm run preview
```

El build optimizado se genera en la carpeta `dist/`:
- CSS minificado (~48KB gzip)
- JS minificado (~671KB, ~188KB gzip)
- Assets optimizados

---

## 📖 Documentación Adicional

Para más información sobre el backend y la arquitectura completa, consulta:
- [Backend README](../srmedica-backend/README.md)

---

## 🎯 Estado del Proyecto

- ✅ Build funcional y optimizado
- ✅ Sistema de autenticación completo
- ✅ Gestión de citas implementada
- ✅ Sistema de notificaciones
- ✅ Responsive design
- ✅ Componentes UI estandarizados
- ✅ TypeScript sin errores

---

**Desarrollado para SR Medica** 🏥
