"""Offline native registration tests. No BrowserSession.start, CDP or browser."""
import importlib.util
import logging
from pathlib import Path
import socket
from types import SimpleNamespace
import unittest
from unittest.mock import patch

CONNECT_ATTEMPTS = []
def no_connect(*args, **kwargs):
    CONNECT_ATTEMPTS.append("blocked")
    raise AssertionError("Network connection prohibited in native unit test")
socket.socket.connect = no_connect
socket.socket.connect_ex = no_connect
socket.create_connection = no_connect

spec = importlib.util.spec_from_file_location("optional_optout", Path(__file__).resolve().parents[1]/"scripts/optional_optout.py")
shim = importlib.util.module_from_spec(spec)
spec.loader.exec_module(shim)
from browser_use.browser.watchdog_base import BaseWatchdog
from browser_use.browser.watchdogs.downloads_watchdog import DownloadsWatchdog
from browser_use.browser.watchdogs.popups_watchdog import PopupsWatchdog
from browser_use.browser.watchdogs.security_watchdog import SecurityWatchdog

class SpyBus:
    def __init__(self): self.handlers = {}
    def on(self, event_class, handler): self.handlers.setdefault(event_class.__name__, []).append(handler)

def watchdog(cls):
    bus = SpyBus()
    session = SimpleNamespace(event_bus=bus, logger=logging.getLogger("offline-test"))
    return cls.model_construct(event_bus=bus, browser_session=session), bus

def registration(cls):
    item,bus=watchdog(cls);item.attach_to_session()
    return {name:len(handlers) for name,handlers in bus.handlers.items()}

class RegistrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        for watcher in (DownloadsWatchdog,PopupsWatchdog,SecurityWatchdog):watcher.model_rebuild()
        cls.original = staticmethod(BaseWatchdog.attach_to_session)
    def tearDown(self):
        # Test process only. Production must leave the opt-out active until exit.
        DownloadsWatchdog.attach_to_session = self.original
        PopupsWatchdog.attach_to_session = self.original
        self.assertEqual(CONNECT_ATTEMPTS, [], "Package attempted network during offline test")
    def test_original_download_six_real_handlers(self):
        self.assertEqual(registration(DownloadsWatchdog), dict.fromkeys({"BrowserLaunchEvent","BrowserStateRequestEvent","BrowserStoppedEvent","TabCreatedEvent","TabClosedEvent","NavigationCompleteEvent"},1))
    def test_original_popup_real_handler(self):
        self.assertEqual(registration(PopupsWatchdog), {"TabCreatedEvent":1})
    def test_both_disabled_for_initial_and_fresh_instances(self):
        receipt=shim.disable_optional_watchdogs()
        self.assertEqual(receipt["disabled_watchdogs"],["DownloadsWatchdog","PopupsWatchdog"])
        self.assertTrue(receipt["requires_cdp_download_deny"])
        self.assertTrue(receipt["requires_explicit_dialog_policy"])
        for _ in range(2):
            for cls in (DownloadsWatchdog,PopupsWatchdog):
                item,bus=watchdog(cls);item.attach_to_session()
                self.assertEqual(bus.handlers,{})
                if cls is DownloadsWatchdog:
                    self.assertFalse(item._download_cdp_session_setup)
                    self.assertEqual(item._cdp_event_tasks,set())
                else:self.assertEqual(item._dialog_listeners_registered,set())
    def test_other_watchdog_native_registration_unchanged(self):
        before=registration(SecurityWatchdog)
        self.assertTrue(before)
        shim.disable_optional_watchdogs()
        self.assertEqual(registration(SecurityWatchdog),before)
        self.assertIs(SecurityWatchdog.attach_to_session,self.original)
        self.assertIs(BaseWatchdog.attach_to_session,self.original)
    def test_idempotent(self):
        first=shim.disable_optional_watchdogs();second=shim.disable_optional_watchdogs()
        self.assertEqual(first,second)
        for cls in (DownloadsWatchdog,PopupsWatchdog):
            self.assertIs(cls.attach_to_session,shim._disabled_optional_listeners)
    def test_version_change_fails_before_any_patch(self):
        with patch.object(shim.importlib.metadata,"version",return_value="999.0"):
            with self.assertRaisesRegex(RuntimeError,"version"):shim.disable_optional_watchdogs()
        for cls in (DownloadsWatchdog,PopupsWatchdog):self.assertIs(cls.attach_to_session,self.original)
    def test_each_source_hash_change_fails_before_any_patch(self):
        for relative in shim.EXPECTED_SOURCE_SHA256:
            with self.subTest(source=relative):
                changed=dict(shim.EXPECTED_SOURCE_SHA256);changed[relative]="0"*64
                with patch.object(shim,"EXPECTED_SOURCE_SHA256",changed):
                    with self.assertRaisesRegex(RuntimeError,"source changed"):shim.disable_optional_watchdogs()
                for cls in (DownloadsWatchdog,PopupsWatchdog):self.assertIs(cls.attach_to_session,self.original)
    def test_unknown_override_on_either_class_never_partially_patches(self):
        for changed in (DownloadsWatchdog,PopupsWatchdog):
            with self.subTest(watcher=changed.__name__):
                sentinel=lambda self:None
                changed.attach_to_session=sentinel
                with self.assertRaisesRegex(RuntimeError,"override"):shim.disable_optional_watchdogs()
                for cls in (DownloadsWatchdog,PopupsWatchdog):
                    self.assertIs(cls.attach_to_session,sentinel if cls is changed else self.original)
                changed.attach_to_session=self.original

if __name__ == "__main__":unittest.main(verbosity=2)
