# Step 3.2 — Benchmark Runner

## Command

```bash
pnpm benchmark
```

## Corpus

`data/benchmarks/prompts.jsonl` — human labels vs engine output.

## Agreement aliases

- `image_viable` accepts `hybrid`, `context_image_preferred`
- `hybrid` accepts `image_viable`

## Target

≥70% agreement before rule tuning.

## Fix log

- `repeated-system-001.txt` padded to >1024 tokens
- `bench-003` uses `contextRole: system`, `reuseCount: 10`

## Files

- `packages/core/src/benchmark/run.ts`
- `apps/benchmark/src/index.ts`
