#!/usr/bin/env python3
"""ready_check.py: is this project ready to design? (playbook 08, CR-GATE-1)

    python3 ready_check.py [project_dir]     # human report; exit 0 = ready, 1 = not yet
    python3 ready_check.py --hook            # Claude Code UserPromptSubmit hook: JSON on stdin

Before plans or models are drawn, it checks a project folder for the groundwork creative design
needs: brief (PROJECT-BRIEF.md) · program (PROGRAM.md) · taste (TASTE.md, or the owner's
TASTE-PROFILE.md one folder up) · precedents (PRECEDENTS.md) · and a concept chosen in
design.yaml (project.concept), or skipped on purpose.

Hook mode is the "warn me before we jump into designing" the owner asked for. It speaks only when
the prompt asks for design work:
  * in a folder with no project (it offers to set one up), or with exactly one project one level down;
  * in a project that isn't ready, at most once per session and project (the marker expires after
    6 hours), and never while the concept studio is running or when the prompt itself names the
    studio or a skip.
It never blocks a prompt and never fails loudly (a hook must not break the session).

Standard library only (Python 3.8+, so macOS's built-in python3 works). PyYAML is used for
design.yaml when installed; a small fallback parser handles the block and inline forms otherwise.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_design import concept_status, PRE_SCHEMATIC  # noqa: E402  (stdlib-only import)

TEMPLATES = Path(__file__).resolve().parent.parent / "templates"
PROJECT_FILES = ("design.yaml", "PROJECT-BRIEF.md")
MARKER_TTL_S = 6 * 3600

# Design intent: strong words alone, or a making-verb near a design noun (same sentence).
STRONG = re.compile(
    r"\b(design(?:ing|ed|s)?|redesign\w*|sketch(?:es|ing)?|draw(?:ing|s|n)?|model(?:l)?ing|"
    r"lay(?:ing)? ?outs?|floor ?plans?|massing|concepts?|renders?|rendering|elevations?|schematics?|parti)\b"
    r"|\b\d\s*-?\s*bed(?:room)?s?\b", re.I)
VERB = re.compile(r"\b(make|create|build|draw|generate|give me|start|show me|produce|come up with|"
                  r"mock up|let'?s do|try)\b", re.I)
NOUN = re.compile(r"\b(plans?|house|home|cabin|adu|addition|model|sections?|rooms?|kitchen|bedrooms?|garage|"
                  r"layouts?|options|versions?|variants?|scheme)\b", re.I)
EXEMPT = re.compile(r"concept[- ]?studio|skip(?:ping)? (?:the )?concept|status:\s*skipped|\bTASTE\.md\b", re.I)
EMPTY_ANSWER = re.compile(r"^(?:tbd|todo|\?+|\.{2,}|…|-+|<.*>)$", re.I)


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


def design_intent(prompt: str) -> bool:
    if STRONG.search(prompt):
        return True
    return any(VERB.search(s) and NOUN.search(s) for s in re.split(r"[.!?\n]", prompt))


# ------------------------------------------------------------------------- reading the files
def _answers(text: str, template_name: str, starred_only: bool = False) -> list:
    """Answered '- Label: answer' bullets that differ from the blank template. An answer may sit
    after the colon or on the indented line(s) right below the bullet. TBD, ?, … don't count."""
    baseline = {line.strip() for line in _read(TEMPLATES / template_name).splitlines()}
    lines = text.splitlines()
    out = []
    for i, line in enumerate(lines):
        m = re.match(r"^\s*-\s+(★\s*)?([^:\n]{2,}?):[ \t]*(.*)$", line)
        if not m or (starred_only and not m.group(1)):
            continue
        answer = m.group(3).strip()
        if not answer:
            follow = []
            for nxt in lines[i + 1:]:
                if not nxt.strip() or re.match(r"^\s*(-|#|\|)", nxt):
                    break
                follow.append(nxt.strip())
            answer = " ".join(follow)
        if not answer or EMPTY_ANSWER.match(answer) or line.strip() in baseline:
            continue
        out.append((m.group(2).strip(), answer))
    return out


def _section(text: str, heading: str) -> str:
    m = re.search(r"^##\s+" + re.escape(heading) + r".*?$(.*?)(?=^##\s|\Z)", text, re.M | re.S)
    return m.group(1) if m else ""


