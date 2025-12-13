import type { FastifyInstance } from 'fastify';
import { makeAuthService } from '@/core/injector';
import {
  LoginDTO, RegisterDTO, RefreshDTO, RecoverDTO, ResetDTO,
  VerifyEmailDTO, ActivateUserDTO, ChangePasswordDTO
} from './auth.schema';

export default async function routes(app: FastifyInstance) {
  const svc = makeAuthService(app);

  /* ========= ME ========= */
  app.get('/me', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Obtener perfil del usuario actual',
      description: 'Devuelve los datos del usuario autenticado basado en su token JWT (Cookie o Header).',
      response: {
        200: {
          description: 'Perfil del usuario obtenido exitosamente',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                email: { type: 'string', example: 'doctor@srmedica.com' },
                nombre: { type: 'string', example: 'Juan Pérez' },
                roles: { type: 'array', items: { type: 'string' }, example: ['medico'] },
                estado: { type: 'boolean', example: true }
              }
            }
          }
        },
        401: {
          description: 'No autorizado / Token inválido',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'UNAUTHORIZED' },
                message: { type: 'string', example: 'Missing or invalid token' }
              }
            }
          }
        }
      }
    }
  }, async (req, rep) => {
    const me = await svc.me((req.user as any).id);
    return rep.send({ ok: true, data: me });
  });

  /* ========= REGISTER ========= */
  app.post('/register', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes'
      }
    },
    schema: {
      tags: ['Auth'],
      summary: 'Registrar nuevo usuario',
      description: 'Crea una cuenta para Paciente, Médico o Administrador. Envía email de verificación para pacientes.',
      body: {
        type: 'object',
        required: ['email', 'password', 'primerNombre', 'primerApellido', 'rol', 'telefono'],
        properties: {
          email: { type: 'string', format: 'email', example: 'nuevo@usuario.com' },
          password: { type: 'string', minLength: 8, example: 'Seguridad123!' },
          telefono: { type: 'string', example: '+57 300 123 4567' },
          primerNombre: { type: 'string', example: 'Ana' },
          segundoNombre: { type: 'string', nullable: true, example: 'María' },
          primerApellido: { type: 'string', example: 'López' },
          segundoApellido: { type: 'string', nullable: true, example: 'García' },
          rol: { type: 'string', enum: ['paciente', 'medico', 'administrador'], example: 'paciente' },

          // Datos opcionales de perfil
          tipoDocumentoId: { type: 'number', nullable: true, example: 1 },
          numeroDocumento: { type: 'string', nullable: true, example: '1234567890' },
          fechaNacimiento: { type: 'string', format: 'date', nullable: true, example: '1990-01-01' },
          sexoId: { type: 'number', nullable: true, example: 1 },
          direccion: { type: 'string', nullable: true, example: 'Calle 123 #45-67' },

          // Específico Médico
          registroProfesional: { type: 'string', nullable: true, example: 'RM-123456' },
          especialidadCodigo: { type: 'string', nullable: true, example: 'medicina_general' }
        }
      },
      response: {
        201: {
          description: 'Usuario registrado exitosamente',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 10 },
                email: { type: 'string', example: 'nuevo@usuario.com' },
                active: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Registro exitoso. Verifique su email.' },
                emailPreviewUrl: { type: 'string' }
              }
            }
          }
        },
        400: {
          description: 'Datos inválidos o e-mail ya registrado',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'El email ya está en uso' },
                issues: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        }
      }
    }
  }, async (req, rep) => {
    const dto = RegisterDTO.parse(req.body);
    const out = await svc.register(dto as any); // el service ya mapea camelCase -> snake_case
    // Si es admin: devuelve tokens; si es paciente: retorna verifyToken para QA (en prod envías email)
    if ((out as any).access && (out as any).refresh) {
      rep.setCookie('refresh', (out as any).refresh, {
        httpOnly: true, sameSite: 'lax',
        secure: app.config.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 15
      });
      return rep.code(201).send({ ok: true, data: { user: (out as any).user, access: (out as any).access } });
    }
    return rep.code(201).send({ ok: true, data: out });
  });

  /* ========= LOGIN ========= */
  app.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes'
      }
    },
    schema: {
      tags: ['Auth'],
      summary: 'Iniciar Sesión',
      description: 'Autentica al usuario y devuelve un Access Token (JWT) y una cookie con el Refresh Token.',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'usuario@example.com' },
          password: { type: 'string', example: 'Password123!' }
        }
      },
      response: {
        200: {
          description: 'Login exitoso',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                access: { type: 'string', description: 'JWT Access Token' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    roles: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Credenciales inválidas',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'INVALID_CREDENTIALS' },
                message: { type: 'string', example: 'Email o contraseña incorrectos' }
              }
            }
          }
        }
      }
    }
  }, async (req, rep) => {
    const dto = LoginDTO.parse(req.body);
    const out = await svc.login(dto);
    rep.setCookie('refresh', out.refresh, {
      httpOnly: true, sameSite: 'lax',
      secure: app.config.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 15
    });
    return rep.send({ ok: true, data: { user: out.user, access: out.access } });
  });

  /* ========= REFRESH ========= */
  app.post('/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Renovar tokens de acceso',
      description: 'Genera un nuevo Access Token usando un Refresh Token válido (enviado en cookie o body).',
      body: {
        type: 'object',
        properties: { refreshToken: { type: 'string', description: 'Token de refresco (opcional si ya existe cookie)' } }
      },
      response: {
        200: {
          description: 'Tokens renovados exitosamente',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                access: { type: 'string', description: 'Nuevo Access Token' },
                user: { type: 'object', description: 'Datos del usuario' }
              }
            }
          }
        },
        400: {
          description: 'Token inválido o expirado',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: { type: 'object' }
          }
        }
      }
    }
  }, async (req, rep) => {
    const { refreshToken } = RefreshDTO.parse(req.body ?? {});
    const token = refreshToken ?? (req.cookies?.refresh as string);
    if (!token) { return rep.badRequest('Missing refresh token'); }
    const out = await svc.refresh(token);
    rep.setCookie('refresh', out.refresh, {
      httpOnly: true, sameSite: 'lax',
      secure: app.config.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 15
    });
    return rep.send({ ok: true, data: { user: out.user, access: out.access } });
  });

  /* ========= LOGOUT ========= */
  app.post('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Cerrar sesión',
      description: 'Revoca el Refresh Token actual e invalida la cookie de sesión.',
      response: {
        200: {
          description: 'Sesión cerrada exitosamente',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true }
          }
        }
      }
    }
  }, async (req, rep) => {
    const token = (req.body as any)?.refreshToken ?? (req.cookies?.refresh as string);
    if (token) { await svc.logout(token); }
    rep.clearCookie('refresh', { path: '/' });
    return rep.send({ ok: true });
  });

  /* ========= RECOVER INIT ========= */
  app.post('/recover', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '15 minutes'
      }
    },
    schema: {
      tags: ['Auth'],
      summary: 'Recuperar contraseña (Solicitud)',
      description: 'Inicia el proceso de recuperación enviando un correo con un link/token.',
      body: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email', example: 'usuario@example.com' } }
      },
      response: {
        200: {
          description: 'Correo enviado (o token en desarrollo)',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            data: { type: 'object', description: 'Token de recuperación (Solo en Development)' }
          }
        }
      }
    }
  }, async (req, rep) => {
    const dto = RecoverDTO.parse(req.body);
    const out = await svc.recoverInit(dto);
    return rep.send({ ok: true, data: out });
  });

  /* ========= RESET ========= */
  app.post('/reset', {
    schema: {
      tags: ['Auth'],
      summary: 'Restablecer contraseña',
      description: 'Completa el proceso de recuperación estableciendo una nueva contraseña.',
      body: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1...' },
          newPassword: { type: 'string', minLength: 8, example: 'NuevaClave123!' }
        }
      },
      response: {
        200: {
          description: 'Contraseña actualizada exitosamente',
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true }
          }
        },
        400: {
          description: 'Token inválido o expirado',
          type: 'object',
          properties: { ok: { type: 'boolean', example: false }, error: { type: 'object' } }
        }
      }
    }
  }, async (req, rep) => {
    const dto = ResetDTO.parse(req.body);
    const out = await svc.recoverFinish(dto);
    return rep.send(out);
  });

  /* ========= VERIFY EMAIL (nuevo) ========= */
  /* ========= VERIFY EMAIL (POST) ========= */
  app.post('/verify-email', {
    schema: {
      tags: ['Auth'],
      summary: 'Verificar email (API)',
      description: 'Confirma la cuenta de un paciente mediante el token enviado por correo.',
      body: {
        type: 'object',
        required: ['token'],
        properties: { token: { type: 'string', example: 'tokenKey.secret' } }
      },
      response: {
        200: {
          description: 'Email verificado correctamente',
          type: 'object',
          properties: { ok: { type: 'boolean', example: true } }
        },
        400: {
          description: 'Token inválido o expirado',
          type: 'object',
          properties: { ok: { type: 'boolean', example: false }, error: { type: 'object' } }
        }
      }
    }
  }, async (req, rep) => {
    const dto = VerifyEmailDTO.parse(req.body);
    await svc.verifyEmail(dto);
    return rep.send({ ok: true });
  });

  // Ruta GET para manejar el clic desde el correo directamente
  app.get('/verify-email', {
    schema: {
      tags: ['Auth'],
      summary: 'Verificar email (Navegador)',
      description: 'Endpoint para acceso directo desde el correo. Retorna HTML.',
      querystring: {
        type: 'object',
        required: ['token'],
        properties: { token: { type: 'string' } }
      },
      produces: ['text/html']
    }
  }, async (req, rep) => {
    const { token } = req.query as { token: string };
    try {
      await svc.verifyEmail({ token });
      rep.type('text/html').send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cuenta Verificada - SR Medica</title>
            <style>
              body {
                margin: 0;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: linear-gradient(135deg, #0088CC 0%, #005F8C 100%);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .card {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 400px;
                width: 90%;
              }
              .icon-circle {
                width: 80px;
                height: 80px;
                background-color: #ecfdf5;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
              }
              .check-icon {
                color: #059669;
                font-size: 40px;
              }
              h1 {
                color: #005F8C;
                margin: 0 0 10px;
                font-size: 24px;
              }
              p {
                color: #64748b;
                line-height: 1.5;
                margin-bottom: 30px;
              }
              .btn {
                background-color: #0088CC;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                display: inline-block;
                transition: background-color 0.2s;
              }
              .btn:hover {
                background-color: #0077b3;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon-circle">
                <span class="check-icon">✓</span>
              </div>
              <h1>¡Cuenta Verificada!</h1>
              <p>Tu correo electrónico ha sido confirmado exitosamente. Ya tienes acceso completo a SR Medica.</p>
              <a href="http://localhost:5173/login" class="btn">Iniciar Sesión</a>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      rep.type('text/html').send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error - SR Medica</title>
            <style>
              body {
                margin: 0;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: linear-gradient(135deg, #0088CC 0%, #005F8C 100%);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .card {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 400px;
                width: 90%;
              }
              .icon-circle {
                width: 80px;
                height: 80px;
                background-color: #fef2f2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
              }
              .error-icon {
                color: #dc2626;
                font-size: 40px;
                font-weight: bold;
              }
              h1 {
                color: #dc2626;
                margin: 0 0 10px;
                font-size: 24px;
              }
              p {
                color: #64748b;
                line-height: 1.5;
                margin-bottom: 30px;
              }
              .btn {
                background-color: #64748b;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                display: inline-block;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon-circle">
                <span class="error-icon">!</span>
              </div>
              <h1>Enlace Inválido</h1>
              <p>El enlace de verificación es inválido o ha expirado. Por favor intenta registrarte nuevamente.</p>
              <a href="http://localhost:5173/landing" class="btn">Volver al Inicio</a>
            </div>
          </body>
        </html>
      `);
    }
  });

  /* ========= ACTIVATE USER (nuevo, admin) ========= */
  app.post('/admin/activate-user', {
    preHandler: [app.authenticate, app.guard.requireAdmin],
    schema: {
      tags: ['Auth'],
      summary: 'Activar usuario (Admin)',
      description: 'Permite a un administrador activar manualmente una cuenta (ej. médico pendiente de aprobación).',
      body: {
        type: 'object',
        required: ['usuarioId'],
        properties: { usuarioId: { type: 'number', example: 123 } }
      },
      response: {
        204: {
          description: 'Usuario activado correctamente (Sin contenido)',
          type: 'null'
        },
        404: {
          description: 'Usuario no encontrado',
          type: 'object',
          properties: { ok: { type: 'boolean', example: false }, error: { type: 'object' } }
        }
      }
    }
  }, async (req, rep) => {
    const dto = ActivateUserDTO.parse(req.body);
    await svc.activateUser(dto);
    return rep.code(204).send();
  });

  /* ========= DEACTIVATE USER (nuevo, admin) ========= */
  app.post('/admin/deactivate-user', {
    preHandler: [app.authenticate, app.guard.requireAdmin],
    schema: {
      tags: ['Auth'],
      summary: 'Desactivar usuario (Admin)',
      description: 'Permite a un administrador desactivar una cuenta.',
      body: {
        type: 'object',
        required: ['usuarioId'],
        properties: { usuarioId: { type: 'number', example: 123 } }
      },
      response: {
        204: { description: 'Usuario desactivado correctamtente', type: 'null' }
      }
    }
  }, async (req, rep) => {
    const dto = ActivateUserDTO.parse(req.body); // Reutilizamos el mismo DTO
    await svc.deactivateUser(dto);
    return rep.code(204).send();
  });

  /* ========= CHANGE PASSWORD (nuevo) ========= */
  app.post('/change-password', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Cambiar contraseña',
      description: 'Permite al usuario logueado cambiar su contraseña actual.',
      body: {
        type: 'object',
        required: ['oldPassword', 'newPassword', 'confirmPassword'],
        properties: {
          oldPassword: { type: 'string', example: 'ClaveActual123' },
          newPassword: { type: 'string', minLength: 8, example: 'NuevaClave456!' },
          confirmPassword: { type: 'string', minLength: 8, example: 'NuevaClave456!' }
        }
      },
      response: {
        204: { description: 'Contraseña cambiada exitosamente', type: 'null' },
        400: { description: 'Contraseña actual incorrecta o nueva inválida', type: 'object' }
      }
    }
  }, async (req: any, rep) => {
    const dto = ChangePasswordDTO.parse(req.body);
    await svc.changePassword(Number(req.user.id ?? req.user.sub), dto);
    return rep.code(204).send();
  });
}
