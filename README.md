# /red-line-toolkit

The field guides from **[redlinedigital.dev](https://redlinedigital.dev)**, packaged for Claude Code.

These are the real commands we run inside our AI coding agent — a set of interlocking pipelines that keep large changes from drifting: plan-then-critique-then-adjudicate loops, a fleet of adversarial critics, pre-ship audits, and lightweight session bookkeeping. They're opinionated on purpose. Read the [guides](https://redlinedigital.dev/guides/) for the *why* behind each one; this repo is the *what*.

> **This is a system, not a bag of scripts.** The pipelines lean on a few companion plugins and a small doc-method (see [What you need](#what-you-need)). Install those and they run as designed; skip them and some stages no-op. Everything here is genericized from a private codebase — treat the worked examples as illustrations, not prescriptions.

**New to Claude Code? Start with [the system](THE-SYSTEM.md).** The agent forgets everything between sessions — nothing holds unless it's written where it reads. [`THE-SYSTEM.md`](THE-SYSTEM.md) is the whole method on one page: six layers hold the state, three processes move work between them, one constraint keeps it light. That's how you keep a project organized; the commands here just automate it. Ready to set it up? [**`QUICKSTART.md`**](QUICKSTART.md) stands the whole system up in about fifteen minutes — six files, three commands, one rule. Then the [cheat sheet](CHEATSHEET.md) shows which command to use when.

## What's in the box

**Commands** (`/name`)

| Command | What it does | Guide |
|---|---|---|
| `/change-heavy` | 6-stage pipeline for high-rigor refactors: plan → parallel critics → adjudicate → implement → simplify → review | [guide](https://redlinedigital.dev/guides/change-heavy/) |
| `/cleanup-light` | Light single-item cleanup: scoped critics + security-asymmetric adjudication, auto-escalates if scope blows up | [guide](https://redlinedigital.dev/guides/cleanup-light/) |
| `/cluster-fus` | Re-buckets a follow-up backlog by type and surfaces batch-ready clusters | [guide](https://redlinedigital.dev/guides/cluster-fus/) |
| `/module-build` | Apex pipeline for a new module: concept → architecture sketch → phased page breakdown, locked as a spec | [guide](https://redlinedigital.dev/guides/module-build/) |
| `/module-sprint` | Walks a locked spec through the page pipeline (design → code → implement) with locks between stages | [guide](https://redlinedigital.dev/guides/module-sprint/) |
| `/page-design` | Per-page design pipeline: 3 parallel critics → adjudicate → lock | [guide](https://redlinedigital.dev/guides/page-design/) |
| `/page-code` | Per-page code-planning pipeline: 3 parallel critics → security-asymmetric adjudication → lock | [guide](https://redlinedigital.dev/guides/page-code/) |
| `/page-implement` | Executes a locked code plan, post-critique, simplify, verify, final review pass | [guide](https://redlinedigital.dev/guides/page-implement/) |
| `/module-audit` | Pre-ship module audit: components × lenses + cross-cutting axes + adversarial layer, SHA-anchored verification | [guide](https://redlinedigital.dev/guides/module-audit/) |
| `/mobile-audit` | Mobile-responsiveness audit at 375px across four layers, adversarially verified | [guide](https://redlinedigital.dev/guides/mobile-audit/) |
| `/pre-commit-check` | Pre-commit auditor: verifies the commit body matches the diff, scope discipline, and follow-up capture. Diagnostic only | [guide](https://redlinedigital.dev/guides/pre-commit-check/) |
| `/start-session` | Start-of-session orientation: reads the state doc, surfaces clusters + integrity issues | [guide](https://redlinedigital.dev/guides/start-session/) |
| `/end-session` | End-of-session sync: writes the handoff, runs the lessons audit, commits with an address-tagged subject | [guide](https://redlinedigital.dev/guides/end-session/) |

**Agents** — the critics the pipelines dispatch. `the-adjudicator` ([guide](https://redlinedigital.dev/guides/adjudicator/)) is the read-only referee that marks each critique KEEP / DITCH / MODIFY against your project's actual standards. The `module-*` fleet (recon, lens-critic, cross-cut-critic, red-team, steelman, repro-sketcher, synthesizer, verifier, fix-planner) powers `/module-audit`.

## Install

**As a plugin** (recommended):

```
/plugin marketplace add fire-farmer/red-line-toolkit
/plugin install red-line-toolkit@red-line-toolkit
```

**Manually** — clone and copy into your Claude Code config:

```sh
git clone https://github.com/fire-farmer/red-line-toolkit
cp -r red-line-toolkit/commands/*        ~/.claude/commands/
cp -r red-line-toolkit/agents/*          ~/.claude/agents/
cp -r red-line-toolkit/skills/*          ~/.claude/skills/
```

Then `/change-heavy`, `/module-audit`, etc. are available in any project.

## What you need

The pipelines compose other tools. Without them, the stages that call them will no-op or fail — install the companions to get the designed behavior:

**Companion plugins** (from the official marketplace — `/plugin marketplace add anthropics/claude-code` then install):
- **`superpowers`** — `writing-plans`, `executing-plans` (the plan/execute spine of `/change-heavy`)
- **`pr-review-toolkit`** — `code-reviewer`, `review-pr`, `silent-failure-hunter`, and the specialized review agents
- **`feature-dev`** — its `code-reviewer` (the bugs-and-quality critic lens)

**Built-in skills** — `/simplify` and `/security-review` (ship with Claude Code).

**The doc-method** — the session and cleanup commands assume a tiny, framework-free convention for keeping project state legible. Starter templates are in [`templates/`](templates/):
- `CLAUDE.md` — the rules: the always-on constitution for how the agent works in your repo
- `STACK.md` — the ledger: live state, the session handoff, and the in-force **lessons** (each carries an `[audits survived: N]` counter; `/end-session` promotes one to permanent memory once it passes the three-point filter — survived 3+ audits, generalizes, one-line rule)
- `GLOBAL-PLAN.md` — the route: the campaigns and their phases, in order. `STACK.md`'s "Current location" points into it
- `Standing-FUs.md` — the parking lot: the cross-cutting follow-up backlog `/cluster-fus` re-buckets
- `VISION.md` — the destination: what the project ultimately is + the stable brand/identity constraints (the yardstick)
- `CAMPAIGN.md` — one effort: a single multi-phase campaign plan (Phases → Steps), lived at `docs/plans/<date>-<campaign>.md`
- `MEMORY.md` — graduated lessons: the always-loaded index of what's been learned, bodies loaded on match

All six state layers plus the rules — see [`THE-SYSTEM.md`](THE-SYSTEM.md) for how they fit, or [`QUICKSTART.md`](QUICKSTART.md) to stand them all up.

This is the same lightweight anti-drift method the [/stack](https://redlinedigital.dev/stack/) page teaches. It's deliberately lighter than a heavyweight process — adopt as much or as little as fits.

## A note on fidelity

These were extracted from a private, working codebase and genericized for release — real client and product specifics scrubbed, the method and the logic kept intact. So they're battle-tested but opinionated, and the example paths (`src/app/(app)/billing/...`, etc.) are placeholders. Adapt them to your stack; that's the point.

## License

MIT — see [LICENSE](LICENSE). Built by [Scott Oliver / Red Line Digital](https://redlinedigital.dev).
