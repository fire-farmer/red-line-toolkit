# <project name>: instructions for Claude

This folder is an architectural design project. Every session follows the **Design Playbook** in the arch-design-kit at `<KIT>` (set this path when you create the project, e.g. `../arch-design-kit`).

## Before doing anything

1. Read `PROJECT-BRIEF.md`, `PROGRAM.md` and the latest entries in `DECISIONS.md`.
2. Read `<KIT>/playbook/RULES.md`, then open the chapter for the task in front of you.
3. Check the phase in `design.yaml` (`project.phase`) and work only on that phase's tasks (playbook 07).

## Non-negotiables

- **Ask, don't guess (W-BRIEF-1).** If a dimension, jurisdiction, climate zone, site fact or owner preference is missing, ask, listing exactly what is needed. Never invent a site or code fact.
- **The spec is the truth (W-SPEC-1).** Every geometry change goes into `design.yaml` first. Plans, IFC and renders are regenerated from it.
- **Check every change (W-CHECK-1).** Run `python3 <KIT>/tools/check_design.py design.yaml`. An ERROR blocks progress. Resolve each WARN or log it in `DECISIONS.md`.
- **Look second (W-LOOK-1).** After the checks pass, render (`render_plan.py`, or the 3D tool in use), write down what you are looking for, then look. Report what you found.
- **One change at a time (W-SMALL-1).** Keep the last passing version. After two failed correction rounds, stop and ask.
- **Log decisions (W-DEC-1)** with rule IDs. Run the gate checklist (`<KIT>/playbook/CHECKLISTS.md`) and get the owner's sign-off before changing `project.phase`.
- **Stay in your lane (W-PRO-1).** Say "checked against the playbook baseline", never "code compliant". Structural sizes beyond the prescriptive tables are marked "engineer to confirm" (S-ENG-1). Label all visuals honestly (D-LABEL-1).

## Conventions

- Units: inches in the spec, ft-in in prose (`11'-6"`). Axes: +x east, +y north, origin at the south-west corner (D-AXES-1).
- Files: `out/<project>-<phase>-<type>-vNN.<ext>`. Never overwrite an issued set (D-NAME-1).
- Style: the module named in `design.yaml` (`project.style`) governs how the house looks only (P-STYLE-1).

## Project-specific notes

<!-- Local amendments, owner preferences that keep coming up, consultants' instructions. -->
