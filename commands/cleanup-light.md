---
description: The standard pipeline for any change outside the project's Heavy-rigor trigger — an FU, a whole home group of FUs, or a named task, at any file count. A PLAN block with a Reuses line and a Fable plan critique for 3+ file, new-abstraction or styling work, stack skills loaded for the surfaces touched, then scope + code-reviewer critics (always) and security, simplifier, silent-failure, type-design and test-coverage critics (conditional), adjudication with security-asymmetric upgrade, verify, a Fable review on every run, and the pre-commit audit. Surfaces escalation to /change-heavy when the change meets the project's Heavy-rigor trigger.
argument-hint: [optional <fu-id> [<fu-id> …] | <home: group, e.g. Campaign/2.3> | "<named task>" — else interactive picker]
allowed-tools: Read, Edit, Write, Bash, Task, AskUserQuestion, Skill, SlashCommand
---

# /cleanup-light

You are running the **/cleanup-light pipeline**, the standard pipeline for every change that doesn't meet the project's Heavy-rigor trigger. Critique discipline is preserved: the same critics, an Adjudicator, a Fable review on every run and the pre-commit audit. What's lighter is the ceremony. There's no plan document, no second critique round and no subagent-per-task implementation. File count doesn't decide the pipeline; the project's CLAUDE.md Heavy-rigor trigger does.

User's invocation argument (an FU, a home group, or a named task): **$ARGUMENTS**

---

## Stage 1 — Pick the work + load context + pre-flight gate

Read `STACK.md` and locate the FOLLOW-UPS section.

**Pick the work.** It's one of three input kinds:
- **One or more FUs:** `$ARGUMENTS` names FU identifiers (an `{anchor:}` file, `FU-<n>` IDs, or legacy file:line / cluster tags). Locate each in STACK.md; if one isn't there, surface to the user and exit. Several same-type FUs are worked as one batch; Stages 1.5 and 6 run per row.
- **A home group:** `$ARGUMENTS` names a `home:` address such as `Campaign/2.3`. Its members are every open FU homed there. Check every member against live code first and close the ones already done. Then work the remaining members as one change, fixing each class whole.
- **A named task:** `$ARGUMENTS` is a quoted description of work with no FU row, such as a campaign step or a bug the user reported. Stages 1.5 and 6 are skipped for it; there's no row to verify or close.
- **No argument:** enumerate the open FUs with description, severity, `home:` address and anchor file (legacy rows: file:line + cluster tag). Use `AskUserQuestion`:
  - **Question:** *"Which FU or home group to work?"*
  - **Options:** dynamically generated from the open FUs and home groups (top 4 by severity, or alphabetical if all same severity)

**Load context:**
- Surface each FU's original observation (description, anchor or file:line, when flagged, why flagged), or restate the named task
- Read the affected file(s) at the noted line(s)
- Check git log for changes to those files since the FU was flagged — note if surrounding code has shifted
- State the scope of the fix: the whole class the work names, not just the cited site
- **Load the stack skills for the surfaces the work touches**, via the Skill tool, before writing the PLAN (or before Stage 2 when Stage 1.7 is skipped), so API shapes come from current guidance rather than training memory: your framework's best-practice skill for routes, pages, server code and components, your database's for SQL, migrations and access policies, your payment provider's for payments (on a Next.js + Supabase + Stripe stack: `vercel:nextjs`, `vercel:react-best-practices`, `supabase:supabase-postgres-best-practices`, `stripe:stripe-best-practices`). Load none for CSS or token-only, copy, docs or test-only work. A skill that isn't installed is skipped, not a stop. `/change-heavy` Stage 1 carries the same map; change both together.

**Pre-flight gate (cheatsheet §5):**
1. **Rigor check:** read the project's CLAUDE.md **Heavy rigor** trigger — its list of high-risk areas, plus a new data model or API shape. A project whose CLAUDE.md still states a file-count trigger uses that; a project whose CLAUDE.md states no trigger at all counts it as not met, but if the work touches money, auth, data or payments, ask. If the work meets the trigger, **surface to user:** *"This meets the project's Heavy-rigor trigger (<which item>). Escalate to /change-heavy, or continue here?"* File count alone never escalates.
2. **Risk surface check:** Does this touch RLS / auth / Stripe / exports / financial calc? If yes, mark security-asymmetric upgrade as active for Stage 4 and prepare to invoke `/security-review` in Stage 3.
3. **Existing-primitive check:** Note any primitive families the fix might touch — flag if creating new when reuse fits. This feeds the Stage 1.7 **Reuses** line.

