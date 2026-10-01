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
