# Run Logger

**Build this in V0 week 1, not as an afterthought.** ML and calibration depend on it.

## Schema (JSONL per run)

```json
{
  "runId": "uuid",
  "timestamp": "ISO-8601",
  "inputHash": "sha256(prompt)",
  "promptLength": 4200,
  "provider": "claude",
  "model": "claude-sonnet-4",
  "classification": "code_heavy",
  "textTokens": 4102,
  "imageVariants": [
    { "width": 384, "visualTokens": 2900, "readability": 0.78 }
  ],
  "cacheBaseline": { "reuseCount": 5, "effectiveCost": 820 },
  "scores": { "cost": 0.29, "fidelityRisk": 0.72, "readability": 0.78 },
  "recommendation": "text_preferred",
  "rulesFired": ["R2", "R3"],
  "ruleVersion": "0.1.0",
  "humanOverride": null,
  "latencyMs": 340
}
```

## Storage evolution

| Phase | Store |
| ----- | ----- |
| V0 | `data/runs/*.jsonl` |
| V1 | SQLite local (`data/tokentrail.db`) |
| V2+ | Optional cloud sync for team benchmarks |

## Human override hook

CLI flag or later UI:
```
tokentrail compare prompt.txt --override text_preferred --reason "legal exact wording"
```

Overrides are gold labels for [[V2 - ML Ranking]].

## Privacy

- Default: hash-only storage option for sensitive prompts
- Never commit real user prompts to git
- `data/` in `.gitignore`

## Analytics queries (V1)

- Recommendation distribution
- Rule fire frequency
- Override rate by `promptShape`
- Median cost delta when `image_viable`
