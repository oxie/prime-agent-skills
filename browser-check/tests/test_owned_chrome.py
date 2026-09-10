import ctypes, importlib.util, os
from pathlib import Path
import selectors, signal, tempfile, unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location("owned",Path(__file__).resolve().parents[1]/"scripts/owned_chrome.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert ctypes.CDLL(None).prctl(36,1,0,0,0)==0
PAUSE=["/usr/bin/python3","-I","-S","-B","-c","import signal;signal.pause()"]
class OwnerTests(unittest.TestCase):
 def test_pin_failure_still_reaps(self):
  owner=m.OwnedChrome()
  with open(os.devnull,"wb") as log:
   with patch.object(m.os,"pidfd_open",side_effect=OSError("injected pin failure")):
    with self.assertRaisesRegex(OSError,"injected pin"):owner.start(PAUSE,log)
   pid=owner.process.pid
   try:receipt=owner.close()
   finally:
    if owner.process.returncode is None:owner.process.kill();owner.process.wait()
   self.assertTrue(receipt["no_owned_children"])
   self.assertFalse(Path(f"/proc/{pid}").exists())
 def test_close_idempotent_and_start_once(self):
  owner=m.OwnedChrome()
  with open(os.devnull,"wb") as log:
   owner.start(PAUSE,log)
   try:
    with self.assertRaisesRegex(RuntimeError,"start twice"):owner.start(PAUSE,log)
    receipt=owner.close()
    with patch.object(m.os,"killpg",side_effect=AssertionError("must not signal recycled group")):
     self.assertEqual(owner.close(),receipt)
   finally:
    if owner.process.returncode is None:owner.close()
 def test_nonleader_thread_child_and_detached_adoption(self):
  code="import os,subprocess,threading,signal;\ndef worker():\n p=subprocess.Popen(['/usr/bin/python3','-I','-S','-B','-c','import signal;signal.pause()'],start_new_session=True);print(p.pid,flush=True);threading.Event().wait()\nthreading.Thread(target=worker).start();signal.pause()"
  read,write=os.pipe();owner=m.OwnedChrome();selector=selectors.DefaultSelector()
  try:
   with os.fdopen(write,"wb") as log:owner.start(PAUSE[:-1]+[code],log)
   selector.register(read,selectors.EVENT_READ);self.assertTrue(selector.select(3),"fixture did not announce child")
   raw=os.read(read,1024);child=int(raw.strip())
   rows=owner.observe();self.assertIn(child,[r["pid"] for r in rows],"nonleader-thread child omitted")
   receipt=owner.close();self.assertIn(child,[r["pid"] for r in receipt["adopted_reaped"]])
   self.assertFalse(Path(f"/proc/{child}").exists());self.assertTrue(receipt["no_owned_children"])
  finally:
   selector.close();os.close(read)
   if owner.process and owner.process.returncode is None:owner.close()
if __name__=="__main__":unittest.main()
