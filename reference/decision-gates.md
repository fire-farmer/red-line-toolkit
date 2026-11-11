# Decision gates — what a pipeline leaves to the owner

> **Paths.** `${CLAUDE_PLUGIN_ROOT}` in this doc is the toolkit's install folder: the folder above the `reference/` folder this file was read from. Claude Code substitutes it only in commands, agents and skills, not in a file read with the Read tool, so write the real path in its place before you run or open anything here.

A pause earns its cost only when the owner's answer can change the outcome.

A run never sits idle waiting for the owner on a programming call, and commits on its own; the pipelines and the commands that ask point here.

## The default when acting without asking

Take the right way, not the quick patch: the owner's standing preference is low tech debt. When a decision is act-and-report, the action is the thorough option — absorb every KEEP and MODIFY verdict, fix a pre-commit warning rather than accept it, fix a same-class leftover now (R-20), and fix a real issue in the area the change works, a minor tweak included, rather than file it (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs). Gold-plating nobody will ever see is still out (CLAUDE.md "Right vs. quick").

## Tier 1 — act and report

Every programming call. No pause: decide, do it, and list it in the report, one line each with its reason.

- Absorbing Adjudicator verdicts (KEEP and MODIFY) at any stage. A verdict flagged `CITATION-UNVERIFIED` is settled first: re-read the cited code, and ditch a phantom. Ditched findings are listed too, so the owner can pull one back.
- Plan locks: `/change-heavy`'s lock (a change that meets `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The rigor trigger) and `/page-code`'s, and any later amendment to a locked plan.
- Fable re-audits and fixing what they find. A structural finding sends the run back to its plan stage; a second consecutive replan halts (below).
- Building a check a ruling needs (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § A ruling gets a check), an artifact R-8 calls for, or a filed check a run picks up. A check a Fable seat recommends isn't built in the run that recommends it: it's filed under the filing bar (in a migrated project the anchor sweep raises it when a later run is in its file) or dropped with a line in the commit body.
- A premise proven wrong or a scope change: close it validated-no-action, or continue with the corrected scope.
- Rigor: routing work that doesn't meet the Heavy-rigor trigger to `/cleanup-light`, and handing a light run that meets it to `/change-heavy`.
- Lane: taking `/cleanup-light`'s quick lane (`${CLAUDE_PLUGIN_ROOT}/commands/cleanup-light.md` § The quick lane) when its entry test holds, and leaving it for the full run when the change outgrows it. A quick-lane fix runs in a session that's already open: in the parent session as its own lane run, or folded into a live run working that area, where it joins that run's review and commit, never in a new session.
- A costly run (a `/module-audit` matrix, a HEAVY `/mobile-audit`, a workflow fan-out): state the estimate (agents, minutes) in one line and start. A hard cap a command names still halts.
- A programming fork: pick the option with the lower tech debt and say why.
- Closing a finished FU, filing or dropping leftovers under the filing bar, and choosing the next FU when none is named.
- `/pre-commit-check` findings inside a pipeline: fix them and re-run.
- `/end-session`'s sync: the dirty tree, the divergence check, 6L-a's evidence, the lesson pick, the 6L-d choices, the 6L-e close decisions, and a 7L override for a ledger stop the session can't fix (not the rulebook-size stop: that one is tier 3). Each command names its default.

## The report

A run with nothing left for the owner commits locally and reports afterwards. It stages by explicit path (never `git add -A`), commits what's staged, and never pushes. The report then lists, numbered:

- every tier-1 decision, with its reason, including the PLAN, verdicts absorbed and ditched, checks built, FUs closed or filed, minor tweaks and in-area fixes made, and leftovers dropped;
- the commit hash;
- each owner item parked, with its row ID (tier 3);
- each outward action waiting for the owner's go.

A visual change shows its rendered before and after. The owner answers when they read it: an item they revert is undone in a new commit, and passes the filing bar (filed with a named reason and a 2-week pass, or dropped with one line in the commit body). `/pre-commit-check` run directly by the owner reports and asks, as before.

## Tier 3 — what waits for the owner

Only these. Show the evidence and a recommended pick.

- **Design, copy or UX** — anything that changes what a user sees, reads or does: layout, colour, type, copy, interaction, a new or changed surface. A design, spec or ruling the owner already approved settles it; only what none of them covers is theirs.
- **A product or business call** — pricing, tiers, policy, data retention — and reversing a ruling the owner made.
- **What loads in every session** — promoting a lesson into the rulebook or a `memory/feedback_*.md` file, and changing a rule (`/end-session` 6c, 6e and 6L-e).
- **Outward or irreversible actions** — push, production database changes, deleting data, anything sent to another person or service.

