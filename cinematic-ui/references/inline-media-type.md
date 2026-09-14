# Inline media in a display heading

An optional pause inside a title: one small image shares the text's line box.
Use this when the interruption supports an editorial or cultural scene. A plain
heading is equally valid. Hallmark owns readability and host-system fit;
Cinematic UI owns this local composition. This is not a new typography system.

## Buildable still

Copy [inline-media.css](../assets/inline-media/inline-media.css), not demo.css.
The [local fixture](../assets/inline-media/index.html) shows large/light,
large/dark, smaller German copy and an explicit missing-image slot. It needs no
script, package, remote font or provider. Heading level belongs to the host.

```html
<h2 class="cui-inline-title">A small <span class="cui-inline-media" aria-hidden="true"><img src="./study.svg" width="240" height="120" alt=""></span> place for a thought.</h2>
```

Keep literal spaces on both sides of the span. Keep all words in HTML; the image
must not stand in for a noun, punctuation or a control. The span is decorative and
hidden from accessibility APIs; `alt=""` also avoids duplicate image announcements.
There is no focus target inside it. The demo links and disclosure are native HTML.

The media box is an inline-block, sized in heading-relative em units, capped at
its containing width, with a 2:1 aspect ratio. That ratio reserves its height even
before load or with the image removed. HTML width/height also declare the image's
intrinsic ratio. `object-fit: contain` preserves the entire SVG. Only the image's
own rounded box shapes its pixels; the heading has no overflow clipping. Text
stays in normal flow with automatic hyphenation and an anywhere-wrap fallback.
No forced line breaks, fixed heading height, letter splitting or line-count quota.
An image failing to load can leave a blank frame or browser broken-image icon;
neither is allowed to replace or conceal the sentence. Without CSS, the words
remain text and the image keeps its 240×120 intrinsic dimensions.

## Map host tokens

Set variables on a host component or ancestor, not globally. Typography defaults
to the host's inherited font and size. Keep the existing heading margins/weight.

| Token | Role / fallback |
|---|---|
| `--cui-im-ink` | Heading ink / inherited |
| `--cui-im-font`, `--cui-im-size` | Font family and display size / inherited |
| `--cui-im-leading` | Unitless leading / 1.2 |
| `--cui-im-tracking` | Letter spacing / normal |
| `--cui-im-media-size` | Preferred inline image width / 1.8em, capped at 100% |
| `--cui-im-align` | Inline baseline adjustment / -0.08em |
| `--cui-im-media-fill` | Solid image reading plane / #fbf8f1 |
| `--cui-im-media-line` | Frame stroke / currentColor |
| `--cui-im-media-radius` | Image frame radius / 999px |

Choose positive media sizes and sufficient line height for the actual font,
accents and image. The fixture uses dark text on light paper and light text on a
dark scene; both give the drawing a pale solid insert. The external SVG's ink does
not inherit page CSS. To use light ink on a dark media plane, edit an approved
local SVG variant and test its stroke/fill contrast; do not invert arbitrary
photos. Forced colors uses system heading and frame colors, not a forced palette.

## Original illustration, not a logo

[study.svg](../assets/inline-media/study.svg) is a small, newly drawn fictional
folded note. One continuous, slightly irregular charcoal path describes its edge
and folds. One peach quadrilateral sits 8 SVG units right and 5 down from the four
main outline corners. This is an actual vector illustration, not a generated-image
claim or a tracing of the upstream flower examples. Its title and description name
the visual when opened standalone. No scripts, external resources or fonts occur
inside it. This does not establish trademark clearance or production identity.

For an illustration carrying information, keep the complete heading and place a
normal-flow figure beside it. Give its image useful alt text and a visible caption
for the relevant construction/source. Do not apply the hidden decorative wrapper.
The fixture's full-size figure demonstrates this alternative. A complex diagram
needs a full text explanation, not a long alt crammed into the display heading.

## Verify in the consuming page

Run the native source checks from the skill checkout:

```sh
node --test cinematic-ui/tests/inline-media.mjs
```

These inspect the actual HTML/CSS/SVG, coordinate bounds, the continuous path,
offset-fill relationship, reserved sizing and text/alt contracts with negative
controls. They are **source-only**, not a browser layout or accessibility audit.

In an authorized preview inspect 320px and wide screens; 200% text resize; long
words, accents and fallback fonts; light/dark/forced colors; real image failure;
no CSS; Tab/Enter and disclosure Space; and visible focus at the native anchor
targets. Confirm no page overflow or obscured words, no extra decorative image
announcement, a stable slot before/after load, and the entire drawing inside the
frame. Check actual colors and rendered ink; token arithmetic alone is not enough.
Browser and assistive-technology evidence must be reported separately.

Mechanism sources: Leonxlnx/taste-skill at
`ccbc15639c97057cbfcf32ecebc38ef716e4bb37`,
`skills/gpt-tasteskill/SKILL.md` §6 (inline typography image) and
`skills/minimalist-skill/SKILL.md` §6 (continuous ink with offset pastel fill).
CSS, HTML, SVG geometry and tests here are original adaptation work. The upstream
randomization, fonts, provider defaults, motion requirements and headline bans
are not adopted. See the owner's provenance records for the source notice.
