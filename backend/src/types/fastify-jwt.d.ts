import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    // lo que metes en el access token
    payload: { id: number; email: string; roles: string[] };
    user:    { id: number; email: string; roles: string[] };
  }
}
