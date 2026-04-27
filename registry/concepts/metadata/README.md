# `metadata` — Concept seed

A **Metadata block** is the typed key→value record an authored
prose file carries at its head. The canonical wire form is the
leaf directive `::metadata{key=val, ...}`; the legacy form is
the YAML `---` fence, retired mechanically by `reconcile`.
Values are opaque strings at the substrate level; downstream
consumers (LFMs, future typed prose surfaces) interpret the
values against their own typed schemas.
