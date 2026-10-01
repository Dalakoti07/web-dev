# Shaders — The Master Plan

> **The one file to open.** Everything else in this folder is detail; this is the map.
>
> Owns: current position, the unified timeline, dependencies, the maths foundations,
> and the decision ledger. Does **not** own conventions (`shader.md`) or exercises
> (`shader-exercises.md`, `shapes-exercises.md`).
>
> Started 2026-09-20 · this plan written 2026-10-01 · target completion **Sep 2027**
>
> ## 🔒 FROZEN — v1.0, 2026-10-01
>
> **This plan is closed to revision.** The scope, the rung list, the timeline and the
> decision ledger below are fixed. From here the only valid moves are: **tick a box**,
> **cut per §8**, or **log a dated reversal in §7**.
>
> Re-planning instead of working is the failure mode this freeze exists to prevent (§9).
> If a new plan feels necessary, the honest answer is almost always "do the next rung tonight."
>
> **Track it in [`roadmap.html`](./roadmap.html)** — open it in a browser, tick as you go.

---

## 1. Where I am right now

| Thing | State |
|---|---|
| Per-pixel model | ✅ internalised — a shader is a pure function `(pixel) → colour` |
| GLSL glossary | ✅ **45 of 47 functions** documented in depth, 9 batches, dependency order |
| `texture2D` / `textureCube` | ⏸ parked until The 50 #36 — needs a sampler the editor won't give |
| Book of Shaders | 📖 reached **ch. 3**, found it overwhelming. Not a failure — see §7 |
| Four-stage house style | ✅ agreed and encoded in the `shader-four-stage` skill |
| Week 0 gate | ❓ **unconfirmed — has one shader actually run in a Compose app yet?** |
| The 50 | 📋 written, 0/50 |
| BOLT | 📋 written, 0/70 |

**Week 0 is two items, not one** (restoring `shader.md` §2, which this file had trimmed):
1. **`R1`** — watch the kishimisu video, *An Introduction to Shader Art Coding*.
2. **`W0`** — get one shader rendering through `RuntimeShader` in a Compose app.

**The one thing blocking the start:** Week 0. Get a single trivial shader (a red screen, then
a gradient) rendering through `RuntimeShader` in a Compose app. Until that works, the entire
destination is theoretical. **Do this before S1.** Budget: one sitting.

---

## 2. The three tracks

| Track | File | What it is | Output |
|---|---|---|---|
| 📖 **Reading** | `shader.md` §2 | Book of Shaders ch. 5–11 + four iq articles | understanding |
| 🎨 **BOLT** | `shapes-exercises.md` | 70 rungs. *Illustration* — invents pixels from nothing | a living character |
| 💧 **The 50** | `shader-exercises.md` | 50 rungs. *Effects* — bends pixels that exist | a rippling photo |

**The relationship in one line:** reading explains, BOLT teaches you to *draw*, The 50 teaches
you to *process*. They are not competing — they're three faces of the same skill, and 14 rungs
are literally shared.

**The reading is tickable.** 19 reading items (Book of Shaders ch. 5–11, the iq articles, the
two videos, the AGSL docs) live in [`roadmap.html`](./roadmap.html) as their own track, month
by month, matching the "Reading" column below. They are counted **separately** from the 121
rungs so they never flatter or distort the pace figure. **Book of Shaders ch. 4 is skipped on
purpose** — it is local `glslViewer` setup you don't use.

**Recommendation: absorb the reading track.** Don't give it separate sittings. Read the
relevant chapter as *prep* for the rung that uses it (the mapping is in `shader-exercises.md`
§0). This is the difference between finishing in **July 2027 and September 2027.** The book is
the manual; the rungs are the work.

> ⚠️ **Correction to an earlier estimate.** I told you "~9 months, finishing July 2027" when
> BOLT was written. That counted rungs only. With the reading track and the AGSL wiring weeks
> included it's **~12 months to September 2027** — or ~10 months if you absorb the reading as
> recommended above. Plan against September and be pleasantly surprised.

