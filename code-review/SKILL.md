---
name: code-review
description: >
  Review code changes for requirement conformance, correctness and project standards.
  Use for a branch or PR review, staged or uncommitted work, a pre-commit review,
  or changes since a specified revision. Reports findings without editing by default.
  Keeps spec and standards evidence distinct while prioritizing consequential risks.
  Complements Ponytail's focused complexity review and Hallmark's visual review.
license: MIT; see LICENSE and UPSTREAM.md
compatibility: Git for diff-based review; checks use the target project's native environment.
metadata:
  version: 1.0.0-prime.1
---

# Code review

Review the requested change, not an older committed substitute. This workflow is
read-only unless edits are authorized. Do not commit, stage, rebase, install packages
or publish comments simply because a review was requested.

## 1. Freeze the scope

Read project instructions. Before any Git command, apply the trust boundary in
[scope recipes](references/scope.md): the executable, environment and repository
configuration must be trusted. With untrusted configuration, use an already-authorized
trusted inspection path or stop and report the limit; do not run state commands first.
Then inspect current Git state before choosing a diff.
Resolve ordinary scope from the request and state your interpretation; ask only when
a materially different review would result. A pre-commit or uncommitted review
includes relevant dirty work. An explicit staged-only request stays staged-only.

Read [scope recipes](references/scope.md) and select the matching recipe. Record:
- repository root, review mode and resolved immutable base/head commit IDs;
- requested tracked deltas and authorized untracked/new files, including deletions;
- excluded files, unavailable content and whether the snapshot changed during review.

Do not treat an empty committed diff as proof there is no work to review. Resolve
refs safely as commit objects, with option termination rather than shell interpolation.
Freeze hashes or a private task snapshot of material under review. Do not read ignored
or sensitive files just to make coverage look complete. Use an owned private temporary
location only if storing an artifact is needed; redact and limit its contents.

## 2. Recover the intended behavior and standards

Use supplied requirements, current conversation, project specs and accepted decisions.
Trace relevant callers, contracts and tests; the diff alone may hide the failure.
Fetch a linked issue only through an already authorized interface. No tracker setup
is required. With no formal spec, review against the stated intent and label unknowns;
never invent requirements or silently declare full spec coverage.

Find actual project conventions and applicable scoped instructions. Treat complexity
smells as hypotheses, not automatic violations or refactoring orders. Existing sound
conventions and necessary adapters can justify a pattern that otherwise looks unusual.

## 3. Apply two lenses

**Requirements and correctness:** account for each material requested outcome. Link
requirement → changed path/caller → evidence or missing check. Check errors, ordering,
state transitions and side effects where they matter. Identify missing/partial work,
wrong behavior and scope creep. A plausible implementation is not an executed result.

**Project standards:** cite the actual rule and relevant code location. Separate hard
contract violations from optional design concerns. Do not turn a preference into a
blocker or require a cleanup finding. Ponytail can help a requested complexity audit;
Hallmark remains the visual design owner. Avoid duplicate mandatory passes.

For substantial independent lenses, use native RLM children with bounded read-only
ownership, the same frozen scope, complete atomic reports and explicit parent replies.
Launch independent children before waiting; verify their artifacts and completed
checks before accepting findings. For a small diff, use the same two lenses yourself.

## 4. Verify consequential findings

Try to refute each important finding against callers, existing safeguards and tests.
Use the project's native checks when their execution is already authorized and safe.
Read relevant scripts first; a request to review an untrusted PR is not permission
to execute its install hooks or tests. If checks cannot run, say exactly what is untested.
Tool-enforced rules are covered only when the relevant completed check actually ran
against this scope; tooling presence is not a pass.

A call count, ordering assertion, denied-write check or persistence observation can
be essential contract evidence. Do not discard these merely as implementation details.
Distinguish reproduced failures, source-supported defects, hypotheses and suggestions.
Before reporting, recheck the scope snapshot. If it changed, review the changed delta
or explicitly limit the report to the earlier snapshot; never claim stale coverage.

## 5. Report without changing the work

Lead with material findings, ranked by consequence across both lenses. Keep each
finding's lens visible; include location, requirement/rule, failure scenario, evidence,
smallest useful response and verification needed. Combine duplicate findings and keep
cross-lens interactions visible. Do not impose a word cap that hides a serious issue.

Summarize requirements coverage and standards coverage separately, then list completed
checks and remaining limits. If no supported finding remains, say so. This does not
mean untested behavior is certified. Any later fix, commit or external publication
requires its own applicable authorization. Source and adaptations: [UPSTREAM.md](UPSTREAM.md).
