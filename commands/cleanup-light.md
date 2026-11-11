---
description: The standard pipeline for any change outside the project's Heavy-rigor trigger — an FU, a whole group step, or a named task, at any file count. A PLAN block with a Reuses line and a Fable plan critique for 3+ file, new-abstraction or styling work, stack skills loaded for the surfaces touched, then a critic panel the diff picks, with a Fable audit beside it on every run — one prose critic for a diff of only prose and tests; otherwise scope + code-reviewer critics and security, simplifier, silent-failure, type-design and test-coverage critics on their triggers — adjudication, verify, a Fable re-audit of the fixes, the pre-commit audit, then a local commit and a report. Hands the work to /change-heavy when the change meets the project's Heavy-rigor trigger.
argument-hint: '[optional <fu-id> [<fu-id> …] | <group step, e.g. Campaign/2.3> | "<named task>" — else the top open FU by severity]'
allowed-tools: Read, Edit, Write, Bash, Agent, Skill
disallowed-tools: AskUserQuestion
---

# /cleanup-light

You are running the **/cleanup-light pipeline**, the standard pipeline for every change that doesn't meet the project's Heavy-rigor trigger. Critique discipline is preserved: the same critics, an Adjudicator, a Fable review on every run and the pre-commit audit, except in the quick lane (Stage 1), which keeps one Fable pass and the project's hook. What's lighter is the ceremony. There's no plan document, no second critique round and no subagent-per-task implementation. File count doesn't decide the pipeline; the project's CLAUDE.md Heavy-rigor trigger does.

User's invocation argument (an FU, a group step, or a named task): **$ARGUMENTS**

---

## Stage 1 — Pick the work + load context + pre-flight gate

Read `STACK.md` and locate the FOLLOW-UPS section.
- Ledger mode: !`node "${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs" mode 2>&1 || echo "LEDGER: unavailable"`

Migrated projects (`LEDGER: migrated`): file and close FUs per `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs, Stage 7's `/pre-commit-check --message` form included; if the mode line starts with none of `LEDGER: migrated`, `LEDGER: not migrated` or `LEDGER: not a stack project` (for example `LEDGER: unavailable` or `LEDGER ERROR`), halt and report it before touching FU rows.

**Pick the work.** It's one of three input kinds:
- **One or more FUs:** `$ARGUMENTS` names FU identifiers (an `{anchor:}` file, `FU-<n>` IDs, or legacy file:line / cluster tags). Locate each in STACK.md; if one isn't there, halt and say which. Several same-type FUs are how a legacy project, whose rows share no `home:` group, works a batch; Stages 1.5 and 6 run per row.
- **A group step:** `$ARGUMENTS` names a `home:` address such as `Campaign/2.3`. Its members are every open FU homed there. Check every member against live code first and close the ones already done (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs, "When a group step starts"). Then work the remaining members as one change, fixing each class whole.
- **A named task:** `$ARGUMENTS` is a quoted description of work with no FU row, such as a campaign step or a bug the user reported. Stages 1.5 and 6 are skipped for it; there's no row to verify or close.
- **No argument:** work the top open FU or group step by severity (the oldest first on a tie) and name it in one line (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`).

