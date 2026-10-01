# Refactoring the `y = pow(x, 5.0)` graph into the four shading stages

The original (Book of Shaders ch. 5):

```glsl
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float plot(vec2 st, float pct){
  return  smoothstep( pct-0.02, pct, st.y) -
          smoothstep( pct, pct+0.02, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;

    float y = pow(st.x,5.0);

    vec3 color = vec3(y);

    float pct = plot(st,y);
    color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);

    gl_FragColor = vec4(color,1.0);
}
```

## The refactor

```glsl
// graph-4stage.frag
// Refactor of Book of Shaders ch.5  "y = pow(x, 5.0)"  into four stages:
//   1 DOMAIN  ->  2 FIELD  ->  3 MASK  ->  4 COLOUR
// Same picture as the original, better factored (plus constant pixel thickness).
// Run: glslViewer graph-4stage.frag

#ifdef GL_ES
#extension GL_OES_standard_derivatives : enable   // must precede `precision`
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

const float LINE_PX = 1.5;   // curve half-thickness, in PIXELS

// ============================================================ 1. DOMAIN
// Pixel coords -> graph space. 0..1 on both axes, y-up.
// Deliberately NOT aspect-corrected: a graph should fill its box.
// Only round things (circles) need the aspect fix.
vec2 domain() {
    return gl_FragCoord.xy / u_resolution;
}

// ============================================================ 2. FIELD
// The function being graphed. ONE place. This is the only line you edit
// to plot something else.
float curve(float x) {
    return pow(x, 5.0);
}

// Signed field: how far ABOVE the curve this pixel sits.
//   > 0 above   ==  0 on the curve   < 0 below
// Raw and unbounded on purpose: no threshold, no smoothing, no colour.
// Honest naming: this is a signed VERTICAL offset, not a true distance
// field. Stage 3 rescales it to screen units, which is the fix.
float fieldGraph(vec2 st) {
    return st.y - curve(st.x);
}

// ============================================================ 3. MASK
// field -> 0..1 coverage. The CALLER picks thickness and softness --
// that freedom is exactly what stage 2 bought by staying raw.

// A band centred on field == 0, `halfPx` pixels to each side.
float maskBand(float field, float halfPx) {
    // fwidth(field) = how much `field` changes from one pixel to the next.
    // Multiplying by it converts a PIXEL width into FIELD units, so the
    // line keeps constant screen thickness at any slope and any window size.
    float w = fwidth(field) * halfPx;
    return 1.0 - smoothstep(0.0, w, abs(field));
}

// Everything on the negative side of the field -- here, under the curve.
// Same field, second mask, zero extra geometry.
float maskBelow(float field) {
    float w = fwidth(field);
    return 1.0 - smoothstep(-w, w, field);
}

// ============================================================ 4. COLOUR
void main() {
    vec2  st    = domain();                   // 1
    float field = fieldGraph(st);             // 2
    float line  = maskBand(field, LINE_PX);   // 3
    float below = maskBelow(field);           // 3 -- free, same field

    // Stage 4 is the ONLY place vec3 appears.
    // Background = the function read as BRIGHTNESS (the original's vec3(y)).
    vec3 color = vec3(curve(st.x));

    color = mix(color, vec3(0.10, 0.15, 0.25), below * 0.35);  // tint below
    color = mix(color, vec3(0.00, 1.00, 0.00), line);          // the curve

    gl_FragColor = vec4(color, 1.0);
}
```

## Where each original line went

| Original | Stage | Became |
|---|---|---|
| `vec2 st = gl_FragCoord.xy/u_resolution;` | 1 | `domain()` |
| `float y = pow(st.x,5.0);` | 2 | `curve(x)` — isolated, now the only line you edit |
| *(implicit inside `plot`)* | 2 | **`fieldGraph()` — this is the part that didn't exist before** |
| `smoothstep(pct-0.02,...) - smoothstep(pct,...)` | 3 | `maskBand()`, with thickness now a caller argument |
| `vec3 color = vec3(y);` | 4 | `vec3(curve(st.x))` |
| `(1.0-pct)*color + pct*vec3(0,1,0)` | 4 | `mix(color, green, line)` |

## What the refactor actually changed

- **`plot()` is gone**, split into two functions. It was doing stage 2 *and* stage 3 at once, which is why thickness was un-adjustable.
- **The band is now specified in pixels**, not in graph units. `fwidth` does the conversion. This fixes both problems at once:
  - the line no longer **thins out** where `pow(x,5)` steepens near the right edge
  - the line no longer **changes thickness when you resize** the window
- **`below` is free.** One extra line, no new geometry — that's the payoff of stage 2 returning a raw signed number instead of a finished mask. With the old `plot()` this was impossible without writing a second function.
- **`float` everywhere until line 4.** Grep the file: no `vec3` appears above the `COLOUR` banner.

## Two things to watch

- **`#extension GL_OES_standard_derivatives` is WebGL1-only boilerplate**, and the Book of Shaders online editor may not honour it. If `fwidth` errors there, drop in this stage-3 replacement — everything else stays identical:
  ```glsl
  float maskBand(float field, float halfPx) {
      float w = 0.01;                                // fixed, in FIELD units
      return 1.0 - smoothstep(0.0, w, abs(field));
  }
  float maskBelow(float field) {
      return 1.0 - smoothstep(-0.002, 0.002, field);
  }
  ```
  `glslViewer` and WebGL2 both support `fwidth` fine. AGSL has it too.
- **`fieldGraph` is not a real distance field.** It's a vertical offset, so `field = 0.1` doesn't mean "0.1 away" in any geometric sense. That's tolerable here only because `fwidth` rescales it per-pixel. For real SDF work (`length(p) - r`) the field *is* true distance and the rescale is optional.

## Try it

- Change `curve()` to `return sin(x * 6.2831) * 0.5 + 0.5;` — nothing else moves, and you get steep slopes both ways to prove the `fwidth` fix.
- Change `LINE_PX` to `4.0` — the old code couldn't do this without editing the mask function.
- Comment out the `below` mix — confirms the two masks are genuinely independent consumers of one field.
