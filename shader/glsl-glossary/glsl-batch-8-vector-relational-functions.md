# GLSL Batch 8 — the nine relational functions

`lessThan` · `lessThanEqual` · `greaterThan` · `greaterThanEqual` · `equal` · `notEqual` · `any` · `all` · `not`

**Read this first — it collapses nine functions into one idea.**

- In GLSL, **`<` `>` `<=` `>=` `==` `!=` do not work on vectors.** `vec2(1,5) < vec2(3,2)` is a compile error.
- So the language provides six named functions that do the comparison **component-wise**, returning a `bvec`.
- **There are no scalar overloads.** For a `float`, you just write `a < b`. These functions exist *only* for vectors.
- Then three more to do something with the resulting `bvec`: reduce it (`any`, `all`) or invert it (`not`).

**That's the whole category.** Six comparisons, two reducers, one inverter.

*(Lab modes referenced below: MODE 0 = 1D graph, MODE 1 = 2D heat map with contours and a mouse operand, MODE 2 = 2D vector field as RGB, MODE 3 = 2D boolean two-tone.)*

---

## 1–6 · `lessThan` `lessThanEqual` `greaterThan` `greaterThanEqual` `equal` `notEqual`

These are one function with six operators, so they get one entry.

**1. Signature**
```glsl
bvec2 lessThan(vec2  x, vec2  y)     bvec2 lessThan(ivec2 x, ivec2 y)
bvec3 lessThan(vec3  x, vec3  y)     bvec3 lessThan(ivec3 x, ivec3 y)
bvec4 lessThan(vec4  x, vec4  y)     bvec4 lessThan(ivec4 x, ivec4 y)
```
- Same shape for all six. Float and int versions; **no scalar, no `bool` version** — except:
- ⚠️ **`equal` and `notEqual` additionally accept `bvec` arguments.** The four ordering functions don't, because asking whether `true < false` is meaningless.

**2. What they do** — compare two vectors one component at a time.

**3. Exact definition**
- `lessThan(x, y).i == (x[i] < y[i])` for each component `i`, and likewise for the other five operators.
- Input and output have the **same width**: `vec3` in, `bvec3` out.

**4. Picture** — MODE 3, `return all(lessThan(p, m));`
- A hard-edged rectangle whose corner tracks the mouse.
- **Look at the edge.** It's a staircase of pixels. There is no soft version and there cannot be — see the traps.

**5. Range & edge cases**
- Output components are exactly `true` or `false`.
- ⚠️ **`equal` on floats is a bug waiting to happen.** Two floats that *should* be identical rarely are. Use a tolerance instead: `lessThan(abs(a - b), vec2(0.0001))`.

**6. Stage** — nominally **3 (MASK)**. In practice, the wrong stage-3 tool.

**7. Idioms**
- **Bounds testing, reduced to one bool:**
  ```glsl
  bool insideBox = all(lessThan(abs(p), vec2(0.3, 0.2)));
  ```
- **Range check:** `all(greaterThanEqual(p, lo)) && all(lessThan(p, hi))`.
- **Tolerance comparison** instead of `equal`, as above.

**8. Traps**
- ⚠️ **They alias by construction.** A boolean has no notion of partial pixel coverage, so any edge built from one is jagged. This is not fixable — it's what "boolean" means.
- ⚠️ **In GLSL ES 1.0, a `bvec` has almost nothing that can consume it.** `mix(x, y, bvec)` — the branchless select that makes `bvec` useful — is **GLSL 1.30 / ES 3.0 only**. In the online editor the only options are `any`, `all`, `not`, or reading components out one at a time. That makes this batch considerably less useful there than tutorials imply.
- ⚠️ **No scalar overloads.** `lessThan(0.5, x)` doesn't compile. Use `<`.
- Float equality, as above.

**9. AGSL** — the comparison **operators** work on vectors in SkSL, so the named functions are largely unnecessary there. Don't port these calls; rewrite them.

**10. Lab line** — MODE 3 → `return all(lessThan(abs(p), abs(m)));`

---

## 7 · `any`

**1. Signature**
```glsl
bool any(bvec2 x)    bool any(bvec3 x)    bool any(bvec4 x)
```

**2. What it does** — is **at least one** component true?

**3. Exact definition**
- Logical **OR** across the components. `any(bvec2(false, true))` is `true`.
- **Takes a `bvec` only** — you can't pass a `vec`.

**4. Picture** — MODE 3, `return any(lessThan(abs(p), vec2(0.15)));`
- A **cross / plus shape**, not a box. Because "inside the x-slab **OR** inside the y-slab" is two overlapping bands.

**5. Range & edge cases** — returns a single `bool`. `any` of an all-false vector is `false`.

**6. Stage** — **3**.

**7. Idioms**
- Reducing a component-wise test to one decision.
- "Is anything out of bounds?" — `any(greaterThan(abs(p), limit))`.

**8. Traps**
- ⚠️ **`any` is the OR, and OR gives you a union.** People reach for `any` expecting a box and get a cross. Use `all` for a box.
- Only accepts `bvec`.

**9. AGSL** — present.

**10. Lab line** — MODE 3 → `return any(lessThan(abs(p), vec2(0.15)));`

---

## 8 · `all`

**1. Signature**
```glsl
bool all(bvec2 x)    bool all(bvec3 x)    bool all(bvec4 x)
```

**2. What it does** — are **all** components true?

**3. Exact definition**
- Logical **AND** across the components.
- The width is always 2, 3 or 4, so there's no empty case to worry about.

**4. Picture** — MODE 3, `return all(lessThan(abs(p), vec2(0.30, 0.18)));`
- A **rectangle**. "Inside the x-slab **AND** inside the y-slab."

