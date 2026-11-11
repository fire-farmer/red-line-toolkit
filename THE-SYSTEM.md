# The system — keeping an agent's work coherent across sessions

New to Claude Code? This is the part that matters most, and the part nobody tells you: **the agent forgets everything between sessions.** It's brilliant for an hour and a stranger the next morning. Nothing holds unless it's written down where the agent reads it.

This is the system that holds it. **Six layers** keep the state; **three processes** move work between them; **one constraint** keeps the whole thing from becoming heavier than the work it protects. It's deliberately lightweight — you can adopt one layer today and the rest as you feel the need.

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

**1 · Instruction layer** — `CLAUDE.md` · the rulebook · `memory/`
Three always-on stores. The project's **CLAUDE.md** is its constitution: how the agent works, what a change may take in scope, what waits for you. The **rulebook** (`~/.claude/CLAUDE.md`) holds one-line rules for every project — the lessons that *graduated* from experience. **Memory** holds who you are and your settled preferences. Governs every layer below, and the rulebook is where the lesson ratchet deposits.

**2 · Vision & Identity** — the destination
Where the project ultimately lands, plus the stable brand and style constraints beside it. Rarely changes; it's the yardstick everything downstream is judged against.

**3 · Global Plan** — the route, A → Z
The sequenced route from today to the vision: the major efforts in order, and a "you are here." Decomposes the vision into campaigns and links down to each one's plan.

**4 · Campaign** — Phases → Steps
One multi-phase effort — a module, a feature, a redesign, a refactor. Breaks into Phases, then Steps, and owns its own plan document. One is active at a time; its live position is *tracked* by the ledger, which only points at the breakdown, never copies it.

**5 · Stack (the Ledger)** — the live hub
The single always-current file for the active campaign: where you are, the campaign's follow-ups grouped by type, the lessons in force, and the handoff to the next session. Air traffic control — anti-drift, continuity, and lesson-accrual at once. A small script, `ledger.mjs`, checks it every session and issues every lesson and follow-up ID. Reads up to the plan, parks and retrieves with the parking lot, and feeds the rulebook upward.

**6 · Standing follow-ups** — the parking lot
Tasks the current campaign can't do, each waiting on one checkable **trigger** — a date, a later phase, a count in the code — and the decisions parked for you. The ledger tests every trigger each session and says when one fires; a fired item moves into the campaign.

## The three processes (the engine)

The layers are inert documents. These routines move work between them — and all three converge on the ledger.

**A · Session bookends.** Open reads the ledger report and restates where you are, then asks you the decisions waiting on you. Close writes the handoff, records the session's lesson evidence, files new follow-ups, runs the ledger audit, and commits. These maintain every file above. *(→ `/start-session`, `/end-session`.)*

**B · Follow-up lifecycle.** On discovery, route by kind — a bug by severity, a nice-to-have through a relevance filter — and file it into the campaign's group step for its type, or into the parking lot with a trigger. Anything noticed *during* a change passes a filing bar first: fixed now if it's the same class as the change or a real issue in the area the change works, filed only for a separate area or your call, with a named reason it can't wait, otherwise dropped with a line in the commit. A run that edits a file fixes the follow-ups anchored to it. *(→ `/cluster-fus`, and the `/cleanup-light` · `/change-heavy` pipelines, picked by what a change alters, not its size.)*

**C · Lesson ratchet.** Every session commit records which lessons caught a defect and which guided the work. The ledger keeps lessons on probation until they prove useful, evicts the ones that never do, and flags the ones that keep catching defects across phases. Those, with your approval, graduate into the rulebook, loaded in every project forever after — or better, into a check that enforces them. *(→ `/end-session`'s ledger sync.)*

**And the gates.** A pipeline decides every programming call itself, commits locally and reports. Only design, copy, UX, product calls, what loads into every session, and outward actions such as a push wait for you.

## The one constraint

**The process must stay lighter than the problem it solves** — scaled to the stakes, not minimized for its own sake. Heavier problems (money, security, data) earn more ceremony; trivial ones earn less. That's how a change picks its pipeline, too: by what it alters — a figure, a data shape, a protected path — never by its file count. If tracking a thing costs more than the thing is worth, you don't track it.

> **Six layers · three processes · one constraint.**

## Starting from zero

You don't need all six on day one. In order of leverage:

1. **`CLAUDE.md`** — write down how you want the agent to work. Biggest return for the least effort.
2. **`STACK.md`** — the live-state / handoff file. Start every session by reading it, end every session by rewriting it. This alone kills most of the drift.
3. **`Standing-FUs.md`** — a parking lot for the cross-cutting stuff you keep noticing but can't do now.
4. **`GLOBAL-PLAN.md`** — once the work spans more than a couple of sessions, write the route so "what's next" is never a guess.

Starter versions of all four are in [`templates/`](templates/), and [`QUICKSTART.md`](QUICKSTART.md) sets them up with the ledger. The [commands](README.md) automate the three processes on top of them.
