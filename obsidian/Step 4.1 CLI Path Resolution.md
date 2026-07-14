# Step 4.1 — CLI Path Resolution

## Problem

Users ran:

```bash
node apps/cli/dist/index.js compare layout-heavy.txt --render-out ./out
```

Errors:
- `ENOENT` — file not at cwd-relative path
- Pasting `# comment` on same line → `zsh: command not found: #`

## Solution

`resolveInputPath()` in `@tokentrail/core`:

1. Resolve from current working directory
2. Resolve from TokenTrail repo root (`config/rules.json` walk-up)
3. Sample aliases: `layout-heavy`, `code-heavy`, `repeated-system`, `tool-result`, `agent-request`
4. Try `data/benchmarks/samples/{file}`

## Usage

```bash
pnpm compare layout-heavy
pnpm compare data/benchmarks/samples/layout-heavy-001.txt
```

## Files

- `packages/core/src/paths/resolve.ts`
- `apps/cli/src/index.ts` — uses `resolveInputPath`

## Related

[[Track Record]] · [[Surfaces Architecture]]
