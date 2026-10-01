# GLSL Batch 4 — `radians` `degrees` `sin` `cos` `tan`

---

## 1 · `radians`

**1. Signature**
```glsl
float radians(float degrees)    vec2 radians(vec2 degrees)
vec3  radians(vec3 degrees)     vec4 radians(vec4 degrees)
```

**2. What it does** — converts degrees into radians.

**3. Exact definition**
- `degrees * (π / 180.0)`, i.e. multiply by about **0.0174533**.
- It is a **plain multiply**. Nothing clever, no branch, no lookup.

**4. Picture** — MODE 0, `return radians(x * 60.0) / 1.05;`
- A **straight line**. It's linear, so there is no interesting shape — that's the point.
- The scaling in the lab line just brings the output back into 0..1 so you can see it.

**5. Range & edge cases**
- Linear over all inputs. No restricted domain, no overflow you'll ever hit.

**6. Stage** — **1 (DOMAIN)**, where rotation angles live.

**7. Idioms**
- **Readable constants:** `radians(45.0)` says what you mean; `0.785398` does not.
- Converting a designer's or an API's degree value at the boundary of your shader.

**8. Traps**
- ⚠️ **The whole reason this function exists: GLSL trig takes radians, always.** `sin(90.0)` is **0.894**, not 1.0 — because it read 90 as 90 *radians*, which is about 14 full turns. It won't warn you. It just looks wrong.
- Most shader code skips this function entirely and writes `TAU`-based fractions instead. Both are fine.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return radians(x * 60.0) / 1.05;`

---

## 2 · `degrees`

**1. Signature** — `float`/`vec2`/`vec3`/`vec4`, mirror of `radians`.

**2. What it does** — converts radians into degrees.

**3. Exact definition**
- `radians * (180.0 / π)`, i.e. multiply by about **57.2958**.
- Exact inverse of `radians`.

**4. Picture** — MODE 0, `return degrees(x) / 57.3;`
- A straight line again, and the lab line's divisor cancels the function almost exactly. **That's the honest picture: it's one multiply.**

**5. Range & edge cases** — none worth listing.

**6. Stage** — none, really.

**7. Idioms**
- Reading a value back out in human units.

**8. Traps**
- ⚠️ **Honest assessment: this function has no real use inside a fragment shader.** A shader cannot print, log, or return a number to you — everything it produces is a pixel colour. Converting to degrees to *look at* a value is not a thing you can do here.
- It's in the glossary for completeness and for vertex/compute contexts where a value might travel elsewhere. Learn it in ten seconds and move on.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return degrees(x) / 57.3;`

---

## 3 · `sin`

**1. Signature**
```glsl
float sin(float angle)    vec2 sin(vec2 angle)
vec3  sin(vec3 angle)     vec4 sin(vec4 angle)
```

**2. What it does** — the sine wave. The fundamental oscillation.

**3. Exact definition**
- Sine of an angle **in radians**.
- **Period is `TAU` = 2π ≈ 6.28318.** One full turn.
- Key values: `sin(0) = 0`, `sin(π/2) = 1`, `sin(π) = 0`, `sin(3π/2) = −1`.
- **It starts at zero and rises.**

**4. Picture** — MODE 0, `return sin(x * TAU) * 0.5 + 0.5;`
- **One complete wave** across the canvas: starts at 0.5, up to 1, down through 0.5 to 0, back to 0.5.
- **The `* 0.5 + 0.5` is not decoration.** Without it, half the wave is negative and simply doesn't render. Try `return sin(x * TAU);` and watch the bottom half vanish below the axis.

**5. Range & edge cases**
- **Output is `[-1, 1]`.** Not 0..1. Every mask and colour use needs the remap.
- ⚠️ **`mediump` + large arguments degrades badly.** `sin(u_time * 100.0)` looks fine for a few seconds then visibly falls apart as precision runs out, because the argument grows without bound.

**6. Stage** — all four. Stage 1 (wobbling a domain), 2 (wave fields), 3 (oscillating a threshold), 4 (palettes).

**7. Idioms**
- **The remap:** `0.5 + 0.5 * sin(x)` → a wave in 0..1. Burn this into your fingers.
- **Animation:** `sin(u_time * speed)` for anything that should breathe, pulse, or sway.
- **Displacing a line into a wave:** `p.y - 0.3 - amp * sin(p.x * freq)`.
- **The unit circle:** `(cos a, sin a)` is a point one unit from the origin at angle `a`. Everything rotational comes from this.
- **The classic hash:** `fract(sin(x * 12.9898) * 43758.5453)` uses `sin` not as a wave but as a **chaotic scrambler** — see the traps.