### Parking

A design, copy, UX, product or rulebook item is parked, and the rest of the run commits. It goes into the project's `Standing-FUs.md` as one line, with the next FU ID (a migrated project: `ledger.mjs next-id fu`) and the rigor its answered work would need (`cleanup-light` unless that work meets the Heavy-rigor trigger):

`- **FU-<n>** [<type> · <rigor>] <what> — recommended: <pick>; <mockup path, or a precise description> — trigger: owner decision — <question>`

The ledger report lists it under WAITING ON OWNER, and the next `/start-session` asks it. A project with no `Standing-FUs.md` carries the question in the report and in Current location's Pending (through `/end-session`). When the owner answers, the session that hears it writes their ruling into the row and applies it as `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § End, 6L-c says: a pick moves the row to the group step for its type, or that session works it then; a later pick, a "no" and `Keep parked` each have their own step there. `/end-session` applies an answer no run has. When nothing in the run can go ahead without the answer, the run parks the item, commits the row and reports. A command that doesn't commit its own products (`/module-audit`) leaves the row for the next `/end-session` commit. This replaces two earlier rulings: a product call a run turns up was ruled at the run's closing question, and `/module-audit`'s finding dispositions and costly runs stopped the run. The parked row keeps what the first protected, a recommended pick and the evidence, so the pickup needs no second brief.

### Asked live

Only where the decision is the command's job: `/page-design`'s lock, `/module-build`'s concept and lock, `/competitive-anchor`'s lock, `/module-sprint`'s prompt to lock a draft spec, and `/start-session`'s owner questions, the WAITING ON OWNER rows it asks after the brief. The owner ran the command to make that call, or, at a session's start, is at hand to make it.

Every other command and skill takes `AskUserQuestion` out of its tools with `disallowed-tools: AskUserQuestion` in its frontmatter, so it can't ask; `${CLAUDE_PLUGIN_ROOT}/tests/decision-gates.test.mjs` checks both sets. The removal lasts until the owner's next message. A command that asks live, run later in the same turn as one that can't (`/module-sprint`'s next `/page-design` lock, after the last page's implement step), asks the same question as plain text, its recommended pick first, and ends its turn.

### Outward actions

Never taken by a run on its own. Each is a line in the report after the commit, and the owner's go starts it.

## Halts

A halt reports and stops; it never asks a question. It names what blocked the run, what's done, and what would unblock it, and commits nothing the blocker touches.

- **A broken tool:** a script that errors, an unreadable ledger mode line, a missing agent file.
- **A true blocker:** a missing dependency, a red build or test the run can't fix, a refused ledger override or an over-size rulebook (`/end-session` 7L), an artifact the run needs that isn't there.
- **The loop guards:** a second pr-review pass with new revise-here findings (max one cycle), a second consecutive replan, and a verification rate under a command's trust floor.

## Telling them apart

If the question is how the code works, how thorough to be, which approach to take, or whether a run is worth its cost, it's Claude's: decide and report. If the answer changes what a user sees, reads or does, what the business charges or keeps, what loads into every session, or acts outside this machine, it's the owner's.

## Asking the question

The questions that remain — a live decision above and `/pre-commit-check` run directly — are asked with `AskUserQuestion`. The form takes 1–4 questions per call and 2–4 options per question, adds a free-text "Other" to each question, and by its own convention marks only the first option "(Recommended)". The caps belong to the harness: raising them is feedback to Anthropic, which is the owner's to send. Within them:

- **Mark every option Claude would take.** A single-select puts its one pick first, marked "(Recommended)". A multi-select marks every option Claude would pick, not only the first, and lists them first.
- **Only the owner's items go in the form.** A tier-1 decision never becomes a question; it is a line in the report.
- **Split, never drop.** More than four items go across several questions of at most four options each, and a fifth question goes to a second call. No item is left out, or folded into "Other", to fit the cap.

`${CLAUDE_PLUGIN_ROOT}/tests/decision-gates.test.mjs` fails on an asker's `Options:` list outside 2–4 options (a checkpoint once recommended all four leftovers but showed one as recommended), on a retired stop's wording in the rulebook, the mods' notes or a registered project's CLAUDE.md, none of which has frontmatter to remove the tool (its shapes for asking the owner on a programming call skip, by name and with a reason, a project whose calls aren't the owner's or that runs no pipeline), and on a project's § pointer into the toolkit's docs that names no heading. The same wording check over the commands and these docs was retired: a probe showed the frontmatter removal blocks the tool, and the pipelines' text has one source.
