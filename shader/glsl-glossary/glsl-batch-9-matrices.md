# GLSL Batch 9 — `matrixCompMult`, and the `mat2` material the glossary omits

The glossary lists exactly one matrix function, and it is the one you will almost never use. The genuinely important matrix material — column-major layout, the rotation matrix, which side to multiply on — has no glossary entry at all. Both are covered here.

*(Lab modes referenced below: MODE 0 = 1D graph, MODE 1 = 2D heat map with contours and a mouse operand, MODE 2 = 2D vector field as RGB, MODE 3 = 2D boolean two-tone.)*

---

## 1 · `matrixCompMult`

**1. Signature**
```glsl
mat2 matrixCompMult(mat2 x, mat2 y)
mat3 matrixCompMult(mat3 x, mat3 y)
mat4 matrixCompMult(mat4 x, mat4 y)
```
- Square matrices only. GLSL ES 1.0 has **no non-square matrix types** at all.

**2. What it does** — multiplies two matrices **entry by entry**.

**3. Exact definition**
- `result[i][j] == x[i][j] * y[i][j]`.
- ⚠️ **This is NOT matrix multiplication.** In GLSL, **`a * b` on two matrices already IS the real linear-algebra product.** This function is the odd one out — the "just multiply the numbers" version that the operator doesn't give you.
- **Why it looks strange to some people:** HLSL is **exactly backwards**. There, `*` is component-wise and `mul()` does the linear-algebra product. Same two operations, opposite spellings.

**4. Picture**
- **Not meaningfully graphable.** It takes two matrices and returns a matrix; none of the lab modes fit. That's honest, not a gap in the harness.
- What you *can* see is what it isn't: component-wise multiplying a rotation matrix by a weight matrix destroys the rotation. The demo below does this deliberately — the circle turns into a wobbling ellipse, proving the result is no longer a rotation.

**5. Range & edge cases**
- Unbounded; no undefined domain.
- The result of `matrixCompMult(A, B)` generally has **no geometric meaning** even when `A` and `B` both do.

**6. Stage** — rarely any. It isn't a domain, field, mask or colour operation.

**7. Idioms**
- **Weighting or masking matrix entries** — scaling individual coefficients of a matrix of data.
- Element-wise operations on matrices used as **data containers** rather than as transforms.

**8. Traps**
- ⚠️ **Confusing it with `*`.** They are different operations and both compile.
- ⚠️ It **does not compose transforms.** Component-wise multiplying two rotations does not give you a rotation.
- **Honest assessment: this is the least useful function in the entire 47.** You will likely never type it in a fragment shader. It's in the glossary; that's the only reason it's here.

**9. AGSL** — verify before relying on it rather than assuming; the component-wise multiply is one line to write yourself.

**10. Lab line** — none that teaches anything. Skip it.

---

## 2 · The `mat2` material — what you actually needed

### Column-major layout, and the bug it causes

- ⚠️ **GLSL constructors fill matrices by COLUMN.**
- `mat2(a, b, c, d)` builds the columns `(a, b)` and `(c, d)`, which lays out as:

```
| a   c |
| b   d |
```

- So writing a matrix in "reading order" gives you its **transpose** — and for a rotation, the transpose is the **opposite rotation**. This is the single most common matrix bug in shader code.
- **`m[0]` is the first COLUMN**, a `vec2` — not the first row. `m[0][1]` is column 0, row 1.

### The three transforms worth memorising

```glsl
// Rotation by `a` radians, counter-clockwise.
//   | c  -s |
//   | s   c |
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

// Non-uniform scale.
mat2 scl(vec2 k) { return mat2(k.x, 0.0, 0.0, k.y); }

// Shear along x.
//   | 1  k |
//   | 0  1 |
mat2 shx(float k) { return mat2(1.0, 0.0, k, 1.0); }
```

- Note how `rot` reads: the constructor arguments are `c, s, -s, c`, which *looks* wrong and is correct. Writing `mat2(c, -s, s, c)` gives you clockwise rotation instead.

### `m * v` versus `v * m` — and why wrong code often looks right

- **Both compile.** They are not the same.
  - `m * v` treats `v` as a **column** vector. This is the standard convention.
  - `v * m` treats `v` as a **row** vector, which is equivalent to `transpose(m) * v`.
- ⚠️ **So the two classic bugs cancel each other.** Write the rotation transposed *and* multiply on the wrong side, and you get the correct result. That's why a lot of shader code in the wild is wrong twice and looks fine — and why copying a snippet without checking both conventions will eventually break.
- **Rule: pick `m * v` and write your matrices column-major.** Then only one convention to remember.

### Transforming the domain rotates the image the other way

