# GLSL Batch 2 — `step` `smoothstep` `floor` `ceil` `fract` `mod`

---

## 1 · `step`

**1. Signature**
```glsl
float step(float edge, float x)
vec2  step(vec2  edge, vec2 x)     vec2 step(float edge, vec2 x)
vec3  step(vec3  edge, vec3 x)     vec3 step(float edge, vec3 x)
vec4  step(vec4  edge, vec4 x)     vec4 step(float edge, vec4 x)
```
- ⚠️ **`edge` comes FIRST, `x` second.** Backwards from how you'd say it out loud. Nearly everyone types `step(x, 0.5)` the first time and gets the inverse of what they wanted.

**2. What it does** — a hard on/off switch at a threshold.

**3. Exact definition**
- `x < edge ? 0.0 : 1.0`
- Note the asymmetry: at **exactly** `x == edge` the test `x < edge` is false, so you get **1.0**.

**4. Picture** — MODE 0, `return step(0.5, x);`
- Flat at 0, an **instant vertical jump** at x = 0.5, flat at 1.
- **Zoom in on the jump.** It's a staircase of pixels, not a line. That jaggedness is the point of this entry.

**5. Range & edge cases**
- Output is exactly `{0.0, 1.0}`. Nothing in between, ever.
- The `==` case resolves to 1.0, as above.

**6. Stage** — **3 (MASK)**, technically. In practice: a mask you don't want.

**7. Idioms**
- **A band, from two steps multiplied:** `step(a, x) * step(x, b)` → 1 only when `a ≤ x ≤ b`.
  - The second call has the arguments swapped on purpose: `step(x, b)` asks *"is `b ≥ x`"*.
  - This is `max`/`min` as AND again, in mask polarity: multiplication is AND for masks.
- **Branchless conditional:** `mix(A, B, step(edge, x))` instead of `if`.
- **Sign test:** `step(0.0, x)` → 1 when x is non-negative.

**8. Traps**
- ⚠️ **Argument order**, as above.
- ⚠️ **It aliases by construction.** A hard 0/1 transition cannot be antialiased — the information about partial pixel coverage was thrown away.
- **It is not faster than `smoothstep` in any way that matters.** People reach for `step` thinking it's the cheap option; on a GPU the difference is a couple of ALU ops, invisible.
- Only legitimate uses: genuinely discrete decisions (which cell, which of two palettes), never edges.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return step(0.5, x);`

---

## 2 · `smoothstep`

**1. Signature**
```glsl
float smoothstep(float edge0, float edge1, float x)
vec2  smoothstep(vec2 edge0, vec2 edge1, vec2 x)    vec2 smoothstep(float edge0, float edge1, vec2 x)
vec3  smoothstep(vec3 edge0, vec3 edge1, vec3 x)    vec3 smoothstep(float edge0, float edge1, vec3 x)
vec4  smoothstep(vec4 edge0, vec4 edge1, vec4 x)    vec4 smoothstep(float edge0, float edge1, vec4 x)
```

**2. What it does** — a soft, eased transition between two thresholds.

**3. Exact definition** — **two steps, and the first one is just batch 1's clamp idiom:**
```glsl
float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);   // ← batch 1's linear ramp
return t * t * (3.0 - 2.0 * t);                            // ← the new part
```
- **The first line is exactly the `clamp` idiom from batch 1.** `smoothstep` is that ramp plus one polynomial.
- **Why `3t² − 2t³` and not something else:**
  - Its derivative is `6t − 6t²` = **`6t(1 − t)`**.
  - That derivative is **zero at `t = 0` and zero at `t = 1`.**
  - So the curve arrives at both ends **flat** — it eases in and eases out.
  - **This is the whole visual difference from `clamp`.** `clamp`'s derivative slams from 1 to 0 at each corner, and your eye sees that as a crease. `smoothstep` has no corner to see.

**4. Picture** — MODE 0, `return smoothstep(0.3, 0.7, x);`
- Flat 0 until 0.3, an **S-curve** up to 1 at 0.7, flat after.
- **Compare directly with `clamp((x-0.3)/0.4, 0.0, 1.0)`** — same endpoints, but the clamp version has two visible kinks where the S has none.

**5. Range & edge cases**
- Output is **always in [0, 1]** — the internal `clamp` guarantees it. Unlike `mix`, this one *is* bounded.
- ⚠️ **Formally undefined when `edge0 >= edge1`** (division by `edge1 - edge0`, which is zero or negative).
- **A refinement worth stating precisely:** reversed edges (`smoothstep(0.02, 0.0, d)`) hit that undefined case. It **works on every real implementation** — they just evaluate the formula, and a negative denominator cleanly inverts the ramp — and it is genuinely idiomatic. But the honest statement is *"universally reliable, formally undefined"*, not *"correct per spec"*. The pedantic form is `1.0 - smoothstep(0.0, 0.02, d)`.
- `edge0 == edge1` exactly is a real division by zero. Avoid.

**6. Stage** — **3 (MASK)**, and it is *the* stage-3 function. Also stage 4 for eased gradients.

**7. Idioms**
- **Antialiased fill:** `smoothstep(w, -w, d)` → 1 inside, 0 outside, one-pixel edge.
- **Antialiased band:** `smoothstep(a, b, x) - smoothstep(b, c, x)` → two ramps subtracted.
- **Easing:** feed it a normalized time to get ease-in-out animation.
- **Remapping with soft limits:** `smoothstep(lo, hi, v)` as a general-purpose "how far between lo and hi am I, softly".

**8. Traps**
- The undefined-edges issue above.
- **It's *not* a general easing library.** Zero slope at both ends means motion driven by it looks slightly sticky at the start and end. Real easing needs other curves.
- **A smoother variant exists:** `t³(t(6t − 15) + 10)` — Perlin's "smootherstep", with zero *second* derivative too. Not in GLSL; write it yourself if you ever see banding.
- The `(float, float, vec)` overload is easy to miss and often what you want.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return smoothstep(0.3, 0.7, x);`

