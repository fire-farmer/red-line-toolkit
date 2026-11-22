#!/usr/bin/env python3
"""check_design.py: hold a design spec (design.yaml) to the playbook's checkable rules.

    python3 check_design.py path/to/design.yaml           # human-readable report
    python3 check_design.py path/to/design.yaml --json    # machine-readable findings

Exit codes: 0 = no ERROR findings, 1 = at least one ERROR, 2 = the spec could not be read.

Every finding carries a rule ID from playbook/RULES.md, so a review can say "fails
C-EGR-2" and anyone can look the rule up. The numbers live in LIMITS below, in one
place, each with its source. They are the US IRC 2021/2024 baseline. Local amendments
win: override a limit per project with `limits:` in the spec, and give the reason.

The checker passing does NOT mean a design complies with code. It catches the
dimensional mistakes that most often slip into AI-drawn plans. A licensed professional
and the Authority Having Jurisdiction (AHJ) have the final say.
"""
from __future__ import annotations

import json
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

# ---------------------------------------------------------------------------------------
# The numbers. Units: inches, square feet (sqft) or square inches (sqin) as named.
# ---------------------------------------------------------------------------------------
LIMITS = {
    # C-ROOM: IRC R304.1 / R304.2
    "habitable_min_area_sqft": 70,
    "habitable_min_dim_in": 84,          # 7 ft in any horizontal dimension; kitchens exempt
    # C-CEIL: IRC R305.1
    "ceiling_min_in": 84,                # habitable space and hallways
    "ceiling_min_service_in": 80,        # bathrooms, toilet rooms, laundry rooms (6 ft 8 in)
    # C-EGR: IRC R310.2
    "egress_min_area_sqft": 5.7,
    "egress_min_area_grade_sqft": 5.0,   # grade-floor or below-grade openings
    "egress_min_h_in": 24,
    "egress_min_w_in": 20,
    "egress_max_sill_in": 44,
    # C-DOOR: IRC R311.2
    "egress_door_min_w_in": 32,
    "egress_door_min_h_in": 78,
    # C-HALL: IRC R311.6
    "hall_min_w_in": 36,
    # C-STAIR: IRC R311.7
    "stair_min_w_in": 36,
    "riser_max_in": 7.75,
    "tread_min_in": 10,
    "headroom_min_in": 80,
    "handrail_min_in": 34,
    "handrail_max_in": 38,
    "handrail_required_risers": 4,
    # C-GUARD: IRC R312.1
    "guard_min_in": 36,
    "guard_trigger_drop_in": 30,
    # C-GUARD-2: IRC R312.2 window fall protection
    "window_fall_sill_in": 24,           # operable sill lower than this...
    "window_fall_height_in": 72,         # ...and more than this above grade needs protection
    # C-BATH: IRC R307.1 (Figure R307.1) and P2708.1
    "wc_side_min_in": 15,
    "wc_front_min_in": 21,
    "shower_min_area_sqin": 900,
    "shower_min_dim_in": 30,
    # C-LIGHT: IRC R303.1 (exceptions allow artificial light + mechanical ventilation)
    "glazing_min_pct": 8,
    # SP-KIT: NKBA Kitchen Planning Guidelines (guideline, not code)
    "kitchen_aisle_one_cook_in": 42,
    "kitchen_aisle_multi_cook_in": 48,
    # SP-CIRC: playbook rule of thumb
    "circulation_warn_pct": 20,
    # SP-UD: universal design (playbook, when project.universal_design is true)
    "ud_door_min_clear_in": 34,
    "ud_bath_turn_in": 60,
    # S-SPAN: playbook rule of thumb for dimensional-lumber floor framing
    "floor_span_warn_in": 192,           # 16 ft clear: plan a beam line or engineered joists
    "truss_span_warn_in": 480,           # 40 ft: past common residential truss practice
}

HABITABLE = {"bedroom", "living", "dining", "kitchen", "family", "office", "den",
             "great_room", "bonus", "flex", "media", "playroom"}
SLEEPING = {"bedroom"}
CEILING_REQUIRED = HABITABLE | {"hall", "bath", "powder", "laundry", "foyer", "mudroom"}
SERVICE_CEILING = {"bath", "powder", "laundry"}
CIRCULATION = {"hall", "foyer", "stair", "mudroom", "landing", "gallery"}
UNCONDITIONED = {"garage", "porch", "deck", "patio", "carport"}
WALLS = {"N", "S", "E", "W"}
MM_PER_IN = 25.4


@dataclass
class Finding:
    severity: str   # ERROR = below a code minimum; WARN = verify / best practice; INFO
    rule: str
    where: str
    message: str


