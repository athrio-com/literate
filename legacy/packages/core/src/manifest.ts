/**
 * @adr ADR-004
 *
 * Consumer manifest schema. The "literate" key inside a consumer's
 * package.json declares the LF version pin and the Trope packages to
 * install.
 *
 * v0.1 manifest shape:
 *   {
 *     "literate": {
 *       "version": "0.1.0",
 *       "tropes": ["@literate/trope-session", "@literate/trope-decisions"]
 *     }
 *   }
 *
 * Trope ids are package names so npm/Bun resolution does the work; the
 * CLI imports each package's default export to obtain its Trope value.
 */

import { Schema } from 'effect'

export const TropePackageName = Schema.String.pipe(
  Schema.pattern(/^@?[a-z0-9][a-z0-9-_/.]*$/i),
  Schema.brand('TropePackageName'),
)

export const LiterateManifest = Schema.Struct({
  version: Schema.String,
  tropes: Schema.Array(TropePackageName),
})

export type LiterateManifest = Schema.Schema.Type<typeof LiterateManifest>

export const PackageJsonWithLiterate = Schema.Struct({
  name: Schema.optional(Schema.String),
  version: Schema.optional(Schema.String),
  literate: LiterateManifest,
})

export type PackageJsonWithLiterate = Schema.Schema.Type<
  typeof PackageJsonWithLiterate
>
