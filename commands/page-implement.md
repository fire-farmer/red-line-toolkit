---
description: Per-page implementation pipeline. Executes a locked code plan, runs /simplify, verifies (build + manual), then one review — pr-review-toolkit, /security-review and a decorrelated Fable audit in parallel — adjudicates and revises, then commits locally and reports. Max 1 revise cycle.
argument-hint: '[page name from locked code plan]'
allowed-tools: Read, Write, Edit, Bash, Agent, Skill
disallowed-tools: AskUserQuestion
---

> **Gates follow `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`.** A programming call is decided and listed in the run's report; only that doc's tier-3 items are the owner's.

# /page-implement

You are running the **/page-implement pipeline** — implementation of a locked code plan, then one review pass (pr-review-toolkit, `/security-review` and a decorrelated Fable audit) before commit. The user invoked this because they need the code written, reviewed, and verified before commit.

User's invocation argument (page name): **$ARGUMENTS**

---

## Stage 0 — Pre-flight scope check

Locate the locked code plan:
- Read `docs/plans/YYYY-MM-DD-module-*-page-<page-slug>-code.md`
- Confirm `status: locked`
- If not locked, refuse and tell user to lock the code plan first

Read the plan's **Effort** line; a plan locked without one gets its efforts set here, before the first dispatch (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort).

Run the 3-item gate (`${CLAUDE_PLUGIN_ROOT}/reference/prompting-cheatsheet.md` § Pre-Flight Scope Check). Note risk surface engagement for downstream security upgrade.

- Ledger mode: !`node "${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs" mode 2>&1 || echo "LEDGER: unavailable"`

---

## Stage 1 — Execute

Follow the locked plan. Create/modify files exactly as specified. **No silent scope creep** — anything beyond the plan passes the filing bar instead of going quietly into the diff: fix it here when it's the same class as the plan's work (R-20), or when it's a real issue in the area the plan works, the same feature, flow or files, whatever its class, a minor tweak included (listed in the report and commit body, `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs); file it only for a separate area or the owner's call, with a named reason it can't be done now and a pass of the 2-week filter; otherwise drop it with one line in the commit body. Migrated projects (`LEDGER: migrated`): file and close FUs per `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs; if the mode line starts with none of `LEDGER: migrated`, `LEDGER: not migrated` or `LEDGER: not a stack project` (for example `LEDGER: unavailable` or `LEDGER ERROR`), halt and report it before touching FU rows.

If the plan is missing details (exact file paths, edge cases), kick back to `/page-code` rather than guessing.

---

## Stage 2 — /simplify

Invoke the `simplify` skill on modified files. Apply suggestions with concrete failure modes or project-doc citations; reject generic-best-practice appeals.

**After `/simplify` completes,** each sibling pattern it caught outside the code plan gets a filing-bar outcome: **absorbed in this pipeline** when it's the same class (the default, R-20) or a real issue in the area the plan works (a minor tweak included); **filed** only for a separate area or the owner's call, with a named reason and a pass of the 2-week filter; otherwise **dropped** with one line in the commit body.

