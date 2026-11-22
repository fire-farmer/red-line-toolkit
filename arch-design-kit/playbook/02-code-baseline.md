# 02 · Code baseline (US residential)

This chapter sets the floor that no design drops below. The baseline is the **International Residential Code (IRC) 2021**, with **2024** differences noted. It covers one- and two-family dwellings and townhouses up to three stories. Larger or mixed-use buildings fall under the IBC, which this playbook does not cover.

> **The AHJ governs.** Each jurisdiction adopts a code edition and amends it. Before schematic design, record the adopted edition, local amendments and climate zone in `PROJECT-BRIEF.md`. Where a local value is stricter, override it in the spec with a reason:
> ```yaml
> limits:
>   hall_min_w_in: {value: 42, reason: "City of X amendment 12.3"}
> ```
> A passing `check_design.py` run does not mean a design complies with code. A licensed professional and the AHJ decide that (W-PRO-1).

**Basis marks** follow [RULES.md](RULES.md). ✅ means confirmed against cited (mostly secondary) sources. ⚠️ means expert knowledge of the code text, queued in [VERIFY.md](VERIFY.md). Section numbers are 2021.

## Edition crosswalk 2021 → 2024

The 2024 IRC reorganized Chapter 3, and some old numbers now mean different topics. For example, 2024 R310 is *Smoke Alarms*, not escape openings. Always cite the title along with the number.

| Topic | 2021 | 2024 | Basis |
|---|---|---|---|
| Exterior walls / fire separation distance | R302.1 | R302.1 (unchanged) | ✅ |
| Minimum room areas | R304 | R312 | ✅ |
| Ceiling height | R305 | R313 | ✅ |
| Emergency escape and rescue openings | R310 | R319 | ✅ |
| Means of egress (doors, halls, stairs, ramps) | R311 | R318 | ✅ |
| Handrails | R311.7.8 | R320 | single secondary source |
| Guards and window fall protection | R312 | R321 | ✅ |
| Sprinklers | R313 | R309 | ✅ |
| Smoke alarms | R314 | R310 | ✅ |
| Garages and carports | R309 | R317 | ✅ |
| Glazing | R308 | R324 | single secondary source |
| Light, ventilation, heating | R303 | R325 | single secondary source |
| CO alarms; toilet/bath spaces; garage separation (R302.5–.6) | R315; R307; R302.5–.6 | not confirmed | ⚠️ |

The dimensional values checked here (room size, ceiling, escape openings, stairs, guards) did not change between 2021 and 2024; only the numbering did. One web source claims 2024 allows an 8¼ in. riser and a 9 in. tread. That is wrong: those values come from legacy CABO and New York rules.

## Zoning and site

**Z-INPUT-1. Collect these values before massing** (✅). Get them from the zoning code, the planning department and the HOA, and never assume defaults:

- District and permitted use (single-family, duplex, townhouse, ADU)
- Minimum lot area, width and frontage
- Setbacks: front, side (interior and street), rear; corner-lot rules; allowed encroachments for eaves, bays, porches, stairs, chimneys and HVAC; build-to lines
- Height: maximum in feet and stories, how it is measured (grade reference; ridge or mid-roof), daylight or bulk planes, accessory height
- Lot coverage (building and impervious) and FAR or maximum floor area, including what counts toward it
- Parking: number of spaces, covered or not, driveway width and curb cuts
- Overlays: historic, design review, flood zone and design flood elevation (IRC R322), wildland-urban interface, steep slope, shoreline, tree protection
- Easements, utilities, sight triangles, grading and stormwater limits
- HOA covenants, which are often stricter than zoning

**Z-SETBACK-1** (● auto). Every room's footprint must sit inside the buildable envelope. Eaves, bays and stairs follow their own encroachment rules, so check them separately.

**Z-FSD-1. Fire separation distance** (R302.1, ✅). The distance is measured to the lot line, to the street centerline, or to an imaginary line between buildings on the same lot. Unsprinklered dwellings follow Table R302.1(1):

| Element | < 2 ft | 2 to < 3 ft | 3 to < 5 ft | ≥ 5 ft |
|---|---|---|---|---|
| Walls | 1-hr, exposure both sides | 1-hr | 1-hr | 0-hr |
| Projections | not allowed | 1-hr underside (or heavy timber or FRT) | same | 0-hr |
| Openings | not allowed | not allowed | ≤ 25% of wall area | unlimited |
| Penetrations | per R302.4 | per R302.4 | none required | none required |

