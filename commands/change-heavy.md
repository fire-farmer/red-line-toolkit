---
description: Heavy-mode pipeline for changes that meet the project's CLAUDE.md Heavy-rigor trigger — a change that alters a computed or printed figure, a stored, imported or exported data shape, or an auth, RLS, tier or payment path, or introduces a new data model / API shape (under that trigger, a label, copy, layout or styling change inside a high-risk area doesn't). Composes stack skills + writing-plans, parallel critics with an always-on Fable plan critic, the-adjudicator and an automatic plan lock, subagent-driven-development, /simplify, and code review, then commits locally and reports. Everything else runs /cleanup-light, whatever its file count.
argument-hint: '[<fu-id> [<fu-id> …] | <group step, e.g. Campaign/2.3> | "<named task>"]'
allowed-tools: Read, Write, Edit, Bash, Agent, Skill
disallowed-tools: AskUserQuestion
---

# /change-heavy

You are running the **/change-heavy pipeline** — a staged chain (plan, critique, adjudicate and lock, implement, simplify, review, review adjudication) for high-rigor changes. The user invoked this because they want clean, structured, high-performing code, not quick iterations. Take the workflow seriously; don't skip stages.

User's invocation argument (one or more FU IDs, a group step's `home:` address, or a quoted named task, the three input kinds `/cleanup-light` Stage 1 "Pick the work" defines): **$ARGUMENTS**

---

## Stage 0 — Pre-flight scope check

Pending changes:
- Diff stat: !`git diff --stat`
- Working tree: !`git status --porcelain`
- Ledger mode: !`node "${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs" mode 2>&1 || echo "LEDGER: unavailable"`

Migrated projects (`LEDGER: migrated`): file and close FUs per `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs; if the mode line starts with none of `LEDGER: migrated`, `LEDGER: not migrated` or `LEDGER: not a stack project` (for example `LEDGER: unavailable` or `LEDGER ERROR`), halt and report it before touching FU rows.

Before invoking any agents:

1. Read the diff stat and working-tree status above to gauge scope of pending changes.
2. Read the project's Heavy-rigor trigger (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The rigor trigger).
3. Rigor check — **neither the folder nor the file count is an indicator** under the criteria trigger. Test what the argument, the diff or the intended change alters against step 2's criteria, the project CLAUDE.md's own when it states them and otherwise the four defaults, and name the one it meets, or none. The defaults: a computed or printed figure (a value, a rounding, which figure a row prints, whether a figure prints at all); a stored, imported or exported data shape, a migration that rewrites or deletes stored values included; an auth, RLS, tier or payment path; a new data model or API shape. A change inside a high-risk area that only alters labels, copy, layout or styling meets none. Borderline → the heavier one. A project whose CLAUDE.md states its trigger by area or by file count is decided by that instead.
   - **Heavy-rigor trigger met** (a criterion met, named in one line, OR explicit "force heavy" — legacy "force tier-3" — instruction): proceed silently.
   - **Trigger not met:** don't run this pipeline and don't ask (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`). Say so in one line and run the work as `/cleanup-light <FU | group step | "task">`, the standard pipeline at any file count. An explicit "force heavy" still runs it.
   - **Trigger met for only part of the work:** split. Every part that meets no criterion (a label, copy, layout or styling part, say) runs as its own `/cleanup-light`, and this run carries only the part that meets the trigger — unless a named coupling forces them together (a shared file, or the light part having to land first for the heavy part to be correct). State the coupling when you keep them together; a coupling is a fact about the code, not a convenience.

4. **Risk-surface check (carries to Stage 6 — independent of the rigor decision):** scan the argument AND the diff for the *security* subset — `auth, RLS, Stripe, webhook, calculation, financial, security, export` — or the **risk paths** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Risk paths), which Stages 4, 6 and 7.5 and the Notes call the Stage 0 list. If any keyword or risk path matches, set **RISK SURFACE ENGAGED** for this run. This flag — NOT the rigor decision — is *one* trigger for the Stage 6 `/security-review` pass; the other is the implemented diff touching a risk path (re-checked at Stage 6, since Stage 0 predicts the surface before the code exists). A pure rename/structure refactor trips neither. `/cleanup-light`'s Stage 1 risk check sets only its security-asymmetric upgrade; its security pass is decided on the diff.

---

## Stage 0.5 — FU body verification (mandatory for an FU or group step, full-breadth)

