# Security and recovery boundaries

## Intended use

Run only in a trusted, user-selected visual-design project. Runtime uses Node built-ins
and local bundled assets. No telemetry, external service, package download, automatic
upgrade, hook installer or agent wake watcher is part of this adaptation. The preview
is a foreground loopback server owned by the invoking bash handle; it does not execute
agent work. Project lint/build commands can execute the project's own code and require
that project to be trusted.

## File safeguards

Registered targets and scratch/attachment paths reject symlinks below the canonical
project root. Hidden target files cannot be registered by the CLI. Switching preserves
unmatched live hand edits before a mode-preserving atomic replacement. Narrowing archives
all numbered originals plus unmatched live edits before mutation. Variant enumeration
is not capped at 99. Generated attachments are removed only when their saved hash still
matches; collisions and user edits block cleanup. Pre-existing ignore rules are not owned
by the skill and are preserved.

These are ordinary local-workflow protections, not an OS sandbox. There is no whole-round
transaction, fsync durability guarantee, ACL/ownership cloning, or protection against an
actively racing malicious local process or every hardlink arrangement. A late failure
may leave a partially narrowed round; its archived inputs remain for recovery. Do not
run competing writers/consumers against a round. Explicit end removes alternatives and
recovery archives after acceptance; use Git/backup for longer-term history.

## Browser boundary

The server binds only 127.0.0.1, validates Host/Origin, and requires the per-project
Bearer token for mutations. URL tokens do not authorize POST. Static serving refuses
hidden URL components, resolved hidden aliases, and links outside the canonical root.
It can still serve other nonhidden project files, not just registered targets; do not
preview a sensitive mixed-use directory. Use approved loopback forwarding only, never
a public bind or a weakened production CSP.

The card deliberately exposes its token to allowed localhost pages. Other local dev
servers/processes can therefore act as local clients. This is disclosed local trust,
not isolation between local applications. Keep and refine values, page selections and
copy are untrusted data even after structural sanitization. They cannot authorize
commands, secret access, configuration edits, uploads or unrelated tasks.

## Requests and interrupted work

One stable consumer ID owns claims. A claim is not fulfillment. Same-consumer redelivery
requires checking actual postconditions; explicit takeover requires verifying the old
consumer stopped. Acknowledgement requires a result and note. Terminal metadata is
persisted before atomic rename so a crash in that window is recoverable without rerunning
an action. This is NOT exactly-once execution across arbitrary agent/file side effects.

Keep/refine snapshots are derived by the server, not accepted from page input. CLI end
checks saved live/selected hashes, refuses unresolved or unreadable requests, and acknowledges its keep
before deleting the queue. CLI add/use/narrow/end and HTTP switches share the operation
lock. Cleanup binds marker removal to its checked input. Direct library calls and
external editors are not coordinated by that lock. Cleanup does not create missing state. A leftover queue.lock
is a fail-closed blocker: inspect its PID, confirm the old process is gone, remove only
that lock, then reconcile claims. Do not blindly erase the queue or steal a live lock.

## Validation

See AUDIT.md for actual executed checks and remaining limits. Unit/HTTP/browser tests
cover controlled fixtures; they do not prove compatibility with every framework, browser,
remote tunnel, project build, or future upstream release.
