# Bounded native skill discovery

Optional Prime Agent extension. It reduces only the first eligible Codex request's
skill **metadata**. It does not activate skills or grant permission.

## Scope

- Uses public native extension events and `formatSkillsForPrompt`.
- Supports only `openai-codex-responses`, with a string `instructions` field.
- Keeps the native registry, full session prompt, policies, Python roster, skill
  bodies and `/skill:name` invocation unchanged.
- Only the 15 reviewed Markdown entries in `cohort.json` can be hidden. Other,
  new, changed, Python or overridden-path skills remain visible.
- Native model-disabled entries never appear in discovery responses or fallback.
- No model calls, dependencies, ranking service, transcript reads, watchers,
  configuration writes or persistent state.

## Discovery tool

`discover_skills` accepts:

| Field | Meaning |
|---|---|
| `action` | Required: `search`, `get`, `list`, or `full` |
| `query` | Request or explicit skill references for `search` |
| `name` | Exact canonical native name for `get`; no fuzzy substitution or paths |
| `cursor` | Opaque continuation cursor for `list` or `full` |
| `limit` | Integer 1–100; default 25; applies to list/full only |

Examples:

```json
{"action":"search","query":"GA4 and PPC creative"}
{"action":"get","name":"ad-creative"}
{"action":"list","limit":25}
{"action":"full"}
```

Both `content[0].text` (JSON) and `details` contain:
`action`, `status`, `snapshot`, `skills`, `nextCursor`, `complete`, `fallback`,
and `guidance`. `skills` contains cloned native metadata, including canonical
`name` and `filePath`; never body text. Status is `ok`, `not_found`, `unavailable`,
`invalid_request` or `stale_cursor`. A `complete` response completes that action;
only list/full enumeration means the complete catalogue. Search returns the
union of bounded lexical name/alias matches, with no rank or limit cutoff. It
always provides `fallback: {"action":"full"}`. Zero matches do not prove absence.
No arbitrary paraphrase, non-English recall or task-quality claim is made.

Read the returned `SKILL.md` before using it. Resolve its relative paths from its
directory. Discovery does not authorize installs, paid providers, external
messages, schedules or other controlled actions.

List/full pages use stable canonical-name order within one native snapshot. Follow
`nextCursor` until `complete: true`. A new before-start snapshot or reload invalidates
old cursors, even when metadata has not changed. Restart without a cursor on
`stale_cursor`. An unavailable snapshot requires a new native turn or supported
reload. A missing/unreadable file returns `unavailable`, not cached content.
Metadata edits become current at the native refresh boundary, not via a watcher.

`full` also disables reduction for the rest of the current turn. Its response is
paginated, but the next provider request carries the full native eligible prompt.
Search and exact lookup work independently of automatic selection.

## Safety and lifecycle

`before_agent_start` captures native metadata and selects a conservative union.
It returns **no prompt replacement**. Native policy rebuilds remain authoritative.
At `before_provider_request`, reduction requires all of these checks:

1. The reviewed API and plain-object request shape are present.
2. `prompt_cache_key` equals the public native session ID. The Codex serializer
   obtains this field from the requesting Agent's session ID. This rejects inline
   SDK children that inherit their parent's payload callback/context.
3. `instructions === ctx.getSystemPrompt()` and cwd matches the captured session.
4. Both native active tool names and actual serialized function tools contain
   `discover_skills`.
5. The complete original native formatter fragment occurs exactly once.

A successful rewrite returns a new shallow request object. Only `instructions`
changes: the exact fragment is replaced by native-formatted retained skills plus
short discovery guidance. Original native order and all prefix/suffix bytes stay
intact. Other request fields retain their original references. Unknown API, missing
identity, stale metadata, altered instructions, duplicate fragment or any error
leaves the request unchanged. An earlier extension's incompatible rewrite therefore
fails open. Later extensions can still change requests; ordering immunity is not
claimed.

Reduction is **single-use per native before-start snapshot**. Subsequent tool,
retry and continuation requests default to full metadata. Full mode is sticky for
the turn. Session switch/fork/tree, compaction, refinement, shutdown and reload
invalidate transient state. New turns take a new native snapshot. This deliberately
limits savings rather than reusing an uncertain task query across requests.

## Cohort provenance

`cohort.json` records native parsed metadata fingerprints for ads, ad-creative,
analytics, attribution, customer-research, seo-audit, ai-seo, schema, marketing-plan,
pricing, video, image, sales-enablement, copywriting and social.

Fingerprint: SHA-256 of JSON `[name, description, kind,
disableModelInvocation, python ?? null]`, using native parsed values. Exact
canonical file and base-directory identity are checked separately. Source-info
labels can differ by native loading route; they are not a second precedence rule.
The extension uses the effective native registry, not a filesystem catalogue scan.
The native registry alone resolves name collisions.

Paths are relative to the source skill checkout. The root is computed from the
real extension file location (`../..`), not the symlink registration directory.
An isolated worktree qualifies only its own reviewed skill files; an installed
source checkout qualifies only its own. Unexpected skill symlinks remain visible.
A change to the cohort requires deliberate metadata review and regeneration with
the native parser, not hand-parsed frontmatter or an expanded directory wildcard.

## Native loading, validation and rollback

Source belongs under `<skills-root>/extensions/skill-discovery/`. The supported
native loader supplies the SDK and TypeBox import aliases. The helper `.mjs` uses
only Node standard-library APIs. Do not install an npm dependency to resolve these
aliases manually.

Root owns installation: register exactly this directory through supported native
extension discovery, such as a reviewed symlink under
`~/.prime/agent/extensions/skill-discovery`, then verify a fresh session or reload.
The source checkout alone is not registration. Do not patch the installed runtime.
Rollback removes only that owned registration, then uses native reload or a fresh
session. Existing sessions are not claimed to have reloaded automatically.

From the skills checkout:

```text
node --test extensions/skill-discovery/tests/unit.mjs
node extensions/skill-discovery/tests/native.mjs --extension /absolute/path/to/index.ts --artifacts /absolute/test-output --skills-root /absolute/skills-root
```

`PRIME_AGENT_DIST` can select the installed SDK for unit validation. The default is
this reviewed installation's `/home/prime-agent/.local/lib/node_modules/prime-agent/dist`.
The byte-identical frozen fixture is included in `tests/fixtures.json`; its hash
is checked on every unit run. `SKILL_DISCOVERY_FIXTURES` may select another copy,
but it must have the same hash. Independent native tests own serializer,
lifecycle and final byte evidence; unit tests alone do not
prove integration readiness. Neither is a paid model efficacy test.

Measure complete serialized native request boundaries, including guidance and
added tool schema. Report returned discovery metadata and retained context bytes
separately. Full/fail-open modes can cost more than baseline, and single-use
reduction does not imply sustained savings. Bytes are not tokens or dollars.