**5. Range & edge cases** — single `bool`.

**6. Stage** — **3**.

**7. Idioms**
- **Box / bounds test** — the canonical use, as above.
- Verifying every component of something satisfies a condition.

**8. Traps**
- Same aliasing problem as everything in this batch.
- ⚠️ **Worth noticing: this is the same AND/OR logic that `min`/`max` provide on fields and masks**, wearing different clothes.

| Representation | union (OR) | intersection (AND) |
|---|---|---|
| **field** (negative inside) | `min` | `max` |
| **mask** (1 inside) | `max` | `min` — or `*` |
| **boolean** | `any` | `all` |

  - Three representations of one idea. The boolean row is the only one that can't be antialiased, which is precisely why you use the other two.

**9. AGSL** — present.

**10. Lab line** — MODE 3 → `return all(lessThan(abs(p), vec2(0.30, 0.18)));`

---

## 9 · `not`

**1. Signature**
```glsl
bvec2 not(bvec2 x)    bvec3 not(bvec3 x)    bvec4 not(bvec4 x)
```

**2. What it does** — flips every component.

**3. Exact definition**
- Component-wise logical negation. `not(bvec2(true, false))` is `bvec2(false, true)`.
- **It exists because `!` doesn't work on a `bvec`** — `!someBvec` is a compile error, exactly like `<` on a `vec`. Same reason, same pattern.

**4. Picture** — MODE 3, `return all(not(lessThan(abs(p), vec2(0.25))));`
- The **inverse** of the corresponding `all(lessThan(...))` shape — everything outside the box, on both axes at once.

**5. Range & edge cases** — `bvec` in, `bvec` out, same width.

**6. Stage** — **3**.

**7. Idioms**
- Inverting a component-wise test before reducing it.
- Note: `not(lessThan(a, b))` is `greaterThanEqual(a, b)`. **You usually don't need `not` at all** — just pick the opposite comparison function.

**8. Traps**
- ⚠️ **It's almost always avoidable.** Six comparison functions cover every negation you'd want. `not` earns its keep only when the `bvec` came from somewhere you don't control.
- Don't confuse it with `!` on a plain `bool`, which works fine.
- **Honest assessment: with `equal`/`notEqual` already paired and the ordering functions already paired, `not` is the most redundant function in the glossary.**

**9. AGSL** — present.

**10. Lab line** — MODE 3 → `return all(not(lessThan(abs(p), vec2(0.25))));`

---

## What batch 8 unlocked — mostly, an argument against itself

The honest demo: **the same box, drawn twice.** Left with relationals, right with a field.

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    vec2 m = (u_mouse         - 0.5 * u_resolution) / u_resolution.y;

    vec2 hs = vec2(0.26, 0.18);        // NOT named `half` - that's a reserved word

    // ---- LEFT: the relational way. Boolean, and aliased by construction.
    bvec2 insideB  = lessThan(abs(p - vec2(-0.30, 0.0)), hs);
    bool  boxB     = all(insideB);                          // AND across components
    bvec2 outsideB = not(insideB);                          // component-wise negation
    bool  nearB    = any(lessThan(abs(p - m), vec2(0.05))); // OR -> a cross, not a box

    // ---- RIGHT: the field way. Same box, but as one number.
    vec2  q = abs(p - vec2(0.30, 0.0)) - hs;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);  // box SDF
    float boxF = smoothstep(0.003, -0.003, d);

    // ---- COLOUR
    // A bvec cannot drive mix() in GLSL ES 1.0, so booleans must be cast.
    vec3 col = vec3(0.05, 0.05, 0.07);

    // exactly one axis outside -> the four regions beside the box
    float band = float(any(outsideB)) * (1.0 - float(all(outsideB)));
    col = mix(col, vec3(0.13, 0.13, 0.22), band * 0.5);

    col = mix(col, vec3(0.85, 0.35, 0.30), float(boxB));   // relational box
    col = mix(col, vec3(0.30, 0.75, 0.95), boxF);          // field box
    col = mix(col, vec3(1.00, 0.90, 0.40), float(nearB) * 0.8);

    col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
    gl_FragColor = vec4(col, 1.0);
}
```

**Five things to do with it**

- **Zoom in on the two boxes' edges.** Left is a staircase; right is smooth. **This is the entire batch, in one image.**
- **Change `all(insideB)` to `any(insideB)`.** The red box becomes a **cross**. OR is a union, AND is an intersection — the same distinction as `min`/`max` on fields.
- **Try `col = mix(col, vec3(1.0), insideB);`** — it will **fail to compile**. That's the missing `mix(x, y, bvec)` overload, proving how little a `bvec` can do in ES 1.0.
- **Try `abs(p) < hs` instead of `lessThan(abs(p), hs)`** — also a compile error. That's *why* these nine functions exist.
- **Replace `not(insideB)` with `greaterThanEqual(abs(p - vec2(-0.30, 0.0)), hs)`.** Identical result. `not` was never needed.

## The seven things worth remembering from batch 8

- **They exist only because the operators don't work on vectors.** No scalar overloads — use `<` for floats.
- **`all` = AND, `any` = OR.** And that's the third row of the table above: fields use `max`/`min`, masks use `min`/`max`, booleans use `all`/`any`.
- **A `bvec` is nearly useless in GLSL ES 1.0** — `mix(x, y, bvec)` doesn't exist there, so `any`/`all`/`not` are its only consumers.
- **`not` is almost always avoidable** — pick the opposite comparison instead.
- **`equal` on floats is a bug.** Compare with a tolerance.
- **They alias, permanently.** Boolean coverage has no in-between, so these can never produce a clean edge.
- **In AGSL the operators work on vectors**, so don't port these calls — rewrite them.