Sprinklered dwellings use the more lenient Table R302.1(2) (⚠️). This table is commonly amended. For example, Van Meter, Iowa only requires the 1-hr wall below 3 ft. **Side setbacks under about 5 ft almost always mean rated walls and limited windows, so settle this before the elevations.**

## Rooms, ceilings, light and air

| Rule | Requirement | Basis |
|---|---|---|
| C-ROOM-1 | Habitable room ≥ **70 sq ft** | ✅ |
| C-ROOM-2 | Habitable room ≥ **7 ft** in any horizontal dimension (kitchens exempt) | ✅ |
| C-CEIL-1 | Ceiling ≥ **7′-0″** in habitable rooms and halls; ≥ **6′-8″** in baths, toilet rooms and laundry rooms | ✅ |
| C-CEIL-2 | Sloped ceilings: floor area under 5 ft of headroom doesn't count, and ≥ 50% of the *required* area must be ≥ 7 ft. Basement beams and ducts may drop to **6′-4″**. A showerhead needs 6′-8″ over a 30×30 in. area. | ✅ / ⚠️ |
| C-LIGHT-1 | Glazing ≥ **8%** of floor area and openable area ≥ **4%**. Exceptions: mechanical ventilation (M1505) plus artificial light averaging 6 fc, or whole-house ventilation in place of openable area. An adjoining room counts if the shared opening is ≥ ½ the wall and ≥ 1/10 of the floor area, and ≥ 25 sq ft. | ⚠️ |
| C-LIGHT-2 | Bathroom: ≥ **3 sq ft** of glazing, half of it openable, or exhaust of **50 cfm** intermittent / **20 cfm** continuous | ⚠️ |

The "at least one room of 120 sq ft" rule was deleted in 2015 (⚠️). Ignore older guides that still list it.

## Escape openings (EERO)

| Rule | Requirement | Basis |
|---|---|---|
| C-EGR-1 | One per sleeping room, per basement, and per habitable attic. Basement sleeping rooms each need their own. It must open to a public way or to a yard or court ≥ 36 in. wide. | ⚠️ |
| C-EGR-2 | Net clear opening ≥ **5.7 sq ft** (≥ **5.0** at grade floor) | ✅ |
| C-EGR-3 | Net clear height ≥ **24 in.** and width ≥ **20 in.** The two minimums together do *not* reach the minimum area: a 20 in. wide opening needs ≈ 42 in. of height. | ✅ |
| C-EGR-4 | Sill ≤ **44 in.** above the finished floor | ✅ |
| C-EGR-5 | Window well ≥ **9 sq ft**, ≥ **36 in.** in both projection and width. Wells deeper than 44 in. need a permanent ladder (rungs ≥ 12 in. wide, ≤ 18 in. o.c.). | ⚠️ |

Size escape windows from the manufacturer's **net clear opening** data, not the rough opening. Casements meet the area at a smaller size than double-hung or sliding windows. Escape openings must work from inside without keys or tools, and window opening control devices must comply with ASTM F2090.

## Doors, halls, stairs, ramps

| Rule | Requirement | Basis |
|---|---|---|
| C-DOOR-1 | At least one side-hinged egress door: ≥ **32 in.** clear width (face of door to stop, door open 90°) and ≥ **78 in.** clear height. The egress path must not pass through the garage. | ⚠️ |
| C-DOOR-2 | A landing on each side of exterior doors, ≥ **36 in.** in the direction of travel, sloped ≤ 2%. At the required egress door it is ≤ **1½ in.** below the threshold, or ≤ 7¾ in. where the door does not swing over it. | ⚠️ |
| C-HALL-1 | Hallway ≥ **36 in.** clear | ⚠️ |
| C-STAIR-1 | Width ≥ **36 in.** Handrails may project ≤ 4½ in. each side, leaving ≥ 31½ in. between one rail and the far wall, or ≥ 27 in. with rails on both sides. | ✅ |
| C-STAIR-2 | Riser ≤ **7¾ in.** | ✅ |
| C-STAIR-3 | Tread ≥ **10 in.**; nosing **¾–1¼ in.** No nosing is required at treads ≥ 11 in. | ✅ / ⚠️ |
| C-STAIR-4 | Headroom ≥ **6′-8″**, measured vertically from the sloped nosing line. | ✅ |
| C-STAIR-5 | Handrail on at least one side of any flight with ≥ **4 risers**, **34–38 in.** above the nosings, continuous, with ends returned. Graspable: round **1¼–2 in.** diameter, or non-circular with a 4–6¼ in. perimeter. | ✅ |
| C-STAIR-6 | Landings ≥ **36 in.** deep, as wide as the stair, at the top and bottom of each flight. The top landing may be omitted on an interior stair with no door swinging over it. | ✅ / ⚠️ |
| C-STAIR-7 | Risers and treads uniform within **⅜ in.** in a flight; max rise between landings **151 in.**; winders **10 in.** deep at the walkline (12 in. from the narrow side) and ≥ **6 in.** at any point. Spiral stairs: 26 in. clear, ≤ 9½ in. risers, 6′-6″ headroom. | ✅ / ⚠️ |
| C-RAMP-1 | Slope ≤ **1:12** at the required egress door and ≤ **1:8** elsewhere. Landings ≥ 36 in.; handrail where the slope is steeper than 1:12. | ⚠️ |

