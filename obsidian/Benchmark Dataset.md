# Benchmark Dataset

## Purpose

- Validate [[Recommendation Rules]] before shipping
- Seed [[V2 - ML Ranking]] later
- Track agreement rate over time

## Target corpus (Phase 0)

| Category | Count | Examples |
| -------- | ----- | -------- |
| Code-heavy system prompts | 10 | Cursor rules, API schemas |
| Long prose instructions | 10 | Research briefs, SOPs |
| Layout-heavy | 10 | ASCII tables, diagrams |
| Repeated system prompts | 10 | Same prompt, reuse 5–20x |
| Short prompts (<512 tok) | 10 | Should mostly → text |
| **Total** | **50** | |

## File format

`data/benchmarks/prompts.jsonl`:

```json
{
  "id": "bench-001",
  "category": "code_heavy",
  "promptFile": "code-heavy-001.txt",
  "reuseCount": 1,
  "humanLabel": "text_preferred",
  "notes": "Contains exact file paths and TypeScript generics"
}
```

## Labeling guide

| Label | When |
| ----- | ---- |
| `text_preferred` | Exact tokens matter; code; legal wording |
| `image_viable` | Layout/diagram; 15%+ savings; readable |
| `caching_preferred` | Large + repeated across sessions |
| `hybrid` | Core instructions text; annex as image |

## Collection sources

- Your own agent system prompts (sanitized)
- Public prompt engineering examples
- Synthetic generators for edge cases

## Metrics

Track weekly:
- Engine label vs `humanLabel` agreement %
- Per-category accuracy
- Confusion matrix

## Template

See `data/benchmarks/README.md` when scaffolded.
