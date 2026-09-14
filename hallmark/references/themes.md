# Theme catalogue

Optional starting points. The user and project system win; theme and page
structure are independent. No rotation or font, italic, white/black, or gradient
ban applies. Keep working brand choices and adapt only the roles needed.

For explicitly requested style, palette or font-pairing exploration beyond these
anchors, read the optional [offline lookup](../catalogue/README.md) first.

## Original upstream anchors: all 21 named themes

Source: upstream `site/css/tokens.css`. Palette order: **paper; ink; accent**.
Numbers and names are unchanged; spacing is normalized. Fonts show the first
two named source candidates (or sole candidate), **display → body**, not full
CSS stacks. Character labels are adaptation summaries. CSS wins where prose
notes conflict. Its header says 24, but base selectors and the skill list give
these 21. Lumen = Night Foundry; Carnival = Cold Snap.

**All contrast is UNVERIFIED.** Accent is not automatically safe as text, fill,
or focus. Fonts are suggestions subject to project availability and license;
MIT here does not license fonts. Prefer existing project fonts and suitable
system fallbacks. Do not fetch fonts or add packages to match this table.

| Theme | Character | Paper; ink; accent (source) | Display → body candidates (source) |
| --- | --- | --- | --- |
| Specimen | Warm oat editorial | `oklch(96% 0.018 80)`; `oklch(18% 0.014 60)`; `#FC4C02` | Fraunces / Tiempos → Geist / Söhne |
| Atelier | Cool cream, fashion serif | `oklch(94% 0.005 60)`; `oklch(12% 0.024 40)`; `oklch(22% 0.060 40)` | Playfair Display / Cormorant Garamond → Hanken Grotesk / Geist |
| Brutal | White sheet, red, heavy sans | `oklch(98% 0.001 0)`; `oklch(8% 0.005 0)`; `#E63946` | Albert Sans / GT America → Albert Sans / Hanken Grotesk |
| Newsprint | Salmon paper, broadsheet | `oklch(92% 0.045 50)`; `oklch(15% 0.030 25)`; `oklch(32% 0.10 28)` | Playfair Display / Crimson Pro → Crimson Pro / Newsreader |
| Studio | Cool light, green, serif | `oklch(96.5% 0.005 200)`; `oklch(13% 0.024 205)`; `oklch(46% 0.140 145)` | Fraunces / Tiempos → Geist / Söhne |
| Manifesto | Black, red, condensed | `oklch(10% 0.005 60)`; `oklch(98% 0.003 90)`; `#E51A1A` | Anton / Bebas Neue → Public Sans / Albert Sans |
| Terminal | Dark green, phosphor mono | `oklch(11% 0.018 145)`; `oklch(86% 0.160 138)`; `oklch(78% 0.190 138)` | JetBrains Mono / IBM Plex Mono → JetBrains Mono / IBM Plex Mono |
| Midnight | Cool charcoal, cyan, sans | `oklch(15% 0.022 250)`; `oklch(95% 0.008 230)`; `oklch(72% 0.16 220)` | Geist / Futura → Geist / Söhne |
| Almanac | Cool paper, blue, technical | `oklch(94% 0.008 245)`; `oklch(16% 0.020 245)`; `oklch(38% 0.135 250)` | Hanken Grotesk / Inter → Hanken Grotesk / Inter |
| Garden | Oat, botanical green, clay | `oklch(95.5% 0.022 92)`; `oklch(24% 0.052 152)`; `oklch(47% 0.13 140)` | Young Serif → Hanken Grotesk / Geist |
| Riso | Pink paper, cyan + yellow | `oklch(91% 0.034 30)`; `oklch(18% 0.060 30)`; `oklch(58% 0.170 220)` | Public Sans / Albert Sans → Newsreader / Tiempos |
| Sport | Cool light, orange, tight sans | `oklch(98% 0.003 250)`; `oklch(16% 0.080 260)`; `oklch(58% 0.190 35)` | Inter Tight / Albert Sans → Albert Sans / Hanken Grotesk |
| Bloom | Warm light, terracotta, sans | `oklch(97% 0.010 72)`; `oklch(20% 0.022 40)`; `oklch(56% 0.13 35)` | Geist / Inter → Geist / Inter |
| Coral | Warm grey, coral, clean sans | `oklch(96.5% 0.005 50)`; `oklch(20% 0.010 35)`; `oklch(64% 0.165 28)` | Geist / General Sans → Geist / General Sans |
| Cobalt | Cool light, cobalt, mechanical | `oklch(98.5% 0.004 250)`; `oklch(24% 0.020 258)`; `oklch(58% 0.20 256)` | Space Grotesk / Inter Tight → Inter |
| Aurora | Dark teal, cyan + green | `oklch(11% 0.025 200)`; `oklch(96% 0.010 200)`; `oklch(72% 0.170 200)` | Geist / Inter → Sentient / Geist |
| Editorial | Warm paper, orange, tight sans | `oklch(94% 0.020 75)`; `oklch(15% 0.014 280)`; `oklch(60% 0.160 35)` | Inter Tight / Inter → Inter |
| Carnival | Pink, mustard + oxblood | `oklch(92% 0.045 50)`; `oklch(18% 0.080 20)`; `oklch(86% 0.18 95)` | Big Shoulders Display / Druk Wide → DM Sans / Inter Tight |
| Lumen | Dark violet, brass + coral | `oklch(13% 0.014 265)`; `oklch(96% 0.006 262)`; `oklch(76% 0.17 50)` | Instrument Serif / Tiempos Headline → Geist / Inter |
| Hum | Cream, pear + cyan + coral | `oklch(97% 0.012 95)`; `oklch(20% 0.012 250)`; `oklch(86% 0.18 95)` | Plus Jakarta Sans / Geist → Plus Jakarta Sans / Geist |
| Grid | Cool sheet, signal red, grotesk | `oklch(99% 0.003 255)`; `oklch(16% 0.010 255)`; `oklch(55% 0.21 28)` | Archivo / Helvetica Neue → Archivo / Helvetica Neue |

### Additional source accent anchors

These preserve multi-accent themes without importing dependency CSS. `A2` and
`A3` mean upstream `--color-accent-2` and `--color-accent-3`.

- **Garden:** A2 `oklch(54% 0.14 46)`.
- **Riso:** A2 `oklch(78% 0.180 95)`.
- **Bloom:** A2 `oklch(64% 0.09 55)`.
- **Aurora:** A2 `oklch(64% 0.150 175)`.
- **Carnival:** A2 `oklch(40% 0.21 25)`.
- **Lumen:** A2 `oklch(68% 0.16 18)`.
- **Hum:** A2 `oklch(66% 0.18 235)`; A3 `oklch(68% 0.24 18)`.

## Proposed use, not source prescriptions

Map anchors to existing semantic roles; fill missing states only as needed.
A custom palette is valid. Do not create `tokens.css`, an alternate theme
system, or decorative chrome as a side effect. See [directions.md](directions.md)
for composition recipes. Omitted variants and source font fallbacks are not
required dependencies.

Measure actual rendered text/background, muted text, control boundary, and
focus contrast with the project's standard. Check relevant hover, selected,
disabled, loading, error, and success states. Report method and results;
no palette here asserts accessibility.

Provenance: Hallmark, copyright (c) 2026 Hallmark contributors, MIT;
[LICENSE](../LICENSE). Source commit
`13ac0ec7e148655948100b6396439e481361d690`; source values from
`site/css/tokens.css`, names from `skills/hallmark/SKILL.md`, with upstream
theme notes consulted. No upstream runtime or asset fetch is needed.