class Checker:
    def __init__(self, spec: dict):
        self.spec = spec
        self.findings: list[Finding] = []
        self.limits = dict(LIMITS)
        overrides = spec.get("limits") or {}
        for key, val in overrides.items():
            if key not in LIMITS:
                self.add("WARN", "G-SPEC-1", "limits", f"unknown limit '{key}' ignored")
                continue
            self.limits[key] = val["value"] if isinstance(val, dict) else val
        units = (spec.get("project") or {}).get("units")
        if units not in ("in", "mm"):
            self.add("ERROR", "G-UNITS-1", "project.units",
                     f"units must be declared as 'in' or 'mm' (got {units!r}); refusing to guess")
            self.k = 1.0
        else:
            self.k = 1.0 if units == "in" else 1.0 / MM_PER_IN

    # -- helpers -------------------------------------------------------------------------
    def add(self, severity: str, rule: str, where: str, message: str) -> None:
        self.findings.append(Finding(severity, rule, where, message))

    def L(self, key: str) -> float:
        return self.limits[key]

    def n(self, value) -> float | None:
        """A length from the spec, converted to inches."""
        return None if value is None else float(value) * self.k

    def rect(self, room: dict):
        r = room.get("rect")
        if not (isinstance(r, list) and len(r) == 4):
            return None
        x, y, w, d = (self.n(v) for v in r)
        return x, y, w, d

    # -- the run -------------------------------------------------------------------------
    def run(self) -> list[Finding]:
        levels = self.spec.get("levels") or []
        if not levels:
            self.add("ERROR", "G-SPEC-1", "levels", "spec has no levels")
            return self.findings
        by_id = {lv.get("id"): lv for lv in levels}
        ordered = sorted(levels, key=lambda lv: self.n(lv.get("elevation_in", 0)) or 0)
        has_garage = any(r.get("type") == "garage" for lv in levels for r in (lv.get("rooms") or []))
        fuel = bool((self.spec.get("project") or {}).get("fuel_fired_appliances"))
        ud = bool((self.spec.get("project") or {}).get("universal_design"))

        egress_doors = 0
        for i, lv in enumerate(ordered):
            above = ordered[i + 1] if i + 1 < len(ordered) else None
            below = ordered[i - 1] if i > 0 else None
            self.check_level(lv, above, below, ud)
            egress_doors += self.check_egress_doors(lv, ud)
            self.check_alarms(lv, co_required=has_garage or fuel)
            for st in (lv.get("stairs") or []) or []:
                self.check_stair(st, lv, by_id)
            for g in (lv.get("guards") or []) or []:
                self.check_guard(g, lv)
        if egress_doors == 0:
            self.add("ERROR", "C-DOOR-1", "levels[*].egress_doors",
                     "no egress door listed; at least one side-hinged egress door is required (R311.2)")
        if has_garage:
            self.check_garage(levels)
        self.check_site(levels)
        self.check_roof()
        self.check_circulation(levels)
        self.check_connectivity(levels, by_id)
        self.check_concept()
        return self.findings

    def check_level(self, lv: dict, above, below, ud: bool) -> None:
        lid = lv.get("id", "?")
        rooms = lv.get("rooms") or []
        level_ceiling = self.n(lv.get("ceiling_in"))
        rects = []
        for room in rooms:
            rid = f"{lid}/{room.get('id', '?')}"
            rtype = room.get("type")
            r = self.rect(room)
            if r is None:
                self.add("ERROR", "G-SPEC-1", rid, "room has no valid rect [x, y, w, d]")
                continue
            x, y, w, d = r
            if w <= 0 or d <= 0:
                self.add("ERROR", "G-SPEC-1", rid, "room rect has a zero or negative size")
                continue
            rects.append((rid, r, rtype))
            area = w * d / 144.0

            if rtype in HABITABLE:
                if area < self.L("habitable_min_area_sqft"):
                    self.add("ERROR", "C-ROOM-1", rid,
                             f"habitable room is {area:.0f} sq ft; minimum {self.L('habitable_min_area_sqft')} sq ft (R304.1)")
                if rtype != "kitchen" and min(w, d) < self.L("habitable_min_dim_in"):
                    self.add("ERROR", "C-ROOM-2", rid,
                             f"least dimension {fmt(min(w, d))}; minimum {fmt(self.L('habitable_min_dim_in'))} (R304.2)")
            ceiling = self.n(room.get("ceiling_in")) or level_ceiling
            if rtype in CEILING_REQUIRED:
                need = self.L("ceiling_min_service_in") if rtype in SERVICE_CEILING else self.L("ceiling_min_in")
                if ceiling is None:
                    self.add("WARN", "C-CEIL-1", rid, "no ceiling height given for the room or its level")
                elif ceiling < need and not room.get("sloped_ceiling"):
                    self.add("ERROR", "C-CEIL-1", rid,
                             f"ceiling {fmt(ceiling)}; minimum {fmt(need)} (R305.1)")
                elif room.get("sloped_ceiling"):
                    self.add("INFO", "C-CEIL-1", rid,
                             "sloped ceiling: check the R305.1 exception by hand (area under 5 ft does not count)")
            if rtype == "hall" and min(w, d) < self.L("hall_min_w_in"):
                self.add("ERROR", "C-HALL-1", rid,
                         f"hallway {fmt(min(w, d))} wide; minimum {fmt(self.L('hall_min_w_in'))} (R311.6)")

            self.check_windows(room, rid, rtype, area, lv)
            if rtype in ("bath", "powder"):
                self.check_bath(room, rid, w, d, ud)
            if rtype == "kitchen":
                self.check_kitchen(room, rid)
            if above is not None and rtype in HABITABLE | {"garage"} and not room.get("beam"):
                if min(w, d) > self.L("floor_span_warn_in"):
                    self.add("WARN", "S-SPAN-1", rid,
                             f"clear span {fmt(min(w, d))} under a floor: plan a beam/bearing line or engineered "
                             "joists, size from span tables or by an engineer, and note `beam:` on the room")

        # G-WIN-1: a window has to fit its wall and open to the outside, not into a neighbour
        for room in rooms:
            r0 = self.rect(room)
            if r0 is None:
                continue
            rid = f"{lid}/{room.get('id', '?')}"
            for k_, (win, wall, a, b, line) in enumerate(window_spans(room, self.k)):
                lo = r0[0] if wall in ("N", "S") else r0[1]
                hi = lo + (r0[2] if wall in ("N", "S") else r0[3])
                if a < lo - 0.5 or b > hi + 0.5:
                    self.add("ERROR", "G-WIN-1", f"{rid}/{wall} window",
                             f"window runs past the end of its wall ({fmt(a - lo)} to {fmt(b - lo)} on a {fmt(hi - lo)} wall)")
                    continue
                for other in rooms:
                    if other is room or self.rect(other) is None:
                        continue
                    ox, oy, ow, od = self.rect(other)
                    if wall in ("N", "S"):
                        edge = oy if wall == "N" else oy + od
                        o_lo, o_hi = ox, ox + ow
                    else:
                        edge = ox if wall == "E" else ox + ow
                        o_lo, o_hi = oy, oy + od
                    if abs(edge - line) < 1.0 and min(b, o_hi) - max(a, o_lo) > 0.5:
                        self.add("ERROR", "G-WIN-1", f"{rid}/{wall} window",
                                 f"window opens onto {other.get('id')} instead of the outside: move it "
                                 "(offset_in) or onto another wall")

        # G-OVERLAP-1: rooms on one level must not overlap
        for i in range(len(rects)):
            for j in range(i + 1, len(rects)):
                a, b = rects[i][1], rects[j][1]
                ox = min(a[0] + a[2], b[0] + b[2]) - max(a[0], b[0])
                oy = min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1])
                if ox > 0.5 and oy > 0.5:
                    self.add("ERROR", "G-OVERLAP-1", f"{rects[i][0]} x {rects[j][0]}",
                             f"rooms overlap by {fmt(ox)} x {fmt(oy)}")

        # S-STACK-1: rooms upstairs should sit over rooms downstairs (or be flagged as cantilevers)
        if below is not None:
            support = [self.rect(r) for r in (below.get("rooms") or []) if self.rect(r)]
            for rid, r, rtype in rects:
                if rtype in UNCONDITIONED:
                    continue
                unsupported = uncovered_fraction(r, support)
                if unsupported > 0.02:
                    self.add("WARN", "S-STACK-1", rid,
                             f"{unsupported:.0%} of this room has no room below: a cantilever or overhang. "
                             "Keep it within prescriptive limits or get it engineered")

    def check_windows(self, room: dict, rid: str, rtype, area_sqft: float, lv: dict) -> None:
        windows = room.get("windows") or []
        glazing = 0.0
        egress_ok = False
        for k, win in enumerate(windows):
            wid = f"{rid}/window[{k}]"
            if win.get("wall") not in WALLS:
                self.add("WARN", "G-SPEC-1", wid, "window wall should be one of N, S, E, W")
            w, h = self.n(win.get("width_in")), self.n(win.get("height_in"))
            if w and h:
                glazing += w * h / 144.0
            above = self.n(win.get("above_grade_in"))
            sill_h = self.n(win.get("sill_in"))
            if (above is not None and sill_h is not None and above > self.L("window_fall_height_in")
                    and sill_h < self.L("window_fall_sill_in") and not win.get("fall_protection")):
                self.add("ERROR", "C-GUARD-2", wid,
                         f"operable sill {fmt(sill_h)} above the floor and {fmt(above)} above grade: limit the opening "
                         "or add a window opening control device, and set fall_protection: true (R312.2)")
            eg = win.get("egress")
            if eg:
                ok = True
                cw, ch = self.n(eg.get("net_clear_w_in")), self.n(eg.get("net_clear_h_in"))
                sill = self.n(win.get("sill_in"))
                if cw is None or ch is None:
                    self.add("ERROR", "C-EGR-2", wid, "egress window needs net_clear_w_in and net_clear_h_in")
                    continue
                grade = bool(eg.get("grade_floor")) or bool(lv.get("below_grade"))
                need = self.L("egress_min_area_grade_sqft") if grade else self.L("egress_min_area_sqft")
                net = cw * ch / 144.0
                if net < need:
                    ok = False
                    self.add("ERROR", "C-EGR-2", wid, f"net clear opening {net:.2f} sq ft; minimum {need} sq ft (R310.2.1)")
                if ch < self.L("egress_min_h_in") or cw < self.L("egress_min_w_in"):
                    ok = False
                    self.add("ERROR", "C-EGR-3", wid,
                             f"net clear {fmt(cw)} W x {fmt(ch)} H; minimum {fmt(self.L('egress_min_w_in'))} W x "
                             f"{fmt(self.L('egress_min_h_in'))} H (R310.2.1)")
                if sill is None or sill > self.L("egress_max_sill_in"):
                    ok = False
                    self.add("ERROR", "C-EGR-4", wid,
                             f"sill {fmt(sill) if sill is not None else 'not given'}; maximum "
                             f"{fmt(self.L('egress_max_sill_in'))} above the floor (R310.2.2)")
                egress_ok = egress_ok or ok
        needs_egress = rtype in SLEEPING or (lv.get("below_grade") and rtype in HABITABLE)
        if needs_egress and not egress_ok and not room.get("egress_door"):
            self.add("ERROR", "C-EGR-1", rid,
                     "sleeping room (or basement habitable room) has no compliant emergency escape opening (R310.1)")
        if rtype in HABITABLE and area_sqft > 0:
            pct = 100.0 * glazing / area_sqft
            if pct < self.L("glazing_min_pct"):
                self.add("WARN", "C-LIGHT-1", rid,
                         f"glazing about {pct:.1f}% of floor area; R303.1 asks for {self.L('glazing_min_pct')}% "
                         "unless artificial light and mechanical ventilation meet the exceptions")

    def check_bath(self, room: dict, rid: str, w: float, d: float, ud: bool) -> None:
        fx = room.get("fixtures") or {}
        wc = fx.get("wc")
        if wc:
            side, front = self.n(wc.get("side_clear_in")), self.n(wc.get("front_clear_in"))
            if side is None or side < self.L("wc_side_min_in"):
                self.add("ERROR", "C-BATH-1", rid,
                         f"water closet centerline to side wall/fixture {fmt(side) if side else 'not given'}; "
                         f"minimum {fmt(self.L('wc_side_min_in'))} (R307.1)")
            if front is None or front < self.L("wc_front_min_in"):
                self.add("ERROR", "C-BATH-1", rid,
                         f"clear space in front of water closet {fmt(front) if front else 'not given'}; "
                         f"minimum {fmt(self.L('wc_front_min_in'))} (R307.1)")
        sh = fx.get("shower")
        if sh:
            sw, sd = self.n(sh.get("w_in")), self.n(sh.get("d_in"))
            if not sw or not sd or sw * sd < self.L("shower_min_area_sqin") or min(sw, sd) < self.L("shower_min_dim_in"):
                self.add("ERROR", "C-BATH-2", rid,
                         f"shower {fmt(sw) if sw else '?'} x {fmt(sd) if sd else '?'}; minimum "
                         f"{self.L('shower_min_area_sqin')} sq in and {fmt(self.L('shower_min_dim_in'))} each way (P2708.1)")
        if ud and room.get("type") == "bath" and min(w, d) < self.L("ud_bath_turn_in"):
            self.add("INFO", "SP-UD-2", rid,
                     f"room's least dimension {fmt(min(w, d))}: a {fmt(self.L('ud_bath_turn_in'))} turning circle "
                     "does not fit clear of fixtures; fine for most baths, plan one accessible bath on the entry level")

    def check_kitchen(self, room: dict, rid: str) -> None:
        k = room.get("kitchen") or {}
        aisle = self.n(k.get("work_aisle_in"))
        if aisle is None:
            self.add("INFO", "SP-KIT-1", rid, "no work aisle width given; NKBA recommends 42 in (one cook) / 48 in (two)")
            return
        need = self.L("kitchen_aisle_multi_cook_in") if (k.get("cooks") or 1) > 1 else self.L("kitchen_aisle_one_cook_in")
        if aisle < need:
            self.add("WARN", "SP-KIT-1", rid, f"work aisle {fmt(aisle)}; NKBA recommends at least {fmt(need)}")

    def check_egress_doors(self, lv: dict, ud: bool) -> int:
        count = 0
        for door in lv.get("egress_doors") or []:
            did = f"{lv.get('id', '?')}/{door.get('id', 'egress door')}"
            cw, ch = self.n(door.get("clear_width_in")), self.n(door.get("clear_height_in"))
            if cw is None or cw < self.L("egress_door_min_w_in"):
                self.add("ERROR", "C-DOOR-1", did,
                         f"clear width {fmt(cw) if cw else 'not given'}; minimum {fmt(self.L('egress_door_min_w_in'))} (R311.2)")
            if ch is None or ch < self.L("egress_door_min_h_in"):
                self.add("ERROR", "C-DOOR-1", did,
                         f"clear height {fmt(ch) if ch else 'not given'}; minimum {fmt(self.L('egress_door_min_h_in'))} (R311.2)")
            if ud and cw is not None and cw < self.L("ud_door_min_clear_in"):
                self.add("WARN", "SP-UD-1", did,
                         f"universal design: aim for {fmt(self.L('ud_door_min_clear_in'))} clear (a 36 in door)")
            count += 1
        return count

    def check_stair(self, st: dict, lv: dict, by_id: dict) -> None:
        sid = f"{lv.get('id', '?')}/{st.get('id', 'stair')}"
        to = by_id.get(st.get("to_level"))
        risers = st.get("risers")
        if to is None or not risers:
            self.add("ERROR", "G-SPEC-1", sid, "stair needs to_level (a level id) and a riser count")
            return
        rise = (self.n(to.get("elevation_in")) or 0) - (self.n(lv.get("elevation_in")) or 0)
        riser = rise / risers
        tread = self.n(st.get("tread_in"))
        width = self.n(st.get("width_in"))
        head = self.n(st.get("headroom_in"))
        rail = self.n(st.get("handrail_in"))
        if riser > self.L("riser_max_in"):
            self.add("ERROR", "C-STAIR-2", sid,
                     f"{fmt(rise)} rise / {risers} risers = {riser:.2f} in per riser; maximum {self.L('riser_max_in')} in "
                     f"(R311.7.5.1): use at least {int(-(-rise // self.L('riser_max_in')))} risers")
        if tread is None or tread < self.L("tread_min_in"):
            self.add("ERROR", "C-STAIR-3", sid,
                     f"tread {fmt(tread) if tread else 'not given'}; minimum {fmt(self.L('tread_min_in'))} (R311.7.5.2)")
        if width is None or width < self.L("stair_min_w_in"):
            self.add("ERROR", "C-STAIR-1", sid,
                     f"width {fmt(width) if width else 'not given'}; minimum {fmt(self.L('stair_min_w_in'))} (R311.7.1)")
        if head is None or head < self.L("headroom_min_in"):
            self.add("ERROR", "C-STAIR-4", sid,
                     f"headroom {fmt(head) if head else 'not given'}; minimum {fmt(self.L('headroom_min_in'))} (R311.7.2)")
        if risers >= self.L("handrail_required_risers"):
            if rail is None or not (self.L("handrail_min_in") <= rail <= self.L("handrail_max_in")):
                self.add("ERROR", "C-STAIR-5", sid,
                         f"handrail {fmt(rail) if rail else 'not given'}; must be {fmt(self.L('handrail_min_in'))}–"
                         f"{fmt(self.L('handrail_max_in'))} above nosings with {self.L('handrail_required_risers')}+ risers (R311.7.8)")
        # C-STAIR-6: the run has to fit the room drawn for it (straight stairs)
        r = self.rect(st)
        if r and tread and st.get("shape", "straight") == "straight":
            run = (risers - 1) * tread
            if max(r[2], r[3]) + 0.5 < run:
                self.add("ERROR", "C-STAIR-6", sid,
                         f"{risers - 1} treads x {fmt(tread)} = {fmt(run)} of run, but the stair rect is only "
                         f"{fmt(max(r[2], r[3]))} long; add landings at top and bottom too (R311.7.6)")
        elif st.get("shape", "straight") != "straight":
            self.add("INFO", "C-STAIR-6", sid, "non-straight stair: check the run, winders and landings by hand")

    def check_guard(self, g: dict, lv: dict) -> None:
        gid = f"{lv.get('id', '?')}/{g.get('id', 'guard')}"
        drop, h = self.n(g.get("drop_in")), self.n(g.get("height_in"))
        if drop is not None and drop > self.L("guard_trigger_drop_in"):
            if h is None or h < self.L("guard_min_in"):
                self.add("ERROR", "C-GUARD-1", gid,
                         f"drop {fmt(drop)} needs a guard at least {fmt(self.L('guard_min_in'))} high (R312.1); got "
                         f"{fmt(h) if h else 'none'}")

    def check_alarms(self, lv: dict, co_required: bool) -> None:
        lid = lv.get("id", "?")
        rooms = {r.get("id"): r for r in lv.get("rooms") or []}
        alarms = lv.get("alarms") or []
        smoke_in = {a.get("room") for a in alarms if a.get("type") in ("smoke", "combo")}
        co_in = {a.get("room") for a in alarms if a.get("type") in ("co", "combo")}
        if not smoke_in and any(r.get("type") not in UNCONDITIONED for r in rooms.values()):
            self.add("ERROR", "C-ALARM-1", lid, "no smoke alarm on this story (R314.3)")
        bedrooms = [rid for rid, r in rooms.items() if r.get("type") in SLEEPING]
        for rid in bedrooms:
            if rid not in smoke_in:
                self.add("ERROR", "C-ALARM-1", f"{lid}/{rid}", "sleeping room needs a smoke alarm (R314.3)")
        if bedrooms:
            outside = [r for r in smoke_in if r in rooms and rooms[r].get("type") not in SLEEPING]
            if not outside:
                self.add("ERROR", "C-ALARM-2", lid,
                         "no smoke alarm outside the sleeping rooms, in the vicinity of the bedrooms (R314.3)")
            if co_required and not [r for r in co_in if r in rooms and rooms[r].get("type") not in SLEEPING]:
                self.add("ERROR", "C-ALARM-3", lid,
                         "fuel-fired appliance or attached garage: a CO alarm is required outside the sleeping rooms (R315)")

    def check_garage(self, levels: list) -> None:
        for lv in levels:
            rooms = {r.get("id"): r for r in lv.get("rooms") or []}
            for gid, g in rooms.items():
                if g.get("type") != "garage":
                    continue
                for target in g.get("opens_to") or []:
                    if rooms.get(target, {}).get("type") in SLEEPING:
                        self.add("ERROR", "C-GAR-2", f"{lv.get('id')}/{gid}",
                                 f"garage opens directly into sleeping room {target} (R302.5.1)")
            if any(r.get("type") == "garage" for r in rooms.values()):
                sep = lv.get("garage_separation") or {}
                missing = [k for k in ("wall", "ceiling", "door") if not sep.get(k)]
                if missing:
                    self.add("WARN", "C-GAR-1", f"{lv.get('id')}/garage_separation",
                             f"state the dwelling–garage separation for: {', '.join(missing)} (R302.6, R302.5.1)")

    def check_site(self, levels: list) -> None:
        site = self.spec.get("site") or {}
        lot, sb = site.get("lot_in"), site.get("setbacks_in")
        if not lot or not sb or not any(lot):
            self.add("INFO", "Z-SETBACK-1", "site", "no lot or setbacks given; zoning fit not checked")
            return
        ox, oy = (self.n(v) for v in (site.get("building_origin_in") or [0, 0]))
        lw, ld = self.n(lot[0]), self.n(lot[1])
        west, east = self.n(sb.get("west", 0)), self.n(sb.get("east", 0))
        south, north = self.n(sb.get("south", 0)), self.n(sb.get("north", 0))
        for lv in levels:
            for room in lv.get("rooms") or []:
                r = self.rect(room)
                if not r:
                    continue
                x0, y0, x1, y1 = ox + r[0], oy + r[1], ox + r[0] + r[2], oy + r[1] + r[3]
                if x0 < west or y0 < south or x1 > lw - east or y1 > ld - north:
                    self.add("ERROR", "Z-SETBACK-1", f"{lv.get('id')}/{room.get('id')}",
                             "room extends into a setback (check projections such as eaves separately)")

    def check_roof(self) -> None:
        roof = self.spec.get("roof") or {}
        if roof.get("framing") == "trusses":
            span = self.n(roof.get("clear_span_in"))
            if span and span > self.L("truss_span_warn_in"):
                self.add("WARN", "S-ROOF-1", "roof",
                         f"truss span {fmt(span)}: beyond common residential practice; confirm with the truss designer")
        if roof.get("framing") == "rafters" and roof.get("cathedral"):
            self.add("INFO", "S-ROOF-2", "roof",
                     "rafters without ceiling joists or rafter ties need a structural ridge beam, engineered (R802)")

    def check_concept(self) -> None:
        """CR-GATE-1: from schematic design on, a concept is chosen (with its statement) or skipped on purpose."""
        project = self.spec.get("project") or {}
        if project.get("phase", "schematic") in ("programming", "concept"):
            return
        c = project.get("concept") or {}
        status = str(c.get("status", "")).lower()
        stated = str(c.get("statement") or "").strip()
        reason = str(c.get("skip_reason") or "").strip()
        if status == "chosen" and stated and not stated.startswith("<"):
            self.add("INFO", "CR-KEEP-1", "project.concept",
                     f"concept: \"{stated[:100]}\" (test the design against it at every gate)")
        elif status == "skipped" and reason and not reason.startswith("<"):
            self.add("INFO", "CR-GATE-1", "project.concept", f"concept phase skipped on purpose: {reason[:100]}")
        else:
            self.add("WARN", "CR-GATE-1", "project.concept",
                     "no concept chosen: run the concept phase (playbook 08, concept-studio skill) "
                     "or record status: skipped with a skip_reason")

    def check_connectivity(self, levels: list, by_id: dict) -> None:
        """G-CONN-1: every conditioned room is reachable from an egress door through doors,
        open connections, the garage's opens_to, or stairs; every door joins rooms that share a wall."""
        declared = any((r.get("doors") or r.get("open_to")) for lv in levels for r in (lv.get("rooms") or []))
        if not declared:
            self.add("INFO", "G-CONN-1", "plan",
                     "no interior doors or open connections given; room-to-room reachability not checked")
            return
        rooms = {}
        for lv in levels:
            for r in lv.get("rooms") or []:
                rooms[r.get("id")] = (lv, r)
        edges: dict = {rid: set() for rid in rooms}

        def link(a, b, kind, width=None, where=""):
            if b == "EXTERIOR":
                return
            if b not in rooms:
                self.add("ERROR", "G-CONN-1", where, f"{kind} leads to unknown room '{b}'")
                return
            seg = shared_edge(self.rect(rooms[a][1]), self.rect(rooms[b][1])) if rooms[a][0] is rooms[b][0] else None
            need = (width or 0) + 2.0  # door plus a minimal jamb
            if seg is None or seg[3] - seg[2] < need:
                have = 0.0 if seg is None else seg[3] - seg[2]
                self.add("ERROR", "G-CONN-1", where,
                         f"{kind} to {b}, but the rooms share {fmt(have)} of wall (need {fmt(need)})")
                return
            edges[a].add(b)
            edges[b].add(a)

        for rid, (lv, r) in rooms.items():
            where = f"{lv.get('id')}/{rid}"
            for d in r.get("doors") or []:
                link(rid, d.get("to"), "door", self.n(d.get("width_in")) or 32.0, where)
            for b in r.get("open_to") or []:
                link(rid, b, "opening", 24.0, where)
            for b in r.get("opens_to") or []:
                link(rid, b, "garage door", 32.0, where)
        for lv in levels:
            for st in lv.get("stairs") or []:
                a, b = st.get("from_room"), st.get("to_room")
                if a in edges and b in edges:
                    edges[a].add(b)
                    edges[b].add(a)
        starts = [d.get("room") for lv in levels for d in (lv.get("egress_doors") or []) if d.get("room") in edges]
        if not starts:
            self.add("ERROR", "G-CONN-1", "egress_doors", "egress doors must name the room they open from (room:)")
            return
        seen, todo = set(starts), list(starts)
        while todo:
            for nxt in edges[todo.pop()]:
                if nxt not in seen:
                    seen.add(nxt)
                    todo.append(nxt)
        for rid, (lv, r) in rooms.items():
            if rid not in seen and r.get("type") not in UNCONDITIONED:
                hint = " (multi-level: give stairs from_room and to_room)" if len(levels) > 1 else ""
                self.add("ERROR", "G-CONN-1", f"{lv.get('id')}/{rid}",
                         f"room cannot be reached from the egress door: add a door or opening{hint}")

    def check_circulation(self, levels: list) -> None:
        circ = net = 0.0
        for lv in levels:
            for room in lv.get("rooms") or []:
                r = self.rect(room)
                if not r or room.get("type") in UNCONDITIONED:
                    continue
                a = r[2] * r[3] / 144.0
                net += a
                if room.get("type") in CIRCULATION:
                    circ += a
            for st in lv.get("stairs") or []:
                r = self.rect(st)
                if r:
                    a = r[2] * r[3] / 144.0
                    net += a
                    circ += a
        if net:
            pct = 100.0 * circ / net
            sev = "WARN" if pct > self.L("circulation_warn_pct") else "INFO"
            self.add(sev, "SP-CIRC-1", "plan",
                     f"circulation is {pct:.1f}% of {net:.0f} sq ft net conditioned area "
                     f"(aim for about 10–15%, look hard above {self.L('circulation_warn_pct')}%)")


