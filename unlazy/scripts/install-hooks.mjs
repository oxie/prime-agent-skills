#!/usr/bin/env node
// Prime adaptation: no hook/configuration mutation path is available.
process.stderr.write("Unlazy Prime: Claude hook installation and removal are disabled. No settings were read or changed.\n");
process.exitCode = 2;
