#!/usr/bin/env python3
"""explore_variants.py: search a family of designs, keep the most different ones that work (CR-SEARCH-1).

    python3 explore_variants.py path/to/generator.py [--n 80] [--keep 6] [--seed 7] [--out DIR]
                                [--mode concept|full] [--area-target SQFT] [--tol 0.15]

A generator is a small Python file that Claude (or you) writes for one concept family:

    PARAMS = {"parti": ["linear", "L", "U"], "public_depth_ft": [14, 16, 18], ...}
    def generate(p: dict) -> dict:        # one choice per param -> a full design.yaml spec (dict)
        ...

The tool samples up to --n parameter combinations (the full grid if it is small enough),
builds each spec, and checks it:
  * --mode concept (default): only the hard limits stop a variant (CR-HARD-1): overlaps, setbacks,
    the area budget, stair feasibility, bedrooms with an outside wall. A sketch generator that
    emits room rectangles is enough, with no doors, alarms or fixtures needed;
  * --mode full: every check_design.py rule, for generators that emit complete specs.
--area-target sets the net conditioned budget (sq ft, ±--tol) when the generator doesn't.
From the survivors it drops near-duplicates (same geometry, e.g. a mirrored room order) and keeps
the --keep most different, judged on the GEOMETRY, not on the parameter names:
  * the first pick is the variant nearest the family's median (a reference point);
  * each next pick is the one farthest from everything picked so far (farthest-point sampling),
    measured on plan features (aspect, compactness, shape factor, south-glazing share,
    circulation share, outdoor-room share, level count) plus the footprint shape itself.
    Categorical parameters only break ties. South means the plan's -y side (plan north up).
Outputs go to --out (default: <generator dir>/out/variants): one YAML spec and one SVG plan per
kept variant, a contact sheet (index.html) for looking at them side by side, and summary.md.
"""
from __future__ import annotations

import argparse
import html
import importlib.util
import itertools
import math
import random
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_design import Checker, shared_edge, CIRCULATION, UNCONDITIONED, OUTDOOR, MM_PER_IN  # noqa: E402
from render_plan import render_level  # noqa: E402

FEATURES = ("aspect", "compactness", "shape_factor", "south_glazing", "circulation", "outdoor", "levels")
GRID = 16          # footprint signature resolution (cells per side)
DUPLICATE = 0.02   # geometric distance below which two variants count as the same design


