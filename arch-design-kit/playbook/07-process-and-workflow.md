# 07 · Process and workflow: how Claude designs

Chapters 01–06 say what a good design is. This chapter says how Claude and the owner get there, project after project, without drift. It follows the professional phases (AIA B101: schematic design, design development, construction documents, procurement, construction) and adds a working loop matched to Claude's measured strengths and weaknesses.

## What the evidence says about Claude and CAD

From the [tools research](../research/reports/AI%20tools%20for%20CAD%20and%20architecture.md):

- **Strong:** writing parametric CAD code. Current Claude models are at or near the top of the published CAD code-generation benchmarks (CadQueryEval; Parametric CAD Bench v3, where rebuilding from a *dimensioned* drawing scored highest). Code runs in a real geometry kernel, so its output is exact.
- **Weak:** reading drawings from images and judging space visually. General vision models score about 33–38% on floor-plan question benchmarks. Claude answered questions about its own renders correctly only about two-thirds of the time. Floor-plan reasoning was best from structured text (JSON), not images.
- **Dangerous:** silent failures. Plausible-looking geometry can be wrong: invented dimensions, overlapping rooms, missing doors, dimensions quietly rounded between iterations, and tools reporting success after failing.
- **What fixes it:** clarifying questions before modeling (about 80% less geometric error in one benchmark), deterministic checks (far better than visual judging), and one or two correction rounds, which capture most of the available gain.

The workflow follows from that: **text and numbers in, code to geometry, numbers checked, then look.**

## The loop (every iteration)

```
        ┌──────────────────────────────────────────────────────────────┐
        │ 1 SPEC      edit design.yaml (one named change)    W-SPEC-1  │
        │ 2 CHECK     python3 tools/check_design.py design.yaml        │
        │             ERROR? → fix the spec, back to 2       W-CHECK-1 │
        │ 3 GENERATE  render_plan.py / spec_to_ifc.py / model code     │
        │             + geometry assertions                  G-SOLID-1 │
        │ 4 LOOK      render → inspect named things          W-LOOK-1  │
        │ 5 RECORD    decision log + keep last passing version W-DEC-1 │
        └──────────────────────────────────────────────────────────────┘
```

- **W-SPEC-1.** All geometry comes from `design.yaml`. If the owner says "make the kitchen bigger", Claude changes the spec, re-runs the checks and regenerates. It never edits a drawing or model by hand where that would leave the spec stale.
- **W-PARAM-1.** Modeling code reads named parameters with units (`wall_ext_in = 6.5`, `plate_height_in = 109.125`) from the spec or a parameter block. There are no unexplained literals. A change happens in one place.
- **W-CHECK-1.** Run the checker after every change. An ERROR blocks progress. A WARN gets resolved or logged. In the concept phase the checker runs in **concept mode**: only hard limits are errors, and everything else is deferred to Gate 2 (CR-HARD-1).
- **W-LOOK-1.** After the checks pass, render and **look at specific things**, written down before looking: "Do bedroom doors open off the hall?", "Is the stair landing clear?", "Does the kitchen triangle cross the island?" Vision is a supplement for what the checker can't see (flow, proportion, light, the feel of the plan). It never overrides a numeric check.
- **W-SMALL-1.** Make one named change per iteration and keep the **last passing version** (D-NAME-1). If two correction rounds haven't fixed something, stop and ask the owner. Don't thrash.
- **W-DEC-1.** Record every non-obvious decision, and every deviation from a rule, in `DECISIONS.md` with the rule IDs and the reason.
- **W-SRC-1.** Feed Claude numbers, specs and structured data. When a drawing or photo must be read (a survey, a scan, a client sketch), crop and tile it to legible resolution. A full 36 in. sheet sent at the image limit leaves text only about 4 px tall. Then transcribe the dimensions into the spec and confirm them with the owner before using them.

## The phases and their gates

Each phase ends at a gate (W-GATE-1). Its checklist in [CHECKLISTS.md](CHECKLISTS.md) must pass, and the owner signs off before the next phase starts. Locking a phase means its decisions stay closed unless they are reopened deliberately and logged.

### 0 · Brief (intake)

- **Do:** fill `PROJECT-BRIEF.md` with the owner. Claude asks for every missing input instead of assuming (W-BRIEF-1): jurisdiction and adopted code, climate zone, site and zoning values (Z-INPUT-1), budget, program, accessibility tier (SP-UD-3), style module, and must-haves and must-nots.
- **Lock:** what the project is, and its constraints.

### 1 · Programming (LOD 100)

