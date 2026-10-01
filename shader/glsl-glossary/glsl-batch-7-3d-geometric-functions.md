# GLSL Batch 7 — `cross` `reflect` `refract` `faceforward`

**Up front: this batch is completeness, not capability.** All four are surface-lighting functions from the 3D pipeline. For 2D work most of them never come up — but each one gets its honest 2D payoff below rather than a shrug, and where there isn't one, that's stated plainly.

*(Lab modes referenced below: MODE 0 = 1D graph, MODE 1 = 2D heat map with contours and a mouse operand, MODE 2 = 2D vector field as RGB.)*

---

## 1 · `cross`

**1. Signature**
```glsl
vec3 cross(vec3 x, vec3 y)
```
- ⚠️ **`vec3` only.** No `vec2`, no `vec4`, no `float`. The only function in the whole glossary with a single fixed type — because the cross product simply doesn't exist in other dimensions the same way.

**2. What it does** — produces a vector perpendicular to both inputs.

**3. Exact definition**
```glsl
cross(a, b) == vec3(a.y*b.z - a.z*b.y,
                    a.z*b.x - a.x*b.z,
                    a.x*b.y - a.y*b.x)
```
- **Direction:** perpendicular to the plane containing `a` and `b`, oriented by the right-hand rule.
- **Magnitude:** `|a| · |b| · sin(θ)` — the **area of the parallelogram** they span.
- ⚠️ **Not commutative.** `cross(a, b) == -cross(b, a)`. Swapping the arguments flips the result.
- **Complementary to `dot`:** `dot` uses `cos` and peaks when vectors align; `cross` uses `sin` and peaks when they're perpendicular. `cross` of two parallel vectors is the **zero vector**.

**4. Picture**
- **Not graphable in the lab.** It takes two `vec3`s and returns a `vec3` — none of the modes fit. That's honest, not a gap in the harness.
- **But its 2D shadow is graphable and genuinely useful.** Take only the z-component:
  ```glsl
  float cross2(vec2 a, vec2 b) { return a.x * b.y - a.y * b.x; }
  ```
  - MODE 1 → `return cross2(normalize(m), p);` → **straight stripes**, and the sign tells you which side of the mouse direction you're on. Positive on the left, negative on the right.

**5. Range & edge cases**
- Unbounded.
- **Zero vector when the inputs are parallel** (or when either is zero). That's a real case in normal-calculation code: degenerate triangles produce a zero normal.

**6. Stage** — **2 (FIELD)**, in 3D work.

**7. Idioms**
- **Surface normal from two edges:** `normalize(cross(b - a, c - a))` — how every triangle mesh gets its normal.
- **Triangle area:** `0.5 * length(cross(b - a, c - a))`.
- **In 2D, via `cross2` — and this is the part worth keeping:**
  - **Which side of a line am I on?** The sign of `cross2(lineDir, p - lineStart)`.
  - **Winding order** of a polygon — sum the `cross2` of consecutive edges.
  - **Point in triangle** — three side tests, all the same sign.
  - **This is how polygon SDFs recover their sign.** A polygon's distance is easy to compute but always positive; the inside/outside test that supplies the sign is built from `cross2`.

**8. Traps**
- ⚠️ **`vec3` only.** Trying `cross(vec2, vec2)` is a compile error, and people hit it constantly in 2D shaders. Write `cross2` yourself.
- ⚠️ **Argument order matters** — the result flips.
- Zero result for parallel inputs, which then breaks a downstream `normalize`.

**9. AGSL** — present for `float3`.

**10. Lab line** — MODE 1 → `return cross2(normalize(m), p);` *(define `cross2` yourself as above)*

---

## 2 · `reflect`

**1. Signature**
```glsl
float reflect(float I, float N)    vec2 reflect(vec2 I, vec2 N)
vec3  reflect(vec3 I, vec3 N)      vec4 reflect(vec4 I, vec4 N)
```
- `I` = **incident** direction, `N` = **normal**.

**2. What it does** — bounces a direction off a surface, like a mirror.

**3. Exact definition**
```glsl
reflect(I, N) == I - 2.0 * dot(N, I) * N
```
- Read it as: **take out the component along the normal, twice.** The part of `I` parallel to `N` gets negated; the part perpendicular to `N` is untouched.
- ⚠️ **`N` must already be normalized.** The formula assumes it. GLSL won't normalize for you, and an unnormalized `N` silently gives a wrong answer that still *looks* like a reflection.
- ⚠️ **`I` points TOWARD the surface**, not away from it. Passing the outgoing direction gives you a plausible-looking wrong result — the classic bug in this function.

**4. Picture** — MODE 2, `return reflect(normalize(p), normalize(m));`
- A vector field that **flips across the line perpendicular to the mouse direction.** Drag the mouse and the mirror line rotates.

**5. Range & edge cases**
- With unit `N`, the output has **the same magnitude as `I`** — reflection preserves length.
- If `dot(N, I) == 0` (grazing), the result is `I` unchanged.

