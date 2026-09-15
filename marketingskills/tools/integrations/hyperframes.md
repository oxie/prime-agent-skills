# Hyperframes — versioned integration guidance

Use only when Hyperframes is already selected for an authorized video project.
Video owns production; this is not an installer, a new skill router or a default
framework choice. The published `hyperframes` 0.8.40 package was checked on
2026-09-15: it exposes CLI binaries, not a root JavaScript `render` export. The
previous frames-array examples were not a supported entrypoint for that package.
Recheck the selected version before implementing against a different release.

## Before setup or execution

- Inspect the project's package/lockfile and existing renderer commands first.
  The reviewed CLI requires Node.js 22+. Browser, FFmpeg and asset requirements
  depend on the selected rendering path. Missing tools are not permission to install.
- Initialization and skill-update commands can install or refresh companion agent
  skills outside the video project. Review the selected version's exact destinations
  and obtain setup approval; do not run them just to read this reference. Do not
  silently migrate an existing project or change the user's skill set.
- Local rendering is not automatically offline. HTML, fonts, media and scripts can
  fetch network resources. Use authorized local assets and an enforced request policy
  when offline behavior is required; record any allowed remote destinations.
  Provider calls, uploads, new cloud infrastructure and spending require separate
  approval. Never place keys in HTML, command arguments or generated assets.

## Actual authoring model

A composition is an HTML scene with timing data, not one HTML document per video
frame. The renderer seeks scene state at each frame time. The versioned composition
contract covers a root composition ID/dimensions/duration, clip start/duration/track
attributes, media ownership and registered seekable animation timelines.

GSAP timelines are paused and registered under the composition ID in
`window.__timelines`; other supported adapters have their own documented contracts.
A free-running CSS transition or wall-clock event is not automatically seek-safe.
Use the selected adapter's docs rather than copying an unrelated browser animation.
For a code API, consult the separately documented core/engine/producer package for
that version. Do not infer a callable SDK from the CLI package name.

For an **already installed, approved CLI**, run from the selected video project using
its local executable or existing package scripts. These are CLI inspection/render
commands, not instructions to fetch a package:

```text
./node_modules/.bin/hyperframes --version
./node_modules/.bin/hyperframes render --help
./node_modules/.bin/hyperframes check
./node_modules/.bin/hyperframes render --fps 30
```

Confirm input selection, output path, overwrite behavior and the relevant flags in
that version's help before running check/render; both can execute composition code
and write artifacts. The commands above were source-checked, not executed here.
A check result is limited to its actual detectors. Do not disable contrast checks
for an entire dark design because some decoration is intentionally low contrast;
separate decorative exceptions from readable text and verify the latter explicitly.

## Repeatable output, not unconditional guarantees

Pin the toolchain and media/font inputs. Define state from frame/time, seed any
randomness and initialize the first frame explicitly. Test direct seek and backward
seek at representative frames as well as linear playback. Inspect asset readiness,
font fallback and console errors; a fixed delay is not proof that resources loaded.

Repeatability depends on browser/encoder versions, fonts, asset bytes and supported
animation behavior. It does not guarantee byte-identical output across machines,
rendered correctness, better model performance or zero operating cost.

## Reusable production patterns

| Task | Content/timing plan | Evidence to preserve |
|------|---------------------|----------------------|
| Product announcement | Introduction, demonstrated feature, next action | Actual product state and approved message |
| Testimonial | Exact quotation, attribution, optional next action | Permission and source; no invented customer count |
| Metrics update | Labeled measure, period, comparison | Real values, units, source and uncertainty |

Generate or bind those inputs through the chosen version's documented interface.
Treat interpolated text and URLs as data; escape them for their output context.
Do not turn user-provided values into executable JavaScript or shell source.

Common canvas examples: 1080×1920 portrait, 1920×1080 landscape, 1080×1080 square,
1080×1350 portrait feed. Confirm the actual destination's requirements, text-safe
areas and crop behavior rather than treating these as universal platform limits.
For final artifact and UI depiction checks, use Video's
[UI demo delivery](../../skills/video/references/ui-demo-delivery.md).

## Choosing between frameworks

Hyperframes offers HTML and seekable runtime adapters; Remotion offers React and
frame-driven composition. Both have local and documented distributed rendering
paths. Choose by existing project, required media/animation support, deployment,
license and tested output. Neither is inherently better for every agent or restricted
to only simple/complex motion. Remotion's current use-specific license terms are
separate from Hyperframes' Apache-2.0 license and from asset/infrastructure costs.

## Primary references and limits

- [Hyperframes source and package map](https://github.com/heygen-com/hyperframes/tree/e2d60cf27c80849cb6c0fa5c22be34c85b8f6e05)
- [Published package metadata](https://registry.npmjs.org/hyperframes/0.8.40)
- [Composition quickstart](https://hyperframes.heygen.com/quickstart)
- [Core API](https://hyperframes.heygen.com/packages/core)
- [Rendering guide](https://hyperframes.heygen.com/guides/rendering)
- [Remotion license](https://www.remotion.dev/license)

Source inspection on 2026-09-15 supports the package/interface distinctions, not an
executed render, installation trial or performance comparison. Live documentation
may change; select a version deliberately. Local change provenance is in
[Huashu review sources](../../HUASHU_SOURCES.md).
