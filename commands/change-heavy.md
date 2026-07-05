---
description: Heavy-mode 6-stage pipeline for high-rigor refactors and architectural changes. Composes writing-plans, parallel critics, the-adjudicator, executing-plans, /simplify, and code review. Use when changes touch 3+ files, introduce new abstractions, or hit high-risk areas (financial calc, RLS, payments).
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
2. Re-read the user's invocation argument above. Look for these heavy-rigor keywords: *refactor, rename, architecture, data model, schema, auth, RLS, Stripe, webhook, calculation, financial, security*.
3. Rigor check:
   - **Heavy-rigor indicators present** (≥3 files in current diff OR architecture/data-model/auth/financial keywords in the argument OR explicit "force heavy" — legacy "force tier-3" — instruction): proceed silently.
   - **Light-rigor indicators only** (≤2 files in diff AND no architectural keywords): use the `AskUserQuestion` tool to compel a structural pause (no prose-only "please confirm" — that's skippable in auto mode):
     - **Question:** *"This looks like light-rigor work. Run the heavy /change-heavy pipeline anyway?"*
     - **Options:**
       - `Run full pipeline` → proceed to Stage 1
       - `Exit — use lightweight flow` → stop. Output a one-liner pointing the user to CLAUDE.md "Default workflow" (`PLAN → implement → REVIEW`). Do not advance.

4. **Risk-surface check (carries to Stage 6 — independent of the rigor decision):** scan the argument AND the diff for the *security* subset — `auth, RLS, Stripe, webhook, calculation, financial, security, export` — or risk paths (`src/app/api/**`, `**/auth/**`, `**/stripe/**`, `**/billing/**`, export routes). If any match, set **RISK SURFACE ENGAGED** for this run. This flag — NOT the rigor decision — is *one* trigger for the Stage 6 `/security-review` pass; the other is the implemented diff touching a risk path (re-checked at Stage 6, since Stage 0 predicts the surface before the code exists). A pure rename/structure refactor trips neither. Mirrors `/cleanup-light`'s Stage 1 pre-flight risk check.

---

## Stage 1 — PLAN (writing-plans skill)

Invoke the `superpowers:writing-plans` skill. Follow it to produce a complete plan written to `docs/plans/YYYY-MM-DD-<feature-name>.md`. Get the user's approval before locking.

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

## Stage 2 — PARALLEL CRITIQUE (two critics, in parallel)

Dispatch BOTH critics in parallel via the Task tool — **a single message with two tool calls**. **Pass `model:` matching the orchestrator's current model family (`opus` | `sonnet` | `haiku`) on both dispatches**, overriding each critic's pinned default so both run at the same level as this pipeline. Without the override, Critic 2a runs on Opus and Critic 2b on Sonnet — producing uneven critique depth that biases the Adjudicator's downstream work.

- **Critic 2a — `pr-review-toolkit:code-reviewer`** (conventions and project-style lens). Prompt:
  > *"Review this implementation plan against the project's CLAUDE.md, docs/STYLE_GUIDE.md, and existing patterns. Plan path: `<absolute path>`. Focus on: convention violations, naming, organization, alignment with documented design principles. Output structured findings, one per line: `file:line — severity — suggestion — rationale`. Only include findings that require an action — if something is compliant or correct, omit it entirely; do not log verification of correct behavior as a finding."*

- **Critic 2b — `feature-dev:code-reviewer`** (bugs and quality lens). Prompt:
  > *"Review this implementation plan for bugs, logic errors, security vulnerabilities, code quality issues. Plan path: `<absolute path>`. Use confidence-based filtering — only report high-priority issues. Output structured findings, one per line: `file:line — severity — suggestion — rationale`."*

Collect both critics' outputs. Concatenate them into a structured markdown block:

```
PLAN: <path to locked plan file>
CRITICS:
  - id: pr-review-toolkit:code-reviewer
    findings: |
      <verbatim output from Critic 2a>
  - id: feature-dev:code-reviewer
    findings: |
      <verbatim output from Critic 2b>
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

## Stage 4 — IMPLEMENT (executing-plans skill, subagent-driven mode)

Invoke `superpowers:executing-plans` in **subagent-driven mode** (single session, fresh subagent per task with review between). The plan path is the locked-and-revised file from Stage 3.

If executing-plans hits a blocker (per its own stop conditions — missing dep, repeated test failure, unclear instruction), surface the blocker to the user and pause. **Do not guess past blockers.**

---

## Stage 5 — SIMPLIFY (`/simplify` skill)

After implementation is complete and verified, invoke the `simplify` skill on the modified code. Apply suggestions that pass the same evidence bar the referee uses (concrete failure mode, project-doc citation, declared scope). Reject suggestions that demand abstraction at <2 callers, defensive checks for impossible conditions, or generic best-practice appeals.

**After `/simplify` completes — sibling-pattern flagging:** Explicitly enumerate any sibling patterns caught that were NOT in the original FU body. For each:
- file:line of the sibling
- Type of pattern (e.g., "same anti-pattern, different selector")
- Whether absorbed in this pipeline or deferred to STACK.md as a new FU

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

**Conditional security pass — if RISK SURFACE ENGAGED at Stage 0 *or* the implemented diff touches a risk path:** Stage 0 predicts the risk surface from the argument before the code exists, so re-check here against the actual change — `git diff --name-only HEAD` intersected with the risk paths (`src/app/api/**`, `**/auth/**`, `**/stripe/**`, `**/billing/**`, export routes). If the flag is set OR that intersection is non-empty, invoke `/security-review` via the SlashCommand tool on the current diff (staged + unstaged); capture its output as an additional findings source — labeled `security-review` — for Stage 7 adjudication. Skip only when neither the flag nor the actual diff implicates a risk surface (token cost). Mirrors `/cleanup-light`'s Stage 3c.

The command categorizes findings as **Critical** / **Important** / **Suggestions**. Capture all findings as structured input for Stage 7 — **do NOT auto-absorb, auto-defer, or auto-fix at this stage.** Stage 7 dispatches The Adjudicator on the pr-review findings, which filters noise (vibes, scope violations, generic best-practice appeals from 6 parallel agents) and presents KEEP / DITCH / MODIFY verdicts. Disposition decisions happen at Stage 7, not here.

---

## Stage 7 — ADJUDICATE pr-review findings (conditional, max 1 revise cycle)

If **both** `/pr-review-toolkit:review-pr` and (when it ran) `/security-review` surfaced **zero findings**: pipeline complete, advance to Done.

If findings exist (from either source):

1. **Format the findings** into the Adjudicator's canonical input shape. Include `/security-review` as a second critic `id` **only if it ran** (RISK SURFACE ENGAGED at Stage 0):

   ```
   PLAN: <absolute path to locked plan file>
   CRITICS:
     - id: pr-review-toolkit:review-pr
       findings: |
         <verbatim findings, one per line: file:line — severity — issue — recommendation>
     - id: security-review        # include ONLY if RISK SURFACE ENGAGED and the pass ran
       findings: |
         <verbatim /security-review findings, same one-per-line shape>
   ```

2. **Dispatch The Adjudicator** (`the-adjudicator`) via the Task tool with the structured block + plan path. The Adjudicator's security-asymmetric upgrade rule fires automatically — Critical/security findings can only KEEP or MODIFY-up, never DITCH.

3. **Present verdicts verbatim.** Use the `AskUserQuestion` tool to compel a structural pause:

   - **Question:** *"Review surfaced [N] findings ([N1] pr-review + [N2] security-review). The Adjudicator marked them [K] KEEP, [D] DITCH, [M] MODIFY. Which to absorb?"*
   - **Options:**
     - `Absorb all KEEP + MODIFY` → revise the implementation; re-run `npm run build` + lint; advance to Done (no second pr-review pass unless user explicitly requests one)
     - `Absorb none — pipeline complete` → no revision; advance to Done. KEEP/MODIFY items the user declined go to STACK.md FOLLOW-UPS for explicit visibility
     - `Let me list specific CRITIQUE_IDs` → free-text follow-up; user names the IDs to absorb

4. **Max 1 cycle from pr-review.** If absorption produces a revise pass and a hypothetical second pr-review (user-initiated only) surfaces NEW revise-here findings, STOP and surface to user — likely Stage 1 plan needs revision (return to Stage 1, not loop here).

---

## Done — three valid termination states

1. **Standard close** — code changes ship, plan marked RESOLVED.
2. **Validated-no-action close** — Stage 1.5 verification invalidated the plan's framing; close with rationale + adjacent observations (new STACK FUs).
3. **Abandon-and-replan** — Stage 2/3 critique surfaces audit gaps too severe to absorb in revision; flip frontmatter to `status: abandoned` and restart Stage 1 with corrected scope.

When stages complete cleanly, summarize which state applies, plus:
- What was changed (file count, scope) — zero if validated-no-action
- Which referee verdicts shaped the plan (Stage 3 KEEP / DITCH / MODIFY counts on plan critique)
- Stage 6 pr-review raw finding counts: **Critical: N / Important: N / Suggestions: N**
- Stage 6 `/security-review`: **engaged (N findings) / not engaged** (risk-surface gate)
- Stage 7 Adjudicator verdict counts on those findings (if Stage 7 ran): **KEEP: N / DITCH: N / MODIFY: N** with absorption disposition (revised inline / dismissed / partial — list specific CRITIQUE_IDs if partial)
- Any deferred follow-ups added to `STACK.md` (including Stage 7 declined-but-valid items routed there for explicit visibility)
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
- **Pause at the boundaries** — Stage 1 → 2 (plan approval), Stage 3 → 4 (critique acceptance), Stage 7 → Done (pr-review verdict acceptance, if findings exist), and the final summary. Don't auto-advance past user input points.
- **Preserve the lock.** Once Stage 1 approves the plan, the `status: approved` frontmatter is canonical. Plan revisions update content but never remove the lock.
- **Tool-layer constraints:** The Adjudicator (`the-adjudicator`) is `Read, Grep` only by design. Do not pass it write tools. The same agent serves at both Stage 3 (plan critique) and Stage 7 (pr-review critique) — its rubric handles both naturally; no behavioral difference between the two invocations.
- **Stage 6 contract:** invoke `/pr-review-toolkit:review-pr` with the explicit aspect list `code tests errors types comments` — never substitute `superpowers:requesting-code-review` (the pre-2026-05-16 lighter alternative; empirical post-pipeline yield showed it missed 4 specialized lenses worth keeping). Never pass `all` or include `simplify` — Stage 5 already covered simplification via the `/simplify` skill, and passing `all` causes redundant work.
- **Stage 6 security contract (added 2026-06-06):** when Stage 0 sets RISK SURFACE ENGAGED (auth/RLS/Stripe/webhook/financial/calculation/security/export), Stage 6 ALSO runs `/security-review` on the diff, feeding Stage 7 adjudication where the security-asymmetric floor already applies. Brings parity with `/cleanup-light`, which already runs a conditional `/security-review`. Keep it conditional — do NOT run it on non-risk (pure rename/structure) refactors; the token cost isn't warranted. The-adjudicator needs no change: its severity floor is source-agnostic.
- **Stage 7 contract:** the Adjudicator filters pr-review findings BEFORE the user has to act on them — never skip Stage 7 by directly presenting Stage 6's raw output to the user. The whole point of the new Stage 7 (added 2026-05-16) is noise-filtering across 6 parallel pr-review agents. Skipping it regresses the pipeline to "let user manually filter 6-agent output," which the precedent in `/page-implement` already proved subpar.
- **Max 1 revise cycle from Stage 7.** If absorbing verdicts requires a revise and a second pr-review (user-initiated) surfaces new revise-here findings, STOP — likely Stage 1 plan needs revision. Do not loop within Stage 7.
