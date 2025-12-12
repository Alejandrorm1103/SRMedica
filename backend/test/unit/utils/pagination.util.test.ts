import { describe, it, expect } from 'vitest';
import { executePaginatedQuery, createPaginatedResponse, calculateSkip, getPaginationOptions } from '@/utils/pagination.util';

describe('Pagination Utility', () => {
    describe('calculateSkip()', () => {
        it('should calculate correct skip value', () => {
            expect(calculateSkip({ page: 1, limit: 10 })).toBe(0);
            expect(calculateSkip({ page: 2, limit: 10 })).toBe(10);
            expect(calculateSkip({ page: 3, limit: 20 })).toBe(40);
        });
    });

    describe('getPaginationOptions()', () => {
        it('should return correct pagination options', () => {
            const options = getPaginationOptions({ page: 2, limit: 15 });
            expect(options).toEqual({
                skip: 15,
                take: 15,
            });
        });
    });

    describe('createPaginatedResponse()', () => {
        it('should create correct paginated response', () => {
            const data = [{ id: 1 }, { id: 2 }];
            const result = createPaginatedResponse(data, 100, { page: 1, limit: 10 });

            expect(result.data).toEqual(data);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 100,
                totalPages: 10,
                hasNext: true,
                hasPrev: false,
            });
        });

        it('should handle last page correctly', () => {
            const data = [{ id: 1 }];
            const result = createPaginatedResponse(data, 100, { page: 10, limit: 10 });

            expect(result.pagination.hasNext).toBe(false);
            expect(result.pagination.hasPrev).toBe(true);
        });

        it('should handle empty results', () => {
            const result = createPaginatedResponse([], 0, { page: 1, limit: 10 });

            expect(result.data).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
            expect(result.pagination.totalPages).toBe(0);
            expect(result.pagination.hasNext).toBe(false);
            expect(result.pagination.hasPrev).toBe(false);
        });
    });

    describe('executePaginatedQuery()', () => {
        it('should execute count and find in parallel', async () => {
            const mockCount = async () => 100;
            const mockFind = async ({ skip, take }: { skip: number; take: number }) => {
                return Array.from({ length: take }, (_, i) => ({
                    id: skip + i + 1,
                    name: `Item ${skip + i + 1}`,
                }));
            };

            const result = await executePaginatedQuery(mockCount, mockFind, { page: 1, limit: 10 });

            expect(result.data).toHaveLength(10);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 100,
                totalPages: 10,
                hasNext: true,
                hasPrev: false,
            });
        });

        it('should handle different pages', async () => {
            const mockCount = async () => 100;
            const mockFind = async ({ skip, take }: { skip: number; take: number }) => {
                return Array.from({ length: take }, (_, i) => ({
                    id: skip + i + 1,
                }));
            };

            const result = await executePaginatedQuery(mockCount, mockFind, { page: 3, limit: 20 });

            expect(result.data[0]?.id).toBe(41); // (3-1) * 20 + 1 = 41
            expect(result.pagination.totalPages).toBe(5); // 100 / 20 = 5
        });
    });
});
