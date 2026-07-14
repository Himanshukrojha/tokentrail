# Comparison Engine

The moat. Everything else is plumbing around this module.

## Inputs

| Input | Source module |
| ----- | ------------- |
| `textTokens` | `estimate/text` |
| `imageVariants[]` | `render` + `estimate/visual` |
| `readabilityScore` | `score/readability` |
| `fidelityRisk` | `score/fidelity` (rule-based in V0) |
| `cacheSavings` | `estimate/cache` |
| `promptShape` | `classify` |

## Score dimensions (V0)

| Dimension | Range | V0 method |
| --------- | ----- | --------- |
| Cost | relative $ or token delta | `textTokens - bestImageTokens` |
| Fidelity | 0–1 risk | rules on code blocks, exact strings, JSON |
| Readability | 0–1 | chars/px, lines, whitespace ratio |
| Reusability | 0–1 | `reuseCount` threshold + prompt size |
| Suitability | category | `prose` / `code` / `layout` / `mixed` |

## V0 comparison algorithm (pseudocode)

```
1. Compute textCost = textTokens * textRate
2. For each image preset:
     visualTokens = estimateVisual(preset)
     imageCost = visualTokens * imageRate
     readability = scoreReadability(preset)
3. cacheCost = textCost * (1 - cacheDiscount) if reuseCount >= threshold
4. fidelityRisk = scoreFidelity(promptShape, prompt)
5. Pass all metrics to recommend/rules
```

## V1 hybrid scoring

Weighted composite (hand-tuned, not ML):

```
totalScore(format) =
  w_cost   * normalize(costSavings) +
  w_read   * readability +
  w_fid    * (1 - fidelityRisk) +
  w_reuse  * cacheAdvantage
```

Weights live in `config/scoring-weights.json` — versioned, logged per run.

## V2 ML layer (later)

- Train ranker on [[Run Logger]] exports where human overrode recommendation
- ML only re-ranks top-2 formats; rules still gate unsafe image suggestions
- See [[V2 - ML Ranking]]

## Output

Feeds [[Recommendation Rules]] with a `ComparisonContext` object.

## Tests

Golden cases in [[Benchmark Dataset]]:
- Long system prompt with code → expect `text_preferred`
- ASCII table / diagram-heavy → expect `image_viable` or `hybrid`
- 8k token repeated system prompt → expect `caching_preferred`
