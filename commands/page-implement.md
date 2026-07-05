---
description: Per-page implementation pipeline. Executes a locked code plan, runs post-execution parallel critique (code-reviewer + /security-review + simplifier), adjudicates, revises, /simplify, verifies (build + manual), then pr-review-toolkit final pass. Max 1 cycle from pr-review.
argument-hint: [page name from locked code plan]
allowed-tools: Read, Write, Edit, Bash, Task, AskUserQuestion, Skill, SlashCommand
---

# /page-implement

You are running the **/page-implement pipeline** — implementation of a locked code plan with post-execution critique and pr-review-toolkit final pass. The user invoked this because they need the code written, reviewed, and verified before commit.

User's invocation argument (page name): **$ARGUMENTS**

---

## Stage 0 — Pre-flight scope check

Locate the locked code plan:
- Read `docs/plans/YYYY-MM-DD-module-*-page-<page-slug>-code.md`
- Confirm `status: locked`
- If not locked, refuse and tell user to lock the code plan first

Run the 3-item gate (cheatsheet §5). Note risk surface engagement for downstream security upgrade.

---

## Stage 1 — Execute

Follow the locked plan. Create/modify files exactly as specified. **No scope creep** — anything beyond plan goes to FOLLOW-UPS in STACK.md, not silently into the diff.

If the plan is missing details (exact file paths, edge cases), kick back to `/page-code` rather than guessing.

---

## Stage 2 — Parallel critique (3 critics)

Dispatch THREE critics in parallel via Task tool — **single message, three tool calls**. Pass `model:` matching orchestrator.

- **Critic 2a — `pr-review-toolkit:code-reviewer`:**
  > *"Review this implementation for bugs, logic errors, conventions, and quality issues. Use confidence-based filtering — only report high-priority issues. Files changed: [list from git diff --name-only HEAD]. Output: `file:line — severity — issue — recommendation`."*

- **Critic 2b — `/security-review` (via SlashCommand tool):**
  > Invoke `/security-review` to run a focused security pass on the current branch's staged + unstaged changes. Capture its output as Critic 2b's findings, formatted as: `file:line — severity — issue — recommendation`.

- **Critic 2c — simplifier critic (general-purpose):**
  > *"Review this implementation for: dead code, redundant checks, over-abstraction, defensive checks for impossible conditions, comments that restate code, orphaned imports/exports, premature abstractions at <2 callers. Files changed: [list from git diff]. Output: `file:line — severity — issue — recommendation`."*

Collect and concatenate.

---

## Stage 3 — Adjudicate (security asymmetric upgrade)

Dispatch The Adjudicator via Task tool. Apply security-asymmetric upgrade.

Present verdicts verbatim. Use `AskUserQuestion`:

- **Question:** *"The Adjudicator marked [N] critiques on the implementation. Which to absorb?"*
- **Options:**
  - `Absorb all KEEP + MODIFY` → revise + /simplify
  - `Absorb none — proceed to verify`
  - `Let me list specific CRITIQUE_IDs`

---

## Stage 4 — Revise + /simplify (auto on verdict approval)

Apply selected verdicts. Then invoke the `simplify` skill on modified files. Apply suggestions with concrete failure modes or project-doc citations; reject generic-best-practice appeals.

**After `/simplify` completes — sibling-pattern flagging:** Explicitly enumerate any sibling patterns caught that were NOT in the original code plan. For each:
- file:line of the sibling
- Type of pattern (e.g., "same anti-pattern, different selector")
- Whether absorbed in this pipeline or deferred to STACK.md as a new FU

