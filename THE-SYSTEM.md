# The system — keeping an agent's work coherent across sessions

New to Claude Code? This is the part that matters most, and the part nobody tells you: **the agent forgets everything between sessions.** It's brilliant for an hour and a stranger the next morning. Nothing holds unless it's written down where the agent reads it.

This is the system that holds it. **Six layers** keep the state; **three processes** move work between them; **one constraint** keeps the whole thing from becoming heavier than the work it protects. It's deliberately lightweight — you can adopt one layer today and the rest as you feel the need.

> A print-ready one-page version of this is in [`the-system-onepager.pdf`](the-system-onepager.pdf).

## The shape

Layers are files (state). Ordered top to bottom **by stability** — stable at the top (rarely changes), volatile at the bottom (rewritten every session). That ordering is *why* they're separate files: you never want the churning part rewriting the stable part.

```
STATE   (top = stable, rarely changes   ·   bottom = volatile, rewritten each session)

  1  CLAUDE.md + Memory ......  the rules, and what's been learned   (loads every session)
  2  Vision & Identity .......  the destination
  3  Global Plan .............  the route, A → Z
  4  Campaign ................  one effort — Phases → Steps
  5  Stack (the Ledger) ......  the live hub — everything converges here
  6  Standing follow-ups .....  the parking lot   (loaded on demand)

ENGINE   Session bookends   ·   Follow-up lifecycle   ·   Lesson ratchet (5 climbs back to 1)
```

Everything that *moves* work is a process. All three converge on the ledger.

## The six layers (state)

**1 · Instruction layer** — `CLAUDE.md` · `memory/`
Two always-on stores. **CLAUDE.md** is the constitution: how the agent works, what scope a change may take, the build/test gate, the security posture. **Memory** is accumulated knowledge — who you are, settled preferences, and lessons that *graduated* from experience. Governs every layer below, and Memory is where the lesson ratchet deposits.

**2 · Vision & Identity** — the destination
Where the project ultimately lands, plus the stable brand and style constraints beside it. Rarely changes; it's the yardstick everything downstream is judged against.

**3 · Global Plan** — the route, A → Z
The sequenced route from today to the vision: the major efforts in order, and a "you are here." Decomposes the vision into campaigns and links down to each one's plan.

**4 · Campaign** — Phases → Steps
One multi-phase effort — a module, a feature, a redesign, a refactor. Breaks into Phases, then Steps, and owns its own plan document. One is active at a time; its live position is *tracked* by the ledger, which only points at the breakdown, never copies it.

**5 · Stack (the Ledger)** — the live hub
The single always-current file for the active campaign: where you are, what's parked locally, lessons so far, and the handoff to the next session. Air traffic control — anti-drift, continuity, and lesson-accrual at once. Reads up to the plan, parks and retrieves with the parking lot, and feeds Memory upward.

**6 · Standing follow-ups** — the parking lot
Cross-cutting tasks that can't finish inside any one campaign, or that wait on a **trigger** — an Nth occurrence, a date, an aggregated pass. Loaded on-demand (not every session, to keep context lean); receives promoted items at phase close and is drawn down when a trigger fires.

## The three processes (the engine)

The layers are inert documents. These routines move work between them — and all three converge on the ledger.

**A · Session bookends.** Open reads the ledger and restates where you are. Close writes the handoff, files new follow-ups, runs the lessons audit, and commits. These maintain every file above. *(→ `/start-session`, `/end-session`.)*

**B · Follow-up lifecycle.** On discovery, route by kind — a bug by severity, a nice-to-have through a relevance filter — record it as local (Stack) or standing (parking lot), batch like items together, execute, and garbage-collect at phase close so nothing is orphaned. *(→ `/cluster-fus`, and the `/cleanup-light` · `/change-heavy` pipelines.)*

**C · Lesson ratchet.** A lesson earns a tally each time it proves useful. Clear the bar — recurs enough (survives **3+ audits**), generalizes beyond this project, states in **one line** — and it graduates into permanent Memory, loaded forever after. *(→ `/end-session`'s lessons audit.)*

## The one constraint

**The process must stay lighter than the problem it solves** — scaled to the stakes, not minimized for its own sake. Heavier problems (money, security, data) earn more ceremony; trivial ones earn less. If tracking a thing costs more than the thing is worth, you don't track it.

> **Six layers · three processes · one constraint.**

## Starting from zero

You don't need all six on day one. In order of leverage:

1. **`CLAUDE.md`** — write down how you want the agent to work. Biggest return for the least effort.
2. **`STACK.md`** — the live-state / handoff file. Start every session by reading it, end every session by rewriting it. This alone kills most of the drift.
3. **`Standing-FUs.md`** — a parking lot for the cross-cutting stuff you keep noticing but can't do now.
4. **`GLOBAL-PLAN.md`** — once the work spans more than a couple of sessions, write the route so "what's next" is never a guess.

Starter versions of all four are in [`templates/`](templates/). The [commands](README.md) automate the three processes on top of them.
