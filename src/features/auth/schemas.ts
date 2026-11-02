import type { TFunction } from 'i18next';
import { z } from 'zod';

/** Built with `t` so client-side validation messages follow the active language. */
export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z.email(t('validation.email')),
    password: z.string().min(1, t('validation.required')),
    remember: z.boolean(),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
