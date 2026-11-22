# 06 · Drawing and model standards

These are the conventions that make Claude's output readable by builders, consultants and other software, and keep it consistent from one project to the next. They follow US practice: the National CAD Standard (NCS v7, which incorporates the AIA CAD Layer Guidelines and the CSI Uniform Drawing System), the BIMForum LOD Specification, and buildingSMART IFC.

## D-UNITS-1 / D-AXES-1: units and coordinates

- **Declare units** in every spec, script, model and drawing. In imperial work, store **inches** internally and display **ft-in** (`11'-6"`). Never mix units in one file, and never let a tool guess. The checker refuses an undeclared spec (G-UNITS-1). Metric projects use **mm**.
- **Axes:** +x east, +y north, +z up. The origin is the south-west corner of the main house at finished floor level 0. If the site's north is rotated, record `north_angle_deg` in the brief and keep the plan axes orthogonal to the building.
- **Room rects are net**: measured to the inside face of finished walls, the way people read room sizes. Walls are generated around them. Exterior walls go outside the net line; interior walls straddle the shared line.
- **Elevations** are finished-floor elevations. Floor-to-floor height = plate height + floor system depth (S-PLATE-1, S-SPAN-1).

## The design spec (design.yaml)

The spec is the project's **single source of truth** (W-SPEC-1). Plans, IFC models and renders are generated from it and never edited by hand. The format, in brief (see `templates/design.yaml` for the annotated version):

```yaml
project:   {name, units, phase, jurisdiction: {code, energy_code, ahj, climate_zone}, style, ...}
site:      {lot_in, setbacks_in: {north, south, east, west}, building_origin_in}
roof:      {form, pitch, framing, clear_span_in, overhang_in}
limits:    {<limit_key>: {value, reason}}        # local amendments only
levels:
  - id, name, elevation_in, ceiling_in
    rooms:  [{id, name, type, rect: [x, y, w, d], windows: [...], doors: [{to, width_in}],
              open_to: [room ids], opens_to: [...garage only], fixtures: {...}, kitchen: {...}}]
    stairs: [{id, to_level, risers, tread_in, width_in, headroom_in, handrail_in, rect, from_room, to_room}]
    egress_doors: [{id, room, wall, width_in, clear_width_in, clear_height_in}]
    alarms, guards, garage_separation
```

Room `type` drives the rules: `bedroom` (sleeping), `living`, `dining`, `kitchen`, `family`, `office`, `bath`, `powder`, `laundry`, `hall`, `foyer`, `mudroom`, `stair`, `closet`, `pantry`, `garage`, `porch`, `deck`, and so on. Use the most specific type, because a `den` used as a bedroom must be typed `bedroom` so it gets egress and alarm checks.

## D-LOD-1: level of development by phase

The BIMForum LOD Specification (2025 edition, updated yearly) defines how much a model element can be trusted. The playbook maps it to phases:

| Phase | LOD | What the model contains | Claude's tools |
|---|---|---|---|
| Programming | 100 | Room list, areas, adjacency; massing blocks | `PROGRAM.md`, bubble diagram |
| Schematic design (SD) | 100–200 | Net room rectangles, nominal walls, windows by wall, stair boxes, roof form | `design.yaml` → `check_design.py`, `render_plan.py`, `spec_to_ifc.py` |
| Design development (DD) | 200–300 | Real wall types and thicknesses, door and window sizes from schedules, stair geometry, structure grid, MEP spaces, sections | FreeCAD BIM (NativeIFC) through freecad-mcp; IfcOpenShell scripts; build123d components |
| Construction documents (CD) | 300 (+350 where coordinating) | Exact sizes, locations, interfaces with structure and MEP, details, schedules | Licensed professional's BIM/CAD, with Claude assisting (W-PRO-1) |
| As-built | 500 | Field-verified | Out of scope |

Never present an LOD 100–200 output as more precise than it is (D-LABEL-1).

## D-IFC-1: IFC structure

IFC4 is the open format: ISO 16739-1:2024 for IFC 4.3. Structure every model as:

