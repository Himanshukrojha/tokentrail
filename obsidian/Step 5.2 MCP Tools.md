# Step 5.2 — MCP Tools

## Status

✅ Implemented — `apps/mcp`

## Cursor IDE (Gmail login)

1. `tokentrail setup` → writes `~/.cursor/mcp.json`
2. Restart Cursor
3. Agent can call MCP tools

## Tools

| Tool | API |
| ---- | --- |
| `tokentrail_compare` | `comparePrompt()` |
| `tokentrail_agent_plan` | `analyzeAgentRequest()` |
| `tokentrail_render` | `renderPromptToBuffers()` |

## Global CLI

```bash
pnpm link --global --filter @tokentrail/cli
tokentrail compare layout-heavy
tokentrail setup
```

## Full guide

`docs/cursor-ide-setup.md`

## Related

[[Step 5.1 Agent CLI Proxy]] · [[Track Record]]
