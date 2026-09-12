# Selected on-demand reference sources

Collection: [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills),
reviewed commit `bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3`. Credit the named repository contributors
for the selected source material below. No endorsement is implied.

The collection declares original non-code content **CC BY 4.0** unless a more
specific upstream notice applies. See [the declaration](licenses/AAS-LICENSE-CONTENT.txt)
and [full license](licenses/CC-BY-4.0.txt), also at
https://creativecommons.org/licenses/by/4.0/ . Original tooling's MIT license
is not a blanket license for skill prose. Community headers identify no more
specific author; the pinned attribution table and selected trees contain no
candidate-specific exception for the community references used here. This is
source-based attribution, not independent proof of authorship of every idea.

## Selected sources and modifications

### [references/shadcn-composition.md](references/shadcn-composition.md)

- [skills/shadcn/SKILL.md](https://github.com/sickn33/agentic-awesome-skills/blob/bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3/skills/shadcn/SKILL.md)
- [skills/shadcn/rules/base-vs-radix.md](https://github.com/sickn33/agentic-awesome-skills/blob/bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3/skills/shadcn/rules/base-vs-radix.md)
- [skills/shadcn/rules/forms.md](https://github.com/sickn33/agentic-awesome-skills/blob/bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3/skills/shadcn/rules/forms.md)

### [references/ui-localization.md](references/ui-localization.md)

- [skills/i18n-localization/SKILL.md](https://github.com/sickn33/agentic-awesome-skills/blob/bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3/skills/i18n-localization/SKILL.md)
- [skills/i18n-localization/scripts/i18n_checker.py](https://github.com/sickn33/agentic-awesome-skills/blob/bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3/skills/i18n-localization/scripts/i18n_checker.py)

**Modified for Prime:** selectively rewritten prose and locally synthesized
examples, without upstream executable implementations. Original explanatory
contributions to these new references use CC BY 4.0, with underlying third-party
rights retained. This does not relicense existing files in this skill.
Exact source and installed hashes are in next-provenance.json.

The shadcn source names [shadcn-ui/ui](https://github.com/shadcn-ui/ui/tree/2b3e6d4f8d9161fe5c19340dc383aade392012dd/skills/shadcn).
Its separately checked canonical pin is `2b3e6d4f8d9161fe5c19340dc383aade392012dd`. The two selected
rule files are byte-identical to the AAS copies; the entrypoints differ.
[MIT notice](licenses/shadcn-MIT.txt): Copyright (c) 2023 shadcn. The MIT
notice is retained for underlying shadcn material; CC BY 4.0 applies to the
new adaptation and any original AAS prose, not as a replacement for MIT.

Composition guidance removes moving-latest CLI execution, mandatory registry
fetches, rigid styling and unconditional form-component rules. Local wrappers,
versions, empty values and semantic focus/submit behavior control the result.
Localization guidance adds explicit locale/namespace/schema scope, formatting
semantics and partial/error coverage distinctions. The checker was reviewed
only to identify defects; **no i18n_checker.py code is copied or installed**.
Neither source authorizes providers, packages, downloads or app changes.

## Maintenance

No automatic updates or upstream installers. For an approved update, inspect
selected pinned sources and their rights, preserve local boundaries, update hashes,
run native document/discovery checks, then commit/push/verify the skills remote.
Source/text checks are not tests of application behavior or model effectiveness.
