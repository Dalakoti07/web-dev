# GLSL Batch 5 — `asin` `acos` `atan`

**Read this first.** `sin`, `cos` and `tan` are **not one-to-one** — `sin(0)` and `sin(π)` are both 0, so "the angle whose sine is 0" has infinitely many answers. An inverse has to **pick one branch**, and that forced choice is why all three functions here have restricted output ranges. It isn't a quirk; it's the only thing they could have done.

| Function | Output range | Why that one |
|---|---|---|
| `asin` | `[−π/2, π/2]` | the stretch where `sin` climbs once, monotonically |
| `acos` | `[0, π]` | the stretch where `cos` falls once, monotonically |
| `atan(y,x)` | `(−π, π]` | a full turn — but half-open, which creates a seam |

---

## 1 · `asin`

**1. Signature**
```glsl
float asin(float x)    vec2 asin(vec2 x)    vec3 asin(vec3 x)    vec4 asin(vec4 x)
```

**2. What it does** — returns the angle whose sine is `x`.

**3. Exact definition**
- The angle `a` in `[−π/2, π/2]` such that `sin(a) == x`.
- Result in **radians**.
- ⚠️ **Undefined if `|x| > 1`.** Sine never exceeds 1, so asking for the angle whose sine is 1.3 is a meaningless question — and GLSL answers it with *undefined*, not an error.

**4. Picture** — MODE 0, `return asin(x * 2.0 - 1.0) / 3.1416 + 0.5;`
- An S-curve that is **steep at both ends and flat in the middle** — the exact opposite of `sin`'s shape.
- **That's what "inverse" looks like:** reflect `sin` across the diagonal `y = x`. Where `sin` is flat (at its peaks), `asin` is vertical. Where `sin` is steep (at zero), `asin` is shallow.
- The tangent is genuinely **vertical** at `x = ±1`.

**5. Range & edge cases**
- Output `[−π/2, π/2]` ≈ `[−1.571, 1.571]`.
- `asin(0) = 0`, `asin(1) = π/2` exactly.
- Undefined outside `[−1, 1]`.
- Infinite slope at the endpoints — small input errors near ±1 become large angle errors.

**6. Stage** — **2 (FIELD)**, and not often.

**7. Idioms**
- **`asin(sin(x))` is a triangle wave.** Feed it a full sine and it folds everything back into `[−π/2, π/2]`, producing sharp peaks instead of round ones. Genuinely useful when you want rays or spikes rather than lobes.
- Recovering a latitude from a height on a sphere.

