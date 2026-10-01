# The `plot()` function — Book of Shaders ch. 5

```glsl
float plot(vec2 st) {    
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}
```

## The signature

- **`float`** — the return type comes first, C-style. GLSL has no `def`/`fun` keyword.
- **`plot`** — just a name. Not built in, not special. You wrote it.
- **`vec2 st`** — one parameter: a 2D point, the pixel's normalized coordinate.
  - Passed **by value**. GLSL's default qualifier is `in`, so `st` is a *copy* — writing to it inside cannot affect `main`. (`out` and `inout` exist if you want otherwise.)
- **Returns one float**, not a colour. That's a deliberate design choice — see the last section.

## What it computes, inside-out

**Step 1 — `st.y - st.x`**
- Signed vertical distance from the line `y = x`.
- Why that line? Because `y = x` *is* the set of points where `st.y - st.x == 0`. The expression **is** the line, written as an equation.
- Above the diagonal → positive. Below → negative. On it → zero.

**Step 2 — `abs(...)`**
- Fold the two sides together. Now it's pure distance, always ≥ 0.
- Without this you'd only get a line on one side (the other side would clamp to 0 and vanish).

**Step 3 — `smoothstep(0.02, 0.0, d)`**
- Turns distance into brightness.
- The edges are **reversed** (`0.02` before `0.0`), which flips the ramp to count **down**.
- Under the hood: `t = clamp((d - 0.02) / (0.0 - 0.02), 0.0, 1.0)` then `t*t*(3.0 - 2.0*t)`.
  - The `(0.0 - 0.02)` denominator is **negative** — that's the whole mechanism of the flip.
  - The `t*t*(3-2t)` part is the Hermite curve: it eases in and out instead of ramping linearly, so the line's edge fades naturally rather than in a visible wedge.

## Numeric trace

| pixel `st` | `st.y - st.x` | `abs` | returns |
|---|---|---|---|
| `(0.50, 0.50)` | `0.00` | `0.00` | **1.00** — dead on the line |
| `(0.50, 0.51)` | `+0.01` | `0.01` | **0.50** — half-lit, the soft edge |
| `(0.50, 0.49)` | `-0.01` | `0.01` | **0.50** — same, other side (thanks to `abs`) |
| `(0.50, 0.60)` | `+0.10` | `0.10` | **0.00** — off the line |

## Why it's a separate function at all

- **Names the intent.** `plot(st)` reads as "is this pixel on the graph?" — `smoothstep(0.02, 0.0, abs(st.y - st.x))` does not.
- **It's a mask generator.** It produces a greyscale image of *where the line is*, with no opinion about colour. `main` then decides the colour.
- **This float-mask / colour split is the central fragment-shader pattern.** Masks compose cleanly — you can add, multiply, subtract, and `mix()` with them. Colours don't compose that way. Everything you build from here (shapes, patterns, the shimmer capstone) is masks first, colour last.

## Two limitations worth knowing now

- **It hardcodes `y = x`.** The function can only ever draw the diagonal. The book's later version takes the value as a parameter:
  ```glsl
  float plot(vec2 st, float pct){
      return smoothstep(pct-0.02, pct, st.y) -
             smoothstep(pct, pct+0.02, st.y);
  }
  ```
  - Two opposing ramps **subtracted** — one rising just below `pct`, one rising just above. The difference is a band centred on `pct`.
  - Now `plot(st, y)` graphs whatever `y` you computed. That's the version you actually want.
- **`0.02` is in normalized units, not pixels.** Resize the window and the line's pixel thickness changes with it. Also, because Step 1 measures *vertical* distance rather than perpendicular, **steep parts of a curve render visibly thinner** — a fixed vertical half-width `h` corresponds to a perpendicular half-width of `h / sqrt(1 + slope²)`, which shrinks as the slope grows and vanishes entirely at vertical. `fwidth()` fixes both.
