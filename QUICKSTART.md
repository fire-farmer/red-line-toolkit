# Quick start — stand up the continuity system

Fifteen minutes to a project your AI agent won't lose the thread on. This turns the model in [THE-SYSTEM.md](THE-SYSTEM.md) into real files in your repo. You don't need all of it on day one — do steps 1–3 now, add the rest when you feel the drift.

THE-SYSTEM.md is the *why*; this is the *how*.

## 1 · Install the commands — the processes

The three processes (session bookends · follow-up lifecycle · lesson ratchet) are automated by the commands in this repo:

```
/plugin marketplace add fire-farmer/red-line-toolkit
/plugin install red-line-toolkit@red-line-toolkit
```

Some pipelines lean on a few companion plugins — see [What you need](README.md#what-you-need).

## 2 · Drop in the four files that matter most — the state

Copy these from [`templates/`](templates/) into your repo and fill in the blanks. In order of leverage:

| File | Layer | What it does |
|---|---|---|
| [`CLAUDE.md`](templates/CLAUDE.md) | **the rules** | How you want the agent to work — scope, the build/test gate, security posture. Biggest return for the least effort. |
| [`STACK.md`](templates/STACK.md) | **the ledger** | Live state + the session handoff + the in-force lessons. This one file kills most of the drift. |
| [`Standing-FUs.md`](templates/Standing-FUs.md) | **the parking lot** | The cross-cutting stuff you keep noticing but can't do now. |
| [`GLOBAL-PLAN.md`](templates/GLOBAL-PLAN.md) | **the route** | The campaigns and their phases, in order — once the work spans more than a couple of sessions. |

## 3 · Adopt the habit — the bookends

This is the whole discipline, and it's two commands:

```
/start-session   →   … do the work …   →   /end-session
```

`/start-session` reads `STACK.md` and tells you where you are. `/end-session` writes the handoff back, files new follow-ups, audits the lessons, and commits. Run them every session and the agent picks up exactly where it left off — no re-explaining, no re-discovering.

## 4 · Add the rest as you grow

When the work gets bigger, the other layers earn their place — copy them from `templates/` the same way:

| File | Layer | Add it when |
|---|---|---|
| [`VISION.md`](templates/VISION.md) | **the destination** | You want a fixed yardstick for "is this in scope / on-brand?" |
| [`CAMPAIGN.md`](templates/CAMPAIGN.md) | **one effort** | A single effort spans several phases and needs its own plan doc. |
| [`MEMORY.md`](templates/MEMORY.md) | **graduated lessons** | Lessons start recurring; the ratchet promotes them out of `STACK.md` into permanent memory. |

## The one rule over all of it

**Keep the process lighter than the problem it solves.** Adopt the layers you need, skip the ones you don't; heavier problems (money, security, data) earn more ceremony, trivial ones earn less. If tracking a thing costs more than the thing is worth, don't track it.

---

That's the system: **six files, three commands, one rule.** `/start-session` → work → `/end-session`, and the project stops drifting.
