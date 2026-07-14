# Step 3.1 — PNG Render Pipeline

## Stack

- `layout.ts` — wrap lines, paginate
- `svg.ts` — monospace SVG, XML escape
- `png.ts` — `sharp` rasterize to PNG

## Layouts

| Recommendation | Width | Use |
| -------------- | ----- | --- |
| context_image / dense | 1928px | Agent tool results |
| image_viable / hybrid | 768px | Layout-heavy prompts |

## CLI

```bash
pnpm compare layout-heavy --render-out ./out
```

Output: `./out/tokentrail-p001.png` (multi-page if needed)

## Dependency

`sharp` in `@tokentrail/core`
