# 01 · Foundation: what every design answers to

This chapter changes the least of any in the playbook. The code values, the styles and the tools will all change over time; these principles stay. When a project or a style seems to argue against one of them, the principle wins unless `DECISIONS.md` records why it should not.

## P-ORDER-1: the priority stack

When two goals conflict, resolve the conflict top-down:

1. **Life safety and code.** People get out, fire is contained and nobody falls (C rules, Z-FSD-1).
2. **Structure and weather.** The building stands up and stays dry (S rules, E-LAYERS-1).
3. **Function.** The program works: rooms fit their uses and the adjacencies hold (SP rules).
4. **Comfort and climate.** Light, air, temperature, sound and views (P-LIGHT-1, P-ORIENT-1, E and M rules).
5. **Cost and buildability.** Standard modules, simple framing and stacked systems (S-MOD-1, S-SIMPLE-1).
6. **Expression.** Style, proportion and character (P-FORM-1, P-STYLE-1, [styles/](styles/)).

A lower priority never buys a higher one. A dramatic corner window (priority 6) does not get to remove the corner bracing (priority 2) unless an engineer provides another load path. A style's steep roof does not get to push a bedroom's ceiling below code (priority 1).

The stack is not a ranking of what matters most to the owner. Expression is often the reason the house exists. The stack says which constraint holds when they collide. Good design finds the arrangement where they do not collide.

## P-PROG-1: program before geometry

A plan drawn before the program is written gets defended rather than tested. Before any room has a rectangle:

- **Room list.** Every space, with its target area and use, and who uses it, when and with what furniture. Use `templates/PROGRAM.md`.
- **Adjacencies.** Must, should, nice-to-have and must-not, recorded as an adjacency matrix. Bubble diagrams use triple, double or single lines for must, should and nice.
- **Constraints.** Site, zoning envelope, budget, climate zone, accessibility tier and style.

This is also the strongest lever on AI accuracy. In benchmark testing, asking for missing dimensions before modeling cut geometric error by about 80% (W-BRIEF-1).

## The plan principles

### P-ZONE-1: intimacy gradient

Arrange rooms along a gradient from public to private (Alexander, *A Pattern Language* 127):

`entry → living/social → kitchen/dining → family/den → bedrooms → primary suite`

Service rooms cluster on their own spine: garage → mudroom/drop zone → laundry → pantry → kitchen. Groceries should travel from the car to the pantry without crossing the living room. Bedrooms sit at the quiet, private end, away from the street and the kitchen.

### P-ENTRY-1: entrance transition

The front door is a sequence, not a hole in the wall (Pattern 112):

- A covered landing outside, at least 5×5 ft. C-DOOR-2 sets the minimum.
- A place to set things down, and a coat closet within reach (SP-STOR-1).
- A change of light, floor or ceiling as you cross the threshold.
- No direct view into a bedroom or bathroom. A first view toward light or garden is ideal.

### P-LIGHT-1: light on two sides

Rooms lit from two sides are more pleasant to be in, have less glare and read faces better (Pattern 159). Aim for it in every main living space and in as many bedrooms as the plan allows. Useful daylight reaches about 1.5–2.5× the window-head height into a room. With an 8 ft head, plan on 12–20 ft. Deeper rooms need a second light source: windows on another side, a clerestory or a skylight. This rule of thumb is not a daylight simulation.

### P-ORIENT-1: orientation

North of the equator:

- Living spaces and the largest glazing face south, within about 30° of true south. South glass is easy to shade in summer with an overhang (E-SUN-1).
- The main outdoor room faces south (Pattern 105). A north-facing yard stays in shadow.
- Bedrooms suit the east for morning light.
- Minimize west glass. Low afternoon sun overheats rooms and overhangs cannot stop it.
- Garages, storage, stairs and baths make good buffers on the north and west.

### P-FORM-1: one ordering idea

