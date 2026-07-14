# Step 5.1 — Agent CLI Proxy

## Status

✅ Implemented — `apps/proxy`

## Supported agents

| Agent | Setup |
| ----- | ----- |
| Claude Code / Claude CLI | `ANTHROPIC_BASE_URL=http://127.0.0.1:47821` |
| Cursor CLI / agent | Same when API base URL is configurable |
| Any Anthropic-compatible tool | `ANTHROPIC_BASE_URL` override |

## Commands

```bash
pnpm proxy:dev
```

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude
```

## Endpoints

| Path | Purpose |
| ---- | ------- |
| `POST /v1/messages` | Intercept + transform + forward |
| `GET /tokentrail/health` | Health check |
| `GET /tokentrail/stats` | Transform counters |
| `GET /tokentrail/setup` | Agent env JSON |

## Core functions used

- `analyzeAgentRequest()` — per-block plan
- `transformMessagesForProxy()` — render PNG buffers + rebuild messages
- `logProxyTransform()` — `data/runs/proxy/*.jsonl`

## Files

- `apps/proxy/src/server.ts`
- `apps/proxy/src/transform.ts`
- `apps/proxy/src/anthropic.ts`
- `packages/core/src/agent/transform-messages.ts`
- `packages/core/src/render/buffer.ts`

## Full guide

`docs/agent-cli-setup.md`

## Next

[[Step 5.2 MCP Tools]] · Expand benchmark corpus
