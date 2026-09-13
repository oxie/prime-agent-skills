# Optional reference-originality evidence cross-check

Use when a reference-led design needs a concrete overlap review. Select the relevant
supplied references and current target surfaces; reuse the existing task note or
[reference synthesis](reference-synthesis.md) output. No automatic registry, scanner,
Git-history audit or extra design pass is created. This is a design/provenance review,
not a legal verdict, a numerical originality score or release clearance.

## Pair evidence before judging resemblance

Give both sides reproducible locations: file and line, rendered section and viewport,
asset path/hash, or video frame with original timestamp. State whether evidence is
source-only, actually rendered, or unavailable. Source text may be a comment, test or
attribution rather than something visitors see. A screenshot cannot reveal shipped
hidden files; file bytes cannot prove an image's crop or a video's choreography.

Use only relevant rows, not a mandatory category quota:

| Category | Reference location | Target location | Observable overlap | Meaningful differences | Evidence limit / response |
|---|---|---|---|---|---|
| Copy and identity | Exact headline/mark and location | Rendered copy, metadata, alt text or source location | Specific phrase, slogan, wordmark, unusual claim | Different message/audience, not synonyms alone | Preserve the user's actual brand; rewrite borrowed copy from verified content |
| Media and assets | Exact image/video/font/code asset | Exact used file and rendered crop | Identical bytes or visible subject/pose/crop/prop arrangement | New composition, subject, source and role | Rights/provenance are a separate check; hashes miss re-encodes and crops |
| Structure and choreography | Section/frame sequence with timestamps | Corresponding section/state sequence | Unusual arrangement, pinned handoff, reveal sequence or edit rhythm | Different hierarchy, pacing and content-led progression | Easing/causality inferred from video stays uncertain |
| Factual claims | Source price, metric, date, named customer | Target claim and evidence | Unusual number plus wording or repeated proof story | Independently verified real fact | Remove unsupported claims; do not perturb numbers to disguise copying |

Mark the checked scope, specific findings and unknowns. “No material overlap found in
these supplied views” is narrower and more accurate than “originality passed.” Do not
retrieve other sites, inspect all history or publish comparison materials without the
corresponding task scope. If history was not checked, say so rather than imply no past
exposure. Even an authorized history check must distinguish past presence from what
is currently shipped; this reference provides no history-scanning executable.

## Distinctive combination versus false positive

Large sans-serif type, monochrome, one accent, a hero followed by pricing, common
icons, a framework, fade/slide/parallax, or an ordinary stock-photo subject are weak
signals alone. A supplied open-source component may legitimately appear on both
sides under its license. Shared short UI copy such as “Learn more” is not persuasive
copying evidence by itself. A source brand in an attribution note is not necessarily
a leaked replacement identity.

The combination can matter even when each ingredient is generic. Compare spatial
relationships, negative-space shape, subject pose, motif arrangement and the sequence
in which they appear. Changing color, a font or several isolated details does not
resolve a distinctive whole-scene reconstruction.

**Hypothetical pair:** reference `ref-hero.png`, center-right crop, shows a suspended
chair in an oval opening above a stair; `ref.mp4` 00:02–00:05 rotates that chair as
three chapter labels lock sequentially to the stair. Target `hero.png`, same region,
uses a stool in the same opening and `target.mp4` 00:03–00:06 repeats that ordered
handoff. Orange replacing blue is a difference, but the unusual composition and
sequence remain a concern. By contrast, two unrelated pages using sticky chapter
labels alone need no escalation. These are examples, not inspected assets or findings.

Respond at the relevant owner: rewrite copy from the actual offer; replace media
with approved material and a different composition; or re-sequence the interaction
around the target content. Do not rename the user's real brand just to look different,
invent customers/results, or replace necessary functional conventions for novelty.
Check exact asset licenses separately; distinctive resemblance does not prove a legal
violation, and low resemblance does not grant asset rights. Report uncertain rights
or consequential legal questions for qualified review rather than certify safety.

Method adapted selectively from MengTo/Skills, commit
`321c769739b823de5eb94eb3a52aa1974fe783a2`,
`audit-reference-originality/references/audit-rubric.md`.
