# 03 · Structure and buildability

The goal is a house that a framer can build from the plan without an engineer redesigning it. Under the IRC's prescriptive path, structure is mostly geometry: walls that line up, spans that fit tables, and enough solid wall to brace against wind and earthquake. This chapter turns those into layout rules Claude applies while it models.

> Nothing here sizes members for construction. Span and header figures are for **planning**, so the geometry leaves room for structure. Final sizes come from the code tables for the actual species, grade and loads, from manufacturer tables for engineered products, or from an engineer (S-ENG-1).

## S-PATH-1: a continuous load path

Every load needs a route to the ground: roof → rafters or trusses → bearing walls or beams → posts → floor framing → foundation → footing → soil. At schematic design, Claude should be able to name the route for every bearing element. If a beam or post has nothing under it, the design is not finished.

Wind uplift and lateral loads follow the same rule in reverse. Roof-to-wall connectors, wall-to-floor ties and hold-downs at braced panels exist because a load path has to resist pulling apart as well as pushing down.

## S-STACK-1 / S-STACK-2: stack everything

- **Upper floors over lower floors** (S-STACK-1, auto). The checker warns when an upper room has no room below it. Cantilevers and overhangs are possible but have to be deliberate: within prescriptive limits, or engineered. In SDC D0–D2, cantilevers with less than a 2:1 back-span are an irregularity that triggers engineering.
- **Bearing walls over bearing walls**, and posts over posts down to the footing. Offset bearing walls create transfer loads, and transfers mean beams, engineering and cost.
- **Wet walls over wet walls** (with M-CORE-1). Stacked plumbing walls make short vertical runs.
- **Advanced framing** uses single top plates, which require roof, floor and wall framing stacked within 1 in. Plan on the module (S-MOD-1) and stacking comes almost for free.

## S-BRACE-1: braced wall lines

Exterior walls and some interior lines resist lateral loads through braced wall panels: lengths of wall sheathed in a listed way, with no openings. Prescriptive limits (R602.10):

- Braced wall panels are at most **25 ft on center** along a braced wall line.
- The first panel starts within **12.5 ft** of each end of the line. Some methods in SDC D0–D2 require **10 ft**.
- The amount of bracing scales with wind speed, seismic category, wall length and stories. Use the code tables, or have an engineer design it.

**What this means for design.** A wall that is mostly glass, or a corner opened up with windows on both faces, takes away the panels the prescriptive path relies on. That doesn't make it impossible: portal frames, engineered shear walls and steel moment frames all work. It does mean S-ENG-1 applies. Before committing to window-wall corners, mark the solid wall left on each elevation.

## S-SPAN-1: spans that fit

Planning figures for floors (40 psf live + 10 psf dead, L/360). Source: 2021 IRC Table R502.3.1(2) for Douglas fir-larch No. 2, with bending governing.

| Member at 16 in. o.c. | Approx. max span | Use when |
|---|---|---|
| 2×8 | about 13 ft | short spans, porches |
| 2×10 | **15′-7″** | rooms up to about 15 ft |
| 2×12 | **18′-1″** | rooms up to about 18 ft |
| I-joist 9½ / 11⅞ / 14 / 16 in. deep | manufacturer tables (designed to L/480, stiffer) | most new floors; longer and flatter spans |
| Open-web floor truss | manufacturer, often 20 ft and up | long spans, ducts run through the web |

The checker flags any room more than **16 ft** clear under a floor above (auto). That is the point where a dimensional 2×10 at 16 in. o.c. runs out. Resolve each flag with a bearing line or beam, deeper or engineered joists, or an engineer, and record which on the room (`beam:`) and in `DECISIONS.md`.

**Floor depth sets the stairs.** Joist depth plus subfloor plus finish is the floor thickness, and it changes floor-to-floor height and so the riser count (C-STAIR-2). Fix the floor system before fixing the stair.

## S-HEADER-1: headers

Openings in bearing walls need headers sized from Table R602.7(1) by building width, ground snow load and what the header carries. For one exterior bearing wall carrying roof and ceiling at 30 psf ground snow, a double 2×10 spans about:

| Building width | 12 ft | 24 ft | 36 ft |
|---|---|---|---|
| Double 2×10 header span | about 9′-0″ | about 6′-10″ | about 5′-9″ |

Wide openings in bearing walls, such as sliders, garage doors and window walls, generally need engineered headers: LVL, glulam or steel, sized by an engineer or the manufacturer. In walls that carry no load, a single flat or insulated header is enough (advanced framing).

## S-ROOF-1 to S-ROOF-3: roofs

- **Trusses** (S-ROOF-1, auto) are the economical default. They clear-span the house so interior walls can move. The checker flags spans over 40 ft. Trusses limit attic space and vaulted ceilings unless you specify scissor or attic trusses.
- **Rafters with ceiling joists or rafter ties** let a ridge board work. **Cathedral or vaulted rafters without ties need a structural ridge beam**, supported at both ends down to the foundation (S-ROOF-2, auto when `cathedral: true`).
- **Pitch versus material** (S-ROOF-3):

