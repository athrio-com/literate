# Smoke

Minimal Manifest used to exercise the seed `tangle` CLI. Two fenced
blocks tangle to two files under `temp/seed-out/`. Re-running the
tangle overwrites the targets.

```typescript tangle="temp/seed-out/hello.ts"
export const greeting = "Hello from a tangled Manifest."
console.log(greeting)
```

```json tangle="temp/seed-out/meta.json"
{ "kind": "smoke", "ok": true }
```

A third fenced block carries no `tangle` attribute and is therefore
ignored by the tangler — it exists to exercise the negative case.

```typescript
const ignored = "this block has no tangle attribute"
```
