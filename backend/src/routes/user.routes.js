const UserController = require('../controllers/user.controller');

async function userRoutes(fastify, options) {
  fastify.post('/register', UserController.register);
  fastify.get('/users', UserController.getAll);
}

module.exports = userRoutes;