Append findings to `memory/feedback_fu_body_verification.md` under the **"Sibling-pattern miss log"** section. Empirical signal for whether sibling-pattern audit should move upstream (Refinement #2 in `docs/plans/2026-05-14-refactor-pipeline-refinements.md`).

---

## Stage 5 — Verify

Run `npm run build`. If pass: continue to Stage 6.

If fail: invoke `superpowers:systematic-debugging` skill to find root cause, fix, re-verify. Loop within Stage 5 until clean.

**Characterization-test gate:** if the diff touched `src/lib/**` and no `*.test.ts` was added/updated for it, that is a verify FAILURE — author the characterization test the code plan named (the input/output pair), then run `npm test` and confirm it passes before Stage 6. (CLAUDE.md mandate: new `src/lib` modules ship with characterization tests. This makes Stage 6's `pr-test-analyzer` review *real* tests rather than detect their absence.)

Also run manual checks from the code plan's test scenarios. Verify lint count preserved or improved.

---

## Stage 6 — pr-review-toolkit final pass

Invoke `/pr-review-toolkit:review-pr` via SlashCommand tool for a comprehensive final pass. This includes code-reviewer, silent-failure-hunter, type-design-analyzer, comment-analyzer, pr-test-analyzer, and code-simplifier.

---

## Stage 7 — Adjudicate pr-review findings (conditional)

If pr-review-toolkit surfaces no findings: pipeline complete, jump to Done.

If findings exist: dispatch The Adjudicator on those findings. Apply security-asymmetric upgrade.

Present verdicts. Use `AskUserQuestion`:

- **Question:** *"pr-review-toolkit surfaced [N] findings. Which to absorb?"*
- **Options:**
  - `Absorb all KEEP + MODIFY` → revise, re-verify (max 1 cycle)
  - `Absorb none — pipeline complete`
  - `Let me list specific CRITIQUE_IDs`

**Max 1 cycle from pr-review:** if a second pass surfaces NEW revise-here findings, STOP and surface to user — something deeper is wrong.

Escalation tags in MODIFY verdicts:
- `MODIFY [revise-here]` → fix in this pipeline
- `MODIFY [escalate-to-code]` → kick back to `/page-code` (structural/architectural issue)
- `MODIFY [escalate-to-design]` → kick back to `/page-design` (design mismatch)

---

## Done — three valid termination states

1. **Standard close** — code changes ship, code plan marked RESOLVED.
2. **Validated-no-action close** — implementation surfaced that the code plan's premise was wrong; close and kick back to `/page-code` for replan.
3. **Abandon-and-replan** — Stage 3/7 critique surfaces audit gaps too severe to absorb; flip frontmatter to `status: abandoned` and surface to user.

Summarize which state applies, plus:
- Files changed (count + paths) — zero if validated-no-action
- Verify status (build pass, manual checks)
- Adjudicator verdicts absorbed
- Any escalations to `/page-code` or `/page-design`
- Any sibling-pattern catches from Stage 4 `/simplify` logged to `memory/feedback_fu_body_verification.md`
- **If the page has interactive UI (forms / modals / tables / drawers):** recommend running `/mobile-audit <page>` before treating accessibility (tap targets, contrast, focus order, viewport) as verified — Stage 5's build check never exercises runtime a11y, and `/mobile-audit` already owns that lens.
- Next step: user invokes `/pre-commit-check` before committing (unless validated-no-action)

**Effectiveness telemetry — append on every completed run.** Via Bash, append ONE JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). One row per `/page-implement` run, regardless of termination state — emit even on validated-no-action / abandon closes (with `files_changed:0` and the matching `outcome`) so the pipeline-health assessment sees every invocation. The monthly assessment aggregates by the `pipeline` tag, so the field names below are the contract — do not rename them.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"page-implement\",\"outcome\":\"<completed|no-op|abandoned>\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>,\"build_pass\":<true|false>,\"files_changed\":<n>,\"revise_cycles\":<0|1>}" >> ~/.claude/metrics.jsonl
```

Field sourcing: `outcome` — `completed` for standard close, `no-op` for validated-no-action, `abandoned` for abandon-and-replan. `keep/ditch/modify` — summed Adjudicator verdict counts from Stage 3 (post-execution critique) plus Stage 7 (pr-review findings) if Stage 7 adjudicated; `0/0/0` if no adjudication ran. `build_pass` — Stage 5 final `npm run build` result (`false` on no-op/abandon closes that never reached a clean build). `files_changed` — count from the Done summary (0 on no-op). `revise_cycles` — the pr-review revise cycles consumed at Stage 7 (`0` or `1`, capped by "max 1 cycle from pr-review").

**Adjudicator-effectiveness telemetry — emit alongside the row above, once per adjudication that ran.** `/page-implement` dispatches the-adjudicator at Stage 3 (post-execution critique) and Stage 7 (pr-review findings, if it ran). The-adjudicator is read-only, so the orchestrator emits on its behalf — one `pipeline:"adjudicator"` row per dispatch with `caller:"page-implement"` and `stage` (`"3"`|`"7"`), matching the other callers (change-heavy / cleanup-light / module-audit / page-design / page-code) so the cross-caller adjudicator stream is complete. Skip only if no adjudication ran (no-op/abandon before Stage 3).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"caller\":\"page-implement\",\"outcome\":\"completed\",\"stage\":\"<3|7>\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
```

---

## Notes for Claude executing this command

- **Scope discipline is mandatory.** Anything beyond the locked plan goes to STACK.md FOLLOW-UPS, not silently into the diff.
- **Mandatory pauses** at Stage 3 (verdicts) and Stage 7 (pr-review verdicts, if findings).
- **Debug folded into Stage 5** — verify isn't "done" until build passes.
- **Max 1 cycle from pr-review** to prevent revise-loop spirals.
- **Pass `model:` on all critic dispatches.**
- **The Adjudicator is `Read, Grep` only.** Don't pass it write tools.
