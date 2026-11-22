# The Design Playbook

This is the base every house and small structure starts from. It defines what a sound design is, which minimums it never drops below, what it is drawn and modeled to, and how Claude works through a project. It covers US one- and two-family dwellings and townhouses (the IRC baseline). Other building types and countries need their own code chapter. The rest of the playbook applies to them unchanged.

## How it's built: layers

```
  ┌───────────────────────────────────────────────┐
  │ PROJECT      brief · program · design.yaml ·  │  changes every project
  │              decisions · local amendments     │
  ├───────────────────────────────────────────────┤
  │ STYLE        styles/catalog.md (one module)   │  swapped per project
  ├───────────────────────────────────────────────┤
  │ FOUNDATION   01 principles   02 code          │  stable across projects;
  │              03 structure    04 envelope/MEP  │  updated deliberately
  │              05 space        06 drawing/model │
  │              07 process      RULES · CHECKLISTS│
  └───────────────────────────────────────────────┘
```

When two layers disagree, the layer lower in this diagram wins. The one exception is a stricter local amendment, which overrides a code value (02). A project can tighten the foundation but never loosen it without a logged reason (W-DEC-1). A style can only change how the house looks (P-STYLE-1).

## The chapters

| | Chapter | Answers |
|---|---|---|
| ★ | [RULES.md](RULES.md) | Every rule on one page with its ID, kind, basis and whether it is auto-checked |
| 01 | [Foundation](01-foundation.md) | The priority order, programming, and the plan principles (zoning, entry, light, orientation, form, scale, privacy) |
| 02 | [Code baseline](02-code-baseline.md) | IRC 2021/2024 minimums: rooms, egress, stairs, guards, glazing, fire separation, garages, alarms, baths, energy, zoning inputs |
| 03 | [Structure and buildability](03-structure-and-buildability.md) | Load path, stacking, bracing, spans, headers, roofs, modules, foundations, when an engineer is required |
| 04 | [Envelope, climate, MEP](04-envelope-climate-mep.md) | Control layers, airtightness, insulation, vapor, flashing, attics, sun and shading, wet core, ducts, panel, laundry, ventilation |
| 05 | [Space planning](05-space-planning.md) | Room-size targets, kitchens, baths, circulation, storage, furniture, doors, accessibility tiers, garages |
| 06 | [Drawing and model standards](06-drawing-and-model-standards.md) | Units, axes, the spec format, LOD by phase, IFC, sheets, layers, scales, line weights, dimensions, schedules, file naming, model integrity |
| 07 | [Process and workflow](07-process-and-workflow.md) | The loop Claude runs each iteration, the phases and gates, the professional boundary, which tools to use |
| ✓ | [CHECKLISTS.md](CHECKLISTS.md) | The per-iteration check and the gate checklists |
| ⚠ | [VERIFY.md](VERIFY.md) | Values not yet confirmed against the primary code text |
| ◆ | [styles/](styles/) | The style-module system and a catalog of 12 American styles |

## Using it on a project

1. **Start the project folder** from [`templates/`](../templates/): `PROJECT-BRIEF.md`, `PROGRAM.md`, `design.yaml`, `DECISIONS.md` and `CLAUDE.md`. The `CLAUDE.md` tells every Claude session in that folder to follow this playbook.
2. **Brief.** Fill out the brief with Claude. It asks for what is missing rather than guessing (W-BRIEF-1).
3. **Program, then schematic design**, in the loop from chapter 07: spec, check, generate, look, record.
4. **Gates.** At each phase end, run the matching checklist and get the owner's sign-off.
5. **Before construction documents**, clear the ⚠️ items the design relies on (W-VERIFY-1) and hand off to the licensed professional (W-PRO-1).

## Keeping it a foundation

- **Rule IDs are permanent.** Don't renumber. Retire a rule by marking it *retired* in RULES.md with the reason.
- **Change the foundation deliberately.** When a project teaches something general, add or amend the rule here: one rule, its ID, its kind and basis, and the chapter text explaining why. If the checker enforces it, add a test.
- **Every number lives in one place.** Each code value is in its chapter table and in `tools/check_design.py → LIMITS`. A test fails if the checker emits a rule ID that RULES.md doesn't list.
- **Review yearly:** code editions (the IRC is on a 3-year cycle), the BIMForum LOD spec (yearly), and the tools research.
