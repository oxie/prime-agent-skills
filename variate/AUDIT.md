# Installation audit — 3.2.0-prime.1

Validated 2026-09-06 as `prime-agent`, with Node v22.22.2 and Prime Agent 0.9.3.
Pinned upstream source and licenses: see UPSTREAM.md. Tests run against the integrated
Prime adaptation, not only the private worker copies. No extra packages were installed.

## Executed checks

| Check | Result |
|---|---|
| `bash dev/smoke-cli.sh` | Exit 0; 61 core/request/CLI tests |
| `bash dev/smoke-http.sh` | Exit 0; 16 attachment and real HTTP tests |
| Real Chromium test below | Exit 0; 22 checks, 1/2/3/4 variants, desktop and 390px |
| `/home/prime-agent/scripts/verify_core.sh` | Exit 0; 45 harness tests, kernel lifecycle/recovery and security checks |
| Prime native skill loader | Exit 0; exactly one Variate skill, no diagnostics |
| Fresh isolated Prime CLI RPC `get_commands` | Exit 0; `skill:variate` resolves to this SKILL.md; no model request |

Node suites cover file-loss recovery, positions above 99, sparse extension guidance,
symlink rejection, mode preservation, stale atomic writes, failure-injected cleanup,
consumer ownership and redelivery, terminal-ack recovery, malformed requests, lock
refusals/replacement ownership, and closed-workspace non-recreation. Actual foreground
CLI previews exit after authenticated shutdown. Edited/unowned Nuxt files are preserved;
Vite multiline imports pass `node --check` and no-final-newline files restore exactly.
HTTP tests cover Host/Origin/Bearer gates, hidden static aliases, SSE shutdown, and
switch refusal while cleanup holds the shared lock.

## Browser evidence

Run from this directory (Node 22 CDP driver):

```
CHROMIUM_BIN=/path/to/chromium bash dev/smoke-card.sh --artifacts /absolute/evidence-dir
```

This machine used `/snap/chromium/current/usr/lib/chromium-browser/chrome`,
Chrome/152.0.7977.64, with sandbox intact. `/snap/bin/chromium` failed due to the host's
snap cgroup context; no sandbox bypass or system reconfiguration was used.
The browser test has a 90-second overall deadline and bounded state checks.

Real hit-tested arrows changed both exact target bytes and fresh rendered document
text. Keep queued the exact set/position plus server-derived hashes. At 390 × 844,
the card fit at x=10, width=370; arrow and keep controls remained usable. Desktop
and mobile screenshots were opened and visually checked. Fixtures/profile were
removed, browser exited 0, and sidecars closed.

See [browser-result.json](dev/evidence/browser-result.json),
[desktop](dev/evidence/desktop-1280.png), [mobile](dev/evidence/mobile-390.png),
[CLI output](dev/evidence/cli-regressions.txt), and
[HTTP output](dev/evidence/http-regressions.txt).
The original browser assertion was updated to require the new trusted snapshot fields;
the full corrected test then passed against the final runtime.

## Limits and operation

Tests do not establish universal framework compilation/HMR, Android/iOS touch behavior,
keyboard/reduced-motion accessibility, remote forwarding, or design quality on a user's
site. Native project builds and project-specific visual checks remain required.
No model-driven design generation was run for installation discovery. There is no
whole-filesystem transaction or exactly-once agent action guarantee; see SECURITY.md.

Preview is on demand, foreground and loopback-only. Browser clicks queue work but do
not wake an idle agent. No hooks, autonomous agent loops, schedules or retained workers
are part of the installed workflow. Full end deliberately deletes unselected variants
and recovery archives after acceptance.
