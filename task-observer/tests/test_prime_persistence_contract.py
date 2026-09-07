"""Instruction-contract tests; fresh-session runtime loading is verified separately."""
import unittest
from pathlib import Path

SKILL = Path(__file__).parents[1] / "SKILL.md"

class PrimePersistenceContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = SKILL.read_text(encoding="utf-8")

    def test_explicit_global_refine_example(self):
        self.assertIn("await refine.run(", self.text)
        self.assertIn("global_=True,", self.text)
        self.assertIn("mentioning global scope only in prose is not", self.text)

    def test_stable_and_temporary_scopes_are_separate(self):
        self.assertIn("Stable, evidence-backed workflow", self.text)
        self.assertIn("before calling refinement", self.text)
        self.assertIn("Never preserve secrets or credentials in either harness scope", self.text)
        self.assertIn("worker handles stay local", self.text)
        self.assertIn("project-specific lessons with their project", self.text)

    def test_persistence_and_fresh_loading_need_evidence(self):
        self.assertIn("scheduled request is not proof", self.text)
        self.assertIn("verify fresh-session loading", self.text)
        self.assertIn("Summaries can omit entries or truncate content", self.text)

    def test_no_false_guarantees_or_parallel_store(self):
        self.assertIn("not proof that mistakes cannot recur", self.text)
        self.assertIn("Never create a parallel lesson database", self.text)
        self.assertIn("not a promise of backup to another machine", self.text)

    def test_approval_and_background_boundaries_remain(self):
        self.assertIn("Merge into live `main` and push only after explicit user approval", self.text)
        self.assertIn("scope promotion", self.text.lower())
        self.assertIn("does not authorize new tools, hooks, schedules", self.text)
        self.assertIn("do not:", self.text)

if __name__ == "__main__":
    unittest.main()
