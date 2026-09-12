# Original Prime guidance and source record

This skill is newly written implementation guidance and original examples under
[MIT](LICENSE). That license applies to this new Prime material, not to an assumed
copy of an upstream skill. No upstream Astro Builder or Taste text/examples, scripts,
assets or license notices are redistributed. No author endorsement is implied.

## Inspiration reviewed, not copied

The user's positive experience prompted review of
[IncomeStreamSurfer/astro-builder-skill](https://github.com/IncomeStreamSurfer/astro-builder-skill/tree/8b2343c6b515b80ea44f9c69a16dd38d54e6e9ae),
commit `8b2343c6b515b80ea44f9c69a16dd38d54e6e9ae`. The useful idea is a connected
path from agreed pages through a shared shell, structured content and actual site
delivery, rather than disconnected design or framework advice.

The complete pinned tree has 12 files. package.json declares MIT and names
kraftagency, but supplies no actual author's copyright/permission notice. A bounded
five-commit canonical history check (including the four earlier full trees and 15
additional unique source blobs), repository metadata/license endpoint and current
public npm lookup did not resolve it. Repository license and npm endpoints returned
404 during review; that is not proof the package never existed or its declaration
is invalid. Embedded Taste material has separate unresolved exact provenance.
We did not invent the author's notice or treat a separately found Taste license as
permission for the whole bundle. Substantial future reuse requires resolving notices.

The new skill instead uses technical facts, primary Astro documentation and existing
approved Prime owners. It retains none of the original universal taste/SEO rules,
example business proof, installer, admin/database snippets, image-generation helper,
cloud setup, analytics or automatic deployment. Provenance records distinguish
reviewed inspiration from technical references and original installed files.

## Primary technical references

These are links to evidence, not external instructions or auto-update sources.
Docs are time-bound; recheck the selected project's version before using APIs.
The worked contract concerns Astro 5/6 build-time Content Layer, not every later release.

- [Archived Astro 5 content guide](https://v5.docs.astro.build/en/guides/content-collections/)
- [Astro 5.0.0 package exports](https://github.com/withastro/astro/blob/astro%405.0.0/packages/astro/package.json)
- [Astro 5.0.0 Zod re-export](https://github.com/withastro/astro/blob/astro%405.0.0/packages/astro/zod.mjs)
- [Astro 5.0.0 glob loader](https://github.com/withastro/astro/blob/astro%405.0.0/packages/astro/src/content/loaders/glob.ts)
- [Astro 5 migration](https://docs.astro.build/en/guides/upgrade-to/v5/)
- [Astro 6 migration](https://docs.astro.build/en/guides/upgrade-to/v6/)
- [Content loaders](https://docs.astro.build/en/reference/content-loader-reference/)
- [Styling/Tailwind](https://docs.astro.build/en/guides/styling/)
- [Images](https://docs.astro.build/en/guides/images/)
- [Islands](https://docs.astro.build/en/concepts/islands/)
- [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Forms](https://docs.astro.build/en/recipes/build-forms/)
- [RSS](https://docs.astro.build/en/recipes/rss/)
- [Sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)

Source checks confirmed that astro/zod is already exported in Astro 5.0.0, not
introduced only in 6; Zod 3/4 behavior still differs. They also confirmed the glob
frontmatter-slug-to-ID behavior. Current loader docs include newer options not part
of the 5/6 contract. We did not copy those into a version-agnostic recipe.

## Validation and maintenance

provenance.json records reviewed source and primary-evidence hashes, original file
hashes and authorship boundaries. Source identities are not correctness or legal
certification. Native discovery, document contracts and a pure predicate fixture
check are not an Astro build or proof of output privacy, UI behavior or SEO gains.
The project-specific publicNotes, layout and build-cutoff adapters are not supplied;
this is a skill, not a tested starter application. Verify them in each actual project.

Updates are manual and approval-scoped: review changed source/APIs, preserve existing
owners and permissions, validate native availability and relevant contracts, then
commit/push/verify the authoritative skills remote. No upstream installer or background
updater. Removing this directory removes the skill; no provider/config cleanup needed.
