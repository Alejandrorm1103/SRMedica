// Importa Fastify
const Fastify = require('fastify');

// Crea la instancia del servidor
const fastify = Fastify({ logger: true });

// Habilita CORS (permite conexión con frontend)
fastify.register(require('@fastify/cors'), {
  origin: '*',
});

// Ruta principal de prueba
fastify.get('/', async (req, reply) => {
  return { message: 'SRMedica backend operativo 🚀' };
});

// Función para iniciar el servidor
const start = async () => {
  try {
    // Escucha en todas las interfaces
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Servidor corriendo en http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Llamar a la función para iniciar el servidor
start();
