import { z } from 'zod';
export const UserUpdateDTO = z.object({
  telefono: z.string().min(7).max(30).optional(),
});
export const UserListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  size: z.coerce.number().int().min(1).max(100).default(20).optional(),
  estado: z.coerce.boolean().optional(),
});
export type TUserUpdateDTO = z.infer<typeof UserUpdateDTO>;
