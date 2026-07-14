# V1 - Hybrid Scoring

## When

After V0 validates the workflow and [[Run Logger]] has enough data to tune weights.

## Approach

Keep [[Recommendation Rules]] hard gates. Add weighted score for formats that pass gates.

### Default weights (starting point)

```json
{
  "w_cost": 0.35,
  "w_readability": 0.25,
  "w_fidelity": 0.30,
  "w_reuse": 0.10
}
```

### Normalization

- Cost savings: clamp to [0, 1] relative to text baseline
- Readability: already 0–1
- Fidelity: invert risk → score
- Reuse: `min(1, reuseCount / 10) * cacheSavingsRatio`

## Output

- Primary label (highest score)
- Runner-up with delta
- Confidence = margin between top two scores

## Calibration

Use human overrides from logs:
- If users pick text when we said image → increase `w_fidelity`
- If users pick image when we said text → check readability thresholds first

## Still not ML

Weights are hand-tuned JSON. Document every change in changelog note.
