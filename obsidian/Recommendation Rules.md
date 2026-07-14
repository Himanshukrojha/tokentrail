# Recommendation Rules

V0 is **explicit rules**, not ML. Rules must be readable, testable, and logged.

## Decision tree (V0)

```
IF reuseCount >= 3 AND textTokens >= 1024
  AND cacheDiscount meaningful
  → caching_preferred

ELSE IF promptShape == 'code_heavy'
  OR fidelityRisk >= 0.6
  OR containsExactIdentifiers (paths, UUIDs, regex)
  → text_preferred

ELSE IF bestImage.readability >= 0.7
  AND bestImage.costSavings >= 0.15  (15%+ token reduction)
  AND fidelityRisk < 0.4
  → image_viable

ELSE IF promptShape == 'layout_heavy'
  AND fidelityRisk < 0.5
  AND bestImage.readability >= 0.6
  → hybrid  (instructions text, annex as image)

ELSE
  → text_preferred  (safe default)
```

## Rule table

| ID | Condition | Label | Rationale template |
| -- | --------- | ----- | ------------------ |
| R1 | `reuseCount >= 3` ∧ `tokens >= 1k` | `caching_preferred` | Repeated large prompt; cache beats image risk |
| R2 | `codeBlockRatio > 0.3` | `text_preferred` | Code fidelity critical in images |
| R3 | `fidelityRisk >= 0.6` | `text_preferred` | Exact wording matters |
| R4 | `costSavings >= 15%` ∧ `readability >= 0.7` | `image_viable` | Cheaper and legible |
| R5 | `layout_heavy` ∧ moderate risk | `hybrid` | Split strategy |
| R6 | default | `text_preferred` | Conservative fallback |

## Rationale output

Always return 2–4 bullet strings explaining which rules fired, e.g.:

- "Code blocks are 42% of prompt → image OCR risk high (R2)"
- "384px variant saves ~22% tokens with readability 0.81 (R4)"

## Tuning process

1. Run [[Benchmark Dataset]] through engine
2. Compare to human labels
3. Adjust thresholds in `config/rules.json`
4. Re-run; log rule version in [[Run Logger]]

## V1 upgrade path

Replace hard thresholds with [[V1 - Hybrid Scoring]] weights while keeping R2/R3 as **hard gates** (never suggest image for high-fidelity code prompts).

## Anti-patterns

- Do not recommend image when readability < 0.5 regardless of cost
- Do not recommend image when prompt < 512 tokens (overhead not worth it)
- Do not ignore caching when `reuseCount` is provided
