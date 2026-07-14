# Benchmark Dataset

Labeled prompts for validating [[Recommendation Rules]] before shipping.

## Layout

```
data/benchmarks/
├── prompts.jsonl       # metadata + human labels
└── samples/            # prompt text files (sanitized)
```

## prompts.jsonl schema

```json
{
  "id": "bench-001",
  "category": "code_heavy",
  "promptFile": "samples/code-heavy-001.txt",
  "reuseCount": 1,
  "humanLabel": "text_preferred",
  "notes": "Why a human chose this label"
}
```

## Labels

| Label | When |
| ----- | ---- |
| `text_preferred` | Exact tokens matter; code; legal wording |
| `image_viable` | Layout/diagram; 15%+ savings; readable |
| `caching_preferred` | Large + repeated across sessions |
| `hybrid` | Core instructions text; annex as image |

## Run all benchmarks (after CLI is ready)

```bash
pnpm compare data/benchmarks/samples/code-heavy-001.txt
```

Future: `pnpm benchmark` script to diff engine vs `humanLabel`.

## Privacy

- Do not commit real production prompts with secrets
- Sanitize paths, API keys, and customer data
