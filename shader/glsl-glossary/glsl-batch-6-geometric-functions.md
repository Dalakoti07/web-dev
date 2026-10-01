# GLSL Batch 6 — `length` `distance` `dot` `normalize`

**The one contrast that defines this batch:**

| Function | Contours are | So it builds |
|---|---|---|
| **`length`** | **circles** | discs, rings, radial falloff |
| **`dot`** | **straight lines** | half-planes, edges, projections |

- Those are the two fundamental shapes a field can have. Everything else is combinations of them.
- And `dot` is the primitive: `length(a) == sqrt(dot(a, a))`.

*(Lab modes referenced below: MODE 0 = 1D graph, MODE 1 = 2D heat map with contours and a mouse operand, MODE 2 = 2D vector field as RGB.)*

---

## 1 · `length`

**1. Signature**
```glsl
float length(float x)    float length(vec2 x)
float length(vec3 x)     float length(vec4 x)
```
- **Always returns a `float`**, whatever goes in. It collapses a vector to a single number.

**2. What it does** — how far this vector reaches. Its magnitude.

**3. Exact definition**
- `sqrt(x.x*x.x + x.y*x.y + …)` — Pythagoras, extended to however many components.
- This is the **L2 / Euclidean** norm.
- **`length(someFloat)` is just `abs(someFloat)`** — a one-component vector's magnitude.

**4. Picture** — MODE 1, `return length(p);`
- **Perfect circular contour rings** spreading from the origin.
- **This is the missing third row.** `max(abs(p.x), abs(p.y)) - r` gives a square and `abs(p.x) + abs(p.y) - r` gives a diamond. `length` is the third: circles. Same idea — *"how do I combine x and y into one distance"* — Pythagoras this time.

**5. Range & edge cases**
- `[0, ∞)`. Always non-negative.
- ⚠️ **The gradient is undefined at the origin.** The cone has a point there. Practically: `normalize` breaks at that pixel, and `fwidth`-based antialiasing misbehaves at the exact centre.
- Costs a `sqrt` — see the trap.

**6. Stage** — **2 (FIELD)**. This is *the* stage-2 function.

**7. Idioms**
- **The circle SDF — the most-used field in all of shader work:**
  ```glsl
  float d = length(p) - r;          // circle at origin
  float d = length(p - c) - r;      // circle at c
  ```
- **Vignette / radial falloff:** `smoothstep(0.8, 0.3, length(p))`.
- **Ring:** `abs(length(p) - r) - thickness` — `abs` turning a fill into an outline, applied here.
- **Polar radius**, replacing a hand-written `sqrt(p.x*p.x + p.y*p.y)`.

**8. Traps**
- ⚠️ **It costs a square root.** If you're only *comparing* distances, use `dot(p, p)` against `r*r` instead and skip it entirely. Inside a loop this matters.
- Undefined gradient at the origin.
- `length(vec2)` returns a float — people expect a vector back.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 1 → `return length(p);`

---

## 2 · `distance`

**1. Signature**
```glsl
float distance(float p0, float p1)    float distance(vec2 p0, vec2 p1)
float distance(vec3 p0, vec3 p1)      float distance(vec4 p0, vec4 p1)
```

**2. What it does** — how far apart two points are.

**3. Exact definition**
- **`length(p0 - p1)`.** That is the entire definition; it's a convenience wrapper, not a separate algorithm.
- Symmetric: `distance(a, b) == distance(b, a)`.

**4. Picture** — MODE 1, `return distance(p, m);`
- The same circular rings as `length`, but **centred on the mouse**. Drag it around.
- That's the only difference: `length` measures from the origin, `distance` measures from wherever you say.

**5. Range & edge cases**
- `[0, ∞)`.
- Zero exactly when the points coincide — and the gradient is undefined there, same as `length`.

**6. Stage** — **2 (FIELD)**.

**7. Idioms**
- **A circle that reads well:** `distance(p, centre) - radius` says what it means more clearly than `length(p - centre) - radius`.
- **Falloff from a point:** `exp(-k * distance(p, light))`.
- Proximity tests to a moving target.

**8. Traps**
- **It is not faster than `length(a - b)`.** Identical work. Choose on readability alone.
- ⚠️ **Honest assessment: this is the thinnest entry in the batch.** If `length` makes sense to you, `distance` is already fully understood. It's here for completeness.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 1 → `return distance(p, m);`

---

## 3 · `dot`

**1. Signature**
```glsl
float dot(float x, float y)    float dot(vec2 x, vec2 y)
float dot(vec3 x, vec3 y)      float dot(vec4 x, vec4 y)
```
- ⚠️ **Returns a `float`, always.** Two vectors in, one number out.

