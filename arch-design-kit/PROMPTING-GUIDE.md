# Prompting Claude for 3D CAD and architectural drawings

This guide covers how to get dependable buildings out of Claude. It is drawn from the [tools research](research/reports/AI%20tools%20for%20CAD%20and%20architecture.md), and it follows the [playbook](playbook/README.md) workflow.

## The three facts everything else follows from

1. **Claude writes CAD code very well.** Current Opus-class models top the published CAD code-generation benchmarks, and score best of all when rebuilding from *dimensioned* drawings. Code runs in a real geometry kernel, so the result is exact.
2. **Claude reads drawings and judges space poorly.** Vision models score about 33–38% on floor-plan drawing questions, and Claude judged its own renders correctly only about two-thirds of the time. A layout given as structured text (JSON or YAML) beat the same layout given as an image.
3. **The dangerous errors are silent.** Invented dimensions, missing doors, dimensions quietly rounded between iterations, and solids reported "valid" that lost volume all look plausible.

So every prompt should follow the same pattern: **numbers in, code to geometry, numbers checked, then a look.**

## Six habits

| Habit | Do | Don't |
|---|---|---|
| **Units and conventions first** | "Inches. Net room sizes. +x east, +y north, origin SW corner." | Leave units implied. A 1000× unit error is a documented failure. |
| **Dimensions, not adjectives** | "Bedroom 2: 11′-0″ × 12′-0″, egress casement on the south wall." | "A cozy bedroom with a nice window." |
| **Ask before building** | "Before modeling, list every dimension or fact you're missing as questions." | Let Claude fill gaps with "industry-standard assumptions". Asking first cut geometric error about 80% in one benchmark. |
| **Spec is the truth** | "Change `design.yaml`, re-run the checker, regenerate." | "Just move that wall in the drawing." |
| **Tests before pictures** | "Run `check_design.py`; report every ERROR and WARN; then render." | "Does this look right?" as the only check. |
| **One change per turn** | "Widen the hall to 42 in. Nothing else." | Five edits at once. Editing is the weakest CAD workflow in benchmarks. |

## Where to run what

| Surface | Reaches | Use it for |
|---|---|---|
| **Claude Code on your computer** | This kit's tools *and* your **FreeCAD MCP**, in one session | **The main workbench.** Spec, checks, IFC, then load, look and adjust in FreeCAD ([FREECAD.md](FREECAD.md)) |
| **Claude Code on the web** | Python: this kit's tools, IfcOpenShell, build123d/CadQuery, ezdxf, headless FreeCAD (`freecadcmd`), browser screenshots | Spec, checks, plans, IFC and components when you're away from your desk. It cannot reach your FreeCAD. |
| **claude.ai** | Remote connectors (Trimble SketchUp, Canva, Claude Docs); Artifacts | Briefing conversations, a three.js viewer Artifact, concept images, sharing; optional SketchUp massing sketches |
| **Claude Desktop + other local apps** | Blender (official connector or Blender MCP), Autodesk Fusion, Rhino (RhinoAI), Revit 2027.2 / Archicad 30 / Chief Architect X18 MCP servers | Only if a project needs them |

## The prompt skeleton

Use XML tags for each kind of content, following Anthropic's guidance. Paste this and fill it in, or let `PROJECT-BRIEF.md` and `design.yaml` supply most of it:

```xml
<role>Residential designer working to the Design Playbook (arch-design-kit/playbook) and
IRC 2021 as adopted by <AHJ> with these amendments: <...>. Climate zone <4A>.</role>

<conventions>Inches. Net room sizes. +x east, +y north, origin SW corner of the house,
z = finished floor. design.yaml is the source of truth.</conventions>

<program> table: room · type · target size · adjacent to · level · must fit (furniture) </program>

<constraints> setbacks, max height, budget area, accessibility tier, style module, and any
rule the owner wants tightened (cite rule IDs: SP-KIT-1, C-EGR-2, ...) </constraints>

<task> exactly one change or one deliverable </task>

<acceptance> check_design.py: 0 errors; every room reachable (G-CONN-1); stair fits
(C-STAIR-6); plan rendered and these questions answered: ... </acceptance>

<process> Before modeling, list missing facts as questions. Change design.yaml, run the
checker, report every finding, then render and answer the acceptance questions.
Never claim code compliance; say "checked against the playbook baseline". </process>
```