- **Do:** room list with target areas (SP-SIZE-1), adjacency matrix and bubble diagram (P-PROG-1, P-ZONE-1), site analysis (sun, views, access, slope, setbacks).
- **Output:** `PROGRAM.md`, a bubble diagram, and a site diagram.
- **Lock:** program, total area budget, accessibility tier.

### 1.5 · Concept (LOD 000–100): range first, then choice

- **Before anything is drawn**, the readiness check runs: `tools/ready_check.py`, which the plugin's prompt hook also triggers automatically. If the brief, program, taste, precedents or concept are missing, Claude **stops, warns the owner, and offers the concept studio** (CR-GATE-1).
- **Do:** the [`concept-studio`](../skills/concept-studio/SKILL.md) skill: design questions, the obvious list, 8–12 concepts from parallel lenses, parametric families, a separate critic, a shortlist of 3, owner reactions logged to `TASTE.md`, then push the pick ([08](08-concept-design.md)).
- **Output:** `CONCEPTS.md` (the concept board), contact sheets, and the concept statement recorded in `design.yaml`.
- **Lock:** the concept, or a recorded decision to skip it.

### 2 · Schematic design (LOD 100–200)

- **Do:** develop the chosen concept (CR-KEEP-1). Where the concept phase was skipped, make 2–3 distinct plan options as specs. Check each, render each, and compare them against the foundation principles (01) and the brief. Refine the chosen one. Settle massing, roof form and style module, the structural strategy (S-STACK, S-SPAN flags resolved or logged), and the stair arithmetic (C-STAIR-2/6).
- **Output:** `design.yaml` passing with zero errors, SVG plans, an IFC massing and space model, simple elevations and a 3D view, and a code summary draft.
- **Lock:** plan layout, room sizes, massing, roof, style, structural strategy.

### 3 · Design development (LOD 200–300)

- **Do:** real wall types and assemblies (E-LAYERS-1, E-INSUL-1), door and window schedules with net clear and safety-glazing data (D-SCHED-1), sections through the stair and the tallest space, a structural grid with beams, headers and engineer flags (S-ENG-1), MEP spaces and routes (M rules), interior elevations of kitchen and baths (SP-KIT, SP-BATH), and an exterior material palette from the style module.
- **Output:** a DD model (IFC), plans, elevations and sections at 1/4″ = 1′-0″ (D-SCALE-1), schedules, and an outline specification.
- **Lock:** everything that moves walls, openings or structure.
- **W-VERIFY-1** happens here at the latest: confirm every ⚠️ value the design relies on (see [VERIFY.md](VERIFY.md)).

### 4 · Construction documents (LOD 300+) — with a licensed professional

- Claude assists: sheet setup (D-SHEET-1), annotation checks, schedule-to-tag consistency, code-summary drafting, and detail sketches from the playbook's sequences (E-FLASH-1).
- A licensed architect or engineer (as the jurisdiction requires) owns the permit set (W-PRO-1). Many jurisdictions let owners or designers submit one- and two-family plans without an architect's stamp; structural elements beyond the prescriptive path still need an engineer (S-ENG-1).

## W-PRO-1: the professional boundary

Claude produces design intent and pre-permit documentation. Claude does not:

- Claim code compliance. It says "checked against the playbook's baseline, pending AHJ review."
- Size structural members for construction (S-ENG-1).
- Stamp, certify or present AI-assisted visuals as construction-accurate (D-LABEL-1).

## Using other Claude capabilities in the loop

| Need | Use |
|---|---|
| Checks, plans, IFC (zero install beyond Python) | `tools/` in this kit, in Claude Code |
| Precise components (stairs, trusses, casework, details) | build123d or CadQuery scripts with G-SOLID-1 assertions |
| DXF for a CAD user or consultant | ezdxf, on the D-LAYER-1 names |
| Live 3D look-and-adjust; DD modeling in BIM | **FreeCAD via your freecad-mcp server**: load the spec's IFC with `tools/freecad_load_ifc.py`, check the counts, `get_view`, and adjust ([FREECAD.md](../FREECAD.md)). Blender + Bonsai is the alternative. |
| Massing sketches away from the desk (optional) | the official Trimble SketchUp connector (claude.ai). Treat its output as a sketch: dimensions drift between iterations |
| Interactive 3D review for the owner | a three.js Artifact that loads the exported GLB or IFC |
| Concept renders and mood | an image tool (for example Canva's generate-image) from a prompt written from the spec. Label it "AI-assisted concept" |
| Redlines on a PDF drawing set | the PDF viewer's annotate skill |
| Schedules and estimates | a spreadsheet (xlsx) generated from the spec or IFC quantities |

The [prompting guide](../PROMPTING-GUIDE.md) has the prompt templates for each phase.