---

## 3 · `floor`

**1. Signature**
```glsl
float floor(float x)    vec2 floor(vec2 x)    vec3 floor(vec3 x)    vec4 floor(vec4 x)
```

**2. What it does** — rounds **down**, to the nearest integer at or below `x`.

**3. Exact definition**
- The largest integer that is `<= x`.
- **Returns a `float`, not an `int`.** `floor(2.7)` is the float `2.0`.
- **Down means down, not toward zero:** `floor(-2.1)` is **`-3.0`**, not `-2.0`.

**4. Picture** — MODE 0, `return floor(x * 5.0) / 5.0;`
- A **five-step staircase** from 0 to 0.8.
- Each tread is perfectly flat; each riser is a hard jump.

**5. Range & edge cases**
- Output is always an exact integer value.
- `floor(2.0)` is `2.0` — exact integers pass through unchanged.
- ⚠️ **`mediump` breaks it at scale.** Once `x` is large enough that adjacent representable floats are more than 1 apart, `floor` stops meaning anything. Relevant if you ever `floor(u_time * bigNumber)`.

**6. Stage** — **1 (DOMAIN)** for tiling, **2 (FIELD)** for quantizing.

**7. Idioms**
- **Quantize:** `floor(v * n) / n` → snap to `n` levels. Posterize, stepped gradients, pixelation.
- **Cell ID — the important one:** `vec2 cell = floor(p * n);` tells you **which tile** you're in. That integer pair is the tile's identity, and it's what you feed a hash to make every tile different.
- **Rounding:** `floor(x + 0.5)` is round-to-nearest. There's no `round` in GLSL ES 1.0.
- `floor` + `fract` together — see below.

**8. Traps**
- ⚠️ **Negative rounding.** `floor(-0.5)` is `-1.0`. If you expected truncation toward zero, you'll be off by one for every negative input — which is *half the plane* in a centred domain.
- It returns a float; you can't use it as an array index in ES 1.0 without an explicit `int()` cast.
- Precision, as above.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return floor(x * 5.0) / 5.0;`

---

## 4 · `ceil`

**1. Signature** — same shape as `floor`: `float`/`vec2`/`vec3`/`vec4`.

**2. What it does** — rounds **up**.

**3. Exact definition**
- The smallest integer that is `>= x`.
- `ceil(2.1)` = `3.0`; `ceil(-2.1)` = **`-2.0`** (up means toward positive).
- **Relationship worth knowing:** `ceil(x) == -floor(-x)`. It's `floor` with the axis flipped.

**4. Picture** — MODE 0, `return ceil(x * 5.0) / 5.0;`
- The same staircase as `floor`, **shifted up by one tread.**
- Put them side by side mentally: `floor` sits below the line, `ceil` sits above it.

**5. Range & edge cases**
- Exact integers pass through: `ceil(2.0)` is `2.0`.
- Same `mediump` precision ceiling as `floor`.

**6. Stage** — **1** or **2**, rarely either.

**7. Idioms**
- **"How many do I need?"** counting — `ceil(total / perBatch)`.
- Padding a value up to the next multiple: `ceil(x / m) * m`.
- Occasionally paired with `floor` to get both bounds of the cell you're in.

**8. Traps**
- ⚠️ **Honest assessment: you will type `floor` roughly fifty times for every `ceil`.** Shader work cares about *which cell am I in* (floor) far more than *how many cells fit* (ceil).
- Like `floor`, it returns a float.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return ceil(x * 5.0) / 5.0;`

