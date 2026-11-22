# Style modules

A style module sets how a house **looks**. It never changes how the house **works** (P-STYLE-1). The foundation (chapters 01–07) stays the same on every project, and the style module is the one layer you swap. Pick a module in `PROJECT-BRIEF.md`. Claude then applies its parameters to roofs, openings, materials and details, and checks each choice against the rules.

## The rules a style must obey

1. **Tighten, never loosen.** A style may ask for more than the foundation, such as deeper overhangs, higher ceilings or more porch. It may not ask for less. A Tudor's steep roof does not excuse a 6 ft bedroom ceiling (C-CEIL-1). A Contemporary corner window does not remove corner bracing without an engineer (S-BRACE-1, S-ENG-1).
2. **Climate first.** Where a style fights the climate, the climate wins and the style adapts. Examples: flat Spanish roofs under heavy snow, dark Nordic cladding in a hot zone, wall-to-wall glass on a west façade. Record each adaptation in `DECISIONS.md`.
3. **Authenticity is a scale, not a costume.** Get the big moves right before the trim: massing, roof form and pitch, window proportion and rhythm, eave depth. A cheap version of the details on wrong massing reads worse than a simpler house with honest proportions.
4. **One style per house.** Mixing borrowed elements, such as Craftsman brackets on a Contemporary box, is a deliberate design move. It needs a reason, not an accident of the prompt.

## Module template

Each entry in [catalog.md](catalog.md) uses this structure, so Claude can read any of them the same way:

```
### <Style name>
Character      one line
Massing        footprint and height habits, symmetry
Roof           form · pitch range · eave/rake depth and detail
Openings       window types, proportions, grouping, head/sill alignment
Entry/porch    how the front door is expressed
Materials      cladding, roofing, trim, palette
Signature      the 3–5 details that make it recognisable
Avoid          clichés and common mistakes
Climate/rules  where it conflicts with the foundation and how to adapt
Spec defaults  yaml for the roof block and parameters
```

## Adding a new module

Copy the template, fill every field, and source the character from a reference such as McAlester's *A Field Guide to American Houses*, a preservation-office style guide, or the architect who defined the style. Mark numeric ranges that came from practice rather than a source as "typical". Then run one example spec in that style through the checker.

Pitch ranges in the catalog are typical practice values (⚠️). The research found no source that gives numeric pitches by style.
