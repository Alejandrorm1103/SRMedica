# SRMedica – Entorno Médico Digital

## Descripción General

SRMedica es una plataforma web desarrollada como proyecto académico con fines educativos, orientada a facilitar la telemedicina y el acompañamiento médico digital para pacientes en Colombia y España.  
El sistema busca mejorar la accesibilidad, eficiencia y seguridad en la atención médica mediante un entorno digital que conecta médicos y pacientes de manera confiable y sencilla.

Este proyecto es desarrollado por estudiantes de Ingeniería de Software y entregado a un cliente real con fines demostrativos y educativos.

---

## Objetivo General

Diseñar y desarrollar un aplicativo web funcional que permita el registro, agendamiento de citas médicas y comunicación segura entre pacientes y médicos, integrando servicios de videollamadas externas y almacenamiento en base de datos.

---

## Objetivos Específicos

- Implementar un sistema de autenticación y registro seguro para médicos y pacientes.  
- Permitir la programación, modificación y cancelación de citas médicas en línea.  
- Integrar servicios de videollamada o chat médico.  
- Facilitar el seguimiento de diagnósticos, historial y referencias entre especialistas.  
- Diseñar una interfaz accesible, moderna e intuitiva para todos los usuarios.

---

## Arquitectura del Proyecto

El sistema utiliza una arquitectura por capas con división entre frontend, backend y base de datos.  
Desarrollado bajo el enfoque cliente-servidor, usando microservicios y APIs REST.

Estructura del proyecto:

SRMedica/
├── frontend/
│ ├── index.html
│ ├── styles.css
│ ├── main.js
│ └── components/
│ └── login.html
├── backend/
│ ├── app.js
│ ├── routes/
│ ├── controllers/
│ └── models/
│ └── database.js
├── database/
│ └── schema.sql
├── docs/
│ ├── SRMedica_ClassDiagram.jpg
│ ├── SRMedica_SequenceDiagram.jpg
│ ├── SRMedica_ComponentsDiagram.jpg
│ ├── SRMedica_DeploymentDiagram.jpg
│ └── arquitectura.md
├── .gitignore
└── README.md


---

## Tecnologías Usadas

| Capa | Tecnología | Descripción |
|------|-------------|-------------|
| Frontend | HTML5, CSS3, JavaScript | Interfaz de usuario dinámica e interactiva |
| Backend | Node.js, Fastify | API REST rápida y modular |
| Base de Datos | PostgreSQL | Almacenamiento relacional seguro |
| Control de Versiones | Git y GitHub | Gestión de versiones y trabajo colaborativo |
| Diseño UI/UX | Figma, Moqups | Prototipos de baja y alta fidelidad |
| Documentación | StarUML, Draw.io | Diagramas UML y documentación técnica |

---

## Patrones y Arquitectura

- Patrón Modelo - Vista - Controlador (MVC) aplicado en la lógica del backend.  
- Arquitectura Cliente / Servidor para separación de responsabilidades.  
- Estructura de microservicios escalable con endpoints REST.

---

## Instrucciones de Instalación y Ejecución

### Requisitos Previos
Asegúrese de tener instalado:
- Node.js (versión 18 o superior)
- PostgreSQL
- Git

