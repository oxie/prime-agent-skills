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
   fresh Prime Agent process against the proposal. Use an explicit `--skill`
   path when testing the undiscovered worktree, and verify the exact path and
   tool/result behavior rather than trusting a model statement.
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
5. Run a fresh Prime Agent discovery/invocation test as `prime-agent`.
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
