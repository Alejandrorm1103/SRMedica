import { describe, it, expect } from 'vitest';
import { ok, paged } from '@/utils/response.util';

describe('Response Utilities', () => {
    describe('ok()', () => {
        it('should return success response with data', () => {
            const data = { id: 1, name: 'Test' };
            const response = ok(data);

            expect(response).toEqual({
                ok: true,
                data: { id: 1, name: 'Test' },
            });
        });

        it('should work with arrays', () => {
            const data = [1, 2, 3];
            const response = ok(data);

            expect(response).toEqual({
                ok: true,
                data: [1, 2, 3],
            });
        });

        it('should work with null', () => {
            const response = ok(null);

            expect(response).toEqual({
                ok: true,
                data: null,
            });
        });
    });

    describe('paged()', () => {
        it('should return paginated response with metadata', () => {
            const data = [{ id: 1 }, { id: 2 }];
            const response = paged(data, 100, 1, 10);

            expect(response).toEqual({
                ok: true,
                data: [{ id: 1 }, { id: 2 }],
                meta: {
                    total: 100,
                    page: 1,
                    size: 10,
                },
            });
        });

        it('should work with empty array', () => {
            const response = paged([], 0, 1, 10);

            expect(response).toEqual({
                ok: true,
                data: [],
                meta: {
                    total: 0,
                    page: 1,
                    size: 10,
                },
            });
        });

        it('should handle different page sizes', () => {
            const data = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));
            const response = paged(data, 500, 2, 50);

            expect(response.meta).toEqual({
                total: 500,
                page: 2,
                size: 50,
            });
        });
    });
});
