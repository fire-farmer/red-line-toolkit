#!/usr/bin/env python3
"""sun.py: the sun numbers a site and light lens can design with (E-SUN-1, CR-SPECIFIC-1).

    python3 sun.py --lat 40.7 [--window-ft 6 --gap-ft 1] [--story-ft 10]

Prints, for the site latitude:
  * noon sun altitude at the summer solstice, the equinoxes and the winter solstice;
  * sunrise and sunset bearings at the solstices (where the low sun comes from);
  * noon shadow length cast by one story;
  * the south-overhang depth that fully shades a window at summer noon while letting winter
    noon sun strike the whole glass, for a window of --window-ft height whose head sits
    --gap-ft below the overhang.
Noon-geometry rules of thumb: no atmosphere, no terrain, no time-of-day shading study. Use
them for concept moves, and confirm the final shading with a sun-path tool. North of the
equator "south" is the sunny side; south of it the tool flips to "north".
"""
from __future__ import annotations

import argparse
import math
import sys

TILT = 23.44


def noon_altitude(lat: float, decl: float) -> float:
    return 90.0 - abs(lat - decl)


def rise_bearing(lat: float, decl: float) -> float | None:
    """Sunrise bearing in degrees from true north (sunset = 360 - this). None if no sunrise."""
    c = math.sin(math.radians(decl)) / math.cos(math.radians(lat))
    if abs(c) > 1:
        return None
    return math.degrees(math.acos(c))


def main(argv: list) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--lat", type=float, required=True, help="site latitude, degrees (negative = south)")
    ap.add_argument("--window-ft", type=float, default=6.0, help="glass height")
    ap.add_argument("--gap-ft", type=float, default=1.0, help="overhang underside to window head")
    ap.add_argument("--story-ft", type=float, default=10.0)
    a = ap.parse_args(argv)
    north = a.lat >= 0
    summer, winter = (TILT, -TILT) if north else (-TILT, TILT)
    sunny = "south" if north else "north"
    alt = {"summer solstice": noon_altitude(a.lat, summer), "equinox": noon_altitude(a.lat, 0.0),
           "winter solstice": noon_altitude(a.lat, winter)}
    print(f"Sun at latitude {a.lat:.2f}° (sunny side: {sunny})")
    for name, value in alt.items():
        shadow = a.story_ft / math.tan(math.radians(value)) if value > 0 else float("inf")
        print(f"  {name:<16} noon altitude {value:5.1f}°   one {a.story_ft:g} ft story casts a {shadow:5.1f} ft noon shadow")
    for name, decl in (("summer solstice", summer), ("winter solstice", winter)):
        b = rise_bearing(a.lat, decl)
        if b is None:
            print(f"  {name:<16} no sunrise/sunset (polar)")
        else:
            print(f"  {name:<16} sunrise bearing {b:5.1f}° from north · sunset {360 - b:5.1f}°")
    hs, hw = math.tan(math.radians(alt["summer solstice"])), math.tan(math.radians(alt["winter solstice"]))
    # shade the full glass in summer: projection P with P * tan(alt_summer) >= gap + window
    p_summer = (a.gap_ft + a.window_ft) / hs
    # admit winter sun to the full glass: shadow edge P * tan(alt_winter) <= gap
    p_winter = a.gap_ft / hw if hw > 0 else float("inf")
    print(f"\nOverhang over {sunny} glass ({a.window_ft:g} ft window, head {a.gap_ft:g} ft below the overhang):")
    print(f"  full summer-noon shade needs a projection of at least {p_summer:.1f} ft")
    print(f"  full winter-noon sun needs a projection of at most  {p_winter:.1f} ft")
    if p_summer <= p_winter:
        print(f"  → any projection from {p_summer:.1f} to {p_winter:.1f} ft does both")
    else:
        print("  → no single overhang does both at this gap: raise the overhang (bigger gap), shorten the glass,"
              " or accept partial summer shade (use a deciduous tree, an exterior blind or a trellis)")
    print("  East and west glass: overhangs don't work against low sun; use fins, porches, planting or less glass.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
