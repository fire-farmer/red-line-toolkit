# &lt;Campaign name&gt; — campaign plan

One multi-phase effort with a clear finish — a module, a feature, a redesign, a refactor. Breaks into **Phases**, then **Steps**. One campaign is active at a time: `STACK.md`'s "Current location" points at which phase you're in, and `GLOBAL-PLAN.md` lists this campaign among the rest. The ledger *points* here; it never copies the breakdown.

Keep this at `docs/plans/<date>-<campaign-name>.md`, one file per campaign.

## Goal
<!-- One line: what shipping this campaign gets you. -->

## Done when
<!-- The concrete finish line for the whole campaign — the test for "this is closed." -->

## Phases
<!-- Each phase is a session or a few. At every phase close /end-session decides each open
     group step (carry forward, drop, or move to Standing), so keep phases small enough to close. -->

### Phase 1 — &lt;name&gt;   ·   active
_One line of scope._
- [ ] Step 1.1 — …
- [ ] Step 1.2 — …

### Phase 2 — &lt;name&gt;   ·   next
_One line of scope._
- [ ] Step 2.1 — …

### Phase 0 — &lt;name&gt;   ·   done YYYY-MM-DD
_Closed. Kept for the trail._

## Group steps
<!-- Where FU group steps get scheduled. STACK's `<!-- ledger:step-order <Campaign>/<Phase> <this doc> -->`
     line points here. A row is written when /end-session schedules a group step (always once it
     reaches the `group step scheduled at` limit); its Order must be real, such as `after 1.3` —
     an empty cell, `—`, `-` or `TBD` doesn't count. Format: the toolkit's reference/ledger-lifecycle.md § Records. -->

| Step | Group type | Rigor | Order |
|---|---|---|---|

## Decisions
<!-- Anything settled mid-campaign that later phases must honor, so it isn't re-litigated. -->

- YYYY-MM-DD — _decision and the one-line why._
