import type { FastifyInstance } from 'fastify';
import { emailService } from '@/shared/services/email.service';

export default async function testRoutes(app: FastifyInstance) {
    /**
     * Endpoint de prueba para verificar el envío de emails
     * GET /test/email?to=email@ejemplo.com
     */
    app.get('/test/email', {
        schema: {
            tags: ['Testing'],
            summary: 'Prueba el envío de emails (solo desarrollo)',
            querystring: {
                type: 'object',
                properties: {
                    to: { type: 'string', format: 'email', description: 'Email de destino' }
                }
            }
        }
    }, async (req, rep) => {
        if (app.config.NODE_ENV === 'production') {
            return rep.code(403).send({ ok: false, error: 'Endpoint solo disponible en desarrollo' });
        }

        const { to } = req.query as { to?: string };
        const emailTo = to || 'test@example.com';

        try {
            // Generar un token de prueba
            const testToken = 'test-token-key.test-secret-123';

            // Enviar email de verificación de prueba
            await emailService.sendVerificationEmail(emailTo, testToken);

            return rep.send({
                ok: true,
                message: 'Email de prueba enviado con Resend',
                details: {
                    to: emailTo,
                    type: 'verification',
                    note: '¡Revisa tu bandeja de entrada! El email debería llegar en segundos.'
                }
            });
        } catch (error: any) {
            return rep.code(500).send({
                ok: false,
                error: 'Error al enviar email',
                details: error.message
            });
        }
    });

    /**
     * Endpoint de prueba para verificar configuración SMTP
     * GET /test/smtp-config
     */
    app.get('/test/smtp-config', {
        schema: {
            tags: ['Testing'],
            summary: 'Muestra la configuración SMTP actual (solo desarrollo)'
        }
    }, async (req, rep) => {
        if (app.config.NODE_ENV === 'production') {
            return rep.code(403).send({ ok: false, error: 'Endpoint solo disponible en desarrollo' });
        }

        const hasResendKey = !!process.env.RESEND_API_KEY;

        return rep.send({
            ok: true,
            service: 'Resend',
            configured: hasResendKey,
            config: {
                apiKey: hasResendKey ? 'Configurado ✓' : 'No configurado ✗',
                fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
            },
            limits: {
                free: '3,000 emails/mes',
                daily: '100 emails/día (desde onboarding@resend.dev)'
            },
            dashboard: 'https://resend.com/emails'
        });
    });
}