def window_spans(room: dict, k: float = 1.0) -> list[tuple]:
    """Where each window of a room sits: (window, wall, along_start_in, along_end_in, line_in).

    `along` runs west->east on N/S walls and south->north on E/W walls; `line` is the
    wall's x (E/W) or y (N/S). Windows are spaced evenly along their wall unless
    offset_in (from the room's west or south corner) is given. render_plan.py and
    spec_to_ifc.py place windows with this same function, so all three tools agree.
    """
    r = room.get("rect")
    if not (isinstance(r, list) and len(r) == 4):
        return []
    x, y, w, d = (float(v) * k for v in r)
    by_wall: dict = {}
    for win in room.get("windows") or []:
        by_wall.setdefault(win.get("wall"), []).append(win)
    spans = []
    for wall, wins in by_wall.items():
        if wall not in WALLS:
            continue
        length = w if wall in ("N", "S") else d
        origin = x if wall in ("N", "S") else y
        line = {"N": y + d, "S": y, "E": x + w, "W": x}[wall]
        for i, win in enumerate(wins):
            ww = float(win.get("width_in", 36)) * k
            off = win.get("offset_in")
            start = float(off) * k if off is not None else length * (i + 1) / (len(wins) + 1) - ww / 2
            spans.append((win, wall, origin + start, origin + start + ww, line))
    return spans