- ⚠️ **This is the most confusing thing about matrices in fragment shaders.**
- You never transform a shape. You transform the **coordinate** before asking the shape about it.
- If you write `q = rot(a) * p` and draw a shape in `q`, **the shape appears rotated by `-a`.**
- **To turn a shape by `+a`, write `rot(-a) * p`.**
- Why: the shape lives in `q`-space. Asking "where in `p`-space does this land" means running the transform backwards, so the visible result is the inverse of what you applied.

### Composition order

- `mat2 M = rot(a) * shx(k) * scl(s);` applies **scale first, then shear, then rotation** — matrix products apply **right to left**.
- Reversing the order gives a genuinely different transform. Rotation and scale do not commute unless the scale is uniform.

### What GLSL ES 1.0 does not give you

- ⚠️ **No `inverse()`. No `transpose()`.** Both arrived in ES 3.0.
  - For a rotation the inverse is simply `rot(-a)`.
  - For a scale it's `scl(1.0 / k)`.
  - For anything general, write it out by hand.
- **No `mat2x3`, `mat3x2`, etc.** Square matrices only.
- **`mat2` cannot translate.** A 2×2 matrix is a linear map, and linear maps fix the origin. Translation needs a `mat3` with homogeneous coordinates — or, far more simply in a fragment shader, just `p - offset`.

---

## What batch 9 unlocked — a transform stack

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

// COLUMN-major. mat2(c, s, -s, c) lays out as | c  -s |
//                                             | s   c |
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
mat2 scl(vec2 k)  { return mat2(k.x, 0.0, 0.0, k.y); }
mat2 shx(float k) { return mat2(1.0, 0.0, k, 1.0); }

float sdBox(vec2 p, vec2 b) {
    vec2 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

    // ---- 1 DOMAIN: composed transform, applied RIGHT to LEFT.
    // rot(-a) because transforming the DOMAIN turns the IMAGE the other way.
    float a = u_time * 0.5;
    mat2  M = rot(-a) * shx(0.25 * sin(u_time)) * scl(vec2(1.0, 0.6));
    vec2  q = M * p;                      // m * v : v is a COLUMN vector

    // ---- 2 FIELD
    float d = sdBox(q, vec2(0.30, 0.18));

    // matrixCompMult: entry by entry, NOT a matrix product.
    // Multiplying a rotation this way destroys the rotation - watch the ring.
    mat2  blend = matrixCompMult(rot(a), mat2(1.0, 0.3, 0.3, 1.0));
    vec2  r     = blend * p;
    float ring  = length(r) - 0.42;

    // ---- 3 MASK
    float fill = smoothstep(0.004, -0.004, d);
    float edge = smoothstep(0.005,  0.0,   abs(d) - 0.003);
    float halo = smoothstep(0.006,  0.0,   abs(ring) - 0.002);

    // ---- 4 COLOUR
    vec3 col = vec3(0.05, 0.05, 0.08);
    col = mix(col, vec3(0.20, 0.45, 0.70), fill);
    col = mix(col, vec3(1.00, 1.00, 1.00), edge);
    col = mix(col, vec3(0.95, 0.70, 0.30), halo);

    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
    gl_FragColor = vec4(col, 1.0);
}
```

**Six things to do with it**

- **Watch the gold ring.** It should be a circle — a rotation can't deform a circle. It isn't: it wobbles into an ellipse, because `matrixCompMult` produced something that is no longer a rotation. **That's the whole entry, visible.**
- **Change `matrixCompMult(...)` to `rot(a) * mat2(1.0, 0.3, 0.3, 1.0)`.** Different wobble. Two genuinely different operations on the same inputs.
- **Change `mat2(c, s, -s, c)` to `mat2(c, -s, s, c)`** in `rot`. Everything spins the other way. That's the transpose, and that's the column-major trap.
- **Change `M * p` to `p * M`.** Also spins the other way. **Now do both changes at once — it goes back to the original.** The two bugs cancel.
- **Reorder to `scl(vec2(1.0, 0.6)) * shx(...) * rot(-a)`.** The box now stretches along fixed screen axes instead of its own. Right-to-left order made visible.
- **Change `rot(-a)` to `rot(a)`.** The box turns the opposite way from what you'd expect — domain versus image.

## The eight things worth remembering from batch 9

- **`matrixCompMult` is entry-by-entry. `*` on matrices is the real product.** HLSL is backwards on both.
- **GLSL matrices are column-major.** `mat2(a,b,c,d)` is columns `(a,b)`, `(c,d)`.
- **The rotation matrix is `mat2(c, s, -s, c)`** — it looks transposed and isn't.
- **`m * v` and `v * m` both compile and differ by a transpose.** Pick `m * v` and never revisit it.
- **Transforming the domain by `R(a)` rotates the image by `-a`.**
- **Composition applies right to left.**
- **No `inverse()`, no `transpose()`, no non-square matrices in GLSL ES 1.0.**
- **`mat2` cannot translate** — that's `mat3` with homogeneous coordinates, or just subtract an offset.
