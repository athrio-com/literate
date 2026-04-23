/**
 * Single source of truth for site-wide identity. Edit this file to
 * change wordmark, version, tagline, or GitHub URL in every surface at
 * once. Component files should never hard-code these strings.
 */

export const SITE = {
  name: 'literate',
  mark: '§',
  version: '0.1',
  versionFull: '0.1.0',
  tagline: 'Prose is the source.',
  releaseDate: '2026-04-22',
  description: 'Prose-first, gated, AI-collaborative software authoring.',
  license: 'MIT + Apache-2.0',
  github: 'https://github.com/athrio-com/literate',
  org: 'Athrio',
} as const
