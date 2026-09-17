# Higgsfield — optional provider integration

Use only when Higgsfield is selected for an authorized asset-production task.
Image and Video retain purpose, fidelity and delivery ownership; Ad Creative owns
paid-creative briefs and claims. Start with the connected
[website asset workflow](../../skills/image/references/website-asset-workflow.md).
A prompt/shot pack is a complete planning deliverable without provider access.
This guide is not an installer, new skill or default website platform.

## Before setup or execution

Use a pre-existing, approved CLI in the selected project. If unavailable, stop at
the handoff: installation, upgrades, authentication and workspace setup require
separate authorization and review of the actual CLI/version. Do not fetch a remote
installer or generate a test asset to prove setup. Keep credentials out of prompts,
arguments, assets and reports. Do not bypass the CLI with an improvised direct API.

Record the asset/shot revision, selected lane, destination, dimensions, duration,
reference files, allowed transformations and acceptance criteria in the existing
project brief. Approve the payload, provider/workspace, total spending ceiling,
maximum submissions/retries and stopping rule before uploading or generating.
Existing approval can cover that bounded envelope; harmless steps do not need
repeated permission. Provider access alone is not spending or upload permission.

## Discover the selected contract

The reviewed skills repository documents an external CLI; it does not contain its
implementation. These forms were source-checked, **not executed or verified as a
CLI contract**. Placeholder values are not runnable examples. During separately
authorized production, confirm the installed version and its command documentation
before using them; discovery can contact the provider.

```text
higgsfield model list --json
higgsfield model get <model_id> --json
higgsfield workflow list
higgsfield workflow get <workflow_name> --json
higgsfield generate cost workflow <workflow_name> <supported-cost-flags>
higgsfield generate get <job_id> --json
higgsfield generate wait <job_id> --json
```

Use the full catalog before concluding that a model is absent. Workflows have a
separate catalog; workflow lookup describes a schema, not an existing job. Save
the discovery date, CLI version and selected schema with the task. Check exact
IDs, media roles, count limits, duration, aspect, resolution and parameter spelling.
Do not translate underscore flags to hyphens by intuition. Inspect returned
adjustments: coercion to a different aspect or duration can invalidate the brief.
No model ranking, price or availability is fixed by this reference.

## References are uploads, not merely local paths

Bind every reference to its exact bytes/revision, source rights and intended role:
identity, product geometry, material, light, composition, start/end frame or motion.
Name what must remain unchanged and what may transfer. A style donor is not
permission to copy its people, logos or objects. Obtain missing real product views;
generated unseen geometry is a concept, not product evidence.

The source says local media paths passed to flags are **auto-uploaded**. Generic
generation also accepts upload UUIDs or prior job UUIDs; confirm what each ID
resolves to before reuse. These roles are distinct and schema-dependent:

| Input | Intended role |
|---|---|
| `--image` | Image reference; not universally a start frame |
| `--start-image`, `--end-image` | First/last-frame anchors where supported |
| `--video` | Reference, edit source or analyzed video, depending on the task |
| `--audio` | Audio reference, not a switch for output audio |
| `--image-references`, `--video-references`, `--audio-references` | Reference arrays only where declared |

Do not assume aliases, multiple references or job-ID reuse work across every
specialist command. Product-photoshoot documents local images or upload IDs.
Check the exact payload and destination, including URL-based product/brand imports.
A local filename or publicly visible image does not grant upload rights.

