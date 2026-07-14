# TokenTrail — Track Record

Master step-by-step log for the project. Update this file when any step completes.

**Obsidian mirror:** `obsidian/Track Record.md`  
**Detailed step docs:** `docs/steps/`

## Status snapshot

| Metric | Value |
| ------ | ----- |
| Version | V0.5 |
| Tests | 14+ passing |
| Benchmark agreement | 100% (3/3) |
| Surfaces live | package, CLI, benchmark, proxy, MCP |

---

## Phase 0 — Planning & vision

| Step | Status | Doc |
| ---- | ------ | --- |
| 0.1 Product roadmap written | ✅ | `docs/prompt-format-optimizer-roadmap.md` |
| 0.2 V0/V1/V2 build strategy agreed | ✅ | `obsidian/V0 - Rules Engine.md` |
| 0.3 Obsidian vault created | ✅ | `obsidian/TokenTrail.md` |
| 0.4 Multi-surface architecture defined | ✅ | `docs/surfaces.md` |

---

## Phase 1 — Core package (V0)

| Step | Status | Doc |
| ---- | ------ | --- |
| 1.1 Monorepo scaffold (pnpm workspaces) | ✅ | [[Step 1.1 Monorepo Scaffold]] |
| 1.2 `@tokentrail/core` module layout | ✅ | [[Step 1.2 Core Modules]] |
| 1.3 Prompt ingest + classifier | ✅ | [[Step 1.2 Core Modules]] |
| 1.4 Text token estimation | ✅ | [[Step 1.2 Core Modules]] |
| 1.5 Image variant estimation | ✅ | [[Step 1.2 Core Modules]] |
| 1.6 Readability + fidelity scoring | ✅ | [[Step 1.2 Core Modules]] |
| 1.7 Comparison engine | ✅ | `obsidian/Comparison Engine.md` |
| 1.8 Recommendation rules R1–R6 | ✅ | `obsidian/Recommendation Rules.md` |
| 1.9 Run logger (JSONL) | ✅ | `obsidian/Run Logger.md` |
| 1.10 Config files (rules, providers) | ✅ | `config/` |

---

## Phase 2 — Context & agent focus (V0.2)

| Step | Status | Doc |
| ---- | ------ | --- |
| 2.1 Claude 28×28 patch token math | ✅ | [[Step 2.1 Claude Patch Math]] |
| 2.2 Density detection (prose vs dense) | ✅ | [[Step 2.2 Context Token Savings]] |
| 2.3 Context savings analyzer | ✅ | `obsidian/Context Token Savings.md` |
| 2.4 Rules R7 (context image) + R8 (hybrid history) | ✅ | `docs/api.md` |
| 2.5 Fidelity capacity (98% / 97% zones) | ✅ | `config/fidelity-layouts.json` |

---

## Phase 3 — Render & validation (V0.3)

| Step | Status | Doc |
| ---- | ------ | --- |
| 3.1 Text layout + pagination | ✅ | [[Step 3.1 PNG Render Pipeline]] |
| 3.2 SVG render + sharp PNG output | ✅ | [[Step 3.1 PNG Render Pipeline]] |
| 3.3 CLI `--render-out` | ✅ | `docs/development.md` |
| 3.4 Benchmark runner (`pnpm benchmark`) | ✅ | [[Step 3.2 Benchmark Runner]] |
| 3.5 Benchmark corpus (3 samples) | ✅ | `data/benchmarks/` |

---

## Phase 4 — DX & agent integration (V0.4)

| Step | Status | Doc |
| ---- | ------ | --- |
| 4.1 CLI path resolution + sample aliases | ✅ | [[Step 4.1 CLI Path Resolution]] |
| 4.2 Fix repeated-system benchmark sample | ✅ | [[Step 3.2 Benchmark Runner]] |
| 4.3 Agent request analyzer in core | ✅ | [[Step 4.2 Agent Request Analyzer]] |
| 4.4 CLI `agent analyze` command | ✅ | [[Step 4.2 Agent Request Analyzer]] |
| 4.5 Track record + step docs | ✅ | `docs/TRACK.md` |
| 4.6 Agent role fix (JSON last user → tool_result) | ✅ | [[Step 4.2 Agent Request Analyzer]] |

## Phase 5 — Agent CLI proxy + Cursor MCP (V0.5) ← current

| Step | Status | Doc |
| ---- | ------ | --- |
| 5.1 Multi-agent HTTP proxy | ✅ | [[Step 5.1 Agent CLI Proxy]] |
| 5.2 Agent CLI setup guide | ✅ | `docs/agent-cli-setup.md` |
| 5.3 In-memory PNG buffers | ✅ | `packages/core/src/render/buffer.ts` |
| 5.4 MCP tools + global setup | ✅ | `docs/cursor-ide-setup.md` |
| 5.5 Expand benchmark corpus | 🔜 | `data/benchmarks/` |

## Phase 6 — Distribution (next)

| Step | Status | Doc |
| ---- | ------ | --- |
| 6.1 VS Code / Cursor extension | ⬜ | — |
| 6.2 Publish `@tokentrail/core` to npm | ⬜ | — |
| 6.3 V1 hybrid scoring weights | ⬜ | `obsidian/V1 - Hybrid Scoring.md` |

## Phase 7 — ML (deferred)

| Step | Status | Doc |
| ---- | ------ | --- |
| 7.1 200+ labeled runs | ⬜ | `obsidian/V2 - ML Ranking.md` |
| 7.2 ML ranker shadow mode | ⬜ | — |

---

## Working commands (copy exactly)

Run from repo root: `/Users/himanshuojha/Desktop/tokentrail`

```bash
pnpm install
pnpm build
```

Compare with alias:

```bash
pnpm compare layout-heavy --render-out ./out
```

Compare full path:

```bash
pnpm compare data/benchmarks/samples/layout-heavy-001.txt --render-out ./out
```

Benchmark:

```bash
pnpm benchmark
```

Agent plan:

```bash
node apps/cli/dist/index.js agent analyze agent-request
```

One-time global install:

```bash
pnpm setup
pnpm link --global --filter @tokentrail/cli
tokentrail compare layout-heavy
```

Cursor IDE (Gmail login) — MCP tools after setup + restart:

```bash
tokentrail setup
```

See `docs/cursor-ide-setup.md`

Start proxy (Claude / Cursor / Anthropic agents):

```bash
pnpm proxy:dev
```

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude
```

See `docs/agent-cli-setup.md`

Programmatic (no npm link needed):

```bash
node --input-type=module -e "import { comparePrompt } from './packages/core/dist/index.js'; const r = await comparePrompt({ prompt: 'hello', skipLog: true }); console.log(r.recommendation);"
```

---

## Changelog

| Date | Change |
| ---- | ------ |
| 2026-07-13 | V0.5: MCP server, `tokentrail setup`, global CLI path |
| 2026-07-13 | V0.5: multi-agent proxy (Claude/Cursor CLI) |
| 2026-07-13 | V0.4: path resolution, agent analyzer, track record |
| 2026-07-13 | V0.3: PNG render, benchmark runner, surfaces doc |
| 2026-07-13 | V0.2: context savings, Claude patch math |
| 2026-07-09 | V0.1: initial monorepo + rules engine |