| Roofing | Minimum slope | Notes |
|---|---|---|
| Asphalt shingles | 2:12 | double (low-slope) underlayment from 2:12 to below 4:12 |
| Standing-seam metal | per manufacturer (some to about ½:12–3:12) | use the listed slope ⚠️ |
| Membrane (TPO, EPDM, mod-bit) | low-slope, ¼:12 drainage | not for steep pitches |
| Tile, slate, wood shakes | typically ≥ 3:12–4:12 ⚠️ | heavy; check framing |

- **Complexity costs money.** Every valley, hip, dormer and pitch change adds labor and adds leak risk. Simple gable or hip roofs at or below about 6:12 are the cost-efficient default. Steeper pitches belong to a style (styles/) or to a deliberate living space in the attic.

## S-MOD-1: the 2 ft module

Lay out exterior dimensions in **2 ft increments**, and use 4 ft where you can. That fits 16 and 24 in. o.c. framing and 4×8 sheathing, subfloor and drywall, so less material is cut and wasted. Inside the shell, rooms can be any size. The module governs the shell, the grid and the openings.

## S-PLATE-1: plate heights and wall build-ups

| Wall | Precut stud | Approx. wall height | Notes |
|---|---|---|---|
| 8 ft | 92⅝ in. | 97⅛ in. | economical; tight for 9 ft ceilings |
| 9 ft | 104⅝ in. | about 109 in. | common new-house default |
| 10 ft | 116⅝ in. | about 121 in. | where stocked |

- Prescriptive limits: story height up to **11′-7″** and bearing studs up to **10 ft** (S-ENG-1 beyond those).
- Typical schematic wall thicknesses: exterior 2×6 + sheathing + gypsum ≈ **6½ in.**, or more with continuous exterior insulation. Interior 2×4 + gypsum both sides ≈ **4½ in.** Plumbing walls with a 3 in. vent need 2×6 ≈ **6½ in.**

## S-FDN-1: foundations

| Type | Cost | Good for | Watch |
|---|---|---|---|
| Slab-on-grade | lowest | mild frost, flat sites, single-level living | plumbing locked in the slab; capillary break and sub-slab insulation (E-RAIN-1, E-INSUL-1) |
| Crawlspace | moderate | sloped sites, access to services | prefer sealed and conditioned to vented; ≥ 18 in. to wood (decay rules) |
| Basement | highest | deep frost (footings go deep anyway), steep sites, extra space | waterproofing, escape openings (C-EGR-1), radon |

- Footings sit **below the frost line** and are at least **12 in. wide × 6 in. thick**. Width scales with soil bearing and stories: at the 1,500 psf default, about 12 in. for one story and about 15–16 in. for two (R403.1).
- **Grade falls 6 in. in the first 10 ft** away from the foundation, and paving within 10 ft slopes 2% (R401.3).
- Soil reports, expansive clay, high water tables, steep slopes and retaining walls all mean engineering (S-ENG-1).

## S-ENG-1: when an engineer is required

Bring in a licensed engineer, or a truss or engineered-lumber designer for their components, when any of these apply:

- Wind: ultimate design wind speed **≥ 140 mph**, or **≥ 130 mph** in hurricane-prone regions. Use an engineered design, WFCM or ICC 600.
- Seismic: SDC **D0–D2** with irregularities such as offset shear walls, large cantilevers or tall cripple walls, or SDC C for townhouses.
- A story taller than 11′-7″, bearing studs longer than 10 ft, or spans or loads beyond the code tables.
- Transfer beams, point loads not over a post-and-footing line, steel beams or columns, and moment frames.
- Large cantilevers, or "floating" corners with glass on both faces.
- Retaining walls, poor soils, steep sites, and flood or coastal zones.
- Anything Claude cannot trace under S-PATH-1.

When a trigger applies, Claude still models the design intent. It flags the element in `DECISIONS.md` as **"engineer to confirm"** and does not present a size as final.

## S-SIMPLE-1: massing that costs less

Builder and building-science sources agree on the levers, even though nobody publishes a percentage you can trust:

- A compact footprint, close to a square or a simple rectangle. Every extra corner adds framing, flashing, foundation and leak risk.
- Stacked floors. A two-story box has less foundation and roof per square foot than a sprawling single story.
- A simple roof at or below about 6:12, with few valleys and dormers.
- Standard spans and plate heights. A long clear span can wipe out the savings of a simple box.

These are defaults. A courtyard plan, an L for a sheltered outdoor room, or a deliberate cross-gable can be worth the cost. Make that choice on purpose and record it.

---

Sources: research notes at [structure_and_building_science.md](../research/research_notes/Residential%20design%20standards%20baseline/structure_and_building_science.md). They cite IRC 2021 R301.2.2.6, R401.3, R403.1, R502.3.1(2), R602.7(1), R602.10 and R802, American Wood Council, APA, and the NAHB/Building America advanced-framing guides.
