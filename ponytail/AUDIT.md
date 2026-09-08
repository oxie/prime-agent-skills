# Ponytail installation evaluation

Reviewed upstream 4.9.0 at `356918eba965ee1eac64bd3a7f0dd02108350de5`.
Installed form: one on-demand Markdown skill, `4.9.0-prime.1`; no plugin runtime,
dependency, hook, configuration, persistent mode or standing-instruction change.
MIT attribution retained. Source and candidate reviews found no blocker to this
adaptation, not to verbatim installation of the upstream package.

## Completed evaluation

- Candidate contract tests: 7/7, exit 0. These assert instruction content and
  packaging, not mechanical enforcement of agent behavior.
- Skill bundle validator: exit 0.
- Staged native loader: one skill, no diagnostics. Fresh offline Prime RPC
  default discovery found `skill:ponytail` at the correct staged path; exit 0.
  No model request or runtime configuration change was used for discovery.
- Bounded native model pilot: implemented profile caching using an existing
  TTLCache helper and stdlib deep copies. The parent reran 8 functional tests:
  all passed, exit 0, after the unimplemented baseline failed. Outcomes cover
  reuse, exact TTL boundary, user/token isolation, both nested-mutation paths,
  failure non-caching and validation before fetching.
- Read-only pilot review: one conditional duplicate-helper finding; required
  validation and retry semantics were preserved. Parent verified unchanged
  fixture hashes and exactly 4 physical shortcut comments with 1 missing trigger.
  Python string literals and documentation/vendor/build examples were excluded;
  HTML and multiline CSS comments were counted. Missing trigger is represented
  by JSON null plus an explicit count, rather than a literal no-trigger tag.
- Core host verification: exit 0, 45 Python tests, safe pre-patch reproduction,
  Node lifecycle/recovery and security-boundary checks passed as prime-agent.
- Separate isolated status and then doctor smoke tests: each exit 0.
- Installed-path recheck: 7/7 contracts and bundle validation passed, exit 0.
  Native loader found 56 skills with no diagnostics; fresh offline RPC found
  `skill:ponytail` at the authoritative installed path, exit 0.
- Targeted secret-pattern scan of the 7 changed files and whitespace diff check
  passed. The pattern scan had a positive control; it is not a full secret audit.

## Limits

This is one instruction-guided synthetic pilot, not a blind routing test, A/B
benchmark, causal benefit estimate, or comprehensive code/security/browser audit.
Task wording and standing instructions also supplied safeguards. No upstream
benchmark or plugin was executed. No speed/cost/size gain is established.
Discovery proves availability, not future selection or compliance. Multi-turn
mode drift, broad language comment parsing, wider caller contracts, production
concurrency/eviction and browser accessibility were not evaluated. No live daemon
restart or live-daemon health claim is made; status/doctor are isolated smoke tests.

Private execution artifacts and complete reviewer reports:
`/home/prime-agent/.prime/agent/session-artifacts/01a08063-bd38-7159-990f-08dd4732c56b/ponytail-20260908T100628Z`.
Re-run installed package checks with:

```text
node --test tests/ponytail.test.mjs
python3 task-observer/scripts/validate-skill-bundle.py ponytail
node tests/ponytail-discovery.mjs . /home/prime-agent/.local/lib/node_modules/prime-agent
```

Remote synchronization is a separate final gate. Its exact commit and remote-ref
receipt are recorded in the private task handoff after push verification.
