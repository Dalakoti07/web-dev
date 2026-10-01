# GLSL Batch 3 — `sqrt` `pow` `exp` `log` `exp2` `log2` `inversesqrt`

**Read this first — it makes the whole batch one idea.** GPUs have **`exp2` and `log2` as native instructions**. Everything else here is built on them:

```
pow(x, y)  ≈  exp2(y * log2(x))       ← explains both its cost and its restrictions
exp(x)     ≈  exp2(x * 1.442695)
log(x)     ≈  log2(x) * 0.693147
sqrt, inversesqrt  →  their own dedicated instructions
```

- **`pow` is not primitive.** That single fact explains why `pow` is the expensive one, and why a negative base is undefined: you can't take `log2` of a negative number.

---

## 1 · `sqrt`

**1. Signature**
```glsl
float sqrt(float x)    vec2 sqrt(vec2 x)    vec3 sqrt(vec3 x)    vec4 sqrt(vec4 x)
```

**2. What it does** — the non-negative square root.

**3. Exact definition**
- The non-negative `r` such that `r * r == x`.
- Equivalently `pow(x, 0.5)`, though `sqrt` has its own hardware instruction and is faster.
- ⚠️ **Undefined for `x < 0`.** Not "returns NaN" — GLSL ES 1.0 says *undefined*, which means anything at all.

**4. Picture** — MODE 0, `return sqrt(x);`
- Rises **very steeply from 0**, then flattens toward 1.
- The classic **ease-out** shape: all the change happens early.
- **Look at the left edge.** The curve leaves 0 almost vertically — the slope there is infinite.

**5. Range & edge cases**
- `[0, ∞)` for valid input. `sqrt(0)` = 0 exactly, `sqrt(1)` = 1 exactly.
- ⚠️ **Infinite slope at 0 has a practical consequence:** `sqrt` of a small, noisy value *amplifies* that noise enormously. Never `sqrt` something near zero and expect stability.

**6. Stage** — **2 (FIELD)**, because distance is a square root. Also **4** for brightness.

**7. Idioms**
- **`length(p)` is `sqrt(dot(p, p))`.** Distance *is* a square root.
- **Brightening midtones:** `sqrt(colour)` lightens without clipping. It's a crude gamma-2.0 encode.
- **Ease-out** for any 0..1 value.

