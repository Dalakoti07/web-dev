# How `abs`, `fract` and `clamp` make contour rings from one field

The line being explained:

```glsl
float rings = 1.0 - clamp(abs(fract(d / 0.05 + 0.5) - 0.5) * 0.05 / 0.004, 0.0, 1.0);
```

My original attempt at explaining it, which this corrects:

> how abs clamp and fract creating rings when once field is set, so field function is executed for each and every pixel on screen and sometimes area red is created, sometimes inner rings are created, sometimes outer rings are created, its like we coded for 1 shape red shape and then recursively rings were created and color also opted as per our code.

## That statement, scored

- ✅ **"field function is executed for each and every pixel on screen"**
- ✅ **"color also opted as per our code"**
- ✅ **"sometimes inner rings, sometimes outer rings"** — correctly *observed*; the cause was the missing piece
- ❌ **"recursively rings were created"** — nothing recurses
- ❌ **"we coded for 1 red shape and then rings were created"** — the rings aren't made from the red shape

## The explanation, rewritten

> The field function runs once for every pixel, and all it returns is **one number** — how far that pixel is from the boundary, negative inside and positive outside. Nothing has been drawn yet.
>
> Then `abs`, `fract` and `clamp` ask **separate, unrelated questions about that one number**.
> `abs` asks *"am I near zero, on either side?"* → that's the red boundary.
> `fract` folds the number into repeating 0.05-wide cycles and asks *"am I near the start of a cycle?"* → that's every ring at once, inside and outside alike, because folding works on negative numbers too.
> `clamp` turns each of those distances into a 0-to-1 coverage, so the lines have soft edges instead of jagged ones.
>
> The red line and the rings are **siblings, not parent and child** — I did not code one shape and then generate rings from it, and nothing recurses. They are two independent readings of the same number. The colour is chosen last, one `mix` per reading.

- The two swaps that fix the model: **"one number, several questions"** replaces "one shape, then rings", and **"folding"** replaces "recursion".

## The ring line, taken apart

Read it inside-out. Take `d = 0.137`:

| Step | Expression | Value | What it means |
|---|---|---|---|
| 1 | `d / 0.05` | `2.74` | I'm 2.74 cycles out from the boundary |
| 2 | `+ 0.5` | `3.24` | shift so the ring sits mid-cycle *(see below)* |
| 3 | `fract(…)` | `0.24` | **forget which cycle** — keep only my position within it |
| 4 | `− 0.5` | `−0.26` | signed offset from the cycle's middle |
| 5 | `abs(…)` | `0.26` | distance from the middle, **either side** |
| 6 | `× 0.05` | `0.013` | convert cycle-fraction back into field units |
| 7 | `/ 0.004` | `3.25` | how many half-widths away am I |
| 8 | `clamp(…,0,1)` | `1.0` | cut off at 1 |
| 9 | `1.0 −` | **`0.0`** | invert: **1 means on the ring**. This pixel is not. |

- **Step 3 is the whole trick.** `fract` throws away the cycle count. That single act is why one expression paints every ring instead of one.

## The `+0.5 … −0.5` pair — the only clever bit

- **Problem:** `fract` jumps from ~1.0 back to 0.0 at every integer. If the ring sat at an integer, it would sit *exactly on that cliff* — and you'd get half a ring, with the other half missing.
- **Fix:** `+0.5` moves the ring to where `fract` reads **0.5** — the middle of the ramp, far from the cliff.
- Then `abs(f − 0.5)` measures **distance from that middle**, which is a clean symmetric V with its point on the ring.
- So: **`+0.5` relocates the ring to smooth ground; `−0.5` measures from it.** They're one move in two halves.

## The same thing, written so you can read it

```glsl
// Contour lines every `spacing` units of the field, `halfWidth` thick.
float ringMask(float d, float spacing, float halfWidth) {
    float cycle  = d / spacing + 0.5;                   // 1. which cycle, offset by half
    float toRing = abs(fract(cycle) - 0.5) * spacing;   // 2. distance to nearest ring
    return 1.0 - clamp(toRing / halfWidth, 0.0, 1.0);   // 3. distance -> coverage, inverted
}
```

Then the call site says what you actually meant:

```glsl
float rings    = ringMask(d, 0.05, 0.004);   // contours every 0.05
float boundary = ringMask(d, 1.0e6, 0.004);  // one "contour" at zero — the red line
```

- Note the second line: **the red boundary is just `ringMask` with the spacing set so large that only cycle zero is on screen.** Concrete proof they're the same kind of question, asked twice with different spacing — not a shape and its offspring.

## Why `× 0.05` is there and not an accident

- After `fract`, your number is a **fraction of a cycle** (0 to 0.5), not a distance.
- `× spacing` converts it back to the **same units as `d`**, so `halfWidth` can be stated in field units.
- Drop it and the ring thickness silently scales with the spacing — widen the gaps and the lines fatten too.

## Three experiments to confirm the model, not just accept it

- **Delete `fract`** → **one ring.** Proves `fract` alone causes repetition.
- **Delete `abs`** on the red line → **half the screen turns red.** Proves `abs` makes the test two-sided.
- **Change `0.05` → `0.15`** → **fewer, wider-spaced rings**, same thickness. Proves spacing is just a divisor, with nothing choosing it recursively.
