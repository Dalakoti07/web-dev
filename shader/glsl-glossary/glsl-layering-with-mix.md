# Layering in fragment shaders is repeated `mix()`

> So **layering anything is just repeated `mix()`** — background, then shape, then highlight, each one a lerp weighted by its own coverage.

## What a normal drawing API does

- Canvas / Skia / HTML: you issue **draw calls in sequence**.
- Each call writes into a **framebuffer** — real memory that persists between calls.
- A later call paints **over** what's already there. The framebuffer remembers.
- "Layering" = the machinery of ordered writes into shared memory.

## Why a fragment shader can't do that

- You are computing **one pixel**, in isolation, in parallel with every other pixel.
- You **cannot read the framebuffer**. You don't know what any other pixel decided. There is no "already there".
- You get **one output value**, once, at the end.
- So there is no z-order, no painter's algorithm, no draw calls. That machinery simply doesn't exist.

## What replaces it

- A single **local variable**, `vec3 color`, that you overwrite as you go.
- Each "layer" is a pair: **a mask (float 0..1) and a colour**.
- One line per layer:
  ```glsl
  color = mix(color, layerColour, layerMask);
  ```
- **The order of your statements is the z-order.** That's the whole mechanism. Later statement = on top.

## Concrete build-up

```glsl
vec2 st = gl_FragCoord.xy / u_resolution;

// LAYER 0 — background. No mask; it's the base everything sits on.
vec3 color = mix(vec3(0.1, 0.1, 0.2),   // dark blue at the bottom
                 vec3(0.4, 0.1, 0.3),   // plum at the top
                 st.y);

// LAYER 1 — a filled circle.
float d      = distance(st, vec2(0.5));      // distance from centre
float circle = smoothstep(0.30, 0.29, d);    // 1 inside, 0 outside, soft edge
color = mix(color, vec3(0.9, 0.7, 0.2), circle);

// LAYER 2 — a white ring highlight, on top of the circle.
float ring = smoothstep(0.30, 0.29, d) - smoothstep(0.26, 0.25, d);
color = mix(color, vec3(1.0), ring * 0.6);   // *0.6 -> 60% opacity

gl_FragColor = vec4(color, 1.0);
```

- Three layers, **three `mix` calls**, one variable. No draw calls, no buffers.
- **Swap the LAYER 1 and LAYER 2 blocks** and the ring goes *under* the circle — which, since the circle's mask is 1 there, means it disappears. That's your z-order, and it's just statement order.

## The four things this buys you

- **The mask *is* the alpha.** `mix(color, X, 1.0)` = fully opaque X. `mix(color, X, 0.0)` = untouched.
- **Opacity is multiplying the mask**, never the colour. `ring * 0.6` gives a 60%-opaque ring. Multiplying the *colour* by 0.6 would just make it grey.
- **Occlusion is free.** A later `mix` with mask 1 completely replaces whatever was underneath. You never have to think about what's behind.
- **Mask algebra happens before colour.** Because masks are plain floats:
  - `maskA * maskB` → intersection
  - `max(maskA, maskB)` → union
  - `maskA - maskB` → cut-out (that's exactly how the ring above was built)
  - This is why `plot()` returns a `float` and not a `vec3`.

## The cost you accept

- **Every pixel runs every layer.** A pixel far outside the circle still evaluates `distance`, `smoothstep`, and the `mix` — the mix just happens to be a no-op at mask 0.
- There is **no culling and no early-out**. "Nothing is drawn here" costs the same as "something is drawn here".
- Consequence: shader cost scales with **number of layers × number of pixels**, flat, regardless of what's visible. Ten layers is ten times the work even if nine are invisible.