**8. Traps**
- ⚠️ **Radians, not degrees.**
- ⚠️ **The `[-1,1]` range.** Forgetting the remap is the single most common batch-4 bug: half your effect disappears.
- ⚠️ **The `sin` hash is not portable.** It depends on the precision of `sin` at huge arguments, which differs between GPUs. It's everywhere in tutorials, it will look different on a phone than in a browser, and it's the reason serious noise code moves to real hash functions.
- Precision degradation over long runtimes.

**9. AGSL** — present, identical. The precision caveat applies there too.

**10. Lab line** — MODE 0 → `return sin(x * TAU) * 0.5 + 0.5;`

---

## 4 · `cos`

**1. Signature** — `float`/`vec2`/`vec3`/`vec4`, same as `sin`.

**2. What it does** — the same wave, **shifted a quarter turn**.

**3. Exact definition**
- Cosine of an angle in radians. Period `TAU`.
- **`cos(x) == sin(x + π/2)`.** One function, two entry points.
- Key values: `cos(0) = 1`, `cos(π/2) = 0`, `cos(π) = −1`.
- **It starts at maximum**, where `sin` starts at zero. That difference is the only reason to pick one over the other.

**4. Picture** — MODE 0, `return cos(x * TAU) * 0.5 + 0.5;`
- Starts at **1.0**, dips to 0 in the middle, returns to 1.
- Put it next to the `sin` picture: identical shape, slid left by a quarter.

**5. Range & edge cases**
- `[-1, 1]`, same remap needed.
- Same `mediump` degradation at large arguments.
- **`sin(x)² + cos(x)² == 1`** for every `x` — the Pythagorean identity, and the reason `(cos a, sin a)` always lands exactly on the unit circle.

**6. Stage** — all four, like `sin`.

**7. Idioms**
- **Palettes.** The standard cosine palette is
  ```glsl
  vec3 pal = 0.5 + 0.5 * cos(TAU * (t + vec3(0.00, 0.33, 0.67)));
  ```
  - `cos` is chosen over `sin` precisely because **`cos(0) = 1`** makes phase 0 predictable, and the three offsets spread R, G and B evenly around the cycle.
  - Note it takes a `vec3` argument — `cos` is `genType`, so one call does all three channels.
- **Rotation — and this is the big unlock:**
  ```glsl
  vec2 rot(vec2 p, float a) {
      float c = cos(a), s = sin(a);
      return vec2(c * p.x - s * p.y,
                  s * p.x + c * p.y);
  }
  ```
  - **Rotation needs no matrix.** Rotate the *domain* in stage 1 and every shape built on it spins together.
- Circular motion: `centre + radius * vec2(cos(t), sin(t))`.

