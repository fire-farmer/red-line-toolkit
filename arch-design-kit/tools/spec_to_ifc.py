#!/usr/bin/env python3
"""spec_to_ifc.py: build a schematic open-BIM model (IFC4) from a design spec.

    pip install ifcopenshell pyyaml
    python3 spec_to_ifc.py path/to/design.yaml [out.ifc]

What it makes (playbook LOD 200, schematic):
  IfcProject > IfcSite > IfcBuilding > IfcBuildingStorey per level, and on each storey
  - an IfcSpace per room (net footprint extruded to the ceiling, with name and area),
  - IfcWalls along every room edge: shared edges become one interior wall, edges with a
    room on one side only become exterior walls pushed outward (Pset_WallCommon.IsExternal),
  - an IfcSlab under the level,
  - IfcWindows in IfcOpeningElements cut into the right wall, with egress windows named.
Open the result in any IFC viewer (Bonsai for Blender, FreeCAD BIM, BIMvision, an online
IFC viewer) or hand it to Revit/Archicad. The spec stays the source of truth: change the
spec, regenerate the IFC (playbook W-2). Lengths go into the IFC in metres.
"""
from __future__ import annotations

import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_design import load, window_spans, door_spans, egress_door_spans, MM_PER_IN  # noqa: E402

try:
    import numpy as np
    import ifcopenshell
    import ifcopenshell.api
    import ifcopenshell.util.placement
except ImportError:  # pragma: no cover
    sys.exit("spec_to_ifc.py needs ifcopenshell (pip install ifcopenshell)")

M_PER_IN = 0.0254
EXT_WALL_IN = 6.5      # 2x6 stud + sheathing + gypsum, schematic
INT_WALL_IN = 4.5      # 2x4 stud + gypsum both sides
SLAB_IN = 12.0         # floor assembly depth, schematic


def run(api_path: str, f, **kw):
    return ifcopenshell.api.run(api_path, f, **kw)


def placement(x_m: float, y_m: float, z_m: float, angle_rad: float = 0.0):
    m = np.eye(4)
    c, s = np.cos(angle_rad), np.sin(angle_rad)
    m[0][0], m[0][1], m[1][0], m[1][1] = c, -s, s, c
    m[0][3], m[1][3], m[2][3] = x_m, y_m, z_m
    return m


def wall_segments(rooms: list[tuple[str, tuple]]) -> list[dict]:
    """Split every room edge at every breakpoint on its line, count rooms per piece, merge runs.

    Returns segments {axis, c, a, b, exterior, outward} in inches, where the wall lies on
    the line x=c (axis 'v') or y=c (axis 'h') from a to b, and outward is +1/-1 for the
    side away from the room (exterior walls only).
    """
    lines: dict[tuple, list] = defaultdict(list)
    for rid, (x, y, w, d) in rooms:
        lines[("h", y)].append((x, x + w, +1))       # south edge: room is on the +y side
        lines[("h", y + d)].append((x, x + w, -1))   # north edge: room is on the -y side
        lines[("v", x)].append((y, y + d, +1))       # west edge: room is on the +x side
        lines[("v", x + w)].append((y, y + d, -1))   # east edge: room is on the -x side
    segs = []
    for (axis, c), edges in lines.items():
        cuts = sorted({p for a, b, _ in edges for p in (a, b)})
        pieces = []
        for a, b in zip(cuts, cuts[1:]):
            mid = (a + b) / 2
            sides = {side for ea, eb, side in edges if ea <= mid <= eb}
            if not sides:
                continue
            exterior = len(sides) == 1
            outward = -next(iter(sides)) if exterior else 0
            pieces.append([a, b, exterior, outward])
        merged: list[list] = []
        for p in pieces:
            if merged and abs(merged[-1][1] - p[0]) < 1e-6 and merged[-1][2:] == p[2:]:
                merged[-1][1] = p[1]
            else:
                merged.append(p)
        for a, b, exterior, outward in merged:
            segs.append({"axis": axis, "c": c, "a": a, "b": b, "exterior": exterior, "outward": outward})
    return segs


