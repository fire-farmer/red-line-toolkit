# STACK

> Continuity ledger for the current campaign. Owned by Claude per [CLAUDE.md "Stack Discipline"](CLAUDE.md). `/start-session` reads it to orient; `/end-session` writes the handoff back into it. Max depth 2. Campaign FUs live here; FUs the campaign can't do live in [Standing-FUs.md](Standing-FUs.md). Closed FUs are deleted (git holds them). Format and rules: the toolkit's `reference/ledger-lifecycle.md`.
>
> Points outward to two planning docs: the global plan (`docs/plans/<date>-global-plan.md`, from `templates/GLOBAL-PLAN.md`), the campaigns in order, and the active campaign plan (`docs/plans/<date>-<campaign>.md`, from `templates/CAMPAIGN.md`).

## Phases

One bullet per campaign, one sub-bullet per phase: `ledger.mjs audit` reads these lines to find the current campaign and stale FU homes. A closed campaign collapses to `- [x] **<Campaign>** — COMPLETE <date>`.

- [ ] **Billing** — the active campaign. Plan: docs/plans/<date>-billing.md
  - [ ] **P1 Invoices** — ▶️ IN PROGRESS
  - [ ] **P2 Reports** — not started

## Current location

```
State:       <what shipped last session, what's in flight>
Next move:   <the single most important next action>
Pending:     <owed actions, blockers, holds — or none>
Push state:  <N unpushed vs upstream; hold, or push-eligible>
Pipeline:    <the pipeline and stage in flight, or none>
```

## Lessons

Rules that say what to do at a decision point. Backstory and outcomes: `docs/lessons-reference.md`. Limits: the `LIMITS` line of the toolkit's `scripts/ledger.mjs report`.

## Follow-ups

Work for the current campaign. Every FU is homed at its phase's group step for its type. Format and rules: the toolkit's `reference/ledger-lifecycle.md`.

<!-- ledger:step-order Billing/1 docs/plans/<date>-billing.md -->
