import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((env) => {
  return mergeConfig(
    typeof viteConfig === 'function' ? viteConfig(env) : viteConfig,
    defineConfig({
      test: {
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'tests/e2e/**'],
      },
    })
  );
});
