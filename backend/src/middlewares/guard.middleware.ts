/**
 * Middlewares de autorización basados en roles (guards)
 * Verifican que el usuario tenga los permisos necesarios para acceder a un recurso
 */

import type { FastifyReply, FastifyRequest } from 'fastify';

/** Helper para denegar acceso con código de error */
function deny(rep: FastifyReply, code: 'INVALID_TOKEN' | 'FORBIDDEN_ROLE' | 'TOKEN_NO_ROLES', status = 401) {
    return rep.code(status).send({ ok: false, error: { code, message: code } });
}

/** Extrae roles del token JWT (soporta 'role' o 'roles') */
function rolesFromToken(req: FastifyRequest): string[] | null {
    const u = req.user;
    if (!u) { return null; }
    if (Array.isArray(u.roles)) { return u.roles; }
    return null;
}

/** Requiere un rol específico */
export function requireRoleToken(role: string) {
    return async (req: FastifyRequest, rep: FastifyReply) => {
        const uid = req.user?.id;
        if (!uid) { return deny(rep, 'INVALID_TOKEN', 401); }

        const roles = rolesFromToken(req);
        if (!roles) { return deny(rep, 'TOKEN_NO_ROLES', 403); }
        if (!roles.includes(role)) { return deny(rep, 'FORBIDDEN_ROLE', 403); }
    };
}

/** Requiere al menos uno de los roles especificados */
export function requireRolesToken(rolesAllowed: string[]) {
    return async (req: FastifyRequest, rep: FastifyReply) => {
        const uid = req.user?.id;
        if (!uid) { return deny(rep, 'INVALID_TOKEN', 401); }

        const roles = rolesFromToken(req);
        if (!roles) { return deny(rep, 'TOKEN_NO_ROLES', 403); }
        const ok = rolesAllowed.some((r) => roles.includes(r));
        if (!ok) { return deny(rep, 'FORBIDDEN_ROLE', 403); }
    };
}

/** Permite acceso si es el mismo usuario o tiene uno de los roles permitidos */
export function requireSelfOrRolesToken(idParam: string, rolesAllowed: string[]) {
    return async (req: FastifyRequest, rep: FastifyReply) => {
        const uid = req.user?.id;
        if (!uid) { return deny(rep, 'INVALID_TOKEN', 401); }

        const idParamVal = Number((req.params as any)?.[idParam]);
        if (uid === idParamVal) { return; }

        const roles = rolesFromToken(req);
        if (!roles) { return deny(rep, 'TOKEN_NO_ROLES', 403); }
        const ok = rolesAllowed.some((r) => roles.includes(r));
        if (!ok) { return deny(rep, 'FORBIDDEN_ROLE', 403); }
    };
}

/** Shortcuts para roles comunes */
export const requirePatient = requireRoleToken('paciente');
export const requireDoctor = requireRoleToken('medico');
export const requireAdmin = requireRoleToken('administrador');
