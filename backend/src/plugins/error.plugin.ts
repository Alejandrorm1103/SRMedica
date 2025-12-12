/**
 * Plugin de manejo global de errores
 * Transforma errores de Prisma, Zod y errores personalizados en respuestas consistentes
 */

import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { ZodError } from 'zod';

type KnownError =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_IN_USE'
  | 'INVALID_TOKEN'
  | 'INVALID_REFRESH'
  | 'ROL_NOT_FOUND'
  | 'FORBIDDEN_ROLE'
  | 'NOT_FOUND'
  | 'CAT_ESTADO_NOT_FOUND'
  | 'CAT_MOTIVO_NOT_FOUND';

const mapToStatus: Record<KnownError | 'default', number> = {
  INVALID_CREDENTIALS: 401,
  INVALID_TOKEN: 401,
  INVALID_REFRESH: 401,
  EMAIL_IN_USE: 409,
  ROL_NOT_FOUND: 404,
  FORBIDDEN_ROLE: 403,
  NOT_FOUND: 404,
  CAT_ESTADO_NOT_FOUND: 400,
  CAT_MOTIVO_NOT_FOUND: 400,
  default: 500
};

const plugin: FastifyPluginAsync = async (app) => {
  app.setErrorHandler((err, req, rep) => {
    let status = (err as any).statusCode || 500;
    let code = (err as any).code || 'INTERNAL_ERROR';
    let message = err.message || 'Unexpected error';
    let details: any = undefined;

    // Errores de Prisma
    if (err.name === 'PrismaClientKnownRequestError') {
      const prismaError = err as any;

      switch (prismaError.code) {
        case 'P2002': {
          // Violación de constraint único
          status = 409;
          code = 'UNIQUE_CONSTRAINT_VIOLATION';
          const target = prismaError.meta?.target || 'field';
          message = `${Array.isArray(target) ? target.join(', ') : target} already exists`;
          details = { fields: prismaError.meta?.target };
          break;
        }

        case 'P2025':
          // Registro no encontrado
          status = 404;
          code = 'NOT_FOUND';
          message = 'Record not found';
          break;

        case 'P2003':
          // Violación de foreign key
          status = 400;
          code = 'FOREIGN_KEY_CONSTRAINT';
          message = 'Related record not found';
          details = { field: prismaError.meta?.field_name };
          break;

        case 'P2014':
          // Violación de relación requerida
          status = 400;
          code = 'REQUIRED_RELATION_VIOLATION';
          message = 'Required relation is missing';
          break;

        default:
          status = 500;
          code = 'DATABASE_ERROR';
          message = 'Database operation failed';
          req.log.error({ prismaError }, 'Unhandled Prisma error');
      }
    }
    // Errores de validación de Prisma
    else if (err.name === 'PrismaClientValidationError') {
      status = 400;
      code = 'VALIDATION_ERROR';
      message = 'Invalid data provided';
    }
    // Errores de validación de Zod (manual)
    else if (err instanceof ZodError) {
      status = 400;
      code = 'VALIDATION_ERROR';
      message = 'El formato de los datos es incorrecto';
      details = err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code
      }));
    }
    // Errores de validación de Fastify (schema)
    else if ((err as any).validation) {
      status = 400;
      code = 'VALIDATION_ERROR';
      message = 'El formato de los datos es incorrecto';
      details = (err as any).validation;
    }
    // Errores personalizados (legacy)
    else if (mapToStatus[(err.message as KnownError)]) {
      status = mapToStatus[(err.message as KnownError)];
      code = err.message;
    }

    const payload = {
      ok: false,
      error: {
        code,
        message,
        details: details || (err as any).details || undefined
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
      }
    };

    if (status >= 500) {
      req.log.error({ err }, 'Unhandled error');
    }

    return rep.code(status).send(payload);
  });
};

export default fp(plugin);
