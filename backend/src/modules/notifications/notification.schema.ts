import { z } from 'zod';
export const ResendDTO = z.object({ envioId: z.number() });
export const SetPreferenceDTO = z.object({ canalId: z.number(), habilitado: z.boolean() });