### Stage 1.5 — FU body verification (mandatory for an FU or home group, scope-proportionate)

Skipped for a named task (no FU body). FU bodies age out. Before proceeding, empirically verify **the explicit claims in each FU body**, then sweep for the same class at other sites so the fix covers it whole.

- **Caller counts cited:** `grep -rn` the cited selector/identifier. Compare to FU's stated count.
- **File paths cited:** Confirm the cited file actually contains the construct described — if the row carries an `{anchor:}`, its pattern must still match (`npm run verify:fus` checks the whole backlog).
- **"Single-user" / "N-only" claims:** Exhaustive grep — including alternate construction patterns (template literals, `classnames()`, dynamic class composition).
- **"May cascade" / scope-hedging framings:** Read every callsite of the **specific** selector/identifier cited — not every conceivably related file.

If any claim is wrong, output a **"Stage 1.5 audit results"** block visibly to the user with corrected facts BEFORE writing tasks. Do not silently absorb.

If verification surfaces gaps so severe that the FU's premise is wrong (e.g., "single-user" turns out to be 20 callers), STOP and use `AskUserQuestion`:
- **Question:** *"Stage 1.5 verification invalidated the FU body's framing. How to proceed?"*
- **Options:**
  - `Validated-no-action close` → close FU with rationale; adjacent observations pass the filing bar (CLAUDE.md "Scope discipline": a row needs **both** a named reason **and** a pass of the 2-week filter)
  - `Escalate to /change-heavy` → only if the corrected scope meets the project's Heavy-rigor trigger
  - `Continue with corrected scope` → proceed to Stage 1.7 with revised understanding

Anchored in `memory/feedback_fu_body_verification.md`.

### Stage 1.7 — PLAN + Fable plan critique + owner pause (when the change touches 3+ files, introduces a new abstraction, or adds or changes a CSS class, a token or a shared component)

Skip this stage for a 1–2 file change that introduces no new abstraction and adds or changes no CSS class, token or shared component. Otherwise:

1. **Write a `PLAN` block in chat** (no plan document), in the CLAUDE.md "Default workflow" shape: Problem, Approach, Assumptions, **Reuses**, Scope, Risks, Verify. The **Reuses** line is required. It names the existing class, token or component the change reuses, or reads `New: <name> — nothing existing fits because <reason>`.
**Claim discipline in the PLAN block.** Never write a code shape you have not opened this turn —
paste it from the file rather than typing it from memory of a sibling. A count comes from the
command that will verify it, not a similar grep over an adjacent set. Probe an unfamiliar seam
rather than deriving its behaviour by reading. Any load-bearing claim you have not checked is
marked `UNVERIFIED` in the block; the Fable plan critique treats an unmarked one as a finding. (No
claims-ledger section here — that is `/change-heavy`'s, for plans with a document to hold it.)

2. **Dispatch one Fable plan critique** via the Task tool on the decorrelated family (**`model: fable`**, or `model: opus` if the orchestrator is Fable). Pass the PLAN text; a fresh subagent has no other context. Prompt:
   > *"Decorrelated critique of this change plan, before any code is written. You did not write it — audit it with fresh priors. PLAN: <paste the PLAN block>. Check: (1) missed touchpoints — search the codebase for every place the plan's change must also reach; (2) the Reuses line — search the project's stylesheets and components for an existing class, token, component or recipe that already does what the plan proposes to add, and flag any near-duplicate; (3) sequencing and hidden-coupling errors. If a defect class this plan fixes will recur and nothing checks for it, say so and recommend a check (name what it would catch). Do NOT review security and do NOT restyle. Output numbered findings — severity, evidence (path + quoted text), fix — or `CLEAN`."*
3. **Absorb the critique into the PLAN block.** Fable finds; the orchestrator revises. A PLAN revised on this critique gets no second critique round; a split or superseded *plan document* is `/change-heavy` territory.
4. **Owner pause.** Use `AskUserQuestion`:
   - **Question:** *"PLAN ready (Fable: N findings absorbed<, recommends a check: …>). Proceed?"*
   - **Options:** `Proceed` · `Proceed, and build the recommended check` (only when Fable recommended one) · `Revise the plan` · `Escalate to /change-heavy`

   This is where a Fable-recommended check is approved or declined (CLAUDE.md checking-script rule). Any CLAUDE.md rule to pause and confirm before a multi-file change is satisfied here.

---

## Stage 2 — Implement

Make the change against the plan (or the stated scope, when Stage 1.7 was skipped). **No silent "while I'm here" edits.** Anything you notice is a review leftover and passes the filing bar (CLAUDE.md "Scope discipline": a row needs **both** a named reason **and** a pass of the 2-week filter):
- **The same class as this change** (the same defect or the same fix at another site): fix it in this change and say so in the REVIEW. This is the default — scope is the class, not the cited site.
- **Otherwise:** file it only when it passes the 2-week filter and has a named reason it can't be done now (a product decision, a real risk, an abstraction decision). If not, drop it, with one line in the commit body.

**Heavy-trigger guard:** if the implementation turns out to meet the project's Heavy-rigor trigger (a risk area or a new data model / API shape the plan didn't anticipate), STOP and surface:

