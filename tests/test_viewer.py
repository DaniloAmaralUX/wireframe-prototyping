"""Validate the standalone distribution from an isolated project."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ViewerTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="wireframe-skill-")
        self.addCleanup(self.temporary.cleanup)
        self.app = Path(self.temporary.name) / "outro projeto"
        self.skill = self.app / ".agents/skills/wireframe-prototyping"
        shutil.copytree(ROOT, self.skill, ignore=shutil.ignore_patterns(".git", "__pycache__", "*.pyc", "dist", "prototypes"))
        self.project = self.app / "prototypes/exemplo"

    def run_cli(self, command, env=None):
        process = subprocess.run([sys.executable, str(self.skill / "scripts/viewer.py"), command, str(self.project)],
                                 cwd=self.app, capture_output=True, text=True, encoding="utf-8", timeout=60, env=env)
        return process.returncode, json.loads(process.stdout)

    def test_local_links_and_asset_hashes(self):
        for source in ROOT.rglob("*.md"):
            if ".git" in source.parts or "dist" in source.parts:
                continue
            for link in re.findall(r"\[[^\]]+\]\(([^)#]+)\)", source.read_text(encoding="utf-8")):
                if link.startswith(("http://", "https://", "mailto:")):
                    continue
                target = (source.parent / link).resolve()
                self.assertTrue(target.is_relative_to(ROOT) and target.exists(), str(source) + ": " + link)
        assets = ROOT / "assets/viewer"
        manifest = json.loads((assets / "manifest.json").read_text(encoding="utf-8"))
        for name, digest in manifest["files"].items():
            self.assertEqual(hashlib.sha256((assets / name).read_bytes()).hexdigest(), digest)

    def test_init_build_and_existing_application(self):
        sentinel = self.app / "package.json"
        sentinel.write_text('{"name":"existing-app"}', encoding="utf-8")
        self.assertEqual(self.run_cli("init")[0], 0)
        code, result = self.run_cli("build")
        self.assertEqual(code, 0, result)
        self.assertEqual(result["human_review"]["status"], "not_run")
        html = Path(result["artifacts"]["html"]).read_text(encoding="utf-8")
        self.assertIn("Pitang", html)
        self.assertNotIn("/*__", html)
        self.assertNotRegex(html, r'<script\b[^>]*\bsrc\s*=')
        self.assertEqual(sentinel.read_text(encoding="utf-8"), '{"name":"existing-app"}')
        self.assertIn("Formulário", Path(result["artifacts"]["spec"]).read_text(encoding="utf-8"))

    def test_init_preserves_existing_sources(self):
        self.run_cli("init")
        source = self.project / "screens.js"
        source.write_text("preservar", encoding="utf-8")
        self.assertEqual(self.run_cli("init")[0], 1)
        self.assertEqual(source.read_text(encoding="utf-8"), "preservar")

    def test_syntax_failure_does_not_advertise_old_html(self):
        self.run_cli("init")
        self.assertEqual(self.run_cli("build")[0], 0)
        (self.project / "screens.js").write_text("function broken( {", encoding="utf-8")
        code, result = self.run_cli("build")
        self.assertEqual(code, 1)
        self.assertNotIn("html", result["artifacts"])

    def test_missing_node_is_reported(self):
        self.run_cli("init")
        code, result = self.run_cli("build", env={**os.environ, "PATH": ""})
        self.assertEqual(code, 1)
        self.assertIn("Node", str(result["errors"]))

    def test_optional_runtime_is_bundled(self):
        self.run_cli("init")
        source = self.project / "project.json"
        value = json.loads(source.read_text(encoding="utf-8"))
        value["uiSdk"] = ["workflow"]
        source.write_text(json.dumps(value), encoding="utf-8")
        code, result = self.run_cli("build")
        self.assertEqual(code, 0, result)
        self.assertIn("ViewerWorkflow", Path(result["artifacts"]["html"]).read_text(encoding="utf-8"))
        self.assertFalse((self.app / "node_modules").exists())


if __name__ == "__main__":
    unittest.main()
