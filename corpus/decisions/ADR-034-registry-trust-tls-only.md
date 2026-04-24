# ADR-034 — Registry trust: TLS-only at 0.1.0-alpha

**Status:** Accepted
**Date:** 2026-04-24
**Tags:** `#release` `#tooling` `#self-hosting`
**Supersedes:** —
**Superseded by:** —

## Context

ADR-026 (registry mechanics) names three fetcher backends —
`file://`, `github:`, `https:` — and leaves the question of
**registry trust** explicitly open (cf. ADR-025 §5: "open
question — registry trust" and the old P8 G2). At
0.1.0-alpha, three trust mechanisms were on the table:

- **TLS-only** — trust the underlying HTTPS PKI when fetching
  from a remote registry. `file://` requires no transport
  trust. Simplest by far.
- **Content-addressable** — record each seed's content hash
  in `.literate/manifest.json` and re-validate on fetch.
  Robust against silent server-side mutation; still relies on
  TLS for the initial fetch.
- **Signed** — registries publish per-seed signatures (GPG or
  Sigstore); the CLI verifies them at fetch time. Most
  defensible against a hostile registry; heaviest by far in
  authoring overhead, key management, and CLI dependencies.

LF has no consumers yet. There is no threat model worth
defending against beyond what HTTPS PKI already provides. Any
trust mechanism heavier than TLS at this stage is speculative
infrastructure that constrains future choice without
discharging present risk.

## Decision

**Registry trust at 0.1.0-alpha is TLS-only.**

- `file://` and bare-path registries require no transport
  trust — they're operating against the local filesystem and
  the consumer's own access control governs what they read.
- `github:` registries fetch via
  `https://raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>` and
  rely on TLS certificate validation of the underlying HTTPS
  transport (handled by the runtime's `fetch`).
- `https:` registries (when a backend is added — not in
  v0.1) rely on the same TLS validation.
- **No content-hash verification.** `.literate/manifest.json`
  records `fetchedAt` (when the seed was vendored) but not a
  content hash; re-fetch via `literate update` simply
  overwrites.
- **No signature verification.** No GPG, no Sigstore, no
  reproducibility attestation.
- **No lock-file pinning.** A consumer pins by setting
  `ref:` to a specific commit SHA in their `literate.json`;
  the registry resolution is verbatim from there.

The `FetcherService` already implements this — see
`packages/cli/src/registry/fetcher.ts`. No code change is
required; this ADR records the decision.

## Consequences

**Positive:**

- **Simplest acceptable surface.** A consumer can install LF
  and use any registry without configuring keys, hashes, or
  trust roots beyond what their OS already trusts for HTTPS.
- **Zero new dependencies.** No GPG runtime, no Sigstore
  library, no hash algorithms beyond the runtime defaults.
- **Future-compatible.** Stronger mechanisms (content-hash,
  signatures, trust roots) layer on top without changing the
  current backends — they become additional verification
  steps inside `FetcherService`.

**Negative / accepted at 0.1.0-alpha:**

- **No defence against silent server-side mutation.** A
  registry maintainer (or an attacker with push access to a
  GitHub repo) can change the contents of a `ref:`-pinned
  seed without trace if the consumer doesn't pin to a
  commit SHA. Even with a SHA pin, GitHub history-rewrites
  could change the resolved bytes.
- **No defence against compromised TLS PKI.** A misissued
  certificate against `raw.githubusercontent.com` or any
  `https:` registry hostname would let an attacker serve
  arbitrary seed content. This is the same posture as `npm
  install` over HTTPS without `--integrity` and is acceptable
  at LF's current adoption stage.
- **No reproducibility attestation.** Two `literate tangle`
  invocations against `ref: main` may return different
  bytes if `main` advances; the manifest captures `fetchedAt`
  but not the resolved content hash.

**Forward / explicitly deferred:**

- A future ADR (when there's real adoption and a threat
  model worth defending against) may add content-addressable
  verification — manifest extension recording per-file
  hashes, `literate update --verify` mode, fetch-time
  re-validation.
- Sigstore-style signatures are deferred until LF (or its
  registry maintainers) operates a signing infrastructure.
  No commitment.
- Consumer-controlled trust roots
  (`literate.json: { trust: { roots: [...] } }`) are deferred
  until at least one consumer requests them.

Per ADR-026 §1, `FetcherService` adds trust mechanisms by
extending the per-backend implementation; the verb surface
stays unchanged. ADR-034 commits to nothing about backend
addition or removal — it commits only to the trust-policy
posture at 0.1.0-alpha.