def shared_edge(a, b):
    """The wall segment two room rects share: (axis, line, start, end), or None.

    axis 'v' = a vertical wall at x=line running start..end in y; 'h' = horizontal at y=line.
    """
    if a is None or b is None:
        return None
    ax, ay, aw, ad = a
    bx, by, bw, bd = b
    for line_a, line_b in ((ax + aw, bx), (bx + bw, ax)):
        if abs(line_a - line_b) < 1.0:
            lo, hi = max(ay, by), min(ay + ad, by + bd)
            if hi - lo > 0.5:
                return ("v", line_a, lo, hi)
    for line_a, line_b in ((ay + ad, by), (by + bd, ay)):
        if abs(line_a - line_b) < 1.0:
            lo, hi = max(ax, bx), min(ax + aw, bx + bw)
            if hi - lo > 0.5:
                return ("h", line_a, lo, hi)
    return None


def door_spans(level: dict, k: float = 1.0) -> list[tuple]:
    """Interior doors on a level: (room, door, axis, line, start, end, swing_sign).

    A door sits on the wall its room shares with `to`, centred unless offset_in (from the
    shared segment's start) is given. swing_sign is +1 when the door swings toward +x/+y,
    i.e. into the room listing the door (doors swing into rooms, SP-DOOR-1).
    """
    def rect(r):
        v = r.get("rect")
        return tuple(float(t) * k for t in v) if isinstance(v, list) and len(v) == 4 else None
    rooms = {r.get("id"): r for r in level.get("rooms") or []}
    out = []
    listed = [(r, d) for r in rooms.values() for d in (r.get("doors") or [])]
    # a garage's opens_to is a door too; it swings into the house side (the target room)
    listed += [(rooms[t], {"to": r.get("id"), "width_in": 34 / k if k else 34})
               for r in rooms.values() for t in (r.get("opens_to") or []) if t in rooms]
    for r, d in listed:
            other = rooms.get(d.get("to"))
            if other is None:
                continue
            seg = shared_edge(rect(r), rect(other))
            if seg is None:
                continue
            axis, line, lo, hi = seg
            w = float(d.get("width_in", 32)) * k
            off = d.get("offset_in")
            a = lo + float(off) * k if off is not None else (lo + hi) / 2 - w / 2
            mine = rect(r)
            centre = (mine[0] + mine[2] / 2) if axis == "v" else (mine[1] + mine[3] / 2)
            out.append((r, d, axis, line, a, a + w, 1 if centre > line else -1))
    return out


