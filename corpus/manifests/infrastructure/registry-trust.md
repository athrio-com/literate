---
id: 4a2dcd7b
disposition: { base: 'Infrastructure', scope: 'registry-trust' }
layer: { kind: 'infrastructure', path: 'infrastructure', holds: 'domains' }
domain: registry-trust
status: Reconciled
---

# Registry Trust

Registry trust at v0.1 is **TLS-only**. There is no
content-hash verification, no signatures, no lock-file pinning,
no reproducibility attestation. The consumer's trust in a
vendored seed is exactly the trust the OS HTTPS PKI gives
them.

## What's protected

- **`https://` and `github:` fetches** — protected by TLS PKI.
  A man-in-the-middle attack on the network is detected by
  certificate validation. A compromised certificate authority
  (or a compromised `raw.githubusercontent.com`) would defeat
  this protection.
- **`file://` fetches** — **no transport trust**. The local
  filesystem is whatever the consumer's filesystem permissions
  give. `file://` is a development convenience, not a trust
  boundary.

## What's not protected

- **No content-hash verification.** The CLI does not compare
  the fetched file bytes to a known hash. A registry that
  silently changed a seed's content would not be detected by
  the CLI.
- **No signatures.** No PKI signature chain anchors a seed to
  its author.
- **No lock-file.** `literate.json` records the *ref* a
  consumer pinned to, not the file hashes that ref produced.
  Re-fetching at the same ref weeks later returns whatever the
  registry currently serves at that ref.

## Why TLS-only at v0.1

Three reasons:

1. **The threat model is permissive.** LF's seeds are public
   open-source artefacts; the dominant threat is "the network
   tampered with the bytes in flight," which TLS handles. The
   minor threat ("the registry author edited a seed in place
   weeks after I vendored it") is accepted as a known
   limitation.
2. **Consumers vendor.** The `tangle`-then-vendor model means
   the consumer owns the vendored copy after fetch. A
   silently-changed registry seed does not retroactively
   change a consumer's already-vendored files.
3. **Adding content-hash verification later is non-breaking.**
   v0.2 can add hash verification without changing the
   on-disk shape: a `sha256:` field in `manifest.json` becomes
   recommended-then-required.

## Forward path

Post-1.0 candidates for tightening trust:

- **Content-hash pinning in `manifest.json`.** Each entry
  carries the hash of the vendored bytes; `update` refuses to
  overwrite unless the new ref's hash is recorded too.
- **Lock-file across all seeds.** A repo-level lock file
  records every seed's ref and hash; `tangle` and `update`
  validate against the lock.
- **Signature chains.** A Concept author signs the seed; the
  CLI verifies the signature against a known-key list.

None of these ship at v0.1.

```path
packages/cli/src/registry/fetcher.ts
```

```path
packages/cli/src/registry/manifest.ts
```
