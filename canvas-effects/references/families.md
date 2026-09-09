# Choose the family and the medium

The table is a design map, not a catalogue of implemented components. Match the
brief's actual visual behavior before optimizing code size. Avoid dark/glass/neon
as automatic defaults; effects can be quiet, bright, editorial or playful.

| Family | Practical starting pipeline | Important distinction | Evidence level here |
|---|---|---|---|
| Ripples / wakes | Canvas2D bounded expanding rings with age-based opacity; optional height-field shader | Rings suggest water; they are not a fluid solver | Original ring example; verify current test receipts |
| Particles | Bounded arrays of position/velocity/age, time-based integration and Canvas2D drawing | Decorative motion is not a physical or data simulation | Original bounded particle example |
| Glyph / ASCII | Sample or construct an original scene, map cells to glyphs, reveal a region through an explicit control | An original glyph scene is not live-DOM capture; a heading scramble is different again | Original glyph-scene example |
| Distortion / refraction | WebGL full-screen primitive, original texture/field, bounded UV displacement | An image warp is not arbitrary live-page glass | Original WebGL2 distortion example, subject to actual GPU validation |
| Fluid / smoke | Velocity/dye fields, advection, pressure projection and ping-pong targets | A realistic solver has substantially different stability/resource contracts than rings | Recipe only, not a bundled solver |
| Glass / lenses | Sample approved background texture with bounded offsets, edge tint and optional blur | Cannot promise distortion of arbitrary interactive DOM without a capture strategy | Recipe only |
| Transitions | Two known surfaces/textures plus progress; destination remains available | A decorative transition cannot gate navigation or conceal a failed route | Recipe only |
| Interactive 3D | Scene/camera, geometry/materials, lighting, controls and loader lifecycle | A useful 3D scene needs asset, context-loss and accessible equivalent decisions | Recipe only; no model/engine shipped |

## When not to use a canvas

Use real text for headings, a CSS/SVG treatment for a simple border or mask, normal
DOM transitions for small content changes, and semantic chart tooling for factual
information. A small native solution is preferable only if it keeps the required
visual behavior. If a distinctive effect truly needs a shader or scene engine,
choose that openly with its costs rather than disguising a weaker substitute.

## Inputs change the design

- Pointer movement can perturb decoration, but never be the only way to read
  essential content. Supply focus/tap/keyboard alternatives or leave the useful
  content outside the effect.
- A finite Play action is suitable for optional experiments; Stop must stop work,
  not merely conceal it. Do not restart on hover/intersection after a user stops.
- Scroll-linked effects must preserve native scrolling. Compute local coordinates
  against the current element rect; retest after scroll, resize, transforms and
  layout changes. Do not hijack wheel input to make a demo impressive.
- Motion-free mode is a designed composition, not a blank loader or broken canvas.

## Interpret a reference accurately

Describe the visible result and its mechanism separately. A recorded demo can show
appearance, not prove browser support, input accessibility or the deployed code's
integrity. Label source-code reasoning and actual rendered tests separately.

Canvas UI's Decrypt transforms captured interface pixels into glyphs with a circular
crisp reveal. The original glyph example here does not claim that exact mechanism.
For a future request for the exact whole-interface behavior, resolve capture support,
license, semantics and failure recovery explicitly; do not silently fall back to a
text scramble and call it equivalent. Likewise a noise-driven warp is not proof of
fluid physics, and CSS filters are not calibrated film LUTs.