**8. Traps**
- ⚠️ **`|x| > 1` is undefined**, and the usual source is floating-point drift — see `acos` below, where it bites much harder.
- The vertical tangents mean `asin` amplifies noise near ±1.
- **Honest assessment: the rarest of the three.** Its main appearance is the triangle-wave trick.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return asin(x * 2.0 - 1.0) / 3.1416 + 0.5;`

---

## 2 · `acos`

**1. Signature** — `float`/`vec2`/`vec3`/`vec4`.

**2. What it does** — returns the angle whose cosine is `x`.

**3. Exact definition**
- The angle `a` in `[0, π]` such that `cos(a) == x`.
- ⚠️ **Undefined if `|x| > 1`.**
- **It decreases:** `acos(−1) = π`, `acos(0) = π/2`, `acos(1) = 0`. Bigger input, smaller angle.

**4. Picture** — MODE 0, `return acos(x * 2.0 - 1.0) / 3.1416;`
- Starts at **1.0** on the left and **falls** to 0 on the right. The only decreasing curve in the glossary so far.
- Same steep-ends-flat-middle shape as `asin`, flipped vertically.

**5. Range & edge cases**
- Output `[0, π]`.
- Undefined outside `[−1, 1]`.
- Vertical tangents at both endpoints.

**6. Stage** — **2 (FIELD)**.

**7. Idioms**
- **The canonical one: angle between two unit vectors.**
  ```glsl
  float angle = acos(clamp(dot(a, b), -1.0, 1.0));
  ```
  - This is *the* reason `acos` exists in a shading language. Lighting, cones, spotlights, "is this within X degrees of that".
  - **The `clamp` is not optional** — see the traps.
- Cone/spotlight falloff.

**8. Traps**
- ⚠️ **The clamp trap, and it's the most important thing in this batch.** Two vectors you believe are unit-length produce a dot product that *should* be at most 1.0 — but floating-point rounding hands you `1.0000001`. `acos` of that is **undefined**: you may get NaN, you may get garbage, and on `mediump` it happens more often than you'd think. The symptom is a scattering of black or white pixels exactly where surfaces are most aligned. **Always clamp.**
- ⚠️ **It's expensive.** And usually avoidable — see the performance idiom below.
- Forgetting that it decreases.

**9. AGSL** — present, identical. Clamp there too.

**10. Lab line** — MODE 0 → `return acos(x * 2.0 - 1.0) / 3.1416;`

---

## 3 · `atan`

**1. Signature** — **two distinct functions sharing one name:**
```glsl
float atan(float y_over_x)            // one argument
float atan(float y, float x)          // TWO arguments  <- the important one
```
- Both have the usual `vec2`/`vec3`/`vec4` forms.
- ⚠️ **The two-argument form takes `y` FIRST.** Same convention as C's `atan2(y, x)`. Writing `atan(p.x, p.y)` compiles fine and gives you a pattern that's mirrored and rotated 90° — a silent, plausible-looking bug.

**2. What it does** — converts a **point** into an **angle**.

**3. Exact definition**
- **One-argument:** the angle in `(−π/2, π/2)` whose tangent is the input.
- **Two-argument:** the angle of the point `(x, y)` measured from the positive x-axis, **using the signs of both arguments to pick the correct quadrant**.
  - Output range `(−π, π]` — a full turn.
  - ⚠️ **Undefined when both `x` and `y` are zero.** There is no angle at the origin.
- **Why the two-arg form is the real one:** `atan(y/x)` has already lost information. `1/1` and `−1/−1` are both `1`, so the one-arg form cannot tell the first quadrant from the third. Passing `y` and `x` separately preserves that.

**4. Picture**
- **One-arg** — MODE 0, `return atan(x * 6.0 - 3.0) / 3.1416 + 0.5;`
  - A gentle S that **flattens forever without ever arriving.** It approaches 0 and 1 asymptotically. That's "soft saturation" — useful whenever you want to squash an unbounded value into a bounded one without a hard clamp.
- **Two-arg** cannot be drawn on a 1D graph at all. Use a 2D heat-map view:
  ```glsl
  float fField(vec2 p, vec2 m) { return atan(p.y, p.x); }
  ```
  - You'll see a pinwheel of brightness sweeping around the origin — and **one hard edge** on the left where it wraps.

**5. Range & edge cases**
- One-arg: `(−π/2, π/2)`, never reaching either.
- Two-arg: `(−π, π]`.
- ⚠️ **Undefined at the origin** for the two-arg form.
- ⚠️ **The seam.** Because the range is half-open, the value jumps from `+π` straight to `−π` as you cross the negative x-axis. That discontinuity is real, it's visible, and `fwidth` spikes across it.

**6. Stage** — **1 (DOMAIN)**. Polar is a change of coordinates, which is stage 1's whole job.

**7. Idioms**
- **Polar coordinates — the unlock of this batch:**
  ```glsl
  float a = atan(p.y, p.x);                  // angle
  float r = sqrt(p.x * p.x + p.y * p.y);     // radius
  ```
  Once you have `(a, r)` instead of `(x, y)`, radial things become easy: anything periodic in `a` is rotationally symmetric, anything varying in `r` is a ring.
- **N-fold symmetry:** `mod(a, TAU / n)` folds the plane into `n` identical wedges.
- **Flowers and rosettes:** modulate the radius by the angle — `r - (base + amp * cos(a * n))`.
- **Radar sweeps, pie slices, angular gradients** — all just masks on `a`.
- **Soft saturation** (one-arg form): squash an unbounded value into a range without clipping.

**8. Traps**
- ⚠️ **Argument order `(y, x)`.**
- ⚠️ **The seam at ±π.** If your pattern's period doesn't divide the circle evenly, you get a visible join line. Standard fixes: make the pattern period divide `TAU` exactly, or work with `cos(a)`/`sin(a)` instead of `a` itself.
- ⚠️ **Undefined at the origin** — every full-screen polar shader has one bad pixel at dead centre. Usually invisible, occasionally not.
- Reaching for the one-arg form by habit and losing two quadrants.

**9. AGSL** — both forms present, identical semantics and argument order.

**10. Lab line** — MODE 0 → `return atan(x * 6.0 - 3.0) / 3.1416 + 0.5;`  ·  2D heat view → `return atan(p.y, p.x);`

---

## The performance idiom worth learning now

- **Don't compute an angle just to compare angles.**
- To ask *"is this direction within 30° of that one?"*:
  ```glsl
  // expensive, and needs a clamp
  if (acos(clamp(dot(a, b), -1.0, 1.0)) <= radians(30.0)) …

  // free, and no clamp needed
  if (dot(a, b) >= cos(radians(30.0))) …
  ```
- `cos` is **decreasing** on `[0, π]`, so "smaller angle" is exactly "larger cosine". The comparison flips, and the inverse trig disappears entirely.
- `cos(radians(30.0))` is a constant the compiler folds. **This is the single most valuable optimization habit in this batch.**

---

## What batch 5 unlocked — polar coordinates

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

#define PI  3.14159265359
#define TAU 6.28318530718

#define SHOW_ANGLE 0   // flip to 1 to see atan's raw output - and its seam

void main() {
    // ---- 1 DOMAIN: cartesian -> POLAR ------------------------------
    vec2  p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    float a = atan(p.y, p.x);                  // angle, (-PI, PI].  y FIRST.
    float r = sqrt(p.x * p.x + p.y * p.y);     // radius (batch 3)

    vec3 col;

#if SHOW_ANGLE
    // atan's output, remapped to 0..1. The hard black/white line pointing left
    // is the SEAM, where the angle wraps from +PI to -PI.
    col = vec3((a + PI) / TAU);
#else
    // ---- 2 FIELD ---------------------------------------------------
    float petals = 7.0;

    // radius modulated by angle -> a flower
    float rr = 0.28 + 0.06 * cos(a * petals + u_time * 0.6);
    float d  = r - rr;

    // asin(sin(x)) is a TRIANGLE wave - sharp peaks instead of round ones
    float tri = asin(sin(a * petals)) / (PI * 0.5);        // -1 .. 1

    // acos: angle between this pixel's direction and straight up.
    // The clamp is MANDATORY: a rounding error past 1.0 is undefined behaviour.
    vec2  dir = p / max(r, 0.0001);
    float ang = acos(clamp(dir.y, -1.0, 1.0));             // 0 .. PI

    // ---- 3 MASK ----------------------------------------------------
    float fill  = smoothstep(0.004, -0.004, d);
    float ring  = smoothstep(0.006, 0.0, abs(d) - 0.004);
    float spike = smoothstep(0.35, 1.0, tri) * smoothstep(0.34, 0.30, r);

    // ---- 4 COLOUR --------------------------------------------------
    vec3 pal = 0.5 + 0.5 * cos(TAU * (ang / PI + vec3(0.00, 0.33, 0.67)));

    col = vec3(0.04, 0.04, 0.06);
    col = mix(col, pal * 0.25, smoothstep(0.45, 0.0, r));
    col = mix(col, pal,        fill);
    col = mix(col, vec3(1.0),  ring);
    col = mix(col, vec3(1.0, 0.9, 0.6), spike * 0.8);

    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
#endif

    gl_FragColor = vec4(col, 1.0);
}
```