**Load context:**
- Surface each FU's original observation (description, anchor or file:line, when flagged, why flagged), or restate the named task
- Read the affected file(s) at the noted line(s)
- Check git log for changes to those files since the FU was flagged — note if surrounding code has shifted
- State the scope of the fix: the whole class the work names, not just the cited site (R-20)
- **A ruling that spans surfaces gets a check that enforces it:** `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § A ruling gets a check.
- **Load the stack skills for the surfaces the work touches** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Stack skills) before writing the PLAN, or before Stage 2 when Stage 1.7 is skipped.

**Pre-flight gate (`${CLAUDE_PLUGIN_ROOT}/reference/prompting-cheatsheet.md` § Pre-Flight Scope Check):**
1. **Rigor check** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The rigor trigger): test what the work alters, not where it sits. Under a criteria trigger, a label, copy, layout or styling change inside a high-risk area meets none of them and stays here; a project whose CLAUDE.md states its trigger by area or by file count is decided by that. If the work meets the trigger, hand it to `/change-heavy` without asking (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): invoke it via the Skill tool with the work as its argument (the FU it picked, when none was named) and name the item that met the trigger.
2. **Risk surface check:** Does this touch RLS / auth / Stripe / exports / financial calc? If yes, mark security-asymmetric upgrade as active for Stage 4. Whether Stage 3c runs is decided on the written diff (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel).
3. **Existing-primitive check:** Note any primitive families the fix might touch — flag if creating new when reuse fits. This feeds the Stage 1.7 **Reuses** line.

**Quick-lane check**, after the gate: when every entry condition of § The quick lane holds, take it; otherwise go on to Stage 1.5.

### The quick lane

A fast path inside this pipeline, not a pipeline anyone picks. Stage 1 takes it when every one of these holds:
- the change touches at most 2 files, not counting the ledger files an FU close edits;
- it adds no new CSS class, token or shared component, and edits no existing one that's used outside the files it touches, since that edit changes every page that uses it (a search of the project's styles and components for the name, `var(--…)` uses and template-built class families included, finds no use elsewhere). An edit to a class used only inside those files takes the lane on purpose, without Stage 1.7's plan critique;
- it changes nothing beyond the named fix;
- it meets nothing in the Heavy-rigor trigger (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The rigor trigger);
- it touches no risk path (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Risk paths) and no code file that handles auth, RLS, Stripe, exports or money math, so it needs no security pass;
- it involves no design or copy choice that's the owner's;
- an existing test or check already covers the behaviour it changes.

The lane:
1. For an FU, check its claim against live code first (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § FU body verification, scope-proportionate); a wrong premise closes it validated-no-action (Done, state 2).
2. Make the edit, then run the anchor sweep (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep): a listed row that's already done closes, one its Closed outcome makes this run's to fix outgrows the lane, and one it leaves open stays open with its reason.
3. Run the affected tests and seat 3h's Fable audit once over the diff, at the effort the lane states before dispatching (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort), and fix what it finds. No other critic runs and no Adjudicator.
4. Verify as the project's CLAUDE.md requires before any commit (its pre-commit hook and its build check), plus lint on the changed files; where the project has no hook, its typecheck and full test suite before the commit.
5. Commit by explicit pathspec, closing each FU per `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs (its row deleted and `FU-Closed: FU-<n>` on the commit; a legacy project moves the row to its completed log).
6. Report in one line: the fix, the tests run, Fable's verdict and effort, the anchor sweep's line (or why it didn't run, in a project that isn't migrated) and the commit hash, plus the rendered before and after for a visual change. The Done telemetry row carries `"stage":"quick"`, its Adjudicator fields at 0 and `critics` holding only `fable-decorrelation`; the fable-audit row is emitted with `plan_findings` -1 and `reaudit` `n-a`.

If the change outgrows any condition midway (a third file, a new class, an edit to a shared one, anything beyond the named fix), the run carries on as a full `/cleanup-light` run from Stage 1.5, without stopping; one that meets the Heavy-rigor trigger goes to `/change-heavy`.

A quick-lane fix runs in a session that's already open: in the parent session as its own lane run, or folded into a live run working that area, where it joins that run's review and commit. It never gets a session of its own, because a new session's start-up is most of a light run's message floor.

### Stage 1.5 — FU body verification (mandatory for an FU or group step, scope-proportionate)

