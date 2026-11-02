import { z } from 'zod';

/**
 * The only file that reads `import.meta.env`. Only `VITE_` variables reach the browser, so never
 * put secrets in them. Every variable is listed in `.env.example`.
 */
const envSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1).default('NGP Starter'),
  // Empty means "same origin as this app": the Vite proxy in dev, or the API on the same domain.
  VITE_API_URL: z.union([z.literal(''), z.url({ protocol: /^https?$/ })]).default(''),
});

const env = envSchema.safeParse(import.meta.env);

if (!env.success) {
  // Fail at startup with a clear message instead of failing later on the first API call.
  throw new Error(
    `Invalid environment variables (see .env.example):\n${z.prettifyError(env.error)}`,
  );
}

export const config = {
  appName: env.data.VITE_APP_NAME,
  apiUrl: env.data.VITE_API_URL.replace(/\/+$/, ''),
} as const;
