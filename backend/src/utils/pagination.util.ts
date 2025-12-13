/**
 * Utilidades para paginación con Prisma ORM
 */

import type { PaginationParams } from '@/shared/schemas/common.schema';

/** Resultado paginado con metadata */
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/** Crea una respuesta paginada con metadata calculada */
export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams
): PaginatedResult<T> {
    const { page, limit } = params;
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

/** Calcula el offset para Prisma */
export function calculateSkip(params: PaginationParams): number {
    return (params.page - 1) * params.limit;
}

/** Genera opciones de paginación para Prisma */
export function getPaginationOptions(params: PaginationParams) {
    return {
        skip: calculateSkip(params),
        take: params.limit,
    };
}

/**
 * Ejecuta query paginada con Prisma
 * Ejecuta count y findMany en paralelo para mejor performance
 */
export async function executePaginatedQuery<T>(
    countFn: () => Promise<number>,
    findFn: (options: { skip: number; take: number }) => Promise<T[]>,
    params: PaginationParams
): Promise<PaginatedResult<T>> {
    const [total, data] = await Promise.all([
        countFn(),
        findFn(getPaginationOptions(params)),
    ]);

    return createPaginatedResponse(data, total, params);
}
