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
    // Reversed smoothstep edges: 1.0 inside, 0.0 outside, soft in between.
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
