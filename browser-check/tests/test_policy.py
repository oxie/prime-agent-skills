import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location("policy",Path(__file__).resolve().parents[1]/"scripts/policy.py")
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
class PolicyTests(unittest.TestCase):
 def test_local_origin(self):
  self.assertEqual(p.local_url("http://127.0.0.1:8080/a?b=c"),("http://127.0.0.1:8080",8080))
  self.assertTrue(p.same_origin("http://127.0.0.1:8080/b", "http://127.0.0.1:8080"))
  self.assertFalse(p.same_origin("http://127.0.0.1:8081/b", "http://127.0.0.1:8080"))
 def test_url_refusals(self):
  for url in ["https://127.0.0.1:8080", "http://localhost:8080", "http://127.1:8080", "http://127.0.0.1", "file:///tmp/a", "http://u:p@127.0.0.1:8080", "http://127.0.0.1:80", "http://127.0.0.1:08080", "http://127.0.0.1:8080/\n", "http://127.0.0.1:8080/\\x"]:
   with self.subTest(url=url), self.assertRaises(ValueError):p.local_url(url)
 def test_actions(self):
  self.assertEqual(len(p.actions(b'[{"action":"fill","selector":"#name","value":"demo"},{"action":"press","key":"Tab"}]')),2)
  for value in [b'{}', b'[{"action":"eval","code":"x"}]', b'[{"action":"click","selector":"a","extra":0}]', b'[{"action":"press","key":"Control+O"}]', b'[{"action":"scroll","x":true,"y":0}]',b'[{"action":"click","action":"screenshot"}]']:
   with self.subTest(value=value),self.assertRaises(ValueError):p.actions(value)
  with self.assertRaisesRegex(ValueError,"at most16"):p.actions(p.json.dumps([{"action":"screenshot"}]*17).encode())
  with self.assertRaises(ValueError):p.actions(b' '*65537)
 def test_sensitive_fields(self):
  self.assertTrue(p.fill_allowed("text", "name"))
  for kind,auto in [("PASSWORD", ""),("file", ""),("hidden", ""),("text", "section-a current-password"),("text", "one-time-code")]:
   self.assertFalse(p.fill_allowed(kind,auto))
if __name__=="__main__":unittest.main()