---

## 3. The unified timeline

One rung every 2–3 days, ~3 hrs/week. Alternating **by movement**, never by rung — switching
context every sitting is the realistic burnout path.

| Month | Primary | Rungs | Reading (absorbed) | Ships |
|---|---|---|---|---|
| **Oct 2026** | ⚙️ Week 0 gate, then 🎨 BOLT M1 | S1–S12 | ch. 5 (shaping) | 📸 **BOLT's head** |
| **Nov 2026** | 🎨 BOLT M2 | S13–S22 | ch. 6 (colour) | 📸 **BOLT's body** |
| **Dec 2026** | 🎨 BOLT M3 | S23–S32 | ch. 7 (shapes) | 📸 **BOLT's eyes** |
| **Jan 2027** | 💧 The 50 T0–T1 *+ #42 early* | #1–#14, #42 | ch. 8 (matrices) | the AA + SDF toolkit |
| **Feb 2027** | 🎨 BOLT M4 | S33–S42 | iq: 2D SDFs | 📸 **BOLT's shell** |
| **Mar 2027** | 🎨 BOLT M5 | S43–S50 | iq: palettes | 🎉 **BOLT v1** — static, composed |
| **Apr 2027** | 💧 The 50 T2–T3 | #15–#29 | ch. 9–11, iq: warp + fBm | noise + domain warping |
| **May 2027** | 🎨 BOLT M6 | S51–S58 | — | 🎉🎉 **BOLT v2 — alive** |
| **Jun 2027** | 💧 The 50 T4–T5 | #30–#42 | — | Kuwahara, the filter kit |
| **Jul 2027** | 💧 The 50 T6–T7 | #43–#50 | AGSL docs | 🎉🎉 **the rippling photo** |
| **Aug 2027** | 🎨 BOLT M7 (first half) | S59–S65 | iq: raymarching, shadows | the march + real shadows |
| **Sep 2027** | 🎨 BOLT M7 (second half) | S66–S70 | iq: 3D SDFs | 🎉 **BOLT v3 — solid** |

**The two dates that matter:** BOLT v2 in **May 2027** and the ripple in **July 2027**. Those
are the two things you said you wanted. Everything after August is the reopened 3D scope and
is genuinely optional.

**Why BOLT goes first:** it needs zero venue setup (no texture, no extension, no harness), and
its Movement 1 makes The 50's Tier 1 almost free. Starting with The 50 would mean starting with
a shopping list.

---

## 4. Dependencies — what blocks what

```
  Week 0 gate (Compose + RuntimeShader)
      │  blocks nothing technically, but the destination is theoretical without it
      ▼
  BOLT M1  ──────────────►  The 50 T1        (S1–S12 make #7–#14 trivial)
      │                        │
      ▼                        │
  BOLT M2  (smin)              │
      │                        │
      ▼                        ▼
  BOLT M3  ◄───────────── The 50 #42  ⚠️ HARD DEPENDENCY
      │                   (gradient → fake normal)
      ▼                        │
  BOLT M4  ◄───────────────────┘
      │
      ▼
  BOLT M5 ──► BOLT M6 ──► 🎉 BOLT v2
                              │
  The 50 T3 (noise) ──► T5 (filters) ──► T6 (water) ──► 🎉 the ripple
                                                            │
  BOLT M2 (field algebra) ──────────────────────────────────┴──► BOLT M7 ──► BOLT v3
```

**The only rule you can actually break and regret:** do **The 50 #42 before BOLT S33**.
S30 and all of Movement 4 are built on it. If you reach S33 without it, stop and do #42.

**Everything else is soft.** The field algebra from BOLT M2 is the one thing that transfers
wholesale into 3D — which is why M7 can sit nine months later and still make sense.

---

## 5. Artefacts — what exists at the end

