const UserModel = require('../models/user.model');

const UserController = {
  async register(req, reply) {
    try {
      const user = await UserModel.createUser(req.body);
      reply.code(201).send({ message: 'Usuario creado con éxito', user });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  },

  async getAll(req, reply) {
    try {
      const users = await UserModel.getAllUsers();
      reply.send(users);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  }
};

module.exports = UserController;