```
IfcProject
 └ IfcSite
    └ IfcBuilding
       └ IfcBuildingStorey (one per level, Elevation set)
          ├ IfcSpace (one per room: Name = room id, LongName = room name, Qto_SpaceBaseQuantities)
          └ elements contained in exactly one storey: IfcWall, IfcSlab, IfcRoof, IfcDoor, IfcWindow (in IfcOpeningElement), IfcStair, IfcRailing, IfcColumn, IfcBeam
```

- Spatial structure uses `IfcRelAggregates`. Elements are placed with `IfcRelContainedInSpatialStructure`.
- Fill the common property sets: `Pset_WallCommon` (IsExternal, LoadBearing, FireRating), `Pset_WindowCommon`, `Pset_DoorCommon`, `Pset_SpaceCommon`.
- Classify elements for specs and costs: UniFormat (A–G, Z), MasterFormat (divisions 00–49) or OmniClass. Pick one per project.
- Store IFC in **metres** (SI). `spec_to_ifc.py` converts from the spec's inches.

## D-SHEET-1: sheet set organization (NCS)

Sheet ID = **discipline designator + sheet type digit + sequence**, for example `A-101`.

| Type digit | Content |
|---|---|
| 0 | General: symbols, legends, notes |
| 1 | Plans |
| 2 | Elevations |
| 3 | Sections |
| 4 | Large-scale views (enlarged plans) |
| 5 | Details |
| 6 | Schedules and diagrams |
| 7–8 | User-defined |
| 9 | 3D representations |

A typical residential set, in order:
- `G-001` cover, index and code summary
- `C-101` or `A-001` site plan
- `A-101`… floor plans
- `A-201`… exterior elevations
- `A-301`… building sections
- `A-401` enlarged plans for kitchen and baths
- `A-501`… details
- `A-601` door, window and room schedules
- `S-` sheets for foundation, framing and structural details
- `M-`, `P-` and `E-` sheets as required

## D-LAYER-1: layers and categories

Use AIA/NCS hyphenated names: discipline, major group, and optional minor groups. Examples:

| Layer | Content |
|---|---|
| `A-WALL` | Walls (with `-PRHT` partial height, `-MOVE` movable, `-HEAD`, `-JAMB`) |
| `A-DOOR` | Doors (`-FULL` full height, `-IDEN` tags) |
| `A-GLAZ` | Windows and glazing |
| `A-FLOR` | Floor elements: stairs, fixtures, casework |
| `A-CLNG` | Ceiling plan |
| `A-ROOF` | Roof |
| `A-ANNO-DIMS` / `-TEXT` / `-NOTE` / `-SYMB` | Annotation |
| `A-AREA` | Area plans |
| `S-GRID`, `S-BEAM`, `S-COLS` | Structure |

Colors and pens are office choices, not NCS. Keep them consistent within a set. In BIM, use the same names for categories, views and filters.

## D-SCALE-1: scales

| View | Imperial | Exact ratio | Metric pair |
|---|---|---|---|
| Site plan | 1″ = 20′ or 1/16″ = 1′-0″ | 1:240 / 1:192 | 1:200 |
| Overall plans, roof | 1/8″ = 1′-0″ | 1:96 | 1:100 |
| Floor plans, elevations, sections | **1/4″ = 1′-0″** | 1:48 | 1:50 |
| Enlarged plans (kitchen, bath, stair) | 1/2″ = 1′-0″ | 1:24 | 1:20 |
| Wall sections | 3/4″ = 1′-0″ | 1:16 | 1:20 / 1:10 |
| Details | 1½″ = 1′-0″ and larger | 1:8 | 1:10 / 1:5 |

Every drawing gets a scale note, a **graphic scale bar** (so it survives reprinting at any size) and a **north arrow** on plans.

## D-LINE-1: line weights

Use a hierarchy, not decoration. Use 3–5 weights from the ISO 128 √2 pen series (0.13, 0.18, 0.25, 0.35, 0.50, 0.70, 1.00, 1.40 mm), stepped down for smaller scales:

| Element | At 1/4″ = 1′-0″ |
|---|---|
| Cut elements: walls in plan, cut profile in section | 0.50–0.70 mm (heaviest) |
| Seen elements below or beyond: casework, fixtures, edges | 0.25–0.35 mm |
| Hidden or overhead (dashed), property lines | 0.18–0.25 mm |
| Hatch, poché pattern, dimensions, text leaders | 0.13–0.18 mm |
| Profile and ground line in elevations | 0.70–1.00 mm |

