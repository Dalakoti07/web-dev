# Shaders — Working Context

> 👉 **The roadmap lives in [`plan.md`](./plan.md)** — timeline, dependencies, maths
> foundations, decision ledger, and what to do next. Open that first.
>
> This file is the *conventions* file: what I know, how I like things explained, and the
> gotchas specific to my setup. Started 2026-09-20. Target: AGSL shaders shipped in a Compose app.
>
> **What belongs here:** decisions, corrections, preferences, project state, and teaching
> approaches that worked. **What does not:** GLSL function documentation — that is in the
> spec and in `glsl-glossary/`, and it is not unique to us.

---

## 1. Ground Rules for Any Session

- **Don't re-teach the per-pixel model.** Already internalized: a shader is a pure function
  `(pixel coordinate) -> color`, invoked independently and in parallel for every pixel.
- **Ask which week I'm on** before laying out new material.
- **Book exercises are optional prompts, never homework.**
- **Answers as nested outlines**, one claim per bullet. No prose preamble.
- **1–2 friendly sources max.** Papers only on request.
- ⚠️ **I run shaders in `editor.thebookofshaders.com`, not locally.** Deliver **one paste-able
  block**. Never a file path, never `glslViewer`. See [[shader-code-must-be-paste-ready]].

---

## 2. The Plan

9 weeks, ~3 hrs/week, concurrent with the applied-math curriculum and the Compose masterclass.

| Week | Content |
|------|---------|
| 0 | kishimisu video + one shader running in Compose via `RuntimeShader` (API 33+) |
| 1–2 | Book of Shaders ch. 5, 6, 7 |
| 3–4 | ch. 8, 9 |
| 5–6 | ch. 10, 11 |
| 6.5 | Four Inigo Quilez articles |
| 7–8 | AGSL in Compose. **Capstone: replace a shimmer library with my own ~40-line shader.** |

**Stop the book at chapter 11.** Everything after is a stub.

**Explicitly out of scope:** 3D raymarching / SDF scenes (cut on purpose), and flipping the
y-axis inside shaders (refused on purpose — convert at the AGSL boundary instead).

**Two practice tracks** run alongside the reading track, interleaved by movement:

- `shader-exercises.md` — **The 50**, the *effects* track. Bends pixels that already exist.
- `shapes-exercises.md` — **BOLT**, the *illustration* track. Invents pixels from nothing.

Combined ~9 months at one rung every 2–3 days, with 14 shared rungs ticked once and counted
twice. **Start with BOLT Movement 1** — it needs no venue setup and makes The 50's Tier 1 trivial.
One hard dependency: **The 50 #42 before BOLT S33.**

---

## 3. Conventions & Gotchas Specific to This Setup

- **y-up vs y-down.** GLSL / Book of Shaders / Shadertoy are y-up, origin bottom-left. AGSL and
  Android canvas are y-down, origin top-left. Convert once, at the AGSL boundary.
- **The editor is WebGL1.** `fwidth` needs `GL_OES_standard_derivatives` and may be absent —
  gate it behind `#define USE_FWIDTH 0` with a fixed-width fallback.
- **`RuntimeShader` is API 33+.** Anything shipping lower needs a fallback path.
- **AGSL has no `u_resolution` equivalent** — pass a `uniform float2` yourself.

---

## 4. Cross-Track Overlap

Shaders double as the **visualization layer for calculus revision** — smoothstep, derivatives,
easing curves, distance fields and periodic functions are the same objects from both tracks.
Lean on the overlap; it is not a competing commitment. See [[applied-math-curriculum-run]].

---

## 5. Already Known — Do Not Re-Explain

Per-pixel execution model · `uv` normalization · `smoothstep` with reversed edges · signed
distance fields · masks as coverage · the four stages · `fract`/`floor` tiling · polar via
`atan`/`length` · rotation via `mat2(c, s, -s, c)` · gamma with a vector exponent.

---

## 6. The Shading Philosophy (core mental model — the house style)

