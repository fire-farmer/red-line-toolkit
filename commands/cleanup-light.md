---
description: Light pipeline for single-FU cleanup from STACK.md backlog. Scoped to 1-2 files. Runs scope + code-reviewer critics (always) plus security + simplifier critics (conditional), adjudicates with security-asymmetric upgrade, verifies, marks FU complete. Auto-surfaces escalation to /change-heavy if scope blows up.
argument-hint: [optional <fu-id> — else interactive picker]
allowed-tools: Read, Edit, Write, Bash, Task, AskUserQuestion, Skill, SlashCommand
---

# /cleanup-light

You are running the **/cleanup-light pipeline** — light critique pipeline for single-FU cleanup from STACK.md. Critique discipline is preserved; **scope is the only thing that's lighter**. The user invoked this to clear a specific FU from the backlog.

User's invocation argument (optional fu-id): **$ARGUMENTS**

---

## Stage 1 — Pick FU + load context + pre-flight gate

Read `STACK.md` and locate the FOLLOW-UPS section.

**Pick the FU:**
- If `$ARGUMENTS` contains an FU identifier (e.g., an `{anchor:}` file, `home:` address, `FU-<n>` ID, or legacy file:line / cluster tag): locate that specific FU in STACK.md.
- If no arg: enumerate all open FUs with description + severity + `home:` address + anchor file (legacy rows: file:line + cluster tag). Use `AskUserQuestion`:
  - **Question:** *"Which FU to clean up?"*
  - **Options:** dynamically generated from the open FUs (top 4 by severity, or alphabetical if all same severity)

If the requested FU isn't in STACK.md, surface to user and exit.

**Load context:**
- Surface the FU's original observation (description, anchor or file:line, when flagged, why flagged)
- Read the affected file(s) at the noted line(s)
- Check git log for changes to those files since the FU was flagged — note if surrounding code has shifted
- State the minimal scope of the fix

**Pre-flight gate (cheatsheet §5):**
1. **Rigor check:** Is this genuinely light rigor — 1-2 files, no new abstractions? If 3+ files OR new abstraction surface (heavy rigor), **surface to user:** *"This FU looks like /change-heavy territory. Continue with /cleanup-light anyway, or escalate?"*
2. **Risk surface check:** Does this touch RLS / auth / Stripe / exports / financial calc? If yes, mark security-asymmetric upgrade as active for Stage 4 and prepare to invoke `/security-review` in Stage 3.
3. **Existing-primitive check:** Note any primitive families the fix might touch — flag if creating new when reuse fits.

### Stage 1.5 — FU body verification (mandatory, scope-proportionate)

FU bodies age out. Before proceeding to Stage 2, empirically verify **the explicit claims in the FU body** — no wider pattern sweep (that's `/change-heavy`'s job).

- **Caller counts cited:** `grep -rn` the cited selector/identifier. Compare to FU's stated count.
- **File paths cited:** Confirm the cited file actually contains the construct described — if the row carries an `{anchor:}`, its pattern must still match (`npm run verify:fus` checks the whole backlog).
- **"Single-user" / "N-only" claims:** Exhaustive grep — including alternate construction patterns (template literals, `classnames()`, dynamic class composition).
- **"May cascade" / scope-hedging framings:** Read every callsite of the **specific** selector/identifier cited — not every conceivably related file.

If any claim is wrong, output a **"Stage 1.5 audit results"** block visibly to the user with corrected facts BEFORE writing tasks. Do not silently absorb.

If verification surfaces gaps so severe that the FU's premise is wrong (e.g., "single-user" turns out to be 20 callers), STOP and use `AskUserQuestion`:
- **Question:** *"Stage 1.5 verification invalidated the FU body's framing. How to proceed?"*
- **Options:**
  - `Validated-no-action close` → close FU with rationale; surface adjacent observations as new STACK FUs
  - `Escalate to /change-heavy` → wider scope warrants full pipeline
  - `Continue with corrected scope` → proceed to Stage 2 with revised understanding

Anchored in `memory/feedback_fu_body_verification.md`.

---

## Stage 2 — Implement

Make the change. Minimal scope. **No "while I'm here" cleanup** — anything noticed but not in scope goes to a new FOLLOW-UPS entry in STACK.md, not silently into the diff.

**Scope-blow-up guard:** If the implementation exceeds 1-2 files or requires a new abstraction, STOP and surface:

> *"Implementation exceeded the 1-2 file scope. Continue here, or escalate to /change-heavy?"*

User decides — do not auto-escalate.

---

## Stage 3 — Light critique (parallel)

Dispatch critics in parallel via Task tool — **single message, multiple tool calls**. Pass `model:` matching the orchestrator's current model family on all dispatches.

**Always run:**

