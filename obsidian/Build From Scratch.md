# Build From Scratch

## Recommended order (coding only first)

### Week 1 — Core engine (no UI)

```
tokentrail/
├── packages/
│   └── core/                 # @tokentrail/core
│       ├── src/
│       │   ├── ingest/
│       │   ├── classify/
│       │   ├── estimate/     # text + visual tokens
│       │   ├── render/       # prompt → PNG at presets
│       │   ├── score/        # readability, fidelity, cost
│       │   ├── compare/      # comparison engine
│       │   ├── recommend/    # rule-based layer
│       │   └── log/          # run persistence
│       └── tests/
├── apps/
│   └── cli/                  # `tokentrail compare <file>`
├── data/
│   └── runs/                 # JSONL run logs (gitignored in prod)
└── obsidian/                 # this vault
```

**Ship when:** `tokentrail compare prompt.txt` prints JSON + human summary in <2s for a 4k-token prompt.

### Week 2 — Rules + logging hardening

- Flesh out [[Recommendation Rules]] with explicit thresholds
- Every run writes to [[Run Logger]] (input hash, scores, label, timestamp)
- Add [[Benchmark Dataset]] import script
- Golden tests: 10 prompts with expected labels (human-labeled)

### Week 3 — Provider profiles

- [[Provider Token Rules]] for Claude first (documented visual token math)
- Caching baseline in compare path
- Export comparison report (JSON + markdown)

### Week 4+ — Surface layer

- VS Code / Cursor panel (reads core package)
- Optional: minimal web demo

## What NOT to build in V0

- Live billing API integration
- ML model / embedding similarity
- Multi-model universal support
- Enterprise dashboard
- Automatic prompt rewriting

## V0 interface contract

```typescript
type CompareInput = {
  prompt: string;
  reuseCount?: number;        // sessions reusing same prompt
  provider?: 'claude' | 'openai';
  model?: string;
};

type CompareResult = {
  classification: PromptShape;
  textTokens: number;
  imageVariants: ImageVariantResult[];
  cacheBaseline?: CacheBaseline;
  scores: ComparisonScores;
  recommendation: RecommendationLabel;
  rationale: string[];
  runId: string;
};
```

## Dependency choices (V0)

| Concern | Choice | Rationale |
| ------- | ------ | --------- |
| Language | TypeScript | Shared with future VS Code extension |
| Text tokens | `js-tiktoken` or `@anthropic-ai/tokenizer` | Fast, offline |
| Render | `sharp` + SVG text layout | Lighter than full canvas for CLI |
| CLI | `commander` | Simple |
| Tests | `vitest` | Fast TS-native |
| Logs | JSONL files → SQLite later | Zero infra for prototype |

## Definition of done (V0)

- [ ] 3 image presets: 256, 384, 512 px width
- [ ] Text + visual token estimates for one provider
- [ ] Rule-based label: `text_preferred` | `image_viable` | `caching_preferred` | `hybrid`
- [ ] Readability score (density, line count, min font feasibility)
- [ ] 100% of runs logged with reproducible input hash
- [ ] 10 golden-test prompts passing

## Link

Next: [[Technical Architecture]] → [[Comparison Engine]] → [[Context Token Savings]]
