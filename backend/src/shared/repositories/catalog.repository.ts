import type { FastifyInstance } from 'fastify';
import { cacheService } from '@/shared/services/cache.service';

/**
 * Repositorio para catálogos (Especialidades, Estados, etc.)
 * Usa caché para reducir queries a la base de datos
 */
export class CatalogRepository {
    constructor(private app: FastifyInstance) { }

    /**
     * Obtener todas las especialidades (con caché)
     */
    async getEspecialidades() {
        return cacheService.getOrSet(
            'catalog:especialidades',
            async () => {
                return this.app.prisma.especialidad.findMany({
                    orderBy: { codigo: 'asc' },
                });
            },
            30 * 60 * 1000 // 30 minutos
        );
    }

    /**
     * Obtener todos los estados de citas (con caché)
     */
    async getEstadosCitas() {
        return cacheService.getOrSet(
            'catalog:estados_citas',
            async () => {
                return this.app.prisma.estadoCita.findMany({
                    orderBy: { codigo: 'asc' },
                });
            },
            30 * 60 * 1000 // 30 minutos
        );
    }

    /**
     * Obtener todos los motivos de cancelación (con caché)
     */
    async getMotivosCancelacion() {
        return cacheService.getOrSet(
            'catalog:motivos_cancelacion',
            async () => {
                return this.app.prisma.motivoCancelacionCita.findMany({
                    orderBy: { codigo: 'asc' },
                });
            },
            30 * 60 * 1000 // 30 minutos
        );
    }

    /**
     * Obtener todos los roles (con caché)
     */
    async getRoles() {
        return cacheService.getOrSet(
            'catalog:roles',
            async () => {
                return this.app.prisma.rol.findMany({
                    orderBy: { codigo: 'asc' },
                });
            },
            60 * 60 * 1000 // 1 hora
        );
    }

    /**
     * Invalidar caché de catálogos
     */
    invalidateCatalogCache(catalog?: string) {
        if (catalog) {
            cacheService.invalidate(`catalog:${catalog}`);
        } else {
            cacheService.invalidatePattern('^catalog:');
        }
    }
}
