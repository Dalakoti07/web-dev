// ============================================================
// THE LAB - paste the whole thing into editor.thebookofshaders.com
// Then only ever change MODE and the four f* functions.
//
//   MODE 0  GRAPH   float -> float    sin, pow, fract, smoothstep, ...
//   MODE 1  HEAT    vec2  -> float    length, distance, dot, ...
//   MODE 2  VECTOR  vec2  -> vec2     normalize, reflect, refract, ...
//   MODE 3  BOOL    vec2  -> bool     lessThan, any, all, not, ...
//
// Mouse is a live second operand in modes 1-3.
// ============================================================

#define MODE       0
#define USE_FWIDTH 0   // flip to 1 ONCE to find out if this editor supports it

#if USE_FWIDTH
#extension GL_OES_standard_derivatives : enable
#endif

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

#define PI  3.14159265359
#define TAU 6.28318530718

// ============================================================ 1. DOMAIN
// A graph must fill its box -> no aspect correction.
vec2 domainBox()     { return gl_FragCoord.xy / u_resolution; }
// Everything 2D is centred and aspect-correct -> round stays round.
vec2 domainCentred() { return (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y; }
vec2 mouseCentred()  { return (u_mouse         - 0.5 * u_resolution) / u_resolution.y; }

// ============================================================ 2. FIELD
// >>> THE ONLY LINES YOU EDIT. One slot per mode. <<<

float fScalar(float x) {           // MODE 0
    return x;
}

float fField(vec2 p, vec2 m) {     // MODE 1
    return length(p);
}

vec2 fVector(vec2 p, vec2 m) {     // MODE 2
    return normalize(p);
}

bool fBool(vec2 p, vec2 m) {       // MODE 3
    return all(lessThan(p, m));
}

// ============================================================ 3. MASK
// One pixel of softness if derivatives are available, a fixed width if not.
float edgeWidth(float field) {
#if USE_FWIDTH
    return fwidth(field);
#else
    return 0.004;
#endif
}

// Band straddling field == 0.
float maskBand(float field, float thick) {
    float w = edgeWidth(field) * thick;
    return 1.0 - smoothstep(0.0, w, abs(field));
}

// Contour lines every `spacing` units of v. Distance is measured in v units
// (not in sine units) so the lines stay visible without fwidth.
float maskContours(float v, float spacing) {
    float dv = abs(fract(v / spacing + 0.5) - 0.5) * spacing;
    return 1.0 - smoothstep(0.0, edgeWidth(v) * 1.2, dv);
}

// ============================================================ 4. COLOUR
void main() {
    vec3 col;

#if MODE == 0
    // ---------------------------------------------------- GRAPH
    vec2  st    = domainBox();
    float field = st.y - fScalar(st.x);

    float curve = maskBand(field, 1.5);
    float axes  = max(max(maskBand(st.y,       1.0), maskBand(st.y - 1.0, 1.0)),
                      max(maskBand(st.y - 0.5, 1.0), maskBand(st.x - 0.5, 1.0)));
    float strip = 1.0 - smoothstep(0.055, 0.060, st.y);

    col = vec3(0.07, 0.07, 0.10);
    col = mix(col, vec3(0.18, 0.18, 0.24), axes);
    col = mix(col, vec3(clamp(fScalar(st.x), 0.0, 1.0)), strip);
    col = mix(col, vec3(0.30, 1.00, 0.45), curve);

#elif MODE == 1
    // ---------------------------------------------------- HEAT
    vec2  p = domainCentred();
    vec2  m = mouseCentred();
    float v = fField(p, m);

    // Grey = positive, blue = negative. You can SEE the sign.
    col = (v < 0.0) ? vec3(0.10, 0.20, 0.55) * clamp(abs(v) * 2.0, 0.0, 1.0)
                    : vec3(clamp(v, 0.0, 1.0));
    col = mix(col, vec3(1.00, 0.85, 0.30), maskContours(v, 0.1));
    col = mix(col, vec3(1.00, 0.25, 0.25), maskBand(v, 2.0));
    col = mix(col, vec3(0.30, 1.00, 0.45), maskBand(length(p - m) - 0.02, 1.5));

#elif MODE == 2
    // ---------------------------------------------------- VECTOR
    vec2 p = domainCentred();
    vec2 m = mouseCentred();
    vec2 w = fVector(p, m);

    // R = x component, G = y component, B = magnitude. Grey means zero.
    col = vec3(0.5 + 0.5 * w.x, 0.5 + 0.5 * w.y, clamp(length(w) * 0.5, 0.0, 1.0));
    col = mix(col, vec3(0.0), maskBand(p.x, 1.0) * 0.5);
    col = mix(col, vec3(0.0), maskBand(p.y, 1.0) * 0.5);
    col = mix(col, vec3(1.0), maskBand(length(p - m) - 0.02, 1.5));

#else
    // ---------------------------------------------------- BOOL
    vec2 p = domainCentred();
    vec2 m = mouseCentred();

    // Deliberately a hard two-tone. Relational functions ARE boolean, and
    // the aliased edge is the lesson.
    col = fBool(p, m) ? vec3(0.20, 0.70, 0.40) : vec3(0.12, 0.12, 0.16);
    col = mix(col, vec3(0.35),             maskBand(p.x, 1.0));
    col = mix(col, vec3(0.35),             maskBand(p.y, 1.0));
    col = mix(col, vec3(1.00, 0.90, 0.30), maskBand(length(p - m) - 0.02, 1.5));
#endif

    gl_FragColor = vec4(col, 1.0);
}
