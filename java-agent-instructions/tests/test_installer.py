"""Verify instruction installation against isolated project directories."""

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL = Path(__file__).resolve().parents[1]
INSTALLER = SKILL / "scripts" / "install-agent-instructions.py"
TEMPLATE = (SKILL / "assets" / "java-skill-self-review.md").read_text(encoding="utf-8")
START = "<!-- java-skills:self-review:start -->"
END = "<!-- java-skills:self-review:end -->"


class InstallerTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)

    def run_installer(self, *arguments):
        return subprocess.run(
            [sys.executable, str(INSTALLER), *arguments],
            cwd=self.root,
            capture_output=True,
            text=True,
        )

    def test_creates_agents_from_canonical_template_and_is_idempotent(self):
        for _ in range(2):
            actual = self.run_installer()
            self.assertEqual(0, actual.returncode, actual.stderr)
            self.assertEqual(TEMPLATE, (self.root / "AGENTS.md").read_text())

    def test_updates_only_managed_block_and_preserves_surrounding_text(self):
        prefix = "# Existing instructions\n\nKeep this spacing.  \n\n"
        suffix = "\n\n## Local rules\n\nPreserve these.  \n"
        target = self.root / "AGENTS.md"
        target.write_text(prefix + START + "\nObsolete block\n" + END + suffix)

        for _ in range(2):
            actual = self.run_installer()
            self.assertEqual(0, actual.returncode, actual.stderr)
            self.assertEqual(prefix + TEMPLATE.rstrip("\n") + suffix, target.read_text())

    def test_uses_claude_when_agents_absent(self):
        target = self.root / "CLAUDE.md"
        target.write_text("# Claude rules\n")
        actual = self.run_installer()
        self.assertEqual(0, actual.returncode, actual.stderr)
        self.assertEqual("# Claude rules\n\n" + TEMPLATE, target.read_text())
        self.assertFalse((self.root / "AGENTS.md").exists())

    def test_prefers_agents_when_both_exist(self):
        (self.root / "AGENTS.md").write_text("# Agent rules\n")
        claude = self.root / "CLAUDE.md"
        claude.write_text("# Claude rules\n")
        actual = self.run_installer()
        self.assertEqual(0, actual.returncode, actual.stderr)
        self.assertIn(TEMPLATE, (self.root / "AGENTS.md").read_text())
        self.assertEqual("# Claude rules\n", claude.read_text())

    def test_explicit_target_overrides_default(self):
        agents = self.root / "AGENTS.md"
        agents.write_text("# Unchanged\n")
        actual = self.run_installer("--file", "CUSTOM.md")
        self.assertEqual(0, actual.returncode, actual.stderr)
        self.assertEqual(TEMPLATE, (self.root / "CUSTOM.md").read_text())
        self.assertEqual("# Unchanged\n", agents.read_text())

    def test_rejects_malformed_markers_without_writing(self):
        cases = (
            START,
            END,
            END + "\n" + START,
            START + "\n" + START + "\n" + END + "\n" + END,
        )
        for content in cases:
            with self.subTest(content=content):
                target = self.root / "AGENTS.md"
                target.write_text(content)
                actual = self.run_installer()
                self.assertNotEqual(0, actual.returncode)
                self.assertEqual(content, target.read_text())


if __name__ == "__main__":
    unittest.main()
