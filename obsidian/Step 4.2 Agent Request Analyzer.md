# Step 4.2 — Agent Request Analyzer

## Why

Agent CLIs (Claude Code, Cursor CLI) send **multi-message** requests. TokenTrail must plan per-block actions, not just single prompts.

## API

```typescript
import { analyzeAgentRequest } from "@tokentrail/core";

const plan = await analyzeAgentRequest({
  messages: [
    { role: "system", content: "..." },
    { role: "user", content: "..." },
    { role: "user", content: toolJson },
  ],
  reuseCount: 10,
});
```

## Per-block logic

| Message | Inferred role | Recent? | Typical action |
| ------- | ------------- | ------- | -------------- |
| system | `system` | — | cache (if reused) |
| old assistant/user | `conversation_history` | no | image |
| latest user | `user_message` | yes | keep_text |
| JSON tool output | `tool_result` | — | image (if dense) |

## CLI

```bash
node apps/cli/dist/index.js agent analyze agent-request
```

Input format: `data/benchmarks/samples/agent-request-001.json`

## Output

- Per-block: `action` = `keep_text` | `cache` | `image` | `hybrid`
- Totals: original vs projected effective tokens

## Files

- `packages/core/src/agent/analyze-request.ts`
- `packages/core/src/agent/split-request.ts`
- `apps/cli/src/index.ts` — `agent analyze`

## Next

[[Step 4.3 Proxy Skeleton]] — wire this into live API requests.
