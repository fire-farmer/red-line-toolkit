---
name: concept-studio
description: |
  The creative concept phase for a house or small building (playbook 08): readiness with the owner (taste, surprise dial, precedents), design questions and the obvious list, about 12 concepts from six parallel lenses fed with dealt cards, parametric sketch families, a visual board, the owner's hot/cold sort, a second round of crossbreeds, a blind jury with champions, walkthroughs, named push variants, and a concept recorded with invariants and moments. Use when the user wants concepts, ideas, options, a more creative or less generic design, or a fresh start, and whenever the arch-design-kit readiness check says no concept is chosen.
---

# Concept studio

You are running the concept phase in `${CLAUDE_PLUGIN_ROOT}/playbook/08-concept-design.md`. Read it first; the CR-… IDs below refer to it. Aim for **range first, then choice**: many genuinely different ideas, two rounds, a blind jury, then the owner picks, before the playbook makes the pick correct. Tools live in `${CLAUDE_PLUGIN_ROOT}/tools/`. Set `project.phase: concept` in `design.yaml` while this runs. That puts the checker in concept mode and keeps the pre-design warning quiet.

## 0. Readiness (CR-GATE-1, CR-TASTE-1)

Run `python3 ${CLAUDE_PLUGIN_ROOT}/tools/ready_check.py .`. If there are no project files yet, copy `${CLAUDE_PLUGIN_ROOT}/templates/*` into the folder first. Fill the gaps *with* the owner, a question or two at a time, in their words:

- **Taste.** The **surprise dial** (always ask), the ★ questions, and the **this-or-that pairs** in `TASTE.md`. People react better than they describe. If `TASTE-PROFILE.md` exists one folder up, start from it and confirm what still holds. If the owner has saved images, ask for them, read them for atmosphere and material patterns only, and write those down as moves.
- **Precedents.** Offer 5–6 entries from `${CLAUDE_PLUGIN_ROOT}/playbook/precedents.md` that suit the brief, mixing canonical and vernacular. Ask for any building, room or photo they love, and record the move to take and why it fits.
- **Brief or program gaps.** Ask about them, or list them as open questions. Never invent site or code facts (W-BRIEF-1).
- **Area budget.** Put `project.area_budget_sqft` in `design.yaml`.
- **The owner wants to skip:** record `project.concept.status: skipped` and their `skip_reason`, and hand back to the arch-design-playbook workflow.

## 1. Frame

In `CONCEPTS.md` and the `concepts/` folder:

1. Write **3–5 design questions**.
2. Write the **hard limits** (CR-HARD-1).
3. Write **the obvious list** (CR-OBVIOUS-1): the five most predictable answers. Put them in `CONCEPTS.md` §3 and in `concepts/obvious.yaml` as a YAML list.
4. Run `python3 ${CLAUDE_PLUGIN_ROOT}/tools/sun.py --lat <site latitude>` and keep the numbers for the site and light lenses.
5. Run `python3 ${CLAUDE_PLUGIN_ROOT}/tools/deal.py . --round 1` to deal each lens its own cards.
6. Read the surprise dial and take each lens's two kinds (grounded, stretch or wild) from the dial table in chapter 08.

## 2. Diverge in separate contexts (CR-LENS-1, CR-SPECIFIC-1, CR-SPREAD-1, CR-IDEA-1)

Dispatch **six subagents in parallel, in one message**: site · light · ritual · structure · constraint · contrarian. Each gets this prompt, filled in, and nothing else. Leave out the adjacency matrix, the bubble diagram, the style and the other lenses:

> You are generating house concepts through ONE lens: **<lens>**.
> Brief: <3–5 lines> · Design questions: <list> · Program: <room list with areas only; must-haves; must-nots> · Hard limits: <envelope, area budget ±15%, every bedroom on an outside wall, stair fits> · Site: <the specific facts> <for site and light lenses: the sun.py numbers> · The owners, in their words: <rituals and taste lines> · Your cards: <this lens's block from deal.py> · Do **not** propose any of these: <the obvious list>.
> <For the contrarian lens only: you may break ONE must-have if you name it and say what the trade buys.>
> Return **2 concepts**: one **<kind 1>** and one **<kind 2>**. For each, write a file `concepts/C-<NN>.yaml` with these keys: id, name, round: 1, lens, kind, statement (one sentence, the generative idea: not a style, not a feature list), key_move, section_idea, gives_up, uses (which cards). Also write `concepts/C-<NN>-parti.svg` and `C-<NN>-section.svg`: simple diagrams about 400×300, not to scale, with this legend: solid = filled grey, void/court = white with a thin outline, entry = arrow, sun = arc, view = dashed line, ground = heavy line, north arrow. Use concept IDs <assigned range>.