| # | Artefact | From | When |
|---|---|---|---|
| 1 | Seven BOLT progression screenshots | each BUILD rung | throughout |
| 2 | `bolt.frag` — one growing file, ~300 lines | BOLT M1–M6 | May 2027 |
| 3 | A GIF of BOLT idling, blinking, tracking the cursor | S58 | May 2027 |
| 4 | A framed still — BOLT in his world | S50 | Mar 2027 |
| 5 | The single-file HTML photo lab | The 50 Appendix A | Jun 2027 |
| 6 | A watercolour render of my own photo | The 50 #49 | Jul 2027 |
| 7 | **An Android app: tap my photo, the water ripples** | The 50 #50 | Jul 2027 |
| 8 | A hand-written shimmer shader replacing a library | the original capstone | Jul 2027 |
| 9 | `bolt3d.frag` — the same character, raymarched | S70 | Sep 2027 |

**#7 and #3 are the two you show people.** Everything else is evidence.

---

## 6. What you're actually learning — geometry, or linear algebra?

*(Answering the question directly, because the honest answer changes how you study.)*

### The short version

> **Geometry decides *what* you draw. Analysis decides whether it looks *good*.
> Linear algebra just moves things around.**

Rough shares of the mental effort in this curriculum:

| Field | Share | Role |
|---|---|---|
| **Real analysis / calculus** | ~50% | functions, smoothness, derivatives, limits, series |
| **Geometry** | ~35% | distance, metrics, projection, symmetry, convexity |
| **Linear algebra** | ~15% | vectors as containers, `dot`, a handful of 2×2 / 3×3 transforms |

### Why linear algebra is the *smallest* share, despite appearances

It supplies the **vocabulary** — `vec2`, `vec3`, `dot`, `mat2` — and almost none of the
**content**. Across all 120 rungs you will never once: solve `Ax = b`, compute a determinant,
find an eigenvalue, invert a matrix, decompose anything, or reason about rank, span or basis
independence. The only genuinely linear-algebraic moment in the entire plan is **S69**, where
you build an orthonormal camera basis from two cross products.

Saying shader drawing is "about linear algebra" is like saying writing is about the alphabet.
True, necessary, and not the thing.

### Why geometry is real but not the hard part

You *are* doing classical Euclidean geometry: half-planes, projection onto a segment,
convex intersection, angular symmetry, and metric spaces (the L1/L2/L∞ punchline — diamond,
circle, square — is literally a lesson in norms). Deriving the exact triangle SDF is genuine
geometric reasoning.

But geometry gets you a *correct* shape. It does not get you a *good-looking* one.

### Why analysis is the biggest share — and the underrated one

**Every hard shader bug you will hit is a calculus bug.** Not a geometry bug.

| Symptom | The actual cause | Rung |
|---|---|---|
| Jaggy edges | `step` is discontinuous — C⁻¹ | #3 |
| A visible crease where two parts meet | `min` is C⁰ but not C¹ — the derivative jumps | S14 |
| A `smin` blend that warps oddly | an input violated the Lipschitz condition | S5, S18 |
| Glow that looks like a muddy sticker | wrong falloff function — `1/d` vs `exp(-kd)` | S25 |
| Shimmering at a distance | aliasing — sampling below Nyquist | #3, S31 |
| Banded / noisy normals | the central-difference step `e` is too small for float precision | S33 |
| Shadow acne | the same, in 3D | S63 |
| Motion that reads as robotic | wrong easing — no overshoot, so no implied mass | S54 |

Not one of those is fixed by knowing more geometry. Each is fixed by knowing something about
**continuity, differentiability, or sampling**.

### The name for what you're actually doing

**Implicit (or functional) geometry.** You never store a shape — you store a *function whose
zero set is the shape*. Geometry supplies the shapes; analysis supplies the tools to combine,
smooth and light them. That intersection is the subject, and it doesn't map cleanly onto either
undergraduate course.

### The maths map — where each topic lands

Cross-check this against your applied-maths syllabus. Every row that overlaps is revision you
get for free, which is the whole point of `shader.md` §4.