**8. Traps**
- ⚠️ Negative input is undefined, and it's silent — no error, no NaN guarantee, just wrong pixels. Guard with `max(x, 0.0)`.
- Reaching for `pow(x, 0.5)` instead. Use `sqrt`.
- If you need `1.0 / sqrt(x)`, use `inversesqrt` — see below.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return sqrt(x);`

---

## 2 · `pow`

**1. Signature**
```glsl
float pow(float x, float y)
vec2  pow(vec2 x, vec2 y)
vec3  pow(vec3 x, vec3 y)
vec4  pow(vec4 x, vec4 y)
```
- ⚠️ **There is NO `(vec, float)` overload in GLSL ES 1.0.** Both arguments must be the same type.
- So **`pow(col, 1.0/2.2)` does not compile.** You must write `pow(col, vec3(1.0/2.2))`. This catches essentially everyone the first time they try gamma correction.

**2. What it does** — raises `x` to the power `y`.

**3. Exact definition**
- `x^y`, computed component-wise.
- ⚠️ **Undefined if `x < 0`.** `pow(-1.0, 2.0)` is *not* guaranteed to be 1.0.
- ⚠️ **Undefined if `x == 0` and `y <= 0`.**
- **Both restrictions come from the implementation** — `exp2(y * log2(x))` needs `log2(x)`, which needs `x > 0`.

**4. Picture** — MODE 0, run these three in order:
- `return pow(x, 5.0);` → **ease-in**: hugs the floor, then rushes up at the end.
- `return pow(x, 0.2);` → **ease-out**: leaps up immediately, then crawls.
- `return pow(x, 1.0);` → a straight line. The identity.
- **Notice both curves pass through (0,0) and (1,1).** `pow` on the unit interval always fixes the endpoints and only bends the middle. That's exactly what makes it a shaping function.

**5. Range & edge cases**
- For `x` in `[0,1]` and `y > 0`: output stays in `[0,1]`. Very convenient.
- `y > 1` pushes values **down** (darkens, sharpens). `0 < y < 1` pushes them **up** (brightens, softens).
- The two undefined cases above.

**6. Stage** — **3 (MASK)** and **4 (COLOUR)**.

**7. Idioms**
- **Gamma encode / decode:** `pow(col, vec3(1.0/2.2))` and `pow(col, vec3(2.2))`. The vector exponent is mandatory.
- **Sharpening a mask:** `pow(mask, 4.0)` tightens a soft falloff into a tight core.
- **Contrast:** `pow(x, k)` with `k` above or below 1.
- **Specular-style falloff:** `pow(someCosine, shininess)` — the higher the exponent, the tighter the highlight.

**8. Traps**
- ⚠️ **The missing scalar overload.** The error message is unhelpful; remember the cause.
- ⚠️ **Negative base is undefined**, and bases often come from signed fields. Clamp first.
- **It's the expensive function in this batch** — two transcendental ops plus a multiply. If the exponent is a small integer, `x*x*x` beats `pow(x, 3.0)`.
- `pow(0.0, 0.0)` is undefined.

**9. AGSL** — present. Pass a matching vector exponent there too.

**10. Lab line** — MODE 0 → `return pow(x, 5.0);` then `pow(x, 0.2);`

---

## 3 · `exp`

**1. Signature**
```glsl
float exp(float x)    vec2 exp(vec2 x)    vec3 exp(vec3 x)    vec4 exp(vec4 x)
```

**2. What it does** — raises **e** (≈ 2.71828) to the power `x`.

**3. Exact definition**
- `e^x`. Equivalently `pow(2.71828…, x)`, or in practice `exp2(x * 1.442695)`.
- **Defined for every real input** — this is the only function in the batch with no restricted domain.

**4. Picture** — MODE 0, `return exp(-4.0 * x);`
- Starts at **1.0** and **decays**, reaching about 0.018 at x = 1.
- **Watch the tail.** It gets very close to zero but never touches. Not visually, not ever.
- Plain `exp(x)` would run off the top of the graph (it hits 2.72 at x = 1), which is why the decay form is the useful one.

**5. Range & edge cases**
- Output is **always strictly positive**. Never zero, never negative.
- ⚠️ Overflows fast in `mediump` — `exp(12.0)` is already ~163,000 and the precision is gone.
- Underflows to zero for large negative inputs, which is usually harmless.

**6. Stage** — **3 (MASK)** for falloff, **2** for attenuation.

**7. Idioms**
- **Glow — the workhorse:** `exp(-k * max(d, 0.0))` → 1 on the shape, fading outward. `k` controls tightness.
- **Attenuation / absorption:** anything that decays by a constant *fraction* per unit distance is an `exp`.
- **Smooth, unbounded falloff** where `smoothstep` would impose a hard cutoff.

**8. Traps**
- ⚠️ **It never reaches zero.** That's its virtue (infinitely soft tail) and its cost — a glow built on `exp` technically covers the whole screen, so it always contributes some cost and some faint light.
- Overflow in `mediump` for positive arguments.
- Use `exp2` if you're thinking in doublings rather than in *e*.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return exp(-4.0 * x);`

---

## 4 · `log`

**1. Signature**
```glsl
float log(float x)    vec2 log(vec2 x)    vec3 log(vec3 x)    vec4 log(vec4 x)
```

**2. What it does** — natural logarithm, base **e**. The inverse of `exp`.

**3. Exact definition**
- The `y` such that `e^y == x`.
- In practice `log2(x) * 0.693147`.
- ⚠️ **Undefined for `x <= 0`.** Including exactly zero.

**4. Picture** — MODE 0, `return log(1.0 + x * 9.0) / log(10.0);`
- Passes through (0,0) and (1,1), but **bulges upward** hard.
- **Read what it's doing:** it takes the small values near 0 and **spreads them out**, while squashing the large ones together.
- That's the whole purpose: **make small differences visible.**

**5. Range & edge cases**
- `log(1.0)` is exactly `0.0`.
- Plunges toward negative infinity as `x` approaches 0.
- Undefined at and below zero — always guard: `log(max(x, 1e-6))`.

**6. Stage** — **3** or **4**, and usually for *inspection* rather than for the final image.

**7. Idioms**
- **Seeing values that span decades.** A glow ranges from 1.0 down to 0.0001; a linear display shows the bright core and nothing else. `1.0 + log(v) / 9.21` maps that whole range onto 0..1 so you can actually see the tail.
- **Turning multiplication into addition** — the classic reason logs exist.
- **Solving for an exponent:** if `v == base^t`, then `t = log(v) / log(base)`.

