# Cheat sheet — which command, when, and what to pair

The toolkit is a handful of small pipelines that hand off to each other. This is the map: pick by what you're doing, then follow the arrows.

## Pick by what you're doing

| You're about to… | Reach for | Not this |
|---|---|---|
| Start a work session | `/start-session` | — |
| End a work session (sync + commit) | `/end-session` | — |
| Build a **new multi-page module** | `/module-build` → `/module-sprint` | the page commands directly |
| Build/redesign **one page** | `/page-design` → `/page-code` → `/page-implement` | `/module-build` (overkill for one page) |
| Change existing code that **alters no figure, data shape or protected path** — any file count, one FU or a whole group step, labels and layout in a risk area included | `/cleanup-light` | `/change-heavy` (too heavy) |
| A small covered fix: at most 2 files, an existing test covering it, nothing shared or risky | `/cleanup-light` (its quick lane) | a full run |
| Change that **alters a computed or printed figure, a stored/imported/exported data shape, or an auth, RLS, tier or payment path**, or **adds a new data model / API shape** | `/change-heavy` | `/cleanup-light` (will hand off anyway) |
| See the follow-up backlog by group step | `/cluster-fus` | — |
| Ship-readiness check on a **whole module** | `/module-audit` | — |
| Responsiveness check at phone width | `/mobile-audit` | — |
| Size up competitors before scoping a feature | `/competitive-anchor` | — |
| Audit a commit you're about to make by hand | `/pre-commit-check` | — (the pipelines run it for you) |
| Filter noisy AI review feedback | `the-adjudicator` *(usually auto-dispatched)* | running it standalone unless triaging |

**Rule of thumb for change work:** pick by what the change alters, not its size or folder. A 20-file styling sweep is `/cleanup-light`; so is a label change inside a billing module. A one-line change to a computed figure or an auth check is `/change-heavy`. Borderline → the heavier one.

## The common sequences

**The daily loop**
```
/start-session  →  …a pipeline run, which commits locally and reports…  →  /end-session
```

**A new module, end to end**
```
/module-build            → locks a Module Spec
   └─ /module-sprint      → walks each page through:
          /page-design    → /page-code → /page-implement
/module-audit            → pre-ship sweep    (+ /mobile-audit for responsiveness)
```

**A single page** (module already exists)
```
/page-design  →  /page-code  →  /page-implement
```

**Changing existing code**
```
alters nothing protected?   /cleanup-light  ──(meets the heavy trigger)──►  /change-heavy
alters a figure / shape /   /change-heavy    (plan → critics + Fable → adjudicate + lock → implement
  protected path?                             → simplify → review + Fable → adjudicate → Fable re-audit)
```

**Clearing the backlog**
```
/cluster-fus  → group steps → feed each into:
                   /cleanup-light   (a group step, at any size)
                   /change-heavy    (a group step that meets the heavy trigger)
```

**Pre-ship a module**
```
/module-audit  (+ /mobile-audit)  → findings → fixes go through /page-implement
```

## Pairing notes

- **A run never waits on you for a programming call.** It decides, commits locally and reports: verdicts absorbed, plan locks, fixes, FUs filed or closed. Only design, copy, UX, product calls, what loads into every session (rulebook, memory) and outward actions (push, prod database, anything sent) wait for you; a design or product item is parked as an `owner decision` row that `/start-session` asks you.
- **`the-adjudicator` is a referee, not a step you run.** `/change-heavy`, `/cleanup-light`, `/page-design`, `/page-code`, `/page-implement` and `/module-audit` dispatch it to mark critiques KEEP / DITCH / MODIFY. Run it directly only to triage feedback you already have.
- **`/module-sprint` orchestrates the page trio.** During a sprint you rarely invoke the page commands yourself. Use them standalone for one-off page work.
- **`/cleanup-light` hands off on what a change alters, not its size.** If a change turns out to meet the Heavy-rigor trigger, it hands the work to `/change-heavy`. A growing file count alone never escalates.
- **Anything you notice mid-change passes the filing bar.** Fix it now if it's the same class as the change, or a real issue in the area the change works (a minor tweak included); file it only for a completely separate area or your call, with a named reason *and* a pass of the 2-week filter; otherwise drop it with one line in the commit body.
- **A decorrelated Fable review is in every pipeline run on code.** A `fable-seat` on a different model family audits what the orchestrator wrote; it finds, never fixes. `fable-seat-guard` checks the seat really ran on the other family.
- **The anchor sweep closes what you're already near.** Before review, the pipelines list the open FUs anchored to the files the change touches and fix them in the same run.
- **Audits are diagnostic; `/page-implement` is the fixer.** `/module-audit` and `/mobile-audit` never auto-fix.
- **`/pre-commit-check` runs inside every committing pipeline**, in a subagent. Run it yourself only for a commit you make by hand.

## What dispatches what

```
/change-heavy     → stack skills · writing-plans · code-reviewer ×2 + Fable plan critic · the-adjudicator · subagent-driven-development
                    · /simplify · anchor sweep · review-pr (+ /security-review on risk) + Fable code audit · the-adjudicator · Fable re-audit
                    · /pre-commit-check
/cleanup-light    → stack skills · (PLAN + Fable plan critic when 3+ files, a new abstraction or styling) · anchor sweep
                    · scope · code-reviewer · simplifier · (security · silent-failure · type-design · test-coverage, on the diff's counts;
                    a prose critic for a prose-only diff) + Fable audit · the-adjudicator · Fable re-audit of fixes · /pre-commit-check
/page-design      → 3 critics · the-adjudicator
/page-code        → 3 critics · the-adjudicator
/page-implement   → /simplify · anchor sweep · review-pr + /security-review + Fable audit · the-adjudicator · /pre-commit-check
/module-audit     → module-recon · lens-critic · cross-cut-critic · red-team · steelman · repro-sketcher · synthesizer · the-adjudicator
                    · fix-planner · verifier
```

The shared rules behind all of these are in [`reference/`](reference/). See [the guides](https://redlinedigital.dev/guides/) for the full walkthrough of each.
