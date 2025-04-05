import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VerxioProtocol',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        '@metaplex-foundation/umi',
        '@metaplex-foundation/mpl-core',
        '@metaplex-foundation/mpl-token-metadata',
      ],
      output: {
        globals: {
          '@metaplex-foundation/umi': 'Umi',
          '@metaplex-foundation/mpl-core': 'MplCore',
          '@metaplex-foundation/mpl-token-metadata': 'MplTokenMetadata',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@schemas': resolve(__dirname, 'src/schemas'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@lib': resolve(__dirname, 'src/lib'),
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts'],
    }),
  ],
})
