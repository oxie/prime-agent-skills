import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


VALIDATOR = Path(__file__).parents[1] / "scripts" / "validate-skill-bundle.py"
MARKER = "<!-- task-observer: allow-template-placeholders -->"


class TemplatePlaceholderValidationTests(unittest.TestCase):
    def validate(self, body):
        with tempfile.TemporaryDirectory() as tmp:
            skill = Path(tmp) / "demo"
            skill.mkdir()
            (skill / "SKILL.md").write_text(
                "---\nname: demo\ndescription: Test skill.\n---\n" + body,
                encoding="utf-8",
            )
            return subprocess.run(
                [sys.executable, str(VALIDATOR), str(skill)],
                check=False,
                capture_output=True,
                text=True,
            )

    def test_unmarked_template_placeholder_stays_strict(self):
        result = self.validate("# Demo\nUse {{FirstName}} here.\n")
        self.assertEqual(result.returncode, 1)
        self.assertIn("unresolved template slot", result.stdout)

    def test_top_marker_allows_intentional_template_placeholder(self):
        result = self.validate(f"{MARKER}\n# Demo\nUse {{{{FirstName}}}} here.\n")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("intentional template placeholders allowed", result.stdout)

    def test_late_marker_does_not_bypass_validation(self):
        prefix = "\n".join(f"line {number}" for number in range(21))
        result = self.validate(f"# Demo\n{prefix}\n{MARKER}\nUse {{{{FirstName}}}} here.\n")
        self.assertEqual(result.returncode, 1)
        self.assertIn("unresolved template slot", result.stdout)

    def test_marker_does_not_suppress_other_residue(self):
        result = self.validate(f"{MARKER}\n# Demo\nTODO: fill this section\nUse {{{{FirstName}}}} here.\n")
        self.assertEqual(result.returncode, 1)
        self.assertIn("placeholder note left in", result.stdout)


if __name__ == "__main__":
    unittest.main()
