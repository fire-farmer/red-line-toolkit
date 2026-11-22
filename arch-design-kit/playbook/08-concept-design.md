# 08 · Concept design: making room for creativity

The rest of the playbook makes a design **correct**. This chapter makes it **worth building**. They pull in opposite directions, and that's on purpose: creative work needs a phase where ideas are generated freely before the rules start selecting among them. This phase sits between the program (Gate 1) and schematic design (Gate 2). See [07](07-process-and-workflow.md).

## Why AI design comes out bland, and what each rule here counters

| What goes wrong | Why | Counter |
|---|---|---|
| Everything looks like the average house | Models drift toward the most typical answer | CR-OBVIOUS-1, CR-SPREAD-1, CR-IDEA-1 |
| "Options" are variations of option A | One conversation anchors on its first idea | CR-LENS-1 (separate contexts) |
| The rules kill ideas before they exist | Checking every rule too early only rewards the safe choice | CR-HARD-1 (only hard limits while exploring) |
| Generic prompts get generic houses | Nothing specific to work from | CR-SPECIFIC-1, CR-TASTE-1 |
| Ideas get sanded off on the way to construction | Each fix chooses the typical solution again | CR-KEEP-1, CR-PUSH-1 |
| Nobody judges boldness | Only the code-and-geometry checks score anything | CR-CRITIC-1 |
| The user forgets all of the above | Habits don't survive between projects | CR-GATE-1 (Claude warns and asks before designing) |

## The rules

**CR-GATE-1. Readiness before drawing** (auto). Before any schematic plan or model, there must be a **chosen concept** recorded in `design.yaml` (`project.concept`), or a **recorded skip** with a reason. Three things enforce this, so nobody has to remember it:

- `tools/ready_check.py` reports what's missing: brief, program, taste, precedents, concept.
- The plugin's prompt hook runs that check when a design request arrives in a project folder, and tells Claude to **warn the owner and offer the concept studio first**.
- `check_design.py` warns from schematic design onward when no concept is recorded.

Skipping is allowed, because the owner may want a straightforward house. It just has to be a choice, not an accident.

**CR-TASTE-1. Know the owner's taste.** Before generating concepts, read `TASTE.md` (likes, dislikes, the *surprise dial*) and `PRECEDENTS.md` (buildings to learn from, and what to take from each). After every review, write down what the owner reacted to and **why**, in their words. Taste accumulates from project to project, and it's the cheapest way to get output that feels like the owner instead of the average.

**CR-HARD-1. Only hard limits while exploring.** During the concept phase, a concept is out only if it breaks one of these:

- the buildable envelope: setbacks, height, coverage;
- the area budget, ±15%;
- life-safety feasibility: bedrooms can have escape openings, and a stair can fit (C-STAIR-6 arithmetic);
- the program's must-haves and must-nots.

Everything else (room sizes, kitchen triangles, the 2 ft module, standard spans, the style module) waits for convergence. The priority stack (P-ORDER-1) is unchanged: these rules are deferred, not dropped.

**CR-OBVIOUS-1. Name the obvious first.** Before any concepts, write down the **five most predictable responses** to the brief, the ones any builder plan set would offer. No concept may be one of them. Keep the list on the concept board as the control: the chosen concept should be visibly better than all five.

**CR-SPREAD-1. Generate a spread, not a design.** Generate **8–12 concepts** that differ on these named axes:

| Axis | Example positions |
|---|---|
| Parti (plan organization) | bar · L · courtyard · pinwheel · cluster of pavilions · thick-wall/poché · free plan |
| Section | single level · split level · double-height heart · stepped with the slope · raised on a plinth or piers |
| Relation to the ground | sits on · steps down · floats over · carved in |
| Light | from the south · top-lit · borrowed through courts · filtered (screens, trees) |
| Outdoor relation | court inside · porch around · rooms as pavilions in a garden · one big framed view |
| What it's about | a ritual, a view, a tree, a material, a climate move, a constraint |

