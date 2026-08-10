import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { loomDevtools } from '@athrio/loom-devtools/vite'

const vitePort = Number(process.env.VITE_PORT ?? 5200)

export default defineConfig({
  esbuild: { target: 'es2022' },
  appType: 'mpa',
  plugins: [loomDevtools({ project: 'loom-website' })],
  server: {
    port: vitePort,
    hmr: { clientPort: vitePort },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    rollupOptions: {
      input: { index: fileURLToPath(new URL('index.html', import.meta.url)) },
    },
  },
})