> *"The change now meets the Heavy-rigor trigger (<which item>). Continue here, or escalate to /change-heavy?"*

User decides — do not auto-escalate. Growing file count alone is not a stop.

---

## Stage 3 — Light critique (parallel)

Run the specialist trigger snippet (under "Conditional specialists" below) first. Then dispatch every Task critic that applies in parallel — **single message, multiple tool calls** — and run the skill seat (3c) while they work. Pass `model:` matching the orchestrator's current model family on all dispatches.

**Always run:**

- **Critic 3a — scope critic (general-purpose):**
  > *"Review this implementation diff for scope discipline. The work described: [paste the FU description(s), home group, or named task — plus the PLAN block when Stage 1.7 ran]. Files changed: [list from `git diff --name-only HEAD`]. Question: does every changed line trace to that work? The same fix applied at another site of the same class IS in scope. Flag changes that are a different class of work, refactoring beyond the work, or new abstractions it doesn't warrant. Output: `file:line — severity — issue — recommendation`."*

- **Critic 3b — `pr-review-toolkit:code-reviewer`:**
  > *"Review this implementation for bugs, logic errors, conventions, and quality issues. Confidence-based filtering — only report high-priority issues. Files changed: [list]. Output: `file:line — severity — issue — recommendation`."*

**Conditional (run only if engaged at Stage 1 pre-flight):**

- **Critic 3c — `/security-review`** (if risk surface engaged at Stage 1 *or* the Stage 2 diff touches a risk path):
  > Stage 1 predicts the risk surface before implementation, so re-check against the actual change — `git diff --name-only HEAD` intersected with the risk paths: `src/app/api/**`, `**/auth/**`, `**/stripe/**`, `**/billing/**`, your migrations and access-policy (RLS) files, auth middleware, money-math modules, export routes, and any risk paths your CLAUDE.md names (the same list as `/change-heavy` Stage 0; change both together). If the Stage 1 flag is set OR that intersection is non-empty, invoke `/security-review` via the SlashCommand tool on the current branch's staged + unstaged changes. Capture output as Critic 3c's findings.

- **Critic 3d — simplifier critic** (only if diff > 5 lines):
  > *"Review this implementation for dead code, redundant checks, over-abstraction, defensive checks for impossible conditions, comments that restate code, orphaned imports/exports. Files changed: [list]. Output: `file:line — severity — issue — recommendation`."*

**Conditional specialists (3e–3g) — three of the five lenses `/pr-review-toolkit:review-pr` fires in `/change-heavy` Stage 6 (errors, types, tests), triggered on the diff's content.** Run this from the repo root after Stage 2; a count of 0 skips that critic. Over-triggering costs one critic run; a miss ships the defect, so the matchers are deliberately loose (code files only, so prose never trips them). The `tests` matcher counts `src/lib/` as the pure-logic layer; point it at yours.

