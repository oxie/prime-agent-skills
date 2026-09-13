# UI Skills — selected sources and corrections

Reviewed [ibelick/ui-skills](https://github.com/ibelick/ui-skills/tree/79081abff1e887d55920f3debc11d78fea83a1b3)
at commit `79081abff1e887d55920f3debc11d78fea83a1b3`.
MIT, Copyright (c) 2026 Julien Thibeaut; [full notice](licenses/ui-skills-MIT.txt)
retained unchanged. No upstream endorsement. This is not a blanket license for
linked skills, packages, images, assets or other authors' work.

## Mapping and modifications

These additions use original, corrected wording, not upstream executable snippets,
demo components, external assets or linked Google/Anthropic/plugin text. Their local
explanatory text is MIT; other Hallmark MIT/Apache/CC-BY notices remain applicable to
their respective existing material. This does not relicense the rest of Hallmark.
Exact source URLs, Git blobs, SHA-256 and installed hashes are in
ui-skills-provenance.json. All paths in that manifest's files list are Hallmark-relative.

| Installed portion | Reviewed source |
|---|---|
| [audit.md](references/audit.md), added drift test and selected handoff | `skills/improve-ui/SKILL.md`, `skills/improve-ui/references/plan-template.md` |
| [tokens.md](references/tokens.md), added document/export-loss section | `skills/create-design-md/SKILL.md` |
| [interaction-motion.md](references/interaction-motion.md), control tuning | `interruptible-transition`, `popover-origin`, `ease-out-enter`, `menu-exit`, `subtle-exit`, `spring-vs-ease`, `icon-state-crossfade`, `motion-restraint`, `label-morph` demo source |
| Same reference, tooltip state and lifecycle | `tooltip-warm-demo.tsx`, `demo-card.tsx` |
| Same reference, conditional DOM diagnosis | `skills/fixing-motion-performance/SKILL.md` |

Demo shorthand above means `src/ui/playbook/<name>-demo.tsx`; full exact paths are
in the manifest. Playbook related-author selection is discovery metadata, not proof
that each related author created or licenses a lesson. No external linked source
body or image was copied. The selected repository declares MIT and has no separate
notice in these files; attribution is not legal certification of external lineage.

Corrections: distinguish design drift from optional visual advice and observed
functional/accessibility defects; no arbitrary finding quota, forced plan-only work,
extra approval for already-authorized implementation or compulsory design-plans folder.
Preserve current consumed sources, accepted decisions, aliases and themes; detect
export loss without a new alpha schema, unpinned CLI, information deletion or retry loop.

Motion remains optional and tied to real state, focus, accessible names, confirmed
operations and reduced motion. Tooltip warmth expires; pending callbacks and portal/
pointer/focus state need correct cleanup. No copied fake Copy/Save effects or incomplete
widgets. Example amplitudes/times are hypotheses, not validated limits. Deliberate
endpoint reads differ from thrashing; no universal scroll/CSS-variable/spring/blur ban.
No new library, public browser, trace capability, provider, schema runtime or installer.

## Validation and maintenance

Source/text/native metadata checks establish packaging, not agent compliance or
rendered behavior. Nonblind worked review scenarios are not efficacy measurements.
No real UI/export/performance/assistive-technology trial ran for this documentation
integration. Future implementations must use the target project's authorized checks.

The original audit/token bodies are preserved as exact prefixes, with prior hashes
in the manifest. Existing pilots and old source manifests stay unchanged; historical
outputs are not rebound to new guidance. Legacy tests with obsolete version/count/
payload assumptions remain historical failures, not newly passing evidence.

Update manually: recheck selected pinned content and rights, preserve scope and
current owners, inspect the diff, run focused tests/native discovery, then commit,
push and verify the authoritative skills remote. No background update process.
