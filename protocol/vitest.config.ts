import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    reporters: ['verbose'],
    setupFiles: ['./src/test/helpers/setup-mock-uploader.ts'],
  },
})
