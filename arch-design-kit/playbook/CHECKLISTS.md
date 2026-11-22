# Checklists

These are the gate checklists (W-GATE-1) plus the quick check Claude runs on every iteration. Copy the relevant one into the project's `DECISIONS.md` at each gate and tick it there. Items marked ● are covered by `tools/check_design.py`; the rest need a person, or Claude reviewing deliberately against the named rule.

## Every iteration (the loop, ~1 minute)

- [ ] The change was made in `design.yaml`, not in a drawing (W-SPEC-1)
- [ ] `check_design.py`: **0 errors** ● (W-CHECK-1); every new WARN resolved or logged
- [ ] Generated outputs regenerated (plan SVG, IFC, model); geometry assertions pass (G-SOLID-1)
- [ ] Looked at the render for the named questions written *before* looking (W-LOOK-1)
- [ ] Decision logged if anything non-obvious changed (W-DEC-1); last passing version kept (D-NAME-1)

## Gate 0 · Brief complete

- [ ] Jurisdiction, adopted IRC/IECC editions, local amendments noted (02)
- [ ] Climate zone (county lookup) and design hazards: wind speed, seismic design category, snow, frost depth, flood/WUI (S-ENG-1)
- [ ] Zoning inputs collected (Z-INPUT-1); sprinkler status
- [ ] Budget, schedule, owner priorities, must-haves / must-nots
- [ ] Accessibility tier chosen (SP-UD-3); style module chosen or "to explore" (P-STYLE-1)
- [ ] Every unknown either answered or listed as an open question; nothing assumed (W-BRIEF-1)

## Gate 1 · Program locked

- [ ] Room list with target areas and uses (SP-SIZE-1); total within budget area
- [ ] Adjacency matrix + bubble diagram (P-PROG-1); public→private gradient and service spine (P-ZONE-1)
- [ ] Storage program (SP-STOR-1); outdoor rooms (P-OUT-1)
- [ ] Site analysis: sun path, views, access, slope, setbacks, buildable envelope (P-ORIENT-1, Z-SETBACK-1)

## Gate 2 · Schematic design locked

**Code and geometry**
- [ ] 0 checker errors ● (all C-, Z-, G- auto rules)
- [ ] Stair arithmetic done with the real floor system; run + landings fit (C-STAIR-2, C-STAIR-6) ●
- [ ] Every sleeping room has a compliant escape window on an exterior wall (C-EGR-1…4, G-WIN-1) ●
- [ ] Every room reachable from the entry through doors or openings; doors on shared walls (G-CONN-1) ●
- [ ] Fire separation distance checked on side walls near lot lines (Z-FSD-1)
- [ ] Garage separation strategy stated; no garage opening to bedrooms (C-GAR-1, C-GAR-2) ●

**Structure and envelope strategy**
- [ ] Load path traceable for every bearing element (S-PATH-1)
- [ ] Upper floors stacked or cantilevers flagged (S-STACK-1 ●, S-STACK-2); spans > 16 ft resolved (S-SPAN-1 ●)
- [ ] Solid wall left for bracing at corners and along long walls (S-BRACE-1)
- [ ] Roof form, pitch, material compatible (S-ROOF-3); framing approach (S-ROOF-1/2)
- [ ] Shell on the 2 ft module (S-MOD-1); plate heights chosen (S-PLATE-1); foundation type chosen (S-FDN-1)
- [ ] Engineer triggers listed (S-ENG-1)
- [ ] Orientation, overhang and window-to-wall strategy (E-SUN-1, E-WWR-1)
- [ ] Wet core stacked, mechanical space and duct strategy reserved, panel and laundry located (M-CORE-1, M-DUCT-1, M-ELEC-1, M-DRYER-1)

**Livability**
- [ ] Room sizes at or above targets or deviations logged (SP-SIZE-1)
- [ ] Kitchen aisles ● and triangle/landings (SP-KIT-1, SP-KIT-2); baths to NKBA targets (SP-BATH-1)
- [ ] Circulation ≤ ~15% or justified (SP-CIRC-1 ●)
- [ ] Every room furnished; doors don't collide (SP-FURN-1, SP-DOOR-1)
- [ ] Foundation principles review (01 checklist) — light, entry, privacy, form

## Gate 3 · Design development locked

- [ ] Wall, roof, floor and slab assemblies drawn with all four control layers continuous (E-LAYERS-1); pen test passes at every transition
- [ ] Insulation and window performance meet the climate-zone table (E-INSUL-1); vapor strategy (E-VAPOR-1); attic strategy (E-ATTIC-1)
- [ ] Air-barrier plan and ACH50 target (E-AIR-1); ventilation system and space (M-VENT-1)
- [ ] Window flashing sequence detail (E-FLASH-1); rainscreen and capillary breaks where required (E-RAIN-1)
- [ ] Door, window, room schedules complete and matching tags; egress, safety glazing, fall protection columns filled (D-SCHED-1, C-GLAZ-1, C-GUARD-2)
- [ ] Guards and handrails detailed (C-GUARD-1, C-STAIR-5); stair section with headroom line (C-STAIR-4)
- [ ] Alarms located on plans (C-ALARM-1…3) ●; attic/crawl access located (C-ACCESS-1)
- [ ] Structure grid, beams, headers, posts down to footings; engineer items issued (S-HEADER-1, S-ENG-1)
- [ ] IFC model at LOD 200–300 with storeys, spaces, psets; counts match spec (D-IFC-1, G-SOLID-1)
- [ ] Sheets, layers, scales, line weights, dimensions per standards (D-SHEET-1, D-LAYER-1, D-SCALE-1, D-LINE-1, D-DIM-1)
- [ ] **Every ⚠️ value the design relies on verified against the adopted code text** (W-VERIFY-1)

## Gate 4 · Ready for the licensed professional / permit

- [ ] Code summary drafted (edition, occupancy, construction type, sprinklers, FSD, egress, energy path)
- [ ] All outputs labeled with phase and "not for construction" until issued (D-LABEL-1)
- [ ] Open questions and engineer items listed in `DECISIONS.md`
- [ ] Handoff package: spec, IFC, DXF/PDF plans, schedules, decision log (W-PRO-1)
