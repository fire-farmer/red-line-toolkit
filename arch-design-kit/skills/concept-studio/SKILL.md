---
name: concept-studio
description: |
  The creative concept phase for a house or small building (playbook 08): check readiness with the owner, frame design questions, ban the obvious, generate 8-12 genuinely different concepts in parallel through separate lenses, explore concept families parametrically, critique them for boldness, shortlist three, record the owner's reactions to their taste, push the chosen concept, and record it before schematic design. Use when the user wants concepts, options, ideas, a more creative or less generic design, or a fresh start on a design, and whenever the arch-design-kit readiness check reports that no concept is chosen.
---

# Concept studio

You are running the concept phase of `${CLAUDE_PLUGIN_ROOT}/playbook/08-concept-design.md`. Read that chapter first; its rule IDs (CR-…) are cited below. The goal is **range first, then choice**: many different ideas, judged for boldness and fit, before the playbook makes one of them correct.

## 0. Readiness (CR-GATE-1): never skip this conversation

Run `python3 ${CLAUDE_PLUGIN_ROOT}/tools/ready_check.py .` in the project folder.

- **No project files yet:** copy `${CLAUDE_PLUGIN_ROOT}/templates/*` into the folder first.
- **Anything missing:** tell the owner plainly which pieces are missing and why each matters to creativity, then fill them together. Don't skip the gaps silently.
  - **Taste:** ask the six ★ questions from `TASTE.md`, one or two at a time, conversationally. **Always ask for the surprise dial (1–5).** Write their answers in their own words.
  - **Precedents:** offer 5–6 entries from `${CLAUDE_PLUGIN_ROOT}/playbook/precedents.md` that fit the brief, and ask for any building, room or photo they love. Record the move to take from each, and why it fits.
  - **Brief or program gaps:** fill them in conversation, or note them as open questions. Never invent site or code facts (W-BRIEF-1).
- **The owner wants to skip concepts:** fine. Record `project.concept.status: skipped` and their `skip_reason` in `design.yaml`, and hand back to the arch-design-playbook workflow.

## 1. Frame

In `CONCEPTS.md` (copy it from the templates if missing):

1. Restate the brief as **3–5 design questions**, e.g. "How does a 40 ft lot get south light into every room?"
2. Write the **hard limits** (CR-HARD-1): the envelope, the area budget ±15%, life-safety feasibility, and the must-haves and must-nots. Nothing else constrains this phase.
3. Write **the obvious list** (CR-OBVIOUS-1): the five most predictable answers to the brief. No concept may be one of them.
4. Read the **surprise dial** from `TASTE.md` and set the mix of grounded, stretch and wild concepts (chapter 08).

## 2. Diverge in separate contexts (CR-LENS-1, CR-SPECIFIC-1)

Dispatch **one subagent per lens, all in parallel, in a single message**. Use these lenses: site · light and climate · ritual · structure and material · constraint as fuel · contrarian. Each subagent sees only its own lens, never another's output. Give each one this prompt, filled in:

> You are generating architectural concepts through ONE lens: **<lens>**.
> Brief: <3–5 line summary> · Design questions: <list> · Hard limits: <list> · Site specifics: <the tree, the view, the slope, the street, sun and wind> · Owner rituals and taste: <from TASTE.md, in the owner's words> · Precedent moves to consider: <2–3 from PRECEDENTS.md, with why> · One cross-domain analogy to consider: <e.g. a monastery cloister, a boat cabin, an engawa, a threshing floor, a library stack> · **Do not propose any of these obvious answers:** <the obvious list>.
> Return **2 concepts**: one <grounded | stretch> and one <stretch | wild> (follow the surprise dial). For each give: a name; a **one-sentence concept statement** (the generative idea, not a style and not a feature list); the **key move**; a **diagram described in words** (parti, how you enter, where the light comes from); a **section idea**; **what it gives up**; and the precedent or analogy it uses. Respect the hard limits. Ignore every other rule: they come later.

Then, yourself:

- **Assemble** the concepts into the spread matrix (CR-SPREAD-1). Where two share most of their cells, keep the stronger, and send one lens back out for a replacement unlike anything already on the board.
- **Search families** (CR-SEARCH-1). For any concept that's really a family (bars, courtyards, split levels, pavilions), write a generator modeled on `${CLAUDE_PLUGIN_ROOT}/examples/bar-house/variants.py`. Run `python3 ${CLAUDE_PLUGIN_ROOT}/tools/explore_variants.py <generator> --keep 6`, and put the contact sheet on the board. The generator is a sketch tool: room rectangles at the right scale, with the hard limits respected.

## 3. Critique (CR-CRITIC-1)

Dispatch **one critic subagent that did not write the concepts**. Run it on a different model family from yours if one is available, for a less correlated view. Give it the concept board, the obvious list, `TASTE.md`, and these instructions:

> Score each concept 1–5 on originality (vs. the obvious list), coherence (does every part serve the idea), site fit, delight (is there a moment you'd remember), and taste fit (vs. TASTE.md). For each, name the boldest move, the weakest part, and what would make it more surprising while staying buildable. Flag any concept that is secretly one of the obvious answers. Do not judge code compliance; that comes later.

Write the scores into the board's critique table.

## 4. Shortlist and owner review

Shortlist **three**: the **strongest**, the **boldest**, and the **best fit to taste**. They may overlap, so fill any gap from the next-ranked concept. Present each one with:

- its statement and key move;
- a diagram: an SVG from a generator, or a quick plan from `render_plan.py` on a rough spec;
- what it gives up;
- optionally a mood image (CR-ATMOS-1), labeled "AI-assisted concept".

Ask the owner to react, not just pick: what excites them, what worries them, what they'd steal from the others. **Log their reactions in `TASTE.md`'s reactions log, in their words** (CR-TASTE-1).

## 5. Push, then record (CR-PUSH-1, CR-KEEP-1)

1. Take the pick further than feels comfortable, by about 30% (scaled by the surprise dial): more of whatever the idea is. Show the pushed version next to the original, and let the owner choose how far to go.
2. Record the result in `design.yaml`:
   ```yaml
   project:
     concept: {status: chosen, id: C-0X, statement: "<one sentence>", board: CONCEPTS.md}
   ```
3. Note the decision in `DECISIONS.md`, including what the concept gives up.
4. Hand off to schematic design (playbook 07, Gate 2). From here on, the arch-design-playbook loop makes the design correct, and at every gate the concept statement must still be true (CR-KEEP-1).

## Don'ts

- Don't generate concepts in one long reply. Separate contexts are the point (CR-LENS-1).
- Don't apply room-size, kitchen or module rules during divergence (CR-HARD-1).
- Don't present a style as a concept ("a modern farmhouse") or a feature list as an idea ("open plan with an island").
- Don't read dimensions off images (CR-ATMOS-1).
- Don't skip the readiness conversation. The owner asked to be warned (CR-GATE-1).