| Maths topic | Shows up as | Rungs |
|---|---|---|
| Functions `R² → R`, level sets | **every field you will ever write** | all |
| Continuity classes C⁰ / C¹ / C² | `step` vs `smoothstep`; `min` vs `smin` | #3, S14 |
| Gradient of a scalar field | normals, antialiasing, refraction | S30, S33, #42, S61 |
| Numerical differentiation | central differences, and choosing the step size | S33, #42, S61 |
| Lipschitz continuity | the SDF correctness condition; sphere tracing | S5, S18, S59 |
| Metric spaces, L1/L2/L∞ norms | diamond / circle / square from one formula | #9, S6 |
| Convexity, half-planes | triangle and polygon SDFs | S1, S2 |
| Projection (via `dot`) | segment distance; Lambert shading | #13, S9, S34 |
| Polar coordinates | radial waves, pies, n-fold symmetry | #16, S8 |
| Dihedral symmetry | kaleidoscope folding (a group action, unnamed) | #19, S19 |
| Affine transforms, change of basis | `mat2` stacks, the limb hierarchy | #15, S53 |
| Orthonormal bases, cross product | the 3D camera | S69 |
| Geometric series | fBm octave sums | #25 |
| Interpolation — linear, bilinear, Hermite | `mix`, value noise, `smoothstep`'s cubic | #22, #23 |
| Exponential decay | glow, fog, ripple damping, shadow falloff | S25, #44, #47 |
| Damped harmonic oscillator (an ODE) | springs, blinks, ripples — **the same equation three times** | S54, S56, #44 |
| Fourier thinking — Nyquist, aliasing | why fine detail shimmers and how to prefilter | #3, S31 |
| Power laws / gamma | why blurring sRGB darkens an image | #33 |

**The single most reused idea in 120 rungs:** *the gradient of a scalar field is a vector
field, and that vector is a surface normal.* You meet it four times — S30 (by accident),
S33 (deliberately, in 2D), The 50 #42 (for water), S61 (in 3D). If you learn one thing
properly, learn that one.

### So what should you study alongside?

- **Highest return:** multivariable calculus — gradients, directional derivatives, level sets.
  Directly, immediately, every single rung.
- **Second:** a little numerical analysis — finite differences, step-size choice, floating-point
  error. Fixes the bugs that will otherwise cost you evenings.
- **Third:** enough linear algebra for change of basis. You already have more than you need.
- **Not worth it for this:** eigenvalues, decompositions, abstract vector spaces. Great maths,
  irrelevant here.

---

## 7. Decision ledger

One place. Do not re-litigate these without an explicit reversal entry.

| Date | Decision | Status |
|---|---|---|
| 2026-09-20 | Walk the **entire** BoS glossary function by function, in depth | ✅ done, 45/47 |
| 2026-09-20 | **Stop the book at ch. 11** — everything after is a stub | standing |
| 2026-09-20 | Destination is **AGSL in Compose**, not "knowing GLSL" | standing |
| 2026-09-20 | Cut 3D raymarching / SDF scenes | ❌ **reversed 2026-10-01** |
| 2026-09-20 | Refuse to flip the y-axis inside shaders — convert at the AGSL boundary | standing |
| 2026-09-25 | Khronos quick-reference card rejected as too dense | standing |
| 2026-09-27 | Shaders run in **editor.thebookofshaders.com** — deliver paste-able blocks | standing |
| 2026-09-27 | `texture2D` / `textureCube` parked until a sampler exists | ⏸ lifts at #36 |
| 2026-09-28 | "Mental model shift" articles don't exist as a genre — stop searching | standing |
| 2026-10-01 | Consolidate everything into `shader/` | ✅ done |
| 2026-10-01 | Shadertoy has **no** native image upload — three workarounds documented | ✅ resolved |
| 2026-10-01 | **3D raymarching back in scope** (+2 months, accepted knowingly) | ✅ BOLT M7 |
| 2026-10-01 | Two capstones, not one — BOLT v2 *and* the ripple | standing |
| 2026-10-01 | Interleave **by movement**, not by rung | standing |
| 2026-10-01 | Shadows thread closed — scheduled as S63–S64 | ✅ closed |
| 2026-10-01 | **Absorb the reading track** into rung prep rather than separate sittings | standing |
| 2026-10-01 | Reading made tickable in `roadmap.html` as a separate, uncounted track. **Not a scope change** — it makes §3's existing "Reading" column trackable | maintenance |
| 2026-10-01 | Week 0 restored to its original two items (kishimisu video + the Compose gate). This file had trimmed the video | correction |
| 2026-10-01 | Moved `shader/` out of `books/` into the **`web-dev` git repo** — it is now version-controlled. ⚠️ `web-dev` is a **public** GitHub repo | standing |

