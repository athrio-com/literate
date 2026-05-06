; Code blocks default to TypeScript — Loom's most common stack language.
; Per-block language overrides via [Lang] directives are not yet wired in;
; the LSP authoritatively resolves languages and supplies semantic tokens
; for tangled blocks.
((code_block) @injection.content
  (#set! injection.language "typescript")
  (#set! injection.include-children))
