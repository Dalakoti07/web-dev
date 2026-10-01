# GLSL Batch 1 — `min` `max` `clamp` `abs` `sign` `mix`

---

## 1 · `min`

**1. Signature**
```glsl
float min(float x, float y)
vec2  min(vec2  x, vec2  y)     vec2 min(vec2 x, float y)
vec3  min(vec3  x, vec3  y)     vec3 min(vec3 x, float y)
vec4  min(vec4  x, vec4  y)     vec4 min(vec4 x, float y)
```
- The `(vec, float)` forms broadcast the scalar against every component.
- **No `int` overloads in GLSL ES 1.0.** They arrive in ES 3.0. Cast to float.

**2. What it does** — returns whichever of the two is smaller.

**3. Exact definition**
- `y < x ? y : x`
- For vectors it's **component-wise** — `min(vec2(1.0, 5.0), vec2(3.0, 2.0))` is `vec2(1.0, 2.0)`. It does *not* pick "the smaller vector"; there's no such thing.

**4. Picture** — MODE 0, `return min(x, 0.5);`
- A line rising at 45° that **stops dead at 0.5** and stays flat.
- Read it as: **a ceiling.**

**5. Range & edge cases**
- Output range is the union of the inputs' ranges — it never invents a new value.
- **NaN is undefined.** If either input is NaN, the spec guarantees nothing.
- With `-0.0` and `+0.0` it's unspecified which you get back. Never matters visually.

**6. Stage** — **2 (FIELD)** primarily, occasionally 3.

**7. Idioms**
- **SDF union.** `min(a, b)` merges two shapes into one. This is the workhorse use.
- Ceiling / saturation: `min(v, 1.0)` to stop a value exceeding white.
- Nesting for three or more: `min(a, min(b, c))`.

**8. Traps**
- ⚠️ **The polarity inversion.** On **fields** (negative inside), `min` = union. On **masks** (1 inside), `min` = **intersection**. Same function, opposite meaning, because the two representations have opposite sign conventions. This confuses everyone once.
- `min(vec2, vec2)` looks like it compares magnitudes. It doesn't — it's per-component.

**9. AGSL** — present, identical. `int` overloads available there.

**10. Lab line** — MODE 0 → `return min(x, 0.5);`

---

## 2 · `max`

**1. Signature** — mirror of `min`, same overload set, same missing `int` forms.

**2. What it does** — returns whichever is larger.

**3. Exact definition**
- `x < y ? y : x`
- Component-wise for vectors.

**4. Picture** — MODE 0, `return max(x, 0.5);`
- **Flat at 0.5**, then rises at 45° once `x` passes 0.5.
- Read it as: **a floor.**

**5. Range & edge cases** — same as `min`: no new values, NaN undefined.

**6. Stage** — **2 (FIELD)** and **3 (MASK)**.

**7. Idioms**
- **`max(x, 0.0)` — kill the negatives.** The cheapest one-sided clamp there is; cheaper than `clamp`. You saw it in `maskGlow`: `exp(-k * max(d, 0.0))` makes the glow exist only *outside* the shape.
- **SDF intersection.** `max(a, b)` keeps only the overlap.
- **SDF subtraction.** `max(a, -b)` cuts `b` out of `a`. The negation flips inside and outside.
- **Division guard.** `x / max(y, 0.0001)` avoids a divide-by-zero without a branch.
- **A square, with no `length()`.** `max(abs(p.x), abs(p.y)) - r` is a square of half-width `r`. That's the Chebyshev distance, and it means **you can draw shapes before batch 6.**

**8. Traps**
- Same polarity inversion as `min`, mirrored: on masks, `max` = **union**.
- `max(abs(p.x), abs(p.y))` is not Euclidean distance — corners are "closer" than they look. Fine for squares, wrong if you wanted a circle.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return max(x, 0.5);`

---

## 3 · `clamp`

**1. Signature**
```glsl
float clamp(float x, float minVal, float maxVal)
vec2  clamp(vec2  x, vec2  minVal, vec2  maxVal)    vec2 clamp(vec2 x, float minVal, float maxVal)
vec3  clamp(vec3  x, vec3  minVal, vec3  maxVal)    vec3 clamp(vec3 x, float minVal, float maxVal)
vec4  clamp(vec4  x, vec4  minVal, vec4  maxVal)    vec4 clamp(vec4 x, float minVal, float maxVal)
```

**2. What it does** — forces a value into a range.

**3. Exact definition**
- `min(max(x, minVal), maxVal)`
- **Literally composed from the previous two functions** — which is why they came first.
- **Result is undefined if `minVal > maxVal`.** The spec doesn't promise to swap them for you.

**4. Picture** — MODE 0, `return clamp(x * 2.0 - 0.5, 0.0, 1.0);`
- A **steeper ramp with flat shoulders**: flat 0 until x = 0.25, rising to 1 at x = 0.75, flat after.
- The two corners are sharp. Look closely at them — that sharpness is the whole reason `smoothstep` exists.

**5. Range & edge cases**
- Output is guaranteed in `[minVal, maxVal]`. This is the only function in the batch that *can* invent a value the inputs didn't have.
- NaN undefined, as always.

**6. Stage** — **3 (MASK)** mostly; also stage 1 when you need to clamp a coordinate.

**7. Idioms**
- **The linear ramp between two edges:**
  ```glsl
  clamp((x - a) / (b - a), 0.0, 1.0)
  ```
  - 0 below `a`, 1 above `b`, straight line between.
  - **This is exactly `smoothstep`'s internal `t`, before the Hermite polynomial is applied.** Learn this one now and `smoothstep` becomes trivial in batch 2.
- **Saturate:** `clamp(x, 0.0, 1.0)` — force into 0..1. GLSL has **no `saturate`**; HLSL and Metal do, and it's free there.
- Safety net before a `mix`, since `mix` doesn't clamp.

**8. Traps**
- ⚠️ **Undefined when `minVal > maxVal`.** Easy to hit when the bounds are computed rather than literal.
- **`clamp` has a kink.** The derivative jumps at both corners. On a smooth gradient that shows up as a visible crease — a hard line where the ramp starts and stops. It's the honest, ugly version of a ramp, and it's why batch 2's `smoothstep` is the one you'll actually reach for.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return clamp(x * 2.0 - 0.5, 0.0, 1.0);`