```bash
P="'*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs'"
CHANGED=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } | sort -u)
CODE=$( { eval git diff -U0 HEAD -- $P | grep -E '^[+-]' | grep -vE '^(\+\+\+|---) '; eval git ls-files -z --others --exclude-standard -- $P | xargs -0 cat 2>/dev/null; } )
echo "errors=$(printf '%s\n' "$CODE" | grep -cE '\b(try|catch|finally|throw)\b|\.catch\(')"
echo "types=$( { printf '%s\n' "$CODE" | grep -E '^[+-]?[[:space:]]*(export[[:space:]]+)?(declare[[:space:]]+)?(type|interface|enum)[[:space:]]+[A-Za-z_]'; printf '%s\n' "$CHANGED" | grep -E '(^|/)types/'; } | grep -c .)"
echo "tests=$(printf '%s\n' "$CHANGED" | grep -cE '\.(test|spec)\.[cm]?[jt]sx?$|^src/lib/')"
```

Each specialist prompt carries the same scope line, because a specialist reading a whole file reports its pre-existing debt, and that debt would come back as filed leftovers: *"Report only defects in lines this diff adds or changes, or that this diff makes reachable. Pre-existing issues in untouched code are out of scope — omit them."*

- **Critic 3e — `pr-review-toolkit:silent-failure-hunter`** (`errors` > 0):
  > *"Review this diff's error handling for silent failures: swallowed or over-broad catches, fallbacks that hide a failure from the user or caller, errors logged but not surfaced, success reported after a failed write. The work: [work description]. Files changed: [list]. [scope line]. Output: `file:line — severity — issue — recommendation`."*
- **Critic 3f — `pr-review-toolkit:type-design-analyzer`** (`types` > 0):
  > *"Review the types this diff adds or changes for invariant expression and encapsulation: states the type permits that the domain forbids, optional fields that are really a discriminated union, stringly-typed values that have a closed set, persisted shapes with no load-boundary check. The work: [work description]. Files changed: [list]. [scope line]. Output: `file:line — severity — issue — recommendation`."*