def _parse_inline(body: str) -> dict:
    """{status: chosen, statement: "a, b", id: C-01} -> dict (quotes respected)."""
    out, key, buf, quote = {}, None, "", None
    for ch in body.strip().strip("{}") + ",":
        if quote:
            if ch == quote:
                quote = None
            else:
                buf += ch
        elif ch in "\"'":
            quote = ch
        elif ch == ":" and key is None:
            key, buf = buf.strip(), ""
        elif ch == ",":
            if key:
                out[key] = buf.strip()
            key, buf = None, ""
        else:
            buf += ch
    return out


def read_project(design_text: str) -> dict:
    """project: {phase, name, concept} from design.yaml, with or without PyYAML."""
    try:
        import yaml  # type: ignore
        data = yaml.safe_load(design_text) or {}
        project = data.get("project") or {}
        return project if isinstance(project, dict) else {}
    except Exception:
        pass
    project, concept, in_project, in_concept, concept_indent = {}, {}, False, False, 0
    for raw in design_text.splitlines():
        line = re.sub(r"\s+#.*$", "", raw) if not raw.lstrip().startswith("#") else ""
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip())
        if indent == 0:
            in_project, in_concept = line.startswith("project:"), False
            continue
        if not in_project:
            continue
        m = re.match(r"^\s*(\w+):\s*(.*)$", line)
        if not m:
            continue
        key, value = m.group(1), m.group(2).strip()
        if in_concept and indent > concept_indent:
            concept[key] = value.strip("\"'")
            continue
        in_concept = False
        if key == "concept":
            if value.startswith("{"):
                concept.update(_parse_inline(value))
            else:
                in_concept, concept_indent = True, indent
        elif indent <= 2:
            project[key] = value.strip("\"'")
    project["concept"] = concept
    return project


# ------------------------------------------------------------------------- the check
def check(project: Path) -> dict:
    """{'ready', 'concept_state', 'phase', 'items': [(ok, name, detail)], 'missing': [...]}"""
    items = []
    proj = read_project(_read(project / "design.yaml"))
    phase = str(proj.get("phase") or ("brief" if (project / "PROJECT-BRIEF.md").exists() else "schematic"))

    brief = _read(project / "PROJECT-BRIEF.md")
    n = len(_answers(brief, "PROJECT-BRIEF.md"))
    ok = bool(brief) and n >= 8 and "<project name>" not in (brief.splitlines() or [""])[0]
    items.append((ok, "brief", f"PROJECT-BRIEF.md: {n} answers" if brief else "PROJECT-BRIEF.md not found"))

    program = _read(project / "PROGRAM.md")
    rows = [l for l in _section(program, "Space list").splitlines()
            if re.match(r"^\|\s*[A-Z][A-Z0-9-]*\s*\|", l) and not l.startswith("| ID")]
    ok = bool(program) and len(rows) >= 6
    items.append((ok, "program", f"PROGRAM.md: {len(rows)} spaces listed" if program else "PROGRAM.md not found"))

    def taste_state(text: str, name: str):
        starred = _answers(text, "TASTE.md", starred_only=True)
        dial = next((a for label, a in starred if "surprise dial" in label.lower() and re.match(r"^[1-5]\b", a)), None)
        others = [a for label, a in starred if "surprise dial" not in label.lower()]
        return bool(text) and dial is not None and len(others) >= 3, \
            f"{name}: surprise dial {dial[0] if dial else 'not set'}, {len(others)}/5 other ★ answered"
    ok, detail = taste_state(_read(project / "TASTE.md"), "TASTE.md")
    if not ok:
        prof_ok, prof_detail = taste_state(_read(project.parent / "TASTE-PROFILE.md"), "TASTE-PROFILE.md (one folder up)")
        if prof_ok:
            ok, detail = True, prof_detail
    items.append((ok, "taste", detail if (project / "TASTE.md").exists() or ok else "TASTE.md not found"))

    precedents = _read(project / "PRECEDENTS.md")
    entries = [b for b in re.split(r"^###\s+", precedents, flags=re.M)[1:]
               if not b.lower().startswith("example") and not b.startswith("<")
               and re.search(r"Move to take:[ \t]*\S", b)]
    items.append((len(entries) >= 2, "precedents",
                  f"PRECEDENTS.md: {len(entries)} entries with a move" if precedents else "PRECEDENTS.md not found"))

    state, problem = concept_status(proj.get("concept") or {})
    concept = proj.get("concept") or {}
    detail = {"chosen": f"concept chosen: {str(concept.get('statement'))[:90]}",
              "skipped": f"concept skipped on purpose: {str(concept.get('skip_reason'))[:90]}"}.get(
        state, problem or "no concept chosen yet (design.yaml project.concept)")
    items.append((state in ("chosen", "skipped"), "concept", detail))

    missing = [name for ok, name, _ in items if not ok]
    decided = state in ("chosen", "skipped")
    return {"ready": decided and "brief" not in missing and "program" not in missing,
            "concept_state": state, "phase": phase, "items": items, "missing": missing}


