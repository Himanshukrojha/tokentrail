# Step 1.1 — Monorepo Scaffold

## What

pnpm workspace with `packages/core`, `apps/cli`, shared `tsconfig.base.json`.

## Why

Package-first: one engine, many surfaces (CLI, proxy, extension).

## Structure

```
tokentrail/
├── packages/core/
├── apps/cli/
├── config/
├── data/
├── docs/
└── obsidian/
```

## Commands

```bash
pnpm install
pnpm build
pnpm test
```

## Related

[[Technical Architecture]] · [[Track Record]]
