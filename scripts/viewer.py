#!/usr/bin/env python3
"""Initialize or build a portable viewer project using only this skill's files."""
import argparse
import importlib.util
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

SKILL = Path(__file__).resolve().parents[1]
ASSETS = SKILL / "assets/viewer"


def load_builder():
    spec = importlib.util.spec_from_file_location("portable_viewer", ASSETS / "template/build.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def workspace_path(value):
    path = Path(value).resolve()
    if path == SKILL or SKILL in path.parents:
        raise ValueError("Crie o protótipo na pasta do projeto, fora da instalação da skill.")
    return path


def initialize(directory):
    sources = ["project.json", "screens.js", "styles.css", "delivery.json"]
    conflicts = [name for name in sources if (directory / name).exists()]
    if conflicts:
        raise ValueError("Arquivos já existentes; nada foi sobrescrito: " + ", ".join(conflicts))
    project = json.loads((ASSETS / "starter/project.json").read_text(encoding="utf-8"))
    project["id"] = re.sub(r"[^a-z0-9_-]+", "-", directory.name.lower()).strip("-") or "prototipo"
    project["name"] = directory.name
    directory.mkdir(parents=True, exist_ok=True)
    for name in sources[1:]:
        shutil.copyfile(ASSETS / "starter" / name, directory / name)
    (directory / "project.json").write_text(json.dumps(project, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"status": "initialized", "project": str(directory), "files": sources}


def delivery_context(directory, project):
    path = directory / "delivery.json"
    if not path.is_file():
        return None
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, dict) or data.get("schema_version") != "1.0":
        raise ValueError("delivery.json precisa de schema_version 1.0.")
    for key in ("assumptions", "simulations", "limitations"):
        if not isinstance(data.get(key), list) or any(not isinstance(x, str) or not x.strip() for x in data[key]):
            raise ValueError(f"delivery.json: {key} deve ser uma lista de textos.")
    if not isinstance(data.get("requirements"), list):
        raise ValueError("delivery.json: requirements deve ser uma lista.")
    flows = {flow["id"] for flow in project["flows"]}
    ids = set()
    for item in data["requirements"]:
        if not isinstance(item, dict) or any(not isinstance(item.get(k), str) or not item[k].strip() for k in ("id", "description", "flow")):
            raise ValueError("Cada requisito precisa de id, description e flow.")
        if item["id"] in ids or item["flow"] not in flows:
            raise ValueError("Requisito duplicado ou com fluxo inexistente.")
        ids.add(item["id"])
    return data


def check_javascript(node, paths):
    for path in paths:
        result = subprocess.run([node, "--check", str(path)], capture_output=True, text=True,
                                encoding="utf-8", errors="replace", timeout=30)
        if result.returncode:
            raise ValueError(f"JavaScript inválido em {path.name}:\n{result.stderr}")


def generate(directory):
    node = shutil.which("node")
    if not node:
        raise ValueError("Node é necessário para verificar as telas e extrair os requisitos. Instale Node e tente novamente.")
    builder = load_builder()
    project = builder.load_project(directory / "project.json")
    screens = directory / "screens.js"
    if not screens.is_file():
        raise ValueError("Adicione screens.js ao lado de project.json.")
    scripts = list((ASSETS / "template/src").glob("*.js")) + [screens]
    check_javascript(node, scripts)
    registry = builder.extract_versions_metadata(project, screens)
    missing = [flow["id"] for flow in project["flows"] if not registry.get(flow["id"])]
    if missing:
        raise ValueError("Fluxos sem versão válida ou erro no registro das telas: " + ", ".join(missing))
    context = delivery_context(directory, project)
    styles = directory / "styles.css"
    html = builder.build(directory / "project.json", screens, styles if styles.is_file() else None, project)
    spec = builder.render_spec_markdown(project, screens)
    if "/*__" in html:
        raise ValueError("O HTML contém marcadores não resolvidos.")
    output = directory / "dist"
    output.mkdir(parents=True, exist_ok=True)
    paths = {"html": output / f"{project['id']}.html", "spec": output / f"{project['id']}-SPEC.md"}
    paths["html"].write_text(html, encoding="utf-8", newline="\n")
    paths["spec"].write_text(spec, encoding="utf-8", newline="\n")
    return {"schema_version": "1.0", "status": "succeeded", "exit_code": 0,
            "project": str(directory), "artifacts": {key: str(path) for key, path in paths.items()},
            "declared_context": context, "checks": {"syntax": "passed", "registry": "passed", "build": "passed"},
            "human_review": {"status": "not_run", "reason": "Verifique as interações no navegador separadamente."}, "errors": []}


def save_result(directory, report):
    output = directory / "dist"
    output.mkdir(parents=True, exist_ok=True)
    path = output / "resultado.json"
    report.setdefault("artifacts", {})["report"] = str(path)
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("init", "build"))
    parser.add_argument("project", help="Pasta do protótipo no projeto de destino")
    args = parser.parse_args(argv)
    directory = None
    try:
        directory = workspace_path(args.project)
        report = initialize(directory) if args.command == "init" else generate(directory)
    except (OSError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as error:
        report = {"status": "failed", "exit_code": 1, "artifacts": {}, "errors": [str(error)]}
    if args.command == "build" and directory and directory.is_dir():
        try:
            save_result(directory, report)
        except OSError as error:
            report.update(status="failed", exit_code=1)
            report.get("artifacts", {}).pop("report", None)
            report.setdefault("errors", []).append(str(error))
    print(json.dumps(report, ensure_ascii=False))
    return report.get("exit_code", 0)


if __name__ == "__main__":
    raise SystemExit(main())
