import json
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path


VALIDATOR = Path(__file__).parents[1] / "scripts" / "validate-skill-bundle.py"


class FrontmatterValidationTests(unittest.TestCase):
    def validate(self, frontmatter, name="demo", body="# Demo\n", no_yaml=False,
                 pack=False, bundle_members=None, extra_files=None):
        with tempfile.TemporaryDirectory() as tmp:
            skill = Path(tmp) / name
            skill.mkdir()
            (skill / "SKILL.md").write_text(
                "---\n" + frontmatter + "\n---\n" + body, encoding="utf-8"
            )
            for rel, text in (extra_files or {}).items():
                path = skill / rel
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(text, encoding="utf-8")
            command = [sys.executable, str(VALIDATOR), str(skill)]
            if no_yaml:
                # Exercise the real CLI with only the yaml import unavailable.
                blocker = (
                    "import builtins, runpy, sys\n"
                    "original_import = builtins.__import__\n"
                    "def blocked(name, *args, **kwargs):\n"
                    "    if name == 'yaml': raise ImportError('test: no yaml')\n"
                    "    return original_import(name, *args, **kwargs)\n"
                    "builtins.__import__ = blocked\n"
                    "sys.argv = sys.argv[1:]\n"
                    "runpy.run_path(sys.argv[0], run_name='__main__')\n"
                )
                command = [sys.executable, "-c", blocker, str(VALIDATOR), str(skill)]
            archive = Path(tmp) / "demo.skill"
            if pack:
                command += ["--pack", str(archive)]
            if bundle_members is not None:
                with zipfile.ZipFile(archive, "w") as packed:
                    for member in bundle_members:
                        packed.writestr(member, "test")
                command += ["--bundle", str(archive)]
            result = subprocess.run(command, capture_output=True, text=True, check=False)
            if pack:
                if result.returncode == 0:
                    with zipfile.ZipFile(archive) as packed:
                        self.assertEqual(packed.namelist(), [name + "/SKILL.md"])
                        self.assertTrue(packed.read(name + "/SKILL.md").startswith(b"---\n"))
                else:
                    self.assertFalse(archive.exists(), "invalid skill must not be packed")
            return result

    def assert_valid(self, result):
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("OK: all gate checks passed", result.stdout)

    def assert_invalid(self, result, diagnostic):
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(diagnostic, result.stdout)
        self.assertNotIn("OK: all gate checks passed", result.stdout)
        self.assertNotIn("Traceback", result.stderr)

    def test_name_length_boundaries(self):
        for count in (1, 64):
            with self.subTest(count=count):
                name = "a" * count
                self.assert_valid(self.validate(f"name: {name}\ndescription: x", name=name))
        for count in (0, 65):
            with self.subTest(count=count):
                name = "a" * count
                self.assert_invalid(self.validate(
                    f"name: {json.dumps(name)}\ndescription: x", name=name or "demo"
                ), "name")

    def test_name_types_are_not_coerced(self):
        for value, directory in (("123", "123"), ("true", "True"),
                                 ("null", "demo"), ("[]", "demo"),
                                 ("{}", "demo"), ("2026-01-01", "2026-01-01")):
            with self.subTest(value=value):
                self.assert_invalid(self.validate(
                    f"name: {value}\ndescription: x", name=directory
                ), "name")
        self.assert_valid(self.validate('name: "123"\ndescription: x', name="123"))

    def test_prime_ascii_names_and_directory_match(self):
        for name in ("Demo", "-demo", "demo-", "de--mo", "de_mo", "démø", "demo\n", " demo "):
            with self.subTest(name=name):
                self.assert_invalid(self.validate(
                    f"name: {json.dumps(name)}\ndescription: x", name=name
                ), "name")
        self.assert_invalid(self.validate("name: other\ndescription: x"), "directory")

    def test_description_length_boundaries(self):
        for count in (1, 1024):
            with self.subTest(count=count):
                self.assert_valid(self.validate('name: demo\ndescription: ' + json.dumps("x" * count)))
        for count in (0, 1025):
            with self.subTest(count=count):
                self.assert_invalid(self.validate(
                    'name: demo\ndescription: ' + json.dumps("x" * count)
                ), "description")

    def test_description_types_and_missing_value(self):
        for value in ("null", "true", "123", "[]", "{}", "2026-01-01"):
            with self.subTest(value=value):
                self.assert_invalid(self.validate(f"name: demo\ndescription: {value}"), "description")
        self.assert_invalid(self.validate("name: demo"), "description")
        self.assert_invalid(self.validate("description: x"), "name")

    def test_literal_folded_and_quoted_descriptions_with_delimiter_text(self):
        for value in ('"Text --- more text"', "'Text --- more text'",
                      "|-\n  First line\n  ---\n  Last line",
                      ">-\n  First line\n  ---\n  Last line"):
            with self.subTest(value=value):
                self.assert_valid(self.validate(f"name: demo\ndescription: {value}"))

    def test_parsed_literal_and_folded_boundaries(self):
        # Default clip adds one newline; strip does not. Each value is 1024
        # or 1025 parsed characters, independent of its source representation.
        for indicator, count, expected in (("|", 1023, 0), ("|", 1024, 1),
                                            ("|-", 1024, 0), ("|-", 1025, 1),
                                            (">", 1023, 0), (">", 1024, 1),
                                            (">-", 1024, 0), (">-", 1025, 1)):
            with self.subTest(indicator=indicator, count=count):
                result = self.validate(f"name: demo\ndescription: {indicator}\n  " + "x" * count)
                if expected:
                    self.assert_invalid(result, "description")
                else:
                    self.assert_valid(result)
        # Internal literal newlines and folded spaces count, not all whitespace
        # collapsed by a regex. Both parsed lengths are exactly 1024.
        for indicator in ("|-", ">-"):
            self.assert_valid(self.validate(
                f"name: demo\ndescription: {indicator}\n  " + "x" * 511 + "\n  " + "y" * 512
            ))
        # Literal preserved spaces must not be collapsed.
        self.assert_invalid(self.validate(
            "name: demo\ndescription: |-\n  " + "x" * 1023 + "  "
        ), "description")

    def test_quoted_escapes_are_counted_after_yaml_parsing(self):
        for count, expected in ((1024, 0), (1025, 1)):
            value = '"' + r"\u0061" * count + '"'
            result = self.validate(f"name: demo\ndescription: {value}")
            if expected:
                self.assert_invalid(result, "description")
            else:
                self.assert_valid(result)
        self.assert_valid(self.validate('name: demo\ndescription: ' + json.dumps("x" * 1024) + " # ignored comment"))

    def test_compatibility_boundaries_and_types(self):
        for count in (1, 500):
            with self.subTest(count=count):
                self.assert_valid(self.validate(
                    "name: demo\ndescription: x\ncompatibility: " + json.dumps("x" * count)
                ))
        for value in ('""', json.dumps("x" * 501), "null", "true", "123", "[]", "{}"):
            with self.subTest(value=value):
                self.assert_invalid(self.validate(
                    f"name: demo\ndescription: x\ncompatibility: {value}"
                ), "compatibility")

    def test_blank_description_and_compatibility_are_rejected(self):
        for value in ('" "', '"\t"', '"\n"'):
            with self.subTest(field="description", value=value):
                self.assert_invalid(self.validate(
                    f"name: demo\ndescription: {value}"
                ), "description")
            with self.subTest(field="compatibility", value=value):
                self.assert_invalid(self.validate(
                    f"name: demo\ndescription: x\ncompatibility: {value}"
                ), "compatibility")

    def test_metadata_string_mapping(self):
        for value in ('{}', '{author: demo, version: "1.0", "123": "true"}', '{"": ""}'):
            with self.subTest(value=value):
                self.assert_valid(self.validate(f"name: demo\ndescription: x\nmetadata: {value}"))
        for value in ("null", "true", "123", "[]", '"text"',
                      "{version: 1}", "{1: text}", "{enabled: true}",
                      "{true: text}", "{key: null}", "{null: text}",
                      "{key: []}", "{key: {nested: text}}"):
            with self.subTest(value=value):
                self.assert_invalid(self.validate(
                    f"name: demo\ndescription: x\nmetadata: {value}"
                ), "metadata")

    def test_host_extensions_are_not_whitelisted(self):
        self.assert_valid(self.validate(
            "name: demo\ndescription: x\ndisable-model-invocation: true\n"
            "future-host-extension: {nested: [1, true]}"
        ))

    def test_malformed_and_non_mapping_yaml(self):
        for value in ("[unterminated", "2026-13-01", "!!python/object:unknown {}"):
            with self.subTest(value=value):
                self.assert_invalid(self.validate(f"name: demo\ndescription: {value}"), "YAML parse error")
        for value in ("- demo", "null", '"text"'):
            with self.subTest(value=value):
                self.assert_invalid(self.validate(value), "mapping")

    def test_missing_parser_is_actionable_failure_and_prevents_pack(self):
        result = self.validate("name: demo\ndescription: x", no_yaml=True, pack=True)
        self.assert_invalid(result, "PyYAML")
        self.assertIn("Python environment", result.stdout)

    def test_pack_and_zip_checks_remain_intact(self):
        self.assert_valid(self.validate("name: demo\ndescription: x", pack=True))
        self.assert_invalid(self.validate("name: demo\ndescription: []", pack=True), "description")
        self.assert_invalid(self.validate("name: demo\ndescription: x", bundle_members=[]), "no members")
        self.assert_invalid(self.validate(
            "name: demo\ndescription: x", bundle_members=[r"demo\SKILL.md"]
        ), "backslash")

    def test_existing_structural_and_residue_checks(self):
        for body, files, diagnostic in (
            ("---\nname: duplicate\n---\n", {}, "second frontmatter"),
            ("See `references/missing.md`.\n", {}, "cited path missing"),
            ("# Demo\n", {"__pycache__/cache.pyc": "junk"}, "build artefact"),
            ("# Demo\n", {"references/bad.md": "TODO: fill this\n"}, "edit residue"),
            ("# Demo\n\\1\n", {}, "literal regex backreference"),
            ("# Demo\n<<<<<<< ours\n", {}, "merge conflict marker"),
        ):
            with self.subTest(diagnostic=diagnostic):
                self.assert_invalid(self.validate(
                    "name: demo\ndescription: x", body=body, extra_files=files
                ), diagnostic)


if __name__ == "__main__":
    unittest.main()