For faces, voices and restricted client material, confirm identity consent,
permitted uses and the actual customer agreement first. The reviewed Terms §4.4
permit commercial output use and transfer; exported-output rights survive account
termination, but uniqueness is not promised. Standard terms allow training on
inputs/outputs. The no-training/confidentiality exception applies to customers
**under an Enterprise Agreement**, not automatically to any paid or Business plan.
Privacy §2.4 distinguishes marketing consent from training permission. Section 5.9
allows removed content on active servers for 30 days and backups afterward;
deletion cannot undo prior training. Its separate derived-biometric-data statement
is not a promise that uploaded photos are immediately deleted. Recheck applicable
[Terms](https://higgsfield.ai/terms-of-use-agreement) and
[Privacy](https://higgsfield.ai/privacy-policy); these summaries are not legal advice
or verification of actual handling. Repository licenses do not clear media rights.

## Select a lane, then complete its handoff

**Product photoshoot — selected product stills or coordinated image packs.**
Map the placement to the documented mode: for example, `hero_banner` for a header,
`product_shot` for studio/catalog work, or `social_carousel` for connected slides.
The documented `product-photoshoot create` accepts mode, short intent, image
references, count and aspect override and waits internally. Its server enhances
the prompt and submits generation; do not describe it as executing your prose
unchanged. Preserve the submitted intent and any returned transformation; label
hidden enhancement as unavailable. Agree on acceptable transformations, inspect
actual results and seek approval for material changes. Exact marks, labels and
product shape still require comparison with approved originals. This lane is not
mandatory for every image or proof of superior output.

**Soul — explicitly authorized reusable identity.** Reuse a suitable existing
Soul before training. The source describes 5–20 varied, clear, single-person photos
and image/cinematic variants; confirm the current requirements and intended use.
After separately approved training, wait for completion and retain the returned
`reference_id`. Pass it as `--soul-id` only to a compatible discovered model.
A reference ID is not consent, and successful training does not prove likeness.

**Marketing Studio — selected ads, product or presenter workflows.** Start with
an approved product/import and optional authorized avatar. Choose either an ad
reference or hook/setting composition, not both. Hooks/settings apply only to
supported video modes; product and avatar fields use typed arrays rather than bare
IDs. DTC Ads requires a selected ad-format ID; confirm output settings and count.
Its documented `--cost-only` is an estimate path, not permission to submit.
Review imported metadata and generated copy. Do not invent endorsements or use
synthetic people as evidence of real customers. Marketing Studio brand-kit import
is metadata reuse, not the separate Brandkit approval/export system.

**Explainer — selected non-photoreal narrated production.** The documented lane
uses 1–10 whole minutes of ordered ten-second blocks, not every kind of explainer.
Select a live preset or approved custom style key, narrator, language, aspect,
character treatment and captions. Research factual claims before narration. Resolve
the style key, prepare paired narration/visual blocks, complete all audio takes,
then all matching clips, then submit assembly. Preserve one-to-one ordered pairs
with typed `audio_job` and `video_job` references. Budget 6–60 audio jobs and 6–60
video jobs, assembly, any custom style image, captions and approved retries.
Use Video's [educational explainer contract](../../skills/video/references/educational-explainers.md)
for support, measured timing and access. Server timing and speed-adjustment claims
must be checked in the delivered file, not accepted as proof.

## Cost, recovery and actual delivery

Estimate the **whole task**, including variants, training, assembly and retries.
If an estimate is unavailable, use an explicitly approved, defensible bounded-cost
policy or stop for a decision; never submit merely to discover the price. Check
remaining authorization before each paid stage. Stop at the cap or agreed repeated
failure threshold; no automatic batches or unbounded retries.

Save returned job IDs immediately. A wait timeout or lost submission response does
not establish job failure. Rejoin a known job; for an unknown submission outcome,
inspect authorized recent-job/status evidence and reconcile identity before another
submission. If unresolved, stop rather than risk duplicate charges. Diagnose actual
errors, not elapsed time; disclose material prompt edits rather than bypassing rules.

Inspect downloaded final-resolution images and decoded video/audio against the
brief: identity, exact text, product details, crop, continuity, motion, narration,
captions and playback. A URL or completed status is not acceptance. Revise the
observed defect within the approved envelope. Changed references, prompts or audio
invalidate affected outputs and review evidence; preserve approved predecessors.

Deliver selected files, hashes/revisions, output and job IDs, prompt/schema/settings,
source/reference mapping, approval status and inspection limits in the existing
project handoff. Keep rejected revisions distinct. Image owns optimized crops;
Video owns final export checks. The site owner implements semantic text,
poster/static/reduced-motion alternatives and verifies the actual page. Generation
is not publication approval. Vendor virality scores are not measured retention.

## Sources and deferred capabilities

[Higgsfield source notes](../../HIGGSFIELD_SOURCES.md) identify the pinned official
0.12.0 documentation and OSideMedia direction material reviewed on 2026-09-17.
No provider/runtime validation occurred. Full Brandkit executable state, preview
and editable-export tooling remains deferred, not installed by this guide.
Higgsfield hosted websites/apps also require explicit platform adoption; ordinary
website ownership does not move here. No automatic memory, ledger, schedules,
source relocation or model-refresh service is introduced.
