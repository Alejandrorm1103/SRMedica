/**
 * Plugin de documentación Swagger/OpenAPI
 * Configura la interfaz interactiva de documentación de API en /docs
 */

import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'SRMedica API',
        description: 'API de citas médicas (Fastify + PostgreSQL)',
        version: '1.0.0'
      },
      servers: [{ url: 'http://localhost:3000', description: 'Local' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }],
      tags: [
        { name: 'Auth', description: 'Autenticación y sesiones' },
        { name: 'Users', description: 'Gestión de usuarios' },
        { name: 'Doctors', description: 'Médicos y especialidades' },
        { name: 'Patients', description: 'Pacientes' },
        { name: 'Appointments', description: 'Disponibilidades y citas' },
        { name: 'Administrators', description: 'Gestión de administradores' },
        { name: 'Notifications', description: 'Notificaciones y preferencias' },
        { name: 'Stats', description: 'Estadísticas y Dashboard' }
      ]
    }
  });
  await app.register(swaggerUI, { routePrefix: '/docs' });
});