Their summary was "one function makes the shape, another decides the colour" — right in
spirit, with two corrections:

1. **A mask is not boolean.** It answers "**how much** of this pixel", as a float. The boolean
   version is `step()`, and it is exactly what produces jaggies.
2. **It's four stages, not two.** The missing one is the **field** — a raw scalar function of
   position, before any 0..1 shaping. Fields are the composable layer.

### The canonical 2D pipeline

| # | Stage | Type | Job |
|---|---|---|---|
| 1 | **Domain** | `vec2 -> vec2` | where am I; transform space |
| 2 | **Field** | `vec2 -> float` | a raw scalar per position |
| 3 | **Mask** | `float -> float` | squash the field into 0..1 |
| 4 | **Colour** | `float -> vec3` | spend the mask |

- **`float` until the last possible moment.** `vec3` only in stage 4.
- **Why:** masks and fields support algebra (`*` intersect, `max` union, `-` subtract, `min`
  for SDF union). Colours don't. Reaching `vec3` early destroys composability.
- **Return the FIELD, not the mask.** A shape function that bakes in thickness or softness has
  stolen the caller's decisions.
- **Nothing enforces this.** It is discipline, encoded in the `shader-four-stage` skill.
- 3D/lighting has a different pipeline (surface -> normal -> BRDF). This one is 2D.

---

## 7. Teaching Approaches That Worked (reuse these framings)

- **Shapes from functions — "a field labels, it does not draw."** Every point gets one number;
  negative inside, zero on the boundary, positive outside. **The shape is the set where the
  number is zero** and is never stored anywhere.
  - **Teach it in 1D first:** `abs(x - 0.5) - 0.2` dips below zero between 0.3 and 0.7. That
    interval IS the shape.
  - **The one identity that explains the whole SDF algebra:** `max` is AND (intersection),
    `min` is OR (union), `-b` swaps inside/outside so `max(a, -b)` is subtraction. Derive all
    four from AND/OR; never have them memorise four rules.
  - **The punchline:** square / diamond / circle differ only in *how x and y are combined* —
    `max(abs,abs)` (L∞), `abs+abs` (L1), `length` (L2). Connects to norms in the maths track.
- **Rings, boundary and fill — "one number, three independent questions."** `d` is an altitude
  map: the boundary is the coastline, the rings are contour lines, the fill is below sea level.
  A topographic map does not derive contours from its coastline.
  - **Nothing is recursive.** `fract` is a sawtooth; **delete `fract` and you get one ring** —
    that is the falsifiable test to hand them.
- **Use their own screenshots as evidence.** The missing sawtooth drops in their `fract` graph
  were a live demonstration of vertical-measurement thinning.
- **Every batch ends with a runnable demo shader** — their explicit request. Keep doing it even
  when the functions are dull.

---

## 8. Decisions Made (do not re-litigate)

> The dated, authoritative ledger is [`plan.md`](./plan.md) §7. What follows is the
> reasoning behind the ones that shape how sessions are run.

- **Walk the entire Book of Shaders glossary, function by function, in depth.** They chose this
  after hearing the efficiency objection. **The objection is withdrawn.**
- **The Khronos quick-reference card was rejected as too dense.** Don't cite it again.
- **10-part entry format:** signature -> what it does -> exact definition -> picture -> range &
  edge cases -> which stage -> idioms -> traps -> AGSL -> lab line.
- **Teaching order is dependency order, not glossary order.** 9 batches; batches 1–2 are the
  load-bearing twelve; batch 7 was delivered labelled *completeness, not capability*.
- **`texture2D` / `textureCube` are parked** until the AGSL weeks — both need a bound sampler
  the online editor won't provide. **45 of 47 delivered.**
- **~35 of the 47 transfer verbatim to AGSL.** Only the nine relationals (use operators there),
  `matrixCompMult`, and the two texture functions need translation.
