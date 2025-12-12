/**
 * Configuración y validación de variables de entorno
 * Usa Zod para validar todas las variables requeridas al inicio de la aplicación
 */

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/** Schema de validación de variables de entorno */
const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Authentication
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for security"),

  // Email Service (Resend)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required for email functionality"),
  RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL must be a valid email address"),

  // Frontend
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),
});

/**
 * Tipo TypeScript inferido del schema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validación y parseo de variables de entorno
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  console.error("\n💡 Please check your .env file and ensure all required variables are set.");
  process.exit(1);
}

/**
 * Variables de entorno validadas y type-safe
 */
export const env = parsed.data;

// Log de configuración en desarrollo
if (env.NODE_ENV === 'development') {
  console.log('✅ Environment variables validated successfully');
  console.log(`   NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   PORT: ${env.PORT}`);
  console.log(`   DATABASE_URL: ${env.DATABASE_URL.substring(0, 20)}...`);
  console.log(`   FRONTEND_URL: ${env.FRONTEND_URL}`);
}

