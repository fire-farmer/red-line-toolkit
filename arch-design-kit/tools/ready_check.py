#!/usr/bin/env python3
"""ready_check.py: is this project ready to design? (playbook 08, CR-GATE-1)

    python3 ready_check.py [project_dir]     # human report; exit 0 = ready, 1 = not yet
    python3 ready_check.py --hook            # Claude Code UserPromptSubmit hook: JSON on stdin

Before plans or models are drawn, it checks the project folder for the groundwork that
creative design needs:
  brief (PROJECT-BRIEF.md) · program (PROGRAM.md) · taste (TASTE.md) ·
  precedents (PRECEDENTS.md) · a concept chosen, or skipped on purpose (design.yaml project.concept)

In hook mode it stays silent unless the prompt asks for design work in a project folder that
isn't ready. Then it tells Claude to warn the owner and offer the concept studio before
drawing anything. It never blocks a prompt and never fails loudly (a hook must not break the
session). It prints its reminder at most once per session for the same set of gaps.

Uses only the standard library and runs on Python 3.8+ (macOS's built-in python3 included).
PyYAML is used for design.yaml when installed, with a small fallback parser otherwise.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import tempfile
from pathlib import Path

ANSWERED = re.compile(r"^\s*-\s+[^:\n]{2,}:[ \t]*\S", re.M)   # "- Label: answer"
STARRED = re.compile(r"^\s*-\s+★[^:\n]*:[ \t]*\S", re.M)       # "- ★ Label: answer"
DESIGN_INTENT = re.compile(
    r"\b(design|redesign|lay ?out|floor ?plans?|plans?|model|massing|schematic|concept|sketch|draw|"
    r"render|elevations?|sections?|house|home|cabin|adu|addition|rooms?|kitchen|bedrooms?|freecad|ifc)\b",
    re.I)
THRESHOLDS = {"brief_answers": 8, "program_rows": 6, "taste_starred": 4, "taste_answers": 6, "precedents": 2}


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


TEMPLATES = Path(__file__).resolve().parent.parent / "templates"


def _new_lines(text: str, template_name: str, pattern: "re.Pattern") -> list:
    """Lines matching pattern that the blank template doesn't already contain (options, examples)."""
    baseline = {line.strip() for line in _read(TEMPLATES / template_name).splitlines()}
    return [m.group(0).strip() for m in re.finditer(pattern.pattern + r".*$", text, re.M)
            if m.group(0).strip() not in baseline]


def _section(text: str, heading: str) -> str:
    m = re.search(r"^##\s+" + re.escape(heading) + r".*?$(.*?)(?=^##\s|\Z)", text, re.M | re.S)
    return m.group(1) if m else ""


