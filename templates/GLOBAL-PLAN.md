# GLOBAL-PLAN.md — the structure

The shape of the work: campaigns, and the phases inside them, in order. This is the map that `STACK.md`'s "Current location" points into. It changes rarely — when the plan itself changes, not every session.

## How this is organized
- **Campaign** — a large unit of related work with a clear finish (e.g. "Billing module", "Auth hardening"). Campaigns close; closing one is a milestone that triggers the heavier `/end-session` ritual.
- **Phase** — a step inside a campaign, small enough to finish in a session or a few. Phases close too; `/end-session` audits lessons and garbage-collects follow-ups at every phase-close.
- Each campaign usually gets its own detailed plan (e.g. `docs/plans/<date>-<campaign>.md`). This file is the index across all of them; the campaign plan is the depth.

## Campaigns

### Campaign: &lt;name&gt; — active
_One line on the goal._

- [ ] **Phase 1 — &lt;name&gt;** — one-line scope
- [ ] **Phase 2 — &lt;name&gt;** — one-line scope
- [x] **Phase 0 — &lt;name&gt;** — done YYYY-MM-DD

### Campaign: &lt;next&gt; — planned
_One line on the goal._

- [ ] **Phase 1 — &lt;name&gt;** — one-line scope

## Closed campaigns
<!-- When a campaign closes, /end-session appends its git range + a one-paragraph synopsis here. -->

- &lt;name&gt; (YYYY-MM-DD) — synopsis. Git range: `<first-sha>..<last-sha>`.
