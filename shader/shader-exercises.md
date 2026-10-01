# The 50 — A Shader Problem Set

> A graded ladder of 50 exercises. Every rung is load-bearing: it names the ingredient it
> contributes to the two capstones. Nothing here is decoration.
>
> **Capstone A (#49):** a watercolour/painterly filter on my own photo.
> **Capstone B (#50):** an interactive water-ripple refraction on my own photo, in Compose.
>
> Companion to [`shader.md`](./shader.md) (conventions, decisions, what I already know) and
> [`glsl-glossary/`](./glsl-glossary/) (the 45 GLSL functions, documented in depth).

---

## 0. How to use this

- **One exercise per sitting**, every 2–3 days. Tiers 0–3 are one sitting each; tiers 4–6 are
  often two; the capstones get a week each. **Total ≈ 5 months** at that cadence.
- **Write the field first, always.** Four stages, four banner comments, `float` until stage 4.
  If an exercise says "draw X", it means: domain → field → mask → colour.
- **"Done when" is the only acceptance test.** If you can't state it in one sentence about
  what's on screen, you haven't finished the exercise.
- **Keep a `.frag` per exercise** in `glsl-glossary/` style only when the result is reusable.
  Most of these are throwaway; the kernel idiom is what you keep.
- **Skip nothing in Tier 5 and 6.** They look like a pile of image filters. They are the
  capstone, disassembled.

### How this relates to the 9-week plan

This does **not** replace it. The 9-week plan is the *reading* track (Book of Shaders ch. 5–11,
four iq articles, then AGSL). This is the *practice* track that runs on top of it. The mapping:

| 9-week plan | The 50 |
|---|---|
| ch. 5 (shaping) | 1–6 |
| ch. 6–7 (colour, shapes) | 7–14, 30–31 |
| ch. 8 (matrices) | 15–16 |
| ch. 9 (patterns) | 17–21 |
| ch. 10–11 (random, noise) | 22–29 |
| iq articles | 25–27, 32 |
| AGSL weeks + capstone | 36–50 |

---

## 1. Venue ladder — where each exercise actually runs

This is the thing the ladder usually gets wrong. Exercises 1–35 run in the editor I already
use. **Exercises 36+ need a texture, and `editor.thebookofshaders.com` cannot bind one.**

| Exercises | Venue | Why |
|---|---|---|
| 1–35 | **editor.thebookofshaders.com** | WebGL1, one buffer, no texture. Fine — none of these need one. |
| 36–48 | **Shadertoy** | `iChannel0` gives a real sampler, 20+ preset textures, `iMouse`, multipass. |
| 36–50 (my photo) | **Shadertoy + the custom-texture extension**, or **Appendix A** | Shadertoy has no native image upload. Two workarounds below. |
| 49–50 (shipped) | **AGSL in Compose**, `RuntimeShader` | The actual destination. Appendix B. |

**Getting my own photo onto a screen, three ways:**

1. **Shadertoy custom-texture browser extension** — [ahillss/ShadertoyCustomTextures](https://github.com/ahillss/ShadertoyCustomTextures).
   Drag an image onto a channel slot. Session-only, never saved to the server. Lowest friction;
   use this for 36–48.
2. **Appendix A** — a single self-contained `.html` file. Double-click it, it opens in the
   browser, the shader source is one string near the bottom. Zero build, zero npm. Use this
   when I want the photo permanent and the code in git.
3. **Appendix B** — AGSL in Compose. This is where #50 actually lands.

**Coordinate reminder.** Book of Shaders and Shadertoy are y-up, origin bottom-left. AGSL and
Android canvas are y-down, origin top-left. **Convert once, at the AGSL boundary** — never
inside a shader body. Textures compound this: an image sampled with y-up UVs appears flipped.
Flip at the sampling site (`uv.y = 1.0 - uv.y`), documented, once.

---

## 2. The ladder at a glance

| Tier | # | Theme | What it buys the capstone |
|---|---|---|---|
| 0 | 1–6 | Coordinates & shaping | The domain stage, and `smoothstep` reflexes |
| 1 | 7–14 | Fields, masks, SDFs | Everything that is a *shape*, incl. the ripple ring |
| 2 | 15–21 | Domain transforms | Polar coords → radial waves; tiling → paper grain |
| 3 | 22–29 | Noise | fBm and **domain warping** — the whole watercolour look |
| 4 | 30–35 | Colour & post | Palettes, luminance, grain, gradient mapping |
| 5 | 36–42 | Textures & image filters | Sampling, blur, Sobel, **Kuwahara**, height→normal |
| 6 | 43–48 | Water | Ripple packets, refraction, specular, caustics |
| 7 | 49–50 | Capstones | Watercolour photo; rippling photo in Compose |

---

## Tier 0 — Coordinates & shaping (1–6)
*Venue: Book of Shaders editor. Goal: the DOMAIN stage becomes reflex.*

### 1. UV as colour
- **Teaches:** the domain stage is a *choice*, not boilerplate.
- **Do:** output `vec3(uv, 0.0)`. Then output `vec3(uv.x)` alone. Then `vec3(uv.y)`.
- **Kernel:** `vec2 uv = gl_FragCoord.xy / u_resolution;`
- **Trap:** dividing by `u_resolution` (both components) stretches with the window. That is
  correct for *graphs*, wrong for anything *round*.
- **Done when:** I can predict which corner is black before pressing run.

### 2. The three normalizations, side by side
- **Teaches:** why circles go oval, and the one idiom that fixes it.
- **Do:** split the screen into three vertical thirds. Left: `uv` (0..1, stretched).
  Middle: `uv - 0.5` (centred, still stretched). Right: aspect-corrected.
- **Kernel:** `vec2 p = (2.0*gl_FragCoord.xy - u_resolution) / u_resolution.y;`
- **Why that form:** `p.y` spans exactly −1..1 always; `p.x` spans ±aspect. Square pixels.
- **Trap:** dividing by `u_resolution.x` instead makes the *x* axis canonical — valid, but
  pick one and never mix. I use `.y`.
- **Done when:** a `length(p) - 0.5` circle stays circular while I drag the window wider.
- **Capstone link:** every exercise from here down assumes this line.

### 3. `step` vs `smoothstep`, proven
- **Teaches:** rule 3 of the house style, empirically.
- **Do:** one shader, two halves. Left half draws a circle edge with `step`, right half with
  `smoothstep`. Zoom the browser to 400%.
- **Trap:** at low zoom they look identical. That's the lesson — jaggies are invisible until
  they aren't, and they're always there.
- **Done when:** I can point at the staircase pixels on the left half.

### 4. Shaping functions gallery
- **Teaches:** stage 3 vocabulary. A mask is a *curve*, and there are many.
- **Do:** plot 6 curves on one screen as stacked graphs: `x`, `x*x`, `sqrt(x)`, `smoothstep(0,1,x)`,
  `pow(x, 4.0)`, `1.0 - pow(1.0-x, 3.0)`.
- **Reuse:** `glsl-glossary/glsl-plot-function.md` already has the `plot()` helper.
- **Done when:** I can name which curve to use for "slow start, fast end" without testing.

### 5. Time as a uniform
- **Teaches:** `sin` output is −1..1 and must be remapped; animation is a domain or field
  parameter, never a colour parameter.
- **Do:** pulse a circle's radius with `0.3 + 0.1*sin(u_time)`. Then pulse its *colour*
  instead. Notice which one reads as "alive".
- **Kernel:** `float t01 = 0.5 + 0.5*sin(u_time);`
- **Trap:** `sin(u_time)` fed straight to a colour channel clips to black for half the cycle.
- **Capstone link:** the ripple in #43 is this exercise with a radius term inside the `sin`.

### 6. Antialiased edge with a gated `fwidth`
- **Teaches:** the pixel-width trick, and how to write code that survives WebGL1.
- **Do:** write `aa(float d)` returning coverage. Ship both paths.
- **Kernel:**
```glsl
#define USE_FWIDTH 0
#if USE_FWIDTH
#extension GL_OES_standard_derivatives : enable
#endif

float aa(float d) {
#if USE_FWIDTH
    float w = fwidth(d);
#else
    float w = 2.0 / u_resolution.y;   // one pixel, in domain units
#endif
    return 1.0 - smoothstep(-w, w, d);
}
```
- **Why `2.0/u_resolution.y`:** the domain spans 2.0 units over `u_resolution.y` pixels, so
  that expression *is* one pixel. It only holds for the exercise-2 normalization.
- **Done when:** flipping the `#define` changes nothing visible at 100% zoom.
- **Capstone link:** every mask in this document calls `aa()`.

---

## Tier 1 — Fields, masks, SDFs (7–14)
*Venue: Book of Shaders editor. Goal: shapes as algebra.*

### 7. Circle — return the field
- **Do:** `float sdCircle(vec2 p, float r) { return length(p) - r; }`. Render it three ways
  from **one** call: as a fill, as an outline, and as a raw signed value (red negative, blue
  positive).
- **Trap:** writing `sdCircle` to return a 0..1 mask. That is the fused function the house
  style exists to prevent.
- **Done when:** three visuals, one `float d`, zero extra shape functions.

### 8. Ring from the same field
- **Kernel:** `float ring = abs(d) - thickness;` then `aa(ring)`.
- **Teaches:** `abs` on a signed field turns "inside/outside" into "distance from boundary".
- **Done when:** a thickness slider (hardcode and edit) fattens the ring symmetrically.

### 9. The three norms
- **Teaches:** the punchline — circle, diamond and square differ *only* in how x and y combine.
- **Do:** render three shapes with identical radius: `length(p)` (L2, circle),
  `abs(p.x)+abs(p.y)` (L1, diamond), `max(abs(p.x),abs(p.y))` (L∞, square).
- **Capstone link:** none directly — this is the one that makes SDFs click, and it pays the
  maths track back.

### 10. Boolean algebra on fields
- **Kernel:** `min(a,b)` = union, `max(a,b)` = intersection, `max(a,-b)` = subtraction.
- **Do:** carve a crescent moon: `max(sdCircle(p, .4), -sdCircle(p - vec2(.15,.1), .38))`.
- **Trap:** `min`/`max` invert their meaning between *fields* (negative inside) and *masks*
  (1 inside). Already in `glsl-glossary/glsl-batch-1-*`. Re-read if it bites.
- **Done when:** I can produce a crescent, a ring-with-a-bite, and a plus sign from two circles
  and one box, without guessing.

### 11. Exact box, and why `min(max(...))` appears
- **Kernel:**
```glsl
float sdBox(vec2 p, vec2 b) {
    vec2 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}
```
- **Teaches:** the left term is the exterior distance, the right term is the interior distance
  (negative). The L∞ version in #9 is *cheap but wrong* outside the corners.
- **Do:** render #9's square and this one as contour lines (`fract(d*20.0)`). The corners differ
  visibly — #9's contours are square, this one's are rounded.
- **Done when:** I can point at where the two disagree and say why.

### 12. Rounded rectangle, for free
- **Kernel:** `sdBox(p, b - r) - r`
- **Teaches:** subtracting a constant from any SDF *inflates* it. Rounding is not a special case.
- **Done when:** one `r` variable takes the shape from sharp to pill continuously.

### 13. Line segment SDF
- **Kernel:**
```glsl
float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}
```
- **Teaches:** `dot` is the primitive; projection then clamp is the whole idea.
- **Do:** draw a stick figure. Then animate one limb with `u_time`.
- **Trap:** it's unsigned — there is no inside. `abs()` on it does nothing.

### 14. N-gon via angular folding
- **Kernel:** `float a = atan(p.y, p.x); float r = length(p); float n = 5.0;`
  `float d = cos(floor(0.5 + a*n/6.2831853)*6.2831853/n - a) * r;`
- **Teaches:** the bridge from cartesian to polar thinking, which is Tier 2.
- **Trap:** `atan(y,x)` returns −π..π with a discontinuity along −x. Every polar shader has a
  seam there until you account for it.
- **Done when:** changing `n` from 3 to 12 walks triangle → circle.

---

## Tier 2 — Domain transforms (15–21)
*Venue: Book of Shaders editor. Goal: stop moving shapes, start moving space.*

### 15. Translate, rotate, scale — as domain ops
- **Kernel:** `mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,s,-s,c); }`
- **Do:** spin a square. Then spin it *about a corner* instead of its centre.
- **Teaches:** the inversion. To move a shape **right**, you subtract from `p`. To make it
  **bigger**, you divide `p`. The domain transform is the inverse of the visual transform.
- **Trap:** GLSL `mat2` is **column-major** — `mat2(a,b,c,d)` is columns `(a,b)` and `(c,d)`,
  not rows. Already covered in `glsl-glossary/glsl-batch-9-matrices.md`.
- **Trap 2:** after non-uniform scaling, the SDF is no longer a true distance. Divide by the
  scale factor to restore it: `sdCircle(p/s, r) * s`.
- **Done when:** I can compose translate∘rotate∘scale and predict the read order (right to left).

### 16. Polar coordinates
- **Kernel:** `vec2 polar(vec2 p){ return vec2(length(p), atan(p.y, p.x)); }`
- **Do:** render `r` as red and `theta` as green. Then draw a spiral: `sin(r*20.0 - theta*3.0)`.
- **Capstone link:** **this is the ripple.** A radial travelling wave is `sin(r*k - t*w)`. #43
  is this line with time in it.
- **Done when:** I can make the spiral wind the other way by one sign change.

### 17. Tiling with `fract`
- **Kernel:** `vec2 id = floor(p*N); vec2 f = fract(p*N) - 0.5;`
- **Do:** tile a circle across the screen. Then tile the crescent from #10.
- **Teaches:** `fract` gives you the *local* coordinate, `floor` gives you the *cell identity*.
  Two outputs, two jobs.
- **Trap:** SDFs tiled this way are wrong near cell borders — a shape can't influence its
  neighbour's cell. Visible as clipping when the shape exceeds the cell.
- **Done when:** changing `N` changes density without changing shape proportions.

### 18. Per-cell randomness
- **Kernel:**
```glsl
float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}
```
- **Do:** tile a circle; give each cell a random radius and a random phase offset for its pulse.
- **Teaches:** the cell `id` from #17 feeds the hash. **This is the entire randomness idiom** —
  everything in Tier 3 is a refinement of it.
- **Trap:** `sin(dot(p, vec2(12.9898,78.233)))*43758.5453` (the classic) has visible artefacts
  at large coordinates and differs across GPUs. The integer-free hash above is more stable.
- **Done when:** each cell looks independently alive, and reloading gives the identical pattern
  (it's deterministic, not random).

### 19. Mirror and kaleidoscope folding
- **Kernel:** `p.x = abs(p.x);` is a mirror. Rotate before and after to fold at any angle.
- **Do:** 6-fold symmetry — fold the angle: `a = mod(a, PI/3.0); a = abs(a - PI/6.0);`
- **Teaches:** `abs` on a coordinate is a reflection. Symmetry is free if you fold the domain
  instead of drawing N copies.
- **Done when:** one shape drawn once appears six times, seamlessly.

### 20. Offset rows — brick / hex layout
- **Kernel:** `if (mod(floor(p.y*N), 2.0) == 1.0) p.x += 0.5/N;` — but write it branchlessly
  with `mod` and `step`, then compare.
- **Teaches:** most "patterns" are #17 plus a per-row domain shift.
- **Done when:** the bricks interlock with no seam.

### 21. Radial repetition
- **Kernel:** in polar, `theta = mod(theta, TAU/n) - TAU/(2.0*n);`
- **Do:** a clock face — 12 ticks from one tick.
- **Trap:** the shape distorts near the centre because angular spacing shrinks with radius.
  That's correct behaviour, not a bug.
- **Capstone link:** the caustic pattern in #48 is radial repetition over a noise field.

---

## Tier 3 — Noise (22–29)
*Venue: Book of Shaders editor. Goal: the watercolour look lives here, not in Tier 5.*

### 22. Value noise, 1D
- **Kernel:**
```glsl
float hash11(float n){ return fract(sin(n) * 43758.5453); }
float vnoise1(float x) {
    float i = floor(x), f = fract(x);
    float u = f*f*(3.0 - 2.0*f);          // smoothstep, hand-rolled
    return mix(hash11(i), hash11(i+1.0), u);
}
```
- **Do:** plot it as a graph. Then plot it with `u = f` (linear) instead. The kinks are the
  point — that `u` curve is why noise looks organic.
- **Teaches:** noise = random values at integers + a smooth interpolant. Nothing more.
- **Done when:** I can state why `f*f*(3-2f)` and not `f`.

### 23. Value noise, 2D
- **Kernel:**
```glsl
float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0 - 2.0*f);
    return mix(mix(hash21(i),              hash21(i + vec2(1,0)), u.x),
               mix(hash21(i + vec2(0,1)),  hash21(i + vec2(1,1)), u.x), u.y);
}
```
- **Teaches:** bilinear interpolation is two `mix`es in x, then one in y.
- **Trap:** the result is 0..1, **not** −1..1. Every octave sum below assumes you know which.
- **Done when:** scaling `p` by 5 gives visibly blobby noise with no grid lines.

### 24. Gradient noise
- **Do:** replace the per-corner *value* with a per-corner random *direction*, and dot it with
  the offset to that corner. Compare side by side with #23.
- **Teaches:** value noise has visible axis-aligned blockiness; gradient noise doesn't, because
  it's zero at the lattice points rather than extremal there.
- **Trap:** gradient noise is signed, roughly −0.7..0.7. Remap before using it as a mask.
- **Done when:** the grid artefacts visible in #23 at high contrast are gone.

### 25. fBm — fractional Brownian motion
- **Kernel:**
```glsl
float fbm(vec2 p) {
    float sum = 0.0, amp = 0.5;
    for (int i = 0; i < 5; i++) {
        sum += amp * vnoise(p);
        p   *= 2.02;        // lacunarity; the .02 breaks lattice alignment
        amp *= 0.5;         // gain
    }
    return sum;
}
```
- **Do:** render with 1, 2, 3, 5, 8 octaves as five vertical strips.
- **Teaches:** self-similarity. Each octave is half the amplitude at twice the frequency.
- **Trap:** `p *= 2.0` exactly re-aligns every octave's lattice and produces a faint cross
  pattern. The `2.02` is not superstition.
- **Capstone link:** the water surface in #48 is fBm. The paper texture in #49 is fBm.

### 26. Domain warping ← **the single most important exercise here**
- **Kernel (iq's two-level warp):**
```glsl
float warped(vec2 p) {
    vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
    vec2 r = vec2(fbm(p + 4.0*q + vec2(1.7, 9.2)),
                  fbm(p + 4.0*q + vec2(8.3, 2.8)));
    return fbm(p + 4.0*r);
}
```
- **Teaches:** feeding noise into the *domain* of more noise. This is the difference between
  "computer noise" and something that looks painted, marbled, or wet.
- **Do:** render `q`, then `r`, then the final, as three panels. Watch the structure emerge.
- **Trap:** the `4.0` multipliers are warp *strength*. Below ~1 it looks like plain fBm; above
  ~8 it dissolves. The interesting band is narrow.
- **Capstone link:** **this is the watercolour bleed.** #49 warps the photo's UV with this.
- **Read:** [iq — Domain Warping](https://iquilezles.org/articles/warp/).

### 27. Voronoi / cellular
- **Kernel:** for each of the 9 neighbouring cells, place one random point via `hash21(id+off)`,
  take `min` of the distances.
- **Do:** render `F1` (nearest distance), then `F2 - F1` (cell borders), then the cell colour
  by hashing the winning id.
- **Teaches:** the 3×3 neighbour scan — same structural trick appears in every blur kernel in
  Tier 5.
- **Trap:** scanning only the current cell gives wrong results near borders. You must scan 9.
- **Done when:** `F2-F1` gives clean crack lines with no discontinuities at cell boundaries.

### 28. Flowing noise
- **Do:** three variants of `fbm` animated by time. (a) `fbm(p + t)` — translation, looks like
  a scrolling backdrop. (b) `fbm(p + vec2(fbm(p), fbm(p+3.7)) * t)` — self-advection, looks
  like smoke. (c) 3D noise sliced at `z = t` — looks like true evolution.
- **Teaches:** *how* you animate noise matters more than the noise itself.
- **Capstone link:** (b) drives the watercolour's living-pigment feel; (c) drives ambient water.

### 29. Turbulence and ridged noise
- **Kernel:** turbulence = `sum(amp * abs(signedNoise(p)))`. Ridged = `sum(amp * (1.0 - abs(n)))`.
- **Teaches:** `abs` on a *signed* noise creates creases — the V-shaped valleys read as wisps
  (turbulence) or sharp crests (ridged, when inverted).
- **Trap:** this requires **signed** noise. Applying `abs` to 0..1 value noise does nothing.
- **Capstone link:** ridged noise is the wave-crest term in #48.

---

## Tier 4 — Colour & post (30–35)
*Venue: Book of Shaders editor. Goal: stage 4 stops being an afterthought.*

### 30. HSB ↔ RGB
- **Do:** render a hue wheel using the polar coords from #16 — angle → hue, radius → saturation.
- **Teaches:** RGB is a terrible space to *reason* in. Every "make it slightly warmer" is a
  hue rotation, which is a one-line op in HSB and a mess in RGB.
- **Trap:** HSB→RGB round-trips are lossy at the extremes and the conversion is branch-heavy.
  Use it to *author*, not to filter per-pixel in a hot loop.

### 31. iq's cosine palette
- **Kernel:** `vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) { return a + b*cos(6.28318*(c*t + d)); }`
- **Do:** render five palettes as horizontal bars, driven by `t = uv.x`.
- **Teaches:** a whole gradient is **12 numbers**. No texture lookup, no colour stops.
- **Try:** `a=vec3(.5)`, `b=vec3(.5)`, `c=vec3(1)`, `d=vec3(0,.33,.67)` is the rainbow.
  Set `c=vec3(1,1,.5)` for a two-tone.
- **Read:** [iq — Palettes](https://iquilezles.org/articles/palettes/).
- **Capstone link:** #49 maps the photo's luminance through a hand-picked palette. This is that.

### 32. Gradient mapping
- **Do:** take the fBm from #25, and colour it by feeding it into #31's palette instead of
  `vec3(n)`. Same field, unrecognisably different image.
- **Teaches:** the cleanest statement of the four-stage philosophy. **The field did not change.**
  Only the spend did.
- **Done when:** I have one `float` variable and four palettes I can swap between by editing
  one line.

### 33. Luminance and gamma
- **Kernel:** `float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));`
- **Do:** render a photo-like gradient, compute luminance two ways — naive `(r+g+b)/3.0` and
  the weighted form — and diff them.
- **Teaches:** green carries ~72% of perceived brightness. Every desaturation, every edge
  detector, every Kuwahara variance calculation in Tier 5 uses this constant.
- **Trap:** those coefficients assume **linear** light. sRGB values from a texture are gamma-
  encoded (~2.2). Blurring gamma-encoded pixels darkens the result. Decode → filter → encode.
- **Capstone link:** #39, #40 and #41 are all wrong without this.

### 34. Paper grain
- **Do:** overlay high-frequency noise at low amplitude on a flat colour. Then try three blend
  modes: `add`, `multiply`, and `overlay`. Then make the grain *fibrous* by stretching its
  domain non-uniformly (`vnoise(p * vec2(1.0, 8.0))`).
- **Teaches:** texture is 95% low amplitude. Anything visible as "noise" is too strong.
- **Capstone link:** the watercolour paper in #49. Without it the filter looks like a
  Photoshop plugin from 2004.

### 35. Vignette, posterize, and the tone stack
- **Do:** build a small post chain over any Tier 3 output: vignette (`1.0 - length(p)*0.4`),
  posterize (`floor(c * n) / n`), contrast (`(c - 0.5) * k + 0.5`). Reorder them and observe.
- **Teaches:** post-processing is **ordered** and non-commutative. Posterize-then-blur and
  blur-then-posterize are different effects.
- **Done when:** I can state why vignette must come after tone mapping, not before.

---

## Tier 5 — Textures & image filters (36–42)
*Venue: **Shadertoy** (+ the custom-texture extension for my own photo), or Appendix A.*
*Goal: the photo enters. Every exercise here is a named ingredient of #49 or #50.*

> **Shadertoy conventions.** `fragCoord` is in pixels, `iResolution` is a `vec3`, time is
> `iTime`, mouse is `iMouse`, the texture is `texture(iChannel0, uv)` (GLSL ES 3.0 — `texture`,
> not `texture2D`). Set `iChannel0` in the panel at the bottom of the editor.

### 36. Sample and display
- **Kernel:** `vec2 uv = fragCoord / iResolution.xy; fragColor = texture(iChannel0, uv);`
- **Do:** display the image. Then flip it (`uv.y = 1.0 - uv.y`). Then zoom about the centre.
  Then set the channel's wrap mode to Repeat and sample `uv * 3.0`.
- **Teaches:** the texture is a *function* `vec2 -> vec4`, exactly like every field so far —
  it just happens to be backed by memory.
- **Trap:** sampling outside 0..1 does something different depending on wrap mode. Clamp is
  what you want for a photo; Repeat mirrors your errors into a visible tile.
- **Capstone link:** **every remaining exercise is "change `uv` before sampling."**

### 37. UV distortion 101
- **Kernel:** `uv.x += 0.02 * sin(uv.y * 40.0 + iTime * 3.0);`
- **Do:** a wobble. Then a twist (rotate `uv` about the centre by an angle proportional to
  radius). Then a fisheye (`uv = c + dir * pow(r, 1.5)`).
- **Teaches:** **the entire water effect is this exercise.** Displace the lookup coordinate by
  a field; the image follows.
- **Trap:** distortion pushes UVs outside 0..1 at the borders. Either clamp, or shrink the
  sampled region slightly so there's margin.
- **Done when:** I can write the displacement as a separate `vec2 displace(vec2 uv)` function
  and swap implementations without touching `main`.

### 38. Chromatic aberration
- **Kernel:** sample R, G, B at three slightly different offsets along the radial direction,
  scaled by `r²`.
- **Teaches:** you can sample the same texture N times with N different domains. This unlocks
  every multi-tap filter below.
- **Capstone link:** real water dispersion in #46. Subtle — 1–3 pixels.

### 39. Blur — box, then separable Gaussian
- **Do (a):** 9-tap box blur, 3×3, equal weights.
- **Do (b):** Gaussian, 9 taps, weights `exp(-x²/2σ²)`, normalised.
- **Do (c):** the same Gaussian done **separably** — horizontal pass then vertical. On Shadertoy
  this needs Buffer A. That's the exercise.
- **Kernel:** `vec2 texel = 1.0 / iResolution.xy;` — offsets are in texels, never in UV constants.
- **Teaches:** cost. N×N naive is O(N²); separable is O(2N). At radius 15 that's 225 vs 30 taps.
- **Trap:** blurring sRGB values directly. See #33. Decode to linear, blur, re-encode.
- **Capstone link:** the watercolour's soft regions; the underwater blur in #48.

### 40. Sobel edge detection
- **Kernel:**
```glsl
// 3x3 luminance samples l[-1..1][-1..1]
float gx = (l[0][0] + 2.0*l[0][1] + l[0][2]) - (l[2][0] + 2.0*l[2][1] + l[2][2]);
float gy = (l[0][0] + 2.0*l[1][0] + l[2][0]) - (l[0][2] + 2.0*l[1][2] + l[2][2]);
float edge = length(vec2(gx, gy));
```
- **Teaches:** the gradient of an image. `gx, gy` is a **vector**, and its direction is
  perpendicular to the edge — that direction is what the anisotropic Kuwahara in #41 uses,
  and what the height→normal in #42 uses.
- **Do:** render `edge` as a mask. Then render the gradient *direction* as hue.
- **Capstone link:** watercolour edge darkening — real watercolour pools pigment at the edges
  of a wash. `colour *= 1.0 - edge * 0.5` is that effect in one line.

### 41. Kuwahara filter ← **the painterly one**
- **Do (basic, 4-quadrant):** for each of the four quadrants of a `(2k+1)²` window, compute the
  mean colour and the variance of luminance. Output the mean of the **lowest-variance** quadrant.
- **Kernel (shape of it):**
```glsl
vec3 bestMean; float bestVar = 1e9;
for (int q = 0; q < 4; q++) {
    vec3 sum = vec3(0.0); float sum2 = 0.0; float n = 0.0;
    // iterate the quadrant's texels: accumulate sum, sum of squared luminance, count
    vec3 mean = sum / n;
    float var  = sum2 / n - pow(dot(mean, vec3(0.2126,0.7152,0.0722)), 2.0);
    if (var < bestVar) { bestVar = var; bestMean = mean; }
}
```
- **Teaches:** an *edge-preserving* smoother. Unlike blur, it flattens regions without bleeding
  across boundaries — which is exactly what a brush stroke does.
- **Trap:** GLSL ES 1.0 requires constant loop bounds. Hardcode the radius as a `const int`.
- **Trap 2:** it is expensive. Radius 5 is 121 taps × 4. Expect it to crawl at full resolution;
  that is normal and is why #50 uses a smaller radius.
- **Then (advanced):** the **anisotropic** variant — use #40's gradient to find the local
  dominant orientation, and shape the sampling kernel into an ellipse aligned with it. This is
  the one that actually looks like oil paint. Reference implementations on Shadertoy:
  [td3BzX](https://www.shadertoy.com/view/td3BzX), [mllBDX](https://www.shadertoy.com/view/mllBDX).
- **Done when:** my photo looks painted, with recognisable stroke direction following the
  subject's contours.
- **Capstone link:** #49's core. Everything else there is seasoning.

### 42. Height field → normal
- **Kernel:**
```glsl
float e = 1.0 / iResolution.y;
float hx = h(p + vec2(e, 0.0)) - h(p - vec2(e, 0.0));
float hy = h(p + vec2(0.0, e)) - h(p - vec2(0.0, e));
vec2  g  = vec2(hx, hy) / (2.0 * e);   // the gradient
vec3  n  = normalize(vec3(-g, 1.0));   // the fake surface normal
```
- **Teaches:** **the bridge from Tier 3 to Tier 6.** Any scalar field becomes a fake 3D surface
  via its gradient. No geometry, no raymarching — just central differences.
- **Do:** feed it the fBm from #25 and render `n` as RGB. It should look like an embossed relief.
- **Trap:** `e` too small → banding from float precision. Too large → the surface goes soft.
  One-to-two pixels is right.
- **Capstone link:** **this single function is what makes #46, #47 and #50 possible.**
  `h` becomes the ripple height; `g` becomes the refraction offset; `n` becomes the specular input.

---

## Tier 6 — Water (43–48)
*Venue: Shadertoy. Goal: assemble a convincing water surface from parts I already own.*

> **The one idea in this tier.** Water is not a shape and not a colour. Water is a **height
> field** `h(p, t)`, and everything you see is a consequence of its gradient:
> the distortion is `-∇h` applied to the UV, the highlight is `∇h` fed to a lighting term,
> and the caustics are the *divergence* of `∇h`. One field, three spends — house rule 4.

### 43. The radial travelling wave
- **Kernel:** `float h = sin(length(p - c) * FREQ - iTime * SPEED);`
- **Teaches:** this is exercise #16 with time in it. A wave moving outward requires the **minus**
  sign; a plus sign gives a wave collapsing inward.
- **Do:** render `h` as greyscale. Vary `FREQ` (ring spacing) and `SPEED` independently.
- **Trap:** it fills the whole screen forever. A real ripple is local and dies. That's #44.

### 44. The damped, travelling packet ← the honest ripple
- **Kernel:**
```glsl
float ripple(vec2 p, vec2 c, float t) {
    float r    = length(p - c);
    float front = SPEED * t;                             // where the ring is now
    float pack  = exp(-pow((r - front) / WIDTH, 2.0));   // a gaussian band at the front
    float decay = exp(-t * LIFE) / (1.0 + r * 4.0);      // dies with time and distance
    return sin((r - front) * FREQ) * pack * decay;
}
```
- **Teaches:** the three independent envelopes. `pack` makes it a ring not a field; `decay`
  makes it die; `sin` makes it oscillate. Each is tunable alone.
- **Do:** render with each envelope disabled in turn, so I can see what each one contributes.
- **Trap:** `exp(-t*LIFE)` never reaches zero. For a "one-shot" ripple you need a hard cutoff
  or the shader carries a ghost forever.
- **Done when:** a single ring expands from a point, thins, and vanishes.

### 45. Many drops, staggered
- **Do:** a loop over 5 drop origins, each with its own hashed position (#18) and a start time
  `hash * PERIOD`, summing their `ripple()` contributions. Use `mod(iTime - start, PERIOD)` so
  each drop repeats.
- **Teaches:** height fields **add**. This is why they're the right representation — you cannot
  add two "circle masks" and get interference.
- **Done when:** I can see two rings cross and interfere constructively.

### 46. Refraction — the moment it becomes water
- **Kernel:**
```glsl
vec2 g  = gradient(h, p);            // from #42
vec2 uv = fragCoord / iResolution.xy;
uv -= g * STRENGTH;                  // bend the lookup
fragColor = texture(iChannel0, uv);
```
- **Teaches:** this is **the whole illusion**. The photo is flat; the eye reads the coherent
  displacement as a transparent surface with depth.
- **Do:** ramp `STRENGTH` from 0 to absurd. There is a narrow band (~0.01–0.05 in UV units)
  where it reads as water rather than as a melting bug.
- **Trap:** sign. If the ripples look *inside out* (crests pushing the wrong way), flip to `+=`.
  Physically it's `-∇h`, but which way is "up" depends on your y convention — check, don't derive.
- **Trap 2:** displaced UVs escape 0..1 at the edges. Clamp the sampler, or shrink the source
  region by the max displacement.
- **Capstone link:** **this is #50.** Everything after is polish.

### 47. Specular highlight
- **Kernel:**
```glsl
vec3 n = normalize(vec3(-g, 1.0));
vec3 L = normalize(vec3(0.6, 0.7, 0.8));
vec3 V = vec3(0.0, 0.0, 1.0);
float spec = pow(max(dot(n, normalize(L + V)), 0.0), 64.0);
colour += vec3(spec) * 0.6;
```
- **Teaches:** Blinn-Phong on a **fake** normal. No geometry was harmed. This is why #42 mattered.
- **Do:** animate the light direction with `iTime`. Then add a Fresnel term
  (`pow(1.0 - dot(n, V), 5.0)`) so glancing angles go reflective.
- **Trap:** the exponent controls tightness, the multiplier controls brightness. Tuning the
  wrong one gives a blown-out white blob.

### 48. The full surface
- **Do:** compose everything. `h` = fBm (#25) + ridged noise for crests (#29) + a few ripple
  packets (#45), self-advected in time (#28b). Then: refract (#46), specular (#47), a depth
  tint (`mix(colour, deepBlue, depth)`), and **caustics**.
- **Caustics kernel:** sample the *divergence* — `float caustic = pow(max(0.0, 1.0 - length(g) * K), 8.0);`
  Bright where the surface is flat and focusing, dark where it's steep.
- **Teaches:** a real effect is 6 cheap terms layered, never one clever term.
- **Done when:** a still frame is ambiguous about whether the photo is behind glass or water.
- **Budget:** this is the big one. Give it two sittings.

---

## Tier 7 — Capstones (49–50)

### 49. Watercolour on my photo
**Venue:** Shadertoy with the custom-texture extension, or Appendix A. **Budget:** one week.

The pipeline, in order. Each stage names the exercise it comes from:

| # | Stage | From | What it does |
|---|---|---|---|
| 1 | Linearize | #33 | sRGB → linear. Everything below is wrong otherwise. |
| 2 | **Pigment bleed** | #26 | Warp the sampling UV by domain-warped fBm, amplitude ~0.004. Wet paper wicks. |
| 3 | **Kuwahara** | #41 | Anisotropic, radius 4–6. Flattens into stroke-shaped regions. |
| 4 | **Edge darkening** | #40 | `colour *= 1.0 - sobel * 0.4`. Pigment pools at wash boundaries. |
| 5 | **Palette bleed** | #31, #32 | Push luminance through a hand-picked cosine palette, `mix` back at ~0.25. |
| 6 | Value quantize | #35 | Posterize to 8–12 levels. Watercolour has few values, not a smooth ramp. |
| 7 | **Paper** | #34 | Fibrous low-amplitude noise, `multiply` blend, ~0.08 strength. |
| 8 | Vignette + re-encode | #35, #33 | Linear → sRGB. Last, always. |

- **The two that carry it:** #3 (Kuwahara) and #7 (paper). Drop either and it stops looking
  like paint. Everything else is a 10% improvement.
- **Tuning order:** get Kuwahara right alone, on a grey-scale version, before adding anything.
  Then paper. Then the rest, one at a time, each with a `#define` to disable it.
- **Trap:** the temptation to stack more effects when it doesn't look right. It's almost always
  that the Kuwahara radius is too small or the paper is too strong.

### 50. Water ripple on my photo, in Compose ← **the destination**
**Venue:** AGSL, `RuntimeShader`, API 33+. **Budget:** one week. See Appendix B for the wiring.

**What it does:** my photo fills the screen. Tapping drops a ripple at the touch point. The
ripple expands, refracts the photo, catches a highlight, and dies.

**The shader, in four stages:**
1. **DOMAIN** — `fragCoord` is in pixels and y-down. Build an aspect-corrected centred `p` for
   the *wave maths*, and keep raw pixel coords for the *image lookup*. Two coordinate systems
   living side by side is correct here, not a smell.
2. **FIELD** — `h(p) = ripple(p, touch, now - touchTime)` from #44, optionally plus an ambient
   fBm at 10% amplitude so the water is never perfectly still.
3. **MASK** — `g = gradient(h, p)` from #42. Also `spec` from #47. Two masks, one field.
4. **COLOUR** — `image.eval(fragCoord - g * STRENGTH) + spec * tint`.

**The Android-specific traps:**
- `image.eval()` takes coordinates in **pixels**, not normalized UVs. Do not divide by resolution
  before calling it.
- `image.eval()` returns **premultiplied** alpha. Multiply colour additions accordingly.
- AGSL has no `iResolution` — pass a `uniform float2 resolution` yourself and set it every frame.
- AGSL is **y-down**. My wave maths from Tier 6 assumes y-up. Flip once, at the domain stage,
  and write a comment saying so — this is the boundary conversion I already decided on.
- Uniforms must be set every frame (`setFloatUniform`), and the composable must be invalidated.
  A shader that "doesn't animate" is almost always a missing recomposition trigger.
- `RuntimeShader` is API 33+. Ship a static-image fallback below that.

**Done when:** I can tap my own photo on my own phone and watch the ripple cross it.

**Extension once it works:** swap the tap for `Modifier.pointerInput` drag, so dragging drags
the water. Then feed the accelerometer in as a tilt term. Both are uniform changes, not shader
rewrites — which is the point of having written it in four stages.

---

## Appendix A — a single-file lab for my own photo

One `.html` file. Double-click it; it opens in the browser. **Drag any photo onto the window**
and it becomes `u_tex`. Uniform names match the Book of Shaders editor, so exercises 1–35 paste
in unchanged. Edit the shader inside `<script id="frag">` and reload.

```html
<!doctype html>
<meta charset="utf-8">
<title>shader lab</title>
<style>
  html,body{margin:0;height:100%;background:#111;overflow:hidden}
  canvas{display:block;width:100%;height:100%}
  #hint{position:fixed;inset:0;display:grid;place-items:center;
        color:#777;font:14px system-ui;pointer-events:none}
</style>
<canvas id="c"></canvas>
<div id="hint">drag a photo onto the window</div>

<script id="frag" type="x-shader/x-fragment">
precision highp float;
uniform vec2      u_resolution;
uniform vec2      u_mouse;
uniform float     u_time;
uniform sampler2D u_tex;          // the dropped photo

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.y = 1.0 - uv.y;                                    // the ONE flip, documented
    uv.x += 0.01 * sin(uv.y * 40.0 + u_time * 3.0);       // exercise 37
    gl_FragColor = texture2D(u_tex, uv);
}
</script>

<script>
const cv = document.getElementById('c');
const gl = cv.getContext('webgl');
const VS = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
  return s;
}
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, document.getElementById('frag').textContent));
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(prog));
gl.useProgram(prog);

gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'a');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

const U = n => gl.getUniformLocation(prog, n);

// 1x1 grey placeholder until a photo is dropped
const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([48,48,48,255]));
// NPOT photos in WebGL1 REQUIRE clamp + non-mipmap filtering, or they sample black
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

const mouse = [0, 0];
addEventListener('pointermove', e => { mouse[0] = e.clientX; mouse[1] = cv.height - e.clientY; });
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => {
  e.preventDefault();
  const f = e.dataTransfer.files[0];
  if (!f) return;
  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    document.getElementById('hint').style.display = 'none';
  };
  img.src = URL.createObjectURL(f);
});

const t0 = performance.now();
(function frame() {
  cv.width = innerWidth; cv.height = innerHeight;
  gl.viewport(0, 0, cv.width, cv.height);
  gl.uniform2f(U('u_resolution'), cv.width, cv.height);
  gl.uniform2f(U('u_mouse'), mouse[0], mouse[1]);
  gl.uniform1f(U('u_time'), (performance.now() - t0) / 1000);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(U('u_tex'), 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(frame);
})();
</script>
```

- **Deliberately WebGL1**, so it matches the editor I already use — same `texture2D`, same
  `precision` guard, same `fwidth` caveat.
- **No aspect correction here.** Add exercise #2's line inside the shader when the subject is
  round.
- The photo never leaves the machine — `URL.createObjectURL` is local only.

---

## Appendix B — AGSL skeleton for #50

Sketch, not a drop-in. Verify signatures against the current `RuntimeShader` /
`RenderEffect` docs before trusting them — the API is API-33+ and has moved.

**The shader:**

```kotlin
@Language("AGSL")
private const val RIPPLE = """
uniform float2 resolution;
uniform float2 touch;     // pixels, y-down (Android convention)
uniform float  age;       // seconds since the tap
uniform shader image;     // bound by createRuntimeShaderEffect

const float SPEED    = 900.0;   // px per second
const float FREQ     = 0.09;    // ring spacing
const float WIDTH    = 90.0;    // packet width, px
const float STRENGTH = 28.0;    // max displacement, px

// FIELD -- exercise 44, in pixel units
float h(float2 q) {
    float r     = length(q - touch);
    float front = SPEED * age;
    float pack  = exp(-pow((r - front) / WIDTH, 2.0));
    float decay = exp(-age * 1.4) / (1.0 + r * 0.004);
    return sin((r - front) * FREQ) * pack * decay;
}

half4 main(float2 fragCoord) {
    // MASK 1 -- gradient, exercise 42
    float  e = 1.5;
    float2 g = float2(h(fragCoord + float2(e, 0.0)) - h(fragCoord - float2(e, 0.0)),
                      h(fragCoord + float2(0.0, e)) - h(fragCoord - float2(0.0, e))) / (2.0 * e);

    // COLOUR -- exercise 46. eval() takes PIXELS, and returns PREMULTIPLIED colour.
    half4 c = image.eval(fragCoord - g * STRENGTH);

    // MASK 2 -- specular, exercise 47. Same field, second spend.
    float3 n    = normalize(float3(-g * 400.0, 1.0));
    float  spec = pow(max(dot(n, normalize(float3(0.6, 0.7, 0.8) + float3(0.0, 0.0, 1.0))), 0.0), 48.0);

    return half4(c.rgb + half3(spec * 0.35) * c.a, c.a);
}
"""
```

**The Compose side:**

```kotlin
@RequiresApi(Build.VERSION_CODES.TIRAMISU)
@Composable
fun RipplePhoto(photo: ImageBitmap, modifier: Modifier = Modifier) {
    val shader = remember { RuntimeShader(RIPPLE) }
    var touch  by remember { mutableStateOf(Offset.Zero) }
    var tapAt  by remember { mutableFloatStateOf(-10f) }
    var now    by remember { mutableFloatStateOf(0f) }

    // Drive the clock off the frame callback, not a timer.
    LaunchedEffect(Unit) {
        val t0 = withFrameNanos { it }
        while (true) withFrameNanos { now = (it - t0) / 1_000_000_000f }
    }

    Image(
        bitmap = photo,
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = modifier
            .onSizeChanged {
                shader.setFloatUniform("resolution", it.width.toFloat(), it.height.toFloat())
            }
            .pointerInput(Unit) {
                detectTapGestures { p -> touch = p; tapAt = now }
            }
            .graphicsLayer {
                // Reading `now` and `touch` HERE is what makes the layer redraw each frame.
                shader.setFloatUniform("touch", touch.x, touch.y)
                shader.setFloatUniform("age", (now - tapAt).coerceAtLeast(0f))
                renderEffect = RenderEffect
                    .createRuntimeShaderEffect(shader, "image")
                    .asComposeRenderEffect()
            }
    )
}
```

**Why `createRuntimeShaderEffect(shader, "image")`:** it binds the composable's own rendered
content to the named `uniform shader`. I do **not** call `setInputShader` — that route is for
when I draw a `Bitmap` myself with a `Paint` whose shader is the `RuntimeShader`, and then the
child is a `BitmapShader`. Two valid routes; pick one and don't mix them.

**Checklist when it renders black or static:**
- `resolution` never set → `onSizeChanged` didn't fire, or fired before `remember`.
- No animation → the `graphicsLayer` lambda doesn't *read* any changing state. It must.
- Ripple in the wrong place → y-up/y-down. `touch` from `pointerInput` is already y-down;
  so is `fragCoord`. They agree — the wave maths from Tier 6 is what needs the flip.
- Edges smear → the displaced `eval` runs off the bitmap. Clamp, or inset the source.

---

## Reference shelf

Deliberately short. These are the only ones worth bookmarking.

| Resource | Use it for |
|---|---|
| [The Book of Shaders](https://thebookofshaders.com/) | ch. 5–11, exercises 1–29. Stop at 11. |
| [Inigo Quilez — articles](https://iquilezles.org/articles/) | [2D SDFs](https://iquilezles.org/articles/distfunctions2d/), [palettes](https://iquilezles.org/articles/palettes/), [domain warping](https://iquilezles.org/articles/warp/), [fBm](https://iquilezles.org/articles/fbm/). Exercises 11–14, 25–26, 31. |
| [Shadertoy](https://www.shadertoy.com/) | Venue for 36–48. Read others' code by forking it. |
| [ahillss/ShadertoyCustomTextures](https://github.com/ahillss/ShadertoyCustomTextures) | Getting my own photo into Shadertoy. |
| [Maxime Heckel — On Crafting Painterly Shaders](https://blog.maximeheckel.com/posts/on-crafting-painterly-shaders/) | Exercise 41 and capstone 49. The best single write-up of the Kuwahara pipeline. |
| [Anisotropic Kuwahara on Shadertoy](https://www.shadertoy.com/view/td3BzX) | Working reference for 41. |
| [dantech0xff/dreams](https://github.com/dantech0xff/dreams) | ~49 AGSL lessons in Compose. Wiring reference for #50. |
| [JumpingKeyCaps/UIWaveDeformation](https://github.com/JumpingKeyCaps/UIWaveDeformation) | A working AGSL ripple on a Compose snapshot. Closest thing to #50 in the wild. |
| `glsl-glossary/` | The 45 GLSL functions, in dependency order. Already mine. |

---

## Progress tracker

**Tier 0 — coordinates**
- [ ] 1 UV as colour · [ ] 2 three normalizations · [ ] 3 step vs smoothstep
- [ ] 4 shaping gallery · [ ] 5 time uniform · [ ] 6 gated `aa()`

**Tier 1 — fields & SDFs**
- [ ] 7 circle field · [ ] 8 ring · [ ] 9 three norms · [ ] 10 boolean algebra
- [ ] 11 exact box · [ ] 12 rounded rect · [ ] 13 segment · [ ] 14 n-gon

**Tier 2 — domain**
- [ ] 15 mat2 transforms · [ ] 16 polar · [ ] 17 fract tiling · [ ] 18 per-cell hash
- [ ] 19 kaleidoscope · [ ] 20 brick offset · [ ] 21 radial repeat

**Tier 3 — noise**
- [ ] 22 value noise 1D · [ ] 23 value noise 2D · [ ] 24 gradient noise · [ ] 25 fBm
- [ ] 26 **domain warping** · [ ] 27 voronoi · [ ] 28 flow · [ ] 29 turbulence/ridged

**Tier 4 — colour**
- [ ] 30 HSB · [ ] 31 cosine palette · [ ] 32 gradient mapping
- [ ] 33 luminance & gamma · [ ] 34 paper grain · [ ] 35 tone stack

**Tier 5 — textures** *(venue changes here)*
- [ ] 36 sample & display · [ ] 37 UV distortion · [ ] 38 chromatic aberration
- [ ] 39 blur (box → gaussian → separable) · [ ] 40 sobel
- [ ] 41 **Kuwahara** · [ ] 42 **height → normal**

**Tier 6 — water**
- [ ] 43 radial wave · [ ] 44 damped packet · [ ] 45 many drops
- [ ] 46 **refraction** · [ ] 47 specular · [ ] 48 full surface

**Tier 7 — capstones**
- [ ] 49 **watercolour photo**
- [ ] 50 **rippling photo in Compose**

---

## The five that matter

If the schedule slips, these are the ones that cannot be skipped. Everything else is
scaffolding around them.

| # | Exercise | Why |
|---|---|---|
| 26 | Domain warping | The entire organic/painted look |
| 41 | Kuwahara | The only thing that actually reads as "painted" |
| 42 | Height → normal | The bridge from a scalar field to a fake 3D surface |
| 44 | Damped ripple packet | A ripple that is local and dies, not a screen-filling sine |
| 46 | Refraction | The single line that turns a distortion into water |
