# Risks & Mitigations

## Technical

| Risk | Mitigation |
| ---- | ---------- |
| Provider token math changes | Versioned [[Provider Token Rules]] configs |
| Image unreadable at low res | Hard readability floor in [[Recommendation Rules]] |
| Cost savings smaller than expected | Show honest deltas; cache baseline prominent |
| Code prompts fail as images | `code_heavy` hard gate → `text_preferred` |

## Product

| Risk | Mitigation |
| ---- | ---------- |
| Niche workflow | Target agent developers first; [[Benchmark Dataset]] from real workflows |
| Caching beats image often | Make caching a first-class path, not afterthought |
| Vendor absorbs feature | Moat = logged benchmarks + tuned rules + UX in editor |

## ML-specific (defer)

| Risk | Mitigation |
| ---- | ---------- |
| Train too early | Gate [[V2 - ML Ranking]] on data thresholds |
| Black-box recommendations | SHAP + keep rule gates |

## Build

| Risk | Mitigation |
| ---- | ---------- |
| Extension-first trap | [[Technical Architecture]] package-first |
| Scope creep | [[MVP Scope]] exclusions enforced |
