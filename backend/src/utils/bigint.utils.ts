/**
 * Utilidades para trabajar con BigInt de forma segura
 * Prisma genera tipos BigInt pero a veces necesitamos number
 */

/**
 * Convierte un bigint a number de forma segura
 * Lanza error si el valor es demasiado grande
 */
export function bigintToNumber(value: bigint): number {
    const num = Number(value);
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
        throw new Error(`BigInt value ${value} is too large to convert to number safely`);
    }
    return num;
}

/**
 * Convierte un number a bigint
 */
export function numberToBigint(value: number): bigint {
    return BigInt(Math.floor(value));
}

/**
 * Convierte un bigint | null a number | null
 */
export function bigintToNumberOrNull(value: bigint | null): number | null {
    if (value === null) {
        return null;
    }
    return bigintToNumber(value);
}

/**
 * Convierte un number | null a bigint | null
 */
export function numberToBigintOrNull(value: number | null): bigint | null {
    if (value === null) {
        return null;
    }
    return numberToBigint(value);
}
