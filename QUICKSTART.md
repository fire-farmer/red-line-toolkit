# Quick start — stand up the continuity system

About twenty minutes to a project your AI agent won't lose the thread on. This turns the model in [THE-SYSTEM.md](THE-SYSTEM.md) into real files. THE-SYSTEM.md is the *why*; this is the *how*.

## 1 · Install the plugins — the processes

```
/plugin marketplace add fire-farmer/red-line-toolkit
/plugin install red-line-toolkit@red-line-toolkit
/plugin install fable-seat-guard@red-line-toolkit
```

The pipelines lean on a few companion plugins and Node 20+ — see [What you need](README.md#what-you-need).

## 2 · Set up your process home — once per machine

Your own process state lives in `~/.claude`, beside Claude Code's settings. Copy these from [`templates/rulebook/`](templates/rulebook/):

| Template | Goes to | What it is |
|---|---|---|
| [`CLAUDE.md`](templates/rulebook/CLAUDE.md) | `~/.claude/CLAUDE.md` | **The rulebook** — one-line rules (`R-1`…) that load in every session, in every project. If you already have a `~/.claude/CLAUDE.md`, add its header paragraphs and `## Rules` section to yours. |
| [`rules.md`](templates/rulebook/rules.md) | `~/.claude/reference/rules.md` | Each rule's backstory. A rule you promote later gets its entry here. |
| [`projects.json`](templates/rulebook/projects.json) | `~/.claude/projects.json` | The projects the ledger checks: one entry per project, with its absolute path. |

The ledger reads these from `~/.claude` (set `LEDGER_PROCESS_ROOT` to use another folder). If you keep these files in a git repo of your own, the session commands commit your rulebook promotions and logs there.

## 3 · Drop in the project files — the state

Copy these from [`templates/`](templates/) into your repo and fill in the blanks:

| File | Layer | What it does |
|---|---|---|
| [`CLAUDE.md`](templates/CLAUDE.md) | **the rules** | How the agent works here: the Heavy-rigor trigger and your high-risk areas, the filing bar, what goes to you. Biggest return for the least effort. |
| [`STACK.md`](templates/STACK.md) | **the ledger** | The phases, the session handoff, the lessons in force and the campaign's follow-ups. Rename the example campaign to yours. |
| [`Standing-FUs.md`](templates/Standing-FUs.md) | **the parking lot** | Follow-ups the current campaign can't do, each with a checkable trigger, and your parked decisions. |
| [`lessons-reference.md`](templates/lessons-reference.md) → `docs/lessons-reference.md` | **the backstories** | Each lesson's story and outcome. |
| [`GLOBAL-PLAN.md`](templates/GLOBAL-PLAN.md) | **the route** | The campaigns and their phases, in order. |
| [`CAMPAIGN.md`](templates/CAMPAIGN.md) → `docs/plans/<date>-<campaign>.md` | **one effort** | The active campaign's plan, with the table group steps are scheduled into. Point STACK's `ledger:step-order` line at it. |

Then register the project in `~/.claude/projects.json` (its absolute path, `"migrated": true`) and make the adoption commit with this footer as the last line of its message, so the ledger knows where the project's history starts:

```
Ledger-Migration: <the project's name in projects.json>
```

Check it: `/start-session` prints the ledger report, which should show no stops or warnings.

## 4 · Adopt the habit — the bookends

```
/start-session   →   … do the work …   →   /end-session
```

`/start-session` reads the ledger report and `STACK.md`, prints a short brief, and asks you the owner questions waiting on you. `/end-session` writes the handoff back, records which lessons caught or guided something this session, files new follow-ups, runs the ledger audit and commits. Run them every session and the agent picks up exactly where it left off.

Between them, pick the pipeline by what a change alters: `/change-heavy` when it alters a computed or printed figure, a stored, imported or exported data shape, or an auth, RLS, tier or payment path, or adds a new data model or API shape; `/cleanup-light` for everything else. A run decides every programming call itself, commits locally and reports. Only design, copy, UX, product calls, what loads into every session, and outward actions such as a push wait for you.

## 5 · Add the rest as you grow

| File | Layer | Add it when |
|---|---|---|
| [`VISION.md`](templates/VISION.md) | **the destination** | You want a fixed yardstick for "is this in scope / on-brand?" |
| [`MEMORY.md`](templates/MEMORY.md) | **your preferences** | You've told the agent how you like to work and want it remembered. Lessons never go here: the ledger scores them, and the strongest graduate to your rulebook. |

## The one rule over all of it

**Keep the process lighter than the problem it solves.** Heavier problems (money, security, data) earn more ceremony, trivial ones earn less. If tracking a thing costs more than the thing is worth, don't track it.
