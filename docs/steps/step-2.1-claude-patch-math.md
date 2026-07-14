# Step 2.1 — Claude Patch Math

## Old (wrong)

512×512 tiles @ 170 tokens — legacy approximation.

## Current

```
visualTokens = min(ceil(w/28) × ceil(h/28), tierMax)
```

## Tiers

| Tier | Max long edge | Max visual tokens |
| ---- | ------------- | ----------------- |
| standard | 1568 | 1568 |
| high | 2576 | 4784 |

## Config

`config/providers/claude.json` v0.2.0

## Reference

- [Anthropic vision docs](https://platform.claude.com/docs/en/build-with-claude/vision)
- `obsidian/Provider Token Rules.md`