**6. Stage** — **1 (DOMAIN)** for folding space, **2 (FIELD)** for 3D lighting.

**7. Idioms**
- **The real 2D use: kaleidoscope folding.**
  ```glsl
  vec2 n = vec2(cos(a), sin(a));              // unit mirror normal
  q = dot(q, n) < 0.0 ? reflect(q, n) : q;    // fold, don't just mirror
  ```
  - Applied to a **position** rather than a direction, `reflect` mirrors the point across a line through the origin. Do it repeatedly at different angles and you get radial symmetry for free.
  - The conditional is what makes it a *fold* rather than a flip: only points on the far side get moved.
- **Mirror-tiling a pattern** so it repeats without visible seams.
- In 3D: specular highlights and environment lookups.

**8. Traps**
- ⚠️ **`N` must be unit.**
- ⚠️ **Sign convention on `I`** — incoming, not outgoing.
- Applying it to a position when you meant a direction, or vice versa. Both compile.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 2 → `return reflect(normalize(p), normalize(m));`

---

## 3 · `refract`

**1. Signature**
```glsl
float refract(float I, float N, float eta)    vec2 refract(vec2 I, vec2 N, float eta)
vec3  refract(vec3 I, vec3 N, float eta)      vec4 refract(vec4 I, vec4 N, float eta)
```
- ⚠️ **`eta` is a `float` even in the vector overloads.** It's the only three-argument geometric function, and the odd one out in typing.

**2. What it does** — bends a direction as it crosses between two media. Snell's law.

**3. Exact definition**
```glsl
float k = 1.0 - eta * eta * (1.0 - dot(N, I) * dot(N, I));
if (k < 0.0)
    return genType(0.0);                                 // total internal reflection
else
    return eta * I - (eta * dot(N, I) + sqrt(k)) * N;
```
- **`eta` is the ratio of refractive indices**, `n1 / n2`. Air into glass is roughly `1.0 / 1.5 ≈ 0.667`.
- ⚠️ **Both `I` and `N` must be normalized.**
- ⚠️ **When `k < 0` it returns the ZERO VECTOR.** Not undefined, not an error — a genuine, specified zero. That's **total internal reflection**: the ray can't get out at that angle.

**4. Picture** — MODE 2, `return refract(normalize(p), normalize(m), 0.7);`
- Mostly a smoothly bent field — with **a region that collapses to flat grey.** That grey is the zero vector: the TIR zone. Change `0.7` to `1.4` and watch it grow.

**5. Range & edge cases**
- Output has magnitude ~1 for unit inputs, **or exactly 0** in the TIR case.
- `eta == 1.0` means no bending — the output equals `I`.

**6. Stage** — **2 (FIELD)**.

**7. Idioms**
- **Glass, water, lenses, heat haze** — bending a lookup direction before sampling something.
- **In 2D:** offsetting a sample position inside a circular "lens" to fake distortion.

**8. Traps**
- ⚠️ **The zero-vector return is the thing to remember.** Unhandled, TIR regions render **black**, and it looks like a bug in your lighting rather than correct physics. Test for it: `length(result) < 0.0001`.
- ⚠️ **`eta` inverted.** Going glass→air is `1.5/1.0`, not `1.0/1.5`. Swapping them gives a plausible-but-wrong image.
- Unnormalized inputs.
- **Honest assessment: this will not come up in 2D work.** It's here for completeness.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 2 → `return refract(normalize(p), normalize(m), 0.7);`

---

## 4 · `faceforward`

**1. Signature**
```glsl
float faceforward(float N, float I, float Nref)    vec2 faceforward(vec2 N, vec2 I, vec2 Nref)
vec3  faceforward(vec3 N, vec3 I, vec3 Nref)       vec4 faceforward(vec4 N, vec4 I, vec4 Nref)
```

**2. What it does** — flips a normal so it points back toward where you came from.

**3. Exact definition**
```glsl
faceforward(N, I, Nref) == (dot(Nref, I) < 0.0) ? N : -N
```
- ⚠️ **The test uses `Nref`, not `N`.** Three arguments, and the one being tested is the third — which reads backwards to almost everyone.
- In practice it's nearly always called as `faceforward(N, I, N)`, making the third argument redundant. The separate `Nref` exists for cases where you want to decide using a different reference normal.
- Note the condition: `dot < 0` returns `N` **unchanged**. That's "already facing away from the incident direction, leave it alone".

**4. Picture**
- **Not meaningfully graphable.** It returns one of two values — either `N` or `-N` — so every view shows a hard two-tone split. That's the honest answer; there's no shape to see.

**5. Range & edge cases**
- Output is exactly `N` or exactly `-N`.
- `dot(Nref, I) == 0` exactly returns `-N` (the condition is strictly `< 0`).

**6. Stage** — **2 (FIELD)**, in 3D.

**7. Idioms**
- **Double-sided surfaces.** When a ray hits the back face of a polygon, the stored normal points away from the viewer and your lighting goes black. `faceforward` flips it.
- **Raymarching from inside a volume**, where you've entered an object and the sign convention inverts.

