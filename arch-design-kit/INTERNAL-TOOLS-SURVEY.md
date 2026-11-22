# Internal tools survey: skills, plugins and connectors for CAD and architecture

*Surveyed 2026-11-21 across the claude.ai skill library, the plugin catalog (Anthropic Directory and Knowledge Work marketplaces), the connector (MCP) directory, and the skills already loaded in this Claude Code session. Search terms: CAD, 3D modeling, architecture, floor plan, BIM, IFC, Revit, Rhino, SketchUp, Blender, Onshape, Fusion, AutoCAD, OpenSCAD, CadQuery, rendering, interior design, zoning, construction.*

## Summary

- **The skill library has nothing CAD- or architecture-specific.** That is why this kit ships its own skill, [`arch-design-playbook`](skills/arch-design-playbook/SKILL.md).
- **The catalog has a few useful pieces:**
  - One official CAD connector: **Trimble SketchUp**.
  - A documentation connector: **Autodesk Product Help**.
  - A community **Revit/BIM** plugin.
  - A **zoning and parcel** plugin.
- **Several general skills already in this session do real work in an architecture workflow:**
  - PDF redlining.
  - Schedules in spreadsheets.
  - Artifacts for plan and 3D viewers.
  - Concept images through Canva.
  - Deep research.
  - Skill creation.