def next_steps(result: dict) -> list:
    """Plain next steps built from the actual gaps."""
    m, steps = set(result["missing"]), []
    if result["phase"] in ("brief", "programming") and m & {"brief", "program"}:
        steps.append("finish the " + " and ".join(x for x in ("brief", "program") if x in m) + " first")
    if "taste" in m:
        steps.append("set the surprise dial and answer the ★ questions in TASTE.md")
    if "precedents" in m:
        steps.append("add 2+ buildings to PRECEDENTS.md, each with the move to take")
    if "concept" in m:
        steps.append("run the concept studio, or record a deliberate skip with a reason")
    return steps


def claude_reminder(result: dict) -> str:
    steps = "; ".join(next_steps(result))
    return ("[arch-design-kit · CR-GATE-1] Before drawing anything: this project (phase: "
            f"{result['phase']}) is missing {', '.join(result['missing'])}. In one or two sentences, tell the "
            f"user and offer: {steps}. Start geometry only after they answer.")


# ------------------------------------------------------------------------- hook mode
def _studio_running(project: Path, result: dict) -> bool:
    concepts = _read(project / "CONCEPTS.md")
    started = bool(re.search(r"^###\s+C-\d+\s*·\s*\S", concepts, re.M)) or any((project / "concepts").glob("C-*.yaml"))
    return result["concept_state"] == "undecided" and (result["phase"] == "concept" or started)


def _once(session: str, project: Path) -> bool:
    """True the first time for this session and project, again after MARKER_TTL_S."""
    key = hashlib.sha1(f"{session}|{project.resolve()}".encode()).hexdigest()[:16]
    marker = Path(tempfile.gettempdir()) / f"arch-kit-ready-{key}"
    try:
        if marker.exists() and time.time() - marker.stat().st_mtime < MARKER_TTL_S:
            return False
        marker.write_text("shown", encoding="utf-8")
    except OSError:
        pass
    return True


def hook() -> int:
    try:
        event = json.load(sys.stdin)
    except Exception:
        return 0
    try:
        prompt = str(event.get("prompt", ""))
        if not design_intent(prompt) or EXEMPT.search(prompt):
            return 0
        cwd = Path(event.get("cwd") or os.getcwd())
        session = str(event.get("session_id", ""))
        project = cwd if any((cwd / f).exists() for f in PROJECT_FILES) else None
        if project is None:
            below = [d for d in sorted(cwd.iterdir()) if d.is_dir() and any((d / f).exists() for f in PROJECT_FILES)]
            if len(below) == 1:
                project = below[0]
            elif len(below) > 1:
                if _once(session, cwd):
                    print("[arch-design-kit] Several design projects are in this folder ("
                          + ", ".join(d.name for d in below[:6]) + "). Ask which one the user means before drawing.")
                return 0
            else:
                if _once(session, cwd):
                    print("[arch-design-kit] No design project is set up here. Before drawing, offer in one sentence "
                          "to set one up from the kit's templates (brief, program, taste, precedents) and run the "
                          "concept studio; if the user only wants a quick sketch, go ahead and label it as one.")
                return 0
        result = check(project)
        if result["ready"]:
            return 0
        if result["concept_state"] == "skipped":
            if "taste" in result["missing"] and _once(session, project):
                print("[arch-design-kit] The concept phase was skipped on purpose. Taste notes are thin; "
                      "consider asking the ★ questions in TASTE.md, without blocking the work.")
            return 0
        if _studio_running(project, result) or not _once(session, project):
            return 0
        print(claude_reminder(result))
    except Exception:
        return 0
    return 0


def main(argv: list) -> int:
    if "--hook" in argv:
        return hook()
    project = Path(next((a for a in argv if not a.startswith("--")), "."))
    result = check(project)
    print(f"Readiness: {project.resolve()}  (phase: {result['phase']})")
    for ok, name, detail in result["items"]:
        print(f"  {'OK ' if ok else 'GAP'}  {name:<11} {detail}")
    if result["ready"]:
        print("Ready to design.")
        return 0
    print("Next: " + "; ".join(next_steps(result)) + ".")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