**Five things to do with it**

- **Flip `SHOW_ANGLE` to `1`.** A smooth pinwheel — with **one hard line pointing left**. That's the seam, and seeing it once will save you an hour some day.
- **Swap `atan(p.y, p.x)` to `atan(p.x, p.y)`.** The whole flower mirrors and turns 90°. Nothing errors. **That's why the argument order matters.**
- **Change `asin(sin(a * petals))` to `sin(a * petals)`.** The rays go from sharp spikes to soft round lobes. That single substitution is the triangle wave, on and off.
- **Change `petals` to `3.0`, then `12.0`.** N-fold symmetry with one number.
- **Delete the `clamp` inside `acos`.** It will probably still look fine — and that's the point. It's a latent bug that surfaces on a different GPU, at a different precision, months later.

## The eight things worth remembering from batch 5

- **Restricted ranges are forced, not arbitrary** — the forward functions aren't one-to-one.
- **`asin`/`acos` are undefined for `|x| > 1`**, and float drift puts you there routinely.
- **`acos(clamp(dot(a,b), -1.0, 1.0))`** — the clamp is part of the idiom, not a precaution.
- **`atan(y, x)` — y first.**
- **The two-arg form preserves the quadrant; the one-arg form throws it away.**
- **`atan` has a seam** at ±π. It's visible, and `fwidth` spikes on it.
- **`asin(sin(x))` is a triangle wave.**
- **Compare cosines, not angles.** `dot >= cos(threshold)` beats `acos(dot) <= threshold`.
