import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(dirname, '..', '..', '.env'), quiet: true });

export const env = {
  BASE_URL: process.env.BASE_URL ?? 'http://localhost:5173',
  API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3000/api/',
  DEMO_EMAIL: process.env.DEMO_EMAIL ?? 'admin@taskflow.com',
  DEMO_PASSWORD: process.env.DEMO_PASSWORD ?? 'Admin@123',
} as const;
