# Variate for Prime Agent

An on-demand visual-design skill adapted from [Nutlope/variate](https://github.com/Nutlope/variate).
Node 18+ built-ins only at runtime. No package installation or build is needed for the
skill itself. See `SKILL.md` for usage, `UPSTREAM.md` for provenance and divergence,
and `SECURITY.md` for trust boundaries.

It writes real alternative files, optionally previews them on a local card, and keeps
the accepted code. The agent handles setup and checks when the user asks for design
alternatives. Preview runs in a recorded foreground process. No hooks, wake jobs,
polling loop, or unattended agent are installed. Card decisions require a relevant
chat message to resume the agent.

Full cleanup deletes unselected alternatives by design. Preserve a Git baseline or
external backup when longer-term comparison history is needed. Symlinked targets are
refused rather than followed.

## Validation

Run Node built-in regressions from this directory:

```
bash dev/smoke-cli.sh
bash dev/smoke-http.sh
```

The browser regression is separately documented in `AUDIT.md`; it requires a suitable
Chromium binary and Node 22 for the dependency-free CDP driver, not extra runtime
skill packages. Never claim browser validation based only on source-string checks.

Install/update only through the user's authoritative `prime-agent-skills` checkout,
with validation, commit, push, and remote-ref verification. Do not run upstream
cross-agent installers or create symlinks into unrelated agents' skill directories.
