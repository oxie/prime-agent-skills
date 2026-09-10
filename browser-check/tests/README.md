# Manual tests

Use the existing `browser-use-tools/.venv/bin/python -I -B`, not the agent kernel.
Do not install dependencies. Give unit tests a fresh private HOME/config/TMPDIR and
clean telemetry/provider-free environment, then remove that scratch after completion.
`python -I -B -m unittest discover -s <skill>/tests -v` runs 25 boundary,
optional-listener and actual owned-process tests. The listener tests block network
connections; they do not launch Chrome.

`verify_cli.py --output /canonical/new/evidence` runs the real browser CLI against
owned synthetic local fixtures. It tests actual pixels, native input, origin refusal,
download/dialog policy, sensitive fields, cancellation and cleanup. Use its completed
exit and result, not process admission. No project preview or provider is involved.

`verify_media.py --mode full --deadline 160` retains the existing interactive-media
fixture regression. It requires the separately installed original fixture at
`~/.local/share/prime-agent/capabilities/interactive-media`; it does not fetch assets.
Evidence goes to `browser-use-tools/checks/run-*` outside Git. This backs the existing
runtime `checks/verify_browser.py` entrypoint. Cinematic UI and Canvas Effects keep
their own specialized test scripts; none of these is a general Impeccable rule scan.
