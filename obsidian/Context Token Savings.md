# Context Token Savings

> **Product expansion:** TokenTrail optimizes not just prompt *format* but **agent context spend** — the bulk of tokens in real agent workflows.

## Where agent tokens go

| Context block | Typical share | Image candidate? |
| ------------- | ------------- | ---------------- |
| System prompt + tool defs | 20–40% | Cache first; image only if not cached |
| Tool results (JSON, logs) | 30–50% | **Best image target** |
| Conversation history | 15–30% | Image **old** turns; keep recent as text |
| Current user message | 5–10% | **Never** image |

## Three optimization paths (in order)

1. **Prompt caching** — static/repeated system + tool schemas
2. **Context imaging** — large dense blocks (tool output, old history)
3. **Format imaging** — one-off long prompts (original TokenTrail scope)

## Fidelity zones

| Zone | Words/page | Accuracy target | Best for |
| ---- | ---------- | --------------- | -------- |
| 98% safe (768w) | ~550 | Exact instructions | System prompts, user turns |
| 97% agent dense (1928w) | ~3,300 | Bulk context | Tool results, logs, history |

## Engine outputs (V0.2)

- `effectiveTextTokens` — prose vs dense estimate (~1 char/token for code/JSON)
- `contextSavings` — role detection + paged savings
- `fidelityCapacities` — words/page at 98% and 97%
- Rule **R7** — `context_image_preferred` for large dense agent blocks
- Rule **R8** — `hybrid_context` for conversation history

## CLI

```bash
tokentrail compare tool-output.json --context-role tool_result --density dense
tokentrail compare system.md --context-role system --reuse 20
```

## What NOT to image

- UUIDs, hashes, API keys, exact file paths
- Current user message
- Recent 1–2 conversation turns
- Code the agent must edit verbatim

## Research basis

- pxpipe: ~89% savings on 48k char blocks as dense PNG
- DeepSeek-OCR: ~97% precision below 10× compression
- Fails at exact 12-char hex recall → hard fidelity gates in [[Recommendation Rules]]

## Link

[[Provider Token Rules]] — Claude 28×28 patch math (updated v0.2)
