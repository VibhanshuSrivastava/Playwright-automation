import { env } from '../config/env';

export const DEMO_CREDENTIALS = {
  email: env.DEMO_EMAIL,
  password: env.DEMO_PASSWORD,
} as const;
