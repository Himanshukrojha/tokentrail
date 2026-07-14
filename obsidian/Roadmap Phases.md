# Roadmap Phases

Maps to `docs/prompt-format-optimizer-roadmap.md` with coding-first emphasis.

## Phase 0: Validation (parallel, 1–2 weeks)

- Collect [[Benchmark Dataset]] (20–50 prompts)
- Manual text vs image vs cache notes
- Prompt taxonomy

**Do not block coding** — run in parallel with engine build.

## Phase 1: Prototype Engine ← **YOU ARE HERE**

- [[Build From Scratch]]
- [[V0 - Rules Engine]]
- [[Run Logger]] from day one

Deliverable: `@tokentrail/core` + CLI

## Phase 2: Editor Prototype

- VS Code / Cursor panel
- Select text → compare panel
- Side-by-side variants
- Export benchmark reports

## Phase 3: Model-Aware Expansion

- [[Provider Token Rules]] multi-provider
- Caching first-class
- Category-specific scoring tweaks

## Phase 4: Productization

- Web dashboard
- Team workspaces
- Browser extension
- Public beta + pricing

## ML timeline

| Stage | When |
| ----- | ---- |
| [[V0 - Rules Engine]] | Now |
| [[V1 - Hybrid Scoring]] | 50+ logged prompts, rule tuning pain |
| [[V2 - ML Ranking]] | 200+ labeled overrides/comparisons |
