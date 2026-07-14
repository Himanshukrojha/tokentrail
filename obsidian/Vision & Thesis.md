# Vision & Thesis

## One-line pitch

**TokenTrail helps developers find the cheapest usable way to send prompts to multimodal AI without guessing.**

## Problem

Developers optimize prompt cost in fragments: token calculators, model docs, rewrite tools. None answer: **which format is best for this task?**

Three paths exist:
1. Plain text — max fidelity
2. Image — possible token savings, OCR risk
3. Cached text — best for repeated large prompts

## Thesis

> Prompt optimization should be **format-aware**, **model-aware**, and **task-aware**.

## What it is / is not

| Is | Is not |
| -- | ------ |
| Decision engine | Token calculator only |
| Format comparator | Prompt rewriter |
| Cost + fidelity advisor | OCR product |
| Caching-aware | Text-to-image gimmick |

## Moat

The [[Comparison Engine]] + [[Recommendation Rules]] loop, fed by [[Run Logger]] data over time.

## Core user

Developers using agent workflows (Cursor, Claude Code, custom agents) with long or repeated system prompts.

## Long-term vision

Cross-platform optimization layer: editor, browser, API — all on `@tokentrail/core`.

See also: [[MVP Scope]], [[Roadmap Phases]]
