# TokenTrail

Rules-first prompt format optimizer — compare text, image, and cached formats. **V0.2 adds agent context token savings** for tool results, history, and system blocks.

> TokenTrail is a rules-first prompt format optimizer today, with ML as a later ranking layer once enough benchmark data exists.

## Quick start

```bash
pnpm install
pnpm build
pnpm setup
pnpm link --global --filter @tokentrail/cli
```

Then use from **any directory**:

```bash
tokentrail optimize large-log.txt --out ./optimized --task large-log
tokentrail measure record run.json --task large-log --variant text
tokentrail measure report --task large-log
tokentrail agent analyze agent-request
tokentrail proxy
```

**Cursor IDE (Gmail login):** `tokentrail setup` registers MCP tools — see `docs/cursor-ide-setup.md`

From repo without global link:

```bash
pnpm compare data/benchmarks/samples/code-heavy-001.txt
```

Agent context (tool result / logs):

```bash
node apps/cli/dist/index.js compare payload.json --context-role tool_result --density dense
```

With cache baseline:

```bash
pnpm compare data/benchmarks/samples/repeated-system-001.txt --reuse 10
```

## V0.3 features

- Claude **28×28 patch** visual token math (replaces legacy tile model)
- **Density-aware** token estimates (prose vs dense code/JSON)
- **Fidelity capacity** — words/page at 98% and 97% accuracy zones
- **Context savings** — target agent context blocks (tool results, history, system)
- **PNG render** — `sharp` + SVG, multi-page output
- **`pnpm benchmark`** — score engine vs labeled corpus
- **Multi-surface architecture** — same core for CLI, agent CLIs, extensions (see `docs/surfaces.md`)

## Surfaces (package-first)

| Surface | Status | Usage |
| ------- | ------ | ----- |
| `@tokentrail/core` | ✅ | `import { comparePrompt, renderPromptToPng }` |
| `tokentrail` CLI | ✅ | `optimize`, `measure record/report`, `proxy` |
| **Cursor MCP** | ✅ | `tokentrail_optimize`, `tokentrail_measure_record` |
| VS Code extension | 🔜 | Editor panel |

## Project structure

```
tokentrail/
├── packages/core/          # @tokentrail/core — comparison engine
├── apps/cli/               # tokentrail CLI
├── config/                 # rules + provider profiles
├── data/
│   ├── benchmarks/         # labeled sample prompts
│   └── runs/               # JSONL run logs
├── docs/                   # development + API docs
└── obsidian/               # linked knowledge base
```

## Docs

| Doc | Purpose |
| --- | ------- |
| `docs/unified-surfaces.md` | CLI + MCP + IDE — actual tokens & cost |
| `docs/optimize-workflow.md` | Local optimize — no MCP token cost |
| `docs/api.md` | `comparePrompt` API + rule IDs |
| `docs/prompt-format-optimizer-roadmap.md` | Full product roadmap |
| `obsidian/TokenTrail.md` | Obsidian vault home |

## Build approach

| Stage | Approach |
| ----- | -------- |
| V0 | Rule-based comparison engine + logging |
| V1 | Hand-tuned hybrid scoring |
| V2 | ML ranking after 200+ labeled runs |

## Obsidian

Open `obsidian/` as a vault in Obsidian. Start at **TokenTrail.md**.

## License

Proprietary — see [LICENSE](LICENSE). Source may be viewed for **evaluation only**. Commercial or production use, redistribution, modification, or incorporation into other projects requires prior written permission from Himanshu Ojha ([ojhimanshu@gmail.com](mailto:ojhimanshu@gmail.com)).
