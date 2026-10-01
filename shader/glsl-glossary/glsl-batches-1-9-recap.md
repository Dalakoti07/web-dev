# GLSL glossary walkthrough — batches 1–9 in four bullets each

## Batch 1 — `min` `max` `clamp` `abs` `sign` `mix`
- **`min`/`max` are OR/AND**, and they **invert between representations**: on fields (negative inside) `min` = union, `max` = intersection; on masks (1 inside) it's the reverse.
- **`abs(d) - t` is every outline you will ever draw**, and `abs` folds the domain — build half a shape, get the mirror free.
- **`clamp((x-a)/(b-a), 0.0, 1.0)` is the linear ramp**; `mix`'s third argument is the weight of the *second* value and is **never clamped**.
- **Unlocked:** shapes with no `length` at all — square `max(abs(p.x),abs(p.y)) - r`, diamond `abs(p.x)+abs(p.y) - r` — plus union, intersection and subtraction.

## Batch 2 — `step` `smoothstep` `floor` `ceil` `fract` `mod`
- **`smoothstep` is batch 1's clamp ramp plus `t*t*(3-2t)`**, and that polynomial's derivative `6t(1-t)` being zero at both ends is the entire reason edges stop looking crunchy.
- **`step` aliases by construction** — learn it to recognize it, then don't use it for edges.
- **`floor` + `fract` are one idiom**: which cell / where in the cell. And **`mod(x, 1.0)` literally is `fract(x)`**.
- **Unlocked:** clean antialiased edges, and every form of tiling and repetition — `fract` is the only source of periodicity in the language.

## Batch 3 — `sqrt` `pow` `exp` `log` `exp2` `log2` `inversesqrt`
- **`exp2` and `log2` are the hardware primitives**; `pow(x,y) ≈ exp2(y*log2(x))`, which explains both its cost and why a negative base is undefined.
- **`pow` has no scalar-exponent overload in ES 1.0** — gamma must be `pow(col, vec3(1.0/2.2))`.
- **Six of the seven have silent undefined domains.** Only `exp` and `exp2` accept any input; the rest need a guard.
- **Unlocked:** easing curves, `exp(-k*d)` glow that never quite reaches zero, gamma correction, and the octave pair `exp2(i)` / `exp2(-i)` that fbm is built from.

## Batch 4 — `radians` `degrees` `sin` `cos` `tan`
- **GLSL trig is radians, always** — `sin(90.0)` is 0.894, and it never warns you.
- **Output is `[-1,1]`, so remap:** `0.5 + 0.5*sin(x)`. Skip it and half your effect silently vanishes.
- **`cos` is `sin` shifted a quarter turn**; `cos(0) = 1` is why palettes use `cos` and not `sin`.
- **Unlocked:** animation and waves — and **rotation with no matrix**, because `(cos a, sin a)` is the unit circle.

## Batch 5 — `asin` `acos` `atan`
- **Restricted output ranges are forced, not arbitrary** — the forward functions aren't one-to-one, so an inverse must pick a branch.
- **`asin`/`acos` are undefined for `|x| > 1`**, and float drift puts you there routinely: `acos(clamp(dot(a,b), -1.0, 1.0))` is the idiom, clamp included.
- **`atan(y, x)` takes y first**; the two-arg form keeps the quadrant, the one-arg form throws it away, and there's a visible **seam at ±π**.
- **Unlocked:** polar coordinates, n-fold symmetry, angular patterns — plus the habit of **comparing cosines instead of angles** (`dot >= cos(θ)`).

## Batch 6 — `length` `distance` `dot` `normalize`
- **`length` makes circles, `dot` makes lines.** The two fundamental contour shapes; everything else is a combination.
- **`dot` is the primitive:** `length(a) = sqrt(dot(a,a))`, `distance(a,b) = length(a-b)`.
- **`dot(p, n)` with `n` unit is a projection** — and ⚠️ **`a * b` is component-wise, not a dot product.**
- **Unlocked:** real distance fields — circle SDFs, segments and capsules, half-planes, and `max(dot(n, l), 0.0)` lighting.

## Batch 7 — `cross` `reflect` `refract` `faceforward`
- **Completeness, not capability** — these are 3D surface-lighting functions.
- **`cross` is `vec3` only**, but its 2D shadow `cross2(a,b) = a.x*b.y - a.y*b.x` is a **which-side test**, and that's what winding order and polygon-SDF sign are made of.
- **`reflect(I,N) = I - 2*dot(N,I)*N`**, `N` must already be unit, and `I` points **toward** the surface.
- **Unlocked:** kaleidoscope folding (a *conditional* `reflect` on a position) — and the knowledge that **`refract` returns the zero vector under total internal reflection**, which renders black if unhandled.

## Batch 8 — the nine relationals
- **They exist for exactly one reason:** `<` `>` `==` and friends don't work on vectors. **No scalar overloads** — for floats, use the operator.
- **`all` = AND, `any` = OR** — the third row of a table already in batch 1: fields use `max`/`min`, masks use `min`/`max`, booleans use `all`/`any`. **Only the boolean row can't be antialiased.**
- **A `bvec` has almost no consumers in ES 1.0** (`mix(x,y,bvec)` is ES 3.0+), and **`equal` on floats is a bug** — compare with a tolerance.
- **Unlocked:** very little, honestly. The payoff is knowing what *not* to reach for — and that AGSL uses plain operators, so these calls get rewritten rather than ported.

## Batch 9 — `matrixCompMult` (+ the `mat2` material)
- **`matrixCompMult` is entry-by-entry; `*` on matrices IS the real product.** HLSL is backwards on both, which is the only reason this function looks odd.
- **GLSL is column-major:** `mat2(a,b,c,d)` builds *columns*, so the rotation is `mat2(c, s, -s, c)` — it looks transposed and isn't.
- **`m * v` and `v * m` differ by a transpose and both compile** — so the two classic bugs cancel, which is why a lot of wild shader code is wrong twice and looks right.
- **Unlocked:** composed transform stacks applied **right to left** — with the caveat that **transforming the domain by `R(a)` rotates the image by `-a`**, and ES 1.0 gives you no `inverse()` or `transpose()`.

---

## The through-line, in four bullets

- **Batches 1–2 are the load-bearing twelve.** Masks, edges, tiling — most of chapters 5–11 needs nothing else.
- **Batches 3–5 are shaping and motion.** Curves, falloff, waves, rotation, polar.
- **Batch 6 is the geometry batch** and the one that makes real SDFs possible.
- **Batches 7–9 are fourteen functions that mostly teach you what to avoid** — and one genuinely missing piece (the `mat2` rotation) that the glossary never documents.
