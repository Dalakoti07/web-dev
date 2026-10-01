# Explaining `layered-circle.frag` through the four shading stages

The shader being explained:

```glsl
// layered-circle.frag
// Demonstrates: layering in a fragment shader is repeated mix().
// Run: glslViewer layered-circle.frag
//  or: paste into https://editor.thebookofshaders.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;   // canvas size in pixels
uniform vec2  u_mouse;        // cursor in pixels (unused)
uniform float u_time;         // seconds since start (unused)

void main() {
    // ---- coordinates -------------------------------------------------
    // st: 0..1 across the canvas. Good for the background gradient,
    //     but it inherits the window's aspect ratio.
    vec2 st = gl_FragCoord.xy / u_resolution;

    // pos: aspect-corrected copy, so circles stay circles on a
    //      non-square window. x now runs 0 .. (width/height).
    float aspect = u_resolution.x / u_resolution.y;
    vec2  pos    = vec2(st.x * aspect, st.y);
    vec2  center = vec2(0.5 * aspect, 0.5);

    // ---- LAYER 0 - background ---------------------------------------
    // The base. No mask: everything else sits on top of this.
    vec3 color = mix(vec3(0.10, 0.10, 0.20),   // dark blue, bottom
                     vec3(0.40, 0.10, 0.30),   // plum, top
                     st.y);

    // ---- shared shape data ------------------------------------------
    float d = distance(pos, center);   // distance from the centre

    // ---- LAYER 1 - filled disc --------------------------------------
    // Reversed smoothstep edges: 1.0 inside, 0.0 outside, soft in between
    float disc = smoothstep(0.30, 0.29, d);
    color = mix(color, vec3(0.90, 0.70, 0.20), disc);

    // ---- LAYER 2 - ring highlight -----------------------------------
    // Outer mask minus inner mask = a band. Mask algebra, before colour.
    float ring = smoothstep(0.30, 0.29, d) - smoothstep(0.26, 0.25, d);
    // Multiply the MASK to set opacity - never the colour.
    color = mix(color, vec3(1.0), ring * 0.6);

    // ---- output ------------------------------------------------------
    gl_FragColor = vec4(color, 1.0);
}
```

## What it draws

- A vertical gradient (dark blue → plum), a gold disc centred on it, and a white ring inset just inside the disc's edge at 60% opacity.
- Three layers, three `mix` calls, one variable.

## Where each line's stage is — and why they're tangled

- **Stage 1** is lines 17–24 (`st`, `aspect`, `pos`, `center`).
- **Stage 4 starts at line 28** (`vec3 color = mix(...)`) — *before stage 2 has happened*.
- **Stage 2** is line 34 (`float d = distance(...)`), sitting between two colour statements.
- **Stages 3 and 4 alternate** for the rest of the file.

The stages exist, but they're **interleaved rather than separated**. That ordering alone breaks the float-until-last rule: `vec3` appears 6 lines before the field does.

## Three real defects

**1. The field is distance to the *centre*, not to the *edge***
- `distance(pos, center)` is unsigned and knows nothing about the radius.
- Consequence: the radius has to be re-stated at **four literal sites** — `0.30`, `0.29`, `0.26`, `0.25`.
- Nothing in the code says *"the ring is 0.05 thick and hugs the inside of the edge"* — you have to reverse-engineer it by subtracting the magic numbers.
- `length(p) - r` moves the zero to the boundary. Then `d < 0` **means** inside, and every mask is written relative to 0.

**2. `smoothstep(0.30, 0.29, d)` is computed twice**
- Once as `disc` (line 36), again as the first term of `ring` (line 41). Byte-identical expression.
- Wasted ALU, but the worse problem is **coupling**: change the disc radius to `0.35` and the ring silently detaches, because the ring re-declares the radius instead of deriving from it.
- `ring` is really `disc - inner`. The code doesn't say so.

**3. Thickness and softness are in domain units**
- The `0.30 → 0.29` edge is a **0.01-unit** ramp. On a 500px canvas that's ~5px of blur; on a 1000px canvas, ~10px. The blur grows with the window.

## One thing it gets right

- **Two domains for two subjects.** The gradient reads uncorrected `st.y`; the circle reads aspect-corrected `pos`. That's the correct call and it's the thing most people get wrong — a single "fixed" domain either makes the circle an ellipse or stops the gradient from filling the canvas. Keep this.

## The four-stage version