**Your desktop modeling app is FreeCAD**, driven by the community [`freecad-mcp`](https://github.com/neka-nat/freecad-mcp) server you already have installed. It doesn't show up in the claude.ai catalog because it isn't an official connector. It still fits this kit better than SketchUp: it's free, it reads and writes real BIM (IFC) through the same IfcOpenShell library the kit's tools use, it can edit existing models, and Claude can drive it from Python. Setup and the working loop are in [FREECAD.md](FREECAD.md). SketchUp drops to optional.

Research also found official **Blender** and **Autodesk Fusion** connectors (desktop and local) from Anthropic's April 2026 "Claude for Creative Work" launch, and vendor MCP servers for Revit, Archicad, Chief Architect, Rhino, Onshape and Zoo. They are in the [research report](research/reports/AI%20tools%20for%20CAD%20and%20architecture.md) rather than here, because they live outside the claude.ai catalog or need a desktop app.

## A. Already available, no install needed

| Skill / tool | Use in this workflow | Playbook hook |
|---|---|---|
| `anthropic-skills:deep-research` | Multi-source research with cited notes. Used to build this kit; re-run it yearly to refresh the tools report. | Playbook upkeep |
| `anthropic-skills:skill-creator` | Turn the playbook and your house rules into skills and test them. Used for `arch-design-playbook`. | P-STYLE-1 modules, new rules |
| `artifact-diagramming` and `web-artifacts-builder` (Artifacts) | Bubble and adjacency diagrams as SVG. An interactive **three.js viewer** for the GLB/IFC model that the owner can orbit in a browser. | P-PROG-1, W-LOOK-1 |
| `pdf-viewer:annotate` / `view-pdf` | **Redline** drawing PDFs together: markup, stamps and comments, so review comments sit on the sheet. | Gate reviews, D-SCHED-1 |
| `anthropic-skills:pdf` | Assemble sheet sets into one PDF, extract text and tables from consultant PDFs, OCR scanned surveys. | D-SHEET-1, W-SRC-1 |
| `anthropic-skills:xlsx` | Door, window and room schedules, area tabulations and quantity takeoffs generated from `design.yaml` or IFC quantities. | D-SCHED-1, SP-SIZE-1 |
| `anthropic-skills:docs` / `docx` | Briefs, outline specifications, code summaries and owner reports as shareable documents. | Gate 0 and Gate 4 |
| `anthropic-skills:canvas-design`, `dataviz` | Presentation boards and charts (energy, cost and area comparisons across options). | Option comparison |
| **Canva connector** (connected in this session) | `generate-image` for mood boards and concept renders. It takes your exact words as the prompt, so write the prompt from the spec. | D-LABEL-1 ("AI-assisted concept") |
| `engineering:architecture` (software ADRs) | Not about buildings, but its decision-record pattern is the model for `templates/DECISIONS.md`. | W-DEC-1 |
| `design:design-critique` | Aimed at UI and screens. Of little direct use for buildings. | — |

## B. Connectors worth adding (claude.ai → Settings → Connectors)

| Connector | What it does | Fit | Caveats |
|---|---|---|---|
| **Trimble SketchUp** (official, Anthropic-verified) | `build_model`, `get_docs`, `save_model`. Builds geometry in a cloud SketchUp session and returns a preview plus a `.skp` link. Works from claude.ai with nothing installed. | **Optional.** FreeCAD does the modeling. This only helps for massing sketches from a browser or phone, away from your desktop. | New models only, with no edits to an existing `.skp`. Testers saw dimension drift and missing doors. Pricing is unclear: Trimble says the first 30 saved models are free, another source says SketchUp Go is required. Rebuild from the spec before trusting numbers. |
| **Autodesk Product Help** (authless) | Searches Autodesk's help documentation (Revit, AutoCAD, Fusion and others). | Add if you use any Autodesk product. | Documentation only, no modeling. |
| **Figma** (FigJam) | Diagrams such as bubble diagrams and process maps. | Optional. | The design plugin's Figma server failed to connect in this cloud session because the network proxy refused it. It may work from claude.ai or the desktop app. |

## C. Plugins in the catalog

| Plugin | Publisher | What's inside | Fit |
|---|---|---|---|
| **revit-bim** | Community (author listed as Manas Bhatia) | 25 skills (query-model, audit-model, clash-detection, create-schedule, export-ifc, generate-dynamo, revit-api-code, manage-sheets and more), 3 agents, Revit/Dynamo/ACC workflows | **Only if you use Revit.** It needs Revit on Windows. Pair it with the Revit Public MCP (2027.2+) or a community bridge for live access. The research found more than one "revit-bim" plugin in circulation, so check the publisher before installing. |
| **IQland Real Estate** | Community | US parcel and zoning lookup, construction cost, build feasibility, comparable sales | **Useful at Gate 0.** It can pre-fill zoning inputs (Z-INPUT-1) and give a budget sanity check. Verify every value with the jurisdiction. |
| **Abracadabrax Image & Video** | Community | Text-to-image and video on credits | Optional concept renders. Canva already covers this. |
| **agentvfx** | Community | Music-reactive VFX with Blender plates | Not relevant. |
| **Design** (Anthropic) | Anthropic | UI critique, design systems, handoff | UI-focused. Its skills are loaded here; its connectors did not connect in this session. |

## D. Recommended setup, in order

1. **Use the kit's own skill.** Install `arch-design-kit` as a plugin once it has its own repository (see the [README](README.md#moving-this-folder-to-its-own-repo)). It brings the playbook, the checker and the workflow into every session.
2. **Claude Code with the Python stack** (`tools/requirements.txt`: PyYAML, IfcOpenShell, build123d, ezdxf, trimesh). All of it installs and runs headless in this cloud environment, which was verified here.
3. **FreeCAD + `freecad-mcp` on your desktop**, which you already have. This is the live 3D look-and-adjust loop and the design-development modeler ([FREECAD.md](FREECAD.md)). Register it with Claude Code as well as Claude Desktop, so the same session that edits the spec can also drive FreeCAD.
4. **Add Autodesk Product Help** if Autodesk tools are in the picture.
5. **Optional:** the Trimble SketchUp connector for massing sketches away from the desk; IQland for zoning and feasibility; Canva (already connected) for concept boards.
6. **Only when the work needs it:** Chief Architect X18 (residential construction documents, experimental MCP) or Revit 2027.2 plus the revit-bim plugin (if collaborators need RVT).

## Environment notes from this session

- The cloud environment's network blocked several hosts used during research (codes.iccsafe.org, up.codes, autodesk.com, zoo.dev, arxiv.org and others), and the design and engineering plugins' MCP servers could not connect. A `red-line-toolkit` environment now allows the three code sites, but they still refuse scripted reading on their own side (ICC bot protection, up.codes' robots.txt opt-out of Claude agents, the energycodes.gov firewall). Code verification is therefore a person-in-the-browser job ([playbook/VERIFY.md](playbook/VERIFY.md)). Vendor API hosts can be added to the environment when a project needs them.
