# TokenTrail — Local Optimize Workflow

**Goal:** reduce input/context tokens **without MCP** (zero extra LLM cost).

## Command

```bash
cd /Users/himanshuojha/Desktop/tokentrail

node apps/cli/dist/index.js optimize test-results/large-log.txt \
  --context-role tool_result \
  --density dense \
  --out ./test-results/optimized-large-log
```

## Output

```
test-results/optimized-large-log/
├── manifest.json       # recommendation, token math, page paths
├── agent-context.txt   # instructions + suggested cursor-agent prompt
└── pages/
    ├── tokentrail-p001.png
    ├── tokentrail-p002.png
    └── tokentrail-p003.png
```

## Actions

| Action | When | What you send to agent |
| ------ | ---- | ---------------------- |
| `keep_text` | Small blocks (R6) | Original text file |
| `cache_hint` | Repeated system (R1) | Same text + enable caching |
| `render_image` | Large dense logs (R7) | Attach PNG pages only |
| `hybrid` | Layout-heavy (R5) | Short text + PNG pages |

## A/B test (real tokens)

**Run A — text (baseline):**

```bash
/Users/himanshuojha/.local/bin/cursor-agent -p --output-format json --trust --force \
  --workspace /Users/himanshuojha/Desktop/tokentrail \
  "Read test-results/large-log.txt. List top 3 error patterns in 3 bullets. No MCP." \
  | jq '.usage'
```

**Run B — optimized (no MCP):**

1. `node apps/cli/dist/index.js optimize test-results/large-log.txt --out ./test-results/optimized-large-log ...`
2. Open `cursor-agent` interactively
3. **Drag** PNGs from `test-results/optimized-large-log/pages/` (do not paste paths)
4. Use prompt from `agent-context.txt`
5. Compare token count in UI context ring

## Why not MCP?

`tokentrail_compare` inside cursor-agent adds ~2–3k+ input tokens per call.  
`optimize` runs **100% locally** — compare + render + manifest.