**Stair arithmetic, done before the plan is fixed:**

```
risers  = ceil(floor_to_floor / 7.75)
riser   = floor_to_floor / risers                       (check ≤ 7.75)
treads  = risers − 1                                    (straight flight)
run     = treads × tread_depth                          (10–11 in. typical)
footprint length ≈ run + 36 in. landing at the top + 36 in. at the bottom
headroom: 6′-8″ above every nosing, so the floor opening above runs long enough
```

Worked example: a 9 ft plate with a 12 in. floor gives a 121 in. floor-to-floor. That needs 16 risers of 7.56 in. and 15 treads of 10.5 in., a 157.5 in. (13′-1½″) run. Add both landings and the stair takes **about 19 ft** of straight plan length. A plan that gives the stair 10 ft will fail C-STAIR-6. AI-drawn plans get this wrong more often than anything else in this list.

## Guards, fall protection, safety glazing

| Rule | Requirement | Basis |
|---|---|---|
| C-GUARD-1 | Required where the surface is > **30 in.** above the floor or grade below, measured anywhere within 36 in. of the edge. Height ≥ **36 in.**, or ≥ **34 in.** on the open sides of stairs measured from the nosing line. Openings must stop a **4 in.** sphere (4⅜ in. on stair sides; 6 in. at the tread–riser–rail triangle). | ✅ |
| C-GUARD-2 | An operable window with a sill **< 24 in.** above the floor and **> 72 in.** above grade outside must not pass a 4 in. sphere, or must have ASTM F2090 fall-prevention or opening-control devices. Opening-control devices must still allow the escape opening. The 36 in. figure sometimes quoted is the IBC value, not the IRC. | ⚠️ |
| C-GLAZ-1 | Safety glazing is required in these hazardous locations: (1) glass in doors; (2) glass within a 24 in. arc of either door edge with its bottom < 60 in. above the floor; (3) panes > 9 sq ft with bottom < 18 in., top > 36 in., and a walking surface within 36 in.; (4) guards and railings; (5) tub, shower and pool enclosures with bottom < 60 in. above the standing surface; (6) glass within 36 in. of a stair or ramp with bottom < 36 in. above the walking surface; (7) glass within a 60 in. arc of the bottom-stair nosing with bottom < 36 in. above the landing. Tag each one in the window schedule (D-SCHED-1). | ⚠️ |

## Fire separations, garages, alarms

| Rule | Requirement | Basis |
|---|---|---|
| C-GAR-1 | Garage-to-dwelling separation: **½ in. gypsum** on the garage side of walls and of the garage ceiling below the house's attic; **⅝ in. Type X** on the garage ceiling under habitable rooms, with ½ in. gypsum on the structure supporting it. Door into the house: **1⅜ in. solid wood or steel, or 20-minute rated**. Self-closing where adopted. Ducts penetrating the separation must be ≥ No. 26 gauge steel with no openings into the garage. This separation is not a fire-resistance-rated assembly. | ✅ / ⚠️ |
| C-GAR-2 | No opening from the garage directly into a sleeping room. This includes windows (G-WIN-1 catches them). | ✅ |
| C-SEP-1 | Townhouses: two 1-hr walls, or a common wall rated 1-hr if sprinklered and 2-hr if not, continuous from the foundation to the roof sheathing, with 30 in. parapets or the roof-protection alternative. Two-family dwellings: a 1-hr wall and floor separation (½-hr if sprinklered). | ⚠️ |
| C-ALARM-1 | Smoke alarm in **every sleeping room** and on **every story**, including basements and habitable attics. Interconnected, hard-wired with battery backup. | ⚠️ |
| C-ALARM-2 | Smoke alarm **outside each sleeping area**, near the bedrooms. Keep alarms ≥ 3 ft from a bathroom door. From cooking appliances: ionization ≥ 20 ft, photoelectric ≥ 6 ft. The 2024 edition changes some locations; check the adopted text. | ⚠️ |
| C-ALARM-3 | CO alarm **outside each sleeping area** when the house has a fuel-fired appliance or an attached garage with an opening into the dwelling. Also inside any bedroom that contains, or whose bath contains, a fuel-burning appliance. | ✅ / ⚠️ |