**2. What it does** — measures how much two vectors point the same way. **The most important function in the batch.**

**3. Exact definition — read it two ways, and you need both**

**Algebraically:** multiply matching components, add them up.
```glsl
dot(a, b) == a.x*b.x + a.y*b.y
```

**Geometrically:** `|a| · |b| · cos(θ)` where θ is the angle between them.
- **If both are unit vectors, `dot` IS the cosine of the angle between them.**

**What follows from that:**

| `dot(a,b)` | Meaning |
|---|---|
| `> 0` | pointing broadly the same way (< 90° apart) |
| `== 0` | **perpendicular** |
| `< 0` | pointing broadly opposite |
| `dot(a,a)` | **`length(a)` squared** |

- **The reading to actually internalize: `dot(p, n)` with `n` unit is a projection** — "how far along the direction `n` am I?"

**4. Picture** — MODE 1, `return dot(p, normalize(m));`
- **Straight parallel stripes**, perpendicular to whatever direction the mouse points.
- **Drag the mouse and the stripes rotate.** Compare with `length`'s circles. *That* is the difference between the two functions, in one image.
- Straight contours are why `dot` builds edges and half-planes, while `length` builds discs.

**5. Range & edge cases**
- Unbounded — it scales with both inputs' magnitudes.
- For unit inputs: `[-1, 1]`, which is exactly `acos`'s valid domain. (And exactly why `acos` needs a `clamp` — rounding can push it a hair past 1.)

**6. Stage** — **2 (FIELD)**.

**7. Idioms**
- **Half-plane / straight edge:** `dot(p, n) - d`, with `n` a unit normal. Negative on one side, positive on the other, and the magnitude is a true distance.
- **Length squared, free of `sqrt`:** `dot(p, p) < r*r` instead of `length(p) < r`.
- **Projecting onto an axis:** `dot(p, axis)` with `axis` unit.
- **Lighting:** `max(dot(normal, lightDir), 0.0)` — the Lambert term. Every diffuse lighting model starts here.
- **The segment SDF** — see the demo. `dot` does the projection.

**8. Traps**
- ⚠️ **`a * b` in GLSL is component-wise multiplication, NOT a dot product.** `vec2(1,2) * vec2(3,4)` is `vec2(3,8)`. This catches people coming from maths notation constantly.
- ⚠️ **The cosine interpretation needs unit vectors.** `dot` of two non-unit vectors mixes angle and magnitude together, and you usually can't separate them afterwards.
- Expecting a vector back.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 1 → `return dot(p, normalize(m));`

---

## 4 · `normalize`

**1. Signature**
```glsl
float normalize(float x)    vec2 normalize(vec2 x)
vec3  normalize(vec3 x)     vec4 normalize(vec4 x)
```
- **Returns the same type it's given** — the only function in this batch that does.

**2. What it does** — keeps the direction, throws away the length.

**3. Exact definition**
- `x / length(x)`.
- **In practice: `x * inversesqrt(dot(x, x))`** — one hardware instruction plus one multiply, no division.
- ⚠️ **Undefined for the zero vector.** `0/0`. Not zero, not NaN-guaranteed — undefined.

**4. Picture** — MODE 2, `return normalize(p);`
- Red and green vary smoothly around the canvas, but **the blue channel is flat everywhere** — blue encodes magnitude, and after normalizing it's 1 at every pixel.
- **Look at the exact centre.** It's chaotic there. That's the undefined zero-vector, live.

**5. Range & edge cases**
- Output always has length 1, except at zero where it's undefined.
- ⚠️ Near-zero inputs are numerically fragile even when not exactly zero, because you're dividing by something tiny.

**6. Stage** — **2 (FIELD)**, and stage 1 when normalizing a direction you'll transform by.

**7. Idioms**
- **Getting a direction:** `normalize(target - origin)`.
- **Unit normals for half-planes:** `dot(p, normalize(vec2(1.0, 0.5)))` — without the `normalize`, the field is scaled and no longer a true distance.
- **Fake 2D lighting:** `normalize(p - centre)` acts as a surface normal on a circle.
- **After interpolating:** `normalize(mix(a, b, t))`, because a lerp of two unit vectors is shorter than unit.

**8. Traps**
- ⚠️ **The zero vector.** Guard it: `p / max(length(p), 1e-6)`, or offset the input slightly.
- ⚠️ **It destroys the magnitude.** If you need both direction and distance, compute `length` once and reuse it rather than calling both functions.
- Forgetting to re-normalize after a `mix`.

**9. AGSL** — present, identical.

**10. Lab line** — MODE 2 → `return normalize(p);`

