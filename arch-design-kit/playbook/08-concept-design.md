# 08 · Concept design: making room for creativity

The rest of the playbook makes a design **correct**. This chapter makes it **worth building**. The two pull in opposite directions, and that's deliberate: creative work needs a phase where ideas multiply before the rules select among them. The phase sits between the program (Gate 1) and schematic design (Gate 2; see [07](07-process-and-workflow.md)), and the [`concept-studio`](../skills/concept-studio/SKILL.md) skill runs it.

## Why AI design comes out bland, and what each rule counters

| Failure | Why it happens | Counter |
|---|---|---|
| Everything looks like the average house | Models drift toward the most typical answer | CR-OBVIOUS-1, CR-SPREAD-1, CR-IDEA-1 |
| "Options" are variations of option A | One context anchors on its first idea; shared examples anchor every context | CR-LENS-1, CR-SPECIFIC-1 (a dealt deck) |
| The rules kill ideas before they exist | Checking every rule early only rewards the safe | CR-HARD-1 (concept mode) |
| Generic prompts → generic houses | Nothing specific to push against | CR-SPECIFIC-1, CR-TASTE-1 |
| The first round is mistaken for the answer | Round one maps the space; the best scheme is usually a second-generation one | CR-ROUND-1 |
| The safest concept wins the vote | Averaged scores reward whatever nobody objects to | CR-CRITIC-1 (a jury with champions) |
| Ideas are sanded off on the way to construction | Each fix re-chooses the typical | CR-PUSH-1, CR-KEEP-1 |
| Sectional ideas lose to plan ideas | A plan of rectangles can't show a section | CR-IDEA-1 (parti and section diagrams) |
| The user forgets all of the above | Habits don't survive between projects | CR-GATE-1 (Claude warns before designing) |

## The rules

**CR-GATE-1. Readiness before drawing.** (Auto.) Before any schematic plan, model, massing or render, there is a **chosen concept** in `design.yaml` (`project.concept`), or a **recorded skip** with a reason. Nobody has to remember this. Three mechanisms enforce it:
- **The plugin's prompt hook.** It runs `tools/ready_check.py` when a prompt asks for design work, and tells Claude to warn the owner in one or two sentences and offer the next steps. It fires once per session and project. It stays quiet while the concept studio runs, and it also speaks in an empty folder, offering to set up a project.
- **`check_design.py`.** It warns from schematic design on if no concept is recorded, or if the statement is really a style or a feature list.
- **Template `CLAUDE.md`.** It tells every session to check readiness first.

Skipping is fine: the owner may want a straightforward house. It just has to be a choice, not an accident. Even on a skipped project, Claude still asks about taste once, without blocking.

**CR-TASTE-1. Know the owner's taste.** Before generating, read:
- `TASTE.md`: the surprise dial, the ★ questions, and the **this-or-that** pairs. People react to taste better than they describe it.
- The owner's **`TASTE-PROFILE.md`** one folder up, which carries taste from project to project, plus their parked ideas.
- `PRECEDENTS.md`.

If the owner has saved images, read them for patterns of **atmosphere and material**: light, texture, enclosure, mood. Write those patterns down as moves. Never take dimensions from an image (W-SRC-1). After every review, log what the owner reacted to and **why**, in their words. At the end of the project, add the lasting lessons and the liked-but-rejected ideas to `TASTE-PROFILE.md`.

**CR-HARD-1. Only hard limits while exploring.** (Auto: concept mode.) During the concept phase, a concept is out only if it breaks one of these:
- the buildable envelope (setbacks, height, coverage);
- the area budget, ±15% (`project.area_budget_sqft`);
- life-safety feasibility: every bedroom has an outside wall, and the stair fits (C-STAIR-2, C-STAIR-6);
- the program's must-haves and must-nots.

Everything else waits for convergence. That includes room sizes, kitchen triangles, the 2 ft module, standard spans, the program's adjacency matrix, the zone gradient and the style module. Concept sketches live in `concepts/` (one `C-0X.yaml` each, plus an optional `C-0X-spec.yaml` sketch). `check_design.py --concept` checks them, and it runs automatically when `project.phase` is `concept`. W-CHECK-1's "an ERROR blocks progress" means concept-mode errors during this phase. The **contrarian** lens may break **one** must-have if it names it; the owner decides whether that trade is worth it. The priority stack (P-ORDER-1) is untouched: these rules are deferred, not dropped.