## D-DIM-1: dimensioning

- **Wood frame:** exterior walls to the **outside face of stud** (or sheathing; pick one and state it). Interior partitions to the **face of stud** or **centerline**, applied consistently and stated in a sheet note. Masonry and concrete to the face; openings in masonry to the edges.
- **Strings**, from the building outward: (1) openings and partitions, (2) wall and grid locations, (3) overall. Every string closes, meaning its parts sum to the overall.
- Dimension to the nearest **½ in.**, rarely ¼ in., never finer.
- Rooms are labeled with name and net size. The schematic plan shows net sizes (`render_plan.py`). Construction plans show framing dimensions.

## D-SCHED-1: schedules

Tags on the drawings must match schedule rows exactly.

- **Doors:** mark, room, size (W×H×thickness), type, material, fire rating or self-closer (garage door, C-GAR-1), hardware set, notes.
- **Windows:** mark, room, unit size, rough opening, operation, **net clear opening W×H and area**, **egress yes/no** (C-EGR-2 to C-EGR-4), sill height, U-factor and SHGC (E-INSUL-1), **safety glazing yes/no** (C-GLAZ-1), fall protection (C-GUARD-2).
- **Rooms and finishes:** room id, name, net area, ceiling height (C-CEIL-1), floor, base, walls, ceiling.

## D-NAME-1: files and versions

- Name files as `project-phase-type-vNN`, for example `ranch-sd-plan-L1-v03.svg` or `ranch-dd-model-v07.ifc`.
- Never overwrite an issued set. Issue a new version, and note what changed in `DECISIONS.md`.
- Keep the **last passing version**, the last one with zero checker errors (W-SMALL-1), so a bad iteration can always be rolled back.

## D-LABEL-1: honest labels

- Every drawing carries its phase and "**not for construction**" until a licensed professional issues it (W-PRO-1).
- Visuals say what they are:
  - "**model-based render**": rendered from the actual model geometry.
  - "**AI-assisted concept**": a generative image that may contain non-buildable or inaccurate details.
  - "**AI-generated asset**" for props: record the tool, model version and license tier, because free tiers of some generators are CC BY and need attribution.

## Model integrity

**G-UNITS-1, G-SPEC-1, G-OVERLAP-1, G-WIN-1** (auto). The spec is well-formed, rooms don't overlap, and windows sit on exterior walls that can hold them.

**G-CONN-1** (auto). Every conditioned room has to be reachable from the egress door, through `doors`, `open_to` connections, the garage's `opens_to`, and stairs (`from_room` → `to_room`). Every door has to sit on a wall its two rooms really share, with room for the door plus its jambs. Missing doors are the most common failure in AI-drawn floor plans (one published test of a connector-built apartment had no bedroom doors at all), and they don't show up as a geometry error. The plan renderer draws door swings into the room that lists the door (SP-DOOR-1), so the look step can check that the swings make sense.

**G-SOLID-1.** For modeling code (build123d, CadQuery, Blender, IfcOpenShell), assert geometry numerically after every boolean operation and export:

- Solids are valid and closed. "Valid" is not enough: one documented failure was a union that silently lost about 30% of its volume while still reporting `valid=True`.
- **Volume** and **bounding box** match the spec within tolerance (for example, ±0.5 in. on dimensions and ±1% on volume).
- Element **counts** match: rooms → spaces, windows → windows, doors → doors.
- Every window and door is **hosted** in a wall with an opening.

Deterministic checks agree with human judgment far more often than visual self-review does: about 0.94 vs 0.47 in one study. Check numerically first and look second (W-CHECK-1, W-LOOK-1).

---

Sources: research notes at [drawing_standards_process_principles.md](../research/research_notes/Residential%20design%20standards%20baseline/drawing_standards_process_principles.md) (NIBS NCS v7, AIA CAD Layer Guidelines, CSI UDS, BIMForum LOD 2025, buildingSMART IFC, ISO 128, AIA Best Practices) and [claude_capabilities_and_prompting.md](../research/research_notes/AI%20tools%20for%20CAD%20and%20architecture/claude_capabilities_and_prompting.md) (silent geometry failures, deterministic checks vs. vision judges).
