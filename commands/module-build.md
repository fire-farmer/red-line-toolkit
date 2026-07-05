---
description: Apex orchestration pipeline for new modules. Drafts module concept, architecture sketch, and phased page breakdown, then locks the output as a Module Spec doc. Use when starting a new module (e.g., Reports, Settings, Team, Billing).
argument-hint: [module name + brief purpose]
allowed-tools: Read, Write, Task, AskUserQuestion, Skill
---

# /module-build

You are running the **/module-build pipeline** — apex orchestration for new modules. The user invoked this because they're starting a new module and need a frozen spec before per-page design work begins. **No internal critique cycle at this stage** (concept-stage critique produces noise; trust downstream `/page-design` and `/page-code` to surface plan errors).

User's invocation argument (module name + purpose): **$ARGUMENTS**

---

## Stage 0 — Pre-flight scope check

Read CLAUDE.md "Project Vision" section for the canonical module list. Read STACK.md for the current task tree.

Verify this is genuinely a new module (not a sub-feature of an existing one). If the invocation is for a sub-feature, redirect to `/page-design` and exit.

---

## Stage 1 — Concept

Invoke the `superpowers:brainstorming` skill to draft a Module Concept covering:
- **Goal:** what this module exists to do for the user
- **Scope (in / out):** what's included; what's explicitly deferred
- **Success criteria:** how we'll know it works (metrics, user behaviors)
- **User value:** the specific competitive gap or pain it addresses

Surface the draft. Then use `AskUserQuestion` to compel a structural pause:

- **Question:** *"Concept draft ready. Approve to proceed to Architecture sketch?"*
- **Options:**
  - `Approve — proceed to Stage 2` → continue
  - `Redirect — revise concept` → take user redirection and re-draft
  - `Exit — defer this module` → stop; output a brief note for STACK.md

---

## Stage 2 — Architecture sketch (auto)

Auto-continues from approved Concept. Draft:
- **Data model deltas:** what new tables / columns / relationships extend the core data model (see CLAUDE.md for the canonical schema)
- **Page list:** every page in the module with a one-line purpose
- **Integration points:** which other modules / APIs / external services this module connects to
- **Tier gating:** which tier (your plan tiers) gets which capability

No pause — auto-continues to Phase breakdown.

---

## Stage 3 — Phase breakdown

Group pages from Stage 2 into phases:
- **Phase A (MVP):** minimum viable cut — pages required to deliver core user value
- **Phase B+:** follow-up phases with dependencies mapped

For each phase, output:
- Pages list
- Dependencies on other modules or phases
- Acceptance criteria

Surface the breakdown. Use `AskUserQuestion` to compel a structural pause:

- **Question:** *"Phase breakdown drafted. Lock the Module Spec to disk?"*
- **Options:**
  - `Lock — write Module Spec` → proceed to Stage 4
  - `Revise — change phase boundaries` → take redirection and re-draft
  - `Exit — keep draft in conversation only` → stop without writing

---

## Stage 4 — Lock

Write the Module Spec to `docs/plans/YYYY-MM-DD-module-<slug>-spec.md` with frontmatter:

```yaml
---
status: locked
date: <ISO date>
module: <module name>
phases: [list of phase names]
---
```

---

## Done

Summarize:
- Path to the locked Module Spec
- Phase count and total pages
- Next step: invoke `/page-design <page-name>` per page in Phase A

**Effectiveness telemetry — append on every terminated run.** Via Bash, append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). Over time this is the signal for how much spec-shaping the apex pipeline produces per module — phase/page counts at lock are the proxy for module scope. `outcome` is `spec-locked` when Stage 4 wrote the spec to disk, or `abandoned` when the user exited at Stage 1 or Stage 3 without a lock (emit with `phases:0,pages:0`). `rigor` is always `heavy` — module bring-up is apex-rigor by definition.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"module-build\",\"outcome\":\"<spec-locked|abandoned>\",\"rigor\":\"heavy\",\"phases\":<n>,\"pages\":<n>}" >> ~/.claude/metrics.jsonl
```

`phases` is the count of phases in the locked spec (Stage 3 breakdown); `pages` is the total pages planned across all phases (Stage 2 page list). On an `abandoned` close, emit with both counts `0`.

---

## Notes for Claude executing this command

- **No internal critique.** Concept-stage critique produces noise — trust downstream `/page-design` and `/page-code` to catch plan errors.
- **Two mandatory pauses:** after Concept (Stage 1→2) and before Lock (Stage 3→4). Use `AskUserQuestion`, not prose "please confirm."
- **Stay generic at apex.** Don't get into per-page design here. That's `/page-design`'s job.
- **Anchor to CLAUDE.md "Project Vision".** Module list and tier structure are canonical.