**CR-OBVIOUS-1. Name the obvious first.** Before any concepts, write down the **five most predictable answers** to the brief, the ones any builder plan set would offer, in `CONCEPTS.md` and `concepts/obvious.yaml`. No concept may be one of them. They also go to the jury unlabeled, as controls (CR-CRITIC-1).

**CR-SPREAD-1. Generate a spread, not a design.** Each of the six lenses returns two concepts, so about **12** in all. They must differ on these named axes:

| Axis | Positions |
|---|---|
| Parti | bar · L · courtyard · pinwheel · pavilions · thick-wall/poché · free plan |
| Section | single level · split level · double-height heart · stepped with the slope · raised on a plinth or piers |
| Relation to ground | sits on · steps down · floats over · carved in |
| Light | from the south · top-lit · borrowed through courts · filtered |
| Outdoor relation | court inside · porch around · rooms as garden pavilions · one big framed view |
| What it's about | a ritual · a view · a tree · a material · a climate move · a constraint |

Where two concepts share most cells of the spread matrix, replace one of them.

**CR-IDEA-1. Every concept has an idea, drawn.** (Auto: the statement check.) Each concept carries:
- **a one-sentence concept statement**: the generative idea, not a style name and not a feature list. `check_design.py` and `concept_board.py` flag statements that are just a style plus a feature;
- **a parti diagram and a section diagram**, as simple SVGs (about 400×300) with a fixed legend: solid, void or court, entry arrow, sun arc, view axis, ground line, north. They are labeled "not to scale";
- the **key move**;
- **what it gives up**;
- the cards it used.

`tools/concept_board.py` lays every concept out as a card, with the obvious answers greyed as controls. **Look at the board yourself before showing it to the owner** (W-LOOK-1). Style comes later, as a module chosen to serve the idea.

**CR-LENS-1. Generate in separate contexts.** Generate concepts in **parallel subagents**, one lens each: **site · light and climate · ritual · structure and material · constraint as fuel · contrarian**. Each lens sees only:
- the brief summary;
- the **program as areas and must-haves**, without the adjacency matrix, bubble diagram or style;
- the hard limits;
- its own dealt cards.

It never sees the other lenses' output. Where subagents aren't available (for example in claude.ai), run each lens in a fresh chat, or ask for each lens in a separate turn that ignores the earlier ones. This is weaker, but still better than one reply.

**CR-SPECIFIC-1. Feed every lens specifics.** Specific inputs produce specific architecture. Each lens prompt carries:
- site facts: the tree, the view, the noise, the slope;
- for the site and light lenses, the real sun numbers from `tools/sun.py`;
- owner rituals in their own words;
- the **cards dealt by `tools/deal.py`**: one of the owner's precedents, one precedent the owner didn't pick, one analogy and one provocation, all different for each lens.

Never paste a fixed list of examples into a prompt. Examples get reused, and a model's "random" pick is its most typical pick.

**CR-SEARCH-1. Search a family, not just one design.** For concepts that are really families (bars, courts, split levels, pavilions), Claude writes a **sketch generator**: a Python function from parameters to room rectangles. `tools/explore_variants.py` checks each variant in concept mode, drops the ones that break hard limits, merges near-duplicates, and keeps the variants **most different in actual geometry**, on a contact sheet. See `examples/court-house/` (a rooms-only sketch family) and `examples/bar-house/` (a complete one).

**CR-ROUND-1. A second round from the owner's reactions.** Round one maps the space. Then:
1. **Hot / cold sort.** Show the owner all the one-line statements, and take two minutes: hot, cold, or "tell me more". Log it in `TASTE.md`.
2. **Round two.** Dispatch three or four fresh subagents. Each gets two parent concepts, the owner's words, and the jury's "more surprising if…" notes, with one of these tasks:
   - **cross**: A's parti with B's section;
   - **purify**: A with everything removed except its idea;
   - **invert**: A with what it gives up turned into what it's about.
3. The shortlist draws from **both rounds**.

**CR-CRITIC-1. A jury with champions, not an averaged score.** Run three or four **juror subagents**, none of whom wrote a concept, on the **blind pack** from `concept_board.py --jury`. The pack mixes concepts and obvious answers under neutral IDs. The jurors are:
- **the owner's proxy**, who knows only `TASTE.md`;
- **a provocative studio critic**;
- **a builder**;
- **the site**: the neighbors, the street, the tree.

Each juror ranks the entries by **pairwise comparison**, names **one champion** and **one to kill**, each with a reason, and says what would make its champion more surprising while keeping it buildable. **If any juror ranks an obvious answer above the concepts, the round failed.** Rerun the lenses with new cards. The shortlist is every concept with a champion, plus the owner proxy's top pick.

