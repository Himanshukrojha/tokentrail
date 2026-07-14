# Development Guide

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
cd tokentrail
pnpm install
pnpm build
```

## Run a comparison

**Use aliases or full paths. Do not paste `#` comment lines into the terminal.**

```bash
pnpm compare layout-heavy

pnpm compare data/benchmarks/samples/code-heavy-001.txt

pnpm compare layout-heavy --render-out ./out

pnpm compare repeated-system --reuse 10

pnpm compare tool-result --context-role tool_result --density dense

pnpm compare data/benchmarks/samples/layout-heavy-001.txt --json
```

## Agent request plan

```bash
node apps/cli/dist/index.js agent analyze agent-request
```

## Agent CLI proxy (Claude, Cursor, Anthropic)

```bash
pnpm proxy:dev
```

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude
```

Guide: `docs/agent-cli-setup.md`

## Programmatic use (from repo root)

`@tokentrail/core` is not linked at repo root. Import the built dist:

```bash
node --input-type=module -e "import { comparePrompt } from './packages/core/dist/index.js'; const r = await comparePrompt({ prompt: 'hello', skipLog: true }); console.log(r.recommendation);"
```

## Project layout

```
tokentrail/
├── packages/core/     # @tokentrail/core — engine
├── apps/cli/          # tokentrail CLI
├── apps/benchmark/    # benchmark runner
├── config/            # rules + provider profiles
├── data/
│   ├── benchmarks/    # labeled corpus
│   └── runs/          # JSONL logs
├── docs/
│   ├── TRACK.md       # step-by-step progress log
│   └── steps/         # detailed step docs
└── obsidian/          # linked knowledge base
```

## Tests

```bash
pnpm test
```

## Benchmark

```bash
pnpm benchmark
```

## Track record

See `docs/TRACK.md` and `obsidian/Track Record.md` for all completed and pending steps.

## Multi-surface architecture

All surfaces call `@tokentrail/core` only. See `docs/surfaces.md`.

## Config changes

| File | Purpose |
| ---- | ------- |
| `config/rules.json` | Rule thresholds (R1–R8) |
| `config/scoring-weights.json` | V1 hybrid weights |
| `config/providers/claude.json` | Visual token + cache math |
| `config/fidelity-layouts.json` | 98% / 97% layout presets |

## Module flow

```
ingest → classify → estimate/render/score → compare → recommend → log
agent: messages[] → analyzeAgentRequest → per-block plan
```

## Next tasks

See `docs/TRACK.md` Phase 5 — proxy, MCP, IDE extension.
