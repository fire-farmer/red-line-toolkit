# STACK.md — live state

The single source of session state. `/start-session` reads it; `/end-session` writes the handoff back into it. Keep it current; git history is the forensic trail.

## Current location (the handoff)
<!-- One tight paragraph: what shipped last session, what's in flight, what the next move is.
     /end-session overwrites this each session. /start-session reads it to orient. -->

**Prior session (YYYY-MM-DD):** _what was done, deployed, and decided._

**Next move:** _the single most important next action._

## Follow-ups (phase-local)
<!-- Small, near-term follow-ups tied to the current phase of work. Tag each by type
     so /cluster-fus can batch like with like. Close them out or promote them at /end-session. -->

- [ ] `[type]` file:line — one-line description
- [ ] `[perf]` src/... — example

## Decisions
<!-- Durable choices, so they aren't re-litigated. One line each, dated. -->

- YYYY-MM-DD — _decision and the one-line why._
