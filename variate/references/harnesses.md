# Prime Agent integration

This adaptation targets Prime Agent, not Claude/Codex hook machinery. `SKILL.md`
is authoritative. The upstream cross-agent installer and wake watcher are not shipped.

- Launch a requested preview with `h = bash('node <skill>/variate.mjs up --root <project>')`.
  Save `h` and its PID. It is a foreground process controlled by the harness, not a
  detached daemon. Inspect startup output later; never await its lifetime or sleep-poll.
- Present variants and end the turn. An idle agent is not listening to card clicks.
  Requests survive on disk and are processed on the user's next relevant chat message.
- Use one stable session consumer ID for nonblocking `peek`/`drain`/ack. Claiming is
  not fulfillment. On interrupted work inspect postconditions before retrying or acking.
- Finish with the CLI's `end`; verify its exit/result and that the recorded preview
  handle exits. If cleanup fails, preserve state and diagnose. Never use broad pkill.
- Parallel drafters are optional for large rounds, not required. Assign each a different
  new variant path. They must not switch/narrow/end or consume the request queue.
  Require complete result artifacts before accepting their work.
- Browser access must use approved loopback/forwarding. There is no automatic browser
  tunnel, public bind, provider configuration, or sandbox override in this skill.

Other agent harnesses need their own reviewed integration. Do not assume the removed
upstream waiting/hook instructions remain supported.
