"""A concept family for explore_variants.py (CR-SEARCH-1): the bar house.

Concept statement: "Rooms strung along bars: a sleeping bar with its own gallery and a living bar
facing the sun, joined at the front door." The generator varies how the bars meet (one long line,
an L, or a U around a court) and their proportions. explore_variants.py keeps the most different
ones that pass the checker.

    python3 ../../tools/explore_variants.py variants.py --keep 6

Units: inches. +x east, +y north. Room widths are rounded up to the 2 ft module (S-MOD-1).
"""
import math

PARAMS = {
    "parti": ["linear", "L", "U"],          # how the sleeping bar meets the living bar
    "living_depth_ft": [14, 16, 18],        # depth of the living bar
    "sleeping_depth_ft": [14, 16, 18],      # depth of the sleeping bar, gallery (hall) included
    "primary": ["far", "near"],             # primary suite at the far end of the gallery, or by the entry
    "garage": ["attached", "none"],
}

MODULE, HALL, ENTRY_W = 24, 42, 96
SLEEPING = [("BRP", "Primary Bedroom", "bedroom", 210), ("BATHP", "Primary Bath", "bath", 90),
            ("BR2", "Bedroom 2", "bedroom", 130), ("BATH2", "Bath 2", "bath", 70), ("BR3", "Bedroom 3", "bedroom", 130)]


def width_for(area_sf, depth_in, minimum=60):
    """Width along the bar for a target area at a given depth, on the 2 ft module."""
    return max(minimum, MODULE * math.ceil(area_sf * 144 / depth_in / MODULE))


def room(rid, name, rtype, rect, **extra):
    return dict({"id": rid, "name": name, "type": rtype, "rect": [round(v, 2) for v in rect]}, **extra)


def bedroom_windows(wall):
    return [{"wall": wall, "width_in": 30, "height_in": 60, "sill_in": 24,
             "egress": {"net_clear_w_in": 26, "net_clear_h_in": 54}},
            {"wall": wall, "width_in": 30, "height_in": 60, "sill_in": 24}]


def fixtures(rtype):
    wc = {"side_clear_in": 18, "front_clear_in": 30}
    return {"wc": wc, "shower": {"w_in": 36, "d_in": 48}} if rtype == "bath" else {}


def generate(p):
    dp, ds = p["living_depth_ft"] * 12, p["sleeping_depth_ft"] * 12
    rd = ds - HALL                                    # bedroom depth inside the sleeping bar
    order = SLEEPING if p["primary"] == "far" else list(reversed(SLEEPING))
    rooms = []

    # ---- the sleeping bar -------------------------------------------------------------------
    widths = [width_for(area, rd) for *_, area in order]
    length = sum(widths)
    if p["parti"] == "linear":                        # runs west from the entry, gallery on the north side
        x = 0
        for (rid, name, rtype, _), w in zip(order, widths):
            extra = {"windows": bedroom_windows("S")} if rtype == "bedroom" else {"fixtures": fixtures(rtype)}
            rooms.append(room(rid, name, rtype, [x, 0, w, rd], doors=[{"to": "HALL", "width_in": 32}], **extra))
            x += w
        rooms.append(room("HALL", "Gallery", "hall", [0, rd, length, HALL], open_to=["ENTRY"]))
        entry = [length, 0, ENTRY_W, max(dp, ds)]
        x_live = length + ENTRY_W
    else:                                             # runs north from the entry, gallery on the east side
        y = dp
        for (rid, name, rtype, _), w in zip(reversed(order), reversed(widths)):
            extra = {"windows": bedroom_windows("W")} if rtype == "bedroom" else {"fixtures": fixtures(rtype)}
            rooms.append(room(rid, name, rtype, [0, y, rd, w], doors=[{"to": "HALL", "width_in": 32}], **extra))
            y += w
        rooms.append(room("HALL", "Gallery", "hall", [rd, dp, HALL, length], open_to=["ENTRY"]))
        entry = [0, 0, ds, dp]
        x_live = ds
    rooms.append(room("ENTRY", "Entry", "foyer", entry, open_to=["GREAT"]))

    # ---- the living bar (faces south) ---------------------------------------------------------
    great_w, kitchen_w = width_for(380, dp), width_for(200, dp)
    rooms.append(room("GREAT", "Great Room", "living", [x_live, 0, great_w, dp], open_to=["KITCHEN"],
                      windows=[{"wall": "S", "width_in": 72, "height_in": 84, "sill_in": 12},
                               {"wall": "S", "width_in": 72, "height_in": 84, "sill_in": 12}]))
    kx = x_live + great_w
    kitchen_window = "E" if p["parti"] == "U" else "N"
    rooms.append(room("KITCHEN", "Kitchen", "kitchen", [kx, 0, kitchen_w, dp],
                      kitchen={"work_aisle_in": 48, "cooks": 2},
                      windows=[{"wall": kitchen_window, "width_in": 60, "height_in": 42, "sill_in": 42}]))

    # ---- service: in line with the living bar, or as the U's third wing ------------------------
    if p["parti"] == "U":
        lh = max(72, MODULE * math.ceil(50 * 144 / kitchen_w / MODULE))
        rooms.append(room("LAUNDRY", "Laundry / Mud", "laundry", [kx, dp, kitchen_w, lh], open_to=["KITCHEN"]))
        if p["garage"] == "attached":
            rooms.append(room("GARAGE", "Garage", "garage", [kx, dp + lh, 264, 264], opens_to=["LAUNDRY"]))
        else:
            rooms.append(room("STUDIO", "Studio", "office", [kx, dp + lh, kitchen_w, width_for(140, kitchen_w, 96)],
                              doors=[{"to": "LAUNDRY", "width_in": 32}],
                              windows=[{"wall": "N", "width_in": 72, "height_in": 60, "sill_in": 24}]))
    else:
        lx = kx + kitchen_w
        rooms.append(room("LAUNDRY", "Laundry / Mud", "laundry", [lx, 0, 60, dp], open_to=["KITCHEN"]))
        if p["garage"] == "attached":
            rooms.append(room("GARAGE", "Garage", "garage", [lx + 60, 0, 264, 264], opens_to=["LAUNDRY"]))

    level = {
        "id": "L1", "name": "Main level", "elevation_in": 0, "ceiling_in": 108,
        "egress_doors": [{"id": "D-ENTRY", "room": "ENTRY", "wall": "S", "width_in": 36,
                          "clear_width_in": 34, "clear_height_in": 79.5}],
        "alarms": [{"type": "smoke", "room": r} for r in ("BRP", "BR2", "BR3")]
                  + [{"type": "combo", "room": "HALL"}, {"type": "combo", "room": "GREAT"}],
        "rooms": rooms,
    }
    if p["garage"] == "attached":
        level["garage_separation"] = {"wall": "1/2 in. gypsum, garage side", "ceiling": "1/2 in. gypsum",
                                      "door": "1-3/8 in. solid core, self-closing"}
    return {
        "project": {"name": f"Bar house · {p['parti']}", "units": "in", "phase": "concept",
                    "jurisdiction": {"country": "US", "code": "IRC 2021"},
                    "concept": {"status": "exploring",
                                "statement": "Rooms strung along bars: a sleeping bar with its own gallery and a "
                                             "living bar facing the sun, joined at the front door."}},
        "roof": {"form": "shed", "pitch": "3:12", "framing": "trusses", "clear_span_in": max(dp, ds) + 13},
        "levels": [level],
    }