## Prompts by phase

### Brief (Gate 0)
> We're starting a new house. Copy the kit's templates into this folder and interview me to fill out PROJECT-BRIEF.md, one section at a time. For anything I don't know, add it to Open Questions with who can answer it. Don't assume a jurisdiction, climate zone or site fact.

### Program (Gate 1)
> From the brief, draft PROGRAM.md: the space list with target sizes from playbook 05 (SP-SIZE-1), the adjacency matrix and the zones. Flag any target that pushes us over the budget area, and propose what to cut, citing P-SIMPLE-1.

### Concepts (Gate 1.5): where creativity happens

The full method is [playbook 08](playbook/08-concept-design.md) and the `concept-studio` skill. You don't need to remember it: before any drawing, Claude checks readiness and warns you if taste, precedents or a concept are missing. To start it yourself:

> Run the concept studio. My surprise dial is 4. Ask me the TASTE questions you need first.

Moves that reliably raise creativity, each one built into the studio:

| Move | Prompt it like this |
|---|---|
| Ban the obvious (CR-OBVIOUS-1) | "First list the 5 most predictable answers to this brief. None of your concepts may be one of them." |
| Range, not a design (CR-SPREAD-1) | "Give me 10 concepts that differ in parti, section, relation to the ground, light and what the house is about, not in finishes." |
| Separate contexts (CR-LENS-1) | "Run each lens as its own parallel subagent; don't let them see each other's ideas." |
| An idea, not a style (CR-IDEA-1) | "One-sentence concept statement each. No style names, no feature lists." |
| Specifics (CR-SPECIFIC-1) | "Use the oak, the downhill view, our Sunday breakfast, the Azuma House's court move and a boat cabin as an analogy." |
| Search a family (CR-SEARCH-1) | "Write a generator for the courtyard family and run explore_variants; show me the 6 most different that pass." |
| Judge boldness (CR-CRITIC-1) | "Have a separate critic score originality and delight, and say what would make each more surprising." |
| Push, then pull (CR-PUSH-1) | "Take concept 4 thirty percent further than feels comfortable. Then make it buildable without breaking its statement." |
| Protect the idea (CR-KEEP-1) | "Before you fix this, does the change keep the concept statement true? If not, ask me." |

### Schematic options (Gate 2)
> Create three distinct schematic options as design-a.yaml, design-b.yaml and design-c.yaml: a compact two-story box, a single-level split-bedroom ranch, and an L around a south patio. Each must pass check_design.py with 0 errors. Render each one, then compare them in a table against the brief's top 3 priorities and the 01-foundation checklist. Recommend one.

### Revise
> In design.yaml, make the kitchen 2 ft deeper by shrinking the great room. Change nothing else. Re-run the checker and render. Then answer: does the work aisle still meet SP-KIT-1, is the great room still at least 14 ft deep, and do the doors still clear?

### The look step (W-LOOK-1)
> Render L1 and look at it at full size. Answer only these questions: (1) Is any bedroom or bath door visible from the entry? (2) Does any door swing into a hall or into another door? (3) Can you walk from the garage to the pantry without crossing the great room? (4) Is every main room lit from two sides? Turn each "no" into a proposed spec change. Don't apply it yet.

### Stairs and section (DD)
> Our floor system is 11⅞″ I-joists with ¾″ subfloor, and the first-floor plate is 9 ft. Do the stair arithmetic from playbook 02: risers, treads, run, landings, and the headroom line under the floor above. Update the stair in design.yaml with from_room and to_room. Then write a build123d script for the stair section with named parameters, and assert that the riser is at most 7.75 in. and the headroom at least 80 in.