**8. Traps**
- ⚠️ **The `Nref` argument.** Read it once, carefully, and then just write the one-liner yourself.
- ⚠️ **No HLSL equivalent**, so any port needs the manual version.
- It's trivially replaceable: `dot(Nref, I) < 0.0 ? N : -N`.
- **Honest assessment: this is the least-used function in the entire 47.** In two dimensions it has no natural job at all. Recognize it, know it's one ternary, move on.

**9. AGSL** — present in GLSL; **verify before relying on it in AGSL** rather than assuming. The one-line replacement costs nothing and always works.

**10. Lab line** — none that teaches anything. Skip it.

---

## What batch 7 unlocked — kaleidoscope, and cross's 2D shadow

Two of the four earn their place in 2D. This demo shows all four honestly.

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

#define PI 3.14159265359

// The 2D shadow of cross(): its z-component alone.
// The SIGN says which side of `a` the vector `b` lies on.
float cross2(vec2 a, vec2 b) { return a.x * b.y - a.y * b.x; }

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    vec2 m = (u_mouse         - 0.5 * u_resolution) / u_resolution.y;

    // ---- 1 DOMAIN: kaleidoscope, built from reflect() ---------------
    // Fold space across 6 mirror lines. Folding (not flipping) needs the test.
    vec2 q = p;
    for (int i = 0; i < 6; i++) {
        float a = float(i) * PI / 6.0 + u_time * 0.10;
        vec2  n = vec2(cos(a), sin(a));               // unit by construction
        q = (dot(q, n) < 0.0) ? reflect(q, n) : q;    // reflect a POSITION
    }

    // ---- 2 FIELD: triangle from three cross2 side tests -------------
    vec2 A = vec2( 0.00,  0.26);
    vec2 B = vec2(-0.22, -0.15);
    vec2 C = vec2( 0.22, -0.15);
    float tri = min(min(cross2(B - A, q - A),
                        cross2(C - B, q - B)),
                        cross2(A - C, q - C));        // all positive -> inside

    float ring = length(q) - 0.34;

    // refract: bend a downward ray through a circular "lens".
    // It returns the ZERO VECTOR under total internal reflection.
    vec2  nrm  = normalize(q + vec2(1e-5));
    vec2  bent = refract(vec2(0.0, -1.0), nrm, 0.62);
    float tir  = 1.0 - step(0.0001, length(bent));    // 1 where refract gave zero

    // faceforward: flip the normal to face the mouse. Illustrative only -
    // in 2D there is no back face, so this is a demonstration, not a need.
    vec2  toM = normalize(m - q + vec2(1e-5));
    vec2  fn  = faceforward(nrm, toM, nrm);
    float lam = max(dot(fn, toM), 0.0);

    // ---- 3 MASK ------------------------------------------------------
    float fill = smoothstep(-0.002, 0.002, tri);
    float edge = smoothstep(0.004, 0.0, abs(ring) - 0.003);

    // ---- 4 COLOUR ----------------------------------------------------
    vec3 col = vec3(0.04, 0.04, 0.06);
    col = mix(col, vec3(0.30, 0.12, 0.45), tir * 0.6);            // the TIR zone
    col = mix(col, mix(vec3(0.20, 0.45, 0.70),
                       vec3(1.00, 0.80, 0.40), lam), fill);
    col = mix(col, vec3(1.0), edge);
    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));

    gl_FragColor = vec4(col, 1.0);
}
```

**Five things to do with it**

- **Change the loop bound `6` to `3`, then `12`.** More mirrors, more symmetry. **That's `reflect` doing all the work** — the triangle is drawn once and the folding replicates it.
- **Remove the conditional** — `q = reflect(q, n);` unconditionally. The kaleidoscope collapses into a plain mirror. **The test is what makes it a fold.**
- **Change `refract(..., 0.62)` to `0.95`, then `1.6`.** The purple TIR zone shrinks, then floods the screen. That's the zero-vector return, made visible.
- **Change `min(min(...))` to `max(max(...))`** in the triangle. You get the *outside* of the three half-planes instead — three side tests, recombined.
- **Swap the argument order in one `cross2` call** (`cross2(q - A, B - A)`). That edge's test inverts and the triangle loses a side. **Non-commutativity, seen.**

## The six things worth remembering from batch 7

- **`cross` is `vec3` only** — but **`cross2(a,b) = a.x*b.y - a.y*b.x`** is the 2D version you'll actually write, and its **sign is a which-side test**.
- **`cross` is `dot`'s complement:** `dot` peaks when aligned (`cos`), `cross` peaks when perpendicular (`sin`).
- **`reflect(I, N) = I - 2*dot(N,I)*N`**, `N` must be unit, and `I` points **toward** the surface.
- **`reflect` on a position mirrors across a line** — conditionally applied, that's a kaleidoscope fold, and it's the one genuinely useful 2D function here.
- **`refract` returns the zero vector under total internal reflection.** Handle it or render black.
- **`faceforward` tests `Nref`, not `N`** — and is one ternary you could write yourself. Least-used function in the glossary.
