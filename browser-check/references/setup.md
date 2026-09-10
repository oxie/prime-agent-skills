# Private runtime, maintenance and rollback

## Installed layout

- Browser-use0.13.10 and its existing locked environment:
  `~/.local/share/prime-agent/browser-use-tools/.venv`.
- Full Google Chrome153.0.8010.36:
  `~/.local/share/prime-agent/browser-use-tools/chrome/153.0.8010.36/opt/google/chrome`.
- Versioned launcher and source/version-gated optional-watchdog compatibility code:
  this skill's `scripts/`. Runtime/browser binaries are not in the skills Git repo.

The launcher verifies the full265-entry private resource manifest and file hashes,
owner/modes, exact raw executable and existing Chrome profile before launch. It
uses `/usr/bin/aa-exec -p chrome -- ACTUAL_CHROME`, never an interpreter or general
runtime under that profile. It does not edit AppArmor or create a SUID helper.
This is the intended installed Chrome profile with user-namespace permission;
normal Chrome sandbox checks still must pass. It is not an added OS data sandbox.

## Agent-owned controlled refresh

Nothing downloads, builds or updates during normal invocation or skill loading.
Before a new project/security-sensitive use, inspect the retained maintenance date
and current vendor security status as part of the task. Do not infer current patch
coverage from a pinned version or an old passing screenshot. Refresh/retest when
needed; no scheduler, cloud fallback, package-manager refresh or user-browser
connection is configured.

For a missing or stale runtime, the agent owns diagnosis and a bounded private
refresh. Preserve the working version and current user work. Review official
Google repository/key information, native signature verification and signed
InRelease → Packages → exact package size/SHA256. Never blindly accept a new key,
expired/revoked signing key, changed digest or a version-label-only assertion.
Historical expired subkeys are distinct from the actual current signing key.

Inspect the authenticated archive as data. Do not run dpkg installation, maintainer
scripts, packaged launchers, updates, services or repository installers. Preserve
complete required browser resources and relationships; stage privately without
privileged bits. Record actual ELF/dependency/notice inventory, final hashes and
reviewed launcher changes. Missing dependencies or a different host policy require
review, not installation/bypass as a fallback.

Run normal native sandbox, version, same-origin positive/other-port negative,
DOM/input/screenshot, download/dialog and failure-cleanup tests on the changed
bytes. Rerun affected specialist tests and fresh installed discovery/use before
calling the refresh ready. Publish only reviewed skill code/docs through the
normal skills Git workflow. A checksum verifies identity, not browser safety.

## Licensing and provenance

Google Chrome executable terms are not Chromium's BSD license. The private package
includes Chromium/Widevine and other component notices; retain the complete
original package, authenticated metadata and exact notices outside Git. Public
Chromium release tag/DEPS are source references, not proof of complete corresponding
source or a reproducible build for Google's proprietary package.

This installation does not redistribute Chrome binaries. Before conveying binaries,
resolve applicable permissions and component source/notice/offer obligations. Do not
relicense the private browser under this skill's MIT license. Browser-use is an
existing separately installed dependency with its own license and lock/provenance.

## Rollback

Stop/reap only the current task's owned browser processes first. Keep failure
receipts. Restore the preceding verified skill/launcher bytes and matching private
runtime as one compatible unit; never point silently at an older insecure Snap
browser. If no current safe version is available, disable browser invocation and
retain source-only Impeccable checks rather than weakening its safeguards.

Remove a new private runtime only after proving it has no live users. Preserve
wanted project artifacts and original package/provenance. No system browser, user
profile, provider setting or unrelated environment is part of this rollback.
