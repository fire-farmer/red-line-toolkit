# Cheat sheet — which command, when, and what to pair

The toolkit is a handful of small pipelines that hand off to each other. This is the map: pick by what you're doing, then follow the arrows.

## Pick by what you're doing

| You're about to… | Reach for | Not this |
|---|---|---|
| Start a work session | `/start-session` | — |
| End a work session (sync + commit) | `/end-session` | — |
| Build a **new multi-page module** | `/module-build` → `/module-sprint` | the page commands directly |
| Build/redesign **one page** | `/page-design` → `/page-code` → `/page-implement` | `/module-build` (overkill for one page) |
| Change existing code, **1–2 files, low risk** | `/cleanup-light` | `/change-heavy` (too heavy) |
| Change existing code, **3+ files / new abstractions / risk surface** (auth, payments, data model, calc) | `/change-heavy` | `/cleanup-light` (will escalate anyway) |
| Your follow-up backlog has piled up | `/cluster-fus` | — |
| Ship-readiness check on a **whole module** | `/module-audit` | — |
| Responsiveness check at phone width | `/mobile-audit` | — |
| About to commit | `/pre-commit-check` | — |
| Filter noisy AI review feedback | `the-adjudicator` *(usually auto-dispatched)* | running it standalone unless triaging |

**Rule of thumb for change work:** if you can't name the ≤2 files up front, it's probably `/change-heavy`, not `/cleanup-light`.

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
small (≤2 files)?   /cleanup-light  ──(scope blows up)──►  /change-heavy
big / risky?        /change-heavy    (plan → critics → adjudicate → implement → simplify → review)
```

**Clearing the backlog**
```
/cluster-fus  → batch-ready clusters → feed each batch into:
                   /cleanup-light   (small like-type batch)
                   /change-heavy    (large or risky batch)
```

**Pre-ship a module**
```
/module-audit  (+ /mobile-audit)  → findings → fixes go through /page-implement
```

## Pairing notes

- **`the-adjudicator` is a referee, not a step you run.** `/change-heavy`, `/cleanup-light`, `/page-code`, `/page-implement`, and `/module-audit` all dispatch it to mark critiques KEEP / DITCH / MODIFY. Run it directly only to triage feedback you already have.
- **`/module-sprint` orchestrates the page trio.** During a sprint you rarely invoke `/page-design`/`/page-code`/`/page-implement` yourself — the sprint does, with a lock between each. Use them standalone for one-off page work.
- **`/cleanup-light` self-escalates.** If a "small" cleanup turns out to touch more than its scope, it hands off to `/change-heavy` rather than plowing ahead.
- **`/cluster-fus` feeds the change pipelines** — it doesn't fix anything itself; it groups the backlog so you can batch like with like.
- **Audits are diagnostic; `/page-implement` is the fixer.** `/module-audit` and `/mobile-audit` never auto-fix — they produce findings you route to `/page-implement`.
- **`/pre-commit-check` and `/end-session` both touch commits** — `/pre-commit-check` is the truth/scope gate *before* a commit; `/end-session` writes the handoff and makes the session's commit. Run the check first.

## What dispatches what

```
/change-heavy     → writing-plans · code-reviewer ×2 · the-adjudicator · executing-plans · /simplify · review-pr · /security-review
/cleanup-light    → code-reviewer · (security · simplifier, conditional) · the-adjudicator
/page-code        → 3 critics · the-adjudicator
/page-implement   → code-reviewer · silent-failure-hunter · the-adjudicator · /simplify · review-pr
/module-audit     → module-recon · lens-critic · cross-cut-critic · red-team · steelman · repro-sketcher · synthesizer · the-adjudicator · verifier · fix-planner
```

See [the guides](https://redlinedigital.dev/guides/) for the full walkthrough of each.
