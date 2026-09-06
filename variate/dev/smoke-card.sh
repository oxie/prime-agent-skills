#!/usr/bin/env bash
# Prime adaptation: bounded tests; no detached preview, broad pkill or hook probes.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
node dev/test-browser-prime.mjs "$@"