Skipped for a named task (no FU body). Run `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § FU body verification, scope-proportionate, with its outcomes when the premise is wrong: a validated-no-action close, a hand-off to `/change-heavy`, or the corrected scope continuing into Stage 1.7.

### Stage 1.7 — PLAN + Fable plan critique (when the change touches 3+ files, introduces a new abstraction, or adds or changes a CSS class, a token or a shared component)

Skip this stage for a 1–2 file change that introduces no new abstraction and adds or changes no CSS class, token or shared component; that run sets its dispatch efforts before its first dispatch (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort). Otherwise:

1. **Write a `PLAN` block in chat** (no plan document), in the CLAUDE.md "Default workflow" shape: Problem, Approach, Assumptions, **Reuses**, Scope, Risks, Verify, **Effort**. The **Reuses** line is required. It names the existing class, token or component the change reuses, or reads `New: <name> — nothing existing fits because <reason>`. The **Effort** line sets the effort of every agent this run dispatches, this stage's critique included (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort).
   The block follows `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Claim discipline; a load-bearing claim you haven't checked is marked `UNVERIFIED` in it, and the Fable plan critique treats an unmarked one as a finding.

2. **Dispatch one Fable plan critique** via the Agent tool as a `fable-seat` subagent (`subagent_type: red-line-toolkit:fable-seat`) on the decorrelated family (**`model: fable`**, or `model: opus` if the orchestrator is Fable). Pass the PLAN text; a fresh subagent has no other context. Prompt:
   > *"Decorrelated critique of this change plan, before any code is written. You did not write it — audit it with fresh priors. PLAN: <paste the PLAN block>. Check: (1) missed touchpoints — search the codebase for every place the plan's change must also reach; (2) the Reuses line — search the project's stylesheets and components for an existing class, token, component or recipe that already does what the plan proposes to add, and flag any near-duplicate; (3) sequencing and hidden-coupling errors. If a defect class this plan fixes will recur and nothing checks for it, say so and recommend a check (name what it would catch). If the plan carries out a ruling over every surface or reader, it must name a check that enforces the ruling, produces its census from the code and is built before the sweep; a plan without one is a finding. Do NOT review security and do NOT restyle. Output numbered findings — severity, evidence (path + quoted text), fix — or `CLEAN`."*
3. **Absorb the critique into the PLAN block.** Fable finds; the orchestrator revises. A PLAN revised on this critique gets no second critique round. That's this pipeline's R-12 boundary; a split or superseded *plan document* is `/change-heavy` territory.
4. **Owner items are parked, not asked.** A plan item that is the owner's (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` tier 3) is parked per § Parking, with the intended look (a mockup, a rendered probe or a precise description); the rest of the plan goes ahead. A fork in approach is decided, not asked (tier 1).

   The PLAN, the critique's absorbed findings and any parked item go in the Stage 7 report. A check Fable recommends is filed or dropped under the filing bar, not built in this run (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` tier 1).

---

## Stage 2 — Implement

