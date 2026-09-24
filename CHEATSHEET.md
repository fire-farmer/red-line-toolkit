# Cheat sheet — which command, when, and what to pair

The toolkit is a handful of small pipelines that hand off to each other. This is the map: pick by what you're doing, then follow the arrows.

## Pick by what you're doing

| You're about to… | Reach for | Not this |
|---|---|---|
| Start a work session | `/start-session` | — |
| End a work session (sync + commit) | `/end-session` | — |
| Build a **new multi-page module** | `/module-build` → `/module-sprint` | the page commands directly |
| Build/redesign **one page** | `/page-design` → `/page-code` → `/page-implement` | `/module-build` (overkill for one page) |
| Change existing code **outside your high-risk areas** — any file count, one FU or a whole batch | `/cleanup-light` | `/change-heavy` (too heavy) |
| Change that **reaches a high-risk area** (money math, auth, RLS/migrations, payments, exports) or **adds a new data model / API shape** | `/change-heavy` | `/cleanup-light` (will escalate anyway) |
| Your follow-up backlog has piled up | `/cluster-fus` | — |
| Ship-readiness check on a **whole module** | `/module-audit` | — |
| Responsiveness check at phone width | `/mobile-audit` | — |
| About to commit | `/pre-commit-check` | — |
| Filter noisy AI review feedback | `the-adjudicator` *(usually auto-dispatched)* | running it standalone unless triaging |

**Rule of thumb for change work:** pick by risk, not size. A 20-file styling sweep is `/cleanup-light`; a one-line change to money math or an auth check is `/change-heavy`.

## The common sequences

**The daily loop**
```
/start-session  →  …do the work…  →  /pre-commit-check  →  /end-session
```

**A new module, end to end**
```
/module-build            → locks a Module Spec
   └─ /module-sprint      → walks each page through:
          /page-design    → /page-code → /page-implement   (lock between each)
/module-audit            → pre-ship sweep    (+ /mobile-audit for responsiveness)
```

**A single page** (module already exists)
```
/page-design  →  /page-code  →  /page-implement
```

**Changing existing code**
```
outside the risk areas?   /cleanup-light  ──(meets the heavy trigger)──►  /change-heavy
high-risk / new model?    /change-heavy    (plan → critics → adjudicate → implement → simplify → review)
```

**Clearing the backlog**
```
/cluster-fus  → batch-ready clusters → feed each batch into:
                   /cleanup-light   (any like-type batch, at any size)
                   /change-heavy    (a batch that reaches a high-risk area)
```

**Pre-ship a module**
```
/module-audit  (+ /mobile-audit)  → findings → fixes go through /page-implement
```

## Pairing notes

- **`the-adjudicator` is a referee, not a step you run.** `/change-heavy`, `/cleanup-light`, `/page-code`, `/page-implement`, and `/module-audit` all dispatch it to mark critiques KEEP / DITCH / MODIFY. Run it directly only to triage feedback you already have.
- **`/module-sprint` orchestrates the page trio.** During a sprint you rarely invoke `/page-design`/`/page-code`/`/page-implement` yourself — the sprint does, with a lock between each. Use them standalone for one-off page work.
- **`/cleanup-light` escalates on risk, not size.** If a change turns out to reach a high-risk area or a new data model / API shape, it stops and asks before handing off to `/change-heavy`. A growing file count alone never escalates.
- **Anything you notice mid-change passes the filing bar.** Fix it now if it's the same class as the change; file it only with a named reason it can't wait *and* a pass of the 2-week filter; otherwise drop it with one line in the commit body.
- **A decorrelated Fable review ends every pipeline run on code.** A different model family audits what the orchestrator wrote; it finds, never fixes. A new checking script it recommends is built only on your yes.
- **`/cluster-fus` feeds the change pipelines** — it doesn't fix anything itself; it groups the backlog so you can batch like with like.
- **Audits are diagnostic; `/page-implement` is the fixer.** `/module-audit` and `/mobile-audit` never auto-fix — they produce findings you route to `/page-implement`.
- **`/pre-commit-check` and `/end-session` both touch commits** — `/pre-commit-check` is the truth/scope gate *before* a commit; `/end-session` writes the handoff and makes the session's commit. Run the check first.

## What dispatches what

```
/change-heavy     → writing-plans · code-reviewer ×2 + Fable plan critic · the-adjudicator · subagent-driven-development · /simplify · review-pr + Fable code audit · /security-review · Fable re-audit
/cleanup-light    → (PLAN + Fable plan critic when 3+ files, a new abstraction or styling) · scope · code-reviewer · (security · simplifier · silent-failure · type-design · test-coverage, conditional) · the-adjudicator · Fable audit
/page-code        → 3 critics · the-adjudicator
/page-implement   → code-reviewer · silent-failure-hunter · the-adjudicator · /simplify · review-pr + Fable audit
/module-audit     → module-recon · lens-critic · cross-cut-critic · red-team · steelman · repro-sketcher · synthesizer · the-adjudicator · verifier · fix-planner
```

See [the guides](https://redlinedigital.dev/guides/) for the full walkthrough of each.
