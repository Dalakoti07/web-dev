# BOLT — A Shapes & Character Problem Set

> 70 rungs where **the shape is the point**. Nothing here is justified by what it contributes
> to a photo effect. You draw a thing, you colour it, you look at it.
>
> **The endgame:** a little robot called BOLT — hand-built from signed distance fields, lit,
> posed by uniforms, idling, blinking, watching your cursor. Then **rebuilt in 3D** with real
> raymarched shadows. (Rename him. He's yours.)
>
> Sibling to [`shader-exercises.md`](./shader-exercises.md) ("The 50" — the *effects* track).
> These interleave. See §3.

---

## 0. Why this exists

The 50 is an **effects** curriculum. Its shader never draws anything — it bends pixels that a
camera already captured. Every rung there carries a "capstone link" justifying its existence.

This is an **illustration** curriculum. The screen starts black and everything on it is yours.

| | The 50 | BOLT |
|---|---|---|
| Input | your photo | nothing |
| The shader's job | **bend** pixels that exist | **invent** pixels that never existed |
| Output | a treatment | a picture |
| Trains | effects engineering | illustration |
| Venue | editor → Shadertoy → AGSL | **the Book of Shaders editor, rungs S1–S58** |

**One practical consequence:** S1–S58 need no texture, no sampler, no extension, no HTML
harness. They all paste straight into `editor.thebookofshaders.com`. Only the 3D movement
(S59–S70) wants Shadertoy, and only for performance and loop-bound reasons.

---

## 1. The spine — BOLT grows a part per movement

You are never doing an exercise that doesn't visibly build the character. Each movement ends
with a **BUILD** rung where the new part is attached to the previous ones.

| Movement | Rungs | You learn | BOLT gains |
|---|---|---|---|
| **1. Vocabulary** | S1–S12 | The full 2D SDF library | **his head** — dome, visor, antenna |
| **2. Operators** | S13–S22 | The field algebra, esp. `smin` | **his body** — torso welded to a neck |
| **3. Spends** | S23–S32 | One field, many outputs | **his eyes** — fill, ring, glow, inner shadow |
| **4. Materials** | S33–S42 | Fake lighting on flat shapes | **his shell** — glossy plastic, metal trim |
| **5. Composition** | S43–S50 | Value, palette, depth, layout | **his world** — and BOLT v1, static |
| **6. Rigging** | S51–S58 | Pose as uniforms, easing, events | **BOLT v2** — alive, blinking, watching you |
| **7. The third dimension** | S59–S70 | Raymarching, 3D SDFs, shadows | **BOLT v3** — solid, lit, orbitable |

**What BOLT is, so you can picture the target:**

```
        ╭─╴ antenna (segment + tip circle)
      ╭─┴─╮
     │ ▢▢  │  head: rounded box, vesica visor, two eye discs
      ╰─┬─╯
    ╭───┴───╮
   │  ▤▤▤▤  │ body: rounded box, smin-welded neck, chest panel
   ╰─┬─────┬╯
     │     │  arms: capsules, hinged at the shoulder
```

Nothing exotic. Six primitives and the operator algebra. The difficulty is **not** the geometry
— it's making it look like an object instead of a diagram. That is Movements 3 and 4.

---

## 2. Rules

- **Rungs are `S1`–`S70`.** The 50's rungs stay plain numbers. Never mix the two notations.
- **Four stages, always.** DOMAIN → FIELD → MASK → COLOUR, with the four banner comments.
  The rule that matters most here: **a shape function returns the field, never the mask.**
  BOLT is one field composed from thirty, and it only becomes colour at the very end.
- **Keep a `bolt.frag`.** Unlike The 50, this plan has **one growing artefact**. Each BUILD rung
  edits the same file. Save a copy at each BUILD so you can watch him evolve.
- **"Done when" is the acceptance test**, same as The 50.
- **Screenshot every BUILD rung.** Seven images at the end. That's the receipt.

---

## 3. Interleaving with The 50 — the honest arithmetic

You chose to alternate. Here's what that actually costs, and how to make it not cost that.

- **Naive total:** 50 + 70 = 120 rungs × 2.5 days = **~10 months.**
- **Shared rungs:** 14 of them. Do the work once, tick both trackers. → 106 sittings.
- **Realistic total: ~9 months**, finishing around July 2027.

That is a long time, and I'd rather say so than let you find out in March. Two mitigations:

**(a) The shared-rungs table — tick once, count twice.**

| BOLT | The 50 | The shared thing | Do it in |
|---|---|---|---|
| S0a | #2 | Aspect-corrected centred coords | whichever comes first |
| S0b | #6 | The gated `aa()` helper | whichever comes first |
| S0c | #7 | Circle SDF, returned as a field | whichever comes first |
| S13 | #10 | Union / intersect / subtract | The 50 |
| S6 | #11 | Exact box SDF | The 50 |
| S7 | #12 | Rounded box | The 50 |
| S9 | #13 | Segment / capsule | The 50 |
| S19 | #19 | Mirror & fold symmetry | The 50 |
| S20 | #21 | Radial repetition | The 50 |
| S4 | #14 | N-gon via angular folding | BOLT (deeper here) |
| S46 | #31 | iq's cosine palette | BOLT (deeper here) |
| S45 | #33 | Luminance & value structure | BOLT (deeper here) |
| S33 | #42 | Gradient of a field → fake normal | **The 50, first** — see below |
| S61 | #42 | The same trick in 3D | BOLT |

**(b) Sequencing constraint — one hard dependency.**
**Do The 50 #42 (height field → normal) before BOLT S33.** It is the same central-difference
trick, and S33 through S42 all depend on it. If you hit S33 first, do #42 out of order.

**(c) Suggested cadence.** Alternate by *movement*, not by rung — context-switching every
sitting is the thing that will burn you out.

```
BOLT Movement 1  (S1–S12)      ~1 month
The 50 Tier 0–1  (#1–#14)      ~1 month
BOLT Movement 2–3 (S13–S32)    ~1.5 months
The 50 Tier 2–3  (#15–#29)     ~1.5 months
BOLT Movement 4–5 (S33–S50)    ~1.5 months
The 50 Tier 4–5  (#30–#42)     ~1 month
BOLT Movement 6  (S51–S58)     ~0.5 month  ← BOLT v2 lives here
The 50 Tier 6–7  (#43–#50)     ~1 month    ← the ripple ships here
BOLT Movement 7  (S59–S70)     ~1 month    ← BOLT v3
```

**Start with BOLT.** It's the one you're excited about, it needs no venue setup, and its
Movement 1 makes The 50's Tier 1 trivial.

---

## 4. Scope note — raymarching is back on

On 2026-09-20 you cut 3D raymarching / SDF scenes from the curriculum. On 2026-10-01 you
reversed that, knowingly, with the +2-months estimate in front of you. Movement 7 is that
reversal. Recording it here so neither of us re-litigates it in February.

It is also where your **parked shadows thread** finally lands — S63 and S64 are exactly the
"a shadow is a visibility query, not an object" framing you were given on 2026-09-27.

---

## Movement 1 — The vocabulary (S1–S12)
*Venue: Book of Shaders editor. BOLT gains: his head.*

> **The discipline for this whole movement:** every one of these is a function
> `float sdX(vec2 p, ...)` returning a **signed field**. Negative inside, zero on the boundary.
> No `smoothstep`, no colour, no thickness. You will reuse all twelve for the next 58 rungs.

### S1. Triangle, three ways
- **Do:** (a) intersection of three half-planes via `dot`; (b) `max` of three `dot`s; (c) iq's
  exact equilateral triangle. Render all three as contour lines (`fract(d*20.0)`).
- **Teaches:** (a) and (b) give a *bound*, not a distance — the contours are wrong away from
  the shape. (c) is exact. The difference matters the moment you use `smin` or a glow.
- **Trap:** most "SDFs" you find online are bounds. They look fine filled and break when
  rounded, offset, or glowed.
- **Done when:** I can point at where (a)'s contours diverge from (c)'s.

### S2. Regular polygon, N sides
- **Kernel:** angular fold from The 50 #14, then a single half-plane distance.
- **Do:** one `n` uniform driving triangle → square → hexagon → circle.
- **Done when:** the contour lines stay evenly spaced as `n` changes (a bound wouldn't).

### S3. Star
- **Kernel:** a polygon with two alternating radii — fold the angle to `TAU/(2n)` and pick the
  inner or outer half-plane depending on which half of the wedge you're in.
- **Do:** expose `n`, `outerR`, `innerR`. Animate `innerR` — the star collapses into a polygon.
- **Capstone link:** not BOLT, but this is the one that teaches angular wedge logic, and S20
  (finite repetition) needs it.

### S4. Vesica and lens *(shared with The 50 #14 territory)*
- **Kernel:** the intersection of two offset circles, done exactly rather than with `max`.
- **Do:** `max(sdCircle(p-o,r), sdCircle(p+o,r))` first, then the exact form. Compare contours.
- **BOLT:** ⚙️ **this is his visor.** Save it.

### S5. Egg / teardrop
- **Do:** interpolate the radius of a circle by `p.y` — `length(p) - (r + k*p.y)`. Then fix the
  distortion (the field is no longer unit-gradient; divide by `sqrt(1+k*k)`).
- **Teaches:** the **Lipschitz condition** — an SDF must not change faster than 1 unit per unit
  of distance, or every downstream operator (glow, round, smin, raymarch) lies to you.
- **Trap:** this is the single most common way a hand-rolled SDF goes subtly wrong.

### S6. Exact box *(= The 50 #11)*
- Do it once. Tick both.

### S7. Rounded box, and per-corner radii *(extends The 50 #12)*
- **Kernel:** `sdBox(p, b - r) - r` for uniform. For per-corner, select `r` by quadrant:
  `r.xy = (p.x > 0.0) ? r.xy : r.zw; r.x = (p.y > 0.0) ? r.x : r.y;`
- **BOLT:** ⚙️ **this is his head** — a rounded box, flatter on top.

### S8. Arc and pie
- **Kernel:** clamp the angle to a wedge, then take the distance to the arc's circle. Outside
  the wedge, distance to the nearest endpoint.
- **Do:** a progress ring. Animate the sweep with `u_time`.
- **Teaches:** angular clamping — the 1D `clamp` you already know, applied to `atan`.

### S9. Capsule *(= The 50 #13, plus one line)*
- **Kernel:** `sdSegment(p, a, b) - r`.
- **Teaches:** *every* stroke is a capsule. Subtracting from an unsigned distance is what makes
  a line into a shape.
- **BOLT:** ⚙️ **his antenna and his arms.**

### S10. Heart, moon, cross
- **Do:** the fun set. Heart from a piecewise field; moon from two circles subtracted; cross
  from the union of two boxes (and then the *exact* cross, which handles the inner corners).
- **Teaches:** the inner corners of a cross are where cheap SDFs break. Look at the contours.
- **Done when:** the cross's contour lines are rounded at the inner corners, not square.

### S11. Horseshoe / ring segment
- **Do:** combine S8's angular clamp with S9's capsule.
- **Teaches:** composing two techniques into one primitive — the pattern for everything in
  Movement 2.

### S12. **BUILD — BOLT's head**
- **Do:** compose S7 (head), S4 (visor, subtracted then re-added darker), S9 (antenna), and a
  small circle (antenna tip). One field. One `aa()`. Flat grey.
- **Trap:** the temptation to give each part its own colour immediately. Don't. Flat grey,
  silhouette only. **If it doesn't read as a head in pure black, no colour will save it.**
- **Done when:** I have a `float sdHead(vec2 p)` returning one field, and the silhouette is
  recognisable at 64×64 pixels.
- 📸 **Screenshot it.**

---

## Movement 2 — The operator algebra (S13–S22)
*Venue: Book of Shaders editor. BOLT gains: his body.*

### S13. Boolean refresher *(= The 50 #10)*
- `min` = union, `max` = intersect, `max(a,-b)` = subtract. Tick both.

### S14. **Smooth minimum — the most important operator in this file**
- **Kernel (polynomial smin, iq):**
```glsl
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(b - a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0 - h);
}
```
- **Teaches:** `min` welds two shapes with a crease. `smin` welds them with a **fillet**. This
  single function is the difference between a diagram and a body.
- **Do:** two circles, sliding past each other, at `k = 0.0, 0.05, 0.2, 0.5`. Watch them merge
  like mercury.
- **Trap:** `smin` requires both inputs to be **true distances**. Feed it a bound (S1a) and the
  blend warps. This is why S1 mattered.
- **Read:** [iq — smooth minimum](https://iquilezles.org/articles/smin/).
- **BOLT:** ⚙️ **this is how the neck joins the head to the body** without a visible seam.

### S15. Smooth max and smooth subtraction
- **Kernel:** `smax(a,b,k) = -smin(-a,-b,k)`; `ssub(a,b,k) = smax(a,-b,k)`.
- **Do:** carve a smooth groove into a box. Compare to the hard `max(a,-b)`.
- **Teaches:** the same negation identity from The 50 #10, now in the smooth world.

### S16. Onion — shells
- **Kernel:** `abs(d) - t` (you know this as "ring"), applied to *any* shape.
- **Do:** onion the head from S12. Then onion it twice: `abs(abs(d) - t1) - t2`.
- **Teaches:** the ring trick is not circle-specific. It's an operator on fields.

### S17. Rounding and inflation
- **Kernel:** `d - r` inflates any shape by `r`, rounding every convex corner.
- **Do:** round the cross from S10 progressively until it becomes a disc.
- **Teaches:** you never need a "rounded" variant of a primitive. One subtraction does it.

### S18. Elongation
- **Kernel:** `vec2 q = p - clamp(p, -h, h); return sdCircle(q, r);` — stretches a primitive
  along an axis **without** distorting the distance field.
- **Teaches:** the wrong way (`sdCircle(p * vec2(1.0, 0.5), r)`) breaks the Lipschitz condition
  from S5. The clamp way doesn't.
- **Do:** both, side by side, with contours. The difference is stark.

### S19. Mirror and fold *(= The 50 #19)*
- **BOLT:** ⚙️ he is symmetric. Build **half** of him and fold. Half the code, guaranteed symmetry.

### S20. Finite repetition
- **Kernel:** `p.x -= spacing * clamp(round(p.x/spacing), -limit, limit);`
- **Teaches:** infinite `fract` repetition (The 50 #17) tiles forever. This one gives you
  exactly N copies — which is what fingers, teeth, ribs and vents need.
- **BOLT:** ⚙️ **the vent slots on his chest panel.**

### S21. Displacement — roughening a field
- **Kernel:** `d + amplitude * sin(freq*p.x) * sin(freq*p.y)`
- **Teaches:** adding *anything* to a field deforms the surface. Also breaks Lipschitz, so keep
  the amplitude small — and note this is the 2D rehearsal for The 50 #46's refraction.
- **Do:** a wobbly blob. Then a bolt-head with a knurled edge.

### S22. **BUILD — BOLT's body**
- **Do:** rounded-box torso (S7), `smin`-welded neck to the head from S12 (S14), a subtracted
  chest panel (S15), vent slots (S20), two capsule arms (S9), all mirrored (S19).
- **Done when:** `float sdBolt(vec2 p)` returns one field for the entire character, and there
  is not a single visible seam where two parts meet.
- **Trap:** if you find yourself writing `min(min(min(min(...))))` six levels deep, stop and
  give each body part its own named function. The composition should read like anatomy.
- 📸 **Screenshot it.** This is BOLT's silhouette, finished.

---

## Movement 3 — One field, many spends (S23–S32)
*Venue: Book of Shaders editor. BOLT gains: his eyes. **This is the "colouring" movement.***

> **The rule this movement exists to prove:** house rule 4 — *one field, many masks.* BOLT is
> now a single `float`. Every visual property below is derived from that same float. You will
> not write a second shape function in this entire movement.

### S23. Fill
- **Kernel:** `float fill = aa(d);`
- Trivial, but it's the baseline for the nine that follow. Render it. Move on.

### S24. Strokes — outer, inner, centred
- **Kernel:** centred `aa(abs(d) - w)`; outer `aa(abs(d - w) - w)`; inner `aa(abs(d + w) - w)`.
- **Do:** all three on BOLT at once, in three colours. Notice they land in different places.
- **Teaches:** "stroke alignment" in design tools is literally this offset. Now you know why
  it exists.

### S25. Glow
- **Kernel:** `float glow = exp(-max(d, 0.0) * k);`
- **Do:** compare against `1.0/(1.0 + d*k)` and against `1.0 - smoothstep(0.0, r, d)`.
- **Teaches:** `exp` falls off the way light does. The reciprocal never quite reaches zero and
  produces a muddy halo; `smoothstep` has a hard outer edge that reads as a sticker.
- **Trap:** `max(d, 0.0)` — without it the glow keeps growing *inside* the shape and blows out.
- **BOLT:** ⚙️ **his eyes glow.** Save this.

### S26. Drop shadow
- **Kernel:** `float sh = aa_soft(sdBolt(p - offset), blur);` drawn *before* the fill.
- **Teaches:** a shadow is the same field, translated, with a wider smoothstep. No blur pass,
  no second render, no extra cost.
- **Do:** animate the light angle and watch the shadow swing. Two lines.

### S27. Inner shadow
- **Kernel:** the same offset field, but `* fill` to clip it inside the shape, and inverted.
- **Teaches:** clipping by multiplication. Masks multiply; that's the whole compositing model.

### S28. Gradient along the field
- **Kernel:** `vec3 c = pal(d * 4.0);` — the distance itself drives the colour.
- **Do:** apply to BOLT. The colour follows his contours, hugging every curve.
- **Teaches:** this is impossible in a vector tool and free here. It's one of the things only
  shaders can do.

### S29. Gradient along a direction
- **Kernel:** `float t = dot(p, normalize(vec2(0.3, 1.0))) * 0.5 + 0.5;`
- **Do:** a linear gradient fill on BOLT's body. Then a radial one (`length(p - focus)`).
- **Teaches:** the domain stage returns. A gradient is just another field.

### S30. Gradient along the field's normal
- **Kernel:** `vec2 n = normalize(grad(sdBolt, p));` then colour by `n.y`.
- **Teaches:** the field has a *direction* as well as a magnitude. Surfaces facing up get one
  colour, surfaces facing down get another. **This is fake lighting, and you just invented it
  by accident.** Movement 4 makes it deliberate.
- **Dependency:** ⚠️ this needs the central-difference trick. Do **The 50 #42** first if you
  haven't.

### S31. Contour lines
- **Kernel:** `aa(abs(fract(d * 10.0) - 0.5) - 0.02)`
- **Do:** overlay contours on BOLT at 10% opacity. It looks like a technical drawing.
- **Teaches:** the diagnostic you should reach for whenever a shape misbehaves. Uneven contour
  spacing = a broken SDF.

### S32. **BUILD — BOLT's eyes, and the compositing discipline**
- **Do:** two eye discs. Each gets: a dark socket (inner shadow, S27), a bright iris (radial
  gradient, S29), a glow (S25), a specular dot (a tiny offset circle), and a thin outer ring
  (S24). Five spends, and the eye field is **one** `length(p - eyePos) - r`.
- **Then:** composite the whole character in strict z-order, back to front:
  `col = mix(col, layerColour, layerMask)` — one line per layer, statement order = z-order.
- **Trap:** if any layer needs to go behind something already drawn, you reorder statements.
  You do **not** add an `if`. Painter's algorithm, always.
- **Done when:** BOLT has eyes that look wet.
- 📸 **Screenshot it.**

---

## Movement 4 — Materials & fake lighting (S33–S42)
*Venue: Book of Shaders editor. BOLT gains: a shell you want to touch.*

> **The idea:** a 2D SDF has a gradient. A gradient is a 2D vector. Bolt a `z` onto it and you
> have a **normal** — a fake one, for a surface that doesn't exist. Every lighting model then
> works, unmodified. No geometry. No raymarching. This movement is why S30 felt like an accident.

### S33. The fake normal *(depends on The 50 #42)*
- **Kernel:**
```glsl
vec2 grad(vec2 p) {
    float e = 1.0 / u_resolution.y;
    return vec2(sdBolt(p + vec2(e,0.0)) - sdBolt(p - vec2(e,0.0)),
                sdBolt(p + vec2(0.0,e)) - sdBolt(p - vec2(0.0,e))) / (2.0*e);
}
vec3 fakeNormal(vec2 p, float bevel) {
    return normalize(vec3(-grad(p) * bevel, 1.0));
}
```
- **Teaches:** `bevel` controls how "rounded" the fake surface is. Low = flat sticker.
  High = a heavily chamfered edge.
- **Do:** render the normal as RGB. BOLT looks like an embossed relief.
- **Trap:** the gradient is only meaningful *near* the boundary. Deep inside a large shape it
  goes to zero and the normal points straight at you — which is correct, and is why the
  centre of a shape looks flat.

### S34. Lambert
- **Kernel:** `float diff = max(dot(n, normalize(vec3(0.4, 0.6, 0.7))), 0.0);`
- **Do:** animate the light direction around BOLT. He gains volume instantly.

### S35. Specular / gloss
- **Kernel:** `float spec = pow(max(dot(n, halfVector), 0.0), shininess);`
- **Do:** one shape, five shininess values (4, 16, 64, 256, 1024) in a row.
- **Teaches:** exponent = tightness, multiplier = brightness. Confusing them is the #1 cause
  of a blown-out white blob.

### S36. Bevel and emboss
- **Kernel:** restrict the lighting to a band near the edge — `float band = 1.0 - smoothstep(0.0, w, -d);`
  then `n = fakeNormal(p, bevel) * band`.
- **Teaches:** the 2003 Photoshop layer style, derived from first principles. It's a normal
  that only exists within `w` of the boundary.
- **Do:** a button. Then invert the light to make it pressed. That's your whole UI skeuomorphism.

### S37. Rim light
- **Kernel:** `float rim = pow(1.0 - abs(n.z), 3.0);`
- **Teaches:** edges facing away from the viewer catch light from behind. One line, and BOLT
  suddenly separates from his background.
- **Do:** tint the rim a complementary colour to the key light. Instant "3D render" feel.

### S38. Glass
- **Do:** (a) offset the *background* lookup by the normal inside the shape — refraction, the
  same idea as The 50 #46 but you generate the background procedurally; (b) a Fresnel edge:
  `pow(1.0 - abs(n.z), 5.0)`; (c) a slight tint that deepens with thickness (`-d`).
- **Teaches:** thickness is available for free — it's `-d`, the interior distance.

### S39. Metal
- **Kernel:** a fake environment — `vec3 env = pal(n.y * 0.5 + 0.5);` sampled by the normal.
- **Teaches:** metal has no diffuse term, only reflection. Sharp banding in the environment is
  what makes it read as chrome rather than grey plastic.

### S40. Plastic, matte, paper
- **Do:** the same shape three times, changing only: specular strength, shininess, and whether
  a fine noise perturbs the normal.
- **Teaches:** materials are **parameter sets**, not different code paths.

### S41. Faked ambient occlusion
- **Kernel:** `float ao = smoothstep(0.0, aoRadius, -d);` — darken where the interior distance
  is small, i.e. near edges and in crevices.
- **Teaches:** the cheapest possible AO. In 3D (S65) you march for it; in 2D the field already
  told you.

### S42. **BUILD — BOLT's shell**
- **Do:** a materials sheet first: **one shape, nine materials, in a 3×3 grid.** Then pick
  two and apply them — glossy white plastic for the shell, dark brushed metal for the trim
  and antenna. Add rim light, AO in the joints, and a soft drop shadow on the ground.
- **Done when:** BOLT looks like an object that exists, photographed, rather than a drawing.
- **Trap:** it will be tempting to keep adding. Stop at two materials plus rim plus AO. A
  third material reads as noise.
- 📸 **Screenshot it.** Compare against the S12 screenshot. This is the whole movement's payoff.

---

## Movement 5 — Composition & colour (S43–S50)
*Venue: Book of Shaders editor. BOLT gains: a world, and v1 ships.*

> **The shift:** Movements 1–4 were about one object. This is about the picture it lives in.
> It's the least "technical" movement here and the one that most determines whether the result
> looks good.

### S43. Z-order as statement order
- **Do:** build a five-layer scene (sky, far hills, near hills, ground, BOLT) with a single
  `mix` chain. Then reorder the lines and watch the depth change.
- **Teaches:** the painter's algorithm. There is no z-buffer. Order *is* depth.

### S44. The silhouette test
- **Do:** render BOLT and the whole scene as **pure black on white**. Then shrink the browser
  to 200px.
- **Teaches:** the industry's oldest character-design test. If the black shape doesn't read,
  no amount of Movement 4 will fix it. Go back and change the geometry.
- **Done when:** I can identify BOLT from his silhouette alone at 64px.

### S45. Value before hue *(extends The 50 #33)*
- **Do:** build the entire scene in greyscale. Get it right. *Then* add colour.
- **Teaches:** if the image works in greyscale, colour is decoration. If it doesn't, colour is
  camouflage. Squint at it — the value groups should separate cleanly.

### S46. Palettes, properly *(extends The 50 #31)*
- **Do:** drive the whole scene from **one** `pal(t)` function (iq's cosine palette). Every
  colour in the image is a sample of one curve.
- **Teaches:** why images from a single palette function feel coherent, and ad-hoc `vec3`
  literals never do.
- **Try:** shift the palette's `d` phase with `u_time` for a day/night cycle. One uniform.

### S47. Depth — atmosphere, scale, overlap
- **Kernel:** `col = mix(col, fogColour, 1.0 - exp(-depth * density));`
- **Do:** three hill layers, each lower-contrast, lighter, and bluer than the one in front.
- **Teaches:** the three depth cues you get for free in 2D — atmospheric perspective, relative
  scale, and overlap. No perspective projection required.

### S48. Layout and negative space
- **Do:** place BOLT on a thirds intersection rather than dead centre. Add a horizon. Leave
  space in the direction he's facing.
- **Teaches:** the frame is part of the composition. Centring is a decision, usually the wrong one.

### S49. The full scene
- **Do:** sky gradient, sun/moon, three hill layers, ground with S21 displacement, a few
  scattered rocks via S20 finite repetition, and BOLT standing in it.
- **Trap:** performance. You are now evaluating thirty SDFs per pixel. If the editor chugs,
  that's real and it's the lesson — this is why games use geometry.

### S50. **BUILD — BOLT v1**
- **Do:** finish it. Static, composed, lit, coloured, in a world. No animation yet.
- **Done when:** it's a picture I'd put on a wall, and there is not a single `texture2D` in it.
- 📸 **Screenshot it.** Halfway.

---

## Movement 6 — Rigging by uniform (S51–S58)
*Venue: Book of Shaders editor. BOLT gains: a life.*

> **The idea you're actually learning:** animation is not a feature you add. It's what happens
> when every magic number in your shader becomes a named parameter and something drives it.

### S51. Parameterize everything
- **Do:** hunt down every literal in `bolt.frag` and promote it to a named constant. Head
  width, neck blend `k`, eye radius, arm length, shoulder position — all of it.
- **Teaches:** the boring rung that makes the next seven possible.
- **Done when:** changing one constant changes BOLT's proportions without breaking him.

### S52. The pose struct
- **Kernel:**
```glsl
struct Pose {
    float headTilt;    // radians
    float armL, armR;  // shoulder angles
    float eyeOpen;     // 0 = shut, 1 = open
    vec2  look;        // where the pupils point, -1..1
    float breathe;     // 0..1, drives torso scale
};
float sdBolt(vec2 p, Pose q) { ... }
```
- **Teaches:** separating *what he is* from *what he's doing*. The shape function stops being
  a constant and becomes a function of state.
- **Trap:** GLSL ES 1.0 structs can't have default values and can't be returned from some
  drivers cleanly. Keep them as arguments, not return values.

### S53. Hierarchical transforms
- **Do:** the forearm follows the elbow follows the shoulder follows the torso. Implement as
  nested domain transforms applied right-to-left.
- **Teaches:** a transform *stack*, the 2D version of a skeleton. Uses The 50 #15's mat2 and
  its inversion rule — to rotate a limb, you rotate the domain by the **negative** angle.
- **Done when:** rotating the shoulder carries the forearm and hand with it, correctly.

### S54. Easing and springs
- **Kernel:** `float spring(float t, float f, float d) { return 1.0 - exp(-d*t) * cos(f*t); }`
- **Do:** move BOLT's arm between two poses with (a) linear, (b) smoothstep, (c) a spring that
  overshoots and settles.
- **Teaches:** the overshoot is what makes motion read as physical. Uses The 50 #4's shaping
  gallery and the same damped-oscillator maths as The 50 #44's ripple — **same equation, and
  worth noticing that.**

### S55. Idle — breathing and sway
- **Do:** three sine waves at incommensurate frequencies (e.g. 0.7, 1.1, 1.9 Hz) driving
  torso scale, head tilt and arm sway.
- **Teaches:** if the frequencies share a common factor, the loop is visible and he looks
  mechanical. Incommensurate frequencies never repeat.
- **Done when:** watching him for 30 seconds, I can't spot the loop.

### S56. Blink — a timed, non-periodic event
- **Kernel:** `float blink = 1.0 - exp(-pow((fract(t/period + hash) )*8.0, 2.0));` — or cleaner:
  drive `eyeOpen` from a short packet triggered on a hashed schedule.
- **Teaches:** **an event, not a cycle.** This is the same travelling-packet envelope as The 50
  #44's ripple, applied to time instead of radius. Third appearance of that maths.
- **Trap:** a sine-driven blink looks like he's falling asleep. A blink is fast-shut,
  fast-open, long-wait. Asymmetric.

### S57. Touch reaction
- **Kernel:** `q.look = clamp((u_mouse/u_resolution * 2.0 - 1.0 - bolt.pos) * 2.0, -1.0, 1.0);`
- **Do:** pupils track the cursor. Then add a lagged head turn (`look` filtered through S54's
  spring, so the head follows the eyes a beat later).
- **Teaches:** the lag is the whole trick. Instantaneous tracking looks dead; a delay looks alive.
- **Done when:** he feels like he's noticed me.

### S58. **BUILD — BOLT v2**
- **Do:** idle + blink + look, all running at once, over the S50 scene. Add a reaction: when
  the cursor gets close, he startles (a spring on the whole body) and his eyes widen.
- **Done when:** I show someone, and they move the mouse to see what he does.
- 📸 **Screenshot it** — and record a GIF this time.
- 🎉 **This is the goal you actually asked for.** Everything after is the reopened scope.

---

## Movement 7 — The third dimension (S59–S70)
*Venue: **Shadertoy** from here. BOLT gains: solidity.*

> **Why the venue changes.** GLSL ES 1.0 (the editor) requires constant loop bounds and no
> `discard`-free early exit patterns, and a 64-step march at full resolution will crawl in a
> WebGL1 canvas. Shadertoy gives you GLSL ES 3.0, a resolution slider, and `iMouse` for the
> camera. Everything you wrote in Movements 1–6 still applies — you are changing dimension,
> not language.
>
> **The honest framing.** This is a **different pipeline**, not an extension of the last six
> movements. 2D was `domain → field → mask → colour`. 3D is `ray → march → surface → normal →
> BRDF`. The field algebra (S13–S22) carries over completely and unchanged. Nothing else does.

### S59. The raymarch loop
- **Kernel:**
```glsl
float march(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < 96; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < 0.001 || t > 50.0) break;
        t += d;                      // THE idea: step by the distance. It's guaranteed safe.
    }
    return t;
}
```
- **Teaches:** **sphere tracing.** The SDF tells you the radius of a sphere you're guaranteed
  not to hit anything inside. So step that far. Repeat. That's the entire algorithm.
- **Do:** visualise the step count as colour. Silhouette edges glow hot — that's where the
  march grazes the surface and takes hundreds of tiny steps.
- **Trap:** this is also why glancing angles are expensive, and why every optimisation in this
  field is about that.
- **Read:** [iq — Raymarching SDFs](https://iquilezles.org/articles/raymarchingdf/).

### S60. 3D primitives
- **Do:** sphere (`length(p) - r`), box (the 3D twin of S6), torus, capsule, plane, cylinder.
- **Teaches:** they are **the same formulas with a third component**. `sdSphere` is `sdCircle`.
  This is the moment Movement 1 pays off entirely.

### S61. Normals by central differences *(= The 50 #42 in 3D)*
- **Kernel:**
```glsl
vec3 normal(vec3 p) {
    vec2 e = vec2(0.0005, 0.0);
    return normalize(vec3(map(p+e.xyy) - map(p-e.xyy),
                          map(p+e.yxy) - map(p-e.yxy),
                          map(p+e.yyx) - map(p-e.yyx)));
}
```
- **Teaches:** identical to S33 and The 50 #42, one axis wider. **Third time you've met this
  trick** — that repetition is the point.

### S62. Lighting in 3D
- **Do:** Lambert, then Blinn-Phong, then a three-point rig (key, fill, rim).
- **Teaches:** everything from S34–S37 transfers unchanged. The only difference is that the
  normal is now real instead of faked.

### S63. Hard shadows
- **Kernel:** from the hit point, march a second ray toward the light. If it hits anything
  before reaching the light, you're in shadow.
- **Teaches:** ⚠️ **your parked shadows thread lands here.** A shadow is a **visibility query**,
  not an object. You were given this framing on 2026-09-27 and set it aside. This is it.
- **Trap:** start the shadow ray slightly off the surface (`p + n * 0.01`) or it immediately
  self-intersects and everything goes black. This is "shadow acne".

### S64. Soft shadows
- **Kernel:** `res = min(res, k * h / t);` accumulated along the shadow march.
- **Teaches:** the penumbra comes from **how close the ray got** to an occluder, divided by
  how far it travelled. The other half of the 2026-09-27 framing.
- **Read:** [iq — soft shadows](https://iquilezles.org/articles/rmshadows/).
- **Done when:** contact shadows are sharp and distant ones are soft, with no extra rays.

### S65. Ambient occlusion by marching
- **Kernel:** sample `map()` at 5 points along the normal; compare each to the distance you
  moved. Where the field is smaller than expected, something is nearby → occlude.
- **Teaches:** the real version of S41's cheat. Compare them side by side.

### S66. The operator algebra in 3D
- **Do:** re-do S14–S18 in 3D — `smin`, `smax`, onion, round, elongate.
- **Teaches:** **this is where `smin` really earns it.** A `smin`-welded 3D joint with proper
  lighting looks organic in a way nothing in 2D quite did.
- **Do:** rebuild BOLT's head-to-neck join in 3D. Compare with S22.

### S67. Domain repetition in 3D
- **Kernel:** `p = mod(p + 0.5*s, s) - 0.5*s;`
- **Do:** an infinite field of BOLTs. It costs the same as one.
- **Teaches:** the single most magical property of SDF rendering. There is no instancing,
  no draw calls — repetition is a domain operation.

### S68. Materials and a sky
- **Do:** a `map()` that returns material ID alongside distance (`vec2(d, id)`); a gradient
  sky; a ground plane with a checker; fog by distance.
- **Teaches:** how a real raymarched scene is organised. The `vec2(d, id)` return is the
  standard idiom.

### S69. The camera
- **Kernel:**
```glsl
vec3 ro = vec3(sin(a)*dist, height, cos(a)*dist);
vec3 f = normalize(target - ro), r = normalize(cross(vec3(0,1,0), f)), u = cross(f, r);
vec3 rd = normalize(uv.x*r + uv.y*u + fov*f);
```
- **Do:** orbit with `iMouse`. Then a dolly zoom (change `dist` and `fov` together).
- **Teaches:** the look-at basis. Three cross products and you have a camera.

### S70. **BUILD — BOLT v3**
- **Do:** rebuild BOLT in 3D. Same character, same proportions, same personality — sphere-traced,
  three-point lit, soft-shadowed, occluded, on a ground plane, orbitable with the mouse.
  Port the S52 pose struct so he still breathes and blinks.
- **Done when:** I can orbit around the same robot I drew flat in S12 and he still looks like himself.
- 📸 **Screenshot it.** Put the S12, S50 and S70 images side by side. That progression is the
  actual deliverable of this entire plan.

---

## Reference shelf

Short on purpose. Five that matter, three that are optional.

| Resource | For |
|---|---|
| ⭐ [iq — **Painting a Character with Maths**](https://www.youtube.com/watch?v=8--5LwHRhjk) | **Watch this before S1.** Inigo Quilez live-codes a 2D character from SDFs. It is literally this plan's endgame, performed. |
| ⭐ [iq — 2D distance functions](https://iquilezles.org/articles/distfunctions2d/) | Movement 1, all of it. The canonical list, all exact. |
| ⭐ [iq — smooth minimum](https://iquilezles.org/articles/smin/) | S14. The most important operator here. |
| ⭐ [The Art of Code (Martijn Steinrucken)](https://www.youtube.com/@TheArtofCodeIsCool) | Movements 4 and 7. Best paced video teaching of SDF materials and raymarching. |
| ⭐ [iq — Raymarching SDFs](https://iquilezles.org/articles/raymarchingdf/) + [soft shadows](https://iquilezles.org/articles/rmshadows/) | S59, S63–S64. |
| [iq — 3D distance functions](https://iquilezles.org/articles/distfunctions/) | S60, S66. The 3D twin of the 2D list. |
| [Electric Square — raymarching workshop](https://github.com/electricsquare/raymarching-workshop) | S59–S62 if the videos move too fast. Written, paced, with exercises. |
| [Maxime Heckel — Painting with Math](https://blog.maximeheckel.com/posts/painting-with-math-a-gentle-study-of-raymarching/) | S59. The gentlest raymarching on-ramp written. |

---

## Progress tracker

**Movement 1 — vocabulary → BOLT's head**
- [ ] S1 triangle ×3 · [ ] S2 n-gon · [ ] S3 star · [ ] S4 vesica ⚙️ · [ ] S5 egg/Lipschitz
- [ ] S6 box *(=#11)* · [ ] S7 rounded box ⚙️ · [ ] S8 arc/pie · [ ] S9 capsule ⚙️ *(=#13)*
- [ ] S10 heart/moon/cross · [ ] S11 horseshoe · [ ] **S12 BUILD: head** 📸

**Movement 2 — operators → BOLT's body**
- [ ] S13 booleans *(=#10)* · [ ] **S14 smin** ⚙️ · [ ] S15 smax/ssub · [ ] S16 onion
- [ ] S17 round · [ ] S18 elongate · [ ] S19 mirror ⚙️ *(=#19)* · [ ] S20 finite repeat ⚙️
- [ ] S21 displace · [ ] **S22 BUILD: body** 📸

**Movement 3 — spends → BOLT's eyes**
- [ ] S23 fill · [ ] S24 strokes ×3 · [ ] S25 glow ⚙️ · [ ] S26 drop shadow
- [ ] S27 inner shadow · [ ] S28 gradient along field · [ ] S29 directional gradient
- [ ] S30 gradient along normal ⚠️ · [ ] S31 contours · [ ] **S32 BUILD: eyes** 📸

**Movement 4 — materials → BOLT's shell**
- [ ] S33 fake normal ⚠️ · [ ] S34 lambert · [ ] S35 specular · [ ] S36 bevel/emboss
- [ ] S37 rim light · [ ] S38 glass · [ ] S39 metal · [ ] S40 plastic/matte/paper
- [ ] S41 fake AO · [ ] **S42 BUILD: shell + materials sheet** 📸

**Movement 5 — composition → BOLT's world**
- [ ] S43 z-order · [ ] S44 silhouette test · [ ] S45 value before hue · [ ] S46 one palette
- [ ] S47 atmospheric depth · [ ] S48 layout · [ ] S49 full scene · [ ] **S50 BUILD: BOLT v1** 📸

**Movement 6 — rigging → BOLT lives**
- [ ] S51 parameterize · [ ] S52 pose struct · [ ] S53 hierarchy · [ ] S54 easing/springs
- [ ] S55 idle · [ ] S56 blink · [ ] S57 look-at · [ ] **S58 BUILD: BOLT v2** 📸🎉

**Movement 7 — 3D** *(venue: Shadertoy)*
- [ ] S59 march loop · [ ] S60 3D primitives · [ ] S61 3D normals · [ ] S62 3D lighting
- [ ] S63 hard shadows · [ ] S64 soft shadows · [ ] S65 marched AO · [ ] S66 3D operators
- [ ] S67 3D repetition · [ ] S68 materials/sky · [ ] S69 camera · [ ] **S70 BUILD: BOLT v3** 📸

⚙️ = a BOLT part comes from this rung · ⚠️ = needs The 50 #42 first · 📸 = screenshot

---

## The fast lane

If nine months turns out to be nine months, this is the subset that still gets you a
character. Twelve rungs, ~1 month.

| Rung | Why it survives the cut |
|---|---|
| S7 rounded box | 80% of BOLT is rounded boxes |
| S9 capsule | The other 15% |
| **S14 smin** | Without it he's a diagram, not a body |
| S19 mirror | Halves the work, guarantees symmetry |
| S22 BUILD body | The silhouette |
| S24 strokes | The cheapest possible "designed" look |
| S25 glow | The eyes |
| **S33 fake normal** | The single line that gives him volume |
| S34 + S35 lambert + spec | Lighting, minimum viable |
| S44 silhouette test | The only quality gate that matters |
| S45 value before hue | Stops the colour going muddy |
| **S58 BUILD BOLT v2** | The thing you actually wanted |

Skip Movement 7 entirely in the fast lane. 3D is a second curriculum wearing this one's coat,
and it will still be there next year.

---

## The three that carry this plan

| Rung | Why |
|---|---|
| **S14** `smin` | The difference between assembled parts and a single creature |
| **S33** fake normal | Turns a flat SDF into a lit object — the entirety of Movement 4 |
| **S44** silhouette test | The only rung that can tell you the previous 43 were wasted |