### IFC / BIM
> Run spec_to_ifc.py on design.yaml. Then verify the model numerically: space count equals room count, every IfcDoor and IfcWindow fills an opening, the exterior walls are Pset_WallCommon IsExternal, and the storey elevations match the spec. Report the counts. Don't describe the model from memory.

### DXF for a consultant
> Write plan_dxf.py using ezdxf. It draws the L1 plan from design.yaml on NCS layers (A-WALL, A-DOOR, A-GLAZ, A-ANNO-DIMS, A-ANNO-TEXT), uses inches and decimal-feet display, and runs dimension strings per D-DIM-1. Open the DXF again with ezdxf, list its layers and entity counts, and check that the overall dimensions match the spec.

### Concept renders (label them, D-LABEL-1)
> Write an image prompt from design.yaml and the modern-farmhouse style module: the view from the southeast at golden hour, the actual massing (a one-story 78 ft × 30 ft ranch with an attached garage on the east, an 8:12 gable, an 18 in. overhang), and the materials from the catalog. List what the image must NOT add: a second story, dormers, extra gables. Label the result "AI-assisted concept".

### Reading a survey, sketch or photo (W-SRC-1)
> This is a site survey PDF. Crop it into tiles where the text is legible, and transcribe every dimension, bearing, setback and easement into a table with the tile each came from. Mark anything you can't read as "illegible". Don't guess. I'll confirm the table before it goes into design.yaml.

### Review a drawing set
> Review these PDF sheets against playbook/CHECKLISTS.md Gate 3. For each finding, cite the sheet, the location and the rule ID, and say whether you confirmed it numerically or only by eye. Use the PDF annotate tool to redline each one.

## Tool-specific tips

- **FreeCAD (your MCP), the main 3D tool.** Generate the IFC from the spec, load it with `tools/freecad_load_ifc.py` through `execute_code`, compare the counts with the spec, then `get_view("Top")` / `("Isometric")` to look. During schematic design, never edit geometry in FreeCAD, because the next reload replaces it; put changes in the spec. Register the server with `--only-text-feedback` so screenshots come only when asked for. Prompts and version traps are in [FREECAD.md](FREECAD.md).
- **SketchUp connector** (claude.ai, optional): for massing sketches away from your desk. It makes new models only and can't edit an existing `.skp`. Testers saw dimensions drift between iterations and doors left out. Treat the result as a sketch, and rebuild it from the spec before trusting any number.
- **Blender, through the official connector or Blender MCP**: describe the end state, then build one change at a time. Use it to look, and keep the spec and IFC as the master. Code-executing bridges run without authentication, so keep them on localhost, run one client at a time, and turn on safe mode where it's offered.
- **build123d / CadQuery**: named parameters at the top of the file, units in the names, and after every boolean operation, assert the volume and bounding box (G-SOLID-1). Sweeps, lofts and patterns fail most often; roofs and stairs use exactly those, so test them hardest.
- **IfcOpenShell**: `ifcopenshell.api` for authoring. Watch units: some representation calls take millimetres while the project is in metres. `spec_to_ifc.py` documents both cases.
- **Image tools** (Canva generate-image and similar): write the prompt from the spec, list what the image must not add, and label the result.
- **Long sessions**: images are expensive (about 1,600 tokens for a 1280 px image) and the oldest ones drop out of context. Lead with numbers, then show one picture.

## Anti-patterns

- Jumping straight from the brief to a floor plan. You get the average house. Run the concept phase, or skip it on purpose (CR-GATE-1).
- Asking for "more creative" in the same conversation. Use fresh parallel contexts with different lenses instead (CR-LENS-1).

- "Design me a beautiful 3-bed house." There's no brief, no units and no site, so you'll get generic geometry built on assumptions.
- Taking Claude's word for code compliance. Ask for the checker output and the rule IDs.
- Iterating on a rendered image instead of the spec.
- Letting a style choice break a rule, such as corner glass that removes bracing or a steep roof that lowers a bedroom ceiling below code (P-STYLE-1).
- More than two correction rounds on the same problem. Stop and re-specify instead (W-SMALL-1).
