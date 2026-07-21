# TokenTrail — Unified Surfaces (CLI + MCP + IDE)

**Goal:** real token counts, real cost, real optimization — same engine everywhere.

```
                    @tokentrail/core
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
  CLI (primary)        MCP (IDE)            Proxy (API key)
  optimize             tokentrail_optimize   auto-transform
  measure              tokentrail_measure    usage logging
  compare              _record
```

---

## Recommended workflow (Cursor IDE + Google SSO)

### 1. Optimize locally (zero LLM tokens)

```bash
cd ~/Desktop/tokentrail

node apps/cli/dist/index.js optimize test-results/large-log.txt \
  --context-role tool_result --density dense \
  --out ./test-results/optimized-large-log \
  --task large-log
```

Output: `manifest.json`, `agent-context.txt`, `pages/*.png`

### 2. Run agent with optimized context

**Text baseline (measure A):**

```bash
/Users/himanshuojha/.local/bin/cursor-agent -p --output-format json --trust --force \
  --workspace ~/Desktop/tokentrail \
  "Read test-results/large-log.txt. Top 3 error patterns in 3 bullets. No MCP." \
  | tee test-results/text-run.json
```

**Image optimized (measure B):**

- Open `cursor-agent` interactively
- Drag PNGs from `test-results/optimized-large-log/pages/`
- Use prompt from `agent-context.txt`

### 3. Record actual usage + cost

```bash
node apps/cli/dist/index.js measure record test-results/text-run.json \
  --task large-log --variant text --estimated 21675

node apps/cli/dist/index.js measure record test-results/image-run.json \
  --task large-log --variant optimized --projected 3136
```

### 4. Report savings

```bash
node apps/cli/dist/index.js measure report --task large-log
```

Shows:
- Actual `inputTokens` saved
- **USD cost** saved (from `config/pricing.json`)
- Estimate vs actual delta

---

## MCP in Cursor IDE

After `tokentrail setup`, restart Cursor.

| Tool | When to use |
| ---- | ----------- |
| **`tokentrail_optimize`** | Primary — local optimize + PNG paths |
| **`tokentrail_measure_record`** | After agent run — paste usage JSON |
| `tokentrail_compare` | Estimate only (avoid in hot path) |
| `tokentrail_agent_plan` | Multi-message planning |
| `tokentrail_render` | Base64 PNG (prefer optimize) |

**In Agent chat:**

> Use `tokentrail_optimize` on `test-results/large-log.txt` with context_role=tool_result density=dense out_dir=./optimized

> After I run the agent, I'll give you usage JSON — call `tokentrail_measure_record` with task=large-log variant=optimized

---

## Claude CLI (API key) — automatic path

```bash
node apps/cli/dist/index.js proxy
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude
```

Proxy:
- Transforms requests before upstream
- Logs **actual** `usage` from Anthropic responses
- Records to `data/runs/usage/*.jsonl`

```bash
node apps/cli/dist/index.js measure report --task proxy-claude
```

---

## Surface comparison

| Surface | Optimization | Actual usage | Cost |
| ------- | ------------ | ------------ | ---- |
| **CLI `optimize`** | ✅ Local | via `measure record` | ✅ |
| **MCP `tokentrail_optimize`** | ✅ Local | via `measure_record` | ✅ |
| **Proxy** | ✅ Auto | ✅ Auto-logged | ✅ |
| **IDE extension** | 🔜 Phase 6 | 🔜 | 🔜 |
| MCP `compare` only | ❌ Adds tokens | ❌ | ❌ |

---

## Data locations

| Path | Contents |
| ---- | -------- |
| `data/runs/usage/*.jsonl` | Actual usage + cost records |
| `config/pricing.json` | Model pricing for USD estimates |
| `tokentrail-out/manifest.json` | Per-optimize token math |

---

## Extension (future)

VS Code / Cursor extension will call the same core:
- Side panel: optimize → attach → measure
- No duplicate logic

See `docs/surfaces.md` for architecture.