- **Critic 3a — scope critic (general-purpose):**
  > *"Review this implementation diff for scope discipline. The FU described: [paste FU description]. Files changed: [list from `git diff --name-only HEAD`]. Question: does every changed line trace directly to the FU's scope? Flag any changes that look like 'while I was here' cleanup, refactoring beyond the FU, or new abstractions not warranted by the FU. Output: `file:line — severity — issue — recommendation`."*

- **Critic 3b — `pr-review-toolkit:code-reviewer`:**
  > *"Review this implementation for bugs, logic errors, conventions, and quality issues. Confidence-based filtering — only report high-priority issues. Files changed: [list]. Output: `file:line — severity — issue — recommendation`."*

**Conditional (run only if engaged at Stage 1 pre-flight):**

- **Critic 3c — `/security-review`** (if risk surface engaged at Stage 1 *or* the Stage 2 diff touches a risk path):
  > Stage 1 predicts the risk surface before implementation, so re-check against the actual change — `git diff --name-only HEAD` intersected with the risk paths (`src/app/api/**`, `**/auth/**`, `**/stripe/**`, `**/billing/**`, export routes). If the Stage 1 flag is set OR that intersection is non-empty, invoke `/security-review` via the SlashCommand tool on the current branch's staged + unstaged changes. Capture output as Critic 3c's findings.

- **Critic 3d — simplifier critic** (only if diff > 5 lines):
  > *"Review this implementation for dead code, redundant checks, over-abstraction, defensive checks for impossible conditions, comments that restate code, orphaned imports/exports. Files changed: [list]. Output: `file:line — severity — issue — recommendation`."*

Collect all critic outputs into a structured block for the Adjudicator.

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
- If pass: continue to Stage 6.
- If fail: invoke `superpowers:systematic-debugging` skill to find root cause, fix, re-verify. Loop within Stage 5 until clean.

Verify lint count preserved or improved (per CLAUDE.md).

---

## Stage 6 — Mark FU complete in STACK.md

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

1. **Stage the scoped files explicitly.** Run `git diff --name-only HEAD` to enumerate touched files (should be the 1–2 in-scope files plus STACK.md). Stage with `git add <file> [<file>...]` — **do NOT use `git add -A`** (CLAUDE.md staging rule: avoid accidentally including `.env`, credentials, large binaries).
2. **Invoke `/pre-commit-check`** via the SlashCommand tool with no arguments. Staged mode auto-infers the task from this conversation + STACK.md context.
3. **Present its output verbatim.** `/pre-commit-check` runs three checks (commit-body truth, scope discipline, follow-up discipline) and has its own `AskUserQuestion` pause when findings are detected — let it run; do not re-render or summarize.

User commits (or revises) based on `/pre-commit-check`'s verdict. The pipeline does NOT commit on the user's behalf — final commit authority stays with the user per CLAUDE.md *"Only create commits when requested."*

---

## Done — three valid termination states

1. **Standard close** — code changes ship, FU marked RESOLVED.
2. **Validated-no-action close** — Stage 1.5 verification invalidated the FU body's framing; close with rationale + adjacent observations (new STACK FUs).
3. **Abandon-and-replan** — Stage 3/5 surfaces gaps too severe to absorb in revision; flip frontmatter to `status: abandoned` and surface to user for re-scoping.

Summarize which state applies, plus:
- FU cleared (home/anchor + description) — or rationale for non-action close
- Files changed (count + list) — zero if validated-no-action
- Stage 4 Adjudicator verdict counts: **KEEP: N / DITCH: N / MODIFY: N** with disposition (absorbed into revision / dismissed) and any MISSED items the Adjudicator flagged
- Build / lint status (npm run build pass/fail; lint count delta vs baseline)
- STACK.md update status (FU moved to completed log / left open / revised — and any new FUs added during the cycle)
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

- **Scope discipline is paramount.** FU cleanup is the highest-risk surface for scope creep. The scope critic at Stage 3 is the load-bearing addition.
- **Two mandatory pauses** at Stage 4 (verdict acceptance) and Stage 6 (mark-complete confirmation).
- **No auto-escalation.** If scope blows up at Stage 2, surface and let user decide whether to continue or kick to `/change-heavy`.
- **Conditional critics save tokens** — security/simplifier only run when their lens applies.
- **Pass `model:` on all critic dispatches** so they run at orchestrator level.
- **The Adjudicator is `Read, Grep` only.** Don't pass it write tools.
- **STACK.md edits are surgical.** Use Edit tool to move the FU entry, not Write (don't rewrite the whole file).
- **Stage 7 is not optional except for validated-no-action close.** The pre-commit audit is the pipeline's truth-and-scope gate. Skipping it (e.g., "the diff looks fine, I'll let the user commit") regresses the pipeline to the pre-v2 manual-handoff state.
- **Stage 7 never auto-commits.** Final commit authority stays with the user per CLAUDE.md *"Only create commits when requested."* The audit just stages + reports; the user runs `git commit`.