**8. Traps**
- ⚠️ Undefined at `x <= 0`, silently. This is the most common crash-free-but-wrong bug in the batch.
- `log` is natural log, **not** base 10. There is no `log10` in GLSL — write `log(x) / log(10.0)`.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return log(1.0 + x * 9.0) / log(10.0);`

---

## 5 · `exp2`

**1. Signature** — `float`/`vec2`/`vec3`/`vec4`, same shape as `exp`.

**2. What it does** — raises **2** to the power `x`.

**3. Exact definition**
- `2^x`.
- **This is the hardware primitive.** `exp` and `pow` are built from it, not the other way round.

**4. Picture** — MODE 0, `return exp2(-4.0 * x);`
- Same family of curve as `exp(-4.0 * x)`, decaying a little more slowly (because 2 < e).

**5. Range & edge cases** — always positive; same overflow behaviour as `exp`.

**6. Stage** — **1** or **2**, mostly inside loops.

**7. Idioms**
- **Octaves — this is where `exp2` actually lives:**
  ```glsl
  float f = exp2(float(i));    // 1, 2, 4, 8   → frequency doubling
  float a = exp2(-float(i));   // 1, ½, ¼, ⅛   → amplitude halving
  ```
  - That pair **is the skeleton of fractal noise** (fbm).
- Anything reasoned about in **doublings**: mip levels, LOD, binary subdivision.

**8. Traps**
- People write `pow(2.0, x)` out of habit. `exp2(x)` is the same value and cheaper.
- Confusing it with `exp`. The difference is only the base, but `exp2(3.0)` is 8 while `exp(3.0)` is about 20.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return exp2(-4.0 * x);`

---

## 6 · `log2`

**1. Signature** — `float`/`vec2`/`vec3`/`vec4`.

**2. What it does** — logarithm base 2. The inverse of `exp2`.

**3. Exact definition**
- The `y` such that `2^y == x`. Read it as **"how many doublings is this?"**
- **The hardware primitive**; `log` is `log2` scaled.
- ⚠️ **Undefined for `x <= 0`.**

**4. Picture** — MODE 0, `return log2(1.0 + x * 3.0) / 2.0;`
- Same upward bulge as `log`, different vertical scale. They are the same curve stretched.

**5. Range & edge cases**
- `log2(1.0)` = 0, `log2(2.0)` = 1, `log2(8.0)` = 3 — exactly.
- Undefined at and below zero.

**6. Stage** — **2**, and rarely.

**7. Idioms**
- **Recovering an octave index:** if `f = exp2(i)`, then `i = log2(f)`. Inverse pair, used when a frequency is given and you need to know which octave it is.
- **Mip / LOD selection** in texture-sampling code.
- Any "how many times does this halve" question.

**8. Traps**
- ⚠️ Undefined at `x <= 0`, like `log`.
- **Honest assessment: you will rarely type this one.** It's mostly the engine's function, not yours. It's here because it completes the pair.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return log2(1.0 + x * 3.0) / 2.0;`

---

## 7 · `inversesqrt`

**1. Signature** — `float`/`vec2`/`vec3`/`vec4`.

**2. What it does** — one divided by the square root.

**3. Exact definition**
- `1.0 / sqrt(x)`.
- ⚠️ **Undefined for `x <= 0`** — both because of the square root *and* the division.
- **It is its own hardware instruction**, which is the whole reason it exists as a separate function rather than something you write out.

**4. Picture** — MODE 0, `return inversesqrt(x + 0.05) * 0.2;`
- Starts high on the left and **plunges**, then flattens into a long tail.
- The `+ 0.05` is there because without it the curve is infinite at x = 0 — you'd see nothing but a white column.

**5. Range & edge cases**
- Always positive for valid input.
- **Blows up near zero.** Same infinite-slope problem as `sqrt`, but worse: here it becomes unbounded.
- Undefined at exactly 0 and below.

**6. Stage** — **2 (FIELD)**.

**7. Idioms**
- **`normalize(p)` is `p * inversesqrt(dot(p, p))`.** That is literally how it's implemented — one instruction plus one multiply, instead of a length and a divide.
- **`1/√d` falloff** — a slower, heavier-tailed alternative to `exp` for halos and atmospheric glow.

