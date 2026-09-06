# Framework preview attachments

Use `node <skill>/variate.mjs up --root <project>` only for a requested preview.
Recognized files are candidates, not a promise of compilation. Run the project's
native development and production checks after attaching and after cleanup.

| Stack | Candidate | Dev guard / limit |
|---|---|---|
| Next App Router | app/layout.tsx | NODE_ENV; requires standalone closing body tag |
| Next Pages | pages/_document.tsx | NODE_ENV; ordinary _app components have no safe body anchor |
| Vite | entry module, such as src/main.tsx | import.meta.env.DEV; appended after the complete module |
| Astro | shared layout | import.meta.env.DEV; inline script and standalone body anchor |
| SvelteKit | root layout | import.meta.env.DEV; typical body-less layouts need manual review |
| Nuxt | new plugins/variate.client.ts | import.meta.dev; refuses existing unowned files |
| Rails | application.html.erb | Rails.env.development?; requires closing body tag |
| Plain HTML | sidecar serves existing HTML | card is injected into the served response, not the saved page |

Unsupported/missing anchors fail without editing the target. Existing marker text
without a trusted attachment ledger is not ownership and is not adopted. Edited
generated plugins block deletion. Vite multiline imports and missing final newlines
are covered by syntax and exact-restoration regressions.

The framework's own dev server is separate from the loopback card server. HMR timing
and production dead-code elimination depend on the project. Without HMR, the card
uses a bounded reload fallback. Chromium tests cover that fallback, not framework HMR.

CSP or iframe policy may block the card. Do not weaken either automatically. Use
file-only switching and chat decisions when secure preview access is unavailable.
For an explicitly reviewed manual attachment, start with `--no-attach`, use the exact
printed local tag URL inside an appropriate development-only guard, and track/remove
your manual edit yourself. `end` removes only ledger-owned attachments; brackets alone
do not authorize it to delete a pre-existing block. Verify the final Git diff.