Make the change against the plan (or the stated scope, when Stage 1.7 was skipped). Anything you notice is a review leftover and passes the filing bar (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs — read it before filing: a row needs **both** a named reason **and** a pass of the 2-week filter), and none goes silently into the diff:
- **The same class as this change** (the same defect or the same fix at another site): fix it in this change and say so in the report. This is the default (R-20).
- **A real issue in the area this change works** (the same feature, flow or files; `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs says what counts): fix it in this change, whatever its class, and list it with the minor tweaks in the report, the commit body and every Stage 3 prompt. A **minor tweak**, a few lines in a file this change already touches, is the smallest case; a larger one joins the PLAN and hands the run to `/change-heavy` when it meets the Heavy-rigor trigger. One that's genuinely the owner's call is parked instead.
- **Otherwise:** file it only when it's in a completely separate area or the owner's call: it passes the 2-week filter and has a named reason it can't be done now (a product decision, or, outside the area, a real risk, an abstraction decision or its own run), written as the row's `why not now`. If not, drop it, with one line in the commit body. `ledger.mjs audit` stops on a row filed in the area unless its reason is `product` or it's an owner decision.

**Anchor sweep.** Once the change is written, run `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep: close each FU it lists that qualifies, and carry the rest into the report.

**Heavy-trigger guard:** if the implementation turns out to meet the project's Heavy-rigor trigger (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The rigor trigger) in a way the plan didn't anticipate, hand the work to `/change-heavy` without asking and name the item that met it (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`). Growing file count alone is not a reason.

---

## Stage 3 — Light critique + the Fable audit (parallel)

Run the trigger snippet in `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel first; its counts pick the panel. Then dispatch every subagent critic that applies, and seat 3h, in parallel — **single message, multiple tool calls** — and run the skill seat (3c) while they work. Pass `model:` matching the orchestrator's current model family, and the plan's effort, on every dispatch but 3h, which runs on the other family. Every prompt that names the work also lists the minor tweaks and in-area fixes this run made (Stage 2), or says none.

**A prose diff (`code=0`)** dispatches Critic 3p in place of 3a, 3b and 3d, plus 3g when `tests` > 0, and seat 3h always. Nothing else runs at this stage.

- **Critic 3p — prose critic (general-purpose):**
  > *"Review this diff of prose (process docs, plans or other markdown) and any tests it changes. The work described: [paste the FU description(s), group step, or named task — plus the PLAN block when Stage 1.7 ran]. Minor tweaks and in-area fixes, also intended: [list, or none]. Files changed: [list from `git diff --name-only HEAD`]. Find: (1) scope — a changed line that traces to neither the work nor a listed tweak; (2) correctness — a statement that contradicts another doc in the repo, a `<file>.md § <section>` pointer or path that doesn't resolve, a copy of a rule this diff changes that still says the old thing elsewhere (search for it), a count or list the change makes wrong, a rule whose meaning shifts beyond the work, and a bug in changed test code, such as a check that can't fail; (3) redundancy — text that repeats another section or restates what the code says. Output: `file:line — severity — issue — recommendation`."*

**Any other diff — always run:**

- **Critic 3a — scope critic (general-purpose):**
  > *"Review this implementation diff for scope discipline. The work described: [paste the FU description(s), group step, or named task — plus the PLAN block when Stage 1.7 ran]. Minor tweaks and in-area fixes, also intended: [list, or none]. Files changed: [list from `git diff --name-only HEAD`]. Question: does every changed line trace to that work? The same fix applied at another site of the same class IS in scope, and so is a listed minor tweak or fix of a real issue in the area the work is in (the same feature, flow or files), whatever its class. Flag changes in a separate area, refactoring beyond the work, or new abstractions it doesn't warrant. Output: `file:line — severity — issue — recommendation`."*

- **Critic 3b — `pr-review-toolkit:code-reviewer`:**
  > *"Review this implementation for bugs, logic errors, conventions, and quality issues. Confidence-based filtering — only report high-priority issues. Files changed: [list]. Output: `file:line — severity — issue — recommendation`."*

**Conditional:**

- **Critic 3c — `/security-review`**, when `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel's security rule holds for the diff. Invoke it via the Skill tool on the current branch's staged + unstaged changes and capture its output as Critic 3c's findings.

- **Critic 3d — simplifier critic** (only if diff > 5 lines):
  > *"Review this implementation for dead code, redundant checks, over-abstraction, defensive checks for impossible conditions, comments that restate code, orphaned imports/exports. Files changed: [list]. Output: `file:line — severity — issue — recommendation`."*

**Conditional specialists (3e–3g)**, three of the lenses `/pr-review-toolkit:review-pr` fires in `/change-heavy` Stage 6, each on its count from the snippet; a count of 0 skips it.

Each specialist prompt carries the same scope line, because a specialist reading a whole file reports its pre-existing debt as defects of this diff: *"Report only defects in lines this diff adds or changes, or that this diff makes reachable. Pre-existing issues in untouched code are out of scope — omit them."*

- **Critic 3e — `pr-review-toolkit:silent-failure-hunter`** (`errors` > 0):
  > *"Review this diff's error handling for silent failures: swallowed or over-broad catches, fallbacks that hide a failure from the user or caller, errors logged but not surfaced, success reported after a failed write. The work: [work description]. Files changed: [list]. [scope line]. Output: `file:line — severity — issue — recommendation`."*
- **Critic 3f — `pr-review-toolkit:type-design-analyzer`** (`types` > 0):
  > *"Review the types this diff adds or changes for invariant expression and encapsulation: states the type permits that the domain forbids, optional fields that are really a discriminated union, stringly-typed values that have a closed set, persisted shapes with no load-boundary check. The work: [work description]. Files changed: [list]. [scope line]. Output: `file:line — severity — issue — recommendation`."*
- **Critic 3g — `pr-review-toolkit:pr-test-analyzer`** (`tests` > 0):
  > *"Review whether this diff's behavior changes are covered by tests that would fail if the behavior broke: missing cases for new branches and boundaries, tests that assert the implementation instead of the contract, expected values derived from the code under test rather than first principles. Name the behavior that would regress unnoticed for each gap. The work: [work description]. Files changed: [list]. [scope line]. Output: `file:line — severity — issue — recommendation`."*

  A missing test for behavior this diff changes is part of this change. When it's absorbed at Stage 4, write the test now. When it's declined, it still isn't a leftover to file: drop it with a line in the commit body.

**Beside either panel, on every run with a diff:**

- **Seat 3h — Fable decorrelation audit (no skip gate)**, a `fable-seat` subagent (`subagent_type: red-line-toolkit:fable-seat`, **`model: fable`**, or `model: opus` if the orchestrator is Fable; `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats, whose model check it gets):
  > *"Decorrelated audit of this diff (`git diff HEAD`, plus staged). The intended change is: `<one-line intended behavior delta, or 'none — this change should preserve all behavior'>`, plus these minor tweaks and in-area fixes: `<the Stage 2 list, or none>`<; the PLAN was: <paste the Stage 1.7 PLAN block, when it ran>>. You did not write this — audit with fresh priors. Find (1) any observable behavior change OTHER than that intended delta: a dropped branch, a silently altered value, a missed dynamic reference (template-built class names included), a coercion shift; and (2) duplication: for every new CSS class, custom property, color-mix recipe or inline style object in the diff, search the project's stylesheets and components for an existing equivalent and flag near-duplicates, naming the existing one. If a defect class in this diff will recur and nothing checks for it, say so and recommend a check (what it would catch) — a recommendation, not a finding. Do NOT review security (Stage 3c covers that) and do NOT restyle. Output `file:line — severity — issue — rationale`, or `CLEAN`."*

Collect all critic outputs into a structured block for the Adjudicator. Label each critic's block with its id: `prose`, `scope`, `code-reviewer`, `security-review`, `simplifier`, `silent-failure-hunter`, `type-design-analyzer`, `pr-test-analyzer`, `fable-decorrelation`. Label every finding line and mark same-site duplicates before dispatching (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel, the per-critic tally), e.g. `[simplifier] src/x.ts:12 — …`, so the Adjudicator's numbered verdicts still carry their source.

---

## Stage 4 — Adjudicate

Dispatch The Adjudicator (`red-line-toolkit:the-adjudicator`) via the Agent tool. Apply security-asymmetric upgrade if risk surface engaged. Pass the structured block led by a `DELTA:` line — the work (the FU description(s), group step or named task), the intended change seat 3h was given, its minor tweaks and in-area fixes and the PLAN block when Stage 1.7 ran — so the scope rows have the declared scope and a finding that restates the fix is ditched rather than reverting it.

**Tally per critic** from the verdicts, for the telemetry `critics` field (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel).

Absorb every KEEP and MODIFY verdict without asking (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`; a file a fix creates is marked intent-to-add, `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel) and list the verdicts in the report, ditched ones included, so the owner can pull one back. A verdict that would change what a user sees beyond the plan, or reverse a ruling the owner made, is tier 3: park that one and absorb the rest. A verdict that diagnoses the Heavy-rigor trigger hands the work to `/change-heavy`; one that finds the plan's premise off sends the run back to Stage 1.7, and a second consecutive replan halts and reports. A recommended check is filed or dropped under the filing bar, not built in this run. A KEEP that would undo the intended change or a listed minor tweak or in-area fix is ditched, with the reason in the report.

---

## Stage 5 — Revise + verify

Apply selected verdicts to the implementation. Run `npm run build`:
- If pass: continue to Stage 6.
- If fail: invoke `superpowers:systematic-debugging` skill to find root cause, fix, re-verify. Loop within Stage 5 until clean. When three fixes have failed and the skill says to discuss with your human partner before another, halt and report it as a true blocker (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Halts).

Verify lint count preserved or improved (per CLAUDE.md).

If the diff touches `supabase/` schema or RLS, follow `${CLAUDE_PLUGIN_ROOT}/reference/supabase-local.md`: in an adopted project, apply it on the local stack and pass `npm run test:rls`; otherwise use its before-adoption path and say so in the report. `/change-heavy` Stage 1 carries the same pointer.

---

## Stage 5.5 — Fable re-audit of the fixes (only if Stage 4 absorbed a fix other than a `[security-review]` one, or Stage 5's verify changed the diff)

A prose diff whose post-review fixes were small skips this stage (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel); count the lines your fixes changed and give the count in the report.

Dispatch **one** Fable re-audit of the corrected diff as a `fable-seat` subagent (`subagent_type: red-line-toolkit:fable-seat`), on the family seat 3h ran on. **Pass the findings you fixed** so the re-audit is anchored (a fresh subagent can't confirm a fix holds without knowing the defect):

> *"Re-audit this corrected diff. The findings just fixed were: `<paste the verbatim KEEP/MODIFY findings absorbed at Stage 4, less the [security-review] ones, and any Stage 5 build fix>`. Confirm each fix holds at the root and introduced no new observable change. Same lens as the audit; NOT security. Output findings or `CLEAN`."*

- **CLEAN** → proceed to Stage 6 (`reaudit_findings` 0).
- **A finding that restates the intended fix or names no defect** → dismiss it. It counts in `reaudit_findings`, not `reaudit_kept`; a finding that is fixed or sends the run back to its plan counts in both.
- **New material finding** → fix it at the root on the orchestrator and list it in the report as fixed after the one re-audit. When it shows the premise or plan is wrong, go back to Stage 1.7 instead; a second consecutive replan halts and reports. One re-audit only — never loop.

---

## Stage 6 — Mark FU(s) complete in STACK.md

**Named task:** skip the row edit (there's no FU). Still record any leftover filed under the filing bar, then go to Stage 7. **Group step:** close each member FU this run finished; a member left open needs its named reason (the filing bar's successor rule).

Close each finished FU without asking (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): delete its row per `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs (a legacy project moves it to its completed log with the date, its `home`/anchor and a one-line resolution note). An FU left open needs its named reason. All of it goes in the report.

---

## Stage 7 — Pre-commit audit + commit

**Skip** if termination state is "Validated-no-action close" (no code changes to audit; Stage 1.5 already closed the FU without a diff).

Otherwise, audit the staged diff, then commit:

1. **Stage the scoped files explicitly.** Run `git diff --name-only HEAD` to enumerate touched files (should be the files the PLAN or stated scope named, plus STACK.md). Stage with `git add <file> [<file>...]` — **do NOT use `git add -A`** (CLAUDE.md staging rule: avoid accidentally including `.env`, credentials, large binaries).
2. **Run `/pre-commit-check` in a subagent** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The pre-commit audit), with the task line and drafted message the subagent can't infer.
3. **Fix what it finds.** It runs three checks (commit-body truth, scope discipline, follow-up discipline) and only reports. Fix each WARN or FAIL and run it again (tier 1); a finding that is the owner's call (tier 3) is parked.
4. **Commit** what's staged, locally and never pushed; an in-area fix of another kind than the work (a refactor beside a feature, a copy change) goes in a commit of its own. The Done summary is the report (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § The report).

---

## Done — four valid termination states

1. **Standard close** — code changes ship, FU(s) marked RESOLVED (for a named task, only those the anchor sweep closed).
2. **Validated-no-action close** — Stage 1.5 verification invalidated the FU body's framing; close with rationale; adjacent observations pass the filing bar (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs — read it before filing: a row needs **both** a named reason **and** a pass of the 2-week filter).
3. **Abandon-and-replan** — Stage 3/5 surfaces gaps too severe to absorb in revision; re-scope and return to Stage 1.7 for a new PLAN. A second consecutive replan halts and reports.
4. **Quick-lane close** — the lane's one-line report (Stage 1, § The quick lane) replaces the summary below.

Summarize which state applies, plus:
- Work cleared (FU home/anchor + description, group step members closed, or the named task) — or rationale for non-action close
- Stage 1.7: PLAN + Fable plan critique **ran (N findings absorbed) / skipped** (1–2 files, no new abstraction, no class/token/component change), and any recommended check with its filing-bar outcome
- Anchor sweep: its line from `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep, or why it didn't run (a project that isn't migrated)
- Leftovers under the filing bar: **fixed now N (each minor tweak and in-area fix named) / filed N (each with its named reason and why it passes the 2-week filter) / dropped N (named in the commit body)**
- Files changed (count + list) — zero if validated-no-action
- Stage 4 Adjudicator verdict counts: **KEEP: N / DITCH: N / MODIFY: N** with disposition (absorbed into revision / dismissed) and any MISSED items the Adjudicator flagged
- Critic yield: **raised / kept / unique** per critic that ran, the panel (prose or full), the specialists (3e–3g) that fired, and the file that engaged 3c when no risk path did
- Stack skills loaded at Stage 1 (or none)
- Effort per dispatch, next to its model (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort)
- Build / lint status (npm run build pass/fail; lint count delta vs baseline)
- Seat 3h Fable audit: **N findings (M duplication)**, any recommended check with its filing-bar outcome — and the Stage 5.5 re-audit: **clean / N new findings (K kept) / n-a / prose-skip (a prose diff, N lines fixed)**
- STACK.md update status (FU(s) closed / left open with a named reason / revised — and any FU filed under the filing bar)
- Stage 7 pre-commit audit verdict per check: **Truth: ✅/⚠️/❌ / Scope: ✅/⚠️/❌ / Follow-ups: ✅/⚠️/❌** — or "skipped — validated-no-action"
- Owner items parked: each row ID with its question, or none
- Commit: the Stage 7 hash

**Effectiveness telemetry — append on every completed run.** Via Bash, append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). Skip on validated-no-action / abandon closes (nothing shipped).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"cleanup-light\",\"outcome\":\"completed\",\"rigor\":\"light\",\"stage\":\"4\",\"files_changed\":<n>,\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"net_actionable\":<adjudicator Net-actionable count>,\"missed\":<adjudicator MISSED count, 0-3>,\"security_engaged\":<true|false>,\"input\":\"<fu|group|task>\",\"fus_closed\":<n>,\"leftovers\":{\"fixed\":<n>,\"filed\":<n>,\"dropped\":<n>,\"tweaks\":<n>},\"owner_parked\":<n>,\"swept\":{\"listed\":<n>,\"closed\":<n>},\"critics\":{\"<critic-id>\":{\"raised\":<n>,\"kept\":<n>,\"unique\":<n>}}}" >> ~/.claude/metrics.jsonl
```

`keep/ditch/modify/net_actionable/missed` come from the Stage 4 verdict block; `security_engaged` is whether Stage 3c ran; `input` is the Stage 1 input kind; `fus_closed` counts the FU rows this run closed (for a named task, only the anchor sweep's); `leftovers` counts the filing-bar outcomes as the Done summary lists them, minor tweaks and in-area fixes under `fixed` and again in `tweaks`; `owner_parked` counts the `owner decision` rows parked (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking); `swept` counts the FUs the anchor sweep listed and closed (also in `fus_closed`, never in `leftovers`); `critics` holds one entry per Stage 3 block that ran, `fable-decorrelation` included, with the per-critic tally (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel). A `pipeline:"process-change"` row in the metrics file marks where a field begins or changes meaning.

**Adjudicator telemetry — append the same run** (only when Stage 4 adjudicated), with the field set `/change-heavy` and `/page-implement` use, which the cross-caller readout aggregates:

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"outcome\":\"<completed|abandoned>\",\"caller\":\"cleanup-light\",\"stage\":\"4\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"net_actionable\":<adjudicator Net-actionable count>,\"missed\":<adjudicator MISSED count, 0-3>}" >> ~/.claude/metrics.jsonl
```

