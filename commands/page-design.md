---
description: Per-page design pipeline. Draws two or three directions per screen on a Design canvas built on the project's design system (an in-repo HTML file when it has none), at 375px and desktop with realistic data; three critics review the rendered artboards (frontend-design, UI/UX, and a decorrelated Fable seat for outcome, consistency and friction); the Adjudicator rules; the leading direction gets its other states and is rebuilt as the in-repo mockup, measured with the project's checks; the plan carries a checked Reuses line, the figures the page prints and the spec decisions it honours; the owner locks it, asked live or, with --park, through an owner-decision row. Use after a Module Spec is locked to design each page in the module.
argument-hint: '<page name from Module Spec> [--spec <path>] [--park]'
allowed-tools: Read, Write, Edit, Bash, Agent, Artifact, AskUserQuestion, Skill, ToolSearch, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__computer, mcp__claude-in-chrome__browser_batch, mcp__claude-in-chrome__javascript_tool, mcp__claude-in-chrome__resize_window, mcp__Claude_Browser__preview_start, mcp__Claude_Browser__resize_window, mcp__Claude_Browser__javascript_tool, mcp__Claude_Browser__computer
---

> **Gates follow `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`.** A programming call is decided and listed in the run's report; only that doc's tier-3 items are the owner's.

# /page-design

You are running the **/page-design pipeline**: per-page design that is drawn before it is judged. The user invoked this because they need a locked design for a specific page before code work begins. Critique removes defects but doesn't raise the ceiling; the drafting does, so this pipeline draws several real directions, has critics look at the rendered screens, and measures the one it leads with.

User's invocation argument (page name from Module Spec): **$ARGUMENTS**

---

## Stage 0 — Pre-flight scope check

Locate the Module Spec, first match wins, and name the one used and how it was found:
1. A spec path in $ARGUMENTS (`--spec <path>`).
2. The spec the active campaign names: the campaign doc linked from STACK.md's Global plan, its `Spec:` line.
3. `docs/plans/*-<module>-spec.md` (which also catches the older `module-<module>-spec.md` name), the newest with `status: locked`.
4. `docs/plans/*-<module>-design.md` or `*-<module>-module-design.md` (a module's design spec as `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § A module's design spec names it, such as `2026-03-25-billing-design.md` or `2026-03-25-billing-module-design.md`), when its body `Status:` line says it's approved or locked, or, with no such line, its frontmatter says `status: locked`.
5. Nothing found: halt, listing every path and glob searched. Never fall back to "the most recent" file of another module.

When the spec is a hub (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § A module's design spec), read the page's contract too, from its section of the hub or the page's spec file the hub links, with the hooks it consumes; both go into the brief. Then confirm the page from $ARGUMENTS is in the spec: its page list, or, for a spec written as screens and flows, a named screen, state or wireframe (the spec's mockups count). If it isn't, halt and say so. A spec that is still a draft is read but flagged: the lock at Stage 4 can't be firmer than the spec under it.

**A parked lock to resume.** When this page already has a design plan with `status: draft` and an `owner-decision:` line, find the row by its ID in `Standing-FUs.md` or STACK.md (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § End, 6L-c moves a picked row into a group step under the same ID). The owner's ruling is the one written into the row, or their answer in this session to `/start-session`'s question on it; a project with no `Standing-FUs.md` writes `owner-decision: pending` and takes their answer in chat. With a ruling, skip to Stage 4's lock and act on it as their answer, re-applying the plan's **Verdicts** list to a direction it rebuilds. A "no" ruling, or a row deleted on one: report it and stop, the plan left `draft`. No ruling yet: without `--park`, the owner ran this themselves, so skip to Stage 4 and ask the lock live; with `--park`, report that the row is still waiting and stop.

Run the 3-item gate (`${CLAUDE_PLUGIN_ROOT}/reference/prompting-cheatsheet.md` § Pre-Flight Scope Check):
1. **Rigor check** — confirm pipeline-worthy: a new page, a new abstraction, or a change that meets the project's CLAUDE.md Heavy-rigor trigger
2. **Risk surface check** — engage security-asymmetric upgrade if RLS / auth / Stripe / exports / financial calc touched
3. **Existing-primitive check** — name the CSS, component and token families the page will draw from; they become Stage 3's checked Reuses line