def _concept(design_text: str) -> dict:
    """project.concept from design.yaml: PyYAML when available, else a small line parser."""
    try:
        import yaml  # type: ignore
        data = yaml.safe_load(design_text) or {}
        concept = (data.get("project") or {}).get("concept") or {}
        return concept if isinstance(concept, dict) else {}
    except Exception:
        pass
    concept, inside, indent = {}, False, 0
    for line in design_text.splitlines():
        if re.match(r"^\s*concept:\s*$", line):
            inside, indent = True, len(line) - len(line.lstrip())
            continue
        if inside:
            if line.strip() and (len(line) - len(line.lstrip())) <= indent:
                break
            m = re.match(r"^\s*(\w+):\s*(.*?)\s*(#.*)?$", line)
            if m and not line.lstrip().startswith("#"):
                concept[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    return concept


def _placeholder(text: str) -> bool:
    return not text or text.startswith("<") or text.upper() in {"TBD", "TODO", "..."}


def check(project: Path) -> dict:
    """Return {'ready': bool, 'concept_decided': bool, 'items': [(status, name, detail)], 'missing': [...]}."""
    items = []

    brief = _read(project / "PROJECT-BRIEF.md")
    n = len(_new_lines(brief, "PROJECT-BRIEF.md", ANSWERED))
    ok = bool(brief) and n >= THRESHOLDS["brief_answers"] and "<project name>" not in brief.splitlines()[0]
    items.append(("ok" if ok else "missing", "brief",
                  f"PROJECT-BRIEF.md: {n} answered lines" if brief else "PROJECT-BRIEF.md not found"))

    program = _read(project / "PROGRAM.md")
    template_rows = {line.strip() for line in _read(TEMPLATES / "PROGRAM.md").splitlines()}
    rows = [line for line in _section(program, "Space list").splitlines()
            if re.match(r"^\|\s*[A-Z][A-Z0-9-]*\s*\|", line) and line.strip() not in template_rows
            and not line.startswith("| ID")]
    ok = bool(program) and len(rows) >= THRESHOLDS["program_rows"]
    items.append(("ok" if ok else "missing", "program",
                  f"PROGRAM.md: {len(rows)} spaces listed" if program else "PROGRAM.md not found"))

    taste = _read(project / "TASTE.md")
    starred = len(_new_lines(taste, "TASTE.md", STARRED))
    answered = len(_new_lines(taste, "TASTE.md", ANSWERED))
    dial = re.search(r"Surprise dial[^:\n]*:[ \t]*([1-5])", taste)
    ok = bool(taste) and (starred >= THRESHOLDS["taste_starred"] or answered >= THRESHOLDS["taste_answers"])
    detail = f"TASTE.md: {starred}/6 starred answered, surprise dial {dial.group(1) if dial else 'not set'}" \
        if taste else "TASTE.md not found"
    items.append(("ok" if ok else "missing", "taste", detail))

    precedents = _read(project / "PRECEDENTS.md")
    entries = [h for h in re.findall(r"^###\s+(.+)$", precedents, re.M)
               if not h.lower().startswith("example") and not h.startswith("<")]
    ok = len(entries) >= THRESHOLDS["precedents"]
    items.append(("ok" if ok else "missing", "precedents",
                  f"PRECEDENTS.md: {len(entries)} entries" if precedents else "PRECEDENTS.md not found"))

    concept = _concept(_read(project / "design.yaml"))
    status = str(concept.get("status", "")).lower()
    decided = (status == "chosen" and not _placeholder(str(concept.get("statement", "")))) or \
              (status == "skipped" and not _placeholder(str(concept.get("skip_reason", ""))))
    if decided:
        detail = f"concept {status}: " + str(concept.get("statement") or concept.get("skip_reason"))[:90]
    else:
        detail = "no concept chosen in design.yaml (project.concept), and no skip recorded"
    items.append(("ok" if decided else "missing", "concept", detail))

    missing = [name for st, name, _ in items if st != "ok"]
    return {"ready": decided and "brief" not in missing and "program" not in missing,
            "concept_decided": decided, "items": items, "missing": missing}


def reminder(result: dict) -> str:
    gaps = ", ".join(result["missing"])
    lines = [
        "[arch-design-kit · readiness check (playbook 08, CR-GATE-1)]",
        f"This project is not ready for schematic design. Missing: {gaps}.",
        "Before producing any floor plan, model, massing or render, tell the user this plainly, then ask",
        "which they want:",
        "  (a) run the concept-studio skill now (it fills the gaps with them, then generates concepts);",
        "  (b) fill the gaps together first: for taste, the six starred questions in TASTE.md;",
        "      for precedents, 2 or more buildings with the move to take from each;",
        "  (c) skip the concept phase: record project.concept.status: skipped and their reason in design.yaml.",
        "Do not start geometry until they choose. Status by item:",
    ]
    lines += [f"  - {'OK ' if st == 'ok' else 'GAP'} {name}: {detail}" for st, name, detail in result["items"]]
    return "\n".join(lines)


def hook() -> int:
    try:
        event = json.load(sys.stdin)
    except Exception:
        return 0
    try:
        project = Path(event.get("cwd") or os.getcwd())
        if not any((project / f).exists() for f in ("design.yaml", "PROJECT-BRIEF.md")):
            return 0
        if not DESIGN_INTENT.search(str(event.get("prompt", ""))):
            return 0
        result = check(project)
        if result["ready"]:
            return 0
        # say it once per session for the same set of gaps
        key = hashlib.sha1((str(event.get("session_id", "")) + str(project) + ",".join(result["missing"]))
                           .encode()).hexdigest()[:16]
        marker = Path(tempfile.gettempdir()) / f"arch-kit-ready-{key}"
        if marker.exists():
            return 0
        marker.write_text("shown", encoding="utf-8")
        print(reminder(result))
    except Exception:
        return 0
    return 0


def main(argv: list) -> int:
    if "--hook" in argv:
        return hook()
    project = Path(next((a for a in argv if not a.startswith("--")), "."))
    result = check(project)
    print(f"Readiness: {project.resolve()}")
    for st, name, detail in result["items"]:
        print(f"  {'OK ' if st == 'ok' else 'GAP'}  {name:<11} {detail}")
    if result["ready"]:
        print("Ready for schematic design.")
        return 0
    print(reminder(result).split("\n", 1)[1].split("Status by item:")[0].rstrip())
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