**Sprinklers.** The model IRC requires them in new one- and two-family dwellings and townhouses (R313). Most states have removed the one- and two-family requirement, and a few, including California and Maryland, keep it. Record the local status in the brief. Sprinklering changes several rules: R302.1(2), townhouse ratings and basement escape exceptions (⚠️).

## Baths and access

| Rule | Requirement | Basis |
|---|---|---|
| C-BATH-1 | Toilet, lavatory or bidet: ≥ **15 in.** from centerline to any side wall, partition or vanity; ≥ **30 in.** center-to-center between fixtures; ≥ **21 in.** clear in front. | ⚠️ |
| C-BATH-2 | Shower ≥ **900 sq in.** and able to contain a **30 in.** circle (or ≥ 25 in. minimum dimension with ≥ 1,300 sq in.). Opening ≥ 22 in. clear. Hinged doors swing out. Valve limited to 120 °F. Walls nonabsorbent to 6 ft. | ⚠️ |
| C-ACCESS-1 | Attic access ≥ **22×30 in.** where the attic has ≥ 30 in. of headroom over ≥ 30 sq ft, with 30 in. of headroom above the opening. If an appliance sits in the attic, the opening must fit the largest appliance, with a ≤ 20 ft passage 24 in. wide and a 30×30 in. service space. Crawlspace access ≥ **18×24 in.** through the floor, ≥ **16×24 in.** through the wall. | ⚠️ |

These are code floors. Design to the NKBA targets in SP-BATH-1 instead.

## Energy baseline (IECC)

Prescriptive envelope values step with the **climate zone** (0–8, hot to cold, plus A moist / B dry / C marine), which is assigned by county (IECC Table R301.1). Record the zone in the brief. The table below is **IECC 2021 Table R402.1.3 (⚠️ verify before use)**. The 2024 IECC is believed to carry most envelope values forward and adds an efficiency-credit requirement.

| CZ | Window U | Skylight U | SHGC | Ceiling R | Wood wall R | Floor R | Basement wall R | Slab R, depth |
|---|---|---|---|---|---|---|---|---|
| 0–1 | 0.50 | 0.75 | 0.25 | 30 | 13 or 0+10ci | 13 | 0 | 0 |
| 2 | 0.40 | 0.65 | 0.25 | 49 | 13 or 0+10ci | 13 | 0 | 0 |
| 3 | 0.30 | 0.55 | 0.25 | 49 | 20 or 13+5ci or 0+15ci | 19 | 5ci or 13 | 10ci, 2 ft |
| 4 (exc. 4C) | 0.30 | 0.55 | 0.40 | 60 | 20+5ci or 13+10ci or 0+15ci | 19 | 10ci or 13 | 10ci, 4 ft |
| 5 and 4C | 0.30 | 0.55 | NR | 60 | 20+5ci or 13+10ci or 0+15ci | 30 | 15ci or 19 or 13+5ci | 10ci, 4 ft |
| 6 | 0.30 | 0.55 | NR | 60 | 20+5ci or 13+10ci or 0+15ci | 30 | 15ci or 19 or 13+5ci | 10ci, 4 ft |
| 7–8 | 0.30 | 0.55 | NR | 60 | 20+5ci or 13+10ci or 0+15ci | 38 | 15ci or 19 or 13+5ci | 10ci, 4 ft |

Air leakage: see E-AIR-1. Many states still use IECC 2015 or 2018, so use the adopted edition.

## Accessibility

Private one- and two-family homes are generally **not** covered by the Fair Housing Act's design rules, which apply to buildings with 4+ units occupied after March 13, 1991, or by the ADA. Local visitability ordinances or funding programs can change that (⚠️). The playbook therefore treats accessibility as a **per-project design tier** (SP-UD-3), chosen in the brief, and not as a code check.

---

Sources: research notes at [irc_code_baseline.md](../research/research_notes/Residential%20design%20standards%20baseline/irc_code_baseline.md). Primary texts to verify against: ICC Digital Codes (IRC and IECC 2021/2024), the AHJ's adoption ordinance, and NFPA 72 for alarms.
