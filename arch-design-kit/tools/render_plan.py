#!/usr/bin/env python3
"""render_plan.py: draw each level of a design spec as a schematic SVG floor plan.

    python3 render_plan.py path/to/design.yaml [out_dir]

Writes <out_dir>/<level-id>-plan.svg (default out_dir: next to the spec, in ./out).
The plan is schematic (playbook LOD 100-200): rooms as net rectangles with a nominal
wall line, labels with size and area, windows on their walls, egress windows marked
"E", a north arrow, a scale bar and overall dimensions. It exists so Claude and you
can SEE the spec: render it, look at it, fix the spec, render again (playbook W-5).
Plot scale: 1/4" = 1'-0" when printed at 100% (viewBox in inches x 1/48).
"""
from __future__ import annotations

import sys
from pathlib import Path
from xml.sax.saxutils import escape

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_design import load, fmt, window_spans, door_spans, egress_door_spans, MM_PER_IN, UNCONDITIONED  # noqa: E402

PX_PER_IN = 1.0       # drawing units: 1 unit = 1 inch of building
WALL = 5.5            # nominal wall thickness drawn around rooms (2x6 + finishes, schematic)
MARGIN = 96           # 8 ft of paper around the plan for dimensions and title

COLORS = {"line": "#1f2328", "fill": "#ffffff", "unconditioned": "#eef0f2",
          "circulation": "#f6f8fa", "window": "#0969da", "egress": "#cf222e", "dim": "#57606a"}
CIRC = {"hall", "foyer", "stair", "mudroom", "landing", "gallery"}