Strong houses have one organizing idea that a visitor can feel (Ching, *Form, Space, and Order*): an axis, a grid, a datum line, symmetry or a deliberate break from it, rhythm and repetition, and hierarchy. In practice:

- Choose a structural or planning grid on the 2 ft module (S-MOD-1) and align walls, openings and roof breaks to it.
- Use a small family of window sizes, typically 2–4, and repeat them. Align heads across a façade and sills within a room.
- Give hierarchy deliberately. The most important room gets the largest volume, the best light or the highest ceiling; most rooms stay ordinary.
- Regulating lines can check proportion on elevations: diagonals of the main rectangles that run parallel. The golden ratio is one option. Consistency matters more than any particular ratio.

### P-SCALE-1: human scale

- Ceilings should be proportioned to the room. A 9 ft ceiling suits a 15×16 ft living room, but in a 10×10 ft bedroom it reads as a shaft. Vaults and 10 ft or taller ceilings belong in large rooms.
- Open plans still need places. Use alcoves, window seats, lowered ceilings over dining or kitchen areas, and changes of floor (Pattern 179; Susanka's layering and framed openings).
- Doors, windows and trim follow body dimensions, not the drawing scale. Most door heads are 6′-8″ or 8′-0″.

### P-SIMPLE-1: better, not bigger

Every room should earn daily use or do double duty (Susanka, *The Not So Big House*). Before adding a formal dining room, a bonus room or a second living area, ask how often it will be used. Put the money into quality, light, storage and the rooms people actually live in.

### P-OUT-1: outdoor rooms

Each main living space opens to a usable outdoor room: a porch, patio or deck at least 6 ft deep, because a shallower balcony does not get used (Pattern 167). Put it on the sunny side (P-ORIENT-1) and connect it at floor level where the site allows.

### P-PRIV-1: views and privacy

- Before fixing windows on a side elevation, check what each one looks at. Never look straight into a neighbor's window.
- No bathroom door or toilet should be visible from the entry, living or dining spaces.
- Bedrooms on the street side need sill heights, landscape screening or window placement that give privacy without losing egress (C-EGR-1).

### P-STYLE-1: style is a layer

The playbook keeps *how to build well* separate from *how it looks*:

- **The foundation** is this chapter plus chapters 02–07. It is invariant across projects.
- **A style module** (in [styles/](styles/)) sets expression parameters only: roof form and pitch range, eave and rake details, window proportions and patterns, cladding, palette and signature elements.

A style may tighten a rule, for example by requiring deeper overhangs. It may not loosen one. If a style element conflicts with a C, S, E, M or SP rule, change the element.

## How to apply this chapter

At every phase gate (W-GATE-1), and whenever a plan changes substantially, read the plan against the list below and note in `DECISIONS.md` any principle the design consciously gives up:

- [ ] Program and adjacencies written before geometry (P-PROG-1)
- [ ] Public-to-private gradient clear; service spine clear (P-ZONE-1)
- [ ] Entry sequence works (P-ENTRY-1)
- [ ] Main rooms lit from two sides; no deep dark rooms (P-LIGHT-1)
- [ ] Living spaces and outdoor room face the sun; west glass limited (P-ORIENT-1, P-OUT-1)
- [ ] One ordering idea; aligned openings; small window family (P-FORM-1)
- [ ] Ceiling heights scaled to rooms; places within open plans (P-SCALE-1)
- [ ] No room without a daily use (P-SIMPLE-1)
- [ ] Privacy and views checked (P-PRIV-1)
- [ ] Style expressed within the rules (P-STYLE-1)

Sources: F.D.K. Ching, *Form, Space, and Order*. C. Alexander et al., *A Pattern Language* (patterns 105, 112, 127, 159, 167, 179). S. Susanka, *The Not So Big House*. The daylight-depth figure is a practitioner rule of thumb. Details are in the [research notes](../research/research_notes/Residential%20design%20standards%20baseline/drawing_standards_process_principles.md).
