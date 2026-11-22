---
name: arch-design-playbook
description: |
  Architectural design and 3D/CAD modeling of houses and small buildings to the Design Playbook: code baseline (US IRC), structure, envelope, space planning, drawing and BIM standards, and a spec → check → render → look workflow. Use whenever the user asks to design, lay out, model, draw, check or revise a house, floor plan, addition, ADU, garage or other small structure, or to produce architectural drawings, an IFC/BIM model, a SketchUp/Blender/Revit/CAD model of a building, or a design review of one.
---

# Architectural design: the Design Playbook

You are designing or modeling a building. The playbook in this plugin is your foundation. Follow it in place of improvising. Its files are under `${CLAUDE_PLUGIN_ROOT}`.

## 1. Orient (every time)

1. Read `${CLAUDE_PLUGIN_ROOT}/playbook/RULES.md`. It is the whole rulebook on one page, and every rule has an ID.
2. Look in the project folder for `PROJECT-BRIEF.md`, `PROGRAM.md`, `design.yaml` and `DECISIONS.md`.
   - None of them exists: start the project. Copy the templates from `${CLAUDE_PLUGIN_ROOT}/templates/` into the project folder, set the kit path in the copied `CLAUDE.md`, and begin with the brief.
   - They exist: read them and the latest decisions, and note `project.phase` in `design.yaml`.
3. Open the playbook chapter for the task:

| Task | Chapter |
|---|---|
| Priorities, plan principles | `playbook/01-foundation.md` |
| Code minimums, zoning, egress, stairs | `playbook/02-code-baseline.md` |
| Structure, spans, roofs, when to call an engineer | `playbook/03-structure-and-buildability.md` |
| Envelope, climate, mechanical, plumbing | `playbook/04-envelope-climate-mep.md` |
| Room sizes, kitchens, baths, circulation | `playbook/05-space-planning.md` |
| Units, spec format, LOD, IFC, sheets, layers | `playbook/06-drawing-and-model-standards.md` |
| Phases, the loop, the professional boundary | `playbook/07-process-and-workflow.md` |
| Style expression | `playbook/styles/catalog.md` |

## 2. Ask before modeling (W-BRIEF-1)

If the jurisdiction, climate zone, site, a key dimension or an owner preference is missing, ask for it, as a short list of exactly what you need. Do not invent site or code facts. Asking first is the single biggest accuracy lever for AI-generated geometry.

## 3. Run the loop

```
SPEC      edit design.yaml (one named change)                            W-SPEC-1, W-SMALL-1
CHECK     python3 ${CLAUDE_PLUGIN_ROOT}/tools/check_design.py design.yaml W-CHECK-1  (0 errors to proceed)
GENERATE  python3 ${CLAUDE_PLUGIN_ROOT}/tools/render_plan.py design.yaml out/
          python3 ${CLAUDE_PLUGIN_ROOT}/tools/spec_to_ifc.py design.yaml out/model.ifc   (needs ifcopenshell)
          + any modeling code, with numeric geometry assertions           G-SOLID-1, W-PARAM-1
FREECAD   if the freecad MCP is connected: execute_code →
            exec(open("${CLAUDE_PLUGIN_ROOT}/tools/freecad_load_ifc.py").read()); print(load_ifc("<abs>/out/model.ifc"))
          compare the counts with the spec, then get_view("Top") / ("Isometric")   (FREECAD.md)
LOOK      write the questions first, render, then look                    W-LOOK-1
RECORD    DECISIONS.md with rule IDs; keep the last passing version       W-DEC-1, D-NAME-1
```

- Work from numbers, specs and structured data, not images (W-SRC-1). Your CAD code is strong. Your visual judgment of plans is weak, so trust the checker over your eyes.
- After two failed correction rounds on the same issue, stop and ask.
- To view a plan, convert the SVG to PNG with a headless browser if one is available, and look at it at a size where the labels are legible.

## 4. Gates and boundaries

- Before changing `project.phase`, run the matching checklist in `playbook/CHECKLISTS.md` and get the owner's sign-off (W-GATE-1).
- Say "checked against the playbook baseline, pending AHJ review". Never say "code compliant" (W-PRO-1).
- Structural members beyond prescriptive tables are marked "engineer to confirm" (S-ENG-1).
- Label outputs honestly, with "schematic, not for construction" and "AI-assisted concept" vs "model-based render" (D-LABEL-1).
- Before construction documents, confirm any ⚠️ value the design relies on against the adopted code (`playbook/VERIFY.md`, W-VERIFY-1).

## 5. Prompts and tool choice

`${CLAUDE_PLUGIN_ROOT}/PROMPTING-GUIDE.md` has prompt patterns for each phase and says which tool to use when. FreeCAD (via freecad-mcp) is the 3D tool, and `${CLAUDE_PLUGIN_ROOT}/FREECAD.md` covers its loop and version traps. Never edit geometry in FreeCAD during schematic design; change the spec. `${CLAUDE_PLUGIN_ROOT}/research/reports/` has the evidence behind those choices.
