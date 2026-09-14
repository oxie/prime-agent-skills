"""Deterministic stdlib tests. Run: python3 -B -m unittest discover -s dev -v"""

import ast
import csv
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

CATALOGUE = Path(__file__).resolve().parents[1] / "catalogue"
SCRIPT = CATALOGUE / "lookup.py"
spec = importlib.util.spec_from_file_location("catalogue_lookup", SCRIPT)
lookup = importlib.util.module_from_spec(spec)
# Avoid bytecode writes while loading the helper as well as while running its CLI.
old_bytecode = sys.dont_write_bytecode
sys.dont_write_bytecode = True
try:
    spec.loader.exec_module(lookup)
finally:
    sys.dont_write_bytecode = old_bytecode


class CatalogueTests(unittest.TestCase):
    def cli(self, *args, script=SCRIPT, cwd=None):
        return subprocess.run([sys.executable, "-B", str(script), *args], cwd=cwd,
                              capture_output=True, text=True, encoding="utf-8", timeout=10)

    def data(self, *args):
        run = self.cli(*args)
        self.assertEqual(run.returncode, 0, run.stderr)
        self.assertEqual(run.stderr, "")
        return json.loads(run.stdout)

    def test_exact_id_category_and_pipe_alias(self):
        for query in ("minimalism-and-swiss-style", "Minimalism & Swiss Style", "Minimalism (Frame)"):
            with self.subTest(query=query):
                result = self.data("style", query)["results"][0]
                self.assertEqual(result["source"]["id"], "minimalism-and-swiss-style")
                self.assertEqual(result["match"], "exact")
                self.assertIn("Do Not Use For", result["fields"])
                self.assertIn("Accessibility", result["fields"])
                self.assertFalse(result["claims_verified"])

    def test_deprecated_cross_domain_redirect_and_exclusion(self):
        data = self.data("style", "hero-centric-design", "--limit", "1")
        self.assertEqual(data["status"], "deprecated_redirect")
        self.assertEqual(data["domain"], "style")
        self.assertEqual(data["results"][0]["redirect"],
                         {"domain": "landing", "id": "hero-centric-design"})
        self.assertEqual(data["results"][0]["status"], "deprecated")
        general = self.data("style", "hero", "--limit", "10")
        self.assertTrue(all(r["status"] != "deprecated" for r in general["results"]))
        same_domain = self.data("style", "bento-grids", "--limit", "1")
        self.assertEqual(same_domain["results"][0]["redirect"],
                         {"domain": "style", "id": "bento-box-grid"})

    def test_no_match_and_no_fallback(self):
        data = self.data("palette", "qzxvnotaword987654")
        self.assertEqual(data["results"], [])
        self.assertEqual(data["status"], "no_match")
        self.assertTrue(data["no_match"])
        self.assertFalse(data["fallback_used"])
        self.assertFalse(data["constraints_enforced"])
        self.assertEqual(data["total_matches"], 0)
        self.assertFalse(data["truncated"])
        self.assertEqual(data["source"]["commit"], lookup.COMMIT)
        self.assertEqual(data["source"]["path"], "src/ui-ux-pro-max/data/colors.csv")

    def test_tie_preserves_actual_source_order(self):
        # Equal documents, deliberately non-lexical ID order. Test IDs, not just scores.
        rows = [{"No": n, "Product Type": "shared", "Notes": ""} for n in ("9", "2", "7")]
        ranked = lookup.rank(rows, "palette", "shared")
        self.assertEqual([item[3]["No"] for item in ranked], ["9", "2", "7"])
        self.assertEqual([item[2] for item in ranked], [1, 2, 3])
        self.assertEqual(len({item[1] for item in ranked}), 1)

    def test_semantic_palette_roles_and_on_accent(self):
        data = self.data("palette", "SaaS (General)")
        result = data["results"][0]
        self.assertEqual(result["source"]["id"], "1")
        self.assertEqual(result["fields"]["Accent"], "#EA580C")
        self.assertEqual(result["fields"]["On Accent"], "#000000")
        with (CATALOGUE / "data/colors.csv").open(encoding="utf-8", newline="") as stream:
            source = next(csv.DictReader(stream))
        self.assertEqual(result["fields"], {key: value for key, value in source.items() if key != "No"})

    def test_typography_names_mood_notes_without_code_or_imports(self):
        result = self.data("typography", "Classic Elegant")["results"][0]
        self.assertEqual(result["fields"]["Heading Font"], "Playfair Display")
        self.assertEqual(result["fields"]["Body Font"], "Inter")
        self.assertIn("Mood/Style Keywords", result["fields"])
        self.assertIn("Notes", result["fields"])
        for key in ("CSS Import", "Tailwind Config", "Google Fonts URL"):
            self.assertNotIn(key, result["fields"])
        self.assertNotIn("@import", json.dumps(result))

    def test_supplemental_status(self):
        result = self.data("style", "Spectrum 2")["results"][0]
        self.assertEqual(result["status"], "supplemental")
        self.assertEqual(result["fields"]["Parent Style ID"], "spectrum-design-system")

    def test_repeat_and_bounded_schema(self):
        first = self.cli("style", "modern", "--limit", "1")
        second = self.cli("style", "modern", "--limit", "1")
        self.assertEqual(first.returncode, 0, first.stderr)
        self.assertEqual(second.returncode, 0, second.stderr)
        self.assertEqual(first.stdout, second.stdout)
        data = json.loads(first.stdout)
        self.assertEqual(data["schema"], "hallmark.catalogue.v1")
        self.assertEqual(len(data["results"]), 1)
        self.assertGreater(data["total_matches"], 1)
        self.assertTrue(data["truncated"])
        result = data["results"][0]
        self.assertTrue(result["match_tokens"])
        self.assertGreater(result["ranking_score"], 0)
        self.assertEqual(result["source"]["commit"], "7f69fed6a2717900085f1bc3b263721f8ba025e2")
        self.assertEqual(result["source"]["path"], "src/ui-ux-pro-max/data/styles.csv")
        self.assertNotIn("confidence", result)
        self.assertLessEqual(len(self.data("palette", "SaaS")["results"]), 3)

    def test_invalid_inputs(self):
        cases = [(), ("color", "blue"), ("style",), ("style", ""), ("style", "  "),
                 ("style", "\u2003"), ("style", "x" * 501),
                 ("style", "blue", "--constraints", "AAA")]
        cases += [("style", "blue", "--limit", value) for value in ("0", "11", "-1", "1.5", "abc")]
        for args in cases:
            with self.subTest(args=args):
                run = self.cli(*args)
                self.assertEqual(run.returncode, 2)
                self.assertEqual(run.stdout, "")
                self.assertTrue(run.stderr)
        self.assertEqual(self.cli("palette", "x" * 500, "--limit", "10").returncode, 0)

    def test_unicode_and_help(self):
        self.assertEqual(lookup.tokens("CAFÉ 東京 ＵＩ Cafe\u0301"), ["café", "東京", "ui", "café"])
        self.assertEqual(self.data("style", "ＭＩＮＩＭＡＬＩＳＭ (Ｆｒａｍｅ)")["results"][0]["match"], "exact")
        self.data("typography", "日本語")
        run = self.cli("--help")
        self.assertEqual(run.returncode, 0)
        self.assertEqual(run.stderr, "")
        for text in ("No writes", "network", "Examples:", "default: 3", "Exit codes:"):
            self.assertIn(text, run.stdout)

    def test_missing_and_corrupt_data_fail_closed(self):
        for filename in ("provenance.json", "data/styles.csv", "data/colors.csv", "data/typography.csv"):
            for action in ("missing", "corrupt"):
                with self.subTest(filename=filename, action=action), tempfile.TemporaryDirectory() as tmp:
                    bundle = Path(tmp) / "catalogue"
                    shutil.copytree(CATALOGUE, bundle)
                    target = bundle / filename
                    if action == "missing":
                        target.unlink()
                    else:
                        target.write_bytes(b"corrupted")
                    domain = {"data/colors.csv": "palette", "data/typography.csv": "typography"}.get(filename, "style")
                    run = self.cli(domain, "modern", script=bundle / "lookup.py")
                    self.assertEqual(run.returncode, 1)
                    self.assertEqual(run.stdout, "")
                    self.assertIn("catalogue data error", run.stderr)

    def test_provenance_integrity_and_fixed_paths(self):
        changes = (("commit", "wrong"), ("sha256", "0" * 64), ("bytes", 0),
                   ("rows", 1), ("file", "../outside.csv"), ("source_path", "wrong"))
        for key, value in changes:
            with self.subTest(key=key), tempfile.TemporaryDirectory() as tmp:
                bundle = Path(tmp) / "catalogue"
                shutil.copytree(CATALOGUE, bundle)
                manifest_path = bundle / "provenance.json"
                manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
                if key == "commit":
                    manifest[key] = value
                else:
                    manifest["datasets"]["style"][key] = value
                manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
                run = self.cli("style", "minimal", script=bundle / "lookup.py")
                self.assertEqual(run.returncode, 1)
                self.assertEqual(run.stdout, "")
                self.assertIn("catalogue data error", run.stderr)

    def test_nonregular_and_symlink_inputs_fail(self):
        for name in ("provenance.json", "data/styles.csv"):
            for kind in ("directory", "symlink"):
                with self.subTest(name=name, kind=kind), tempfile.TemporaryDirectory() as tmp:
                    bundle = Path(tmp) / "catalogue"
                    shutil.copytree(CATALOGUE, bundle)
                    target = bundle / name
                    target.unlink()
                    if kind == "directory":
                        target.mkdir()
                    else:
                        target.symlink_to(CATALOGUE / name)
                    run = self.cli("style", "modern", script=bundle / "lookup.py")
                    self.assertEqual(run.returncode, 1)
                    self.assertEqual(run.stdout, "")
                    self.assertIn("regular local file", run.stderr)

    def test_no_writes_and_cwd_independent(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            bundle = base / "catalogue"
            shutil.copytree(CATALOGUE, bundle)
            def snapshot():
                return {str(p.relative_to(base)): hashlib.sha256(p.read_bytes()).hexdigest()
                        for p in base.rglob("*") if p.is_file()}
            before = snapshot()
            for domain in ("style", "palette", "typography"):
                run = self.cli(domain, "modern", script=bundle / "lookup.py", cwd=base)
                self.assertEqual(run.returncode, 0, run.stderr)
            self.assertEqual(snapshot(), before)

    def test_no_network_environment_or_write_code(self):
        source = SCRIPT.read_text(encoding="utf-8")
        tree = ast.parse(source)
        imports = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imports.update(alias.name for alias in node.names)
            elif isinstance(node, ast.ImportFrom):
                imports.add(node.module)
        self.assertEqual(imports, {"argparse", "collections", "csv", "hashlib", "io", "json",
                                   "math", "pathlib", "re", "sys", "unicodedata"})
        forbidden = {"write_text", "write_bytes", "unlink", "mkdir", "rename", "replace",
                     "environ", "getenv", "socket", "connect", "urlopen", "exec", "eval"}
        self.assertFalse({node.attr for node in ast.walk(tree) if isinstance(node, ast.Attribute)} & forbidden)
        self.assertFalse({node.id for node in ast.walk(tree) if isinstance(node, ast.Name)} & forbidden)


if __name__ == "__main__":
    unittest.main()
