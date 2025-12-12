/**
 * Punto de entrada de la aplicación
 * Inicializa y arranca el servidor Fastify
 */

import 'dotenv/config';
import { buildApp } from './app';

// Serialización de BigInt para JSON (Prisma compatibility)
(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return Number.isSafeInteger(int) ? int : this.toString();
};

async function main() {
  const app = await buildApp();
  const port = Number(process.env.PORT) || 3000;
  const host = '0.0.0.0';
  await app.listen({ port, host });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
