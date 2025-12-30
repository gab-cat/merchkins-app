import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'edge-runtime',
    server: { deps: { inline: ['convex-test'] } },
    env: {
      IS_TEST_MODE: 'true',
    },
  },
});