- **Critic 3g — `pr-review-toolkit:pr-test-analyzer`** (`tests` > 0 — a test file changed, or the project's pure-logic layer did):
  > *"Review whether this diff's behavior changes are covered by tests that would fail if the behavior broke: missing cases for new branches and boundaries, tests that assert the implementation instead of the contract, expected values derived from the code under test rather than first principles. Name the behavior that would regress unnoticed for each gap. The work: [work description]. Files changed: [list]. [scope line]. Output: `file:line — severity — issue — recommendation`."*

  A missing test for behavior this diff changes is part of this change. When it's absorbed at Stage 4, write the test now. When it's declined, it still isn't a leftover to file: drop it with a line in the commit body.

Collect all critic outputs into a structured block for the Adjudicator. Label each critic's block with its id: `scope`, `code-reviewer`, `security-review`, `simplifier`, `silent-failure-hunter`, `type-design-analyzer`, `pr-test-analyzer`. Prefix every finding line with its label, e.g. `[simplifier] src/x.ts:12 — …`, so the Adjudicator's numbered verdicts still carry their source. **Before dispatching, mark same-site duplicates.** When two critics raise the same defect at the same site, keep the first line and append `(also: <label>, …)` to it, then delete the others, so the Adjudicator judges each defect once.

---

## Stage 4 — Adjudicate

Dispatch The Adjudicator (`the-adjudicator`) via Task tool. Apply security-asymmetric upgrade if risk surface engaged. Pass the structured block + the FU description as context.

Present verdicts verbatim. Use `AskUserQuestion`:

- **Question:** *"The Adjudicator marked [N] critiques ([K] KEEP, [D] DITCH, [M] MODIFY). Which to absorb?"*
- **Options:**
  - `Absorb all KEEP + MODIFY` → revise the implementation
  - `Absorb none — proceed to verify` → no revision
  - `Let me list specific CRITIQUE_IDs` → free-text follow-up

---

## Stage 5 — Revise + verify

Apply selected verdicts to the implementation. Run `npm run build`:
- If pass: continue to Stage 5.5.
- If fail: invoke `superpowers:systematic-debugging` skill to find root cause, fix, re-verify. Loop within Stage 5 until clean.

Verify lint count preserved or improved (per CLAUDE.md).

---

## Stage 5.5 — Fable decorrelation audit (every run)

**Runs on every run that produced a diff — code, CSS, tokens, class renames and comments alike.** No skip gate. The orchestrator that wrote the diff never decides "this obviously changed nothing"; that's the blind spot the audit exists to catch, and CSS and token edits are where duplicated styling slips in. Only a validated-no-action or abandon close (no diff) skips it.

**Audit for _unintended_ change — pass the intended behavior delta in.** Many changes are behavior-changing by design (silent-failure, security, perf, bug). A naive "zero-behavior-change" lens would flag the intended fix as a defect and — with no disposition step — get it reverted. So tell Fable what the intended change is and have it hunt for everything *else*. Dispatch a **single** scoped Fable pass over the diff via the Task tool on the decorrelated family (**`model: fable`**, or `model: opus` if the orchestrator is Fable — see the Fable-seat notes) — the decorrelated eye the orchestrator-model critics (Stage 3) structurally can't be. Prompt:

> *"Decorrelated audit of this diff (`git diff HEAD`, plus staged). The intended change is: `<one-line intended behavior delta, or 'none — this change should preserve all behavior'>`<; the PLAN was: <paste the Stage 1.7 PLAN block, when it ran>>. You did not write this — audit with fresh priors. Find (1) any observable behavior change OTHER than that intended delta: a dropped branch, a silently altered value, a missed dynamic reference (template-built class names included), a coercion shift; and (2) duplication: for every new CSS class, custom property, color-mix recipe or inline style object in the diff, search the project's stylesheets and components for an existing equivalent and flag near-duplicates, naming the existing one. If a defect class in this diff will recur and nothing checks for it, say so and recommend a check (what it would catch) — a recommendation, not a finding. Do NOT review security (Stage 3c covers that) and do NOT restyle. Output `file:line — severity — issue — rationale`, or `CLEAN`."*

**Disposition (findings are NOT auto-fixed):**
- **CLEAN** → proceed to Stage 6.
- **Finding is the intended delta** (the fix itself, done correctly) → DITCH silently; it is not a defect.
- **Finding is an unintended change or a duplicate** → fix on the orchestrator, re-run `npm run build`, then **Stage 5.6**. **Fable finds; it never fixes.**
- **A recommended check** → surface it to the user with `AskUserQuestion` (*"Fable recommends a check for <class>: <what it catches>. Build it?"* — `Build it` · `Decline`). A check is built only on a yes (CLAUDE.md checking-script rule).
- **Ambiguous, or a Heavy-trigger / architectural diagnosis** → surface to the user; do NOT auto-revert and do NOT auto-escalate.

Security note: for cleanups that engaged the security-asymmetric upgrade at Stage 1, the security lens stays with Stage 3c `/security-review` — Fable audits behavior/correctness only, and any security-adjacent fix stays on the orchestrator.

### Stage 5.6 — Fable re-audit of the fix (only if Stage 5.5 found + fixed an unintended change)

If Stage 5.5 surfaced an unintended change that the orchestrator just fixed, dispatch **one** Fable re-audit of the corrected diff via the Task tool on the decorrelated family (`model: fable`, or `model: opus` if the orchestrator is Fable). **Pass the prior findings** so the re-audit is anchored (a fresh subagent can't "confirm each fix holds" without knowing what the defects were):

> *"Re-audit this corrected diff. The unintended-change and duplication findings just fixed were: `<paste the verbatim Stage 5.5 findings that were fixed>`. Confirm each fix holds at the root and introduced no new observable change. Output findings or `CLEAN`."*

- **CLEAN** → proceed to Stage 6.
- **A finding that restates the intended fix or names no defect** → dismiss it.
- **New material finding** → surface to the user; **do NOT auto-loop.** A surviving finding means the fix is correlated/incomplete — one re-audit only.

---

## Stage 6 — Mark FU(s) complete in STACK.md

**Named task:** skip the row edit (there's no FU). Still record any leftover filed under the filing bar, then go to Stage 7. **Home group:** close each member FU this run finished; a member left open needs its named reason (the filing bar's successor rule).

Use `AskUserQuestion`:

- **Question:** *"FU cleared and verified. Mark complete in STACK.md?"*
- **Options:**
  - `Mark complete — move to completed log` → edit STACK.md to move the FU from open to completed section with date + brief commit-ready note
  - `Leave open — don't update STACK.md yet` → exit without modifying STACK.md
  - `Revise the FU entry instead` → take user direction (e.g., split the FU into smaller items, update description)

If marking complete, edit STACK.md to:
- Remove the FU from the open FOLLOW-UPS section
- Add an entry to the completed log (or wherever your convention places cleared FUs) with: date, the FU's `home`/anchor (legacy: file:line), brief one-line resolution note

---

## Stage 7 — Pre-commit audit

**Skip** if termination state is "Validated-no-action close" (no code changes to audit; Stage 1.5 already closed the FU without a diff).

Otherwise, audit the staged diff before handing back to the user:

1. **Stage the scoped files explicitly.** Run `git diff --name-only HEAD` to enumerate touched files (should be the files the PLAN or stated scope named, plus STACK.md). Stage with `git add <file> [<file>...]` — **do NOT use `git add -A`** (CLAUDE.md staging rule: avoid accidentally including `.env`, credentials, large binaries).
2. **Invoke `/pre-commit-check`** via the SlashCommand tool with no arguments. Staged mode auto-infers the task from this conversation + STACK.md context.
3. **Present its output verbatim.** `/pre-commit-check` runs three checks (commit-body truth, scope discipline, follow-up discipline) and has its own `AskUserQuestion` pause when findings are detected — let it run; do not re-render or summarize.

User commits (or revises) based on `/pre-commit-check`'s verdict. The pipeline does NOT commit on the user's behalf — final commit authority stays with the user per CLAUDE.md *"Only create commits when requested."*

---

## Done — three valid termination states

1. **Standard close** — code changes ship, FU(s) marked RESOLVED (none for a named task).
2. **Validated-no-action close** — Stage 1.5 verification invalidated the FU body's framing; close with rationale; adjacent observations pass the filing bar (a row needs **both** a named reason **and** a pass of the 2-week filter).
3. **Abandon-and-replan** — Stage 3/5 surfaces gaps too severe to absorb in revision; surface to user for re-scoping.

Summarize which state applies, plus:
- Work cleared (FU home/anchor + description, home-group members closed, or the named task) — or rationale for non-action close
- Stage 1.7: PLAN + Fable plan critique **ran (N findings absorbed) / skipped** (1–2 files, no new abstraction, no class/token/component change), and any recommended check with the owner's answer
- Leftovers under the filing bar: **fixed now N / filed N (each with its named reason and why it passes the 2-week filter) / dropped N (named in the commit body)**
- Files changed (count + list) — zero if validated-no-action
- Stage 4 Adjudicator verdict counts: **KEEP: N / DITCH: N / MODIFY: N** with disposition (absorbed into revision / dismissed) and any MISSED items the Adjudicator flagged
- Critics that ran: the always-on pair, plus which conditional critics fired (security, simplifier, and the specialists 3e–3g)
- Stack skills loaded at Stage 1 (or none)
- Build / lint status (npm run build pass/fail; lint count delta vs baseline)
- Stage 5.5 Fable audit: **N findings (M duplication)**, any recommended check with the owner's answer — and re-audit: **clean / N new findings / n-a**
- STACK.md update status (FU(s) moved to completed log / left open with a named reason / revised — and any FU filed under the filing bar)
- Stage 7 pre-commit audit verdict per check: **Truth: ✅/⚠️/❌ / Scope: ✅/⚠️/❌ / Follow-ups: ✅/⚠️/❌** — or "skipped — validated-no-action"
- Next step: user runs `git commit` (or revises per `/pre-commit-check` findings)

**Effectiveness telemetry — append on every completed run.** Via Bash, append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent) so heavy-vs-light effectiveness becomes measurable over time. Skip only on validated-no-action / abandon closes.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"cleanup-light\",\"outcome\":\"completed\",\"rigor\":\"light\",\"stage\":\"4\",\"files_changed\":<n>,\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"net_actionable\":<adjudicator Net-actionable count>,\"missed\":<adjudicator MISSED count, 0-3>,\"security_engaged\":<true|false>}" >> ~/.claude/metrics.jsonl
```

`keep/ditch/modify/net_actionable` come straight from the Stage 4 Adjudicator verdict block; `security_engaged` from the Stage 1 risk-surface flag.

**Adjudicator telemetry — append the same run** (only when Stage 4 actually adjudicated). A second line tags the adjudication itself so verdict effectiveness aggregates across every pipeline that calls The Adjudicator. `caller` identifies the invoking pipeline.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"outcome\":\"completed\",\"caller\":\"cleanup-light\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
```

`keep/ditch/modify` are the same Stage 4 Adjudicator verdict counts. Skip both lines on validated-no-action / abandon closes (no adjudication happened).

---

## Notes for Claude executing this command

- **Scope is the class, not the cited site.** Fixing the same defect at every site is in scope; a different class of work is not. The scope critic at Stage 3 polices the second, and the filing bar keeps leftovers from becoming successor FUs by default.
- **Mandatory pauses** at Stage 1.7 (plan approval, when it runs), Stage 4 (verdict acceptance) and Stage 6 (mark-complete confirmation), plus Stage 5.5's check question when Fable recommends one.
- **No auto-escalation.** If the change meets the project's Heavy-rigor trigger, surface and let the user decide whether to continue or kick to `/change-heavy`. File count is never the trigger.
- **Conditional critics save tokens.** Security, simplifier and the three specialists (silent-failure, type-design, test-coverage) run only when their lens applies. The specialists fire on the Stage 3 trigger counts, not on judgment.
- **Pass `model:` on all critic dispatches** so they run at orchestrator level.
- **The Adjudicator is `Read, Grep` only.** Don't pass it write tools.
- **STACK.md edits are surgical.** Use Edit tool to move the FU entry, not Write (don't rewrite the whole file).
- **Stage 7 is not optional except for validated-no-action close.** The pre-commit audit is the pipeline's truth-and-scope gate. Skipping it (e.g., "the diff looks fine, I'll let the user commit") regresses the pipeline to the pre-v2 manual-handoff state.
- **Stage 7 never auto-commits.** Final commit authority stays with the user per CLAUDE.md *"Only create commits when requested."* The audit just stages + reports; the user runs `git commit`.

### Fable seats (Stage 1.7 plan critique / 5.5 / 5.6)

- **No skip gate.** Stage 5.5 runs on every diff, CSS and token edits included; Stage 1.7's critique runs whenever that stage does. The orchestrator that wrote the diff never gets to decide "this obviously changed nothing" — that's the blind spot the audit exists to catch.
- **Duplication is a codebase property, so the seat must search.** A reviewer reading only the diff can't see the existing class it duplicates; both prompts tell Fable to search the project's stylesheets and components.
- **Audit for _unintended_ change.** Behavior-changing FUs (silent-failure, security, perf, bug) are the common case — pass the intended delta in and have Fable flag everything else. Findings get a disposition (intended → DITCH, unintended → fix), never a blind auto-fix, or the intended fix gets reverted.
- **Decorrelation is by family, not by name + audit-only.** The seats read `model: fable` because the orchestrator is normally Opus/Sonnet/Haiku; the invariant is auditor family ≠ author family. **If run on a Fable orchestrator, the seats dispatch `model: opus` instead** (else it's Fable-auditing-Fable, zero decorrelation). **Fable finds; the orchestrator fixes.** Never pass a Fable seat write tools.
- **Verify the seat's model on first dispatch.** `fable` is a valid Task `model` value, but confirm the Stage 5.5 seat actually ran on the intended (non-orchestrator) family before trusting it — a silent downgrade would launder correlated review as decorrelated evidence.
- **Security lens stays with `/security-review`.** Fable's cyber classifier can refuse on RLS/auth/payments — the security pass is Stage 3c `/security-review`; Fable audits behavior/correctness only.
- **Re-audit is bounded — one pass.** Stage 5.6 runs at most once; a surviving finding is a surface-to-user signal, not a loop.
- **Doubles as an escalation sensor.** If Stage 5.5 surfaces a Heavy-trigger / architectural finding, surface it — the user decides on `/change-heavy`; don't absorb it here.
