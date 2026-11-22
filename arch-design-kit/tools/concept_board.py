#!/usr/bin/env python3
"""concept_board.py: the concept board as one page to look at, and a blind pack for the jury.

    python3 concept_board.py [project_dir]          # → concepts/index.html
    python3 concept_board.py [project_dir] --jury   # → concepts/jury.md + concepts/jury-key.json

Reads the concept phase's files (playbook 08):
  concepts/C-01.yaml …   one per concept: id, name, round, lens, kind (grounded|stretch|wild),
                          statement, key_move, section_idea, gives_up, uses, parents (round 2)
  concepts/C-01-parti.svg, concepts/C-01-section.svg   optional diagrams (not to scale)
  concepts/obvious.yaml  the obvious answers (CR-OBVIOUS-1), a list of strings
The board shows every concept as a card (statement, parti, section, key move, what it gives up)
and the obvious answers as grey control cards. A statement that reads like a style or a feature
list is flagged (CR-IDEA-1). With --jury it writes a blind pack: concepts and obvious answers
shuffled under neutral IDs, with no lens, kind or round, so jurors judge ideas, not labels
(CR-CRITIC-1). The key that maps the IDs back is in jury-key.json, for Claude only.
"""
from __future__ import annotations

import hashlib
import html
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_design import concept_status  # noqa: E402

FIELDS = ("key_move", "section_idea", "gives_up", "uses")


def load_concepts(folder: Path) -> tuple:
    try:
        import yaml
    except ImportError:
        sys.exit("concept_board.py needs PyYAML (pip install pyyaml)")
    concepts = []
    for path in sorted(folder.glob("C-*.yaml")):
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        data.setdefault("id", path.stem)
        concepts.append(data)
    obvious_path = folder / "obvious.yaml"
    obvious = (yaml.safe_load(obvious_path.read_text(encoding="utf-8")) or []) if obvious_path.exists() else []
    return concepts, [str(o) for o in obvious]


def weak(statement: str) -> str | None:
    state, problem = concept_status({"status": "chosen", "statement": statement})
    return None if state == "chosen" else problem


def board(folder: Path, concepts: list, obvious: list) -> Path:
    cards = []
    for c in concepts:
        cid = str(c["id"])
        imgs = "".join(f'<figure><img src="{html.escape(cid)}-{kind}.svg" alt="{kind}"><figcaption>{kind}</figcaption></figure>'
                       for kind in ("parti", "section") if (folder / f"{cid}-{kind}.svg").exists())
        flag = weak(str(c.get("statement", "")))
        meta = " · ".join(str(c[k]) for k in ("lens", "kind") if c.get(k)) + (f" · round {c['round']}" if c.get("round") else "")
        if c.get("parents"):
            meta += " · from " + ", ".join(map(str, c["parents"]))
        rows = "".join(f"<dt>{k.replace('_', ' ')}</dt><dd>{html.escape(str(c[k]))}</dd>" for k in FIELDS if c.get(k))
        cards.append(
            f'<article class="card"><header><b>{html.escape(cid)}</b> {html.escape(str(c.get("name", "")))}'
            f'<span>{html.escape(meta)}</span></header>'
            f'<p class="statement">{html.escape(str(c.get("statement", "(no statement)")))}</p>'
            + (f'<p class="flag">⚠ {html.escape(flag)}</p>' if flag else "")
            + f'<div class="diagrams">{imgs or "<em>no diagrams yet</em>"}</div><dl>{rows}</dl></article>')
    for i, o in enumerate(obvious, 1):
        cards.append(f'<article class="card obvious"><header><b>Obvious {i}</b><span>control (CR-OBVIOUS-1)</span></header>'
                     f'<p class="statement">{html.escape(o)}</p></article>')
    out = folder / "index.html"
    out.write_text(
        "<!doctype html><meta charset='utf-8'><title>Concept board</title><style>"
        "body{font-family:system-ui,sans-serif;margin:16px;background:#fff;color:#1f2328}"
        "main{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px}"
        ".card{border:1px solid #d0d7de;border-radius:8px;padding:12px}.card header span{float:right;color:#57606a;font-size:12px}"
        ".statement{font-size:17px;line-height:1.35;margin:8px 0}.flag{color:#cf222e;font-size:13px}"
        ".diagrams{display:flex;gap:8px}.diagrams figure{margin:0;flex:1}.diagrams img{width:100%;border:1px solid #eaeef2}"
        ".diagrams figcaption{font-size:11px;color:#57606a}dl{font-size:13px;margin:8px 0 0}dt{font-weight:600;margin-top:4px}"
        "dd{margin:0}.obvious{background:#f6f8fa;color:#57606a}</style>"
        f"<h1>Concept board</h1><p>{len(concepts)} concepts · {len(obvious)} obvious answers shown as controls. "
        "Diagrams are not to scale.</p><main>" + "".join(cards) + "</main>", encoding="utf-8")
    return out


def jury(folder: Path, concepts: list, obvious: list) -> Path:
    entries = [(str(c["id"]), str(c.get("statement", "")), str(c.get("key_move", "")), str(c.get("gives_up", "")))
               for c in concepts]
    entries += [(f"OBVIOUS-{i}", o, "", "") for i, o in enumerate(obvious, 1)]
    seed = int(hashlib.sha256(str(folder.resolve()).encode()).hexdigest(), 16)
    random.Random(seed).shuffle(entries)
    key, lines = {}, ["# Jury pack (blind)", "",
                      "Each entry is a house idea. Judge the ideas, not who made them. Rank by pairwise comparison, "
                      "name one champion and one to kill, each with a reason.", ""]
    for i, (real, statement, move, gives) in enumerate(entries, 1):
        jid = f"J-{i:02d}"
        key[jid] = real
        lines += [f"## {jid}", f"- Idea: {statement}"]
        if move:
            lines.append(f"- Key move: {move}")
        if gives:
            lines.append(f"- Gives up: {gives}")
        lines.append("")
    (folder / "jury-key.json").write_text(json.dumps(key, indent=2), encoding="utf-8")
    out = folder / "jury.md"
    out.write_text("\n".join(lines), encoding="utf-8")
    return out


def main(argv: list) -> int:
    project = Path(next((a for a in argv if not a.startswith("--")), "."))
    folder = project / "concepts"
    if not folder.is_dir():
        print(f"concept_board.py: no concepts/ folder in {project.resolve()}", file=sys.stderr)
        return 2
    concepts, obvious = load_concepts(folder)
    out = jury(folder, concepts, obvious) if "--jury" in argv else board(folder, concepts, obvious)
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
