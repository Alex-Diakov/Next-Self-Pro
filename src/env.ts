/// <reference types="vite/client" />
import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is missing'),
});

// We combine import.meta.env and process.env to capture both Vite's standard env vars
// and the custom define from vite.config.ts
const envVars = {
  ...import.meta.env,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

const parsedEnv = envSchema.safeParse(envVars);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('❌ Invalid environment variables: ' + JSON.stringify(parsedEnv.error.format()));
}

export const env = parsedEnv.data;