---

## 5 · `fract`

**1. Signature**
```glsl
float fract(float x)    vec2 fract(vec2 x)    vec3 fract(vec3 x)    vec4 fract(vec4 x)
```

**2. What it does** — keeps only the fractional part. **The repeater.**

**3. Exact definition**
- **`x - floor(x)`.** That's it — it's defined *in terms of* `floor`, which is why `floor` came first.
- **Output is always in `[0, 1)`** — it can reach 0 but **never reaches 1.0**.
- **Negatives work, and this surprises people:** `fract(-0.25)` = `-0.25 - floor(-0.25)` = `-0.25 - (-1.0)` = **`0.75`**. Because `floor` rounds *down*, the result is always non-negative.

**4. Picture** — MODE 0, `return fract(x * 3.0);`
- **Three sawteeth.** Each ramps 0 → 1, then drops vertically back to 0.
- **This is the function that makes contour rings.** One expression, many repeats, because it forgets which cycle you're in.

**5. Range & edge cases**
- `[0, 1)`, never exactly 1.
- ⚠️ **The vertical drop is a genuine discontinuity.** Mathematically there's no derivative there.
- ⚠️ **`mediump` + large inputs is a disaster.** `fract(u_time * 1000.0)` looks fine for a few seconds, then visibly degrades into chunky steps as precision runs out. Keep the multiplier small, or the value small.

**6. Stage** — **1 (DOMAIN)**, overwhelmingly. Tiling is a domain operation.

**7. Idioms**
- **Tiling, the canonical pair:**
  ```glsl
  vec2 g    = p * n;
  vec2 cell = floor(g);        // WHICH tile   (identity)
  vec2 q    = fract(g) - 0.5;  // WHERE in it  (local coords, centred)
  ```
  - **`floor` and `fract` are one idiom, not two functions.** Every tiled pattern you will ever write starts with those three lines.
- **Triangle wave:** `abs(fract(x) * 2.0 - 1.0)` → up-down-up instead of sawtooth. No discontinuity, because `abs` folds the drop into a corner.
- **The classic hash:** `fract(sin(x * 12.9898) * 43758.5453)`. It works precisely *because* `fract` discards the huge integer part and keeps unpredictable low bits.
- Contour rings on a distance field.

