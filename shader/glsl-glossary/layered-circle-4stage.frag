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
