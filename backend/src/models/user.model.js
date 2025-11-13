const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saltRounds = 10;

const UserModel = {
  async createUser(data) {
    const hashedPassword = await bcrypt.hash(data.contraseña, saltRounds);
    return prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        rol: data.rol || 'PACIENTE',
        contraseña: hashedPassword
      }
    });
  },

  async getUserByEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  },

  async getAllUsers() {
    return prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        fecha_creacion: true
      }
    });
  }
};

module.exports = UserModel;
