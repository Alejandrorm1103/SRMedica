/**
 * Configuración paramétrica de roles del sistema
 * 
 * Permite habilitar/deshabilitar funcionalidades por rol de forma centralizada
 */

export interface RoleConfig {
    enabled: boolean;
    canRegister: boolean;
    canLogin: boolean;
    label: string;
    icon: string;
    description: string;
}

export type RoleType = 'paciente' | 'medico' | 'administrador';

export const ROLES_CONFIG: Record<RoleType, RoleConfig> = {
    paciente: {
        enabled: true,
        canRegister: true,
        canLogin: true,
        label: 'Paciente',
        icon: '👤',
        description: 'Busco atención médica',
    },
    medico: {
        enabled: true,
        canRegister: true,
        canLogin: true,
        label: 'Médico',
        icon: '🩺',
        description: 'Ofrezco servicios médicos',
    },
    administrador: {
        enabled: true,
        canRegister: true, // ← Cambiar a false para deshabilitar registro público de admins
        canLogin: true,
        label: 'Administrador',
        icon: '🛡️',
        description: 'Gestiono el sistema',
    },
};

/**
 * Obtiene los roles habilitados para login
 */
export const getLoginRoles = (): RoleType[] => {
    return (Object.keys(ROLES_CONFIG) as RoleType[]).filter(
        (role) => ROLES_CONFIG[role].enabled && ROLES_CONFIG[role].canLogin
    );
};

/**
 * Obtiene los roles habilitados para registro
 */
export const getRegisterRoles = (): RoleType[] => {
    return (Object.keys(ROLES_CONFIG) as RoleType[]).filter(
        (role) => ROLES_CONFIG[role].enabled && ROLES_CONFIG[role].canRegister
    );
};

/**
 * Verifica si un rol puede hacer login
 */
export const canRoleLogin = (role: RoleType): boolean => {
    return ROLES_CONFIG[role]?.enabled && ROLES_CONFIG[role]?.canLogin;
};

/**
 * Verifica si un rol puede registrarse
 */
export const canRoleRegister = (role: RoleType): boolean => {
    return ROLES_CONFIG[role]?.enabled && ROLES_CONFIG[role]?.canRegister;
};