`stage` is always `4`. An abandon close after Stage 4 still emits it, with `outcome:"abandoned"`.

**Fable-decorrelation telemetry — emit whenever seat 3h ran,** except on a validated-no-action or abandon close. `plan_findings` counts the Stage 1.7 critique's findings, `-1` when it was skipped; `audit_findings` counts seat 3h's raw findings, ditched intended-delta ones included; `reaudit` is `clean` or `findings` when Stage 5.5 ran, `n-a` when it didn't run, and `prose-skip` when a prose diff's small fixes skipped it; `reaudit_findings` and `reaudit_kept` count the re-audit's findings and those fixed or sending the run back to its plan, both `-1` when it didn't run; `check_recommended` is whether a seat recommended a check and `check_built` whether this run built one (only a run that picks up a filed check does).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"fable-audit\",\"outcome\":\"completed\",\"caller\":\"cleanup-light\",\"plan_findings\":<n|-1>,\"audit_findings\":<n>,\"reaudit\":\"<clean|findings|n-a|prose-skip>\",\"reaudit_findings\":<n|-1>,\"reaudit_kept\":<n|-1>,\"check_recommended\":<true|false>,\"check_built\":<true|false>,\"security_engaged\":<true|false>}" >> ~/.claude/metrics.jsonl
```

---

## Notes for Claude executing this command

- **Scope is the class, not the cited site.** Fixing the same defect at every site is in scope (R-20), and so is a listed fix of a real issue in the area the change works, a minor tweak included; work in a separate area is not. The scope critic at Stage 3 polices the rest, and the filing bar keeps leftovers from becoming successor FUs by default.
- **Gates follow `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`.** The run never stops for a programming call: it decides, commits and reports. A design, copy, UX or product item is parked while the rest commits; broken tools, true blockers and the loop guards halt and report. When acting without asking, take the thorough option — the owner's default is low tech debt.
- **Escalation is automatic.** A change that meets the project's Heavy-rigor trigger goes to `/change-heavy` without asking. File count is never the trigger.
- **The diff picks the panel** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The review panel), on the snippet's counts and the diff's paths, not on judgment.
- **Pass `model:` and the plan's effort on every critic dispatch** so it runs at orchestrator level; the Fable seats run on the other family (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats).
- **The Adjudicator is `Read, Grep` only.** Don't pass it write tools.
- **STACK.md edits are surgical.** Use Edit tool to move the FU entry, not Write (don't rewrite the whole file).
- **Stage 7 is not optional except for validated-no-action close and the quick lane, whose verify and commit steps replace it.** The pre-commit audit is the pipeline's truth-and-scope gate. Skipping it (e.g., "the diff looks fine, I'll let the user commit") regresses the pipeline to the pre-v2 manual-handoff state.
- **Stage 7 commits on its own, locally, and never pushes.** Stage by explicit path, never `git add -A`.