- **3D raymarching is BACK IN SCOPE.** Cut 2026-09-20, **reversed 2026-10-01** with the
  +2-months cost stated up front. It is `shapes-exercises.md` Movement 7 (S59–S70), and it is
  where the parked **shadows** thread finally lands (S63–S64). Do not re-cut it without
  asking — this reversal was deliberate.
- **The endgame is now two capstones, not one.** BOLT v2 (a living 2D character) is the one
  they said they actually wanted; the photo ripple is the other. Neither subsumes the other.
- **"Mental model shift" articles barely exist as a genre** (searched 2026-09-28). The framing
  appears in WebGPU *compute* writing; Android/AGSL material is wiring-only. Don't re-search.

---

## 9. Where the Actual Content Lives

Everything shader-related now lives in `~/Desktop/github/web-dev/shader/` (moved 2026-10-01).

| Path | What |
|------|------|
| **`plan.md`** | **The master roadmap** — unified timeline, dependency graph, the maths map, decision ledger, slip plan, next action. |
| `shader.md` | This file — conventions, gotchas, teaching framings. |
| `shader-exercises.md` | **The 50** — the *effects* track. Ends in a water-ripple effect on my own photo. Venue ladder, a single-file HTML lab, the AGSL skeleton. |
| `shapes-exercises.md` | **BOLT** — the *illustration* track, 70 rungs. Ends in a poseable, blinking, cursor-watching robot, then the same robot rebuilt in 3D. Interleaves with The 50; shared-rungs table is in its §3. |
| `glsl-glossary/` | 18 markdown notes + 4 runnable `.frag` files, all paste-ready. |

**`glsl-glossary/`** — function documentation lives there, not here.

| # | Functions | Core learning | Capability unlocked |
|---|---|---|---|
| 1 | min max clamp abs sign mix | `min`/`max` are OR/AND, inverted between fields and masks | shapes without `length`; union / intersect / subtract |
| 2 | step smoothstep floor ceil fract mod | `smoothstep` = clamp ramp + `t*t*(3-2t)` | clean antialiased edges; all tiling |
| 3 | sqrt pow exp log exp2 log2 inversesqrt | `exp2`/`log2` are the primitives; `pow` is built on them | easing, glow falloff, gamma, octaves |
| 4 | radians degrees sin cos tan | radians always; output is `[-1,1]` and must be remapped | animation, waves, rotation with no matrix |
| 5 | asin acos atan | restricted ranges are forced; clamp before `acos` | polar coordinates, n-fold symmetry |
| 6 | length distance dot normalize | `length` -> circles, `dot` -> lines; `dot` is the primitive | real SDFs, segments, half-planes, Lambert |
| 7 | cross reflect refract faceforward | completeness, not capability | kaleidoscope folding; `cross2` side tests |
| 8 | the nine relationals | exist only because operators reject vectors | knowing what to avoid |
| 9 | matrixCompMult (+ `mat2`) | GLSL is column-major; `*` is the real product | transform stacks, right-to-left |

Also there: `fn-lab.frag` (the 4-mode inspection harness), plus the four-stage refactors and
the layering / lerp / rings explainers.

---

## 10. Open Threads

- ~~**Shadows**~~ — **closed 2026-10-01.** Scheduled as BOLT S63–S64. The framing given on
  2026-09-27 (a shadow is a **visibility query**, not an object; soft penumbras come from
  `min(k * closest / travelled)`) is written into those two rungs verbatim.
- **`texture2D` / `textureCube`** — parked for the AGSL weeks.
- **Week 0 still unconfirmed** — has one shader actually run in a Compose app yet? Ask.
- **Texture venue** — `editor.thebookofshaders.com` cannot bind a sampler, and Shadertoy has no
  native image upload. Resolved 2026-10-01 with three routes (Shadertoy custom-texture
  extension / the single-file HTML lab in Appendix A / AGSL). `texture2D` stays parked until
  exercise 36.
- **Anisotropic Kuwahara** is the named answer to "how do I get a watercolour look". Opened
  2026-10-01 as exercise 41; not yet attempted.
