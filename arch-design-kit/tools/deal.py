#!/usr/bin/env python3
"""deal.py: deal each concept lens its own cards (CR-SPECIFIC-1, playbook 08).

    python3 deal.py [project_dir] [--round 1] [--lenses site,light,ritual,structure,constraint,contrarian]

For each lens it prints:
  * two precedents: one from the owner's PRECEDENTS.md, if any, and one from the kit's library
    that the owner did NOT pick, so lenses meet something new;
  * one analogy and one provocation from playbook/provocations.md.
No card repeats across lenses. The seed comes from the project name and the round, so a rerun of
the same round deals the same hand, and a new round (or a new project) deals a new one.
Paste each lens's block into its subagent prompt in place of any fixed example list.
"""
from __future__ import annotations

import argparse
import hashlib
import random
import re
import sys
from pathlib import Path

KIT = Path(__file__).resolve().parent.parent
LENSES = ["site", "light", "ritual", "structure", "constraint", "contrarian"]


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


def library() -> list:
    """(name, move) rows from playbook/precedents.md tables."""
    rows = []
    for line in _read(KIT / "playbook" / "precedents.md").splitlines():
        m = re.match(r"^\|\s*\*\*(.+?)\*\*\s*(\(.*?\))?\s*\|\s*(.+?)\s*\|", line)
        if m:
            rows.append((m.group(1) + (" " + m.group(2) if m.group(2) else ""), m.group(3)))
    return rows


def owner_precedents(project: Path) -> list:
    out = []
    for block in re.split(r"^###\s+", _read(project / "PRECEDENTS.md"), flags=re.M)[1:]:
        name = block.splitlines()[0].strip()
        if name.lower().startswith("example") or name.startswith("<"):
            continue
        move = re.search(r"Move to take:[ \t]*(\S.*)", block)
        out.append((name, move.group(1).strip() if move else "(move not written yet)"))
    return out


def cards(heading: str) -> list:
    text = _read(KIT / "playbook" / "provocations.md")
    m = re.search(r"^##\s+" + heading + r"\s*$(.*?)(?=^##\s|\Z)", text, re.M | re.S)
    return [l[2:].strip() for l in (m.group(1) if m else "").splitlines() if l.startswith("- ")]


def project_name(project: Path) -> str:
    m = re.search(r"^\s*name:\s*(.+)$", _read(project / "design.yaml"), re.M)
    return m.group(1).strip().strip("\"'") if m else project.resolve().name


def deal(project: Path, round_no: int, lenses: list) -> dict:
    seed = int(hashlib.sha256(f"{project_name(project)}|{round_no}".encode()).hexdigest(), 16)
    rng = random.Random(seed)
    owners, lib = owner_precedents(project), library()
    picked = {n.split(" (")[0].lower() for n, _ in owners}
    fresh = [r for r in lib if r[0].split(" (")[0].lower() not in picked]
    analogies, provocations = cards("Analogies"), cards("Provocations")
    for pool in (owners, fresh, analogies, provocations):
        rng.shuffle(pool)
    hands = {}
    for i, lens in enumerate(lenses):
        hand = []
        if owners:
            hand.append(("owner's precedent",) + owners[i % len(owners)])
        if fresh:
            hand.append(("new precedent",) + fresh[i % len(fresh)])
        if analogies:
            hand.append(("analogy", analogies[i % len(analogies)], ""))
        if provocations:
            hand.append(("provocation", provocations[i % len(provocations)], ""))
        hands[lens] = hand
    return hands


def main(argv: list) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("project", nargs="?", default=".")
    ap.add_argument("--round", type=int, default=1)
    ap.add_argument("--lenses", default=",".join(LENSES))
    args = ap.parse_args(argv)
    project = Path(args.project)
    hands = deal(project, args.round, [l.strip() for l in args.lenses.split(",") if l.strip()])
    print(f"# Deal for {project_name(project)} · round {args.round}\n")
    for lens, hand in hands.items():
        print(f"## Lens: {lens}")
        for kind, a, b in hand:
            print(f"- {kind}: {a}" + (f": take the move: {b}" if b else ""))
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