---

## What batch 6 unlocked — real distance fields

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

#define SHOW_FIELD 0   // 1 = show the raw distance field with contour rings

// Distance to a line SEGMENT. dot does the projection; clamp keeps it on the segment.
float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2  pa = p - a;
    vec2  ba = b - a;
    float h  = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);   // 0..1 along the segment
    return length(pa - ba * h);
}

void main() {
    // ---- 1 DOMAIN --------------------------------------------------
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    vec2 m = (u_mouse         - 0.5 * u_resolution) / u_resolution.y;

    // ---- 2 FIELD ---------------------------------------------------
    vec2  c      = vec2(-0.18, 0.05);
    float circle = distance(p, c) - 0.16;        // distance == length(p - c)

    vec2  a2 = vec2(0.05, -0.22), b2 = vec2(0.34, 0.20);
    float seg = sdSegment(p, a2, b2) - 0.035;    // a capsule

    vec2  n     = normalize(vec2(1.0, 0.55));    // unit normal - the normalize matters
    float plane = dot(p, n) + 0.36;              // half-plane: contours are LINES

    float scene = min(circle, seg);              // union

    // ---- 3 MASK ----------------------------------------------------
    float fill = smoothstep(0.004, -0.004, scene);
    float edge = smoothstep(0.006, 0.0, abs(scene) - 0.003);
    float band = smoothstep(0.004, 0.0, abs(plane) - 0.002);

    // 2D "lighting": direction from the centre acts as a surface normal
    vec2  nrm  = normalize(p - c);
    vec2  ldir = normalize(m - c + vec2(0.0001));   // guard the zero vector
    float lam  = max(dot(nrm, ldir), 0.0);          // the Lambert term

    // ---- 4 COLOUR --------------------------------------------------
    vec3 col;
#if SHOW_FIELD
    float v = scene;
    col = (v < 0.0) ? vec3(0.10, 0.25, 0.60) * clamp(-v * 5.0, 0.0, 1.0)
                    : vec3(clamp(v * 2.0, 0.0, 1.0));
    col = mix(col, vec3(1.0, 0.85, 0.3),
              1.0 - clamp(abs(fract(v / 0.05 + 0.5) - 0.5) * 12.5, 0.0, 1.0));
#else
    col = vec3(0.04, 0.05, 0.07);
    col = mix(col, vec3(0.10, 0.12, 0.18), band);
    vec3 base = mix(vec3(0.25, 0.35, 0.60), vec3(1.00, 0.80, 0.45), lam);
    col = mix(col, base,       fill);
    col = mix(col, vec3(1.0),  edge);
#endif
    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));

    gl_FragColor = vec4(col, 1.0);
}
```

**Six things to do with it**

- **Flip `SHOW_FIELD` to `1`.** Circular rings around the disc, **capsule-shaped rings around the segment**, and a visible crease where the two fields meet. That crease is `min` choosing a winner.
- **Delete the `clamp` inside `sdSegment`.** The capsule becomes an **infinite line**. The clamp is the only thing making it a segment — that's the projection being restricted to `0..1`.
- **Change `dot(p, n)` to `length(p) - 0.36`** in the `plane` line. The straight band becomes a **circle**. Nothing else changes. That's the batch's whole thesis in one edit.
- **Remove the `normalize` from `n`** (`vec2 n = vec2(1.0, 0.55);`). The band gets thinner, because the field is now scaled by `|n| ≈ 1.14` and is no longer a true distance.
- **Move the mouse.** The disc's shading follows it — that's `dot(normal, lightDir)`, the same Lambert term every 3D renderer uses.
- **Change `min(circle, seg)` to `max(circle, seg)`**, then `max(circle, -seg)`. Union → intersection → subtraction.

## The eight things worth remembering from batch 6

- **`length` makes circles. `dot` makes lines.** The two fundamental contour shapes.
- **Three functions, one idea:** `distance(a,b) = length(a-b)`, `length(a) = sqrt(dot(a,a))`. `dot` is the primitive.
- **`length(p) - r` is the circle SDF** — and the Euclidean member of the square/diamond/circle trio.
- **`dot` returns a float**, and **`a * b` is component-wise, not a dot product.**
- **`dot(p, n)` with `n` unit is a projection.** That's the reading that makes half-planes, lighting, and the segment SDF all obvious at once.
- **`dot(p, p)` is length squared** — compare against `r*r` and skip the `sqrt`.
- **`normalize(x)` is `x * inversesqrt(dot(x,x))`**, and it is **undefined at zero**.
- **The segment SDF is the dot-projection idiom.** Learn it once; it's the basis of lines, arrows, arcs and strokes.