### On ch. 3 of the book

It stopped you, and that's worth naming rather than quietly routing around. Two causes, both
now fixed by construction:

- **y-up vs y-down** — resolved as a convention, not re-derived each time (`shader.md` §3).
- **Open-ended exercises with no answer key** — that is exactly what The 50 and BOLT replace.
  Every rung here has a **"Done when"** line. Book exercises remain optional prompts.

**You are not behind.** The glossary walkthrough you completed is strictly more than ch. 3–7
teaches. The book is now a reference, not a gate.

---

## 8. If it slips

It will. Here's the order to cut in, so that slippage costs you the least.

| Cut order | What | Cost |
|---|---|---|
| 1st | **BOLT M7** (S59–S70, 3D) | Nothing you asked for. It's the reopened scope. −2 months |
| 2nd | **The 50 #49** (watercolour) | The ripple is the goal; watercolour was the comparison. −3 weeks |
| 3rd | **BOLT M5** (composition) | BOLT still lives, he just has no world. −1 month |
| 4th | Drop to **BOLT's fast lane** (12 rungs, `shapes-exercises.md` §fast lane) | Still get a living character. −4 months |
| **Never cut** | Week 0 · S14 `smin` · S33/#42 the gradient trick · S44 silhouette · #46 refraction | these five are the plan |

**The minimum viable year:** Week 0 → BOLT fast lane (12 rungs) → The 50 Tiers 5–6 (#36–#48)
→ #50. That is **~35 rungs, about four months**, and it still ends with a living character and
a rippling photo. Keep this in your back pocket.

---

## 9. Resuming after a gap

You will put this down for six weeks at some point. When you come back:

1. Open **this file**, §1 — update the state table to what's actually true.
2. Open `shader.md` §5 ("Already Known") — it stops anyone re-teaching you the basics.
3. Find the last ticked box in whichever tracker you were in.
4. Re-run the **previous** BUILD rung's shader before starting the next one. Fifteen minutes,
   and it reloads the whole context better than reading notes does.
5. Don't re-read the book. Don't restart. Don't re-plan.

**The failure mode to watch for is re-planning instead of working.** This file exists so that
never has to happen again. If you catch yourself wanting a new plan, the honest answer is
almost always "do S-whatever-is-next tonight."

---

## 10. File map

| File | Owns |
|---|---|
| **`plan.md`** | ← you are here. Timeline, dependencies, maths, decisions, state. |
| `shader.md` | Conventions, gotchas, the four-stage philosophy, teaching framings that worked. |
| `shapes-exercises.md` | 🎨 BOLT — 70 rungs, illustration, ends in a living character. |
| `shader-exercises.md` | 💧 The 50 — 50 rungs, effects, ends in a rippling photo. |
| `glsl-glossary/` | The 45 documented GLSL functions + 4 runnable `.frag` labs. |

---

## 11. Next action

> **Week 0 gate.** One sitting. Get a solid red screen rendering through `RuntimeShader` in a
> Compose app on your phone. Then a gradient. Then stop.
>
> After that: `shapes-exercises.md` → **S1**.