def build(spec: dict) -> "ifcopenshell.file":
    units = (spec.get("project") or {}).get("units")
    if units not in ("in", "mm"):
        sys.exit("spec_to_ifc.py: project.units must be 'in' or 'mm'")
    k = 1.0 if units == "in" else 1.0 / MM_PER_IN  # spec units -> inches
    m = lambda inches: inches * M_PER_IN           # inches -> metres  # noqa: E731

    f = run("project.create_file", None, version="IFC4")
    proj_name = (spec.get("project") or {}).get("name", "Project")
    project = run("root.create_entity", f, ifc_class="IfcProject", name=proj_name)
    run("unit.assign_unit", f)  # SI metres, square metres, cubic metres
    model = run("context.add_context", f, context_type="Model")
    body = run("context.add_context", f, context_type="Model", context_identifier="Body",
               target_view="MODEL_VIEW", parent=model)
    site = run("root.create_entity", f, ifc_class="IfcSite", name="Site")
    building = run("root.create_entity", f, ifc_class="IfcBuilding", name=proj_name)
    run("aggregate.assign_object", f, products=[site], relating_object=project)
    run("aggregate.assign_object", f, products=[building], relating_object=site)

    for lv in spec.get("levels") or []:
        z = (lv.get("elevation_in") or 0) * k
        ceiling = (lv.get("ceiling_in") or 96) * k
        storey = run("root.create_entity", f, ifc_class="IfcBuildingStorey", name=lv.get("name", lv.get("id")))
        storey.Elevation = m(z)
        run("aggregate.assign_object", f, products=[storey], relating_object=building)
        run("geometry.edit_object_placement", f, product=storey, matrix=placement(0, 0, m(z)))

        rooms = [(r.get("id"), tuple(v * k for v in r["rect"]), r) for r in lv.get("rooms") or []
                 if isinstance(r.get("rect"), list)]
        if not rooms:
            continue

        # spaces
        for rid, (x, y, w, d), room in rooms:
            h = (room.get("ceiling_in") or 0) * k or ceiling
            space = run("root.create_entity", f, ifc_class="IfcSpace", name=rid)
            space.LongName = room.get("name", rid)
            run("aggregate.assign_object", f, products=[space], relating_object=storey)
            rep = run("geometry.add_slab_representation", f, context=body, depth=m(h),
                      polyline=[(0, 0), (m(w), 0), (m(w), m(d)), (0, m(d)), (0, 0)])
            run("geometry.assign_representation", f, product=space, representation=rep)
            run("geometry.edit_object_placement", f, product=space, matrix=placement(m(x), m(y), m(z)))
            pset = run("pset.add_pset", f, product=space, name="Pset_SpaceCommon")
            run("pset.edit_pset", f, pset=pset, properties={"Reference": room.get("type", ""),
                                                            "IsExternal": room.get("type") in ("porch", "deck", "patio")})
            qto = run("pset.add_qto", f, product=space, name="Qto_SpaceBaseQuantities")
            run("pset.edit_qto", f, qto=qto, properties={"NetFloorArea": m(w) * m(d), "Height": m(h)})

        # slab under the level: bounding box of the rooms plus exterior walls
        xs = [r[1][0] for r in rooms] + [r[1][0] + r[1][2] for r in rooms]
        ys = [r[1][1] for r in rooms] + [r[1][1] + r[1][3] for r in rooms]
        x0, y0 = min(xs) - EXT_WALL_IN, min(ys) - EXT_WALL_IN
        x1, y1 = max(xs) + EXT_WALL_IN, max(ys) + EXT_WALL_IN
        slab = run("root.create_entity", f, ifc_class="IfcSlab", name=f"{lv.get('id')} floor", predefined_type="FLOOR")
        run("spatial.assign_container", f, products=[slab], relating_structure=storey)
        rep = run("geometry.add_slab_representation", f, context=body, depth=m(SLAB_IN),
                  polyline=[(0, 0), (m(x1 - x0), 0), (m(x1 - x0), m(y1 - y0)), (0, m(y1 - y0)), (0, 0)])
        run("geometry.assign_representation", f, product=slab, representation=rep)
        run("geometry.edit_object_placement", f, product=slab, matrix=placement(m(x0), m(y0), m(z - SLAB_IN)))

        # walls
        walls = []
        for seg in wall_segments([(rid, r) for rid, r, _ in rooms]):
            t = EXT_WALL_IN if seg["exterior"] else INT_WALL_IN
            # exterior walls sit outside the room line; interior walls straddle it
            off = seg["outward"] * t / 2 if seg["exterior"] else 0.0
            ext = t if seg["exterior"] else 0.0  # extend exterior runs to close the corners
            a, b = seg["a"] - ext, seg["b"] + ext
            wall = run("root.create_entity", f, ifc_class="IfcWall",
                       name=("EXT" if seg["exterior"] else "INT") + f"-{seg['axis']}{seg['c']:.0f}")
            run("spatial.assign_container", f, products=[wall], relating_structure=storey)
            rep = run("geometry.add_wall_representation", f, context=body, length=m(b - a), height=m(ceiling),
                      thickness=m(t))
            run("geometry.assign_representation", f, product=wall, representation=rep)
            if seg["axis"] == "h":   # runs along +x; wall body occupies local y in [0, t]
                mat = placement(m(a), m(seg["c"] + off - t / 2), m(z))
            else:                    # runs along +y: rotate 90 degrees; local y maps to -x
                mat = placement(m(seg["c"] + off + t / 2), m(a), m(z), np.pi / 2)
            run("geometry.edit_object_placement", f, product=wall, matrix=mat)
            pset = run("pset.add_pset", f, product=wall, name="Pset_WallCommon")
            run("pset.edit_pset", f, pset=pset, properties={"IsExternal": seg["exterior"],
                                                            "Status": "NEW", "Reference": f"{t:.1f} in schematic"})
            walls.append((seg, wall, t, off))

        # windows in openings, placed by check_design.window_spans (same as the plan drawing)
        for rid, (x, y, w, d), room in rooms:
            for i, (win, side, a_in, b_in, line_in) in enumerate(window_spans(room, k)):
                ww, wh = b_in - a_in, float(win.get("height_in", 48)) * k
                sill = float(win.get("sill_in", 30)) * k
                axis = "h" if side in ("N", "S") else "v"
                host = next((wl for wl in walls if wl[0]["axis"] == axis and abs(wl[0]["c"] - line_in) < 1e-6
                             and wl[0]["a"] - 1e-6 <= a_in and b_in <= wl[0]["b"] + 1e-6), None)
                if host is None:  # check_design reports this as G-WIN-1
                    print(f"spec_to_ifc.py: skipped window {rid}/{side}{i}: no single wall hosts it", file=sys.stderr)
                    continue
                seg, wall, t, off = host
                if axis == "h":
                    mat = placement(m(a_in), m(line_in + off - t / 2), m(z + sill))
                else:
                    mat = placement(m(line_in + off + t / 2), m(a_in), m(z + sill), np.pi / 2)
                opening = run("root.create_entity", f, ifc_class="IfcOpeningElement", name=f"{rid}-{side}{i}-opening")
                rep = run("geometry.add_wall_representation", f, context=body, length=m(ww), height=m(wh),
                          thickness=m(t))
                run("geometry.assign_representation", f, product=opening, representation=rep)
                run("geometry.edit_object_placement", f, product=opening, matrix=mat)
                run("feature.add_feature", f, feature=opening, element=wall)
                name = f"{rid}-{side}{i}" + (" EGRESS" if win.get("egress") else "")
                window = run("root.create_entity", f, ifc_class="IfcWindow", name=name)
                window.OverallWidth, window.OverallHeight = m(ww), m(wh)
                run("spatial.assign_container", f, products=[window], relating_structure=storey)
                # this API call takes millimetres (it applies the project unit scale itself),
                # unlike the wall and slab calls, which take project units (metres)
                rep = run("geometry.add_window_representation", f, context=body, overall_height=wh * MM_PER_IN,
                          overall_width=ww * MM_PER_IN)
                run("geometry.assign_representation", f, product=window, representation=rep)
                run("geometry.edit_object_placement", f, product=window, matrix=mat)
                run("feature.add_filling", f, opening=opening, element=window)
        # interior doors (and the garage door into the house), hosted by the wall the two rooms share;
        # exterior egress doors that name a wall join the same loop
        door_list = list(door_spans(lv, k))
        for room, door, wall_side, a_in, b_in, line_in in egress_door_spans(lv, k):
            door_list.append((room, {"to": "EXTERIOR", "height_in": 80 / k, **door}, "h" if wall_side in ("N", "S") else "v",
                              line_in, a_in, b_in, 0))
        for room, door, axis, line, a_in, b_in, sign in door_list:
            host = next((wl for wl in walls if wl[0]["axis"] == axis and abs(wl[0]["c"] - line) < 1e-6
                         and wl[0]["a"] - 1e-6 <= a_in and b_in <= wl[0]["b"] + 1e-6), None)
            if host is None:
                print(f"spec_to_ifc.py: skipped door {room.get('id')}->{door.get('to')}: no single wall hosts it",
                      file=sys.stderr)
                continue
            seg, wall, t, off = host
            dw, dh = b_in - a_in, float(door.get("height_in", 80)) * k
            if axis == "h":
                mat = placement(m(a_in), m(line + off - t / 2), m(z))
            else:
                mat = placement(m(line + off + t / 2), m(a_in), m(z), np.pi / 2)
            opening = run("root.create_entity", f, ifc_class="IfcOpeningElement",
                          name=f"{room.get('id')}-{door.get('to')}-opening")
            rep = run("geometry.add_wall_representation", f, context=body, length=m(dw), height=m(dh), thickness=m(t))
            run("geometry.assign_representation", f, product=opening, representation=rep)
            run("geometry.edit_object_placement", f, product=opening, matrix=mat)
            run("feature.add_feature", f, feature=opening, element=wall)
            ifc_door = run("root.create_entity", f, ifc_class="IfcDoor", name=f"{room.get('id')}-{door.get('to')}")
            ifc_door.OverallWidth, ifc_door.OverallHeight = m(dw), m(dh)
            run("spatial.assign_container", f, products=[ifc_door], relating_structure=storey)
            # millimetres, like the window call
            rep = run("geometry.add_door_representation", f, context=body, overall_height=dh * MM_PER_IN,
                      overall_width=dw * MM_PER_IN)
            if rep is not None:
                run("geometry.assign_representation", f, product=ifc_door, representation=rep)
            run("geometry.edit_object_placement", f, product=ifc_door, matrix=mat)
            run("feature.add_filling", f, opening=opening, element=ifc_door)
    return f


def main(argv: list[str]) -> int:
    if not argv:
        print("usage: spec_to_ifc.py <design.yaml> [out.ifc]")
        return 2
    spec_path = Path(argv[0])
    out = Path(argv[1]) if len(argv) > 1 else spec_path.parent / "out" / "model.ifc"
    out.parent.mkdir(parents=True, exist_ok=True)
    f = build(load(str(spec_path)))
    f.write(str(out))
    counts = {c: len(f.by_type(c)) for c in ("IfcBuildingStorey", "IfcSpace", "IfcWall", "IfcDoor", "IfcWindow", "IfcSlab")}
    print(out, " ".join(f"{c[3:]}={n}" for c, n in counts.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