Give each lens its own ID range (C-01–02, C-03–04, …) so the files never collide. Then:

- **Families** (CR-SEARCH-1). Where a concept is a family, write a sketch generator modeled on `${CLAUDE_PLUGIN_ROOT}/examples/court-house/variants.py`, with room rectangles only. Run `python3 ${CLAUDE_PLUGIN_ROOT}/tools/explore_variants.py <generator> --keep 6 --area-target <budget>`.
- **Board.** Run `python3 ${CLAUDE_PLUGIN_ROOT}/tools/concept_board.py .`. Render `concepts/index.html` to an image and **look at it** before the owner does: is the range real, is a statement flagged, are two concepts the same idea? Replace duplicates with a fresh lens call using a new deal (`--round 1b`).
- **Without subagents** (e.g. claude.ai): ask the owner to run each lens in a fresh chat, or do one lens per turn without rereading the earlier turns. Say plainly that this is weaker.

## 3. Owner's hot / cold sort, then round two (CR-ROUND-1)

1. Show the owner every statement on one screen, and ask for **hot / cold / tell me more** on each: two minutes, no explanations needed. Log the result in `TASTE.md`.
2. Run `deal.py . --round 2`. Dispatch **3–4 fresh subagents**. Each gets two parent concepts (statements, diagrams, gives-up), the owner's words about them, and one task:
   - **cross**: A's parti with B's section;
   - **purify**: A with everything removed except its idea;
   - **invert**: what A gives up becomes what it's about.
   They write `C-<NN>.yaml` with `round: 2` and `parents`, plus diagrams. Rebuild the board.

## 4. Blind jury (CR-CRITIC-1)

Run `concept_board.py . --jury` to get `concepts/jury.md`, the blind pack with the obvious answers mixed in. Dispatch **four juror subagents in parallel**, each seeing only the pack and its own brief:
- **owner's proxy**: give it only `TASTE.md`;
- **provocative studio critic**;
- **builder**: cost, buildability, weather;
- **the site**: the neighbors, the street, the tree.

Each ranks the entries by pairwise comparison, names **one champion** and **one to kill** with reasons, and says what would make its champion more surprising while keeping it buildable. Map the IDs back with `concepts/jury-key.json`. **If any juror ranks an OBVIOUS entry above the concepts, the round failed.** Tell the owner, and rerun step 2 with new cards (`--round 3`). The shortlist is every concept with a champion, plus the owner proxy's top pick, usually 3–4 concepts.

## 5. Walkthroughs and owner review (CR-WALK-1)

For each shortlisted concept, write three first-person walkthroughs of about 150 words: arriving with groceries in the rain, a winter morning, a party of twelve. Show the owner each concept's card (statement, diagrams, gives-up), its walkthroughs, the jurors' champion reasons and, optionally, one mood image labeled "AI-assisted concept" (CR-ATMOS-1). Ask what excites them, what worries them, and what they'd steal from another concept. **Log their reactions in their own words** in `TASTE.md`.

## 6. Push, then record (CR-PUSH-1, CR-KEEP-1)

1. Show the pick as **pure / extreme / inverted**. For family concepts, run the generator at its parameter extremes. The dial sets which version you lead with, and the owner chooses.
2. Record the result in `design.yaml`:
   ```yaml
   project:
     phase: schematic
     concept:
       status: chosen
       id: C-07
       statement: "<one sentence>"
       key_move: "<one line>"
       gives_up: "<one line>"
       invariants:            # 3-5; dicts are checked automatically, strings are listed
         - {all_rooms_touch: COURT}
         - {glazing_share: {wall: S, min: 0.6}}
         - "the entry is through the garden"
       moments:
         - "breakfast in the east corner of the court, low sun on the wall"
   ```
3. Log the decision in `DECISIONS.md`, including what the concept gives up. Add parked ideas the owner liked to `TASTE-PROFILE.md` one folder up (create it from `TASTE.md` if missing).
4. Hand back to the arch-design-playbook loop (playbook 07, Gate 2). At every later gate, run a **blind read-back**: a fresh subagent sees only the current plan and a section, without the statement, and says in one sentence what the house is about. If the idea isn't recoverable, raise it with the owner.

## Don'ts

- Don't generate concepts in one long reply, and don't give lenses each other's output (CR-LENS-1).
- Don't paste fixed example lists into prompts. Deal cards instead (CR-SPECIFIC-1).
- Don't apply room-size, kitchen, module, adjacency or style rules while exploring (CR-HARD-1).
- Don't average scores. Champions carry bold work (CR-CRITIC-1).
- Don't read dimensions off images (CR-ATMOS-1).
- Don't skip the readiness conversation: the owner asked to be warned (CR-GATE-1).
