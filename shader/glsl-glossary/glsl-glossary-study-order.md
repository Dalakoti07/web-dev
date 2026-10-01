# Study order for the 47 GLSL glossary functions

## The ordering principle

- **Dependency order, not glossary order.** A function comes after whatever its own definition needs.
  - `clamp` is built from `min` and `max` → those first.
  - `smoothstep` is built from `clamp` → that first.
  - `fract` is `x - floor(x)` → `floor` first.
  - `mod` uses `floor` → after `fract`.
  - `pow` generalizes `sqrt` → `sqrt` first.
  - `log` is the inverse of `exp` → `exp` first.
  - `normalize` divides by `length` → `length` first.
  - `reflect` uses `dot` and `normalize` → both first.
  - `refract` extends `reflect` → last of that cluster.
- **Secondary principle: capability per batch.** Each batch should leave you able to *build* something you couldn't before, not just recognize more names.

## The nine batches

| Batch | Functions | n | Lab mode | What it unlocks |
|---|---|---|---|---|
| **0** *(optional)* | types, qualifiers, built-in variables | — | — | the plumbing you already use |
| **1** | `min` `max` `clamp` `abs` `sign` `mix` | 6 | 0 | any blend, any bounded ramp |
| **2** | `step` `smoothstep` `floor` `ceil` `fract` `mod` | 6 | 0 | **every edge + all tiling** |
| **3** | `sqrt` `pow` `exp` `log` `exp2` `log2` `inversesqrt` | 7 | 0 | easing curves, glow falloff |
| **4** | `radians` `degrees` `sin` `cos` `tan` | 5 | 0 | waves, oscillation, animation |
| **5** | `asin` `acos` `atan` | 3 | 0 | polar coordinates |
| **6** | `length` `distance` `dot` `normalize` | 4 | 1 + 2 | **real SDFs and shapes** |
| **7** | `cross` `reflect` `refract` `faceforward` | 4 | 2 | 3D lighting — completeness only |
| **8** | the nine relationals | 9 | 3 | why you avoid them |
| **9** | `matrixCompMult` + the `mat2` rotation | 1 | 2 | transforms |
| **parked** | `texture2D` `textureCube` | 2 | — | AGSL weeks |

- **6 + 6 + 7 + 5 + 3 + 4 + 4 + 9 + 1 + 2 = 47** ✓

## Why each batch is grouped that way

**Batch 1 — the range cluster**
- `min` and `max` are one idea twice, and `clamp` is literally both of them composed. Learning them separately would waste your time.
- `abs` and `sign` are the sign-handling pair — `abs` is the one you'll use constantly in masks.
- `mix` closes the batch because it's the payoff: after six functions you can already write a complete two-colour blend with bounded input.

**Batch 2 — edges and repetition. The most valuable batch in the list.**
- `step` then `smoothstep` as a **contrast pair** — you learn `step` mainly to see the jaggies it produces, which is what motivates `smoothstep`. Doing them apart loses that.
- `smoothstep` needs `clamp`, which is why it can't come earlier.
- `floor` → `ceil` → `fract` → `mod` is the **tiling cluster**, and it's a definitional chain: `fract` is defined from `floor`, `mod` from `floor`.
- After this batch you have every tool ch. 5–7 asks for.

**Batch 3 — shaping and falloff**
- `sqrt` first because you already understand it, and it's just `pow(x, 0.5)` — which makes `pow` feel like a generalization rather than a new thing.
- `exp` → `log` as an inverse pair, then `exp2`/`log2` as the cheap base-2 variants (they're one entry's worth of content between them).
- `inversesqrt` **last on purpose** — its whole reason for existing is being a fast hardware `1/sqrt`, and it's what `normalize` is built on. It's the bridge into batch 6.

**Batch 4 — trig, forward direction**
- `radians`/`degrees` first because they're trivial *and* they establish the thing that trips everyone: **GLSL trig is in radians**, always.
- `sin` and `cos` together — same wave, quarter-cycle apart. Separating them is artificial.
- `tan` closes it, largely so you can watch it blow up at ±π/2 and understand why it's rare in shaders.

**Batch 5 — trig, inverse direction**
- Kept separate because inverses are a genuinely different idea (restricted ranges, not just a different curve).
- `atan` is last and gets the most room: the two-argument `atan(y, x)` form is the **polar-coordinate workhorse** and the one you'll actually use in ch. 8–9.

**Batch 6 — where 2D geometry starts**
- `length` first (you've already used it), `distance` next (it's `length(a - b)` and nothing more).
- `dot` is the **big one in this batch** — projection, angle, and the thing `length` is secretly defined from. It gets the deepest treatment of the four.
- `normalize` last: needs `length`, and is where `inversesqrt` pays off.
- This is the first batch using lab MODE 1 and 2, which is why it comes after you're fluent at reading graphs.

**Batch 7 — the honest one**
- `cross` is **3D only** — it doesn't exist for `vec2`.
- `reflect`, `refract`, `faceforward` are surface-lighting functions from the pipeline you deliberately cut.
- Delivered because you asked for all 47, but labelled **completeness, not capability**. `reflect` is the only one with a real 2D use (mirroring a direction).

**Batch 8 — all nine at once**
- The six comparisons (`lessThan` … `notEqual`) are **one function with a different operator**. Six separate deep entries would be padding.
- Then the three that are actually distinct: `any`, `all`, `not`.
- The real content of this batch is *why you rarely want them* — they return booleans, and booleans mean hard edges.

**Batch 9 — and the thing the glossary omits**
- `matrixCompMult` is one function and genuinely thin.
- The **`mat2` rotation matrix** is attached to it, because that's the transform ch. 8 actually needs and the glossary has no entry for it.

## Mapping to the chapters

| After batch | You can comfortably do |
|---|---|
| 2 | ch. 5 (shaping), ch. 6 (colour), ch. 7 (shapes, the easy half) |
| 3 | ch. 5 exercises properly — every easing curve |
| 5 | ch. 8 (matrices), ch. 9 (patterns) |
| 6 | ch. 7 in full — real distance-field shapes |
| 9 | everything up to ch. 11 |

- **Batches 1–6 are the load-bearing ones.** Batches 7–9 are 14 functions that mostly teach you what *not* to reach for.

## If the run stalls

- **Batches 1 and 2 plus `length` is the 80% cut.** Thirteen functions. If your week gets eaten, do those and keep moving through the book — the rest can be filled in as you hit them.
