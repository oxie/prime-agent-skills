# Auteur selection — source and adaptation

Cinematic UI `1.1.0-prime.1` selectively adapts
[agiwhitelist/auteur](https://github.com/agiwhitelist/auteur), package `1.3.1`,
at commit `9bca227df9877e60dc45d49783c8cbd885eccd9b`. This is not an endorsement or
an installation of the complete Auteur skill. The existing Cinematic UI source
and license in [UPSTREAM.md](UPSTREAM.md) and [LICENSE](LICENSE) remain unchanged.

## Selected sources

All upstream links below target the reviewed pin. Machine-readable source Git blob,
SHA-256 and byte identities are in [auteur-provenance.json](auteur-provenance.json).

| Source | Local treatment |
|---|---|
| [direct.md](https://github.com/agiwhitelist/auteur/blob/9bca227df9877e60dc45d49783c8cbd885eccd9b/reference/direct.md), [STORYBOARD.md](https://github.com/agiwhitelist/auteur/blob/9bca227df9877e60dc45d49783c8cbd885eccd9b/templates/STORYBOARD.md) | [Production scenes](references/production-scenes.md): FEEL + LEARN, concrete shot/light/copy/asset decisions; fields are optional, not a required storyboard file |
| [assets.md](https://github.com/agiwhitelist/auteur/blob/9bca227df9877e60dc45d49783c8cbd885eccd9b/reference/assets.md) | Asset anatomy changes narrative choices; truthful controlled A → B, endpoint/transition distinction, accepted masters versus delivery derivatives |
| [taste.md](https://github.com/agiwhitelist/auteur/blob/9bca227df9877e60dc45d49783c8cbd885eccd9b/reference/taste.md), [verify.md](https://github.com/agiwhitelist/auteur/blob/9bca227df9877e60dc45d49783c8cbd885eccd9b/reference/verify.md) | Category/anti-category/house-reflex questions, figure/ground and payoff-ranked comparison within existing review; not bans, scores or novelty quotas |
| [ambient-backgrounds.md](https://github.com/agiwhitelist/auteur/blob/9bca227df9877e60dc45d49783c8cbd885eccd9b/reference/ambient-backgrounds.md) | [Quiet surfaces](references/quiet-surfaces.md), [CSS](assets/quiet-surfaces/quiet-surfaces.css), [grain SVG](assets/quiet-surfaces/grain.svg): selected static mesh/grain/ledger ideas and mesh/ledger structure, rewritten as local opt-in wrappers |

The daylit instrument, quiet atlas and repair-pair examples are original hypothetical
web directions, not observed product facts or a tested design-quality improvement.
The dot SVG, local stacking architecture, explicit light/dark presets, forced-colors
fallback, semantic fixture and verification code are adaptation-authored. The grain
is fixed vector dots, not upstream's data-URI turbulence filter or a pre-baked raster.
Only library CSS and the local SVG are reusable assets; demo styling is separate.

## License and rights

[licenses/auteur-MIT.txt](licenses/auteur-MIT.txt) preserves the upstream MIT license
verbatim, including `Copyright (c) 2026 agiwhitelist`. Retain it with copies or
substantial adaptations of this selection. Adaptation-authored contributions are
also offered under MIT; copyright (c) 2026 Prime Agent contributors.

The repository license does not grant rights to third-party websites, photographs,
models, fonts, clips or generated-provider outputs. No such media, demo screenshot,
paid corpus, provider configuration or network dependency is bundled. A scene plan
is not permission to fetch, generate, upload, purchase or publish an asset.

## What was deliberately not installed

- A competing default design owner, mandatory research/files/generation, aesthetic
  bans, minimum scene/effect counts, or an obligatory cinematic treatment.
- The scroll-flight engine, scroll-cinema WebGL recipes or animated contour/ink/
  dust/haze implementations. Their lifecycle, seams and other defects need separate
  review and hardening before any future adoption.
- The upstream linter, Playwright browser/recon tools, sourcing/downloading scripts,
  media CLIs, plugin metadata, CI, installers, dependencies or runtime configuration.
- Claims that static CSS costs nothing, a contrast base guarantees decorated
  contrast, metadata proves model behavior, or a linter exit certifies design.

## Scope and evidence

Use these additions selectively through Cinematic UI's existing routes. Hallmark
still leads usability/reference synthesis; Canvas Effects remains the existing
owner for a separately authorized animated implementation. No global instructions
or automatic services changed. Source instructions were treated as data.

The standalone [fixture](assets/quiet-surfaces/index.html) uses the actual library.
Its source checks and any documented local captures concern that fixture, not all
browsers, assistive technology, device performance or real-host integrations.
The project-specific budget, contrast, layout and interaction checks still apply.