def egress_door_spans(level: dict, k: float = 1.0) -> list[tuple]:
    """Exterior egress doors that name a `wall`: (room, door, wall, start, end, line), placed like windows."""
    rooms = {r.get("id"): r for r in level.get("rooms") or []}
    out = []
    for d in level.get("egress_doors") or []:
        room = rooms.get(d.get("room"))
        if room is None or d.get("wall") not in WALLS:
            continue
        fake = {"rect": room.get("rect"), "windows": [{"wall": d["wall"], "width_in": d.get("width_in", 36),
                                                        "offset_in": d.get("offset_in")}]}
        for _, wall, a, b, line in window_spans(fake, k):
            out.append((room, d, wall, a, b, line))
    return out


def uncovered_fraction(r, support) -> float:
    """Share of rect r not covered by the union of support rects, sampled on a 6 in grid."""
    x, y, w, d = r
    step = 6.0
    nx, ny = max(1, int(w // step)), max(1, int(d // step))
    miss = 0
    for i in range(nx):
        px = x + (i + 0.5) * w / nx
        for j in range(ny):
            py = y + (j + 0.5) * d / ny
            if not any(s[0] <= px <= s[0] + s[2] and s[1] <= py <= s[1] + s[3] for s in support):
                miss += 1
    return miss / (nx * ny)


def fmt(inches) -> str:
    """Inches as feet-inches, e.g. 98.5 -> 8'-2 1/2"."""
    if inches is None:
        return "?"
    neg = inches < 0
    inches = abs(inches)
    ft = int(inches // 12)
    rem = inches - ft * 12
    whole = int(rem)
    frac = round((rem - whole) * 8) / 8
    if frac == 1:
        whole, frac = whole + 1, 0
    if whole == 12:
        ft, whole = ft + 1, 0
    frac_s = {0: "", 0.125: " 1/8", 0.25: " 1/4", 0.375: " 3/8", 0.5: " 1/2",
              0.625: " 5/8", 0.75: " 3/4", 0.875: " 7/8"}[frac]
    s = f"{ft}'-{whole}{frac_s}\"" if ft else f"{whole}{frac_s}\""
    return f"-{s}" if neg else s


def load(path: str) -> dict:
    text = Path(path).read_text(encoding="utf-8")
    if path.endswith(".json"):
        return json.loads(text)
    try:
        import yaml  # PyYAML
    except ImportError:
        sys.exit("check_design.py: PyYAML is needed for .yaml specs (pip install pyyaml), or pass a .json spec")
    return yaml.safe_load(text)


def main(argv: list[str]) -> int:
    args = [a for a in argv if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__.strip().splitlines()[0])
        print("usage: check_design.py <design.yaml|design.json> [--json]")
        return 2
    try:
        spec = load(args[0])
    except Exception as exc:  # unreadable or malformed spec
        print(f"check_design.py: cannot read {args[0]}: {exc}", file=sys.stderr)
        return 2
    findings = Checker(spec or {}).run()
    errors = sum(f.severity == "ERROR" for f in findings)
    if "--json" in argv:
        print(json.dumps([asdict(f) for f in findings], indent=2))
    else:
        name = (spec.get("project") or {}).get("name", args[0])
        print(f"Design check: {name}")
        code = str(((spec.get("project") or {}).get("jurisdiction") or {}).get("code", ""))
        if "2024" in code:
            print("  note: section numbers below cite the IRC 2021; the 2024 IRC renumbered much of Chapter 3 "
                  "(crosswalk in playbook/02-code-baseline.md)")
        order = {"ERROR": 0, "WARN": 1, "INFO": 2}
        for f in sorted(findings, key=lambda f: (order[f.severity], f.rule, f.where)):
            print(f"  {f.severity:<5} {f.rule:<12} {f.where}: {f.message}")
        warns = sum(f.severity == "WARN" for f in findings)
        print(f"{errors} error(s), {warns} warning(s). Passing this check is not code approval; the AHJ decides.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
