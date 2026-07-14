# V0 - Rules Engine

## Scope

Ship a working **rules-first** optimizer with zero ML.

## Components

1. [[Comparison Engine]] — compute metrics
2. [[Recommendation Rules]] — apply decision tree
3. [[Run Logger]] — persist every outcome
4. `apps/cli` — developer interface

## Explicit non-goals

- No training pipeline
- No embedding similarity
- No auto prompt rewriting
- No live API cost lookup

## Success criteria

| Metric | Target |
| ------ | ------ |
| Time to recommend | < 2s for 8k-token prompt |
| Human agreement (golden set) | ≥ 70% on 20 prompts |
| Runs logged | 100% |
| Explainability | Every label has rule IDs in output |

## Exit criteria → V1

Move to [[V1 - Hybrid Scoring]] when:
- 50+ real user prompts logged
- Rule disagreements cluster (need softer weighting, not new rules)
- Cost/readability tradeoffs feel too binary