---

## 4 · `abs`

**1. Signature**
```glsl
float abs(float x)     vec2 abs(vec2 x)     vec3 abs(vec3 x)     vec4 abs(vec4 x)
```
- No `int` overload in ES 1.0.

**2. What it does** — drops the sign.

**3. Exact definition**
- `x >= 0.0 ? x : -x`
- Component-wise for vectors.

**4. Picture** — MODE 0, `return abs(x - 0.5) * 2.0;`
- A **V**: 1 at the left edge, down to 0 at x = 0.5, back up to 1 at the right.
- The apex is a **sharp point**, not a curve.

**5. Range & edge cases**
- Output always ≥ 0.
- `abs(-0.0)` is `+0.0`.
- **The derivative is undefined at exactly 0** — mathematically it has a corner there.

**6. Stage** — **2 (FIELD)** and **3 (MASK)**. It's the most-used function in both.

**7. Idioms**
- **The big one: `abs` turns a fill into an outline.**
  ```glsl
  float fill    = -d;             // positive inside
  float outline = abs(d) - t;     // negative only within t of the edge
  ```
  - Because `abs(d)` is "distance to the boundary, ignoring which side", subtracting `t` makes a band. **This is how every stroke you will ever draw works.**
- **Folding / mirror symmetry.** `abs(p.x)` makes everything symmetric about x = 0 — build half a shape, get the other half free.
- **A diamond, with no `length()`:** `abs(p.x) + abs(p.y) - r`. That's the L1 (taxicab) distance.
- Building triangle waves: `abs(fract(x) * 2.0 - 1.0)` — you'll meet `fract` in batch 2.
- Symmetric masks about any value: `abs(x - c)`.

**8. Traps**
- ⚠️ **`abs` creates a derivative discontinuity at zero.** Two consequences:
  - On a gradient, you see a **visible crease** along the fold line.
  - `fwidth(abs(d))` **spikes** at the fold, so antialiasing based on it misbehaves exactly on the line you care about. Take `fwidth` of `d`, not of `abs(d)`.
- `abs` on a vector is per-component, not magnitude. **`abs(p)` is not `length(p)`.**

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return abs(x - 0.5) * 2.0;`

---

## 5 · `sign`

**1. Signature**
```glsl
float sign(float x)    vec2 sign(vec2 x)    vec3 sign(vec3 x)    vec4 sign(vec4 x)
```

**2. What it does** — reports which side of zero you're on.

**3. Exact definition** — **three** outcomes, not two:
- `-1.0` if `x < 0.0`
- **`0.0` if `x == 0.0`**
- `+1.0` if `x > 0.0`

**4. Picture** — MODE 0, `return sign(x - 0.5) * 0.5 + 0.5;`
- A **hard step** at x = 0.5: flat 0, instant jump, flat 1.
- Visually indistinguishable from `step(0.5, x)` — and just as jagged.

**5. Range & edge cases**
- Output is exactly one of `{-1.0, 0.0, 1.0}`.
- ⚠️ **The 0.0 case is real and it bites.** `x * sign(x)` is `abs(x)` *except* at zero, where it's 0 either way — fine. But `v / sign(d)` explodes when `d` is exactly 0, and `col * sign(d)` goes black on the boundary line.

**6. Stage** — **2 (FIELD)**, rarely. It's the least-used function in this batch.

**7. Idioms**
- **Recovering a signed field from an unsigned one:** `sign(insideTest) * unsignedDistance`. This is how some SDFs get their sign back.
- Mirroring by side: `p.x * sign(p.x)` (which is just `abs`, so prefer `abs`).
- Direction of travel, when you genuinely need ±1 and not a magnitude.

**8. Traps**
- ⚠️ **It's boolean-ish, so it aliases.** Anything built on `sign` has a hard edge. If you're reaching for `sign` to make a mask, you want `smoothstep` instead.
- The three-value return surprises people who expect two.
- **Honest assessment: you will rarely type this.** It's in the glossary; it's not in most shaders.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return sign(x - 0.5) * 0.5 + 0.5;`