**8. Traps**
- ⚠️ Undefined at and below zero. Always `max(x, tiny)`.
- ⚠️ **Unbounded near zero** — one pixel of your shader can go to enormous values and blow out the colour. Clamp the result or the input.
- Writing `1.0 / sqrt(x)` by hand. The compiler may or may not fuse it; `inversesqrt` always gets the single instruction.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return inversesqrt(x + 0.05) * 0.2;`

---

## What batch 3 unlocked — glow, gamma, and octaves

Every function in the batch appears:

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

#define LOG_VIEW 0   // flip to 1 to view the glow on a LOG scale

void main() {
    // ---- 1 DOMAIN --------------------------------------------------
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

    // ---- 2 FIELD (batch 1) -----------------------------------------
    float d = abs(p.x) + abs(p.y) - 0.25;          // diamond

    // ---- 3 MASK ----------------------------------------------------
    float fill  = smoothstep(0.004, -0.004, d);         // batch 2
    float glow  = exp(-7.0 * max(d, 0.0));              // exp: never reaches zero
    float core  = pow(glow, 6.0);                       // pow: tightens the falloff
    float inner = sqrt(clamp(-d * 5.0, 0.0, 1.0));      // sqrt: ease-out inside
    float halo  = 0.015 * inversesqrt(max(d, 0.002));   // inversesqrt: 1/sqrt falloff

    // exp2 in its natural habitat: octaves. This is fbm's skeleton.
    float stripes = 0.0;
    for (int i = 0; i < 3; i++) {
        float f = exp2( float(i));                      // 1, 2, 4   frequency
        float a = exp2(-float(i));                      // 1, ½, ¼   amplitude
        stripes += a * abs(fract(p.x * 3.0 * f) * 2.0 - 1.0);
    }
    stripes /= 1.75;                                    // 1 + ½ + ¼

    // ---- 4 COLOUR --------------------------------------------------
    vec3 col = vec3(0.03, 0.03, 0.05);
    col += vec3(0.10, 0.12, 0.20) * stripes * 0.5;

#if LOG_VIEW
    // log makes a value spanning decades actually visible
    float shown = clamp(1.0 + log(max(glow, 1e-4)) / 9.21, 0.0, 1.0);
    col = vec3(shown);
#else
    col += vec3(0.95, 0.45, 0.15) * glow * 0.9;
    col += vec3(1.00, 0.85, 0.60) * core;
    col += vec3(0.30, 0.50, 1.00) * halo;
    col  = mix(col, vec3(1.00, 0.95, 0.85), fill * inner);
#endif

    // pow needs a MATCHING VECTOR exponent in GLSL ES 1.0.
    // pow(col, 1.0/2.2) will NOT compile.
    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));

    gl_FragColor = vec4(col, 1.0);
}
```

**Five things to do with it**

- **Flip `LOG_VIEW` to `1`.** The screen fills with a huge soft gradient — that's the glow's tail, which was there all along and which the linear view could not show you. **That's what `log` is for.**
- **Change `pow(col, vec3(1.0/2.2))` to `pow(col, vec3(1.0))`** — gamma off. Everything goes darker and muddier. Now try deleting the `vec3(…)` wrapper and watch it fail to compile.
- **Change `exp(-7.0 * …)` to `exp(-25.0 * …)`** — the glow tightens to a thin rim. `k` is the only knob.
- **Change `pow(glow, 6.0)` to `pow(glow, 1.0)`** — the bright core vanishes into the glow. `pow` was doing all the work of separating them.
- **Change `exp2(float(i))` to `1.0`** — all three octaves become identical and the stripes lose their fine detail. That's the octave structure, on and off.

## The seven things worth remembering from batch 3

- **`exp2` and `log2` are the hardware primitives.** `pow`, `exp`, and `log` are built on them — that one fact explains the costs and the restrictions.
- **`pow` has no scalar-exponent overload in ES 1.0.** `pow(col, vec3(1.0/2.2))`, always.
- **`pow` fixes both endpoints on the unit interval** — it only bends the middle, which is exactly what a shaping function should do.
- **`exp(-k*d)` is the glow**, and it never reaches zero.
- **`log` is for seeing**, not usually for the final image — it reveals what spans decades.
- **`exp2(i)` / `exp2(-i)` is the octave pair** that fbm is made of.
- **Six of these seven have silent undefined domains.** `sqrt`, `pow`, `log`, `log2`, `inversesqrt` all need a guard. Only `exp` and `exp2` accept anything.