**Anchor sweep.** Last, run `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep: close each FU it lists that qualifies, and carry the rest into the report.

---

## Stage 3 — Verify

Run `npm run build`. If pass: continue to Stage 4.

If fail: invoke `superpowers:systematic-debugging` skill to find root cause, fix, re-verify. Loop within Stage 3 until clean. When three fixes have failed and the skill says to discuss with your human partner before another, halt and report it as a true blocker (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Halts).

**Characterization-test gate:** if the diff touched `src/lib/**` and no `*.test.ts` was added/updated for it, that is a verify FAILURE — author the characterization test the code plan named (the input/output pair), then run `npm test` and confirm it passes before Stage 4. (CLAUDE.md mandate: new `src/lib` modules ship with characterization tests. This makes Stage 4's `pr-test-analyzer` review *real* tests rather than detect their absence.)

Also run manual checks from the code plan's test scenarios. Verify lint count preserved or improved.

---

## Stage 4 — Review: pr-review-toolkit, /security-review and the Fable audit (parallel)

Invoke `/pr-review-toolkit:review-pr` via the Skill tool, with the aspects `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel picks from the diff, and `parallel` after them. Never pass `simplify` or `all`: Stage 2 already ran `/simplify`.

In the same turn, in parallel:
- **`/security-review`**, every run: invoke it via the Skill tool on the current branch's staged + unstaged changes.
- **The decorrelated Fable audit**, every run: a `fable-seat` subagent (`subagent_type: red-line-toolkit:fable-seat`) on the decorrelated family — **`model: fable`**, or `model: opus` if the orchestrator is Fable (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats, whose model check it gets). Pass the locked code plan's path. Prompt:

> *"Decorrelated audit of this implemented diff (`git diff HEAD`, plus staged). Locked code plan: `<absolute path>` — read it for the intended behavior. Minor tweaks and in-area fixes outside the plan, also intended: `<the listed tweaks, or none>`. You did not write this code — audit it with fresh priors. Focus ONLY on: correctness, data-integrity, logic errors, silent behavior changes vs. what the plan intended, accessibility, and duplication — for every new CSS class, custom property, color-mix recipe or inline style object in the diff, search the project's stylesheets and components for an existing equivalent and flag near-duplicates, naming the existing one. If a defect class in this diff will recur and nothing checks for it, recommend a check (what it would catch) — a recommendation, not a finding. Do NOT review security and do NOT restyle. Output `file:line — severity — issue — rationale`, or `CLEAN`."*

Capture the three outputs as findings sources for Stage 5, labeled `pr-review-toolkit:review-pr`, `security-review` and `fable-decorrelation`. **Fable finds; it never fixes.**

---

## Stage 5 — Adjudicate (security asymmetric upgrade, max 1 cycle)

If no source surfaced a finding: go to Stage 6.

Otherwise dispatch The Adjudicator on the findings, with the locked code plan's path and a `DELTA:` line naming the minor tweaks and in-area fixes outside the plan. Apply security-asymmetric upgrade. Absorb every KEEP and MODIFY verdict, revise (marking a file a fix creates intent-to-add, `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel) and re-verify (Stage 3's checks), and list the verdicts absorbed and ditched in the report (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`). A check Fable recommends is filed or dropped under the filing bar, not built in this run.

**Max 1 cycle:** if a second pass surfaces NEW revise-here findings, halt and report (a loop guard) — something deeper is wrong.

Escalation tags in MODIFY verdicts:
- `MODIFY [revise-here]` → fix in this pipeline
- `MODIFY [escalate-to-code]` → kick back to `/page-code` (structural/architectural issue)
- `MODIFY [escalate-to-design]` → kick back to `/page-design` (design mismatch)

---

## Stage 6 — Commit + report

Stage the files this run changed and run `/pre-commit-check` in a subagent (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The pre-commit audit); when the Stage 2 anchor sweep closed an FU, its `--message` carries the `FU-Closed:` footer (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs, Closing an FU). Fix each WARN or FAIL and re-run it (tier 1), then commit per `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § The report. The Done summary is the report, with a visual change shown rendered. A design, copy or UX item beyond the locked design is parked (tier 3) and the rest commits.

---

## Done — three valid termination states

1. **Standard close** — code changes ship, code plan marked RESOLVED.
2. **Validated-no-action close** — implementation surfaced that the code plan's premise was wrong; close and kick back to `/page-code` for replan.
3. **Abandon-and-replan** — Stage 5 surfaces audit gaps too severe to absorb; flip frontmatter to `status: abandoned` and kick back to `/page-code` for a replan. A second consecutive replan halts and reports.

Summarize which state applies, plus:
- Files changed (count + paths) — zero if validated-no-action
- Verify status (build pass, manual checks)
- Effort per dispatch, next to its model (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort)
- Adjudicator verdicts absorbed and ditched at Stage 5, and any recommended check with its filing-bar outcome
- Anchor sweep (Stage 2): its line from `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep, or why it didn't run (a project that isn't migrated)
- Leftovers under the filing bar: **fixed now N (each minor tweak and in-area fix named) / filed N (each with its named reason) / dropped N (named in the commit body)**
- Owner items parked: each row ID with its question, or none
- Any escalations to `/page-code` or `/page-design`
- **If the page has interactive UI (forms / modals / tables / drawers):** recommend running `/mobile-audit <page>` before treating accessibility (tap targets, contrast, focus order, viewport) as verified — Stage 3's build check never exercises runtime a11y, and `/mobile-audit` already owns that lens.
- The Stage 6 commit hash (none for validated-no-action)

**Effectiveness telemetry — append on every run.** Via Bash, append ONE JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent), whatever the close: a validated-no-action or abandon close emits it too, with `files_changed:0` and the matching `outcome`.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"page-implement\",\"outcome\":\"<completed|no-op|abandoned>\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"build_pass\":<true|false>,\"files_changed\":<n>,\"revise_cycles\":<0|1>,\"leftovers\":{\"fixed\":<n>,\"filed\":<n>,\"dropped\":<n>,\"tweaks\":<n>},\"owner_parked\":<n>,\"swept\":{\"listed\":<n>,\"closed\":<n>}}" >> ~/.claude/metrics.jsonl
```

`outcome` is `completed`, `no-op` (validated-no-action) or `abandoned`; `keep/ditch/modify` are the Stage 5 verdict counts, `0/0/0` when it didn't adjudicate; `build_pass` is Stage 3's last `npm run build`; `revise_cycles` is `0` or `1`; `leftovers`, `owner_parked` and `swept` count as `/cleanup-light` defines them, the anchor sweep being Stage 2's. A `pipeline:"process-change"` row in the metrics file marks where a field begins or changes meaning.

**Adjudicator-effectiveness telemetry — emit alongside the row above when Stage 5 adjudicated,** with the field set `/cleanup-light` and `/change-heavy` use.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"caller\":\"page-implement\",\"outcome\":\"completed\",\"stage\":\"5\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"net_actionable\":<adjudicator Net-actionable count>,\"missed\":<adjudicator MISSED count, 0-3>}" >> ~/.claude/metrics.jsonl
```

**Fable-decorrelation telemetry — emit whenever the Stage 4 Fable audit ran.** `code_findings` counts its raw findings; `check_recommended` is whether it recommended a check, and `check_built` whether this run built one (only a run that picks up a filed check does).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"fable-audit\",\"caller\":\"page-implement\",\"outcome\":\"<completed|abandoned>\",\"code_findings\":<n>,\"check_recommended\":<true|false>,\"check_built\":<true|false>}" >> ~/.claude/metrics.jsonl
```

---

## Notes for Claude executing this command

- **Scope discipline is mandatory.** Anything beyond the locked plan passes the filing bar (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs — read it before filing: a row needs **both** a named reason **and** a pass of the 2-week filter) — never silently into the diff.
- **Gates follow `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`.** No stops: the run commits and reports, and a design item beyond the locked design is parked.
- **Debug folded into Stage 3** — verify isn't "done" until build passes.
- **Max 1 revise cycle** to prevent revise-loop spirals.
- **Pass `model:` and the plan's effort on every dispatch;** the Fable seat runs on the other family.
- **The Adjudicator is `Read, Grep` only.** Don't pass it write tools.