def render_level(spec: dict, lv: dict, k: float) -> str:
    rooms = [r for r in lv.get("rooms") or [] if isinstance(r.get("rect"), list)]
    if not rooms:
        return ""
    rects = [[v * k for v in r["rect"]] for r in rooms]
    min_x = min(r[0] for r in rects) - WALL
    min_y = min(r[1] for r in rects) - WALL
    max_x = max(r[0] + r[2] for r in rects) + WALL
    max_y = max(r[1] + r[3] for r in rects) + WALL
    width = max_x - min_x + 2 * MARGIN
    height = max_y - min_y + 2 * MARGIN + 48

    # SVG y grows downward; plan +y is north, so flip: Y(y) = max_y + MARGIN - y
    def X(x): return x - min_x + MARGIN
    def Y(y): return max_y - y + MARGIN

    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.1f} {height:.1f}" '
           f'width="{width / 48:.2f}in" height="{height / 48:.2f}in" font-family="Helvetica, Arial, sans-serif">',
           f'<rect width="100%" height="100%" fill="{COLORS["fill"]}"/>']

    # walls: a thick outline per room, drawn first so room fills sit on top
    for r in rects:
        out.append(f'<rect x="{X(r[0]) - WALL:.1f}" y="{Y(r[1] + r[3]) - WALL:.1f}" width="{r[2] + 2 * WALL:.1f}" '
                   f'height="{r[3] + 2 * WALL:.1f}" fill="{COLORS["line"]}"/>')
    for room, r in zip(rooms, rects):
        t = room.get("type")
        fill = COLORS["unconditioned"] if t in UNCONDITIONED else COLORS["circulation"] if t in CIRC else COLORS["fill"]
        out.append(f'<rect x="{X(r[0]):.1f}" y="{Y(r[1] + r[3]):.1f}" width="{r[2]:.1f}" height="{r[3]:.1f}" fill="{fill}"/>')

    # interior walls: stroke every room edge (schematic 3.5 in partitions)
    for r in rects:
        out.append(f'<rect x="{X(r[0]):.1f}" y="{Y(r[1] + r[3]):.1f}" width="{r[2]:.1f}" height="{r[3]:.1f}" '
                   f'fill="none" stroke="{COLORS["line"]}" stroke-width="3.5"/>')

    # windows: placed by check_design.window_spans, so the checker and the drawing agree
    for room in rooms:
        for win, wall, a, b, line in window_spans(room, k):
            color = COLORS["egress"] if win.get("egress") else COLORS["window"]
            if wall in ("N", "S"):
                yy = Y(line) - WALL / 2 if wall == "N" else Y(line) + WALL / 2
                out.append(f'<line x1="{X(a):.1f}" y1="{yy:.1f}" x2="{X(b):.1f}" y2="{yy:.1f}" stroke="{color}" stroke-width="4"/>')
                if win.get("egress"):
                    ty = yy - 6 if wall == "N" else yy + 12
                    out.append(f'<text x="{(X(a) + X(b)) / 2:.1f}" y="{ty:.1f}" font-size="8" fill="{color}" text-anchor="middle">E</text>')
            else:
                xx = X(line) + WALL / 2 if wall == "E" else X(line) - WALL / 2
                out.append(f'<line x1="{xx:.1f}" y1="{Y(b):.1f}" x2="{xx:.1f}" y2="{Y(a):.1f}" stroke="{color}" stroke-width="4"/>')
                if win.get("egress"):
                    tx = xx + 9 if wall == "E" else xx - 9
                    out.append(f'<text x="{tx:.1f}" y="{(Y(a) + Y(b)) / 2:.1f}" font-size="8" fill="{color}" text-anchor="middle">E</text>')

    # interior doors: a gap in the wall plus a quarter-circle swing into the room that lists the door
    for room, door, axis, line, a, b, sign in door_spans(lv, k):
        w = b - a
        if axis == "v":
            out.append(f'<rect x="{X(line) - 2.5:.1f}" y="{Y(b):.1f}" width="5" height="{w:.1f}" fill="{COLORS["fill"]}"/>')
            hx, hy, tx = X(line), Y(a), X(line) + sign * w           # hinge at the segment's south end
            out.append(f'<line x1="{hx:.1f}" y1="{hy:.1f}" x2="{tx:.1f}" y2="{hy:.1f}" stroke="{COLORS["dim"]}" stroke-width="1"/>')
            sweep = 0 if sign > 0 else 1
            out.append(f'<path d="M {tx:.1f} {hy:.1f} A {w:.1f} {w:.1f} 0 0 {sweep} {hx:.1f} {Y(b):.1f}" fill="none" '
                       f'stroke="{COLORS["dim"]}" stroke-width="0.75" stroke-dasharray="3 2"/>')
        else:
            out.append(f'<rect x="{X(a):.1f}" y="{Y(line) - 2.5:.1f}" width="{w:.1f}" height="5" fill="{COLORS["fill"]}"/>')
            hx, hy, ty = X(a), Y(line), Y(line) - sign * w           # hinge at the segment's west end
            out.append(f'<line x1="{hx:.1f}" y1="{hy:.1f}" x2="{hx:.1f}" y2="{ty:.1f}" stroke="{COLORS["dim"]}" stroke-width="1"/>')
            sweep = 1 if sign > 0 else 0
            out.append(f'<path d="M {hx:.1f} {ty:.1f} A {w:.1f} {w:.1f} 0 0 {sweep} {X(b):.1f} {hy:.1f}" fill="none" '
                       f'stroke="{COLORS["dim"]}" stroke-width="0.75" stroke-dasharray="3 2"/>')

    # exterior egress doors: a gap in the exterior wall, swinging in, labelled
    for room, door, wall, a, b, line in egress_door_spans(lv, k):
        w = b - a
        if wall in ("N", "S"):
            yy = Y(line) - WALL / 2 if wall == "N" else Y(line) + WALL / 2
            out.append(f'<rect x="{X(a):.1f}" y="{yy - WALL / 2 - 1:.1f}" width="{w:.1f}" height="{WALL + 2:.1f}" fill="{COLORS["fill"]}"/>')
            hy = Y(line)
            ty = hy + w if wall == "N" else hy - w
            out.append(f'<line x1="{X(a):.1f}" y1="{hy:.1f}" x2="{X(a):.1f}" y2="{ty:.1f}" stroke="{COLORS["line"]}" stroke-width="1.5"/>')
            sweep = 0 if wall == "N" else 1
            out.append(f'<path d="M {X(a):.1f} {ty:.1f} A {w:.1f} {w:.1f} 0 0 {sweep} {X(b):.1f} {hy:.1f}" fill="none" stroke="{COLORS["line"]}" stroke-width="0.75"/>')
            ly = yy - 8 if wall == "N" else yy + 14
            out.append(f'<text x="{(X(a) + X(b)) / 2:.1f}" y="{ly:.1f}" font-size="8" text-anchor="middle">{escape(str(door.get("id", "ENTRY")))}</text>')
        else:
            xx = X(line) + WALL / 2 if wall == "E" else X(line) - WALL / 2
            out.append(f'<rect x="{xx - WALL / 2 - 1:.1f}" y="{Y(b):.1f}" width="{WALL + 2:.1f}" height="{w:.1f}" fill="{COLORS["fill"]}"/>')

    # open connections: dashed line where the wall is omitted
    by_id = {r.get("id"): r for r in rooms}
    from check_design import shared_edge
    for room in rooms:
        for other_id in room.get("open_to") or []:
            other = by_id.get(other_id)
            if other is None:
                continue
            seg = shared_edge(tuple(v * k for v in room["rect"]), tuple(v * k for v in other["rect"]))
            if seg is None:
                continue
            axis, line, lo, hi = seg
            if axis == "v":
                out.append(f'<rect x="{X(line) - 2.5:.1f}" y="{Y(hi):.1f}" width="5" height="{hi - lo:.1f}" fill="{COLORS["fill"]}"/>')
                out.append(f'<line x1="{X(line):.1f}" y1="{Y(hi):.1f}" x2="{X(line):.1f}" y2="{Y(lo):.1f}" stroke="{COLORS["dim"]}" stroke-width="0.75" stroke-dasharray="6 4"/>')
            else:
                out.append(f'<rect x="{X(lo):.1f}" y="{Y(line) - 2.5:.1f}" width="{hi - lo:.1f}" height="5" fill="{COLORS["fill"]}"/>')
                out.append(f'<line x1="{X(lo):.1f}" y1="{Y(line):.1f}" x2="{X(hi):.1f}" y2="{Y(line):.1f}" stroke="{COLORS["dim"]}" stroke-width="0.75" stroke-dasharray="6 4"/>')

    # stairs: hatched rectangle with an arrow toward "UP"
    for st in lv.get("stairs") or []:
        if isinstance(st.get("rect"), list):
            sx, sy, sw, sd = (v * k for v in st["rect"])
            out.append(f'<rect x="{X(sx):.1f}" y="{Y(sy + sd):.1f}" width="{sw:.1f}" height="{sd:.1f}" fill="#fff8c5" stroke="{COLORS["line"]}"/>')
            out.append(f'<text x="{X(sx + sw / 2):.1f}" y="{Y(sy + sd / 2):.1f}" font-size="9" text-anchor="middle">STAIR UP</text>')

    # labels: name, size, area
    for room, r in zip(rooms, rects):
        cx, cy = X(r[0] + r[2] / 2), Y(r[1] + r[3] / 2)
        name = str(room.get("name", room.get("id"))).upper()
        # fit the longer of the two label lines inside the room's width
        size = min(12.0, max(4.0, min(r[2], r[3]) / 7), 0.9 * r[2] / (0.62 * max(len(name), 18 * 0.8)))
        area = r[2] * r[3] / 144
        out.append(f'<text x="{cx:.1f}" y="{cy - size * 0.4:.1f}" font-size="{size:.1f}" font-weight="bold" '
                   f'text-anchor="middle">{escape(name)}</text>')
        out.append(f'<text x="{cx:.1f}" y="{cy + size * 0.9:.1f}" font-size="{size * 0.8:.1f}" text-anchor="middle" '
                   f'fill="{COLORS["dim"]}">{escape(fmt(r[2]))} x {escape(fmt(r[3]))} · {area:.0f} sf</text>')

    # overall dimensions (outside face of the schematic walls)
    ow, od = max_x - min_x, max_y - min_y
    ytop = Y(max_y) - 30
    out.append(f'<line x1="{X(min_x):.1f}" y1="{ytop:.1f}" x2="{X(max_x):.1f}" y2="{ytop:.1f}" stroke="{COLORS["dim"]}"/>')
    for xx in (X(min_x), X(max_x)):
        out.append(f'<line x1="{xx:.1f}" y1="{ytop - 6:.1f}" x2="{xx:.1f}" y2="{ytop + 6:.1f}" stroke="{COLORS["dim"]}"/>')
    out.append(f'<text x="{(X(min_x) + X(max_x)) / 2:.1f}" y="{ytop - 5:.1f}" font-size="10" text-anchor="middle" fill="{COLORS["dim"]}">{escape(fmt(ow))}</text>')
    xl = X(min_x) - 30
    out.append(f'<line x1="{xl:.1f}" y1="{Y(max_y):.1f}" x2="{xl:.1f}" y2="{Y(min_y):.1f}" stroke="{COLORS["dim"]}"/>')
    for yy in (Y(max_y), Y(min_y)):
        out.append(f'<line x1="{xl - 6:.1f}" y1="{yy:.1f}" x2="{xl + 6:.1f}" y2="{yy:.1f}" stroke="{COLORS["dim"]}"/>')
    mid = (Y(max_y) + Y(min_y)) / 2
    out.append(f'<text x="{xl - 5:.1f}" y="{mid:.1f}" font-size="10" text-anchor="middle" fill="{COLORS["dim"]}" '
               f'transform="rotate(-90 {xl - 5:.1f} {mid:.1f})">{escape(fmt(od))}</text>')

    # north arrow and scale bar (10 ft), bottom left; title, bottom right
    by = height - 36
    nx = MARGIN / 2
    out.append(f'<polygon points="{nx:.1f},{by - 40:.1f} {nx - 8:.1f},{by - 18:.1f} {nx + 8:.1f},{by - 18:.1f}" fill="{COLORS["line"]}"/>')
    out.append(f'<text x="{nx:.1f}" y="{by - 44:.1f}" font-size="10" text-anchor="middle">N</text>')
    sx0 = MARGIN
    for i in range(5):
        fill = COLORS["line"] if i % 2 == 0 else COLORS["fill"]
        out.append(f'<rect x="{sx0 + i * 24:.1f}" y="{by - 6:.1f}" width="24" height="6" fill="{fill}" stroke="{COLORS["line"]}" stroke-width="0.5"/>')
    out.append(f'<text x="{sx0:.1f}" y="{by + 8:.1f}" font-size="7">0</text>')
    out.append(f'<text x="{sx0 + 120:.1f}" y="{by + 8:.1f}" font-size="7" text-anchor="middle">10 ft</text>')
    proj = spec.get("project") or {}
    title = f'{proj.get("name", "")} — {lv.get("name", lv.get("id"))} · phase: {proj.get("phase", "?")}'
    out.append(f'<text x="{width - MARGIN / 2:.1f}" y="{by:.1f}" font-size="11" text-anchor="end" font-weight="bold">{escape(title)}</text>')
    out.append(f'<text x="{width - MARGIN / 2:.1f}" y="{by + 13:.1f}" font-size="8" text-anchor="end" fill="{COLORS["dim"]}">'
               'Net room sizes inside schematic walls. Not for construction. Blue = window, red E = egress window, dashed = open to.</text>')
    out.append("</svg>")
    return "\n".join(out)


def main(argv: list[str]) -> int:
    if not argv:
        print("usage: render_plan.py <design.yaml> [out_dir]")
        return 2
    spec_path = Path(argv[0])
    out_dir = Path(argv[1]) if len(argv) > 1 else spec_path.parent / "out"
    spec = load(str(spec_path))
    units = (spec.get("project") or {}).get("units")
    if units not in ("in", "mm"):
        print("render_plan.py: project.units must be 'in' or 'mm'", file=sys.stderr)
        return 2
    k = 1.0 if units == "in" else 1.0 / MM_PER_IN
    out_dir.mkdir(parents=True, exist_ok=True)
    for lv in spec.get("levels") or []:
        svg = render_level(spec, lv, k)
        if svg:
            path = out_dir / f'{lv.get("id", "level")}-plan.svg'
            path.write_text(svg, encoding="utf-8")
            print(path)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
