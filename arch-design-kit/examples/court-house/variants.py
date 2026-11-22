"""A SKETCH generator for explore_variants.py (CR-SEARCH-1): the court house.

Concept statement: "Every room opens onto one walled garden at the center of the house."
This is what a concept-phase generator should look like: room rectangles at the right scale
around a court, with no doors, alarms, fixtures or windows. Concept mode (the default) checks
only the hard limits (CR-HARD-1): the lot's setbacks, the area budget, overlaps, and bedrooms
on an outside wall. Big courts and deep rings blow the budget or the lot and get dropped,
which is the point.

    python3 ../../tools/explore_variants.py variants.py --keep 6

Units: inches. +x east, +y north. The court's open side (if any) faces that direction.
"""
PARAMS = {
    "court_w_ft": [14, 18, 22, 28],
    "court_d_ft": [14, 18, 24],
    "ring_ft": [12, 14, 16],
    "living_side": ["S", "N"],       # which wing holds the living rooms (S = they get the sun)
    "open_side": ["none", "E"],      # "E" leaves the east wing off: a U opening to the morning
}
FT = 12


def split(name_types, x, y, length, depth, along_x=True):
    """Cut a wing into rooms by proportion. name_types: [(id, name, type, share)]."""
    rooms, pos = [], 0.0
    for rid, name, rtype, share in name_types:
        size = round(length * share / 12) * 12 if rid != name_types[-1][0] else length - pos
        rect = [x + pos, y, size, depth] if along_x else [x, y + pos, depth, size]
        rooms.append({"id": rid, "name": name, "type": rtype, "rect": rect})
        pos += size
    return rooms


def generate(p):
    cw, cd, r = p["court_w_ft"] * FT, p["court_d_ft"] * FT, p["ring_ft"] * FT
    width, depth = cw + 2 * r, cd + 2 * r
    living = [("GREAT", "Great Room", "living", 0.55), ("KITCHEN", "Kitchen", "kitchen", 0.30),
              ("PANTRY", "Pantry", "pantry", 0.15)]
    sleeping = [("BR2", "Bedroom 2", "bedroom", 0.30), ("BATH2", "Bath 2", "bath", 0.18),
                ("BR3", "Bedroom 3", "bedroom", 0.30), ("LINEN", "Linen", "closet", 0.22)]
    south_y, north_y = 0, r + cd
    live_y, sleep_y = (south_y, north_y) if p["living_side"] == "S" else (north_y, south_y)
    rooms = split(living, 0, live_y, width, r) + split(sleeping, 0, sleep_y, width, r)
    rooms += split([("ENTRY", "Entry", "foyer", 0.4), ("MUD", "Mud / Laundry", "laundry", 0.6)],
                   0, r, cd, r, along_x=False)                                  # west wing
    if p["open_side"] == "none":
        rooms += split([("BRP", "Primary Bedroom", "bedroom", 0.6), ("BATHP", "Primary Bath", "bath", 0.4)],
                       r + cw, r, cd, r, along_x=False)                         # east wing
    else:                                                                       # primary moves to a pavilion
        rooms += [{"id": "BRP", "name": "Primary Bedroom", "type": "bedroom", "rect": [r + cw, r, r, cd * 0.6]}]
    rooms.append({"id": "COURT", "name": "Court", "type": "court",
                  "rect": [r, r, cw + (0 if p["open_side"] == "none" else 0), cd]})
    return {
        "project": {"name": f"Court house · {p['open_side']}", "units": "in", "phase": "concept",
                    "area_budget_sqft": 1900,
                    "concept": {"status": "exploring",
                                "statement": "Every room opens onto one walled garden at the center of the house."}},
        "site": {"lot_in": [70 * FT, 110 * FT], "setbacks_in": {"north": 25 * FT, "south": 20 * FT,
                                                                "east": 6 * FT, "west": 6 * FT},
                 "building_origin_in": [6 * FT, 20 * FT]},
        "levels": [{"id": "L1", "name": "Main level", "elevation_in": 0, "ceiling_in": 108, "rooms": rooms}],
    }
