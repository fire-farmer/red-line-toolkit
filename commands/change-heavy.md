---
description: Heavy-mode 6-stage pipeline for changes that meet the project's CLAUDE.md Heavy-rigor trigger — its named high-risk areas (e.g. money math, RLS/migrations, payments, auth, exports) or a new data model / API shape. Composes stack skills + writing-plans, parallel critics with an always-on Fable plan critic, the-adjudicator, subagent-driven-development, /simplify, and code review. Everything else runs /cleanup-light, whatever its file count.
argument-hint: [brief description of the refactor]
allowed-tools: Read, Write, Edit, Bash, Task, Skill, SlashCommand, AskUserQuestion
---

# /change-heavy

You are running the **/change-heavy pipeline** — a 6-stage chain for high-rigor refactors. The user invoked this because they want clean, structured, high-performing code, not quick iterations. Take the workflow seriously; don't skip stages.

User's invocation argument (the refactor they want to do): **$ARGUMENTS**

---

## Stage 0 — Pre-flight scope check

Pending changes:
- Diff stat: !`git diff --stat`
- Working tree: !`git status --porcelain`

Before invoking any agents:

1. Read the diff stat and working-tree status above to gauge scope of pending changes.
2. Read the project's CLAUDE.md **Heavy rigor** trigger — the project's own list of high-risk areas, plus a new data model or API shape. The shape is shared across projects; the list is per project (a typical one: money math, RLS/migrations, payments, auth and exports). A project whose CLAUDE.md still states a file-count trigger uses that; a project whose CLAUDE.md states no trigger at all counts it as not met (the pause below asks).
3. Rigor check — **file count is not an indicator** under a risk-area trigger:
   - **Heavy-rigor trigger met** (the argument, the diff or the intended change reaches a listed risk area or a new data model / API shape, OR explicit "force heavy" — legacy "force tier-3" — instruction): proceed silently.
   - **Trigger not met:** use the `AskUserQuestion` tool to compel a structural pause (no prose-only "please confirm" — that's skippable in auto mode):
     - **Question:** *"This doesn't meet the project's Heavy-rigor trigger. Run the heavy /change-heavy pipeline anyway?"*
     - **Options:**
       - `Run full pipeline` → proceed to Stage 1
       - `Exit — use /cleanup-light` → stop. Output a one-liner pointing the user to `/cleanup-light <FU | home: group | "task">`, the standard pipeline at any file count. Do not advance.
   - **Trigger met for only part of the work:** split. Every part that reaches no risk area runs as its own `/cleanup-light`, and this run carries only the part that meets the trigger — unless a named coupling forces them together (a shared file, or the light part having to land first for the heavy part to be correct). State the coupling when you keep them together; a coupling is a fact about the code, not a convenience.

4. **Risk-surface check (carries to Stage 6 — independent of the rigor decision):** scan the argument AND the diff for the *security* subset — `auth, RLS, Stripe, webhook, calculation, financial, security, export` — or the **risk paths**: `src/app/api/**`, `**/auth/**`, `**/stripe/**`, `**/billing/**`, your migrations and access-policy (RLS) files, auth middleware, money-math modules, export routes, and any risk paths your CLAUDE.md names. This is the one list of risk paths: Stages 4, 6 and 7.5 and the Notes refer to it, and `/cleanup-light` Stage 3c carries a copy, so change both together. If any keyword or risk path matches, set **RISK SURFACE ENGAGED** for this run. This flag — NOT the rigor decision — is *one* trigger for the Stage 6 `/security-review` pass; the other is the implemented diff touching a risk path (re-checked at Stage 6, since Stage 0 predicts the surface before the code exists). A pure rename/structure refactor trips neither. Mirrors `/cleanup-light`'s Stage 1 pre-flight risk check.

---

## Stage 1 — PLAN (writing-plans skill)

**First, load the stack skills for the surfaces the change touches**, via the Skill tool, so the plan's API shapes come from current guidance rather than training memory: your framework's best-practice skill for routes, pages, server code and components, your database's for SQL, migrations and access policies, your payment provider's for payments (on a Next.js + Supabase + Stripe stack: `vercel:nextjs`, `vercel:react-best-practices`, `supabase:supabase-postgres-best-practices`, `stripe:stripe-best-practices`). Load none for CSS or token-only, copy, docs or test-only work. A skill that isn't installed is skipped, not a stop. `/cleanup-light` Stage 1 carries the same map; change both together. Name the skills loaded in the Done summary.

Then invoke the `superpowers:writing-plans` skill. Follow it to produce a complete plan written to `docs/plans/YYYY-MM-DD-<feature-name>.md`. The plan carries a **Reuses** line: the existing class, token or component each new piece reuses, or `New: <name> — nothing existing fits because <reason>`. Critic 2c checks it against the codebase. Get the user's approval before locking.

**Claim discipline — apply while writing, before the lock.** The plan phase is where an unchecked
claim is most expensive: a wrong assertion in code costs one test run, the same assertion in a plan
costs a critique round, an adjudication and a revision, because every later stage is built on it.
Four rules, cheapest first:

- **Never write a code shape you have not opened this turn.** Any block in the plan that claims to
  mirror existing code is pasted from the file, never typed from memory of a sibling.
- **A count comes from the command that will verify it.** If the Verify step is
  `grep -E '<pattern>' <files> | wc -l`, the plan's number is that command's output — not a similar
  grep over an adjacent set.
- **Probe before designing in an unfamiliar seam — budget about five.** Run the form on a probe;
  do not derive a library's behaviour by reading it.
- **Claims ledger, capped at ~10 lines.** Every load-bearing claim carries pasted command output or
  the literal word `UNVERIFIED`. ⚠️ **A ledger full of `UNVERIFIED` is worse than no ledger** — it
  launders the problem while looking rigorous. Cap it at the claims a decision rests on; past ~10
  lines the plan is resting on too many unverified claims, and that is the signal, not the ledger.

The failure these prevent is asserting from adjacency: reporting something *near* the fact — a grep
over a similar set, a comment a few lines from the one that matters, a file read earlier and since
edited — as though the fact itself had been checked. Critic 2b and the Stage 3 Adjudicator both
treat an unmarked unverified claim as a finding.

When the user approves, **lock the plan** by adding (or setting) frontmatter on the plan file:

```yaml
---
status: approved
locked-at: <ISO date>
---
```

The lock signals to subsequent stages that this plan is canonical and not to be silently revised.

### Stage 1.5 — FU body verification (mandatory, full-breadth)

FU bodies age out. Quantitative claims drift from reality as code lands after the FU is opened. **Before locking the plan**, empirically verify every claim in the source FU body PLUS run a wider pattern sweep.

- **Caller counts cited:** `grep -rn` the cited selector/identifier. Compare to FU's stated count.
- **File paths cited:** Confirm the file:line actually contains the construct described.
- **"Single-user" / "N-only" claims:** Exhaustive grep — including alternate construction patterns (template literals, `classnames()`, dynamic class composition, inline `style` overrides).
- **"May cascade" / scope-hedging framings:** Read every callsite of the **specific** selector/identifier cited (not every conceivably related file).
- **CSS cascade / runtime-behavior claims:** Use DOM-injection probe in preview server to confirm actual rendered behavior.
- **Wider pattern sweep (full-breadth only):** grep for **sibling** selectors / identifiers in the same family that may share the FU's anti-pattern (different name, same shape).

If any claim is wrong, update the plan's **"Stage 1.5 audit results"** section with corrected facts BEFORE locking. Surface corrections visibly — do not silently absorb. Preserve the `status: approved` lock but update content + `locked-at`.

If verification surfaces gaps so severe that the plan's premise is wrong, **abandon-and-replan** (flip frontmatter to `status: abandoned`, restart Stage 1).

Anchored in `memory/feedback_fu_body_verification.md`.

### Stage 1.6 — Extraction justification (mandatory if plan proposes file extractions)

If the locked plan proposes ANY new file creation by extracting from a component, hook, or store, verify each extraction against CLAUDE.md "Cohesion gate before extraction" before advancing to Stage 2.

For each proposed file extraction, require a one-sentence statement of what the extraction wins (e.g., "owns a state cluster the orchestrator has no awareness of," "needs `React.memo` for stability in a `.map()`").

**Reject** the extraction if its justification falls back to any of these:

- "Future testability" alone
- "Visual isolation" alone (visual-leaf extractions require >100 LOC + visual isolation, not isolation alone)
- "Pattern consistency with sibling extractions" as primary justification (allowed as secondary; not sufficient alone)
- "2+ callers within the same parent file" — this is within-file repetition; use a private inner function per CLAUDE.md "Cohesion gate before extraction"

If any extraction fails the gate, surface for revision before advancing. Update the plan with the corrected extraction list and update `locked-at` to the current ISO date. Preserve the `status: approved` lock.

Anchored in CLAUDE.md "Cohesion gate before extraction" (File Size Guidelines section).

---

## Stage 2 — PARALLEL CRITIQUE (two same-family critics + an always-on Fable decorrelation critic)

Dispatch the same-family critics (2a, 2b) in parallel via the Task tool — **a single message**. **Pass `model:` matching the orchestrator's current model family (`opus` | `sonnet` | `haiku` | `fable`) on 2a and 2b**, overriding each critic's pinned default so both run at the same level as this pipeline. Without the override, Critic 2a runs on Opus and Critic 2b on Sonnet — producing uneven critique depth that biases the Adjudicator's downstream work.

**Critic 2c is dispatched on the decorrelated family** — a model family *different from the orchestrator's*: normally `model: fable`, but `model: opus` when the orchestrator is itself Fable (see the Fable-seats note). The mismatch is the *mechanism*, not a bug: a different model brings different priors and catches the design flaws a plan authored and reviewed by the same family would share. Include it in the same parallel message, every run.

- **Critic 2a — `pr-review-toolkit:code-reviewer`** (conventions and project-style lens). Prompt:
  > *"Review this implementation plan against the project's CLAUDE.md, docs/STYLE_GUIDE.md, and existing patterns. Plan path: `<absolute path>`. Focus on: convention violations, naming, organization, alignment with documented design principles. Output structured findings, one per line: `file:line — severity — suggestion — rationale`. Only include findings that require an action — if something is compliant or correct, omit it entirely; do not log verification of correct behavior as a finding."*

- **Critic 2b — `feature-dev:code-reviewer`** (bugs and quality lens). Prompt:
  > *"Review this implementation plan for bugs, logic errors, security vulnerabilities, code quality issues. Plan path: `<absolute path>`. Use confidence-based filtering — only report high-priority issues. Output structured findings, one per line: `file:line — severity — suggestion — rationale`."*

- **Critic 2c — Fable decorrelation lens** *(always — every heavy run meets the Heavy-rigor trigger, so every plan gets the decorrelated eye)*. Dispatch via the Task tool on the decorrelated family — **`model: fable`**, or `model: opus` if the orchestrator is Fable (see the Fable-seats note). Prompt:
  > *"Decorrelated architectural review of this implementation plan. Plan path: `<absolute path>`. You did not write this plan — audit it with fresh priors. Focus ONLY on: architectural soundness, hidden coupling, data-model / schema correctness, load-bearing assumptions the plan takes for granted, sequencing / dependency errors, missed touchpoints (search the codebase for every place the change must also reach), and the plan's Reuses line (search the project's stylesheets and components for an existing class, token, component or recipe that already does what the plan adds; flag near-duplicates). If a defect class this plan fixes will recur and nothing checks for it, recommend a check (what it would catch) — a recommendation, not a finding. Do NOT review security (a dedicated pass covers that) and do NOT nitpick style. State the goal and hunt for the flaw — don't follow a checklist. Output structured findings, one per line: `file:line — severity — issue — rationale`. Omit anything compliant; report only what needs action."*

A check Critic 2c recommends goes to the user at the Stage 3 pause as its own question (`Build it` · `Decline`); it's built only on a yes (CLAUDE.md checking-script rule).

Collect all critics' outputs (2a, 2b, 2c). Concatenate them into a structured markdown block:

```
PLAN: <path to locked plan file>
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

Dispatch The Adjudicator (`the-adjudicator`) via the Task tool. Pass it the structured block from Stage 2 plus the path to the locked plan. The Adjudicator marks each critique as KEEP / DITCH / MODIFY and returns a structured verdict block.

Present The Adjudicator's output to the user **verbatim**. Then use the `AskUserQuestion` tool to compel a structural pause:

- **Question:** *"The Adjudicator marked [N] critiques ([K] KEEP, [D] DITCH, [M] MODIFY). Which to incorporate into the plan revision?"*
- **Options:**
  - `Absorb all KEEP + MODIFY` → incorporate every KEEP and MODIFY verdict into the revised plan
  - `Absorb none — keep original plan` → no revision; advance to Stage 4 against the locked plan
  - `Let me list specific CRITIQUE_IDs` → free-text follow-up; user names the IDs to absorb

Revise the plan file to incorporate the chosen findings, **preserving the `status: approved` lock** and updating `locked-at` to the current ISO date.

---

## Stage 4 — IMPLEMENT (subagent-driven-development skill)

Invoke `superpowers:subagent-driven-development` (single session, a fresh subagent per task with review between). The plan path is the locked-and-revised file from Stage 3. Do not use `superpowers:executing-plans` here: it has no subagent mode and runs every task inline, so the per-task models below would never apply.

**Model per task — the skill picks, under a risk floor.** `superpowers:subagent-driven-development` requires an explicit `model:` on every implementer and task-reviewer dispatch and picks the least powerful model that fits the task. Follow it, **with one override: any task whose files intersect the risk paths (the Stage 0 list), or whose plan text changes money math, RLS, auth, payments or exports, dispatches its implementer, its task reviewer AND every fix subagent for that task on `model: opus` (`fable` if the orchestrator is Fable) — never cheaper.** The skill sizes tasks by file count and spec completeness, not by blast radius, and the Stage 6 Fable audit does not cover security, so who writes risk-surface code, including the fix a task reviewer asks for, is the only authoring-time protection. Tally each implementer dispatch by model, and count the floor overrides, for the Done summary.

If the run hits a blocker (per the skill's own stop conditions — missing dep, repeated test failure, unclear instruction), surface the blocker to the user and pause. **Do not guess past blockers.**

---

## Stage 5 — SIMPLIFY (`/simplify` skill)

After implementation is complete and verified, invoke the `simplify` skill on the modified code. Apply suggestions that pass the same evidence bar the referee uses (concrete failure mode, project-doc citation, declared scope). Reject suggestions that demand abstraction at <2 callers, defensive checks for impossible conditions, or generic best-practice appeals.

**After `/simplify` completes — sibling-pattern flagging:** Explicitly enumerate any sibling patterns caught that were NOT in the original FU body. For each:
- file:line of the sibling
- Type of pattern (e.g., "same anti-pattern, different selector")
- Its outcome under the filing bar (CLAUDE.md "Scope discipline" — a row needs **both** a named reason **and** a pass of the 2-week filter): **absorbed in this pipeline** (the same class, the default), **filed**, or **dropped** with one line in the commit body

Append findings to `memory/feedback_fu_body_verification.md` under the **"Sibling-pattern miss log"** section. This is the empirical signal for whether Refinement #2 (sibling-pattern audit moved upstream to Stage 1.5) is needed — re-evaluate after 3-5 documented misses across different files.

---

## Stage 6 — REVIEW (`/pr-review-toolkit:review-pr` + conditional `/security-review`)

Invoke `/pr-review-toolkit:review-pr` via the SlashCommand tool. Pass aspects **`code tests errors types comments`** — omit `simplify` since Stage 5 already ran the dedicated `/simplify` skill, and omit `all` (which includes simplify by default).

The aspects map to specialized agents, each fired only if relevant to the diff:

- **code** (`pr-review-toolkit:code-reviewer`, always) — conventions, bugs, project-guideline adherence
- **tests** (`pr-test-analyzer`, if test files changed) — coverage quality, critical gaps, behavioral vs implementation tests
- **errors** (`silent-failure-hunter`, if error-handling changed) — silent failures, inadequate catch blocks, fallback misuse
- **types** (`type-design-analyzer`, if new types added) — encapsulation, invariant expression, type design quality
- **comments** (`comment-analyzer`, if comments/docs added) — comment accuracy, rot detection, doc completeness

Works on the current diff/branch — no PR required, aligned with the repo's main-only convention.

**Conditional security pass — if RISK SURFACE ENGAGED at Stage 0 *or* the implemented diff touches a risk path:** Stage 0 predicts the risk surface from the argument before the code exists, so re-check here against the actual change — `git diff --name-only HEAD` intersected with the risk paths (the Stage 0 list). If the flag is set OR that intersection is non-empty, invoke `/security-review` via the SlashCommand tool on the current diff (staged + unstaged); capture its output as an additional findings source — labeled `security-review` — for Stage 7 adjudication. Skip only when neither the flag nor the actual diff implicates a risk surface (token cost). Mirrors `/cleanup-light`'s Stage 3c.

The command categorizes findings as **Critical** / **Important** / **Suggestions**. Capture all findings as structured input for Stage 7 — **do NOT auto-absorb, auto-defer, or auto-fix at this stage.** Stage 7 dispatches The Adjudicator on the pr-review findings, which filters noise (vibes, scope violations, generic best-practice appeals from 6 parallel agents) and presents KEEP / DITCH / MODIFY verdicts. Disposition decisions happen at Stage 7, not here.

**Decorrelated Fable audit (always — the highest-value Fable seat).** In the **same turn** as the pr-review dispatch (in parallel — do not serialize it behind the pr-review pass), dispatch a Fable audit of the implemented diff via the Task tool on the decorrelated family — **`model: fable`**, or `model: opus` if the orchestrator is Fable (see the Fable-seats note). This is the decorrelation layer the pr-review agents structurally can't be — a different model auditing the orchestrator's code catches the blind spots a same-family review shares. **Pass the plan path** so the audit can compare against intent (a fresh subagent has no other way to know what "intended" means). Prompt:

> *"Decorrelated audit of this implemented diff (`git diff HEAD`, plus staged). Locked plan: `<absolute path to the Stage-1 plan>` — read it for the intended behavior. You did not write this code — audit it with fresh priors. Focus ONLY on: correctness, data-integrity, logic errors, silent behavior changes vs. what the plan intended, accessibility, and duplication — for every new CSS class, custom property, color-mix recipe or inline style object in the diff, search the project's stylesheets and components for an existing equivalent and flag near-duplicates, naming the existing one. If a defect class in this diff will recur and nothing checks for it, recommend a check (what it would catch) — a recommendation, not a finding; it goes to the user at the Stage 7 pause and is built only on a yes. Do NOT review security (the `/security-review` pass covers that when the risk surface is engaged) and do NOT restyle. State the goal and hunt for the defect — don't follow a checklist. Output structured findings, one per line: `file:line — severity — issue — rationale`. Report only what needs action; write `CLEAN` if nothing does."*

Capture its output labeled `fable-decorrelation` as an additional findings source for Stage 7 adjudication. **Fable finds; it never fixes** — all disposition and every fix happen at Stage 7 on the orchestrator.

---

## Stage 7 — ADJUDICATE pr-review findings (conditional, max 1 revise cycle)

If **all** sources — `/pr-review-toolkit:review-pr`, the Stage 6 Fable audit, and (when it ran) `/security-review` — surfaced **zero findings** and Fable **recommended no check**: pipeline complete, advance to Done. Zero findings with a recommended check → skip adjudication but still ask the check question (`AskUserQuestion`: `Build it` · `Decline`) before Done.

If findings exist (from any source):

1. **Format the findings** into the Adjudicator's canonical input shape. Include `/security-review` as a critic `id` **only if the Stage 6 security pass actually ran** — which is either trigger (the Stage 0 flag OR the diff intersecting a risk path), not the Stage 0 flag alone:

   ```
   PLAN: <absolute path to locked plan file>
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
   ```

2. **Dispatch The Adjudicator** (`the-adjudicator`) via the Task tool with the structured block + plan path. The Adjudicator's security-asymmetric upgrade rule fires automatically — Critical/security findings can only KEEP or MODIFY-up, never DITCH.

3. **Present verdicts verbatim.** Use the `AskUserQuestion` tool to compel a structural pause:

   - **Question:** *"Review surfaced [N] findings ([N1] pr-review + [N2] fable + [N3] security-review when it ran). The Adjudicator marked them [K] KEEP, [D] DITCH, [M] MODIFY. Which to absorb?"*
   - **Options:**
     - `Absorb all KEEP + MODIFY` → revise the implementation; re-run `npm run build` + lint; advance to Stage 7.5 (it runs whenever this revise pass applied fixes; no second pr-review pass unless user explicitly requests one)
     - `Absorb none — pipeline complete` → no revision; advance to Done. Each KEEP/MODIFY item the user declined passes the filing bar (a row needs **both** a named reason **and** a pass of the 2-week filter): filed, or dropped with one line in the commit body. The same holds for any finding a review groups as "file as FU": that grouping is input, not the filing decision.
     - `Let me list specific CRITIQUE_IDs` → free-text follow-up; user names the IDs to absorb

4. **Max 1 cycle from pr-review.** If absorption produces a revise pass and a hypothetical second pr-review (user-initiated only) surfaces NEW revise-here findings, STOP and surface to user — likely Stage 1 plan needs revision (return to Stage 1, not loop here).

---

## Stage 7.5 — Fable re-audit of the fix (conditional: a revise pass applied)

Runs whenever the Stage 7 absorption actually applied fixes (a revise pass occurred). Skip otherwise — a clean adjudication or an "absorb none" close has nothing to re-audit.

The fix is the one thing no source has independently checked: the orchestrator found-then-fixed against the audit findings, but if its blind spot produced the original defect, its fix can carry a correlated variant (patches the symptom, not the root). This step closes that loop — and stays decorrelated because the orchestrator authored the fix and a different model family checks it.

Dispatch a Fable audit of the **corrected** diff via the Task tool on the decorrelated family (`model: fable`, or `model: opus` if the orchestrator is Fable). **Pass the verbatim findings that were just fixed** — a fresh subagent cannot "verify each fix" without knowing what the defects were. Prompt:

> *"Re-audit this corrected diff (`git diff HEAD`, plus staged). The findings just fixed were: `<paste the verbatim KEEP/MODIFY findings absorbed at Stage 7>`. Verify each fix resolves the defect at the root and introduced no new correctness / data-integrity / logic / behavior-change problem. Same lens as before; NOT security. Output `file:line — severity — issue — rationale`, or `CLEAN` if the fixes hold."*

**Security re-verification (Fable's re-audit is explicitly NOT security).** Whenever the Stage 6 security pass ran and this revise pass applied fixes — the **same two-trigger rule Stage 6 uses** (Stage 0 flag OR the corrected diff intersecting a risk path, `git diff --name-only HEAD` ∩ the Stage 0 risk paths) — ALSO re-run `/security-review` on the corrected diff here. Without it a security-adjacent fix applied at Stage 7 would get the *weakest* post-fix verification in the pipeline. Route any new security finding into the same surface-to-user decision below.

- **CLEAN** → advance to Done.
- **A finding that restates the intended fix or names no defect** → dismiss it.
- **New material finding** → **surface to the user; do NOT auto-loop.** A finding surviving the fix means the fix is correlated/incomplete or the plan's premise is off — the same signal as the Stage 7 max-1-cycle rule. Return to Stage 1 (plan revision) if the finding is structural; otherwise hand the user the single fix decision. **One re-audit only** — and a *second consecutive* replan triggered by a re-audit finding is itself a stop-and-surface signal, not normal flow; do not start a third lap without explicit user direction.

---

## Done — three valid termination states

1. **Standard close** — code changes ship, plan marked RESOLVED.
2. **Validated-no-action close** — Stage 1.5 verification invalidated the plan's framing; close with rationale; adjacent observations pass the filing bar (a row needs **both** a named reason **and** a pass of the 2-week filter).
3. **Abandon-and-replan** — Stage 2/3 critique surfaces audit gaps too severe to absorb in revision; flip frontmatter to `status: abandoned` and restart Stage 1 with corrected scope.

When stages complete cleanly, summarize which state applies, plus:
- What was changed (file count, scope) — zero if validated-no-action
- Stack skills loaded at Stage 1 (or none)
- Stage 4 implementer models: **haiku N / sonnet N / opus N / fable N** (risk-floor overrides: N)
- Which referee verdicts shaped the plan (Stage 3 KEEP / DITCH / MODIFY counts on plan critique)
- Stage 2c Fable decorrelation critic on the plan: **N findings** (always runs), and any recommended check with the owner's answer
- Stage 6 pr-review raw finding counts: **Critical: N / Important: N / Suggestions: N**
- Stage 6 `/security-review`: **engaged (N findings) / not engaged** (risk-surface gate)
- Stage 6 Fable decorrelation code audit: **N findings** (always runs)
- Stage 7 Adjudicator verdict counts on those findings (if Stage 7 ran): **KEEP: N / DITCH: N / MODIFY: N** with absorption disposition (revised inline / dismissed / partial — list specific CRITIQUE_IDs if partial)
- Stage 7.5 Fable re-audit of the fix: **clean / N new findings surfaced / skipped** (no revise pass)
- Leftovers under the filing bar (Stage 5 siblings, Stage 7 declined-but-valid items): **absorbed N / filed N (each with its named reason and why it passes the 2-week filter) / dropped N (named in the commit body)**
- Any sibling-pattern catches from Stage 5 `/simplify` logged to `memory/feedback_fu_body_verification.md`

**Effectiveness telemetry — append on every completed run.** Via Bash, append one JSON line per adjudication that ran to `~/.claude/metrics.jsonl` (append-only; create if absent). Over weeks this is the data that reveals whether heavy-mode earns its ceremony on light-rigor work — the signal currently missing. Skip only on validated-no-action / abandon closes (no adjudication happened).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"change-heavy\",\"outcome\":\"completed\",\"rigor\":\"<light|heavy>\",\"stage\":\"<3|7>\",\"files_changed\":<n>,\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"net_actionable\":<adjudicator Net-actionable count>,\"missed\":<adjudicator MISSED count, 0-3>,\"security_engaged\":<true|false>}" >> ~/.claude/metrics.jsonl
```

Emit one line for Stage 3 (plan critique) and a second with `"stage":"7"` if Stage 7 ran. `keep/ditch/modify/net_actionable` come straight from that stage's Adjudicator verdict block; `rigor` from Stage 0 (what the rigor check classified the WORK as — heavy-mode-on-light-work is exactly the signal); `security_engaged` from the Stage 0 risk-surface flag.

**Adjudicator-effectiveness telemetry — emit alongside each `change-heavy` row above.** For each adjudication that ran (Stage 3, and Stage 7 if it ran), append a second parallel row tagged `pipeline:"adjudicator"` with `caller:"change-heavy"`. This feeds a unified adjudicator-effectiveness stream shared across every pipeline that dispatches The Adjudicator — keep the field names identical so cross-caller aggregation holds. Values come from the same Adjudicator verdict block as the row above; same skip rule (validated-no-action / abandon closes emit nothing, since no adjudication ran).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"caller\":\"change-heavy\",\"outcome\":\"completed\",\"stage\":\"<3|7>\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"net_actionable\":<adjudicator Net-actionable count>,\"missed\":<adjudicator MISSED count, 0-3>}" >> ~/.claude/metrics.jsonl
```

---

## Notes for Claude executing this command

- **Don't skip stages.** Each stage is load-bearing for "high-rigor."
- **Stay in this session.** This pipeline is designed for one continuous session with fresh subagents per stage, not parallel sessions.
- **Pause at the boundaries** — Stage 1 → 2 (plan approval), Stage 3 → 4 (critique acceptance, plus the check question when Critic 2c recommends one), Stage 7 → Done (pr-review verdict acceptance if findings exist, or the check question when the Stage 6 Fable audit recommends one), and the final summary. Don't auto-advance past user input points.
- **Preserve the lock.** Once Stage 1 approves the plan, the `status: approved` frontmatter is canonical. Plan revisions update content but never remove the lock.
- **Tool-layer constraints:** The Adjudicator (`the-adjudicator`) is `Read, Grep` only by design. Do not pass it write tools. The same agent serves at both Stage 3 (plan critique) and Stage 7 (pr-review critique) — its rubric handles both naturally; no behavioral difference between the two invocations.
- **Stage 6 contract:** invoke `/pr-review-toolkit:review-pr` with the explicit aspect list `code tests errors types comments` — never substitute `superpowers:requesting-code-review` (the pre-2026-05-16 lighter alternative; empirical post-pipeline yield showed it missed 4 specialized lenses worth keeping). Never pass `all` or include `simplify` — Stage 5 already covered simplification via the `/simplify` skill, and passing `all` causes redundant work.
- **Stage 6 security contract (added 2026-06-06):** when RISK SURFACE ENGAGED at Stage 0 (auth/RLS/Stripe/webhook/financial/calculation/security/export) **OR the implemented diff intersects a risk path** (`git diff --name-only HEAD` ∩ the Stage 0 risk paths — the two-trigger rule used by the Stage 6 body, Stage 7, and Stage 7.5's security re-check), Stage 6 ALSO runs `/security-review` on the diff, feeding Stage 7 adjudication where the security-asymmetric floor already applies. Brings parity with `/cleanup-light`, which already runs a conditional `/security-review`. Keep it conditional — do NOT run it on non-risk (pure rename/structure) refactors; the token cost isn't warranted. The-adjudicator needs no change: its severity floor is source-agnostic.
- **Stage 7 contract:** the Adjudicator filters pr-review findings BEFORE the user has to act on them — never skip Stage 7 by directly presenting Stage 6's raw output to the user. The whole point of the new Stage 7 (added 2026-05-16) is noise-filtering across 6 parallel pr-review agents. Skipping it regresses the pipeline to "let user manually filter 6-agent output," which the precedent in `/page-implement` already proved subpar.
- **Max 1 revise cycle from Stage 7.** If absorbing verdicts requires a revise and a second pr-review (user-initiated) surfaces new revise-here findings, STOP — likely Stage 1 plan needs revision. Do not loop within Stage 7.

### Fable seats (Stage 2c / Stage 6 / Stage 7.5)

- **Decorrelation is by FAMILY, not by name.** The seats read `model: fable` because the orchestrator is normally Opus/Sonnet/Haiku. The real invariant is **auditor family ≠ author family** — a *different* model than the one that authored (Stage 1) and fixed (Stage 7) the code. **If this pipeline is run on a Fable orchestrator**, the decorrelation seats dispatch `model: opus` instead — otherwise every seat is Fable-auditing-Fable: zero decorrelation. Everything else matches the orchestrator family, except Stage 4 implementers, task reviewers and fix subagents, which take the per-task model under the risk floor (see Stage 4).
- **Verify the seat's model on first dispatch.** `fable` is a valid Task `model` value, but on the first Fable-seat dispatch of a run, confirm the subagent actually ran on the intended (non-orchestrator) family before trusting its output — a silent downgrade would launder correlated review as decorrelated evidence.
- **Fable finds, the orchestrator fixes.** Every Fable seat is audit-only. All disposition and every fix happen on the orchestrator. **Never dispatch a Fable seat with write tools.**
- **A recommended check is built only on a yes.** When a Fable seat recommends a new permanent checking script, it reaches the user at the next pause; nothing is built without approval (CLAUDE.md checking-script rule).
- **Security lens is never Fable.** Fable's cyber classifier can refuse or degrade on auth/RLS/payments analysis — the security lens stays `/security-review` (Stage 6). Fable audits correctness / data-integrity / logic / a11y only. This is why Stage 7.5's re-audit is correctness-lens even on a risk-surface run: the security re-check, if needed, is the orchestrator's `/security-review`.
- **Fable prompts are goal-stated, not scaffolded.** State the lens + hunt-for and let it reason — over-prescriptive checklists lower its output quality. Do not port the pipeline's structured critic rubrics into the Fable prompts.
- **Re-audit is bounded — one pass, no loop.** Stage 7.5 runs at most once; a finding that survives the fix is a signal to surface (return to Stage 1 if structural), not a trigger to iterate.
- **The Adjudicator treats `fable-decorrelation` like any other source.** Its rubric is source-agnostic — no special weighting; the security-asymmetric floor still applies to any Critical/security-tagged finding regardless of which source raised it.