```glsl
// layered-circle-4stage.frag
// Stages: 1 DOMAIN -> 2 FIELD -> 3 MASK -> 4 COLOUR
// Same picture as layered-circle.frag, restructured. Only visual delta:
// edges are ~1px soft instead of ~5px soft (fwidth instead of fixed 0.01).
// Run: glslViewer layered-circle-4stage.frag

#ifdef GL_ES
#extension GL_OES_standard_derivatives : enable   // fwidth; must precede `precision`
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

const float RADIUS  = 0.30;   // disc radius, in domain units (1.0 = canvas height)
const float RING_T  = 0.05;   // ring thickness, inset from the edge
const float RING_OP = 0.60;   // ring opacity

// ============================================================ 1. DOMAIN
// TWO domains on purpose - they answer different questions.

// Uncorrected 0..1. Only the vertical gradient reads this, and a gradient
// SHOULD stretch with the window.
vec2 domainScreen() {
    return gl_FragCoord.xy / u_resolution;
}

// Centred and aspect-corrected. Origin at the middle, one unit means the
// same in x and y. Round things MUST live here or they become ellipses.
vec2 domainCentred() {
    return (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
}

// ============================================================ 2. FIELD
// Signed distance to the circle's EDGE.
//   < 0 inside    == 0 on the edge    > 0 outside
// The original had distance(pos, center): distance to the CENTRE. That is
// unsigned and knows nothing about the radius, which is why the original
// needed four magic numbers (0.30 0.29 0.26 0.25) with the relationships
// between them left implicit. Subtracting r moves the zero to the edge, so
// every mask below is expressed relative to 0.
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

// ============================================================ 3. MASK
// One field, two masks. Thickness arrives as an argument.

// Filled interior. fwidth(d) = how much d changes per pixel, so the soft
// edge is exactly one pixel wide at any zoom or window size.
float maskFill(float d) {
    float w = fwidth(d);
    return smoothstep(w, -w, d);
}

// Band hugging the INSIDE of the edge, `t` thick.
// Literally maskFill minus a shrunken maskFill - the original's
// "outer mask minus inner mask", now stated in signed-field terms.
float maskInset(float d, float t) {
    return maskFill(d) - maskFill(d + t);
}

// ============================================================ 4. COLOUR
void main() {
    vec2 stretched = domainScreen();      // 1
    vec2 p         = domainCentred();     // 1

    float d = sdCircle(p, RADIUS);        // 2 - computed ONCE

    float fill = maskFill(d);             // 3
    float ring = maskInset(d, RING_T);    // 3 - same d, nothing recomputed

    // 4 - first vec3 in the file. Statement order is z-order.
    vec3 col = mix(vec3(0.10, 0.10, 0.20),   // dark blue, bottom
                   vec3(0.40, 0.10, 0.30),   // plum, top
                   stretched.y);
    col = mix(col, vec3(0.90, 0.70, 0.20), fill);
    col = mix(col, vec3(1.00),             ring * RING_OP);

    gl_FragColor = vec4(col, 1.0);
}
```

## Where each original line went

| Original | Stage | Became |
|---|---|---|
| `vec2 st = gl_FragCoord.xy / u_resolution;` | 1 | `domainScreen()` |
| `aspect` + `pos` + `center` (3 lines) | 1 | `domainCentred()` — one line, no `center` needed |
| `float d = distance(pos, center);` | 2 | `sdCircle(p, RADIUS)` — **now signed, zero at the edge** |
| `smoothstep(0.30, 0.29, d)` | 3 | `maskFill(d)` — width from `fwidth`, radius from the field |
| `smoothstep(0.30,0.29,d) - smoothstep(0.26,0.25,d)` | 3 | `maskInset(d, RING_T)` — reuses `maskFill`, no duplication |
| `vec3 color = mix(...)` (gradient) | 4 | unchanged, but **moved below** the field |
| the two `color = mix(...)` lines | 4 | unchanged — statement order still the z-order |
| `0.30 / 0.29 / 0.26 / 0.25` | — | `RADIUS` and `RING_T`, named |

## What changed — structure

- Zero functions → **five functions**, one per stage responsibility.
- `vec3` moved from line 28 to line 76. Nothing above the COLOUR banner produces colour.
- Four magic numbers → **two named constants**, with `RING_T` now explicitly a thickness rather than an implied difference.
- `smoothstep(0.30, 0.29, d)` evaluated **once** instead of twice.
- Ring is now **derived from** the fill (`maskFill(d) - maskFill(d+t)`), so changing `RADIUS` moves both together. The desync bug is gone by construction.
- `center` variable eliminated — a centred domain has its centre at the origin.

## What changed — visuals

- **One delta: edges are ~1px soft instead of ~5px soft.** `fwidth` gives per-pixel width; the original's `0.01` was a fixed domain-unit ramp. The disc and ring look crisper, and stay crisp at any window size.
- Everything else is pixel-identical: same radius (0.30 of canvas height), same centre, same 0.05 inset ring, same colours, same 0.6 opacity, same layer order.
- If you want the original's soft look back, swap `float w = fwidth(d);` for `float w = 0.005;` in `maskFill`.

## Try it

- Change `RADIUS` to `0.40` → **disc and ring move together.** In the original this needed four edits and the ring detached if you missed one.
- Change `RING_T` to `0.01` → a hairline inner ring. The original had no single knob for this.
- Add `col = mix(col, vec3(0.0), maskInset(d, 0.01));` after the ring → a black outline, third mask, same field, one line.
