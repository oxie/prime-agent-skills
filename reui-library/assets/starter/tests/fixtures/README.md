# Host theme regression fixture

`npm run build` includes host-theme.html in the production output. With the owned
manual preview running, inspect `/tests/fixtures/host-theme.html` through the normal
local browser-check tool. This is a static CSS fixture, not a product feature.

The Host primary button outside `.reui-kit` must keep orange `#d95f02`; the ReUI
primary button inside the wrapper must be blue `#244fa8`. Both use generated
Tailwind background utilities, not a direct fixture background override. The host
semantic mapping is deliberately declared before importing the library, exercising
the earlier override bug. The corrected library defines only custom reui-* mappings.

The pilot captured the failure before the fix and positive colors afterward. A
future modified stylesheet must be rebuilt and checked afresh. Presence of these
strings in source is not a browser pass or proof of arbitrary host compatibility.