**8. Traps**
- Same three as `sin`: radians, the `[-1,1]` range, and precision.
- Using `sin` where `cos` reads better. If your cycle should *start at full*, `cos` saves you a phase offset.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return cos(x * TAU) * 0.5 + 0.5;`

---

## 5 · `tan`

**1. Signature** — `float`/`vec2`/`vec3`/`vec4`.

**2. What it does** — converts an **angle** into a **slope**.

**3. Exact definition**
- **`sin(x) / cos(x)`.**
- ⚠️ **Undefined wherever `cos(x) == 0`** — at `±π/2`, `±3π/2`, and so on. The division blows up.
- Period is **π**, not `TAU` — it repeats twice as often as `sin` and `cos`.

**4. Picture** — MODE 0, `return tan((x - 0.5) * 3.0) * 0.1 + 0.5;`
- Passes calmly through the middle at 0.5, then **shoots off the top and bottom of the canvas** at both ends.
- **That runaway is the entire personality of this function.** No other function in the glossary does that.

**5. Range & edge cases**
- Output is **unbounded** — `(−∞, +∞)`.
- Near the asymptotes it produces enormous values that will blow out any colour they touch.
- `tan(0) = 0`, `tan(π/4) = 1` exactly (45° ⇒ slope 1, which is the intuition to keep).

**6. Stage** — **1 (DOMAIN)**, for shears. Rarely anywhere else.

**7. Idioms**
- **Shear / skew — its one natural 2D use:**
  ```glsl
  p.x += p.y * tan(radians(15.0));
  ```
  - Reads exactly as it means: *"lean by 15 degrees"*. `tan` turned the angle into the slope you multiply by.
- **Field of view** in 3D projection maths: `tan(fov / 2.0)`.
- Getting a slope when you know an angle — anywhere.

**8. Traps**
- ⚠️ **Asymptotes.** Approaching 90° the value explodes: `tan(85°) ≈ 11.4`, `tan(89°) ≈ 57.3`. A "slight" change in angle can multiply your result by five.
- ⚠️ Exactly `±π/2` is undefined, and it's a division by zero — undefined, not infinity, per the spec.
- **Honest assessment: after `degrees`, this is the least-used function in the batch.** Learn to recognize it, know the shear idiom, move on.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 0 → `return tan((x - 0.5) * 3.0) * 0.1 + 0.5;`

---

## What batch 4 unlocked — motion and rotation

The first animated shader. Every function in the batch appears except `degrees`, which genuinely has nowhere to go.

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

#define TAU 6.28318530718

// Rotate a point by `a` radians. Pure sin/cos - no matrix required.
vec2 rot(vec2 p, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * p.x - s * p.y,
                s * p.x + c * p.y);
}

void main() {
    // ---- 1 DOMAIN --------------------------------------------------
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

    // tan turns an ANGLE into a SLOPE. This shears space by 15 degrees.
    p.x += p.y * tan(radians(15.0));

    // Rotate the DOMAIN. Everything built on q spins with it.
    vec2 q = rot(p, u_time * 0.4 + radians(30.0));

    // ---- 2 FIELD ---------------------------------------------------
    float r = 0.22 + 0.04 * sin(u_time * 2.0);     // sin: a pulse over time
    float d = abs(q.x) + abs(q.y) - r;             // diamond (batch 1)

    // sin displaces a straight line into a travelling wave
    float wave = p.y + 0.32 - 0.06 * sin(p.x * TAU * 1.5 + u_time * 1.5);

    // ---- 3 MASK ----------------------------------------------------
    float fill = smoothstep(0.004, -0.004, d);                 // batch 2
    float line = smoothstep(0.006, 0.0, abs(wave) - 0.003);

    // ---- 4 COLOUR --------------------------------------------------
    // cos palette: cos(0) = 1, so phase 0 starts at full. Predictable.
    vec3 pal = 0.5 + 0.5 * cos(TAU * (d * 2.5 + vec3(0.00, 0.33, 0.67)));

    vec3 col = vec3(0.04, 0.04, 0.06);
    col = mix(col, pal * 0.35, smoothstep(0.30, 0.0, d));       // soft aura
    col = mix(col, pal,        fill);
    col = mix(col, vec3(1.0),  line);

    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));           // batch 3
    gl_FragColor = vec4(col, 1.0);
}
```

**Five things to do with it**

- **Delete the `* 0.5` and `+ 0.5` from the palette** (`vec3 pal = cos(...)`). Large parts go black — that's the negative half of the wave being clipped. **The single most important lesson in this batch, seen directly.**
- **Change `tan(radians(15.0))` to `tan(radians(85.0))`.** The shear goes from a gentle lean to a violent smear, because `tan` jumped from 0.27 to 11.4. That's the asymptote making itself felt.
- **Swap `sin(u_time * 2.0)` for `cos(u_time * 2.0)`** in the radius. The diamond now starts at maximum size instead of mid-size. That's the entire difference between the two functions.
- **Change `TAU * 1.5` to `TAU * 6.0`** in the wave — four times as many ripples.
- **Change `sin(u_time * 2.0)` to `sin(u_time * 300.0)`** and leave it running a minute. The pulse gets visibly jittery and irregular. That's `mediump` precision dying at large arguments.

## The seven things worth remembering from batch 4

- **GLSL trig is radians, always.** `sin(90.0)` is 0.894.
- **`sin` and `cos` are one wave a quarter-turn apart.** `cos(0) = 1`, `sin(0) = 0` — pick by where you want the cycle to start.
- **Output is `[-1, 1]`, so remap:** `0.5 + 0.5 * sin(x)`. Skipping this loses half your effect silently.
- **`(cos a, sin a)` is the unit circle**, and that's where rotation comes from.
- **Rotation is available here** — two lines, no matrix, and you rotate the *domain*.
- **`tan` is angle → slope.** One good use (shear), violent asymptotes, rarely needed.
- **`degrees` has no use inside a fragment shader.** Don't look for one.