Skipped for a named task (no FU body; Stage 1's claim discipline covers the plan's claims). Before the plan is written, run `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § FU body verification full-breadth, so Stage 1 plans from live code rather than from claims that have drifted. A group step's members are checked and the done ones closed here (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs, "When a group step starts"). When the premise is wrong, the section's outcomes apply: a validated-no-action close (Done, state 2), a hand-off to `/cleanup-light`, or the corrected scope continuing into Stage 1.

---

## Stage 1 — PLAN (writing-plans skill)

**First, load the stack skills for the surfaces the change touches** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Stack skills).

**A schema or RLS change in a project with a `supabase/` directory** follows `${CLAUDE_PLUGIN_ROOT}/reference/supabase-local.md`: when the project has adopted (its `package.json` has a `test:rls` script), the plan writes the change as `supabase/schemas/` edits and names `npm run test:rls` in its Verify; when it hasn't, the plan says so and uses that doc's before-adoption path. `/cleanup-light` Stage 5 carries the same pointer.

Then invoke the `superpowers:writing-plans` skill. Follow it through its Self-Review to produce a complete plan written to `docs/plans/YYYY-MM-DD-<feature-name>.md`, and skip its Execution Handoff: no one reviews the plan or picks an execution method, since the plan is critiqued first and Stage 3 locks it. Its header's `Spec:` line names the FU, group step or named task, and its tasks carry no commit step (the skill's implementers commit per task regardless; Stage 4 folds those commits back into the working tree, so Done makes the run's one commit). The plan carries a **Reuses** line: the existing class, token or component each new piece reuses, or `New: <name> — nothing existing fits because <reason>`. Critic 2c checks it against the codebase.

**A ruling that spans surfaces gets a check that enforces it:** `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § A ruling gets a check.

**Effort for every dispatch goes in the plan:** an `## Effort` section setting the effort of each stage's agents, Stage 2's critics and Stage 4's implementers, task reviewers and fix subagents included, per model where a stage uses more than one; risk-floor tasks (Stage 4) get their own line, never below `high` (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort).

**Claim discipline** applies while writing, before the lock: `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Claim discipline.

**Stage 3 locks the plan** without asking, after its critique is absorbed, by adding (or setting) frontmatter on the plan file:

```yaml
---
status: approved
locked-at: <ISO date>
---
```

The lock signals to subsequent stages that this plan is canonical and not to be silently revised.

### Stage 1.6 — Extraction justification (mandatory if plan proposes file extractions)

If the plan proposes ANY new file creation by extracting from a component, hook, or store, verify each extraction against CLAUDE.md "Cohesion gate before extraction" before advancing to Stage 2.

For each proposed file extraction, require a one-sentence statement of what the extraction wins (e.g., "owns a state cluster the orchestrator has no awareness of," "needs `React.memo` for stability in a `.map()`").

**Reject** the extraction if its justification falls back to any of these:

- "Future testability" alone
- "Visual isolation" alone (visual-leaf extractions require >100 LOC + visual isolation, not isolation alone)
- "Pattern consistency with sibling extractions" as primary justification (allowed as secondary; not sufficient alone)
- "2+ callers within the same parent file" — this is within-file repetition; use a private inner function per CLAUDE.md "Cohesion gate before extraction"

If any extraction fails the gate, revise the plan before advancing. Update the plan with the corrected extraction list before Stage 2.

Anchored in CLAUDE.md "Cohesion gate before extraction" (File Size Guidelines section).

---

## Stage 2 — PARALLEL CRITIQUE (two same-family critics + an always-on Fable decorrelation critic)

Dispatch the same-family critics (2a, 2b) in parallel via the Agent tool — **a single message**. **Pass `model:` matching the orchestrator's current model family (`opus` | `sonnet` | `haiku` | `fable`) on 2a and 2b**, overriding each critic's pinned default so both run at the same level as this pipeline. Without the override, Critic 2a runs on Opus and Critic 2b on Sonnet — producing uneven critique depth that biases the Adjudicator's downstream work.

**Critic 2c is dispatched on the decorrelated family** — a model family *different from the orchestrator's*: normally `model: fable`, but `model: opus` when the orchestrator is itself Fable (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats). The mismatch is the *mechanism*, not a bug: a different model brings different priors and catches the design flaws a plan authored and reviewed by the same family would share. Include it in the same parallel message, every run.

- **Critic 2a — `pr-review-toolkit:code-reviewer`** (conventions and project-style lens). Prompt:
  > *"Review this implementation plan against the project's CLAUDE.md, docs/STYLE_GUIDE.md, and existing patterns. Plan path: `<absolute path>`. Focus on: convention violations, naming, organization, alignment with documented design principles. Output structured findings, one per line: `file:line — severity — suggestion — rationale`. Only include findings that require an action — if something is compliant or correct, omit it entirely; do not log verification of correct behavior as a finding."*

- **Critic 2b — `feature-dev:code-reviewer`** (bugs and quality lens). Prompt:
  > *"Review this implementation plan for bugs, logic errors, security vulnerabilities, code quality issues. Plan path: `<absolute path>`. Use confidence-based filtering — only report high-priority issues. Output structured findings, one per line: `file:line — severity — suggestion — rationale`."*

- **Critic 2c — Fable decorrelation lens** *(always — every heavy run now meets the Heavy-rigor trigger, so every plan gets the decorrelated eye)*. Dispatch via the Agent tool as a `fable-seat` subagent (`subagent_type: red-line-toolkit:fable-seat`) on the decorrelated family — **`model: fable`**, or `model: opus` if the orchestrator is Fable (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats). Prompt:
  > *"Decorrelated architectural review of this implementation plan. Plan path: `<absolute path>`. You did not write this plan — audit it with fresh priors. Focus ONLY on: architectural soundness, hidden coupling, data-model / schema correctness, load-bearing assumptions the plan takes for granted, sequencing / dependency errors, missed touchpoints (search the codebase for every place the change must also reach), and the plan's Reuses line (search the project's stylesheets and components for an existing class, token, component or recipe that already does what the plan adds; flag near-duplicates). If a defect class this plan fixes will recur and nothing checks for it, recommend a check (what it would catch) — a recommendation, not a finding. If the plan carries out a ruling over every surface or reader, it must name a check that enforces the ruling, produces its census from the code and is built before the sweep; a plan without one is a finding. Do NOT review security (a dedicated pass covers that) and do NOT nitpick style. State the goal and hunt for the flaw — don't follow a checklist. Output structured findings, one per line: `file:line — severity — issue — rationale`. Omit anything compliant; report only what needs action."*

A check Critic 2c recommends is filed or dropped under the filing bar, not built in this run (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`).