**Find the project's design system.** The command serves several projects, so the system comes from the project, never from this file: a line in the project's style guide (for example `docs/STYLE_GUIDE.md`) or its CLAUDE.md that names a claude.ai Design System artifact. Read its `project/README.md` and `project/tokens.json` with the Artifact tool. An artifact belongs to the claude.ai account that made it, so a session signed in to another account sees it only once it is shared with that account. When no line names one, the read fails, or the session has no Artifact tool, say which in one line and use the fallback, the project's existing practice (several directions in one HTML file on the app's own tokens): Stage 1 draws the directions side by side in one HTML file, `<page>-directions.html` in the brief's folder (below), and Stages 2–4 run the same on it. The mockups folder is the project's (for example `docs/mockups/`).

Read the module's other locked plans, design and code (`docs/plans/*-module-<slug>-page-*-design.md` and `*-code.md`), and its wireframes: a code plan can already have decided what the brief would call a gap (a route, a Settings section, a toast's action), and Stage 2's Fable seat checks the new page against all of them.

---

## Stage 1 — Brief, then two or three directions

**The brief**, written to `<mockups folder>/<module>/<page>-directions/BRIEF.md` (a durable folder: the captures land beside it):
- the page's job and its primary action;
- when the spec is a hub, the page's contract and each hook it consumes, read at Stage 0;
- **the spec decisions it must honour**, numbered with their spec reference (a decision number, a screen id, a section); and each thing the page needs that neither the spec nor the module's other plans decide, marked as a gap;
- the states it has (empty, loading, error, success, edge cases such as zero or maximum data and a slow network);
- the figures it prints;
- one realistic dataset, used in every direction (real-looking addresses and amounts, never "Your data here");
- the visual reference the directions execute against (a project's CLAUDE.md may name some under its design principles, such as "terminal density" or "utilitarian restraint");
- the spec's path and the module's other locked plans and wireframes read at Stage 0;
- the effort of every agent the run dispatches, next to its model (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort).

**The directions.** Draw two or three that differ in structure (where the page lives, its layout and hierarchy, its interaction model), never in palette: every direction uses the design system as it is. Each draws the primary state at 375px and at desktop width (1280–1440px) with the brief's dataset. Draw them on a canvas made from the **Design** artifact type (the Artifact tool's quickstart, intent `design`), one artboard per direction and width, one row per direction with a title note naming its idea, and the design system installed on the canvas as the type's instructions say. Name the canvas `<Module> · <page>`. A screen a locked wireframe covers is drawn as that wireframe on the real tokens, plus directions for what it leaves open.

