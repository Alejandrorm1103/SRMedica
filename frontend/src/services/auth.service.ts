import api from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'medico' | 'paciente' | 'administrador';
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    sexo?: string;
    fechaNacimiento?: string;
    direccion?: string;
    ciudad?: string;
    departamento?: string;
    pais?: string;
    telefono?: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    emailPreviewUrl?: string; // Solo en desarrollo
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await api.post<any>('/auth/login', { email, password });

            const rData = response.data; // Rename to rData to avoid confusion

            // Check if token is in root or in data.data
            // Backend sends: { ok: true, data: { user, access } }
            const payload = rData.data || rData;

            // Handle mismatched backend/frontend contracts or implicit success
            if (payload.access || payload.token) {
                const token = payload.access || payload.token;
                const serverUser = payload.user || {};
                console.log("Backend login response:", rData);

                // Determinar el rol del usuario
                let userRole: 'medico' | 'paciente' | 'administrador' = 'paciente';
                if (serverUser.roles && serverUser.roles.length > 0) {
                    // Buscar primero administrador, luego medico, luego paciente
                    if (serverUser.roles.includes('administrador')) {
                        userRole = 'administrador';
                    } else if (serverUser.roles.includes('medico')) {
                        userRole = 'medico';
                    } else if (serverUser.roles.includes('paciente')) {
                        userRole = 'paciente';
                    } else {
                        userRole = serverUser.roles[0];
                    }
                } else {
                    // Fallback basado en el email
                    userRole = email.toLowerCase().includes('paciente') ? 'paciente' : 'medico';
                }

                // Try to get detail fields if backend sends them directly or nested
                // Backend might send specific data in 'medico' or 'paciente' or 'administrador' relation if included, or flat if DTO
                const details = serverUser.administrador || serverUser.administrativo || serverUser.medico || serverUser.paciente || serverUser;

                const mappedUser: User = {
                    id: serverUser.id || '0',
                    name: serverUser.name || (details?.primerNombre ? `${details.primerNombre} ${details?.primerApellido || ''}`.trim() : (serverUser.email || 'Usuario')),
                    email: serverUser.email || email,
                    role: userRole,
                    primerNombre: details?.primerNombre || undefined,
                    segundoNombre: details?.segundoNombre || undefined,
                    primerApellido: details?.primerApellido || undefined,
                    segundoApellido: details?.segundoApellido || undefined
                };

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(mappedUser));
                return { token, user: mappedUser };
            }

            // If we got a 200 but structure is not success (e.g. { ok: false, message: ... })
            // Throw it so catch block or caller handles it
            if (rData.ok === false || rData.error) {
                throw rData;
            }

            return response.data;
        } catch (error: any) {
            console.error("Backend login failed:", error);
            // Re-throw the error to be handled by the component
            // If it's an axios error with response, throw the response data
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    async register(data: any): Promise<LoginResponse> {
        try {
            const response = await api.post<any>('/auth/register', data);
            const rData = response.data;
            if (rData.access || rData.token) {
                const token = rData.access || rData.token;
                const serverUser = rData.user || {};

                const userRole = (serverUser.roles && serverUser.roles.length > 0)
                    ? serverUser.roles[0]
                    : (data.rol || data.role || 'paciente');

                // For register, we have the data submitted
                const mappedUser: User = {
                    id: serverUser.id || '0',
                    name: serverUser.name || `${data.primerNombre} ${data.primerApellido}`,
                    email: serverUser.email || data.email,
                    role: userRole as 'medico' | 'paciente',
                    primerNombre: data.primerNombre,
                    segundoNombre: data.segundoNombre,
                    primerApellido: data.primerApellido,
                    segundoApellido: data.segundoApellido
                };

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(mappedUser));
                return { token, user: mappedUser };
            }

            // Check for explicit error response from backend even with 200 OK
            if (rData.ok === false || rData.error) {
                throw rData;
            }

            return response.data;
        } catch (error: any) {
            console.error("Backend register failed:", error);
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === "undefined") return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error("Error parsing user from local storage", e);
            localStorage.removeItem('user');
            return null;
        }
    }
};