Collect all critics' outputs (2a, 2b, 2c). Concatenate them into a structured markdown block:

```
PLAN: <path to plan file>
CRITICS:
  - id: pr-review-toolkit:code-reviewer
    findings: |
      <verbatim output from Critic 2a>
  - id: feature-dev:code-reviewer
    findings: |
      <verbatim output from Critic 2b>
  - id: fable-decorrelation            # always — Critic 2c runs every heavy plan
    findings: |
      <verbatim output from Critic 2c>
```

---

## Stage 3 — ADJUDICATE (the-adjudicator agent)

Dispatch The Adjudicator (`red-line-toolkit:the-adjudicator`) via the Agent tool. Pass it the structured block from Stage 2 plus the path to the plan. The Adjudicator marks each critique as KEEP / DITCH / MODIFY and returns a structured verdict block.

Absorb every KEEP and MODIFY verdict into the plan file, then **lock it** (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`: the heavy plan lock is automatic). Add the Stage 1 frontmatter with `locked-at` set to the current ISO date, and list the Adjudicator's verdicts, what the revision changed and the ditched findings in the Done report. A plan item that is the owner's (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` tier 3) is parked per § Parking, and the rest of the plan locks.

---

## Stage 4 — IMPLEMENT (subagent-driven-development skill)

Invoke `superpowers:subagent-driven-development` (single session, a fresh subagent per task with review between). The plan path is the locked-and-revised file from Stage 3. Do not use `superpowers:executing-plans` here: it has no subagent mode and runs every task inline, so the per-task models below would never apply.

**In place, one commit.** The skill asks before working on main and before creating a worktree (its Setup and `superpowers:using-git-worktrees`). The project's own commit convention (its CLAUDE.md) and `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Tier 1 — act and report answer both: work on the current branch, with no worktree. Before invoking it, record `git rev-parse HEAD` as the base, and delete the plan's skill workspace (`.superpowers/sdd/<plan>/`) if an earlier pass left one, or a re-entry from a Stage 7.5 replan would find every task complete and dispatch nothing; a re-entry keeps the first pass's base, with that pass's work already in the tree. Its implementers commit per task, which its review packages need. After the last task's ledger line:

