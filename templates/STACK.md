# STACK.md — live state

The single source of session state — the handoff between sessions. `/start-session` reads it to orient; `/end-session` writes the handoff back into it. Keep it current; git history is the forensic trail.

> **This doc is one of a set — it points outward to two planning docs you should also keep:**
> - **[GLOBAL-PLAN.md](GLOBAL-PLAN.md)** — the structure: the campaigns and their phases, in order. STACK's "Current location" points *into* this.
> - **The active campaign plan** (e.g. `docs/plans/<date>-<campaign>.md`) — the detailed plan for the campaign you're in now.
>
> (`CLAUDE.md` holds the always-on rules; `Standing-FUs.md` holds the cross-cutting backlog.) **If you don't have a GLOBAL-PLAN.md or a campaign plan yet, that's your cue to create them** — the session commands assume they exist.

## Current location (the handoff)
<!-- One tight paragraph: what shipped last session, what's in flight, the next move, and
     which Campaign / Phase of GLOBAL-PLAN.md you're in. /end-session overwrites this each
     session; /start-session reads it to orient. -->

**Campaign / Phase:** _which campaign + phase of GLOBAL-PLAN.md this session is working in._

**Prior session (YYYY-MM-DD):** _what was done, deployed, and decided._

**Next move:** _the single most important next action._

## Follow-ups (phase-local)
<!-- Small, near-term follow-ups tied to the current phase. Tag each by type so /cluster-fus
     can batch like with like. At /end-session, every FU homed at a closing phase must
     resolve, re-home, or promote to Standing-FUs.md — no orphans. -->

- [ ] `[type]` file:line — one-line description
- [ ] `[perf]` src/... — example

## Lessons learned (in force)
<!-- Durable lessons that should bind future sessions, kept here until they earn promotion
     to permanent memory. /end-session audits these at every phase-close. -->

Each lesson is a one-line rule with an audit counter:

- `[audits survived: 0]` **State the rule in one line.** _(where it came from — phase / commit)_

**The three-point filter — promote a lesson to permanent memory only when ALL three hold:**
1. **`[audits survived: 3+]`** — it survived at least three phase-close audits without being dropped or superseded. Lessons start at `0`; `/end-session` increments the counter each phase-close the lesson is kept in force.
2. **Generalizes beyond this project** — it isn't specific to one codebase.
3. **Articulable as a one-line rule** — if you can't state it in a sentence, refine it or drop it.

When a lesson passes all three, `/end-session` writes it to your **permanent memory** (a `memory/` file that auto-loads every session) and **removes it from here** — it no longer needs STACK residence. (Default threshold is 3; tighten to 5 once memory grows past ~50 files. At a campaign-close, an obviously-fundamental lesson may promote earlier.)

## Decisions
<!-- Durable choices, so they aren't re-litigated. One line each, dated. -->

- YYYY-MM-DD — _decision and the one-line why._
