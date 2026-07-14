# Step 1.2 — Core Modules

## Pipeline

```
ingest → classify → estimate → render → score → compare → recommend → log
```

## Modules

| Path | Role |
| ---- | ---- |
| `ingest/` | Normalize prompt text |
| `classify/` | prose / code_heavy / layout_heavy / mixed |
| `estimate/text.ts` | Prose token count |
| `estimate/visual.ts` | Claude visual tokens |
| `estimate/cache.ts` | Caching baseline |
| `estimate/density.ts` | Prose vs dense |
| `estimate/context.ts` | Agent context savings |
| `render/` | Layout, SVG, PNG |
| `score/` | Readability + fidelity |
| `recommend/rules.ts` | R1–R8 decision tree |
| `log/` | JSONL run persistence |
| `agent/` | Multi-message analyzer |
| `benchmark/` | Corpus validation |

## Entry point

`comparePrompt(input)` in `compare-prompt.ts`

## Related

`obsidian/Comparison Engine.md` · `obsidian/Recommendation Rules.md`
