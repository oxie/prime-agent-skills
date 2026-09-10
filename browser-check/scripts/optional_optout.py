"""Disable only automatic download/dialog listeners in a fresh dedicated CLI.
No installed edits or transport changes. Keep active until process exit.
"""
from pathlib import Path
import hashlib
import importlib.metadata
import inspect

EXPECTED_VERSION = "0.13.10"
EXPECTED_SOURCE_SHA256 = {'browser/session.py': '223d987b994bb63e0baa1a66d5e5809b7dca274c0ac1abf4488e58925efe184b', 'browser/watchdog_base.py': '7970d0070134f629a0d213dc8abe05326d3a49009dd454f863322807c6955c7b', 'browser/watchdogs/downloads_watchdog.py': 'a27d9d5ef87d0d2c459cc26e7b6a77b3b6520b24758b4b1fe582920529ff4a07', 'browser/watchdogs/popups_watchdog.py': 'efb63a0348ad43900b6a5c369f460bf444e2a3318c73a0b1c6cd7f80577ddd7d'}

def _disabled_optional_listeners(self):
    # Reviewed constructors initialize bookkeeping only. No event registration
    # means no automatic download setup or implicit dialog acceptance.
    return None

def disable_optional_watchdogs():
    """Call before any BrowserSession starts; do not restore during CLI lifetime.

    Caller must separately establish CDP download deny and explicit handling of
    unexpected dialogs before project navigation. No private watcher API may be
    exposed by public actions or the supported trusted-page seam.
    """
    if importlib.metadata.version("browser-use") != EXPECTED_VERSION:
        raise RuntimeError("Unreviewed browser-use version; optional opt-out refused")
    import browser_use
    root = Path(inspect.getfile(browser_use)).resolve().parent
    for relative, expected in EXPECTED_SOURCE_SHA256.items():
        if hashlib.sha256((root / relative).read_bytes()).hexdigest() != expected:
            raise RuntimeError("Optional watchdog contract source changed: " + relative)
    from browser_use.browser.watchdog_base import BaseWatchdog
    from browser_use.browser.watchdogs.downloads_watchdog import DownloadsWatchdog
    from browser_use.browser.watchdogs.popups_watchdog import PopupsWatchdog
    watchers = (DownloadsWatchdog, PopupsWatchdog)
    # Validate BOTH before changing either, including the second-class override
    # case. An unknown extension must fail without a partial new installation.
    for watcher in watchers:
        if watcher.attach_to_session not in (BaseWatchdog.attach_to_session, _disabled_optional_listeners):
            raise RuntimeError("Unexpected optional registration override: " + watcher.__name__)
    for watcher in watchers:
        watcher.attach_to_session = _disabled_optional_listeners
    return {"strategy": "process-local optional-listener opt-out",
            "disabled_watchdogs": [watcher.__name__ for watcher in watchers],
            "version": EXPECTED_VERSION, "source_sha256": dict(EXPECTED_SOURCE_SHA256),
            "requires_cdp_download_deny": True,
            "requires_explicit_dialog_policy": True}
