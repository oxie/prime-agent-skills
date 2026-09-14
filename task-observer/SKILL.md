---
name: task-observer
description: >
  Prime-native continuous skill observer for tool-using work. Load at the start
  of every session that will use tools, before the first task-specific tool
  call or plan. Detects reusable workflow patterns, user corrections, skill
  gaps, and improvement opportunities, then routes durable changes through
  Prime Agent's continual harness and refine capability as the sole source of
  truth. Also use when the user mentions task observation, skill improvement,
  the observation workflow, or "One Skill to Rule Them All".
license: "CC-BY-4.0; selected MIT adaptation (see UPSTREAM.md)"
metadata:
  upstream: https://github.com/rebelytics/one-skill-to-rule-them-all
  upstream-version: 3.1.0
  adaptation: prime-agent-native
---

# Task Observer — Prime Agent Native

Adapted from **Task Observer / One Skill to Rule Them All**, created by
Eoghan Henn / [rebelytics.com](https://rebelytics.com). The upstream method is
licensed CC BY 4.0. Canonical source:
[github.com/rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all).

This adaptation preserves the observation method while using Prime Agent's
continual harness. Prime's harness is the only durable observation and
refinement authority. Do not create a second observation database.

## Prime Session Start

Run this once at the start of a session that will use tools:

1. Load this file before the first task-specific tool call or before proposing
   a plan. The dedicated call used to read this file is the activation call,
   not a task-specific call.
2. Use the continual harness summaries already present in the system prompt as
   current context. Summaries can omit entries or truncate content: inspect relevant
   full entries through the native harness interface when needed. Do not scan unrelated
   entries, files, Git history, credentials, or every installed skill.
3. Keep the observer active silently for the rest of the session. Do not block
   the user's task and do not create setup files.
4. For casual conversation or a factual answer that needs no tools, remain
   inactive.

## What to observe

Look for evidence that can improve future work:

- a user correction that reveals a missing or weak rule;
- the same failure or workaround more than once;
- a reusable multi-step procedure;
- a stable user preference that should persist;
- a repeated delegation role;
- a gap that should become an installable skill;
- an existing skill whose instructions or validation are incomplete;
- a narrow policy that prevents a demonstrated safety or quality problem.

Never preserve secrets or credentials in either harness scope. Keep client-sensitive
details out of reusable lessons. Do not promote one-off task facts or transient
guesses into global lessons. Temporary task coordination stays local when needed.
Do not duplicate advice already represented in the harness.
When uncertain whether a signal generalizes, consult
`references/signals.md` and treat its examples as methodology, not as a
separate storage contract.

## Learn through real work

Judge instruction quality primarily during authorized tasks, not synthetic model
trials. Keep normal task tests and cheap deterministic skill checks; loading and
static checks do not establish model effectiveness. Extra model-based evaluations
require explicit approval, a small fixed call/spend budget and a stopping rule.
Do not create evaluation loops, background testing or extra workers just to test
instructions. Improve a concrete observed failure, then assess the change on the
next relevant real task. For the writing method, see
[skill maintenance](references/prime-skill-maintenance.md#improve-instructions-from-real-work).

## One persistence path: Prime continual harness

When there is a strong, evidence-backed observation:

1. Finish or safely pause the user's immediate task first.
2. Check the continual harness summaries in context. Do not duplicate an
   existing prompt, memory, skill, or subagent entry.
3. Choose scope **before calling refinement**. Stable, evidence-backed workflow
   lessons and durable user preferences that should survive a new session belong
   in the **global harness**. Pass `global_=True`; mentioning global scope only in prose is not
   enough. Qualify project-specific lessons with their project and conditions.
   Current-task progress, temporary blockers and worker handles stay local.
4. In a persistent root session, schedule one focused refinement from the
   Python REPL. Set the explicit scope flag to match step 3:

   ```python
   use_global = True  # Reviewed reusable lesson; use False for temporary local state.
   await refine.run("""Task-observer candidate.
   Signal: <new-workflow | improve-existing | simplify-existing>
   Source: <user correction | agent behavior | tool/project evidence | successful technique>
   Evidence: <specific event in this trajectory>
   General rule: <concise reusable and client-safe lesson>
   Target: <existing harness/installed skill, or new candidate>
   Scope reason: <why the selected local or global scope is appropriate>
   Make the smallest evidence-backed change; create no observation backlog.
   """, global_=use_global)
   ```

5. Continue normally. Refinement runs when the turn ends. One request per turn
   is enough. Do not edit harness state directly. A scheduled request is not proof
   of persistence: inspect the resulting entry and its scope before claiming it
   was saved. For cross-session availability claims, verify fresh-session loading.

### Cross-session learning contract

The purpose is to reuse strong lessons, not merely document the last task. When a
user correction or repeated failure yields a reusable rule, generalize away private
examples and temporary paths, check for an equivalent global entry, and request the
smallest global refinement. Keep weak or untested hypotheses out of global policy.
For a reviewed reusable lesson, the native call is:

```python
await refine.run(
    "Persist the reviewed reusable lesson as a focused global harness entry; "
    "exclude temporary task state and preserve approval/safety boundaries.",
    global_=True,
)
```

Use a prompt note for a narrow behavior rule, a memory for a durable fact/preference,
and a skill or subagent specification only when a sufficiently repeated procedure
or role warrants it. Do not turn every progress update into a global instruction.

Global means persisted across sessions using this Prime Agent installation's global
harness store. It is not a promise of backup to another machine or Git synchronization
of harness state. Installed skill files have their separate Git workflow below.
Never create a parallel lesson database or copy full session history into Git.

An instruction being loaded is not proof that mistakes cannot recur. Verify the next
relevant action, retain regression tests when appropriate, and report any remaining
limits honestly. Scope promotion does not authorize new tools, hooks, schedules,
credential access, runtime changes or automatic live-skill merges.

Use the smallest suitable harness component:

- **memory** for durable facts, decisions, or user preferences;
- **prompt note** for a narrow behavior or safety policy;
- **skill** for a reusable Python-call procedure with an explicit reference and
  argument contract;
- **subagent spec** for a repeated delegation role.

Continual-harness skills are not replacements for installable skills on disk.
Do not represent the same lesson in both a filesystem log and the continual
harness.

## Subagents

`refine` is owned by the persistent root session. A subagent must not call
direct continual-harness CRUD or create observer state. When a child finds a
qualifying signal, include a concise `REFINE_CANDIDATE` with Signal, Source,
Evidence, General rule, Target, and Scope reason in its required non-empty
result artifact and parent message. The root decides whether to call
`refine.run`.

If `refine` is unavailable in a root session, do not fall back to a filesystem
log. State once at delivery that the candidate was not persisted.

## Autonomous Git-synced skill improvement

The Git repository at `~/.prime/agent/skills` is authoritative for installable
skill source. Task Observer may autonomously turn a strong skill-specific
observation into a **tested proposal commit**. It must not change the live
`main` checkout, merge, or push merely from an observation.

For a concrete improvement:

1. Schedule the focused `refine` candidate in the root session. The harness
   records the reusable decision; it must not contain the full patch.
2. Load `references/prime-skill-maintenance.md` and follow it exactly.
3. Create a unique `observer/<skill>/...` branch in an isolated worktree under
   `~/.prime/agent/skill-worktrees/`, outside every skill-discovery directory.
4. Load the built-in `skill-creator` instructions, inspect the target and its
   provenance, and make the smallest evidence-backed change in that worktree.
5. Run applicable validation, tests, a secret scan, and fresh native loading
   or local contract checks when routing or executable behavior changes. Do not
   add model-based trials without their separate explicit approval.
6. Commit a passing proposal on its branch and report the evidence, risk,
   branch, commit, diff, tests, and exact approval needed.
7. Merge into live `main` and push only after explicit user approval, then
   revalidate the merged skill and verify the remote state.

Low-risk Markdown, reference, routing, and test improvements may be authored,
validated, and committed as proposals without asking first. Scripts,
dependencies, hooks, network or credential behavior, destructive commands,
global activation, provider configuration, and changes to `task-observer`
itself are controlled-risk: prepare and inspect the diff, but get approval
before executing changed code, merging, or pushing.

Do not patch built-in skills inside Prime Agent's installed package; updates
would overwrite them. Preserve those candidates through `refine` and propose
an upstream contribution or an explicitly approved Git-managed override.

A repeated, well-defined missing workflow may become a complete new-skill
proposal by the same process. Weak or ambiguous candidates remain harness
refinements only. Never create placeholder skill directories.

## Safety and autonomy boundary

Autonomy here means continuous observation during a user-started Prime Agent
session. It does not mean unattended background execution.

Unless the user explicitly requests it after the manual path is proven, do not:

- create `skill-observations/`, `skill-updates/`, or another backlog;
- install Claude Code hooks or use Claude-specific tool contracts;
- create schedules, heartbeats, autonomous runs, retained workers, or daemons;
- perform broad repository, history, home-directory, or credential scans;
- modify live skills, global instructions, or remote repositories merely from
  an observation;
- expose sensitive task content in a refinement instruction.

Follow Prime Agent's nonblocking tool and subagent rules. A delegated review is
not complete until its required artifact exists and is non-empty.

## Task boundary

At the end of meaningful work, make one silent check for a high-signal reusable
lesson. Schedule `refine` only when the evidence meets the rules above. Do not
add a repetitive user-facing "no observations" footer.

The upstream references remain bundled for attribution and selective
methodology lookup. Their Claude activation, filesystem-log, hook, and schedule
instructions are replaced by this Prime-native contract.
