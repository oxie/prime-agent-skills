# Prime Agent Git-Synced Skill Maintenance

Load this reference when Task Observer has strong evidence that an installable
skill should change or a repeated workflow should become a new installable
skill.

## Outcome

Autonomously produce a **tested proposal commit** on an isolated Git branch and
worktree. Do not change the live `main` checkout until the user approves the
proposal. The proposal branch is the implementation artifact; Prime's
continual harness remains the observation and decision authority. Do not create
a second observation log or proposal database.

## Eligible targets

Automatic proposal creation is allowed only when:

- the target is inside the Git repository at `~/.prime/agent/skills`;
- the evidence identifies a concrete reusable improvement;
- the target and intended behavior are unambiguous;
- the repository is clean before the worktree is created; and
- no equivalent open proposal branch already exists.

Do not edit built-in skills under Prime Agent's installed package. Package
updates overwrite them. For a built-in skill, report the candidate and propose
an upstream contribution or an explicitly approved Git-managed override.

For third-party skills, read `UPSTREAM.md` and license information first.
Preserve attribution and record local divergence.

## Risk classes

**Low risk:** Markdown instructions, routing descriptions, references, examples,
static validation, and tests that do not add executable behavior, permissions,
dependencies, network access, credential access, or destructive commands.
Task Observer may author, validate, and commit a low-risk proposal without
asking first.

**Controlled risk:** scripts, Python/JavaScript packages, dependencies, hooks,
network or credential behavior, destructive commands, privilege changes,
provider configuration, global activation instructions, or changes to
`task-observer` itself. Task Observer may prepare a diff and run static checks,
but must get explicit user approval before executing changed code, merging, or
pushing it.

No proposal may include credentials, private task data, generated caches, build
artifacts, or unrelated changes.

## Create an isolated proposal

Use Python as orchestration memory. Generate a unique identifier from UTC time,
the target skill, and a short kebab-case summary. Use paths equivalent to:

- repository: `~/.prime/agent/skills`
- branch: `observer/<skill>/<UTC timestamp>-<summary>`
- worktree: `~/.prime/agent/skill-worktrees/<skill>-<UTC timestamp>-<summary>`

Before creation:

1. Run `git status --short` in the live repository. Stop if it is not clean.
2. Run `git worktree list` and `git branch --list 'observer/<skill>/*'`.
3. Inspect existing proposal branches and reuse or supersede a matching one.
4. Record the current `main` commit.

Create the proposal with one tracked `bash()` command equivalent to:

```text
git -C <repo> worktree add -b <branch> <worktree> main
```

Do not place proposal worktrees inside a skill-discovery directory. Never edit
the live checkout while preparing a proposal. Shell state does not persist
between Prime tool calls, so keep the exact branch and worktree paths in Python
variables and pass them explicitly on every command.

## Author the change

1. Load the built-in `skill-creator` instructions before editing.
2. Read the target's complete `SKILL.md`, relevant references, validator,
   tests, license, and upstream metadata.
3. Make the smallest change supported by the observation evidence.
4. Keep the skill name and directory aligned. Keep descriptions within Prime's
   1024-character limit.
5. Do not broaden tools, filesystem scope, network access, or credential access
   unless the proposal explicitly requires it and is classified controlled
   risk.
6. For a new skill, create a complete atomic skill directory rather than a
   placeholder.

## Improve instructions from real work

Use outcomes from authorized tasks as the primary evidence of instruction quality.
Do not launch synthetic agent trials, pressure-test loops or extra evaluation
workers merely because a skill changed. A separate model-based experiment requires
explicit user approval, a small fixed call/spend budget and a stopping rule. Do not
retry indefinitely to obtain a passing result. Ordinary task regression tests and
cheap deterministic link, metadata and contract checks remain required where
applicable; they prove their stated checks, not model effectiveness.

When actual work reveals a concrete instruction problem, first distinguish it
from a missing tool, access limit or runtime failure. Choose the smallest useful
form of guidance:

| Observed problem | Suitable change |
|---|---|
| A clear requirement is skipped | State the requirement and an observable check; address the demonstrated reason for skipping it |
| Output has the wrong structure | Give a short positive recipe for its parts and order |
| A necessary element is missing | Put a named required field in the existing output template |
| Behavior depends on context | Use an explicit condition tied to an observable fact |

For example, if a handoff repeatedly omits a completed exit code, add an exit/status
field to its existing result format rather than many general reminders to be thorough.
If a safe exception is real, express its condition directly; do not remove necessary
scope or safety nuance to make a rule shorter. These are design choices, not claims
that one wording always works better.

After approved changes and normal deterministic checks, assess the guidance during
the next relevant authorized task. Do not manufacture that task or retain a worker
waiting for it. A single successful use is limited evidence, not certification.
Route strong reusable lessons through Task Observer's existing continual-harness
path; create no second observation log, evaluation service or recurring test job.
See [source notes](../SUPERPOWERS_SOURCES.md) for the selected instruction-design idea
and the excluded synthetic testing workflow.

## Validate before committing

At minimum:

1. Run `git diff --check` in the proposal worktree.
2. Run the target's documented validator and tests through its own environment.
3. Inspect all executable changes before running them. Controlled-risk changed
   code requires user approval before execution.
4. Scan the worktree diff and untracked files for tokens, credentials, private
   data, caches, and build artifacts.
5. Confirm the diff touches only the intended skill and necessary repository
   documentation.
6. For routing, discovery, Python-backed behavior, or activation changes, run a
   fresh process using Prime's native loader or relevant local contract interface
   against the proposal. Verify the exact loaded path and metadata; for executable
   behavior also test the authorized tool/result contract. Use an explicit skill
   path when needed for an undiscovered worktree. Loading is not proof of model
   routing or effectiveness; extra model trials require the separate approval above.
7. Re-run validation after every fix.

If any gate fails, keep the worktree for diagnosis, report the failure, and do
not commit a ready proposal.

## Commit and present the proposal

When all allowed gates pass, commit on the proposal branch with a narrow message.
Do not merge or push automatically.

Report:

- observation evidence and general rule;
- target skill;
- risk class;
- branch, worktree, and commit;
- changed files and concise diff summary;
- validators/tests run and their outcomes;
- any untested behavior;
- whether upstream attribution or divergence changed;
- the exact approval requested.

A concrete Git proposal and its linked refinement have different roles. Git
contains the candidate implementation. The continual harness contains only the
reusable decision or cross-cutting lesson. Do not copy full patch content into
a harness entry.

## Merge only after approval

After explicit approval:

1. Verify the live repository is clean and still points to the expected base.
2. If `main` moved, rebase the proposal, inspect conflicts, and rerun every
   applicable gate.
3. Merge using a reviewable Git operation. Do not silently discard concurrent
   changes.
4. Validate the merged live skill again.
5. Run fresh native discovery checks as `prime-agent`, plus local invocation
   checks when executable behavior changed. Do not add model calls by default.
6. Scan repository files and Git configuration for persisted credentials.
7. Push only with a currently authorized secure credential. Never write a token
   into files, remotes, Git configuration, continual-harness entries, or commit
   history.
8. Remove the worktree and proposal branch only after the merged commit and
   remote state are verified.

If approval is declined, remove the proposal only when the user asks or when a
new verified proposal explicitly supersedes it.

## Concurrency

One proposal branch per distinct signal. Never let two agents edit the same
worktree. A subagent may prepare an artifact in its own session directory, but
the root owns the Git proposal, refinement request, merge decision, and remote
push. Require the subagent's non-empty result artifact before fan-in.