1. `git log --oneline <base>..HEAD` must show only this run's task commits; another session's commit there halts and reports.
2. Keep those commits reachable: `git update-ref refs/change-heavy/<plan-slug>/<pass> HEAD` (pass 1, or 2 on a re-entry, so a replan keeps the first pass's ref). Record the base, the ref, and `git diff --name-only --diff-filter=A <base> HEAD` (the files the tasks created) in the run's notes.
3. `git reset --mixed <base>`, then mark the created files intent-to-add (§ The review panel), so Stages 5–7 review the whole change as a working-tree diff.

Done stages the run's files by path, the created ones included, and makes the run's one commit; then it deletes the run's refs under `refs/change-heavy/<plan-slug>/` and the skill workspace. A halted or abandoned run keeps the refs and names them in its report, so the task commits stay recoverable (`git reset <ref>`).

Stop the skill there: skip its Final Review (Stages 6–7 review the whole change) and its Finish's hand-off to `superpowers:finishing-a-development-branch` (Done commits locally and reports). First collect two things from its ledger: the "Rulings I made" list, as its Finish says, for the Done report; and every `minor (deferred)` line, which the skill would have routed to its Final Review — Stage 6 adds them to the findings as source `sdd-deferred`, so Stage 7 adjudicates them rather than dropping them.

**Model per task — the skill picks, under a risk floor.** `superpowers:subagent-driven-development` requires an explicit `model:` on every implementer and task-reviewer dispatch and picks the least powerful model that fits the task (its *Model Selection* section: cheapest for a complete spec on 1–2 files and for single-file mechanical fixes, standard for multi-file integration, most capable for design work). Follow it, **with one override: any task whose files intersect the risk paths (the Stage 0 list), or whose plan text changes money math, RLS, auth, payments or exports, dispatches its implementer, its task reviewer AND every fix subagent for that task on `model: opus` (`fable` if the orchestrator is Fable) — never cheaper.** The skill sizes tasks by file count and spec completeness, not by blast radius, and the Stage 6 Fable audit does not cover security, so who writes risk-surface code, including the fix a task reviewer asks for, is the only authoring-time protection. Tally each implementer dispatch by model, and count the floor overrides, for the Done telemetry. Every one of these dispatches also passes the plan's effort for its model, or the risk-floor line for a floor task (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort), which the skill's prompt templates leave out.

**Schema and RLS tasks run local first** (`${CLAUDE_PLUGIN_ROOT}/reference/supabase-local.md`): in an adopted project, a task that changes schema or RLS is applied on the local stack and passes `npm run test:rls` before Stage 5. A red harness is a blocker. The prod change, an adopted project's push or the before-adoption path's `apply_migration`, is an outward action (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` tier 3): it runs after the commit, on the owner's go.

The skill's four stops map to the decision gates. A plan so broken that every path forward is a guess halts and reports (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Halts). An irreversible, destructive, security-sensitive or outside-the-repo action (a prod change, a push, a merge, a publish, deleting data) is never taken: it waits for the owner's go as a line in the report (§ Outward actions). Editing risk-path code is not a security-sensitive stop: the risk floor above and the Stage 6 security pass cover it. § Halts adds two halts of its own: a missing dependency, and a test still red after the skill's fix loop and breaker (a parked finding that is a red test blocks Stage 5). **Do not guess past one.** An unclear instruction isn't a blocker: settle it from the locked plan (its Approach, its Verify and the Stage 3 verdicts) and list the reading in the report.

---

## Stage 5 — SIMPLIFY (`/simplify` skill)

After implementation is complete and verified, invoke the `simplify` skill on the modified code. Apply suggestions that pass the same evidence bar the referee uses (concrete failure mode, project-doc citation, declared scope). Reject suggestions that demand abstraction at <2 callers, defensive checks for impossible conditions, or generic best-practice appeals.

**After `/simplify` completes,** each sibling pattern it caught outside the FU body gets a filing-bar outcome (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs): fixed in this pipeline when it's the same class (R-20) or a real issue in the area the change works (the same feature, flow or files, a minor tweak included), listed in the report and commit body; otherwise filed, only for a separate area or the owner's call, with its named reason and a 2-week pass, or dropped with one line in the commit body.

**Anchor sweep.** Last, run `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep: close each FU it lists that qualifies, and carry the rest into the report.

---

## Stage 6 — REVIEW (`/pr-review-toolkit:review-pr`, the Fable audit and conditional `/security-review`, in parallel)

Run `date +%s` as Stage 6 starts and again when its last source returns; the difference is the telemetry `stage6_s`. Invoke `/pr-review-toolkit:review-pr` via the Skill tool with the aspects `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel picks from the diff (from `code tests errors types comments`), and `parallel` after them. Omit `simplify`, since Stage 5 already ran the dedicated `/simplify` skill, and omit `all` (which includes simplify by default).

The aspects map to specialized agents, each passed on its count (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel):

- **code** (`pr-review-toolkit:code-reviewer`, always) — conventions, bugs, project-guideline adherence
- **tests** (`pr-test-analyzer`, `tests` > 0) — coverage quality, critical gaps, behavioral vs implementation tests
- **errors** (`silent-failure-hunter`, `errors` > 0) — silent failures, inadequate catch blocks, fallback misuse
- **types** (`type-design-analyzer`, `types` > 0) — encapsulation, invariant expression, type design quality
- **comments** (`comment-analyzer`, always passed; it reviews only the comments and docs the diff adds) — comment accuracy, rot detection, doc completeness

Works on the current diff/branch — no PR required, aligned with the repo's main-only convention.

**Conditional security pass — if RISK SURFACE ENGAGED at Stage 0 *or* the implemented diff touches a risk path:** Stage 0 predicts the risk surface from the argument before the code exists, so re-check here against the actual change — `git diff --name-only HEAD` intersected with the risk paths (the Stage 0 list). If the flag is set OR that intersection is non-empty, invoke `/security-review` via the Skill tool on the current diff (staged + unstaged) after dispatching review-pr's agents and the Fable audit below in one message, so it runs while they work, as `/page-implement` Stage 4 and `/cleanup-light` Stage 3 do; capture its output as an additional findings source — labeled `security-review` — for Stage 7 adjudication. Skip only when neither the flag nor the actual diff implicates a risk surface (token cost). `/cleanup-light`'s Stage 3c decides on the diff alone (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel); a heavy run keeps the Stage 0 flag as well, because Stage 0 scans the argument and the diff for risk words before the code exists.

The command categorizes findings as **Critical** / **Important** / **Suggestions**. Capture all findings as structured input for Stage 7 — **do NOT auto-absorb, auto-defer, or auto-fix at this stage.** Stage 7 dispatches The Adjudicator on the pr-review findings, which filters noise (vibes, scope violations, generic best-practice appeals from up to five parallel agents) and presents KEEP / DITCH / MODIFY verdicts. Disposition decisions happen at Stage 7, not here.

**Decorrelated Fable audit (always — the highest-value Fable seat).** In the **same turn** as the pr-review dispatch (in parallel — do not serialize it behind the pr-review pass), dispatch a Fable audit of the implemented diff via the Agent tool as a `fable-seat` subagent (`subagent_type: red-line-toolkit:fable-seat`) on the decorrelated family — **`model: fable`**, or `model: opus` if the orchestrator is Fable (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats). This is the decorrelation layer the pr-review agents structurally can't be — a different model auditing Opus-authored code catches the blind spots a same-family review shares. **Pass the plan path** so the audit can compare against intent (a fresh subagent has no other way to know what "intended" means). Prompt:

> *"Decorrelated audit of this implemented diff (`git diff HEAD`, plus staged). Locked plan: `<absolute path to the Stage-1 plan>` — read it for the intended behavior. Minor tweaks and in-area fixes outside the plan, also intended: `<the Stage 5 list, or none>`. You did not write this code — audit it with fresh priors. Focus ONLY on: correctness, data-integrity, logic errors, silent behavior changes vs. what the plan intended, accessibility, and duplication — for every new CSS class, custom property, color-mix recipe or inline style object in the diff, search the project's stylesheets and components for an existing equivalent and flag near-duplicates, naming the existing one. If a defect class in this diff will recur and nothing checks for it, recommend a check (what it would catch) — a recommendation, not a finding. Do NOT review security (the `/security-review` pass covers that when the risk surface is engaged) and do NOT restyle. State the goal and hunt for the defect — don't follow a checklist. Output structured findings, one per line: `file:line — severity — issue — rationale`. Report only what needs action; write `CLEAN` if nothing does."*

Capture its output labeled `fable-decorrelation` as an additional findings source for Stage 7 adjudication, and Stage 4's `minor (deferred)` lines, when there are any, as a source labeled `sdd-deferred`. **Fable finds; it never fixes** — all disposition and every fix happen at Stage 7 on the orchestrator (Opus).

---

## Stage 7 — ADJUDICATE pr-review findings (conditional, max 1 revise cycle)

If **all** sources — `/pr-review-toolkit:review-pr`, the Stage 6 Fable audit, (when it ran) `/security-review`, and Stage 4's deferred minors — surfaced **zero findings**: pipeline complete, advance to Done. A recommended check is filed or dropped under the filing bar, not built in this run.

If findings exist (from any source):

1. **Format the findings** into the Adjudicator's canonical input shape. Include `/security-review` as a critic `id` **only if the Stage 6 security pass actually ran** — which is either trigger (the Stage 0 flag OR the diff intersecting a risk path), not the Stage 0 flag alone:

   ```
   PLAN: <absolute path to locked plan file>
   DELTA: <the Stage 5 minor tweaks and in-area fixes outside the plan, or none>
   CRITICS:
     - id: pr-review-toolkit:review-pr
       findings: |
         <verbatim findings, one per line: file:line — severity — issue — recommendation>
     - id: security-review        # include ONLY if the Stage 6 security pass ran (either trigger)
       findings: |
         <verbatim /security-review findings, same one-per-line shape>
     - id: fable-decorrelation    # always present — Stage 6 Fable audit runs every heavy change
       findings: |
         <verbatim Stage 6 Fable audit findings, same one-per-line shape>
     - id: sdd-deferred           # include ONLY if Stage 4 collected `minor (deferred)` lines
       findings: |
         <verbatim deferred minors, same one-per-line shape>
   ```

   Label each finding line and mark same-site duplicates (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel, the per-critic tally): a review-pr finding takes the label of the agent that raised it (`code-reviewer`, `pr-test-analyzer`, `silent-failure-hunter`, `type-design-analyzer`, `comment-analyzer`), and each other block takes its id (`security-review`, `fable-decorrelation`, `sdd-deferred`).

2. **Dispatch The Adjudicator** (`red-line-toolkit:the-adjudicator`) via the Agent tool with the structured block + plan path. The Adjudicator's security-asymmetric upgrade rule fires automatically — Critical/security findings can only KEEP or MODIFY-up, never DITCH.

3. **Absorb every KEEP and MODIFY verdict** (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): revise the implementation, mark any file the fix created intent-to-add (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel), re-run `npm run build` + lint, then Stage 7.5. List the verdicts, ditched ones included, in the report. A verdict that would amend the locked plan amends it and is listed (tier 1); one that changes what a user sees beyond the plan, or reverses a ruling the owner made, is parked (tier 3). An absorbed verdict the owner reverts after the report passes the filing bar (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs): filed with a named reason and a 2-week pass, or dropped with one line in the commit body.

4. **Max 1 cycle from pr-review.** If absorption produces a revise pass and a hypothetical second pr-review (user-initiated only) surfaces NEW revise-here findings, halt and report (a loop guard): the Stage 1 plan likely needs revision. Don't loop here.

---

## Stage 7.5 — Fable re-audit of the fix (conditional: a revise pass applied)

Runs whenever the Stage 7 absorption actually applied fixes (a revise pass occurred). Skip otherwise — a clean adjudication or an "absorb none" close has nothing to re-audit.

The fix is the one thing no source has independently checked: Opus found-then-fixed against the audit findings, but if an Opus blind spot produced the original defect, its fix can carry a correlated variant (patches the symptom, not the root). This step closes that loop — and stays decorrelated because Opus authored the fix and **Fable** (a different model) checks it.

Dispatch a Fable audit of the **corrected** diff via the Agent tool as a `fable-seat` subagent (`subagent_type: red-line-toolkit:fable-seat`) on the decorrelated family (`model: fable`, or `model: opus` if the orchestrator is Fable). **Pass the verbatim findings that were just fixed** — a fresh subagent cannot "verify each fix" without knowing what the defects were. Prompt:

> *"Re-audit this corrected diff (`git diff HEAD`, plus staged). The findings just fixed were: `<paste the verbatim KEEP/MODIFY findings absorbed at Stage 7>`. Verify each fix resolves the defect at the root and introduced no new correctness / data-integrity / logic / behavior-change problem. Same lens as before; NOT security. Output `file:line — severity — issue — rationale`, or `CLEAN` if the fixes hold."*

**Security re-verification (Fable's re-audit is explicitly NOT security).** Whenever the Stage 6 security pass ran and this revise pass applied fixes — the **same two-trigger rule Stage 6 uses** (Stage 0 flag OR the corrected diff intersecting a risk path, `git diff --name-only HEAD` ∩ the Stage 0 risk paths), not a path-glob check alone — ALSO re-run `/security-review` on the corrected diff here, while the Fable re-audit runs: dispatch the re-audit first, then run the security pass as it works. Fable never takes the security lens (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats), so this is the security re-check; without it a security-adjacent fix applied at Stage 7 would get the *weakest* post-fix verification in the pipeline. Route any new security finding into the same disposition below.

- **CLEAN** → advance to Done (`reaudit_findings` 0).
- **A finding that restates the intended fix or names no defect** → dismiss it. It counts in `reaudit_findings`, not `reaudit_kept`; a finding that is fixed or sends the run back to its plan counts in both.
- **New material finding** → fix it at the root on the orchestrator and list it in the report as fixed after the one re-audit. When the finding is structural — the plan's premise is off — return to Stage 1 instead and replan (tier 1); a second consecutive replan halts and reports. **One re-audit only** — never loop.

---

## Done — three valid termination states

**Commit, then report** (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § The report): on a standard close, stage the run's files and run `/pre-commit-check` in a subagent (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The pre-commit audit; the `--message` it passes carries the `FU-Closed:` footer when the run closes an FU, per `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs). Stage by path, Stage 4's created files included (an intent-to-add path isn't staged until it's added). Fix each WARN or FAIL and re-run it, then commit, and delete Stage 4's refs and skill workspace. The summary below is the report.

1. **Standard close** — code changes ship, plan marked RESOLVED.
2. **Validated-no-action close** — Stage 0.5 verification invalidated the FU body's framing; close with rationale; adjacent observations pass the filing bar (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs — read it before filing: a row needs **both** a named reason **and** a pass of the 2-week filter).
3. **Abandon-and-replan** — Stage 2/3 critique surfaces audit gaps too severe to absorb in revision; flip frontmatter to `status: abandoned` and restart Stage 1 with corrected scope.

When stages complete cleanly, summarize which state applies, plus:
- What was changed (file count, scope) — zero if validated-no-action
- Stack skills loaded at Stage 1 (or none)
- Schema or RLS change: **`test:rls` green on the local stack, prod push pending your approval / before-adoption path used — RLS checked by reading, not by harness, prod DDL pending your approval / none** (`${CLAUDE_PLUGIN_ROOT}/reference/supabase-local.md`)
- Stage 4 implementer models: **haiku N / sonnet N / opus N / fable N** (risk-floor overrides: N)
- Effort per dispatch, next to its model (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort)
- Stage 4 rulings: the skill's "Rulings I made" list, each with what it costs if wrong, or none
- Which referee verdicts shaped the plan (Stage 3 KEEP / DITCH / MODIFY counts on plan critique)
- Stage 6 pr-review raw finding counts: **Critical: N / Important: N / Suggestions: N**
- Stage 6 `/security-review`: **engaged (N findings) / not engaged** (risk-surface gate)
- Stage 2c Fable decorrelation critic on the plan: **N findings** (always runs), and any recommended check with its filing-bar outcome
- Stage 6 Fable decorrelation code audit: **N findings** (always runs)
- Stage 7.5 Fable re-audit of the fix: **clean / N new findings surfaced (K kept) / skipped** (no revise pass)
- Stage 7 Adjudicator verdict counts on those findings (if Stage 7 ran): **KEEP: N / DITCH: N / MODIFY: N** with absorption disposition (revised inline / dismissed / partial — list specific CRITIQUE_IDs if partial)
- Anchor sweep (Stage 5): its line from `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep, or why it didn't run (a project that isn't migrated)
- Leftovers under the filing bar (Stage 5 siblings, Stage 7 declined-but-valid items): **absorbed N (each minor tweak and in-area fix named) / filed N (each with its named reason and why it passes the 2-week filter) / dropped N (named in the commit body)**
- Owner items parked: each row ID with its question, or none
- Commit: the hash

**Effectiveness telemetry — append on every completed run.** Via Bash, append one JSON line per adjudication that ran to `~/.claude/metrics.jsonl` (append-only; create if absent). Skip on validated-no-action / abandon closes (nothing shipped).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"change-heavy\",\"outcome\":\"completed\",\"rigor\":\"<light|heavy>\",\"stage\":\"<3|7>\",\"files_changed\":<n>,\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"net_actionable\":<adjudicator Net-actionable count>,\"missed\":<adjudicator MISSED count, 0-3>,\"security_engaged\":<true|false>,\"leftovers\":{\"fixed\":<n>,\"filed\":<n>,\"dropped\":<n>,\"tweaks\":<n>},\"owner_parked\":<n>,\"swept\":{\"listed\":<n>,\"closed\":<n>},\"critics\":{\"<source label>\":{\"raised\":<n>,\"kept\":<n>,\"unique\":<n>}},\"stage6_s\":<n>}" >> ~/.claude/metrics.jsonl
```

Emit one line for Stage 3 (plan critique) and a second with `"stage":"7"` if Stage 7 ran. `keep/ditch/modify/net_actionable/missed` come from that stage's verdict block; `rigor` is what Stage 0 classified the work as; `security_engaged` is whether the Stage 6 security pass ran (either trigger). `leftovers` (the filing-bar outcomes as the Done summary lists them, minor tweaks and in-area fixes under `fixed` and again in `tweaks`), `owner_parked` (the `owner decision` rows parked, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking) and `swept` (the FUs the Stage 5 anchor sweep listed and closed, never in `leftovers`) go on the run's last row only, so a sum never double-counts. `critics` (the per-critic tally of Stage 7's findings, `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel) and `stage6_s` (Stage 6's wall time in seconds) go on the Stage 7 row only. A `pipeline:"process-change"` row in the metrics file marks where a field begins or changes meaning.

**Adjudicator-effectiveness telemetry — emit alongside each `change-heavy` row above,** one per adjudication that ran, with the field set `/cleanup-light` and `/page-implement` use. Skip only when no adjudication ran; an abandon after Stage 3 still emits it, with `outcome:"abandoned"`.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"caller\":\"change-heavy\",\"outcome\":\"<completed|abandoned>\",\"stage\":\"<3|7>\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"net_actionable\":<adjudicator Net-actionable count>,\"missed\":<adjudicator MISSED count, 0-3>}" >> ~/.claude/metrics.jsonl
```

**Fable-decorrelation telemetry — emit ONE line whenever ANY Fable seat ran,** abandon-and-replan closes included (a plan Critic 2c killed is the seat's best outcome), with `outcome` the actual close. `plan_findings` counts Critic 2c's findings; `code_findings` the Stage 6 audit's, `-1` if the run abandoned before Stage 6; `reaudit` is `skipped` when Stage 7.5 didn't fire; `reaudit_findings` and `reaudit_kept` count the re-audit's findings and those fixed or sending the run back to its plan, both `-1` when it didn't fire; `impl_models` counts Stage 4 implementer dispatches by model (all zeros if the run abandoned before Stage 4) and `impl_risk_floor` the tasks the risk floor raised.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"fable-audit\",\"caller\":\"change-heavy\",\"outcome\":\"<completed|abandoned>\",\"plan_findings\":<n>,\"code_findings\":<n|-1>,\"reaudit\":\"<clean|findings|skipped>\",\"reaudit_findings\":<n|-1>,\"reaudit_kept\":<n|-1>,\"impl_models\":{\"haiku\":<n>,\"sonnet\":<n>,\"opus\":<n>,\"fable\":<n>},\"impl_risk_floor\":<n>,\"security_engaged\":<true|false>}" >> ~/.claude/metrics.jsonl
```

---

## Notes for Claude executing this command

- **Pass `model:` and the plan's effort on every dispatch:** the critics, the Adjudicator, the Fable seats and Stage 4's subagents (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort).
- **Don't skip stages.** Each stage is load-bearing for "high-rigor."
- **Stay in this session.** This pipeline is designed for one continuous session with fresh subagents per stage, not parallel sessions.
- **Gates follow `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`.** No stops for programming calls: the plan lock after Stage 3, critique absorption, Fable checks and re-audit fixes are decided and reported, and the run commits on its own. A design, copy, UX or product item is parked while the rest commits; blockers and the loop guards halt and report. When acting without asking, take the thorough option — the owner's default is low tech debt.
- **Preserve the lock.** Once Stage 3 locks the plan, the `status: approved` frontmatter is canonical. Plan revisions update content but never remove the lock.
- **Tool-layer constraints:** The Adjudicator (`the-adjudicator`) is `Read, Grep` only by design. Do not pass it write tools. The same agent serves at both Stage 3 (plan critique) and Stage 7 (pr-review critique) — its rubric handles both naturally; no behavioral difference between the two invocations.
- **Stage 6 contract:** invoke `/pr-review-toolkit:review-pr` with the aspects `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel picks and `parallel` — never substitute `superpowers:requesting-code-review` (the lighter alternative; it misses 4 specialized lenses worth keeping). Never pass `all` or include `simplify` — Stage 5 already covered simplification via the `/simplify` skill, and passing `all` causes redundant work.
- **Stage 6 security contract:** when RISK SURFACE ENGAGED at Stage 0 (auth/RLS/Stripe/webhook/financial/calculation/security/export) **OR the implemented diff intersects a risk path** (`git diff --name-only HEAD` ∩ the Stage 0 risk paths — the two-trigger rule used by the Stage 6 body, Stage 7, and Stage 7.5's security re-check), Stage 6 ALSO runs `/security-review` on the diff, while the review-pr agents and the Fable audit run, feeding Stage 7 adjudication where the security-asymmetric floor already applies. Brings parity with `/cleanup-light`, which already runs a conditional `/security-review`. Keep it conditional — do NOT run it on non-risk (pure rename/structure) refactors; the token cost isn't warranted. The-adjudicator needs no change: its severity floor is source-agnostic.
- **Stage 7 contract:** the Adjudicator filters pr-review findings BEFORE the user has to act on them — never skip Stage 7 by directly presenting Stage 6's raw output to the user. The whole point of Stage 7 is noise-filtering across up to five parallel pr-review agents. Skipping it regresses the pipeline to "let user manually filter multi-agent output," which the precedent in `/page-implement` already proved subpar.
- **Max 1 revise cycle from Stage 7.** If absorbing verdicts requires a revise and a second pr-review (user-initiated) surfaces new revise-here findings, halt and report — the Stage 1 plan likely needs revision. Do not loop within Stage 7.
