/**
 * Sistema de caché en memoria simple
 * Para datos que cambian poco (catálogos, configuraciones)
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live en milisegundos
}

export class CacheService {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutos por defecto

    /**
     * Obtener un valor del caché
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Verificar si el caché expiró
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Guardar un valor en el caché
     */
    set<T>(key: string, data: T, ttl?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
        });
    }

    /**
     * Obtener o crear un valor en el caché
     * Si no existe o expiró, ejecuta la función y guarda el resultado
     */
    async getOrSet<T>(
        key: string,
        fn: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        const cached = this.get<T>(key);

        if (cached !== null) {
            return cached;
        }

        const data = await fn();
        this.set(key, data, ttl);
        return data;
    }

    /**
     * Invalidar un valor del caché
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidar múltiples valores por patrón
     */
    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        const keysToDelete: string[] = [];

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Limpiar todo el caché
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Obtener estadísticas del caché
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }

    /**
     * Limpiar entradas expiradas
     */
    cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }
}

// Singleton instance
export const cacheService = new CacheService();

// Cleanup task cada 10 minutos
setInterval(() => {
    cacheService.cleanup();
}, 10 * 60 * 1000);