**8. Traps**
- ⚠️ **The discontinuity wrecks derivative-based antialiasing.** `fwidth(fract(x))` **spikes** at every wrap — so you get a bright or dark seam exactly on every cell border. Take `fwidth` of the value *before* `fract`, or accept the seam.
- ⚠️ **Shapes can't cross a cell border.** `fract` resets the coordinate, so anything overlapping the edge gets sliced. Standard workaround is sampling neighbouring cells too.
- Precision, as above.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return fract(x * 3.0);`

---

## 6 · `mod`

**1. Signature**
```glsl
float mod(float x, float y)
vec2  mod(vec2 x, vec2 y)    vec2 mod(vec2 x, float y)
vec3  mod(vec3 x, vec3 y)    vec3 mod(vec3 x, float y)
vec4  mod(vec4 x, vec4 y)    vec4 mod(vec4 x, float y)
```
- ⚠️ **GLSL ES 1.0 has no `%` operator at all** — it's reserved, not implemented, for floats *or* ints. `mod` is your only option.

**2. What it does** — the remainder after dividing, i.e. wrapping into a range.

**3. Exact definition**
- **`x - y * floor(x / y)`**
- **Built from `floor` again** — same family as `fract`.
- **The sign of the result follows `y`, the divisor.**
  - `mod(-1.0, 3.0)` = `-1 - 3 * floor(-0.333)` = `-1 - 3 * (-1)` = **`2.0`**.
- **`mod(x, 1.0)` IS `fract(x)`.** Substitute `y = 1` into the definition and they're the same expression. Two names, one function.

**4. Picture** — MODE 0, `return mod(x * 3.0, 1.0);`
- **Identical to `fract(x * 3.0)`.** Three sawteeth. That's not a coincidence — see above.
- To see `mod` doing something `fract` can't: `return mod(x * 3.0, 0.4) / 0.4;` → a period that isn't 1.

**5. Range & edge cases**
- For positive `y`: output in `[0, y)`.
- **`mod(x, 0.0)` is undefined** — division by zero.
- Same wrap discontinuity as `fract`.

**6. Stage** — **1 (DOMAIN)** for tiling with arbitrary periods, **2** for wrapping.

**7. Idioms**
- **Tiling with a real-world period:** `mod(p, cellSize)` when the period isn't conveniently 1.
- **Wrapping angles:** `mod(angle, TAU)` keeps a rotation in one turn.
- **Alternating / checkerboard:** `mod(cell.x + cell.y, 2.0)` → `0, 1, 0, 1…`. This is how you get a chequer pattern with no branching.
- **Every Nth:** `mod(floor(x), 5.0) < 1.0` → true one time in five.

**8. Traps**
- ⚠️ **The big portability trap.** GLSL's `mod` uses `floor`; C's `fmod` and HLSL's `fmod` **truncate**. With negative inputs they disagree: GLSL gives `2.0` where `fmod` gives `-1.0`. This is the single most common bug when porting shader code between languages.
- ⚠️ **Prefer `fract` when the period is 1.** Same result, one fewer operation, and historically some drivers had precision problems with `mod` at large magnitudes.
- Undefined at `y = 0`.
- Same antialiasing seam as `fract`.

**9. AGSL** — present, identical semantics (SkSL follows GLSL, not HLSL).

**10. Lab line** — MODE 0 → `return mod(x * 3.0, 1.0);` then compare with `fract(x * 3.0)`

---

## What batch 2 unlocked — tiling, with clean edges

Every function in this batch appears:

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

#define HARD 0        // flip to 1 to replace smoothstep with step. LOOK at the edges.

void main() {
    // ---- 1 DOMAIN ------------------------------------------------
    vec2 p = gl_FragCoord.xy / u_resolution;
    p.x *= u_resolution.x / u_resolution.y;        // keep cells square

    float N = 5.0;
    vec2  g    = p * N;
    vec2  cell = floor(g);                          // WHICH cell  -> identity
    vec2  q    = fract(g) - 0.5;                    // WHERE in it -> local, centred

    // mod turns the cell id into an alternating 0/1
    float checker = mod(cell.x + cell.y, 2.0);

    // ---- 2 FIELD -------------------------------------------------
    // Diamond per cell (batch 1), radius chosen by the checker (batch 1's mix)
    float r = mix(0.22, 0.34, checker);
    float d = abs(q.x) + abs(q.y) - r;

    // ---- 3 MASK --------------------------------------------------
#if HARD
    float fill = step(0.0, -d);                     // batch 2's cautionary tale
#else
    float fill = smoothstep(0.012, -0.012, d);      // reversed edges = inverted ramp
#endif
    float ring = smoothstep(0.010, 0.0, abs(d) - 0.015);

    // A quantised gradient, so you can see floor and ceil disagree
    float band = floor(p.y * 8.0) / 8.0;

    // ---- 4 COLOUR ------------------------------------------------
    vec3 col = mix(vec3(0.07, 0.07, 0.10), vec3(0.12, 0.12, 0.17), checker);
    col = mix(col, vec3(0.10, 0.16, 0.26), band * 0.5);
    col = mix(col, vec3(0.88, 0.58, 0.22), fill);
    col = mix(col, vec3(1.00, 1.00, 1.00), ring);

    gl_FragColor = vec4(col, 1.0);
}
```

**Four things to do with it**

- **Flip `HARD` to `1`.** The diamonds get crunchy, stair-stepped edges. Flip back. **That single comparison is the reason this batch exists.**
- **Change `floor(g)` to `ceil(g)`** in the cell line — the whole checkerboard shifts by one cell. Proof they differ by exactly one tread.
- **Change `floor(p.y * 8.0) / 8.0` to `p.y`** — the background banding becomes a smooth gradient. That's quantisation, on and off.
- **Change `fract(g) - 0.5` to `fract(g)`** — every diamond jumps to the cell's corner and gets sliced by the borders. That's *why* the `- 0.5` is there: it re-centres the local coordinate.

## The six things worth remembering from batch 2

- **`smoothstep` is batch 1's `clamp` ramp plus `t*t*(3-2t)`** — and that polynomial's derivative `6t(1-t)` being zero at both ends is the *entire* reason it looks smooth.
- **`floor` + `fract` are one idiom:** which cell / where in the cell. All tiling starts there.
- **`mod(x, 1.0)` is literally `fract(x)`.** Prefer `fract`.
- **`fract` is the repeater** — the only source of periodicity in the batch, and the reason one expression paints many rings.
- **`step` is for recognizing in other people's code, then not using.**
- **`fract` and `mod` both have a wrap discontinuity** — `fwidth` spikes on every cell border, and shapes can't cross one.
