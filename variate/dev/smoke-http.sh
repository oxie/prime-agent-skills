#!/usr/bin/env bash
# Prime adaptation: bounded tests; no detached preview, broad pkill or hook probes.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
node --test dev/test-attach-prime.mjs dev/test-http-prime.mjs
