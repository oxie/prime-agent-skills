# Static recipe browser probe

Use only an authorized owned local preview, following the shared browser-check
skill. This test page compares every computed CSS property of its neutral host
section and input before and after loading the actual library. It also checks
viewport fit, each recipe's computed decoration, fully opaque base, stacking, static
state and input focus. A translucent negative exercises the opacity check. The
actual CSS-linked grain image must decode to its expected dimensions; decoding
does not prove unobscured painting, which still needs visual inspection. It is not a screenshot/pixel, performance or accessibility
certification. Missing CSS or a failed assertion never produces the pass marker.

Serve the cinematic-ui directory using the normal static Python server described
in [the recipe guide](../../references/quiet-surfaces.md). Capture
`http://127.0.0.1:8765/tests/quiet-surfaces-browser/` with an action file containing:

```json
[{"action":"wait-for","selector":"#result[data-status=passed]"}]
```

Inspect the completed exit, `dom.json`, screenshots and cleanup evidence. Expect
`QUIET_SURFACES_BROWSER_PROBE_OK` and only true checks in the visible result.
Run at desktop and narrow widths. Open the separate
[recipe demo](../../assets/quiet-surfaces/index.html) to inspect actual appearance,
light/dark, long copy, anchor links, typing and keyboard focus. Its library and SVG
are the production assets, not copies or mocked CSS. Do not import this test's
JavaScript or fixture styling into a host. Stop the owned preview afterward.