**Capture** each artboard as a PNG into the brief's folder (`D1-desktop.png`, `D1-375.png`, …): open the canvas in a signed-in browser (Claude in Chrome; the built-in pane only where it is signed in), open each artboard in the focused view (the arrow keys step through them), move the pointer off it, and save a full-resolution capture of the artboard's region (Claude in Chrome's `zoom` on that region with `save_to_disk`, at scale 1, then copy the saved file into the folder). R-16 holds: confirm the page has focus and wait for it to render before each capture. With the fallback, capture the HTML file at each width the same way. Then append a **Directions** list to the brief: each direction's ID, its idea in one line and its capture paths.

---

## Stage 2 — Critique the rendered directions (3 critics)

Dispatch THREE critics in parallel via the Agent tool, **a single message with three tool calls**. Each prompt carries the brief's path, every capture's path, the spec's path, the project's style guide and CLAUDE.md, and the module's other locked design and code plans and wireframes; a subagent has no other context (R-22). 2a and 2b pass `model:` matching the orchestrator's family; all three take the brief's effort.

- **Critic 2a — frontend-design lens (general-purpose):**
  > *"Review these rendered design directions through the frontend-design lens. Brief: `<path>`. LOOK at every capture it lists. Anchor to the project CLAUDE.md's design principles (refuse AI defaults: no generic gradients, sparkle icons, rounded-2xl + soft shadow on every surface) and the style guide's refuse-list. Verify brand fidelity (the project's brand colours, its type for financial values, its card tiers, its rules for coloured text and badges), hierarchy and density, and whether each direction could be any SaaS app. Judge what is drawn, not what might be intended. Output `<capture path> — severity — issue — recommendation`, then your pick of the leading direction in one line with its reason."*

- **Critic 2b — UI/UX critic (general-purpose):**
  > *"Review these rendered design directions for UI/UX. Brief: `<path>`. LOOK at every capture it lists. Check how each direction would hold the brief's states, and its interaction patterns. **Enumerate friction explicitly:** extra clicks, ambiguous states, lost form data on validation error, a visual order that fights the task, format-rigid inputs, confirmation on low-risk actions or none on a risky one, dead ends. Each direction draws only its primary state, and the leader's other states are drawn at Stage 3: judge whether each direction's structure has a sensible place for every state the brief lists, not whether it is drawn. Judge labels and visual order as drawn; focus order, accessible names and contrast, touch-target size and overflow at 375px are measured on the mockup at Stage 3. Output `<capture path> — severity — issue — recommendation`, then your pick of the leading direction in one line with its reason."*

- **Critic 2c — Fable seat**, `subagent_type: red-line-toolkit:fable-seat`, decorrelated per `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats (`model: fable`, or `model: opus` when the orchestrator is Fable), with its model check:
  > *"Decorrelated review of these rendered design directions. You did not draw them; judge with fresh priors. Brief: `<path>`. LOOK at every capture it lists, then read the spec and the module's locked design and code plans it names. Your lens: (1) outcome: does each direction earn the page's action; (2) consistency: with every spec decision the brief lists and with the module's other locked plans and wireframes, quoting any contradiction, and naming any gap the brief marks that one of them already decides; (3) friction across the whole flow: how the user arrives, what happens after the primary action, and each gap the brief marks. Do not review security, do not restyle, and do not judge contrast, target size or 375px overflow. Output numbered findings `<capture path> — severity — issue — evidence — recommendation`, then your pick of the leading direction in one line with its reason."*

The Fable seat holds the outcome lens (three critics and the Adjudicator). Collect the outputs into one block, each finding line led by its critic's label (`[frontend-design]`, `[ui-ux]`, `[fable-decorrelation]`, the ids the telemetry's `critics` field uses), a same-site duplicate kept once with `(also: <label>)`; after the verdicts, tally each critic's raised, kept and unique findings, as `/cleanup-light` tallies its critics.

---

## Stage 3 — Adjudicate, draw the leader's states, rebuild, measure

**Adjudicate.** Dispatch The Adjudicator (`red-line-toolkit:the-adjudicator`) with the block led by a `DELTA:` line (the brief's path and its Directions list, so a finding that restates a direction's idea is ditched, and a note that every state but the primary one is drawn at Stage 3) and the spec's path; each finding cites its capture's path in place of `file:line`. Apply the security-asymmetric upgrade if it engaged. Absorb every KEEP and MODIFY (tier 1); the ditched ones are listed at the lock so the owner can pull one back. A gap the verdicts can't close (a spec question, a ruling on copy) becomes an owner-decision candidate with a recommended pick: Stage 4 asks it beside the lock, or with `--park` parks it as its own row.

**Pick the leading direction** from the critics' picks and the verdicts, with its reason in one line (tier 1: the pick is the recommendation; the choice is the owner's at the lock). Apply the absorbed verdicts to it on the canvas, and draw its other states from the brief beside its primary one: the directions drew only the primary state, so the lock needs these.

**Rebuild the leading direction as the in-repo mockup** at `<mockups folder>/<module>/<page>-D<n>.html` (one file per direction rebuilt, so a Show at Stage 4 never overwrites another), on the project's real values in its shipped theme (for example its theme class on `<html>`, linking the project's token stylesheet and the style partials whose classes it uses, or copying their values as the existing mockups do), with every state. This file is the hand-off: the locked plan points at it, and the build (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Building from a locked design) works from it and the plan, never from the canvas, which stays the record of the exploration.

**Measure the mockup** at 375px and at desktop width, and report numbers, not opinions:
- **contrast:** each text colour the mockup sets, on each surface it sits on, through the project's contrast instrument (for example a `scripts/contrast.mjs '<text>' '<surface>'`; a translucent colour is measured `A over B`);
- **proven inks:** each coloured text is an ink the project allows (for example a list of allowed text-colour tokens), read off the mockup's colour declarations by hand, since no script scans mockups;
- **targets and overflow:** every interactive element is at least 44×44px at 375px and nothing scrolls sideways (`scrollWidth > innerWidth` is false), with `/mobile-audit`'s Layer B collector and its rules (`${CLAUDE_PLUGIN_ROOT}/commands/mobile-audit.md`, lessons in `${CLAUDE_PLUGIN_ROOT}/reference/mobile-audit.md`: the default state, nothing `aria-hidden` or off-canvas counted, the on-screen test);
- **names and order:** every control has an accessible name, and a keyboard pass at 375px meets them in visual order.

A measured failure against a rule the project already holds (a proven ink, the 44px floor) is fixed in the mockup and on the canvas and measured again, and listed at the lock with its before and after. A project with no contrast instrument says so and measures the rest.

**Check the Reuses line.** List each class, component and token the mockup uses. Search the project for each (its stylesheets, its components folder, its token file): a name with no hit is renamed to what exists, or becomes `New: <name> — <why nothing fits>` after a search for a near-equivalent (a class with the same properties, a component with the same job). This is the author's existence check; the decorrelated duplicate search runs on the built code at the change pipeline's review.

---

## Stage 4 — Write the plan, then the owner's lock

Write to `docs/plans/YYYY-MM-DD-module-<slug>-page-<page-slug>-design.md`:

```yaml
---
status: draft             # locked once the owner approves
date: <ISO date>
module: <module name>
page: <page name>
parent-spec: <path to Module Spec>
mockup: <path to the locked direction's in-repo mockup>
directions: <path to the brief's folder, its captures beside it>
canvas: <the canvas link, or none with the fallback>
owner-decision: <the parked row's ID, while parked>
---
```

The plan covers the visual hierarchy, components, states, flow and mobile behaviour of the leading direction as rebuilt, plus five lists:
- **Reuses:** Stage 3's checked line.
- **Figures:** every figure the page prints, with an example value, its source and the project's print helper it goes through (for example a `formatCurrency` function). A figure no helper prints yet is marked `new print`, which the code plan must give a characterization test.
- **Spec decisions honoured:** each decision from the brief and where the design honours it, each consumed hook with its answer (a hook left unanswered is a blocker, § A module's design spec, so it goes with the lock as an owner-decision candidate), for the R-19 re-read at the build's verify; each gap, with the design's answer or its owner-decision candidate.
- **Measured:** Stage 3's numbers at each width, the fixed failures with their before and after.
- **Verdicts:** each verdict absorbed or ditched, with the direction it touches, so a resumed run can rebuild another direction.

**The lock is the owner's** (tier 3, visual design, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Asked live). Ask with `AskUserQuestion` unless `--park` is in $ARGUMENTS: a session that starts this run in another session, or runs it in an unattended wave, passes `--park`, since a run can't tell from inside whether the owner is at hand. Show the canvas link, the mockup path, the measured numbers and every verdict absorbed or ditched. Options: `Lock D<n> as rebuilt` (Recommended) · `Show D<m> rebuilt` (one per other direction) · `Revise` (at most three directions, so at most four options). Each owner-decision candidate is its own question in the same call, its recommended pick first and `Park it` last (§ Asking the question splits more than four).
- **Lock** writes `status: locked` and the locked direction's mockup into `mockup:`, rewrites the plan's body and lists for that direction when it isn't the one they describe, and on a resumed run drops `owner-decision:` and closes the row (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs).
- **Show D<m> rebuilt** applies the verdicts that touched it, draws its states, rebuilds it as `<page>-D<m>.html`, runs Stage 3's measurements and Reuses check on it, and asks again: `Lock D<x> as rebuilt` for each direction rebuilt so far (the Stage 3 pick first and Recommended unless the rebuild changed the recommendation, saying why), `Show D<y> rebuilt` for each one not yet rebuilt, and `Revise`. The owner locks only a mockup they have seen, and every rebuilt direction's file is still there to lock.
- **Revise** takes their notes, applies them on the canvas and the leading mockup, measures again, rewrites the plan to match and asks again.

The lock asks at most three times in one run. A third answer that isn't a lock is applied, and the lock is then parked as below with the state reached, so Stage 0 picks it up.

When an earlier command this turn removed the tool, ask in plain text and end the turn (§ Asked live). **With `--park`**, park the lock as an owner-decision row (§ Parking) naming the canvas link, the directions folder, the mockup and the recommended pick, and each owner-decision candidate as a row of its own; the lock row says it is answered by running `/page-design <page>`, and a resumed run that parks again updates that row rather than adding one. Write the row's ID into the plan's frontmatter (`owner-decision: pending` in a project with no `Standing-FUs.md`, whose question rides in the report), leave the plan `draft`, and report. A build refuses a draft plan (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Building from a locked design), so the page waits for the row; the dispatching session goes on with work the module's locked plans already cover. When the owner answers the row, a run of `/page-design <page>` resumes at this lock (Stage 0).

---

## Done

Summarize:
- Path to the design plan and its status (locked, or parked with the row ID)
- The canvas link (or the fallback and why), the directions drawn, the leading pick and its reason
- The mockup path and the measured numbers
- Which verdicts were absorbed and which ditched, with each critic's raised / kept / unique tally
- Each owner-decision candidate with its recommended pick
- Effort per dispatch, next to its model
- Next step: `/cleanup-light "plan <page> from <this locked plan>"`, which plans it in `/change-heavy` (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Building from a locked design)

**Effectiveness telemetry — append on every completed run.** Via Bash, append JSON lines to `~/.claude/metrics.jsonl` (append-only; create if absent) AFTER the summary above: one for the Stage 3 adjudication (emitted by the orchestrator on behalf of `red-line-toolkit:the-adjudicator`, which is read-only), one for the Fable seat, and one for this pipeline. `keep/ditch/modify` come from the Stage 3 verdict block; `outcome` is `locked`, `parked` (the lock went to an owner-decision row, with `--park` or after three asks) or `abandoned` (the run stopped before Stage 4; skip the adjudicator line if Stage 3 never ran and the fable-audit line if Stage 2 never ran); a run resumed at the lock emits only `{"pipeline":"page-design","outcome":"<locked|parked|waiting|declined>","resumed":true}` with its `ts`; `directions` counts the directions drawn; `canvas` is `design` or `fallback`; `measured` holds Stage 3's failures before their fixes; `owner_parked` counts the rows parked; `critics` holds the per-critic tally under the ids `frontend-design`, `ui-ux` and `fable-decorrelation`. The fable-audit row's `audit_findings` counts design findings here, not a diff audit's, and `check_recommended` is always false: 2c isn't asked for a check.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"caller\":\"page-design\",\"outcome\":\"completed\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"fable-audit\",\"outcome\":\"completed\",\"caller\":\"page-design\",\"plan_findings\":-1,\"audit_findings\":<n>,\"reaudit\":\"n-a\",\"reaudit_findings\":-1,\"reaudit_kept\":-1,\"check_recommended\":false,\"check_built\":false,\"security_engaged\":<true|false>}" >> ~/.claude/metrics.jsonl
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"page-design\",\"outcome\":\"<locked|parked|abandoned>\",\"directions\":<n>,\"canvas\":\"<design|fallback>\",\"measured\":{\"contrast\":<n>,\"ink\":<n>,\"targets\":<n>,\"overflow_px\":<n>,\"names\":<n>},\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"owner_parked\":<n>,\"critics\":{\"<critic-id>\":{\"raised\":<n>,\"kept\":<n>,\"unique\":<n>}}}" >> ~/.claude/metrics.jsonl
```

---

## Notes for Claude executing this command

- **Single critique cycle.** If second-order issues surface while the build plans or implements, they come back as a parked question for a fresh `/page-design` run. Don't loop within this command; Stage 4's lock asks at most three times.
- **One stop, at the lock** (Stage 4, tier 3, visual design); everything before it is act-and-report.
- **Critics see screens, not prose.** A critic prompt without capture paths is a defect of the run.
- **Measured beats judged.** Contrast, inks, target size, 375px overflow, names and focus order are numbers or a pass, never a critic's opinion.
- **The mockup is the hand-off, the canvas is the record.** Code is built from the in-repo mockup and the plan; the captures in the directions folder keep the alternatives readable from either account.
- **Pass `model:` and the brief's effort on every dispatch**; 2c runs on the other family.
- **The Adjudicator is `Read, Grep` only.** Don't pass it write tools.
