import { defineConfig } from 'vite'
import { copyFileSync, existsSync } from 'node:fs'
import { builtinModules, createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const requireFromHere = createRequire(import.meta.url)

const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]

const umd2esm = {
  name: 'umd2esm',
  enforce: 'pre' as const,
  resolveId(source: string, importer: string | undefined) {
    if (/^(vscode-.*-languageservice|jsonc-parser)/.test(source)) {
      const fromDir = importer ? dirname(importer) : here
      const resolved = requireFromHere.resolve(source, { paths: [fromDir] })
      return resolved.replace(/\/umd\//, '/esm/').replace(/\\umd\\/g, '\\esm\\')
    }
    return null
  },
}

const designAssets = {
  name: 'design-assets',
  closeBundle() {
    const design = resolve(here, '..', 'loom-design')
    const carried: ReadonlyArray<readonly [string, string]> = [
      [resolve(design, 'dist', 'overlay.js'), 'overlay.js'],
      [resolve(design, 'dist', 'ui.js'), 'ui.js'],
      [resolve(design, 'src', 'ui.html'), 'ui.html'],
    ]
    for (const [from, name] of carried) {
      if (!existsSync(from)) {
        throw new Error(
          `the CLI carries Design's ${name}, and ${from} is not built — run the Design build first`,
        )
      }
      copyFileSync(from, resolve(here, 'dist', name))
    }
  },
}

export default defineConfig({
  plugins: [umd2esm, designAssets],
  resolve: {
    conditions: ['node'],
    mainFields: ['main', 'module'],
    alias: {
      yaml: resolve(
        dirname(requireFromHere.resolve('yaml/package.json')),
        'browser/index.js',
      ),
      'vscode-uri': requireFromHere
        .resolve('vscode-uri')
        .replace(/esm[\\/]index\.mjs$/, 'umd/index.js'),
    },
  },
  build: {
    target: 'node20',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: resolve(here, 'src/main.ts'),
      formats: ['es'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [...nodeBuiltins, 'bun:sqlite', 'node:sqlite'],
      output: { banner: '#!/usr/bin/env node' },
    },
  },
})
