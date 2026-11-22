# Cheat sheet — which command, when, and what to pair

The toolkit is eight commands that hand off to each other. You run six: `/start-session`, `/end-session`, `/cleanup-light`, `/page-design`, `/module-audit` and `/mobile-audit`. The pipelines run the other two: `/change-heavy` (reached through `/cleanup-light`, still runnable directly) and `/pre-commit-check`. This is the map: pick by what you're doing, then follow the arrows.

## Pick by what you're doing

| You're about to… | Reach for | Not this |
|---|---|---|
| Start a work session | `/start-session` | — |
| End a work session (sync + commit) | `/end-session` | — |
| Make **any change**: an FU, a group step, a campaign step or a named task, at any file count | `/cleanup-light` | picking `/change-heavy` yourself (it hands off when a change needs it) |
| A small covered fix: at most 2 files, an existing test covering it, nothing shared or risky | `/cleanup-light` (its quick lane) | a full run |
| Change that **alters a computed or printed figure, a stored/imported/exported data shape, or an auth, RLS, tier or payment path**, or **adds a new data model / API shape** | `/cleanup-light`, which hands it to `/change-heavy` (or run `/change-heavy` directly) | — |
| Start a **new module** | its design spec, written in conversation with `superpowers:brainstorming` and approved by you (`reference/pipeline-shared.md` § A module's design spec) | starting with code |
| Design **one page or screen** | `/page-design` | coding it from a description |
| Build from a **locked design** | `/cleanup-light "plan <module> from <locked design>"`, then each campaign step through `/cleanup-light` | skipping the plan |
| Ship-readiness check on a **whole module** | `/module-audit` | — |
| Responsiveness check at phone width | `/mobile-audit` | — |
| See the follow-up backlog by group step | `/start-session` (its brief lists each group step) | — |
| Audit a commit you're about to make by hand | `/pre-commit-check` | — (the pipelines run it for you) |
| Filter noisy AI review feedback | `the-adjudicator` *(usually auto-dispatched)* | running it standalone unless triaging |

**Rule of thumb for change work:** the pipeline is picked by what the change alters, not its size or folder. A 20-file styling sweep stays in `/cleanup-light`; so does a label change inside a billing module. A one-line change to a computed figure or an auth check goes to `/change-heavy`. Borderline → the heavier one.

## The order

**Every session**
```
/start-session  →  …the work: pipeline runs, each committing locally and reporting…  →  /end-session
```

**Any change**
```
/cleanup-light  ──(meets the heavy trigger)──►  /change-heavy
                                                  (plan → critics + Fable → adjudicate + lock → implement
                                                   → simplify → review + Fable → adjudicate → Fable re-audit)
```

**A new module**
```
design spec       → in conversation, with superpowers:brainstorming; you approve it
/page-design      → per screen; you lock each design
/cleanup-light "plan <module> from <locked design>"
                  → a /change-heavy planning run: a part-level code plan, critiqued and locked,
                    written as the module's campaign when it's larger than one run
campaign steps    → each a /cleanup-light run that writes its own task plan and runs the design gates
```

**Closing a module**
```
/module-audit  → its fix groups through /cleanup-light  →  /mobile-audit  → its fixes through /cleanup-light
```

## Pairing notes

- **A run never waits on you for a programming call.** It decides, commits locally and reports: verdicts absorbed, plan locks, fixes, FUs filed or closed. Only design, copy, UX, product calls, what loads into every session (rulebook, memory) and outward actions (push, prod database, anything sent) wait for you; a design or product item is parked as an `owner decision` row that `/start-session` asks you.
- **Two calls are yours by design:** a module's design spec, approved in the conversation that writes it, and each `/page-design` lock. A `/page-design` run started unattended passes `--park`, and its lock waits as an owner-decision row.
- **`the-adjudicator` is a referee, not a step you run.** `/change-heavy`, `/cleanup-light`, `/page-design` and `/module-audit` dispatch it to mark critiques KEEP / DITCH / MODIFY. Run it directly only to triage feedback you already have.
- **`/cleanup-light` hands off on what a change alters, not its size.** If a change turns out to meet the Heavy-rigor trigger, it hands the work to `/change-heavy`. A growing file count alone never escalates. Planning a module from its locked design always goes heavy.
- **Work from a locked design adds gates.** The change pipelines write a characterization test and browser-spec cases, compare the build with the mockup at 375px and desktop width, re-read the figures and spec decisions against the built page, and run `/security-review` on every run.
- **Anything you notice mid-change passes the filing bar.** Fix it now if it's the same class as the change, or a real issue in the area the change works (a minor tweak included); file it only for a completely separate area or your call, with a named reason *and* a pass of the 2-week filter; otherwise drop it with one line in the commit body.
- **A decorrelated Fable review is in every pipeline run on code.** A `fable-seat` on a different model family audits what the orchestrator wrote; it finds, never fixes. `fable-seat-guard` checks the seat really ran on the other family.
- **The anchor sweep closes what you're already near.** Before review, the pipelines list the open FUs anchored to the files the change touches and fix them in the same run.
- **Audits are diagnostic; `/cleanup-light` is the fixer.** `/module-audit` and `/mobile-audit` never auto-fix.
- **`/pre-commit-check` runs inside every committing pipeline**, in a subagent. Run it yourself only for a commit you make by hand.

## What dispatches what

```
/change-heavy     → stack skills · writing-plans · code-reviewer ×2 + Fable plan critic · the-adjudicator · subagent-driven-development
                    · /simplify · anchor sweep · browser specs · review-pr (+ /security-review on risk or a design build)
                    + Fable code audit · the-adjudicator · Fable re-audit · /pre-commit-check
/cleanup-light    → stack skills · (PLAN + Fable plan critic when 3+ files, a new abstraction, styling or a design build) · anchor sweep
                    · scope · code-reviewer · simplifier · (security · silent-failure · type-design · test-coverage, on the diff's counts;
                    a prose critic for a prose-only diff) + Fable audit · the-adjudicator · Fable re-audit of fixes · /pre-commit-check
/page-design      → directions drawn and captured · frontend-design + UI/UX + Fable critics · the-adjudicator · the leader rebuilt and measured
/module-audit     → browser specs · module-recon · lens-critic · cross-cut-critic · red-team · Fable miss hunt · steelman · synthesizer
                    · the-adjudicator · fix-planner · verifier + Fable fix-plan critique
```

The shared rules behind all of these are in [`reference/`](reference/). See [the guides](https://redlinedigital.dev/guides/) for the full walkthrough of each, and [the order](https://redlinedigital.dev/guides/the-order/) for how they fit together.
