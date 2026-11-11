# /red-line-toolkit

The field guides from **[redlinedigital.dev](https://redlinedigital.dev)**, packaged for Claude Code.

These are the real commands we run inside our AI coding agent — a set of interlocking pipelines that keep large changes from drifting: plan-then-critique-then-adjudicate loops, a fleet of adversarial critics, decorrelated reviews on a second model family, pre-ship audits, and a session ledger that scores its own lessons. They're opinionated on purpose. Read the [guides](https://redlinedigital.dev/guides/) for the *why* behind each one; this repo is the *what*.

> **This is a system, not a bag of scripts.** The pipelines lean on a few companion plugins, a small doc-method and a ledger (see [What you need](#what-you-need)). Install those and they run as designed; skip them and some stages no-op. Everything here is genericized from a private process repo and kept in step with it — treat the worked examples as illustrations, not prescriptions.

**New to Claude Code? Start with [the system](THE-SYSTEM.md).** The agent forgets everything between sessions — nothing holds unless it's written where it reads. [`THE-SYSTEM.md`](THE-SYSTEM.md) is the whole method on one page. Ready to set it up? [**`QUICKSTART.md`**](QUICKSTART.md) stands it up in about twenty minutes. Then the [cheat sheet](CHEATSHEET.md) shows which command to use when.

## What's in the box

**Commands** (`/name`)

| Command | What it does | Guide |
|---|---|---|
| `/change-heavy` | The heavy pipeline, for a change that alters a computed or printed figure, a stored, imported or exported data shape, an auth, RLS, tier or payment path, or adds a new data model or API shape: plan → parallel critics with a Fable plan critic → adjudicate and lock → implement → simplify → review with a decorrelated Fable audit → re-audit of the fixes | [guide](https://redlinedigital.dev/guides/change-heavy/) |
| `/cleanup-light` | The standard pipeline for every other change, at any file count, with a quick lane for small covered fixes: PLAN + Fable plan critique when warranted, a review panel the diff picks, adjudication, a Fable audit on every run, the pre-commit audit, then a local commit; hands off when a change meets the heavy trigger | [guide](https://redlinedigital.dev/guides/cleanup-light/) |
| `/cluster-fus` | Reports the follow-up backlog by group step and recommends the next one to schedule | [guide](https://redlinedigital.dev/guides/cluster-fus/) |
| `/module-build` | Apex pipeline for a new module: concept → architecture sketch → phased page breakdown, locked as a spec | [guide](https://redlinedigital.dev/guides/module-build/) |
| `/module-sprint` | Walks a locked spec through the page pipeline (design → code → implement) | [guide](https://redlinedigital.dev/guides/module-sprint/) |
| `/page-design` | Per-page design pipeline: 3 parallel critics → adjudicate → lock | [guide](https://redlinedigital.dev/guides/page-design/) |
| `/page-code` | Per-page code-planning pipeline: 3 parallel critics → security-asymmetric adjudication → lock | [guide](https://redlinedigital.dev/guides/page-code/) |
| `/page-implement` | Executes a locked code plan: simplify, verify, one review (pr-review, `/security-review` and a Fable audit in parallel), adjudicate, commit | [guide](https://redlinedigital.dev/guides/page-implement/) |
| `/module-audit` | Pre-ship module audit: components × lenses + cross-cutting axes + adversarial layer, SHA-anchored verification | [guide](https://redlinedigital.dev/guides/module-audit/) |
| `/mobile-audit` | Mobile-responsiveness audit at 375px across four layers, adversarially verified | [guide](https://redlinedigital.dev/guides/mobile-audit/) |
| `/competitive-anchor` | Pre-scope competitive comparison against your competitive-landscape doc, refreshed when it's stale | — |
| `/pre-commit-check` | Pre-commit auditor: verifies the commit body matches the diff, scope discipline, and follow-up capture. Diagnostic only | [guide](https://redlinedigital.dev/guides/pre-commit-check/) |
| `/start-session` | Start-of-session orientation from the ledger report: a short brief, warnings, and the owner's open questions | [guide](https://redlinedigital.dev/guides/start-session/) |
| `/end-session` | End-of-session sync: the handoff, lesson evidence, FU filing, the ledger audit, and a commit with ledger footers | [guide](https://redlinedigital.dev/guides/end-session/) |

**Agents** — `the-adjudicator` ([guide](https://redlinedigital.dev/guides/adjudicator/)) is the read-only referee that marks each critique KEEP / DITCH / MODIFY against your project's actual standards. `fable-seat` is the decorrelated auditor every Fable stage dispatches. The `module-*` fleet (recon, lens-critic, cross-cut-critic, red-team, steelman, repro-sketcher, synthesizer, verifier, fix-planner) powers `/module-audit`.

**Reference docs** ([`reference/`](reference/)) — the text the commands share, kept once: what the pipelines share (the rigor trigger, risk paths, the review panel, the anchor sweep, the Fable seats, models and effort), the decision gates (what a run decides and reports versus what waits for the owner), the LedgerLoop lifecycle and session steps, and the prompting cheat sheet sections the pipelines cite.

**The ledger** ([`scripts/ledger.mjs`](scripts/ledger.mjs) + [`lib/`](lib/)) — LedgerLoop: it checks a project's lessons and follow-ups every session, issues their IDs, scores lessons on the evidence footers in your commits, and stops the session commit when a limit is broken. Node only, no dependencies.

**`fable-seat-guard`** ([`mods/fable-seat-guard`](mods/fable-seat-guard)) — a companion plugin that puts every `fable-seat` dispatch on the model family the orchestrator isn't, notes the model that actually ran, and holds the seat to read-only tools.

## Install

```
/plugin marketplace add fire-farmer/red-line-toolkit
/plugin install red-line-toolkit@red-line-toolkit
/plugin install fable-seat-guard@red-line-toolkit
```

Then `/change-heavy`, `/module-audit`, etc. are available in any project. The commands find their reference docs, agents and the ledger through the plugin's install folder, so install it as a plugin rather than copying files into `~/.claude`. To try a local checkout instead, start Claude Code with `claude --plugin-dir <path to this repo>`.

Your own process state lives in `~/.claude`, never in the plugin: the rulebook (`~/.claude/CLAUDE.md`), its backstories (`~/.claude/reference/rules.md`), the projects the ledger checks (`~/.claude/projects.json`) and the commands' logs (`~/.claude/data/`). [`QUICKSTART.md`](QUICKSTART.md) sets them up from [`templates/rulebook/`](templates/rulebook/).

## What you need

The pipelines compose other tools. Without them, the stages that call them will no-op or fail — install the companions to get the designed behavior:

**Companion plugins** (from the official marketplace — `/plugin marketplace add anthropics/claude-code` then install):
- **`superpowers`** — `writing-plans`, `subagent-driven-development` (the plan/execute spine of `/change-heavy`)
- **`pr-review-toolkit`** — `code-reviewer`, `review-pr`, `silent-failure-hunter`, `type-design-analyzer`, `pr-test-analyzer`, `code-simplifier` and `comment-analyzer`
- **`feature-dev`** — its `code-reviewer` (the bugs-and-quality critic lens)

**Built-in skills** — `/simplify` and `/security-review` (ship with Claude Code).

**A second model family** — the decorrelated review seats dispatch `model: fable` (or `model: opus` when your session itself runs on Fable), so a different model audits what the orchestrator wrote. Models are named by family alias, never a versioned ID, so the pipelines move to a new release the day it ships.

**Node** — the ledger runs on Node 20 or later.

**Optional stack skills** — the change pipelines load your framework's, database's and payment provider's best-practice skills before planning when they're installed, and skip them when they aren't.

**The doc-method** — starter templates are in [`templates/`](templates/):
- `CLAUDE.md` — the project's rules: the Heavy-rigor trigger, the filing bar, what goes to the owner, and the stack discipline the session commands follow
- `STACK.md` — the ledger's live state: the phases, the session handoff, the lessons in force and the campaign's follow-ups
- `Standing-FUs.md` — follow-ups the current campaign can't do, each with a checkable trigger, and the owner's parked decisions
- `lessons-reference.md` — each lesson's backstory and outcome, at `docs/lessons-reference.md`
- `GLOBAL-PLAN.md` — the route: the campaigns and their phases, in order
- `CAMPAIGN.md` — one campaign's plan (Phases → Steps), with the table where group steps get scheduled
- `VISION.md` — the destination and the identity constraints (the yardstick)
- `MEMORY.md` — the owner's preferences and feedback; lessons never go here
- `rulebook/` — the starter rulebook (`R-1`…`R-26`), its backstories and a `projects.json`, for `~/.claude`

See [`THE-SYSTEM.md`](THE-SYSTEM.md) for how they fit, or [`QUICKSTART.md`](QUICKSTART.md) to stand them up.

## Tests

    npm test
    claude plugin test mods/fable-seat-guard

The suite checks the ledger end to end on fixture repos, and holds the commands and reference docs to their own rules: who may ask the owner, every `§` pointer landing on a real heading, every path into the toolkit spelled from `${CLAUDE_PLUGIN_ROOT}/`, models named by family alias, and no copy of the shared text drifting. [`docs/checks.md`](docs/checks.md) lists each check.

## A note on fidelity

These are extracted from a private, working process repo and genericized for release — real client and product specifics scrubbed, the method and the logic kept intact. So they're battle-tested but opinionated, and the example paths (`src/lib/billing/...`, etc.) are placeholders. Adapt them to your stack; that's the point.

## License

MIT — see [LICENSE](LICENSE). Built by [Scott Oliver / Red Line Digital](https://redlinedigital.dev).
