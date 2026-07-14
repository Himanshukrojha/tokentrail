# Cursor IDE + Global CLI Setup

Use TokenTrail **like a normal CLI tool** and **inside Cursor Agent** (Gmail login).

---

## One-time install (3 commands)

```bash
git clone <your-tokentrail-repo> ~/tokentrail
cd ~/tokentrail
pnpm install
pnpm build
pnpm setup
```

`pnpm setup` does:
1. Copies config + benchmarks to `~/.tokentrail/`
2. Registers **TokenTrail MCP** in `~/.cursor/mcp.json`
3. Prints global CLI instructions

### Install global `tokentrail` command

```bash
cd ~/tokentrail
pnpm link --global --filter @tokentrail/cli
```

Verify:

```bash
tokentrail --version
tokentrail compare layout-heavy
```

---

## Use in terminal (anywhere)

After global link:

```bash
tokentrail compare my-prompt.txt

tokentrail compare "long inline prompt text" --text

tokentrail compare tool-output.json --context-role tool_result --density dense

tokentrail compare layout-heavy --render-out ./out

tokentrail agent analyze agent-request

tokentrail benchmark

tokentrail proxy
```

Without global link (from repo):

```bash
cd ~/tokentrail
pnpm compare layout-heavy
node apps/cli/dist/index.js setup
```

---

## Use in Cursor IDE (Gmail login)

Cursor Agent with Gmail **does not** use `ANTHROPIC_BASE_URL`.  
Use **MCP tools** instead (registered by `tokentrail setup`).

### 1. Restart Cursor after setup

`pnpm setup` writes `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "tokentrail": {
      "command": "node",
      "args": ["/path/to/tokentrail/apps/mcp/dist/index.js"],
      "env": { "TOKENTRAIL_ROOT": "/Users/you/.tokentrail" }
    }
  }
}
```

### 2. Confirm MCP in Cursor

**Cursor Settings → MCP** — you should see `tokentrail` with 3 tools:

| Tool | What it does |
| ---- | ------------ |
| `tokentrail_compare` | Analyze one prompt/context block |
| `tokentrail_agent_plan` | Plan full agent messages |
| `tokentrail_render` | Render PNG base64 for image context |

### 3. Ask Cursor Agent to use it

In Agent chat:

> Use `tokentrail_compare` on this tool output and tell me if I should keep it as text or convert to image.

> Use `tokentrail_agent_plan` on these messages and show projected token savings.

> Use `tokentrail_render` on this log block and give me the base64 PNG pages.

---

## Claude CLI (API key — automatic proxy)

```bash
tokentrail proxy
```

New terminal:

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:47821 claude
```

---

## Which path for you?

| You use | Setup |
| ------- | ----- |
| **Cursor IDE + Gmail** | `tokentrail setup` → MCP tools in Agent |
| **Terminal only** | `pnpm link --global` → `tokentrail compare` |
| **Claude CLI + API key** | `tokentrail proxy` + `ANTHROPIC_BASE_URL` |
| **All of the above** | Run `setup` + global link + proxy when needed |

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `config not found` | Run `tokentrail setup` |
| MCP not in Cursor | Restart Cursor; check `~/.cursor/mcp.json` |
| `tokentrail: command not found` | `pnpm link --global --filter @tokentrail/cli` |
| MCP tools fail | Run `pnpm build` in repo; check MCP path in mcp.json |

---

## Files

- `apps/cli` — `tokentrail` command
- `apps/mcp` — Cursor MCP server
- `~/.tokentrail/` — global config after setup
- `obsidian/Step 5.2 MCP Tools.md`
