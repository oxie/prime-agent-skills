# Native agent dispatch

Use this contract whenever orchestrated mode has two or more independent `READY` leaves. Unlazy records native launches; the host creates the agent sessions.

For one wave, every native launch call and every `start` record must finish before the first wait, join, result read, or return record.

## Open and seal a launch wave

Claim every leaf first. Partition more `READY` leaves into later waves when they exceed the host's current concurrency limit. Then open one wave with the exact ids:

```text
node <skill-dir>/scripts/dispatch-check.mjs open --scope <scope> --wave ready-1 --leaf leaf-1.1.1 --leaf leaf-1.1.2
```

For each leaf, call the host's native nonblocking launch tool and record the opaque, nonsecret handle it returns:

```text
node <skill-dir>/scripts/dispatch-check.mjs start --scope <scope> --wave ready-1 --leaf leaf-1.1.1 --handle <host-agent-id-1>
node <skill-dir>/scripts/dispatch-check.mjs start --scope <scope> --wave ready-1 --leaf leaf-1.1.2 --handle <host-agent-id-2>
```

Seal the wave before waiting for any result:

```text
node <skill-dir>/scripts/dispatch-check.mjs seal --scope <scope> --wave ready-1
```

Seal fails until every declared leaf has a distinct start handle. `return` fails before seal. These refusals catch the serial pattern where a driver launches one leaf, waits for it, and only then launches the next.

When a native agent finishes, record the return before parent re-verification:

```text
node <skill-dir>/scripts/dispatch-check.mjs return --scope <scope> --wave ready-1 --leaf leaf-1.1.1
```

A return records scheduler completion, including a failed worker result. It does not mark the leaf `VERIFIED`; the parent still runs the leaf gates and reviews manual evidence.

Check the finished wave with:

```text
node <skill-dir>/scripts/dispatch-check.mjs status --scope <scope> --wave ready-1
```

`status` exits `0` only after every declared leaf returned. Dispatch state and timestamps live in `.unlazy/<scope>/dispatch.json`; lifecycle events also append to the scope status log. The atomic state transition is authoritative: if the later audit-log append is refused, the transition command still succeeds and prints a bounded warning that the state was committed. Inspect state before deciding what to do next; do not blindly repeat the transition.

The state loader requires string ids, handles, and abandonment reasons plus a possible transition history: returns require an all-started sealed wave, terminal timestamps must exist and follow prior transitions, and a fully returned wave must be complete. Hand-editing an impossible terminal state fails closed. The primary `gate-check.mjs --scope <scope>` reduction includes this aggregate state and cannot print `ALL MET` while a wave is open, sealed, abandoned, or invalid.

## Prime adapter

Use the native RLM admission, explicit messaging, atomic artifact and completed-exit
contract in [prime.md](prime.md). Launch independent leaves with `await rlm(...)`,
record real `rlm_child_id` handles, and seal before deliberate fan-in. Admission is
not the answer. End the turn while slow work runs; never invent a blocking join.
Verify a nonempty returned artifact and real exit evidence before successful fan-in.
The recorder neither creates nor authenticates Prime agents.

## Failure and fallback

If a native launch fails before returning a handle, leave the wave open, fix the launch problem, and retry that leaf. Do not seal a partial wave. If recovery is impossible, preserve the audit trail instead of inventing a handle or deleting state:

```text
node <skill-dir>/scripts/dispatch-check.mjs abandon --scope <scope> --wave ready-1 --reason "<bounded nonblank reason>"
```

An abandoned wave is terminal and `status` exits `1`. The Stop hook does not block on it, but emits a bounded `HANDOFF REQUIRED` message naming the wave without copying its free-form reason into the privileged host message. Surface the reason from dispatch state in the final handoff. If the host has no nonblocking launch capability, record the limitation in `PLAN.md`, execute a declared sequential fallback, and do not open or describe a parallel wave.

Opening a wave is an execution claim. Do not invent handles, record a foreground result as a start, or call simultaneous work proved merely because commands ran quickly.

## Evidence boundary

The recorder checks that supplied start records precede accepted return records. Only actual native admission receipts can support the separate claim that the host accepted those starts; the recorder does not authenticate handles. It does not prove worker honesty, exact CPU overlap, filesystem isolation, or successful integration. Leases, parent re-verification, and branch gates remain separate requirements.