def load_generator(path: Path):
    spec = importlib.util.spec_from_file_location("variant_generator", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if not hasattr(module, "PARAMS") or not hasattr(module, "generate"):
        sys.exit(f"{path}: a generator needs PARAMS (dict of lists) and generate(params) -> spec")
    return module


def combos(params: dict, n: int, seed: int) -> list:
    keys = list(params)
    grid = [dict(zip(keys, values)) for values in itertools.product(*(params[k] for k in keys))]
    if len(grid) <= n:
        return grid
    return random.Random(seed).sample(grid, n)


def features(spec: dict) -> dict:
    """Plan features of the conditioned rooms (all levels), in units the spec declares."""
    k = 1.0 if (spec.get("project") or {}).get("units") == "in" else 1.0 / MM_PER_IN
    rects, glazing, south, circ, net, outdoor = [], 0.0, 0.0, 0.0, 0.0, 0.0
    levels = spec.get("levels") or []
    for lv in levels:
        for r in lv.get("rooms") or []:
            if not isinstance(r.get("rect"), list):
                continue
            x, y, w, d = (float(v) * k for v in r["rect"])
            if r.get("type") in OUTDOOR:          # open-air rooms: counted, not massed
                outdoor += w * d
                continue
            rects.append((x, y, w, d))            # built mass: conditioned rooms and garages
            if r.get("type") in UNCONDITIONED:
                continue
            area = w * d
            net += area
            if r.get("type") in CIRCULATION:
                circ += area
            for win in r.get("windows") or []:
                a = float(win.get("width_in", 0)) * float(win.get("height_in", 0)) * k * k
                glazing += a
                if win.get("wall") == "S":
                    south += a
    if not rects or not net:
        return dict({f: 0.0 for f in FEATURES}, _grid=[0] * GRID * GRID)
    x0 = min(r[0] for r in rects)
    y0 = min(r[1] for r in rects)
    x1 = max(r[0] + r[2] for r in rects)
    y1 = max(r[1] + r[3] for r in rects)
    bw, bd = x1 - x0, y1 - y0
    shared = sum((e[3] - e[2]) for i, a in enumerate(rects) for b in rects[i + 1:]
                 if (e := shared_edge(a, b)) is not None)
    perimeter = sum(2 * (r[2] + r[3]) for r in rects) - 2 * shared
    built = sum(r[2] * r[3] for r in rects)
    return {
        "aspect": max(bw, bd) / max(1e-9, min(bw, bd)),
        "compactness": built / max(1e-9, bw * bd),
        "shape_factor": perimeter / math.sqrt(built),
        "south_glazing": south / glazing if glazing else 0.0,
        "circulation": circ / net,
        "outdoor": outdoor / (net + outdoor),
        "levels": float(len(levels)),
        "_grid": footprint(rects, x0, y0, bw, bd),
    }


def footprint(rects, x0, y0, bw, bd) -> list:
    """Occupancy of the footprint on a GRID x GRID raster of its own bounding box (shape, not size)."""
    cells = []
    for j in range(GRID):
        py = y0 + (j + 0.5) * bd / GRID
        for i in range(GRID):
            px = x0 + (i + 0.5) * bw / GRID
            cells.append(1 if any(r[0] <= px <= r[0] + r[2] and r[1] <= py <= r[1] + r[3] for r in rects) else 0)
    return cells


def shape_distance(a: list, b: list) -> float:
    """1 - intersection over union of two footprint rasters (0 = same shape)."""
    inter = sum(1 for x, y in zip(a, b) if x and y)
    union = sum(1 for x, y in zip(a, b) if x or y)
    return 1.0 - inter / union if union else 0.0


def distance(a: dict, b: dict, ranges: dict, categorical: list) -> float:
    """Geometry first: normalized plan features plus footprint shape; parameters only break ties."""
    d = 0.0
    for f in FEATURES:
        lo, hi = ranges[f]
        if hi > lo:
            d += ((a["features"][f] - b["features"][f]) / (hi - lo)) ** 2
    d = math.sqrt(d) + shape_distance(a["features"]["_grid"], b["features"]["_grid"])
    return d + 0.01 * sum(1 for c in categorical if a["params"].get(c) != b["params"].get(c))


def dedupe(passing: list) -> list:
    """Keep one of each group of geometrically identical variants."""
    ranges = {f: (min(v["features"][f] for v in passing), max(v["features"][f] for v in passing)) for f in FEATURES}
    unique = []
    for v in passing:
        if all(distance(v, u, ranges, []) >= DUPLICATE for u in unique):
            unique.append(v)
    return unique


def select(passing: list, keep: int, categorical: list) -> list:
    if len(passing) <= keep:
        return list(passing)
    ranges = {f: (min(v["features"][f] for v in passing), max(v["features"][f] for v in passing)) for f in FEATURES}
    median = {f: statistics.median(v["features"][f] for v in passing) for f in FEATURES}
    median["_grid"] = [1 if statistics.median(v["features"]["_grid"][i] for v in passing) >= 0.5 else 0
                       for i in range(GRID * GRID)]
    typical = min(passing, key=lambda v: distance(v, {"features": median, "params": v["params"]}, ranges, []))
    picked = [typical]
    while len(picked) < keep:
        best = max((v for v in passing if v not in picked),
                   key=lambda v: min(distance(v, p, ranges, categorical) for p in picked))
        picked.append(best)
    return picked


def main(argv: list) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("generator")
    ap.add_argument("--n", type=int, default=80)
    ap.add_argument("--keep", type=int, default=6)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--out")
    ap.add_argument("--mode", choices=("concept", "full"), default="concept")
    ap.add_argument("--area-target", type=float, help="net conditioned budget, sq ft")
    ap.add_argument("--tol", type=float, default=0.15)
    args = ap.parse_args(argv)

    gen_path = Path(args.generator).resolve()
    gen = load_generator(gen_path)
    out = Path(args.out) if args.out else gen_path.parent / "out" / "variants"
    out.mkdir(parents=True, exist_ok=True)
    categorical = [k for k, vals in gen.PARAMS.items() if any(isinstance(v, str) for v in vals)]

    tried, passing, failing = combos(gen.PARAMS, args.n, args.seed), [], []
    for params in tried:
        try:
            spec = gen.generate(dict(params))
        except Exception as exc:  # a generator bug for this combination: report it, keep going
            failing.append((params, [f"generator error: {exc}"]))
            continue
        if args.area_target:
            spec.setdefault("project", {})["area_budget_sqft"] = args.area_target
            spec["project"]["area_tolerance"] = args.tol
        findings = Checker(spec, args.mode).run()
        errors = [f"{f.rule} {f.where}: {f.message}" for f in findings if f.severity == "ERROR"]
        warns = [f"{f.rule}" for f in findings if f.severity == "WARN"]
        if errors:
            failing.append((params, errors))
        else:
            passing.append({"params": params, "spec": spec, "features": features(spec), "warns": warns})

    unique = dedupe(passing)
    print(f"{len(tried)} variants tried · {len(passing)} pass ({args.mode} mode) · {len(failing)} dropped · "
          f"{len(passing) - len(unique)} near-duplicates merged")
    if not passing:
        for params, errors in failing[:5]:
            print(" ", params, "→", errors[0])
        return 1
    kept = select(unique, args.keep, categorical)

    import yaml
    cards, rows = [], []
    for i, v in enumerate(kept, 1):
        vid = f"V{i:02d}"
        spec = v["spec"]
        spec.setdefault("project", {})["name"] = f"{spec['project'].get('name', 'variant')} · {vid}"
        (out / f"{vid}.yaml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
        k = 1.0 if spec["project"].get("units") == "in" else 1.0 / MM_PER_IN
        svgs = []
        for lv in spec.get("levels") or []:
            svg = render_level(spec, lv, k)
            if svg:
                name = f"{vid}-{lv.get('id', 'L')}-plan.svg"
                (out / name).write_text(svg, encoding="utf-8")
                svgs.append(name)
        label = "nearest the median" if i == 1 else "most different"
        p = ", ".join(f"{a}={b}" for a, b in v["params"].items())
        f = " · ".join(f"{a} {b:.2f}" for a, b in v["features"].items() if not a.startswith("_"))
        warns = ", ".join(sorted(set(v["warns"]))) or "none"
        rows.append(f"| {vid} | {label} | {p} | {f} | {warns} |")
        imgs = "".join(f'<img src="{html.escape(s)}" alt="{vid} plan">' for s in svgs)
        cards.append(f"<figure>{imgs}<figcaption><b>{vid}</b> · {label}<br>{html.escape(p)}<br>"
                     f"<small>{html.escape(f)}<br>warnings: {html.escape(warns)}</small></figcaption></figure>")
        print(f"  {vid} ({label}): {p}")

    (out / "summary.md").write_text(
        f"# Variants: {gen_path.name}\n\n{len(tried)} tried · {len(passing)} passed ({args.mode} mode) · {len(failing)} dropped · "
        f"{len(kept)} kept (CR-SEARCH-1)\n\n| ID | Pick | Params | Features | Warnings |\n|---|---|---|---|---|\n"
        + "\n".join(rows) + "\n\n## Dropped (first error each)\n\n"
        + "\n".join(f"- {params}: {errors[0]}" for params, errors in failing[:40]) + "\n", encoding="utf-8")
    (out / "index.html").write_text(
        "<!doctype html><meta charset='utf-8'><title>Variant contact sheet</title>"
        "<style>body{font-family:system-ui,sans-serif;margin:16px;background:#fff;color:#1f2328}"
        "main{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:16px}"
        "figure{margin:0;border:1px solid #d0d7de;border-radius:8px;padding:8px}img{width:100%;height:auto}"
        "figcaption{font-size:13px;line-height:1.4}</style>"
        f"<h1>{html.escape(gen_path.name)}: {len(kept)} most-different variants that pass</h1>"
        f"<p>{len(tried)} tried · {len(passing)} passed ({args.mode} mode) · {len(failing)} dropped. "
        "V01 is nearest the family's median; the rest are picked to be as different as possible in plan "
        "shape and features. Sketch level: not to scale for construction.</p>"
        f"<main>{''.join(cards)}</main>", encoding="utf-8")
    print(f"contact sheet: {out / 'index.html'}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
