# Track Record

Step-by-step project log. Master copy: `docs/TRACK.md`

## Current phase

**V0.5** — Multi-agent HTTP proxy for Claude CLI, Cursor CLI, Anthropic-compatible agents.

## Quick links

- [[Step 5.1 Agent CLI Proxy]]
- [[Step 5.2 MCP Tools]] (next)
- [[Step 4.2 Agent Request Analyzer]]
- [[Surfaces Architecture]]
- [[Context Token Savings]]

## Completed highlights

- ✅ Package-first monorepo
- ✅ Rules engine R1–R8
- ✅ Context token savings
- ✅ PNG render pipeline
- ✅ Benchmark runner (100% on 3 cases)
- ✅ Agent request analyzer
- ✅ Multi-agent proxy (`apps/proxy`)

## Next up

1. MCP tools for Cursor-internal routing
2. Expand benchmark corpus to 10+
3. VS Code / Cursor extension panel

## Commands (copy exactly)

```bash
pnpm proxy:dev
```

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude
```

```bash
pnpm compare layout-heavy --render-out ./out
pnpm benchmark
node apps/cli/dist/index.js agent analyze agent-request
```

Full guide: `docs/agent-cli-setup.md`

Do not paste comment lines (`# ...`) into the terminal.