**CR-WALK-1. Walk through it in words.** For each shortlisted concept, write three **first-person walkthroughs** of about 150 words each:
- arriving with groceries in the rain;
- a winter morning;
- a party of twelve.

This tests ritual and delight in a medium Claude handles well, and the owner can feel the house before seeing a plan.

**CR-PUSH-1. Push as named variants, then pull.** Show the pick in three versions side by side:
- **pure**: only the idea, everything else plain;
- **extreme**: one defining parameter taken to its hard limit, by running the generator at its parameter extremes where one exists;
- **inverted**: the cost turned into the point.

The owner chooses how far to go. *Then* converge with the playbook (the Gate 2 checklist) without breaking the concept statement. Pushing first keeps convergence from sanding the idea back to the average.

**CR-KEEP-1. Protect the idea.** (Auto: invariants.) When the concept is chosen, record it in `project.concept`:
- `statement`, `key_move` and `gives_up`;
- 3–5 **invariants**: the facts that make the idea true. Machine-checkable ones get a WARN when broken: `{room: GALLERY, min_length_in: 720}`, `{all_rooms_touch: COURT}`, `{max_room_depth_in: 192}`, `{glazing_share: {wall: S, min: 0.6}}`, `{room_exists: STAIR-HALL}`. Free-text invariants are printed as a checklist;
- 2–3 **moments**: the places of delight that must survive.

At every gate, run a **blind read-back**. A fresh subagent sees only the plan and section, without the statement, and answers "what is this house about, in one sentence?". If it can't recover the idea, the idea has been lost. Raise that with the owner. A change that breaks the idea is an owner decision, logged in `DECISIONS.md`, never a side effect.

**CR-ATMOS-1. Images set the mood, never the geometry.** Mood boards and atmosphere images come from image tools such as Canva. Write each image prompt from the concept statement and label the result "AI-assisted concept" (D-LABEL-1). Never read dimensions or layout off an image.

## The surprise dial

`TASTE.md` holds the owner's **surprise dial** (1–5). Each lens returns two concepts, of the kinds below.
- **Grounded**: a familiar type with one specific, non-obvious idea, done very well. Still never one of the obvious five.
- **Stretch**: a familiar type with one unexpected move.
- **Wild**: the organizing idea itself is unusual.

All of them must pass CR-HARD-1.

| Dial | site · light · ritual · structure · constraint | contrarian | Default push |
|---|---|---|---|
| 1 Familiar | grounded + stretch | stretch + stretch | pure |
| 2 | grounded + stretch | stretch + wild | pure, extreme shown |
| 3 Balanced (default) | site, ritual, structure: grounded + stretch · light, constraint: stretch + wild | stretch + wild | all three shown |
| 4 | ritual: grounded + stretch · others: stretch + wild | wild + wild | extreme |
| 5 Provoke me | stretch + wild | wild + wild | extreme or inverted |

## The concept phase, step by step

1. **Readiness** (CR-GATE-1, CR-TASTE-1). Fill the gaps with the owner. Taste means the dial, the ★ questions and the this-or-that pairs. Precedents means at least 2, each with a move.
2. **Frame.** Write 3–5 design questions, the hard limits (CR-HARD-1) and the obvious list (CR-OBVIOUS-1). Get sun numbers from `sun.py` and deal the cards with `deal.py`.
3. **Diverge.** Six lens subagents in parallel (CR-LENS-1, CR-SPECIFIC-1), each returning 2 concepts with statements and diagrams. Run families through `explore_variants.py` (CR-SEARCH-1). Build the board with `concept_board.py`, and look at it.
4. **Owner's hot / cold sort**, then **round two** (CR-ROUND-1).
5. **Jury** on the blind pack (CR-CRITIC-1). Shortlist the champions plus the owner proxy's pick.
6. **Walkthroughs** for the shortlist (CR-WALK-1). Owner review, with reactions logged to `TASTE.md`.
7. **Push** with pure, extreme and inverted versions (CR-PUSH-1). Record `project.concept` with its invariants and moments (CR-KEEP-1). Log the decision.

**Gate 1.5:** the concept is chosen and recorded, or the skip is recorded. See [CHECKLISTS.md](CHECKLISTS.md#gate-15--concept-chosen).

## Precedents and cards

- [precedents.md](precedents.md) has about 30 houses: canonical works plus vernacular and modest ones, each with **the move to take**. Learn from the move, never copy the building (P-STYLE-1).
- [provocations.md](provocations.md) is the deck of analogies and provocation cards that `deal.py` deals from. Add your own.
