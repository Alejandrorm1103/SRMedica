import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import type { FastifyBaseLogger } from 'fastify';
import type { Transporter } from 'nodemailer';

/**
 * Servicio de envío de emails con soporte para múltiples proveedores
 * - Desarrollo: Ethereal Email (100% gratis, funciona con cualquier email)
 * - Test/Producción: Resend
 */
export class EmailService {
  private resend?: Resend;
  private etherealTransporter?: Transporter;
  private fromEmail: string = '';
  private frontendUrl: string;
  private isConfigured: boolean = false;
  private logger?: FastifyBaseLogger;
  private provider: 'ethereal' | 'resend' | 'none';

  constructor(logger?: FastifyBaseLogger) {
    this.logger = logger;
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const nodeEnv = process.env.NODE_ENV || 'development';

    // En desarrollo, usar Ethereal (gratis, funciona con cualquier email)
    if (nodeEnv === 'development') {
      this.provider = 'ethereal';
      this.initEthereal();
    } else {
      // En test/producción, usar Resend
      this.provider = 'resend';
      this.initResend();
    }
  }

  /**
   * Inicializa Ethereal Email para desarrollo
   */
  private async initEthereal() {
    try {
      // Crear cuenta de prueba de Ethereal
      const testAccount = await nodemailer.createTestAccount();

      this.etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        tls: {
          // Aceptar certificados auto-firmados (solo para desarrollo)
          rejectUnauthorized: false,
        },
      });

      this.fromEmail = testAccount.user;
      this.isConfigured = true;

      const message = `✅ Ethereal Email configurado para DESARROLLO
📧 Usuario: ${testAccount.user}
🔗 Ver emails en: https://ethereal.email/messages
⚠️  Los emails NO se envían realmente, solo se capturan para pruebas`;