---

## 6 · `mix`

**1. Signature**
```glsl
float mix(float x, float y, float a)
vec2  mix(vec2  x, vec2  y, vec2  a)    vec2 mix(vec2 x, vec2 y, float a)
vec3  mix(vec3  x, vec3  y, vec3  a)    vec3 mix(vec3 x, vec3 y, float a)
vec4  mix(vec4  x, vec4  y, vec4  a)    vec4 mix(vec4 x, vec4 y, float a)
```
- The `bvec` select overload is **not in GLSL ES 1.0** (ES 3.0 / GLSL 1.30+ only), so it doesn't exist in the online editor.

**2. What it does** — blends two values by a weight.

**3. Exact definition**
- `x * (1.0 - a) + y * a`
- **`a` is the weight of `y`**, the second argument.

**4. Picture** — MODE 0, `return mix(0.2, 0.9, x);`
- A straight line from 0.2 to 0.9. It **remaps** the 0..1 input onto a new range.
- That's the honest picture of `mix`: a linear remap.

**5. Range & edge cases**
- **`a` is NOT clamped.** `a = 1.5` overshoots past `y`; `a = -0.5` undershoots behind `x`.
  - Deliberately useful for springy easing.
  - Silently wrong when `a` comes from unbounded arithmetic. Pair it with `clamp`.
- `a = 0.0` and `a = 1.0` return `x` and `y` **exactly**, bit-for-bit.

**6. Stage** — **4 (COLOUR)**, always. Also **2** for morphing between two SDFs.

**7. Idioms**
- Layering: `col = mix(col, layerCol, layerMask);` — statement order is z-order.
- Gradients: `mix(bottom, top, st.y)`.
- Opacity: multiply the **mask**, never the colour.
- SDF morph: `mix(sdA, sdB, t)` interpolates between two shapes.

**8. Traps**
- ⚠️ **Argument order.** The third argument is how much of the *second* you want. `mix(red, blue, 0.0)` is red.
- No clamping (see above).
- Blending sRGB values linearly gives muddy midpoints; hues/angles take the long way round; mixed normals need re-normalizing.

**9. AGSL** — present, identical. Works on `half` types too. No `bvec` form.

**10. Lab line** — MODE 0 → `return mix(0.2, 0.9, x);`

---

## What batch 1 just unlocked

**You can already draw shapes** — no `length`, no `smoothstep`, none of batch 2. Paste this:

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

void main() {
    // 1 DOMAIN — centred, aspect-correct
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

    // 2 FIELD — two shapes, both built from abs() alone
    float sq  = max(abs(p.x), abs(p.y)) - 0.30;   // square  (Chebyshev / L-inf)
    float dia = abs(p.x) + abs(p.y)     - 0.38;   // diamond (taxicab / L1)

    float shape = min(sq, dia);   // UNION. swap to max(sq, dia) for the octagon.

    // 3 MASK — clamp is standing in for smoothstep (batch 2). Note the creases.
    float fill = 1.0 - clamp(shape * 200.0 + 0.5, 0.0, 1.0);
    float edge = 1.0 - clamp(abs(shape) * 100.0, 0.0, 1.0);   // abs -> outline

    // 4 COLOUR
    vec3 col = vec3(0.07, 0.07, 0.10);
    col = mix(col, vec3(0.20, 0.35, 0.55), clamp(p.y + 0.5, 0.0, 1.0) * 0.6);
    col = mix(col, vec3(0.90, 0.70, 0.20), fill);
    col = mix(col, vec3(1.00, 1.00, 1.00), edge);

    gl_FragColor = vec4(col, 1.0);
}
```

**Three things to do with it**
- **Swap `min(sq, dia)` for `max(sq, dia)`** → a square-and-diamond union (a spiky star) becomes their intersection (an octagon). That's the field algebra, live.
- **Try `max(sq, -dia)`** → the diamond is *cut out of* the square.
- **Look hard at the clamped gradient** in the background. The place where it stops being dark is a visible hard line — that crease is `clamp`'s kink, and it's exactly what `smoothstep` removes in batch 2.

## The five things worth remembering from batch 1

- **`min`/`max` flip meaning between fields and masks.** Fields (negative inside): `min` = union, `max` = intersection. Masks (1 inside): the reverse.
- **`abs(d) - t` is every outline you will ever draw.**
- **`max(abs(p.x), abs(p.y)) - r` is a square; `abs(p.x) + abs(p.y) - r` is a diamond.** Shapes don't require `length`.
- **`clamp((x-a)/(b-a), 0.0, 1.0)` is the linear ramp** — and it's literally `smoothstep`'s first half.
- **`sign` returns three values**, and you'll rarely want it.
