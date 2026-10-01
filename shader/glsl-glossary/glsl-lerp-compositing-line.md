# Why `color = (1.0 - pct) * color + pct * vec3(0.0, 1.0, 0.0)`

```glsl
color = (1.0 - pct) * color + pct * vec3(0.0, 1.0, 0.0);
```

## The problem it solves

- You have **two colours** — the grey background, and green.
- You have **one number**, `pct` (0..1), saying *"how much of this pixel is line?"*
- You need **one output colour**. There is no layering, no z-order, no second draw call. One pixel, one answer.

## What the formula is

- It's a **weighted average** of the two colours.
- `(1.0 - pct)` and `pct` are the weights, and they **always sum to exactly 1.0**.
- That sum-to-1 property is the whole point — it guarantees the result lands *between* the two colours and never escapes the valid range.

## Check it at the endpoints

| `pct` | `(1-pct)*color` | `+ pct*green` | Result |
|---|---|---|---|
| `0.0` | full background | nothing | **background, untouched** |
| `1.0` | nothing | full green | **pure green** |
| `0.5` | half background | half green | **exact midpoint** |

- The middle row is the one that matters: **that's the antialiased edge of the line.**

## Worked example

- Pixel at `st.x = 0.3`, so background = `vec3(0.3, 0.3, 0.3)`. Say `pct = 0.25`.
- It runs **per channel** — three independent scalar lerps:
  - R: `0.75 × 0.3 + 0.25 × 0.0` = **0.225**
  - G: `0.75 × 0.3 + 0.25 × 1.0` = **0.475**
  - B: `0.75 × 0.3 + 0.25 × 0.0` = **0.225**
- Result `vec3(0.225, 0.475, 0.225)` — a greenish grey. Exactly a quarter of the way to green.

## Why not the obvious alternatives

- **`if (pct > 0.5) color = green;`**
  - Throws away everything `smoothstep` just computed. The soft ramp collapses back to a hard 0/1.
  - You get a **jagged, aliased line** — the exact thing `smoothstep` existed to prevent.
- **`color = color + pct * green;`** (adding instead of blending)
  - The weights no longer sum to 1. The background is **never removed, only brightened**.
  - Our pixel becomes `(0.3, 0.55, 0.3)` — a washed-out glow, not a line drawn *over* the background.
  - Useful deliberately (that's how you do neon/bloom) — just not what's wanted here.

## The names for it

- This is **linear interpolation** — "lerp".
- GLSL has it built in: **`mix(color, vec3(0.0,1.0,0.0), pct)`** is the identical operation, and GPUs implement it in hardware. Use `mix()` in your own code; the book writes it longhand only because it hasn't introduced `mix()` yet.
- Algebraically also written `a + t*(b - a)` — same result, one multiply fewer.
- And it is **exactly alpha blending**: `src*α + dst*(1-α)`. **`pct` *is* the alpha channel**, you're just computing it yourself instead of getting it from a texture.

## The bigger idea

- Fragment shaders have **no draw order, no layers, no painter's algorithm**. You can't "draw green on top".
- So **layering anything is just repeated `mix()`** — background, then shape, then highlight, each one a lerp weighted by its own coverage.
- This single line is the entire compositing model you'll use for the rest of the book, and for the shimmer capstone.