      if (this.logger) {
        this.logger.info(message);
      } else {
        console.info(message);
      }
    } catch (error) {
      const msg = '❌ Error configurando Ethereal Email';
      if (this.logger) {
        this.logger.error({ error }, msg);
      } else {
        console.error(msg, error);
      }
      this.isConfigured = false;
      this.provider = 'none';
    }
  }

  /**
   * Inicializa Resend para producción
   */
  private initResend() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      const message = '⚠️  RESEND_API_KEY no configurada. Los emails no se enviarán.';
      if (this.logger) {
        this.logger.warn(message);
      } else {
        console.warn(message);
      }
      this.isConfigured = false;
      this.provider = 'none';
      this.resend = new Resend('re_dummy_key');
    } else {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      if (this.logger) {
        this.logger.info('✅ Resend Email Service configurado para PRODUCCIÓN');
      } else {
        console.info('✅ Resend Email Service configurado para PRODUCCIÓN');
      }
    }
  }

  /**
   * Envía un email de verificación de cuenta (PACIENTE)
   */
  async sendVerificationEmail(to: string, token: string): Promise<string | undefined> {
    if (!this.isConfigured) {
      const msg = '⚠️  Email no enviado (servicio no configurado)';
      if (this.logger) {
        this.logger.warn(msg);
      } else {
        console.warn(msg);
      }
      return undefined;
    }

    // La ruta de verificación está bajo el prefijo /auth en el backend
    // Si frontendUrl apunta al backend (3000), necesitamos /auth/verify-email
    // Si apunta al frontend (5173), necesitaríamos crear esa ruta en React que haga fetch al backend
    // Dado que el endpoint GET devuelve HTML directo, asumimos que debe ir al backend por ahora.
    let baseUrl = this.frontendUrl;
    // Si la URL base no termina en /auth y estamos apuntando al backend, lo agregamos (o lo forzamos en la ruta)
    // Para simplificar y corregir el error 404 inmediato:
    if (baseUrl.includes('3000') && !baseUrl.includes('/auth')) {
      baseUrl = `${baseUrl}/auth`;
    }

    const verifyLink = `${baseUrl}/verify-email?token=${token}`;

    if (this.provider === 'ethereal') {
      return await this.sendViaEthereal(
        to,
        'Verifica tu cuenta - SR Medica',
        this.getVerificationEmailTemplate(verifyLink)
      );
    } else if (this.provider === 'resend') {
      await this.sendViaResend(
        to,
        'Verifica tu cuenta - SR Medica',
        this.getVerificationEmailTemplate(verifyLink)
      );
      return undefined;
    }

    return undefined;
  }

  /**
   * Envía un email de confirmación de registro (MÉDICO)
   */
  async sendDoctorRegistrationEmail(to: string, doctorName: string): Promise<string | undefined> {
    if (!this.isConfigured) {
      const msg = '⚠️  Email no enviado (servicio no configurado)';
      if (this.logger) {
        this.logger.warn(msg);
      } else {
        console.warn(msg);
      }
      return undefined;
    }

    if (this.provider === 'ethereal') {
      return await this.sendViaEthereal(
        to,
        'Registro recibido - SR Medica',
        this.getDoctorRegistrationTemplate(doctorName)
      );
    } else if (this.provider === 'resend') {
      await this.sendViaResend(
        to,
        'Registro recibido - SR Medica',
        this.getDoctorRegistrationTemplate(doctorName)
      );
      return undefined;
    }

    return undefined;
  }

  /**
   * Envía un email de recuperación de contraseña
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    if (!this.isConfigured) {
      const msg = '⚠️  Email no enviado (servicio no configurado)';
      if (this.logger) {
        this.logger.warn(msg);
      } else {
        console.warn(msg);
      }
      return;
    }

    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;

    if (this.provider === 'ethereal') {
      await this.sendViaEthereal(
        to,
        'Recupera tu contraseña - SR Medica',
        this.getPasswordResetTemplate(resetLink)
      );
    } else if (this.provider === 'resend') {
      await this.sendViaResend(
        to,
        'Recupera tu contraseña - SR Medica',
        this.getPasswordResetTemplate(resetLink)
      );
    }
  }

  /**
   * Envía email vía Ethereal (desarrollo)
   */
  private async sendViaEthereal(to: string, subject: string, html: string): Promise<string> {
    if (!this.etherealTransporter) {
      throw new Error('Ethereal transporter not initialized');
    }

    try {
      const info = await this.etherealTransporter.sendMail({
        from: `"SR Medica" <${this.fromEmail}>`,
        to,
        subject,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || '';

      const message = `✅ Email enviado (DESARROLLO)
📧 Para: ${to}
📝 Asunto: ${subject}
🔗 Ver email: ${previewUrl}`;

      if (this.logger) {
        this.logger.info({
          action: 'email_sent',
          provider: 'ethereal',
          recipient: to,
          previewUrl,
        }, message);
      } else {
        console.info(message);
      }

      return previewUrl;
    } catch (error: any) {
      if (this.logger) {
        this.logger.error({ error }, 'Error enviando email vía Ethereal');
      } else {
        console.error('❌ Error enviando email:', error);
      }
      throw error;
    }
  }

  /**
   * Envía email vía Resend (producción)
   */
  private async sendViaResend(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      throw new Error('Resend not initialized');
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
      });

      if (error) {
        if (this.logger) {
          this.logger.error({ error }, 'Error enviando email vía Resend');
        } else {
          console.error('❌ Error enviando email vía Resend:', error);
        }
        throw new Error(`Failed to send email: ${error.message}`);
      }

      if (this.logger) {
        this.logger.info({
          action: 'email_sent',
          provider: 'resend',
          recipient: to,
          emailId: data?.id,
        }, 'Email sent successfully via Resend');
      } else {
        console.info(`✅ Email enviado a: ${to} (ID: ${data?.id})`);
      }
    } catch (error: any) {
      if (this.logger) {
        this.logger.error({ error }, 'Error enviando email vía Resend');
      } else {
        console.error('❌ Error enviando email:', error);
      }
      throw error;
    }
  }

  /**
   * Template HTML para email de verificación (PACIENTE)
   */
  private getVerificationEmailTemplate(verifyLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu cuenta</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0066c8 0%, #024b85 100%); padding: 50px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">SR Medica</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Bienvenido a tu salud digital</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 26px; font-weight: 700;">¡Hola! Bienvenido a SR Medica 👋</h2>
                      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                        Estamos encantados de que te unas a nosotros. Para completar tu registro y acceder a todas las funcionalidades, por favor verifica tu dirección de correo electrónico.
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verifyLink}" style="display: inline-block; padding: 16px 40px; background: #0066c8; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 102, 200, 0.25); transition: all 0.3s; border-bottom: 3px solid #0052a3;">
                              Verificar mi Cuenta
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 30px 0 10px 0;">
                        Si el botón anterior no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:
                      </p>
                      <p style="color: #0066c8; font-size: 13px; word-break: break-all; margin: 0; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
                        ${verifyLink}
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 35px 0;">
                      
                      <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
                        ⏰ Este enlace es válido por <strong>24 horas</strong>.<br>
                        🔒 Si no creaste una cuenta en SR Medica, puedes ignorar este mensaje con seguridad.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f1f5f9; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #64748b; font-size: 13px; margin: 0 0 10px 0;">
                        © ${new Date().getFullYear()} SR Medica. Todos los derechos reservados.
                      </p>
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        Cuidando de ti, siempre.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  /**
   * Template HTML para email de registro de médico
   */
  private getDoctorRegistrationTemplate(doctorName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registro Recibido - SR Medica</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #024b85 0%, #003366 100%); padding: 50px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">SR Medica</h1>
                      <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Portal Médico Profesional</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 26px; font-weight: 700;">Registro Recibido Exitosamente ✅</h2>
                      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                        Estimado/a <strong>Dr(a). ${doctorName}</strong>,
                      </p>
                      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                        Hemos recibido tu solicitud de registro en SR Medica. Tu cuenta ha sido creada y se encuentra en estado <strong>pendiente de aprobación</strong>.
                      </p>
                      
                      <!-- Info Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td style="background-color: #eff6ff; padding: 25px; border-radius: 12px; border: 1px solid #bfdbfe;">
                            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">📋 Proceso de Verificación</h3>
                            <ul style="color: #1e3a8a; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                              <li>Nuestro equipo administrativo revisará tus credenciales.</li>
                              <li>Validaremos tu Registro Profesional.</li>
                              <li>Te notificaremos vía email una vez tu cuenta sea activada.</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #475569; font-size: 15px; line-height: 1.8; margin: 25px 0;">
                        Este proceso garantiza la seguridad y calidad de nuestra red médica, y normalmente toma entre <strong>24 y 48 horas</strong>.
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 35px 0;">
                      
                      <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
                        📧 Si tienes alguna duda urgente, puedes responder a este correo para contactar con soporte.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f1f5f9; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #64748b; font-size: 13px; margin: 0 0 10px 0;">
                        © ${new Date().getFullYear()} SR Medica. Todos los derechos reservados.
                      </p>
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        Excelencia en Gestión Médica
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  /**
   * Template HTML para email de recuperación de contraseña
   */
  private getPasswordResetTemplate(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recupera tu contraseña</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">SR Medica</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Recuperación de Contraseña</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Restablece tu Contraseña 🔐</h2>
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en SR Medica. Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}" style="display: inline-block; padding: 18px 45px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);">
                              🔑 Restablecer Contraseña
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 10px 0;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                      </p>
                      <p style="color: #f5576c; font-size: 13px; word-break: break-all; margin: 0; padding: 15px; background-color: #fef2f2; border-radius: 6px; border-left: 3px solid #f5576c;">
                        ${resetLink}
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 35px 0;">
                      
                      <p style="color: #a0aec0; font-size: 13px; line-height: 1.6; margin: 0;">
                        ⏰ Este enlace expirará en <strong>1 hora</strong>.<br>
                        🛡️ Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu cuenta permanece protegida.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #718096; font-size: 13px; margin: 0 0 10px 0;">
                        © ${new Date().getFullYear()} SR Medica. Todos los derechos reservados.
                      </p>
                      <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                        Sistema de Gestión Médica
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
