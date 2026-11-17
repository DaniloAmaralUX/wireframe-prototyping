#!/usr/bin/env python3
"""Package this standalone skill for distribution."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
INCLUDED = ("SKILL.md", "LICENSE", "ORIGIN.md", "README.md", "agents", "references", "scripts", "assets", "templates")


def package():
    output = ROOT / "dist/wireframe-prototyping.zip"
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name in INCLUDED:
            source = ROOT / name
            paths = source.rglob("*") if source.is_dir() else [source]
            for path in sorted(paths):
                if path.is_file() and "__pycache__" not in path.parts and path.suffix != ".pyc":
                    archive.write(path, Path("wireframe-prototyping") / path.relative_to(ROOT))
    print(output)


if __name__ == "__main__":
    package()
