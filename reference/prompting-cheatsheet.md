# Prompting cheat sheet — the sections the pipelines cite

> **Paths.** `${CLAUDE_PLUGIN_ROOT}` in this doc is the toolkit's install folder: the folder above the `reference/` folder this file was read from. Claude Code substitutes it only in commands, agents and skills, not in a file read with the Read tool, so write the real path in its place before you run or open anything here.

The pipelines point at two sections here: the pre-flight scope check (`/cleanup-light`, `/page-design`, `/page-code`, `/page-implement`) and the steelman prompt (`/competitive-anchor`). Most of it is project-agnostic; the project-specific anchors are your CLAUDE.md's Heavy-rigor trigger and your stylesheet and component folders.

## Pre-Flight Scope Check

Before invoking any pipeline, run a 3-item gate. Catches over-invocation, missed risk asymmetry, and reflexive new-primitive creation.

### The 3 items

**1. Rigor check — which pipeline? (what the change alters, not its folder or size)**

`/change-heavy` if the change meets the project's CLAUDE.md **Heavy-rigor trigger** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The rigor trigger):
- It alters a computed or printed figure (a value, a rounding, which figure a row prints, whether a figure prints at all).
- It alters a stored, imported or exported data shape.
- It alters an auth, RLS, tier or payment path.
- It introduces a new data model or API shape.

Otherwise `/cleanup-light`, **at any file count and in any folder**: a label, copy, layout or styling change in a billing module or an export runs light. Its plan stage (a PLAN block and one Fable plan critique) runs when the change touches 3+ files, adds a new abstraction (a new hook, util, component shape or store) or changes styling. A small fix that passes the quick lane's entry test (`/cleanup-light` § The quick lane) gets the edit, its affected tests, one Fable pass and a commit, in a session that's already open.

**2. Risk surface check — does security asymmetry engage?**

If the change touches RLS / auth / payments / exports / secrets / financial calc → security-asymmetric upgrade is active for the Adjudicator.

If not: standard severity rules apply.

**3. Existing-primitive check — am I reaching for new when reuse fits?**

Before any new component/hook/util/style:
- Grep the relevant primitive family (your stylesheets, `src/components/`, etc.)
- Build a variance table: target callsites vs. existing primitive shapes
- Acceptable harmonization: 1-shade color shift, 2-5% bg-tint loss, 2px padding/radius delta
- Propose new primitive ONLY if no existing one is within 2 dimensions of target AND 2+ same-shape callers exist

Skipping this gate is the documented failure mode: plans that reach for a new primitive invert their framing once the Stage 1 audit finds the existing one.

### Output of the gate

```
✅ Rigor: Heavy-rigor trigger met (a new RLS policy alters an RLS path) → /change-heavy
✅ Risk: security-asymmetric upgrade ACTIVE
⚠️  Existing-primitive: 2 candidates found — verify variance before adding new

Proceed to: /page-design (new module page)
With: security asymmetry on
After: re-check existing primitives in Stage 1 source-read
```

The gate runs inside each pipeline's Stage 0 — no separate invocation needed.

## Steelman Library

The steelman pattern — argue the strongest case for the opposing position before committing to your own — is the highest-leverage reasoning prompt in this cheat sheet.

### Unified steelman prompt

```
ultrathink. List the viable alternatives for [DECISION] (2-5).

For each alternative:
- Steelman the strongest case for it (not a strawman)
- Name the hidden assumption that, if wrong, defeats it
- State what it uniquely earns that no other option does

Rank by which wins on THIS specific problem, not generically. If you have a leading option, list it last — its defense has to survive every other alternative's steelman before you commit. If the steelman of any alternative survives, change course.
```

**Binary mode:** plug in 2 alternatives. **N-way mode:** plug in 3-5. Same shape, same discipline.

### User-stance addendum

When the decision is "agree with the owner vs. push back," append:

```
Don't fold under social pressure. The steelman of the opposing position has to be genuinely defeated, not socially conceded. If you can't defeat it, push back with reasoning.
```

The owner wants a critical mentor, not validation.
