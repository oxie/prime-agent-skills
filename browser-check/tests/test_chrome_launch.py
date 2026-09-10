#!/usr/bin/env python3
"""Pure launcher boundary tests. No browser, AppArmor transition or extraction."""
import importlib.util, os
from pathlib import Path
import tempfile, unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location("chrome_launch",Path(__file__).resolve().parents[1]/"scripts/chrome_launch.py")
launch=importlib.util.module_from_spec(spec);spec.loader.exec_module(launch)
class LauncherTests(unittest.TestCase):
    def setUp(self):
        self.work=tempfile.TemporaryDirectory(prefix="cl-",dir="/tmp")
        self.profile=Path(self.work.name)/"profile";self.profile.mkdir(mode=0o700)
    def tearDown(self): self.work.cleanup()
    def call(self,p=19001,t=19002,profile=None):
        with patch.object(launch,"verify_runtime",return_value={}),patch.object(launch,"digest",return_value=launch.PROFILE_SHA256),patch.object(launch.os.path,"lexists",return_value=False):
            return launch.launch_argv(profile or self.profile,p,t)
    def test_exact_native_command(self):
        argv=self.call();self.assertEqual(argv[:5],["/usr/bin/aa-exec","-p","chrome","--",str(launch.CHROME)])
        self.assertIn("--proxy-bypass-list=<-loopback>;127.0.0.1:19002",argv)
        self.assertIn("--proxy-server=http://127.0.0.1:19001",argv)
        self.assertNotIn("--no-sandbox",argv);self.assertNotIn("--disable-setuid-sandbox",argv)
        self.assertEqual(argv[-1],"about:blank")
    def test_port_types_and_range(self):
        for value in [True,False,"19002",0,-1,65536,1.2,None]:
            with self.subTest(value=value),self.assertRaises(ValueError): self.call(t=value)
    def test_same_port(self):
        with self.assertRaises(ValueError): self.call(p=19002,t=19002)
    def test_nonempty_profile(self):
        (self.profile/"Preferences").write_text("existing profile")
        with self.assertRaises(ValueError): self.call()
    def test_public_profile(self):
        self.profile.chmod(0o755)
        with self.assertRaises(ValueError): self.call()
    def test_symlink_profile(self):
        linked=Path(self.work.name)/"link";linked.symlink_to(self.profile)
        with self.assertRaises(ValueError): self.call(profile=linked)
    def test_relative_profile(self):
        with self.assertRaises(ValueError): self.call(profile=Path("profile"))
    def test_runtime_failure_not_suppressed(self):
        with patch.object(launch,"verify_runtime",side_effect=RuntimeError("missing runtime")),self.assertRaisesRegex(RuntimeError,"missing runtime"):
            launch.launch_argv(self.profile,19001,19002)
    def test_profile_override_refused(self):
        with patch.object(launch,"verify_runtime",return_value={}),patch.object(launch,"digest",return_value=launch.PROFILE_SHA256),patch.object(launch.os.path,"lexists",return_value=True),self.assertRaises(RuntimeError):
            launch.launch_argv(self.profile,19001,19002)
    def test_profile_hash_mismatch_refused(self):
        with patch.object(launch,"verify_runtime",return_value={}),patch.object(launch,"digest",return_value="0"*64),self.assertRaises(RuntimeError):
            launch.launch_argv(self.profile,19001,19002)
if __name__=="__main__": unittest.main(verbosity=2)
