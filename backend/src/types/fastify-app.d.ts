import 'fastify';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    // db: { pool: Pool; query: (text: string, params?: any[]) => Promise<any> }; // Removed legacy db
    authenticate: (req: any, rep: any) => Promise<void>;
    requireRole: (role: string) => (req: any, rep: any) => Promise<void>;
    requireRoles: (roles: string[]) => (req: any, rep: any) => Promise<void>;
    requirePatient: () => (req: any, rep: any) => Promise<void>;
    requireDoctor: () => (req: any, rep: any) => Promise<void>;
    requireAdmin: () => (req: any, rep: any) => Promise<void>;
  }
  interface FastifyRequest {
    user?: { id: number; email?: string; roles?: string[]; role?: string } | any;
  }
}
