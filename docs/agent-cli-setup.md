# Agent CLI Setup — Claude, Cursor, and more

TokenTrail proxy sits between your CLI agent and the upstream API. **One proxy, many agents** — any tool that supports `ANTHROPIC_BASE_URL` (or OpenAI-compatible base URL) can use it.

## 1. Start the proxy

```bash
cd tokentrail
pnpm install
pnpm build
pnpm proxy:dev
```

Default listen: `http://127.0.0.1:47821`

Dashboard:

- Health: `http://127.0.0.1:47821/tokentrail/health`
- Stats: `http://127.0.0.1:47821/tokentrail/stats`
- Setup JSON: `http://127.0.0.1:47821/tokentrail/setup`

## 2. Claude Code / Claude CLI

```bash
export ANTHROPIC_API_KEY=your-key
export ANTHROPIC_BASE_URL=http://127.0.0.1:47821
claude
```

One-liner:

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude
```

## 3. Cursor CLI / Cursor Agent

When Cursor routes through a configurable Anthropic/OpenAI-compatible endpoint:

```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:47821
cursor agent
```

If your Cursor build uses internal API routing only (no base URL override), use:

- `pnpm compare` / `pnpm agent analyze` on context files manually, or
- MCP integration (planned — see `docs/TRACK.md` Phase 5.2)

## 4. Any Anthropic-compatible agent

Set:

```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:47821
```

Keep your normal `ANTHROPIC_API_KEY`. The proxy forwards auth headers to `api.anthropic.com`.

## Environment variables

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `TOKENTRAIL_PROXY_PORT` | `47821` | Listen port |
| `TOKENTRAIL_PROXY_HOST` | `127.0.0.1` | Bind address |
| `TOKENTRAIL_UPSTREAM` | `https://api.anthropic.com` | Upstream API |
| `TOKENTRAIL_PROXY_ENABLED` | `true` | Set `false` to passthrough only |
| `TOKENTRAIL_REUSE_COUNT` | `10` | Cache baseline for system blocks |
| `TOKENTRAIL_RECENT_TURNS` | `2` | Keep recent turns as text |
| `TOKENTRAIL_PROXY_LOG` | `true` | Log transforms to `data/runs/proxy/` |

## What the proxy transforms

| Block type | Typical action |
| ---------- | -------------- |
| System (reused) | cache (no image) |
| Tool result JSON/logs | image |
| Old conversation | image (if not recent) |
| Latest user message | keep text |
| Code-heavy exact paths | keep text (rules R2/R3) |

## Disable transforms (passthrough mode)

```bash
TOKENTRAIL_PROXY_ENABLED=false pnpm proxy:dev
```

Still useful as a local API logger / stats dashboard.

## Architecture

```
Claude CLI ──┐
Cursor CLI ──┼──► TokenTrail proxy ──► api.anthropic.com
Other agent ─┘         │
                       └── @tokentrail/core (rules + render)
```

See `docs/surfaces.md` and `obsidian/Step 5.1 Agent CLI Proxy.md`.
