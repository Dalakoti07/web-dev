// builtins-lab.frag — see the SHAPE of every GLSL builtin you actually need.
// Change FN, save, look. That's the whole workflow.
// Stages: 1 DOMAIN -> 2 FIELD -> 3 MASK -> 4 COLOUR
// Run: glslViewer builtins-lab.frag

#ifdef GL_ES
#extension GL_OES_standard_derivatives : enable
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

// ======================================================== PICK ONE
#define FN 0
//  0  x                       identity - the baseline
//  1  pow(x, 5.0)             ease-in: slow start, late rush
//  2  pow(x, 0.2)             ease-out: instant rush, long tail
//  3  step(0.5, x)            HARD edge. look at the jaggies. this is the enemy
//  4  smoothstep(0.0,1.0,x)   the S curve. step's civilised cousin
//  5  smoothstep(0.3,0.7,x)   same S, compressed into a window
//  6  clamp(x*2.0-0.5,0.,1.)  a ramp with flat shoulders
//  7  abs(x-0.5)*2.0          a V. folds the domain in half
//  8  sign(x-0.5)*0.5+0.5     step, spelled differently
//  9  min(x, 0.5)             a ceiling.  max(x,0.5) is a floor
// 10  floor(x*5.0)/5.0        quantise into 5 bands
// 11  fract(x*3.0)            the sawtooth. THE tiling primitive
// 12  mod(x*3.0, 1.0)         same sawtooth, different spelling
// 13  sqrt(x)                 gentle ease-out
// 14  exp(-4.0*x)             decay. the glow/falloff workhorse
// 15  sin(x*6.2831)*0.5+0.5   one full wave, remapped to 0..1
// 16  cos(x*6.2831)*0.5+0.5   the same wave, shifted a quarter
// 17  atan(x*4.0-2.0)/3.1416+0.5   soft saturation, never quite reaches

// NOT graphable here: length, distance, dot, normalize, fwidth.
// Those take vectors, not a single x - they live in stage 2 of a 2D shader.
// You already used length/distance in the circle.

// ============================================================ 2. FIELD
// The function under inspection. This is the ONLY thing FN switches.
float f(float x) {
#if   FN == 0
    return x;
#elif FN == 1
    return pow(x, 5.0);
#elif FN == 2
    return pow(x, 0.2);
#elif FN == 3
    return step(0.5, x);
#elif FN == 4
    return smoothstep(0.0, 1.0, x);
#elif FN == 5
    return smoothstep(0.3, 0.7, x);
#elif FN == 6
    return clamp(x * 2.0 - 0.5, 0.0, 1.0);
#elif FN == 7
    return abs(x - 0.5) * 2.0;
#elif FN == 8
    return sign(x - 0.5) * 0.5 + 0.5;
#elif FN == 9
    return min(x, 0.5);
#elif FN == 10
    return floor(x * 5.0) / 5.0;
#elif FN == 11
    return fract(x * 3.0);
#elif FN == 12
    return mod(x * 3.0, 1.0);
#elif FN == 13
    return sqrt(x);
#elif FN == 14
    return exp(-4.0 * x);
#elif FN == 15
    return sin(x * 6.2831) * 0.5 + 0.5;
#elif FN == 16
    return cos(x * 6.2831) * 0.5 + 0.5;
#else
    return atan(x * 4.0 - 2.0) / 3.1416 + 0.5;
#endif
}

// Signed vertical offset from the curve. Zero ON the curve.
float fieldGraph(vec2 st) { return st.y - f(st.x); }

// ============================================================ 1. DOMAIN
// A graph must NOT be aspect-corrected - it should fill its box.
vec2 domain() { return gl_FragCoord.xy / u_resolution; }

// ============================================================ 3. MASK
// Band `halfPx` pixels either side of field == 0, at any slope.
float maskBand(float field, float halfPx) {
    float w = fwidth(field) * halfPx;
    return 1.0 - smoothstep(0.0, w, abs(field));
}

// Guide lines at y = 0, 0.5, 1 and x = 0.5. max() = union of masks.
float maskGuides(vec2 st) {
    float m = maskBand(st.y - 0.0, 1.0);
    m = max(m, maskBand(st.y - 0.5, 1.0));
    m = max(m, maskBand(st.y - 1.0, 1.0));
    m = max(m, maskBand(st.x - 0.5, 1.0));
    return m;
}

// ============================================================ 4. COLOUR
void main() {
    vec2  st    = domain();                   // 1
    float field = fieldGraph(st);             // 2

    float curve  = maskBand(field, 1.5);      // 3
    float guides = maskGuides(st);            // 3
    float strip  = 1.0 - smoothstep(0.055, 0.060, st.y);   // 3  bottom band

    vec3 col = vec3(0.07, 0.07, 0.10);                     // 4
    col = mix(col, vec3(0.18, 0.18, 0.24), guides);        // grid under
    col = mix(col, vec3(f(st.x)),          strip);         // value as BRIGHTNESS
    col = mix(col, vec3(0.30, 1.00, 0.45), curve);         // the curve on top

    gl_FragColor = vec4(col, 1.0);
}
