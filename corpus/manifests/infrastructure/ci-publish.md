::metadata{id=c1fa127a, disposition={ base: 'Infrastructure', scope: 'ci-publish' }, layer={ kind: 'infrastructure', path: 'infrastructure', holds: 'domains' }, domain=ci-publish, status=Reconciled}

# CI Publish

The npm publish for `@literate/cli` runs through GitHub Actions
**Trusted Publishing** with **OIDC** authentication. The
`publish.yml` workflow runs on tag pushes; the workflow exchanges
a GitHub OIDC token for an npm publish credential without
storing a long-lived secret.

## Publish flow

1. A maintainer tags a release: `git tag v0.1.0-alpha.X &&
   git push --tags`.
2. GitHub Actions fires the workflow at
   `.github/workflows/publish.yml`.
3. The workflow:
   - Checks out the repo.
   - Installs Bun.
   - Builds the CLI bundle (`bun run --filter @literate/cli build`).
   - Verifies the package manifest reads the version from
     `package.json` (matching the tag).
   - Authenticates to npm via OIDC (no token in repo secrets).
   - Publishes `@literate/cli`.
   - On success, creates a GitHub release.

## Trusted Publishing

npm's Trusted Publishing model accepts a GitHub OIDC token as
proof of identity without requiring a long-lived `NODE_AUTH_TOKEN`
secret in the repository. The trust is configured on npm's side:
the `@literate/cli` package's settings on registry.npmjs.org list
the GitHub repository and workflow file as trusted. A push to
that workflow (and only that workflow) can publish.

## Manual fallback

When OIDC publishing fails (npm registry incident, token-exchange
failure), a maintainer can publish locally with `npm publish`
using a personal access token. This path is for incident response
only; the canonical publish channel is the workflow.

## Tag-to-version reconciliation

The workflow asserts that the git tag matches the version in
`packages/cli/package.json`. A mismatch fails the workflow before
publish. The version in `package.json` is the source of truth;
the tag is a pointer.

## Smoke testing the publish

Post-publish, a verification job runs `bun install -g
@literate/cli@<version>` against fresh `ubuntu:24.04` and
`windows-latest` runners and confirms the binary works. A
failure does not unpublish the version (npm semantics) but
flags the release as "publishable but not smoke-verified."

## Why Trusted Publishing instead of npm tokens

A long-lived npm token in repo secrets is a credential leak
risk. Trusted Publishing avoids the risk entirely: the
credential is materialised at publish time from the GitHub
OIDC identity and is not stored anywhere persistent.

```path
.github/workflows/publish.yml
```

```path
packages/cli/package.json
```
