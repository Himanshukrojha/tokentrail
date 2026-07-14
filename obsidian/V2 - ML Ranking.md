# V2 - ML Ranking

## Prerequisite data

| Signal | Minimum |
| ------ | ------- |
| Logged comparisons | 500+ |
| Human-labeled or override labels | 200+ |
| Provider profiles | ≥ 2 |

Source: [[Run Logger]] exports + [[Benchmark Dataset]] growth.

## Role of ML

ML **re-ranks** candidate formats. It does not replace:
- Token estimation
- Readability heuristics
- Hard safety gates (code-heavy → no image)

## Model options (later decision)

| Option | Pros | Cons |
| ------ | ---- | ---- |
| Gradient boosted trees on tabular features | Interpretable, small data | Manual features |
| Learning-to-rank (LightGBM) | Good for format ordering | Needs quality labels |
| Small classifier on prompt embeddings | Captures semantics | Needs more data, less explainable |

**Recommendation:** start with LightGBM on engineered features from comparison context. Keep SHAP for explainability.

## Features (candidate)

- `textTokens`, `bestImageTokens`, `costDelta`
- `readability`, `fidelityRisk`, `codeBlockRatio`
- `reuseCount`, `cacheSavings`
- `promptShape` one-hot
- `lineCount`, `avgLineLength`, `uniqueTokenRatio`

## Guardrails

- If ML confidence < 0.6 → fall back to [[V1 - Hybrid Scoring]]
- Always attach top-3 SHAP reasons to output
- A/B: rules-only vs ML-reranked in shadow mode first

## Product sentence unchanged

"Rules-first today; ML improves ranking once benchmark data exists."
