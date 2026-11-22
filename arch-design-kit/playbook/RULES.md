# The rulebook

Every rule the playbook holds a design to, one line each, with a stable ID. Reviews, checklists, decision logs and the checker all cite these IDs ("fails C-EGR-2", "accepted deviation from SP-KIT-2, see D-004"). The chapters give the reasons, tables and edge cases. This page is the index.

**How to read the columns**

- **Kind.** *Code* is a legal minimum under the US IRC baseline: never go below it. *Practice* is a professional standard or guideline (NKBA, NCS, BIMForum, building science) that the playbook adopts as its default. *Thumb* is a rule of thumb: deviate when you can say why. *Method* is how Claude works.
- **Basis.** ✅ means the value was confirmed against cited sources during the research. Most of those were secondary sources (city handouts, ICC and NAHB training decks), so confirm them against the adopted code text before construction documents. ⚠️ means the value comes from expert knowledge of the code text but was not confirmed against a source. It is believed correct, and it is queued for verification in [VERIFY.md](VERIFY.md).
- **Auto.** ● means `tools/check_design.py` checks the rule on every run. ○ means a person, or Claude reviewing against a checklist, checks it.

Section numbers are IRC **2021**. The 2024 IRC renumbered much of Chapter 3, so always quote the section *title* as well. The crosswalk is in [02-code-baseline.md](02-code-baseline.md#edition-crosswalk-2021--2024).

**Precedence:** Authority Having Jurisdiction (local amendments) > this rulebook's Code rules > Practice > Thumb. Where an AHJ is stricter, override the limit in the project spec (`limits:`) and record why in `DECISIONS.md`.

---

## P — Foundation principles ([01-foundation.md](01-foundation.md))

| ID | Rule | Kind | Auto |
|---|---|---|---|
| P-ORDER-1 | When goals conflict, resolve them in this order: life safety and code, structure and weather, function, comfort and climate, cost and buildability, style. A lower priority never buys a higher one. | Method | ○ |
| P-PROG-1 | Draw nothing until there is a program: rooms, target areas and adjacencies. | Method | ○ |
| P-ZONE-1 | Zone the plan public to private (Pattern 127, Intimacy Gradient), and cluster the service rooms. | Practice | ○ |
| P-ENTRY-1 | Give the entry a transition: shelter, a landing, a drop zone, and no direct view into private rooms (Pattern 112). | Practice | ○ |
| P-LIGHT-1 | Light main rooms from two sides where possible (Pattern 159). Keep usable floor within about 2× the window-head height of glazing. | Practice | ○ |
| P-ORIENT-1 | Face living spaces, main glazing and outdoor rooms toward the sun (south, north of the equator; Pattern 105). Minimize west glass. | Practice | ○ |
| P-FORM-1 | Give the design one ordering idea: axis, grid or datum, with aligned openings, a small family of window sizes, and a clear hierarchy of spaces. | Practice | ○ |
| P-SCALE-1 | Keep spaces at human scale: ceiling height in proportion to the room, and alcoves and ceiling changes to make places inside open plans (Pattern 179). | Practice | ○ |
| P-SIMPLE-1 | Build better, not bigger: every room earns daily use or does double duty. | Practice | ○ |
| P-OUT-1 | Every main living space opens to a usable outdoor room at least 6 ft deep. | Thumb | ○ |
| P-PRIV-1 | No window looks straight into a neighbor's window, and no bathroom is visible from the entry or living spaces. | Practice | ○ |
| P-STYLE-1 | Style is a layer. A style module changes expression only and never overrides a C, S, E, M or SP rule. | Method | ○ |

## Z — Zoning and site ([02-code-baseline.md](02-code-baseline.md#zoning-and-site))

| ID | Rule | Kind | Basis | Auto |
|---|---|---|---|---|
| Z-INPUT-1 | Collect the zoning inputs before massing: district and use, setbacks and encroachments, height and how it is measured, coverage, FAR, parking, overlays, easements, HOA. | Practice | ✅ | ○ |
| Z-SETBACK-1 | Every room's footprint sits inside the setbacks. Check projections such as eaves, bays and stairs separately. | Code (local) | ✅ | ● |
| Z-FSD-1 | Fire separation distance under 5 ft requires a 1-hr wall. Openings are not allowed under 3 ft and are limited to 25% of the wall area from 3 to 5 ft. Projections are not allowed under 2 ft. (R302.1, unsprinklered; amendments common) | Code | ✅ | ○ |

## C — Life-safety and code minimums ([02-code-baseline.md](02-code-baseline.md))

| ID | Rule | Kind | Basis | Auto |
|---|---|---|---|---|
| C-ROOM-1 | Habitable rooms are at least 70 sq ft (R304.1). | Code | ✅ | ● |
| C-ROOM-2 | Habitable rooms are at least 7 ft in every horizontal dimension; kitchens are exempt (R304.2). | Code | ✅ | ● |
| C-CEIL-1 | Ceilings are at least 7 ft in habitable rooms and halls, and at least 6 ft 8 in. in baths, toilet rooms and laundry rooms (R305.1). | Code | ✅ | ● |
| C-CEIL-2 | Sloped ceilings: area under 5 ft does not count, and half the required area must be at least 7 ft. Beams and ducts may drop to 6 ft 4 in. in basements (R305.1, R305.1.1). | Code | ✅ | ○ |
| C-LIGHT-1 | Habitable rooms have glazing of at least 8% of the floor area and openable area of at least 4%, unless they meet the light and ventilation exceptions (R303.1). | Code | ⚠️ | ● |
| C-LIGHT-2 | Bathrooms have 3 sq ft of glazing, half of it openable, or exhaust of 50 cfm intermittent or 20 cfm continuous (R303.3). | Code | ⚠️ | ○ |
| C-EGR-1 | Every sleeping room, and every basement or habitable attic, has an emergency escape opening (R310.1). | Code | ⚠️ | ● |
| C-EGR-2 | The escape opening's net clear area is at least 5.7 sq ft, or 5.0 sq ft at the grade floor (R310.2.1). | Code | ✅ | ● |
| C-EGR-3 | The net clear opening is at least 24 in. high and 20 in. wide. A 20 in. width needs about 42 in. of height to reach the area (R310.2.1). | Code | ✅ | ● |
| C-EGR-4 | The sill is no more than 44 in. above the finished floor (R310.2.2). | Code | ✅ | ● |
| C-EGR-5 | Window wells are at least 9 sq ft and 36 in. each way. A well deeper than 44 in. needs a ladder (R310.4). | Code | ⚠️ | ○ |
| C-DOOR-1 | Each dwelling has at least one side-hinged egress door, at least 32 in. clear wide and 78 in. clear high, and its path does not pass through the garage (R311.1–R311.2). | Code | ⚠️ | ● |
| C-DOOR-2 | Exterior doors have a landing at least 36 in. deep on each side, at most 1½ in. below the threshold at the required egress door (R311.3). | Code | ⚠️ | ○ |
| C-HALL-1 | Hallways are at least 36 in. wide (R311.6). | Code | ⚠️ | ● |
| C-STAIR-1 | Stairs are at least 36 in. wide (R311.7.1). | Code | ✅ | ● |
| C-STAIR-2 | Risers are at most 7¾ in.; riser count = ceil(floor-to-floor ÷ 7.75) (R311.7.5.1). | Code | ✅ | ● |
| C-STAIR-3 | Treads are at least 10 in., with a ¾–1¼ in. nosing; no nosing is needed when the tread is 11 in. or more (R311.7.5.2–.3). | Code | ✅ | ● |
| C-STAIR-4 | Headroom is at least 6 ft 8 in., measured above the nosing line (R311.7.2). | Code | ✅ | ● |
| C-STAIR-5 | A flight with 4 or more risers has a handrail 34–38 in. high with a graspable profile, 1¼–2 in. round (R311.7.8). | Code | ✅ | ● |
| C-STAIR-6 | The stair's run, plus a landing at least 36 in. deep at top and bottom, fits the space drawn for it (R311.7.6). | Code | ✅ | ● |
| C-STAIR-7 | Risers and treads are uniform within ⅜ in., the rise between landings is at most 151 in., and winders are 10 in. at the walkline and 6 in. minimum (R311.7). | Code | ✅/⚠️ | ○ |
| C-RAMP-1 | Ramps are at most 1:12 at the required egress door and 1:8 elsewhere, with 36 in. landings (R311.8). | Code | ⚠️ | ○ |
| C-GUARD-1 | A surface more than 30 in. above the grade or floor below has a guard at least 36 in. high (34 in. on stair sides) that a 4 in. sphere cannot pass (R312.1). | Code | ✅ | ● |
| C-GUARD-2 | An operable window with a sill under 24 in. and more than 72 in. above grade gets fall protection (R312.2). | Code | ⚠️ | ● |
| C-GLAZ-1 | Hazardous locations get safety glazing: doors, within 24 in. of a door edge, large low panes, wet areas, and glazing near stairs and at the bottom landing (R308.4). | Code | ⚠️ | ○ |
| C-GAR-1 | The garage separation is ½ in. gypsum on the garage side, with ⅝ in. Type X under habitable rooms, and a 1⅜ in. solid or 20-minute door into the house (R302.5–R302.6). | Code | ✅ | ● |
| C-GAR-2 | No garage opening leads directly into a sleeping room (R302.5.1). | Code | ✅ | ● |
| C-ALARM-1 | There is a smoke alarm in every sleeping room and on every story (R314.3). | Code | ⚠️ | ● |
| C-ALARM-2 | There is a smoke alarm outside each sleeping area, near the bedrooms (R314.3). | Code | ⚠️ | ● |
| C-ALARM-3 | A home with a fuel-fired appliance, or an attached garage opening into the house, has CO alarms outside each sleeping area (R315). | Code | ✅ | ● |
| C-BATH-1 | Each toilet has at least 15 in. from its centerline to a side wall or fixture and at least 21 in. clear in front (R307.1, P2705.1). | Code | ⚠️ | ● |
| C-BATH-2 | Showers are at least 900 sq in. and hold a 30 in. circle (P2708.1). | Code | ⚠️ | ● |
| C-ACCESS-1 | The attic access is at least 22×30 in. The crawlspace access is at least 18×24 in. through the floor or 16×24 in. through the wall (R807.1, R408.4). | Code | ⚠️ | ○ |
| C-SEP-1 | Townhouses are separated by two 1-hr walls or a common wall (1-hr sprinklered, 2-hr not). Two-family dwellings have a 1-hr separation (R302.2–R302.3). | Code | ⚠️ | ○ |

## S — Structure and buildability ([03-structure-and-buildability.md](03-structure-and-buildability.md))

| ID | Rule | Kind | Basis | Auto |
|---|---|---|---|---|
| S-PATH-1 | Trace a continuous load path from roof to footing for every bearing wall, beam and post. | Practice | ✅ | ○ |
| S-STACK-1 | Upper floors sit over the floors below. Flag every cantilever or overhang. | Thumb | ✅ | ● |
| S-STACK-2 | Stack bearing walls, posts and wet walls vertically. Advanced framing with single top plates needs framing stacked within 1 in. | Practice | ✅ | ○ |
| S-BRACE-1 | Braced wall panels are at most 25 ft on center along each braced wall line, and the first one starts within 12.5 ft of each end. Keep solid wall at corners (R602.10). | Code | ✅ | ○ |
| S-SPAN-1 | Floor spans fit their framing. A DF-L No. 2 2×10 at 16 in. spans about 15′-7″ and a 2×12 about 18′-1″ (R502.3.1(2)). Beyond 16 ft, plan a beam or engineered joists. | Code | ✅ | ● |
| S-HEADER-1 | Headers come from R602.7(1) by building width and snow load. Long openings in bearing walls get engineered headers. | Code | ✅ | ○ |
| S-ROOF-1 | Roof trusses span at most about 40 ft unless the truss designer confirms longer. | Thumb | ⚠️ | ● |
| S-ROOF-2 | Rafters without ceiling joists or rafter ties need a supported ridge beam, engineered (R802). | Code | ✅ | ● |
| S-ROOF-3 | Roof pitch suits the material. Asphalt shingles need at least 2:12, with double underlayment from 2:12 to 4:12. Below 2:12, use membranes or listed metal. | Code | ✅ | ○ |
| S-MOD-1 | Plan exterior dimensions on a 2 ft module, framed at 16 or 24 in. o.c. on 4×8 sheets. | Thumb | ✅ | ○ |
| S-PLATE-1 | Plate heights come from precut studs: 8, 9 or 10 ft. Stories are at most 11′-7″ and bearing studs at most 10 ft under the prescriptive path. | Code | ✅ | ○ |
| S-FDN-1 | Footings are below frost depth and at least 12 in. wide by 6 in. thick. Grade falls 6 in. in the first 10 ft (R401.3, R403.1). | Code | ✅ | ○ |
| S-ENG-1 | Get an engineer when a design leaves the prescriptive path: high wind, SDC D irregularity, tall walls, long spans, transfers, big cantilevers, steel, or retaining walls. | Code | ✅ | ○ |
| S-SIMPLE-1 | Default to a compact footprint with few corners, stacked floors and a simple roof at or below about 6:12. | Thumb | ✅ | ○ |

## E — Envelope and climate ([04-envelope-climate-mep.md](04-envelope-climate-mep.md))

| ID | Rule | Kind | Basis | Auto |
|---|---|---|---|---|
| E-LAYERS-1 | Make the water, air, vapor and thermal control layers each continuous, in that order of importance. Draw them in every wall, roof and slab section. | Practice | ✅ | ○ |
| E-AIR-1 | Air leakage is at most 3.0 ACH50 in climate zones 3–8 and 5.0 in zones 0–2 (IECC 2021). The playbook targets at most 2.0. | Code | ✅ | ○ |
| E-INSUL-1 | Insulation and window U-factors meet the IECC prescriptive table for the climate zone. | Code | ⚠️ | ○ |
| E-VAPOR-1 | Vapor retarders follow R702.7: Class I or II on the interior in zones 5–8 and Marine 4, with Class III allowed under the listed conditions. | Code | ✅ | ○ |
| E-FLASH-1 | Flash every opening: sloped or back-dammed sill pan, shingle-lapped WRB, head flashing. | Practice | ✅ | ○ |
| E-ATTIC-1 | Vented attics have 1/150 net free area, or 1/300 when balanced high and low. Unvented attics have air-impermeable insulation per R806.5. | Code | ✅ | ○ |
| E-SUN-1 | Size south overhangs from solstice sun angles at the site latitude, and shade east and west glass. | Practice | ✅ | ○ |
| E-WWR-1 | Use window-to-wall ratio deliberately. The Phius prescriptive cap of 18%, with 3% skylights, is the upper bound for an envelope-first design. | Thumb | ✅ | ○ |
| E-RAIN-1 | Put a drained rainscreen gap behind cladding in wet climates, and a capillary break under slabs and on footings. | Practice | ⚠️ | ○ |

## M — MEP planning ([04-envelope-climate-mep.md](04-envelope-climate-mep.md#mep-planning))

| ID | Rule | Kind | Basis | Auto |
|---|---|---|---|---|
| M-CORE-1 | Stack wet rooms back to back, and place the water heater centrally (at most 0.5 gal of piping to any fixture is the ZERH target). | Practice | ✅ | ○ |
| M-DUCT-1 | Keep all ducts inside conditioned space, and size the mechanical room and chases at schematic design. | Practice | ✅ | ○ |
| M-ELEC-1 | The electrical panel has working space 30 in. wide, 36 in. deep and 6½ ft high (NEC 110.26), and is not in a bathroom, a clothes closet or over stairs. | Code | ✅/⚠️ | ○ |
| M-DRYER-1 | Dryer exhaust is at most 35 ft equivalent length, less 5 ft per 90° and 2.5 ft per 45° (M1502.4.5.1), so put the laundry on an exterior wall. | Code | ✅ | ○ |
| M-VENT-1 | Bath exhaust is 50 cfm intermittent or 20 cfm continuous, and kitchen exhaust 100 or 25. A tight house (under 5 ACH50) gets whole-house ventilation (M1505). | Code | ⚠️ | ○ |

## SP — Space planning ([05-space-planning.md](05-space-planning.md))

| ID | Rule | Kind | Basis | Auto |
|---|---|---|---|---|
| SP-SIZE-1 | Plan rooms to the playbook's target sizes, not the code minimums. | Thumb | — | ○ |
| SP-KIT-1 | Kitchen work aisles are at least 42 in. for one cook and 48 in. for two (NKBA). | Practice | ⚠️ | ● |
| SP-KIT-2 | The work triangle totals at most 26 ft, with legs of 4–9 ft and no traffic through it. Provide the landing areas and keep the dishwasher within 36 in. of the sink (NKBA). | Practice | ⚠️ | ○ |
| SP-BATH-1 | Baths meet NKBA targets: 30 in. in front of the toilet (48 in. ideal), 18 in. to its centerline, 36×36 in. showers, and 30×48 in. clear at fixtures. | Practice | ⚠️ | ○ |
| SP-CIRC-1 | Circulation is about 10–15% of net area. Look hard above 20%. | Thumb | ✅ | ● |
| SP-STOR-1 | Storage: a coat closet at each entry, linen near the baths, a 24 in. deep closet in every bedroom, a pantry, and a drop zone. | Thumb | — | ○ |
| SP-FURN-1 | Furnish every room in the plan. Clearances come from the furniture, not the walls. | Practice | — | ○ |
| SP-DOOR-1 | Doors swing into rooms, never into halls or into each other, and leave furniture walls intact. | Practice | — | ○ |
| SP-UD-1 | With universal design on, use 36 in. doors (about 34 in. clear) throughout. | Practice | ⚠️ | ● |
| SP-UD-2 | With universal design on, there is a 60 in. turning circle in at least one entry-level bath. | Practice | ⚠️ | ● |
| SP-UD-3 | Choose an accessibility tier per project. *Visitable*: zero-step entry, 32 in. clear doors, an entry-level half bath. *Aging in place*: adds an entry-level primary suite and a curbless shower. | Practice | ⚠️ | ○ |
| SP-GAR-1 | A two-car garage is at least 22×22 ft and comfortably 24×24 ft, and the route from garage to kitchen passes a drop zone. | Thumb | — | ○ |

## D — Drawing and model standards ([06-drawing-and-model-standards.md](06-drawing-and-model-standards.md))

| ID | Rule | Kind | Basis | Auto |
|---|---|---|---|---|
| D-UNITS-1 | Every spec, model and drawing declares its units. Imperial work is inches inside and ft-in on display. Never mix units. | Method | ✅ | ● (G-UNITS-1) |
| D-AXES-1 | Plan axes: +x east, +y north, origin at the south-west corner, z at finished floor. A rect is the net room size. | Method | — | ○ |
| D-LOD-1 | Model detail follows the phase: LOD 100 programming, 100–200 schematic design, 200–300 design development, 300–350 construction documents (BIMForum 2025). | Practice | ✅ | ○ |
| D-IFC-1 | IFC follows the Project > Site > Building > Storey > Space tree. Each element sits in exactly one storey, with Pset_*Common filled. | Practice | ✅ | ○ |
| D-SHEET-1 | Sheet IDs follow NCS: discipline, type digit, sequence (A-101). Set order: general, civil, architectural, structural, MEP. | Practice | ✅ | ○ |
| D-LAYER-1 | Layer and category names follow AIA/NCS: A-WALL, A-DOOR, A-GLAZ, A-FLOR, A-ANNO-DIMS. | Practice | ✅ | ○ |
| D-SCALE-1 | Plans are 1/4″ = 1′-0″ (1:48), site and overall 1/8″ (1:96), details 1½″ (1:8) and up. Every sheet carries a graphic scale and a north arrow. | Practice | ✅ | ○ |
| D-LINE-1 | Line weights follow cut > seen > hidden > hatch, in 3–5 weights from the ISO 128 series. | Practice | ✅ | ○ |
| D-DIM-1 | Dimension wood frame to face of stud and state the convention on the sheet. Strings run overall, then walls, then openings, to the nearest ½ in. | Practice | ✅ | ○ |
| D-SCHED-1 | Door, window and room schedules match their tags. The window schedule lists net clear opening, egress, U-factor and safety glazing. | Practice | — | ○ |
| D-NAME-1 | Files are named project-phase-type-vNN. Never overwrite an issued set, and keep the last passing version. | Method | — | ○ |
| D-LABEL-1 | Label every output honestly: "schematic, not for construction", and "AI-assisted concept" vs "model-based render". | Method | — | ○ |

## W — How Claude works ([07-process-and-workflow.md](07-process-and-workflow.md))

| ID | Rule | Kind | Auto |
|---|---|---|---|
| W-BRIEF-1 | Start from PROJECT-BRIEF.md. Ask for missing dimensions and inputs before modeling, and never guess a jurisdiction, climate zone or site. | Method | ○ |
| W-SPEC-1 | design.yaml is the single source of truth. Change the spec, then regenerate plans, models and renders from it. | Method | ○ |
| W-PARAM-1 | Modeling code uses named, unit-labeled parameters and contains no magic numbers. | Method | ○ |
| W-CHECK-1 | Run the deterministic checks after every change, and do not move on with an ERROR. | Method | ● |
| W-LOOK-1 | After the checks pass, render and look at specific things. Vision supplements the numeric checks and never replaces them. | Method | ○ |
| W-SMALL-1 | Make one named change per iteration and keep the last passing version. Stop after two correction rounds and ask. | Method | ○ |
| W-DEC-1 | Log every non-obvious decision and every rule deviation in DECISIONS.md with its rule IDs. | Method | ○ |
| W-GATE-1 | Advance a phase only when its checklist passes and the owner signs off. | Method | ○ |
| W-SRC-1 | Prefer numbers, specs and structured data over images. Crop or tile drawings before reading them. | Method | ○ |
| W-VERIFY-1 | Confirm ⚠️ values against the adopted code text before construction documents. | Method | ○ |
| W-PRO-1 | Output is design intent. A licensed professional and the AHJ approve construction, and Claude never claims code compliance. | Method | ○ |

## CR — Concept and creativity ([08-concept-design.md](08-concept-design.md))

| ID | Rule | Kind | Auto |
|---|---|---|---|
| CR-GATE-1 | Before schematic plans or models, a concept is chosen and recorded (`project.concept`), or the skip is recorded with a reason. Claude warns once, briefly, before designing when it isn't. | Method | ● |
| CR-TASTE-1 | Read the owner's taste (`TASTE.md` with dial, ★ answers and this-or-that pairs, plus `TASTE-PROFILE.md` one folder up) and `PRECEDENTS.md`. Log reactions in the owner's words, and carry lasting lessons and parked ideas to the profile. | Method | ○ |
| CR-HARD-1 | While exploring, only hard limits apply: the envelope, the area budget ±15%, bedrooms on an outside wall, a stair that fits, must-haves. Sketches are checked in concept mode. | Method | ● (concept mode) |
| CR-OBVIOUS-1 | Write down the five most predictable answers first. No concept may be one of them, and they go to the jury blind as controls. | Method | ○ |
| CR-SPREAD-1 | Two concepts per lens, about 12 in all, that differ on named axes (parti, section, ground, light, outdoor, what it's about). Fill in the spread matrix. | Method | ○ |
| CR-IDEA-1 | Every concept has a one-sentence generative idea (not a style, not a feature list), parti and section diagrams, a key move, and what it gives up. | Method | ● (statement) |
| CR-LENS-1 | Generate concepts in separate parallel contexts, one lens each. Each sees the program as areas and must-haves only, and never another lens's output. | Method | ○ |
| CR-SPECIFIC-1 | Give every lens specifics: site facts, `sun.py` numbers, owner rituals, and its own cards from `deal.py`. Never paste fixed example lists into prompts. | Method | ○ |
| CR-SEARCH-1 | Explore concept families with sketch generators, and keep the variants most different in geometry that pass the hard limits (`explore_variants.py`). | Method | ○ |
| CR-ROUND-1 | After the owner's hot/cold sort, run a second round (cross, purify, invert), and shortlist from both rounds. | Method | ○ |
| CR-CRITIC-1 | A blind jury (owner's proxy, studio critic, builder, site) ranks pairwise and names champions and kills. If an obvious answer outranks the concepts, the round failed. | Method | ○ |
| CR-WALK-1 | Write three first-person walkthroughs for each shortlisted concept: arriving in the rain, a winter morning, a party of twelve. | Method | ○ |
| CR-PUSH-1 | Push the pick as named variants (pure, extreme, inverted), then converge without breaking its statement. | Method | ○ |
| CR-KEEP-1 | Record invariants and moments with the concept, warn when an invariant breaks, and run a blind read-back at every gate. Breaking the idea is an owner decision. | Method | ● (invariants) |
| CR-ATMOS-1 | Images set mood and atmosphere only, labeled AI-assisted, and are never used for geometry. | Method | ○ |

## G — Geometry integrity ([06-drawing-and-model-standards.md](06-drawing-and-model-standards.md#model-integrity))

| ID | Rule | Kind | Auto |
|---|---|---|---|
| G-UNITS-1 | The spec declares units (`in` or `mm`), and the tools refuse to guess. | Method | ● |
| G-SPEC-1 | The spec is well-formed: every room has a valid rect, every stair a level and risers, and every limit override a known key. | Method | ● |
| G-OVERLAP-1 | No two rooms on a level overlap. | Method | ● |
| G-WIN-1 | Every window fits its wall and opens to the outside, not into a neighboring room. | Method | ● |
| G-CONN-1 | Every conditioned room can be reached from an egress door through doors, openings or stairs, and every door sits on a wall the two rooms actually share. | Method | ● |
| G-SOLID-1 | Model solids are valid and their volumes and bounding boxes match the spec within tolerance. Check after booleans, because a "valid" union can silently lose volume. | Method | ○ |