Fill in the spread matrix on the concept board. If two concepts share most cells, replace one of them. The [surprise dial](#the-surprise-dial) sets the mix of grounded and wild concepts.

**CR-IDEA-1. Every concept has an idea.** Each concept carries:

- **a one-sentence concept statement**, the generative idea. "A house that is one long wall you live along." Not a style name ("modern farmhouse") and not a feature list ("open plan with an island");
- the **key move** in one line, and a **diagram described in words**, or an SVG made by a generator (CR-SEARCH-1);
- a **section idea**;
- **what it gives up**. Every strong idea costs something, and saying what it costs is part of the idea.

Style comes later, as a module (P-STYLE-1), chosen to serve the idea.

**CR-LENS-1. Generate in separate contexts.** Run concept generation as **parallel subagents**. Each gets one lens and the same brief, and none sees the others' output, so they can't anchor on each other:

- **Site:** the land, the tree, the slope, the view, the street.
- **Light and climate:** sun, shade, wind, seasons.
- **Ritual:** how the owners actually live, from morning to night.
- **Structure and material:** let the way it's built make the form: a timber frame, a thick masonry wall, a kit of parts.
- **Constraint as fuel:** take the hardest constraint and turn it into the idea.
- **Contrarian:** reject the brief's main assumption and show what that buys.

Each lens returns 2 concepts. Then deduplicate across lenses against the spread matrix.

**CR-SPECIFIC-1. Feed every lens specifics.** Prompts carry concrete material:

- site facts: the oak, the downhill view, the noisy road;
- owner rituals from the brief and `TASTE.md`;
- **two or three precedents, with the reason each one matters**;
- **one cross-domain analogy**: a monastery cloister, a boat cabin, a barn's threshing floor, a Japanese engawa (the covered veranda strip between house and garden), a library stack.

Specific inputs produce specific architecture.

**CR-SEARCH-1. Search a family of designs, not just one.** Some concepts are really a family: bar houses, courtyards, split levels. For those, Claude writes a **generator**, a Python function from parameters to a `design.yaml` spec. Then `tools/explore_variants.py` samples dozens of variants, drops every one that fails the checker, and keeps the **most different** survivors, laid out side by side on one contact sheet. This uses Claude's strength (parametric code) and the checker's (feasibility) to cover more of the design space than drawing by hand.

**CR-CRITIC-1. A separate critic judges boldness.** A subagent that did not write the concepts scores each one from 1 to 5 on these criteria:

- **originality**, measured against the obvious list;
- **coherence**: does every part serve the idea?
- **site fit**;
- **delight**: is there a moment you'd remember?
- **taste fit**, measured against `TASTE.md`.

For each concept it also names **the boldest move**, **the weakest part**, and **what would make it more surprising while keeping it buildable**. This critique is kept apart from the code and geometry checks, which judge correctness.

**CR-PUSH-1. Push, then pull.** Take the owner's pick **about 30% further than feels comfortable**: more court, more wall, more light, more of whatever the idea is. *Then* converge with the playbook (Gate 2 checklist) and make it buildable **without breaking the concept statement**. Pushing first keeps convergence from sanding the idea down to the average.

**CR-KEEP-1. Protect the idea.** Each concept statement is written into `design.yaml` (`project.concept.statement`). At every gate, and at any big change, test the design against it: is the statement still true? A change that breaks it is a decision for the owner, logged in `DECISIONS.md` (W-DEC-1). It never happens as a side effect of fixing a rule.

**CR-ATMOS-1. Images set the mood, never the geometry.** Use image tools such as Canva generate-image for mood boards and atmosphere: light, material, how a moment feels. Write the image prompt from the concept statement, label each result "AI-assisted concept" (D-LABEL-1), and never read dimensions or layout off one.

## The surprise dial

`TASTE.md` holds the owner's **surprise dial**, from 1 to 5. It sets how far concepts reach:

| Dial | Mix of 10 concepts | Push in CR-PUSH-1 |
|---|---|---|
| 1 Familiar | 8 grounded · 2 stretch | about 10% |
| 2 | 6 grounded · 4 stretch | about 20% |
| 3 Balanced (default) | 4 grounded · 4 stretch · 2 wild | about 30% |
| 4 | 2 grounded · 5 stretch · 3 wild | about 40% |
| 5 Provoke me | 1 grounded · 4 stretch · 5 wild | about 50% |

*Grounded* means a familiar type done very well. *Stretch* means a familiar type with one unexpected move. *Wild* means the organizing idea itself is unusual. All three must still pass CR-HARD-1.

## The concept phase, step by step

The [`concept-studio` skill](../skills/concept-studio/SKILL.md) runs this phase. By hand, the steps are:

1. **Readiness** (CR-GATE-1). `ready_check.py`. Fill in anything missing with the owner. A fast `TASTE.md` takes the 6 questions in the template.
2. **Frame.** Restate the brief as 3–5 **design questions** ("How does a narrow lot get south light into every room?"). Write down the obvious list (CR-OBVIOUS-1) and the hard limits (CR-HARD-1).
3. **Diverge.** Run the lenses in parallel (CR-LENS-1, CR-SPECIFIC-1). Optionally run families through `explore_variants.py` (CR-SEARCH-1).
4. **Assemble the concept board** (`CONCEPTS.md`): the spread matrix, the concepts, and any contact sheets.
5. **Critique** (CR-CRITIC-1). Shortlist **3**: the strongest, the boldest, and the one that best fits the owner's taste.
6. **Owner review.** Present the 3 with their statements, diagrams and costs. Record the owner's reactions in `TASTE.md` (CR-TASTE-1).
7. **Push the pick** (CR-PUSH-1). Then record `project.concept` in `design.yaml` and move into schematic design.

**Gate 1.5:** a concept is chosen and recorded, with its statement, or the skip is recorded with a reason. The checklist is in [CHECKLISTS.md](CHECKLISTS.md#gate-15--concept-chosen).

## Precedents

The [starter precedent library](precedents.md) lists about 20 houses worth learning from, each with **what to take** from it. Copy the ones that resonate into the project's `PRECEDENTS.md`, along with your own, each with a reason. Learn from the move, and never copy the building (P-STYLE-1).
