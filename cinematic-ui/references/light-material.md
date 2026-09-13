# Light, color and material

Choose the source of attention before choosing a gradient. A page may use no
texture at all. Light/dark describes a surface; it does not determine mood, quality
or genre. Preserve brand tokens and choose scoped roles, not an automatic palette.

## L1 — Diffuse daylight

**Image idea:** broad soft light, visible midtones, open edges and room around the
subject. **Web translation:** a pale solid surface, dark readable text, generous
margins and a gently differentiated figure panel. A near-white background is not
an absence of art direction; scale and crop can carry it.

Use for cultural programmes, documentary/editorial pages or quietly confident
portfolios. Avoid washing out figure detail or making captions gray-on-gray. Text
and control contrast are separate from the softness of the image. White-on-white
panels need enough separation where their boundary has functional meaning.

Source relation: original daylight synthesis using upstream background A2
Directional Light and quiet typography; not a film-attributed palette.

## L2 — Directional light and stable shadows

**Image idea:** one broad source from a side creates a lit face and a quieter face.
**Web translation:** a bounded gradient or approved photo crop gives a figure depth;
its shadow direction agrees with nearby raised surfaces. Keep the text plane flat
and predictable. A small warm accent can contrast with neutral surrounding space.

Use for architecture, physical objects, craft or intimate portraits. Avoid shadows
on every box; shadow usually signals elevation, not the importance of all content.
Fine borders and a single offset may express material better than a large blur.
On small screens simplify the light treatment without changing reading hierarchy.

Source relation: background A2 Directional Light; textures #21–22 radial light.

## L3 — Practical glow / dark stage

**Image idea:** a visible or implied local light illuminates one subject while the
rest stays quiet. **Web translation:** a solid dark stage with a bounded radial
highlight behind an original shape or licensed figure, plus opaque caption/text
surfaces. Think lit object, not “put glow everywhere.”

Use for a lighting portfolio, performance event or explicitly nocturnal direction.
Darkness must not remove content. Glow cannot be the only focus indicator, and
neon edges cannot replace usable boundaries. Avoid flicker. A static gradient
usually supplies all needed atmosphere; optional finite movement belongs only to
its decorative layer. Do not animate large blur/backdrop areas without measurement.

Source relation: background A6 Edge Glow; visual elements #17 Light Leak Overlay
and #18 Radial Vignette. Their source snippets are not copied.

## L4 — Flat chromatic field / graphic cut

**Image idea:** strong color masses define the frame without simulated depth.
**Web translation:** one approved accent field, a sharply different text scale and
an abrupt static boundary into the programme/detail section. This can be bright,
playful or austere without a shader, glow or film grain.

Use for cultural launches, music/art events or title-led campaigns. Test text and
link contrast against each field. A visual cut means a compositional boundary,
not flashing colors or instant motion. Keep repeat pages recognizable through
shared tokens. Avoid using color alone to label categories or states.

Source relation: compositions #76 Title card sequence; typography 1.1 / 1.5.

## L5 — Paper, ink and quiet tactility

**Image idea:** warm or cool paper, ink edges, flat physical layering.
**Web translation:** an opaque paper-like surface, crisp dark type, a small border
or shallow shadow on a meaningful figure. A static, very subtle original texture
is optional and should disappear behind the reading layer if it reduces clarity.

Use for archives, printed programme references, essays or process notebooks.
Texture is not a requirement for materiality. Avoid distressed essential text,
background noise moving forever, false handwritten source evidence or stacked
papers that conceal links. At narrow widths flatten the layers and keep captions.

Source relation: textures #4 Paper aged / #5 Linen weave / #10 Cross-hatch;
compositions #48 Paper stack. Source placeholder texture URLs are not included.

## L6 — Mineral / metal / precise solid

**Image idea:** a solid surface with clear edges and a controlled highlight.
**Web translation:** neutral opaque panels, fine functional boundaries and modest
specular emphasis restricted to decorative imagery. Use image direction and spacing
to imply mass; ordinary rectangles and flat backgrounds can be sufficient.

Use for architecture, industrial craft or product detail. Do not cover specifications
with brushed patterns. A translucent panel needs an opaque fallback and measured
contrast over everything behind it; glass is never the default material. Remove
backdrop filters when they do not add information or justify rendering cost.

Source relation: textures #6 Concrete rough / #7 Brushed metal / #18 Marble;
background C6 Frosted Glass is a conditional reference, not a required treatment.

## Color as relationships, not a film preset

Choose semantic roles: canvas, reading surface, foreground, muted text, border,
accent, focus and real state colors. Record exact selected values in the project's
existing token format when token changes are authorized. Check every actual pairing;
muted text must still be readable. Never change success/error semantics for a mood.

For image grading, inspect the unfiltered source first. Change contrast, saturation
or warmth only with permission and a useful reason. Preserve accurate skin tones,
product appearance and documentary meaning where relevant. A global sepia filter
is not an evidence-based period look. Local image adjustments should not filter
text, controls or the whole document.

CSS `filter` recipes are **not calibrated LUTs**. There is no bundled LUT, color
management pipeline, camera model or guarantee of film-stock reproduction. Likewise
CSS shadows, opacity and blur do not reproduce lighting ratios or depth of field.
If calibrated output matters, use the actual color-managed media workflow and its
reference measurements; this skill does not provide one.

## Layer audit

For each layer ask: what gets attention, where is the light source, what surface is
implied, what survives removal? Prefer a solid fallback underneath decorations.
Keep decorative overlays noninteractive, behind readable content, and out of
assistive output. Reject unlicensed film stills, scraped site assets and remote
texture kits as automatic inputs. Test both image-present and image-absent states.

Sources: [background light/material entries](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/background-techniques.md#L18-L261),
[texture ideas](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/textures.md#L1-L36),
[light leak / vignette](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/visual-elements.md#L491-L541).
Treatment descriptions are rewritten, not a validated palette or optics catalogue.

## Optional static implementation recipes

[Quiet surfaces](quiet-surfaces.md) supplies actual local CSS/SVG mesh, grain and
ledger recipes with a standalone fixture. Choose a useful treatment or keep a
solid fill. Adapt the explicit palette to existing tokens; the recipes are not a
mandatory theme, calibrated material model or performance guarantee.
