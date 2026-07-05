---
description: Pre-ship module audit pipeline (rev 4). 7-stage matrix audit covering form components × 4 lenses + 10 cross-cutting axes + adversarial layer + SHA-anchored verification. Recon freezes one AUDIT_SHA; the Stage 4.5 verifier checks findings against that commit via git show (not HEAD) to catch snapshot incoherence. Use ONLY for module-completion sweeps with ≥3 form components. For single-page work use /page-design or /page-code; for refactors use /change-heavy; for FU cleanup use /cleanup-light.
argument-hint: <module-name> [--components path1,path2,...] [--skip-cost-prompt]
allowed-tools: Read, Write, Edit, Bash, Agent
---

# /module-audit (revision 3)

You are running the /module-audit pipeline. **You are the top-level orchestrator** — you dispatch agents (depth-1) via the Agent tool. Subagents cannot fan out further per Stage -1 empirical verdict (locked: `flat-only`).

**Locked plan:** `docs/plans/2026-05-18-module-audit-pipeline.md` revision 3. Reference Sections 3 (Architecture), 4 (Agent inventory), 7 (Cost guards). Do not deviate from the locked architecture without a new plan revision.

## Hard pre-conditions (verify before Stage 0)

1. **Agent files present.** Verify these exist at `~/.claude/agents/`:
   - `module-recon.md`
   - `module-lens-critic.md`
   - `module-cross-cut-critic.md`
   - `module-red-team.md`
   - `module-steelman.md`
   - `module-repro-sketcher.md`
   - `module-audit-synthesizer.md`
   - `module-audit-fix-planner.md`
   - `module-audit-verifier.md`
   - `the-adjudicator.md` (reused — must exist already)

   If any missing: halt with "Required agent missing: <name>. Pipeline cannot proceed."

2. **Stage -1 verdict already locked as `flat-only`.** Do NOT re-test nested dispatch — the verdict is recorded in the plan doc Section 3 and is environment-stable.

3. **Target module has ≥3 form components.** Determined by Stage 0 recon; if recon returns C<3, the orchestrator halts and redirects to per-page skills (see Stage 0 step 5).

## Inputs

- `$ARGUMENTS` — module name (required, kebab-case). Examples: `billing`, `reports`, `settings`.
- `--components <comma-separated paths>` (optional) — override automatic component discovery
- `--skip-cost-prompt` (optional) — bypass the Stage 0 cost-confirmation AskUserQuestion (for automated runs only; use with caution)

## Process

### Stage 0 — Pre-flight + Reconnaissance

1. **Resolve scope.** Parse `$ARGUMENTS`:
   - Module name → infer scope globs `src/app/(app)/<module>/**`, `src/components/<module>/**`, `src/lib/<module>/**`
   - Override with `--components` if provided
2. **Create run directory:**
   ```bash
   mkdir -p docs/audits/_module-audit-runs/<YYYY-MM-DD>-<module>/repro-sketches
   ```
3. **Dispatch `module-recon`** with:
   - subagent_type: `module-recon`
   - prompt: module name, scope globs, output path = `docs/audits/_module-audit-runs/<date>-<module>/scope_manifest.md`
4. **Parse recon return.** Extract:
   - MANIFEST path
   - **AUDIT_SHA** (NEW rev 4 — the frozen commit; carry it through to Stage 4.5)
   - **WORKING_TREE_CLEAN** (NEW rev 4 — true/false)
   - STALE_COMPONENTS count
   - ESTIMATED_DISPATCH_COUNT
   - COHERENCE_WARNING (if any)
5. **Dirty-tree gate (NEW rev 4).** If `WORKING_TREE_CLEAN == false`, present this AskUserQuestion:
   - Question: "Audited paths have uncommitted changes. Lens critics read the working tree but the verifier checks the frozen commit AUDIT_SHA — uncommitted edits break citation coherence (this is the exact failure mode that produced 3 false findings in an earlier trial run). How to proceed?"
   - Options: `Commit/stash first then re-run recon (Recommended)` | `Proceed — verifier will check working tree, coherence degraded` | `Cancel`
   - If `Commit/stash`: exit cleanly with instruction to commit or `git stash`, then re-invoke. Do NOT proceed on a dirty tree by default.
   - If `Proceed`: record `coherence: degraded` for the run; the verifier will be told to read the working tree, not AUDIT_SHA.
6. **If STALE_COMPONENTS < 3:** halt and present this AskUserQuestion:
   - Question: "Module has only N stale components (<3 threshold). Use per-page skills instead?"
   - Options: `Use /page-design + /page-code per component (Recommended)` | `Force full audit anyway` | `Cancel`
   - If user picks force-full: proceed to step 7.
7. **Cost-confirmation gate (skip if `--skip-cost-prompt`):**
   - AskUserQuestion:
     - Question: "Module audit will dispatch ~{ESTIMATED_DISPATCH_COUNT} agents over ~{estimated_minutes} min. Proceed?"
     - Options: `Proceed` | `Trim scope (interactive)` | `Cancel`
   - If `Trim scope`: present component list, let user uncheck; recompute dispatch count.
   - If `Cancel`: exit cleanly.

**Carry `AUDIT_SHA` in orchestrator state for the remainder of the run — it is the coherence anchor passed to the Stage 4.5 verifier.**

### Stage 1 — Parallel audit (1A + 1B in single message)

**Dispatch C × 4 + 10 = (C × 4 + 10) Agent tool calls in ONE message** for true parallelism. For a 4-component module: 26 concurrent dispatches.

**Stage 1A — Per-form-component lens critics** (rev 3: 4 lenses, cap 4 findings each):

For each stale form component × each lens in {`architecture`, `security`, `performance`, `data-integrity`}:
- subagent_type: `module-lens-critic`
- prompt: component path, lens name, manifest path. Reference the agent file rubric.

**Stage 1B — Cross-cut critics** (rev 3: 10 axes):

One Agent call per axis in {`deps`, `bundle`, `types`, `observability`, `migration`, `cost`, `reversibility`, `tier-gating`, `test-coverage`, `a11y-static`}:
- subagent_type: `module-cross-cut-critic`
- prompt: axis name, manifest path. Reference the agent file rubric.

**After all return:**
- Persist all findings to `_module-audit-runs/<date>-<module>/stage_1_findings.md` (markdown with sections per source)
- Apply failure-recovery contract:
  - Per-agent timeout: 4 min. Timed-out agents record `<source> — TIMEOUT — partial findings only`.
  - Per-stage budget: 12 min. Stage-level early-cut flags partial findings.
  - **If >50% of Stage 1A lens-critics time out**: halt with AskUserQuestion `Continue with partial findings? | Halt pipeline`.

### Stage 1.5 — Adversarial (parallel in single message after 1A+1B complete)

**Dispatch 3 Agent calls in ONE message:**

1. `module-red-team` — reads `stage_1_findings.md` + manifest; finds ≤5 misses (cross-finding chains, missed lenses, scope creep).
2. `module-steelman` — **rev 3 scope: MUST-FIX findings ONLY** (not must-fix + high). Writes one-sentence defense per finding.
3. `module-repro-sketcher` — for severity ≥ high findings with concrete failure mode. Writes test sketches to `_module-audit-runs/<date>-<module>/repro-sketches/`.

**After all return:**
- Persist to `_module-audit-runs/<date>-<module>/stage_1_5_adversarial.md`

### Stage 2 — Synthesis

Dispatch `module-audit-synthesizer`:
- prompt: paths to `stage_1_findings.md`, `stage_1_5_adversarial.md`, `scope_manifest.md`. Output path = `_module-audit-runs/<date>-<module>/synthesized_findings.md`.

Synthesizer dedupes + tags + emits in **adjudicator-canonical CRITICS shape**. Verify the output file starts with `PLAN:` and `CRITICS:` — if not, halt with malformed-input error.

**Record dedup metric:** raw_findings_count / deduped_findings_count = dedup_rate. Target ≥35% (success criterion).

### Stage 3 — Adjudication + mandatory user checkpoint

1. Dispatch `the-adjudicator`:
   - subagent_type: `the-adjudicator`
   - prompt: path to `synthesized_findings.md`. Apply standard KEEP/DITCH/MODIFY rubric with security-asymmetric upgrade.
2. **Record severity-modification metric**: count of `MODIFY` verdicts / total verdicts = modification_rate. Target ≥20% (success criterion).
3. **Mandatory AskUserQuestion** (per `feedback_pipeline_checkpoints.md` — non-skippable):
   - Question: "Adjudicated {N} findings ({must-fix} must-fix, {high} high, {medium} medium, {low} low). Which to absorb into Stage 4 fix plan?"
   - Options:
     - `Must-fix + high only (Recommended)` — pragmatic scope
     - `Must-fix only` — minimum viable
     - `Absorb all KEEP + MODIFY` — exhaustive
     - `List specific finding IDs` — surgical
     - `Skip Stage 4 — export findings only` — when user wants raw output without fix plan
4. **STACK.md routing question** (only if user picked Must-fix+high or smaller absorption):
   - Question: "Route deferred findings (the non-absorbed) to STACK.md FOLLOW-UPS?"
   - Options: `Yes — append to STACK.md` | `No — keep findings in audit run dir only`

5. **Adjudicator telemetry — emit on the-adjudicator's behalf.** `the-adjudicator` is `Read, Grep` only and cannot write its own metrics row, so the orchestrator emits it here, right after the verdict block is recorded. Via Bash, append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). `caller` tags this row as a module-audit dispatch so the monthly assessment can separate adjudicator usage by invoking pipeline. `keep/ditch/modify` come straight from the Stage 3 verdict block.

   ```bash
   echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"outcome\":\"completed\",\"caller\":\"module-audit\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
   ```

### Stage 4 — Fix plan generation

**Only run if user absorbed ≥1 finding at Stage 3.** If user picked `Skip Stage 4`, jump to Stage 4.5.

Dispatch `module-audit-fix-planner`:
- prompt: adjudicated findings path + user dispositions + scope manifest. Output path = `docs/audits/<YYYY-MM-DD>-<module>-audit-fix-plan.md` (top-level under docs/audits/, not inside `_module-audit-runs/`, unless user opted-out of STACK in Stage 3 — then output to `_module-audit-runs/<date>-<module>/audit-fix-plan.md`).

### Stage 4.5 — Verification (rev 4 — mandatory unless user skipped Stage 4)

Dispatch `module-audit-verifier` with the **frozen AUDIT_SHA** (rev 4 — critical):
- prompt: **AUDIT_SHA** (from Stage 0 orchestrator state) + synthesized findings path + manifest path + sample size 10.
- The verifier runs `git show AUDIT_SHA:<file>` for each finding — NOT HEAD. If the run was marked `coherence: degraded` (dirty tree, user chose Proceed), tell the verifier to read the working tree instead and flag degraded coherence.
- Verifier stratifies: all must-fix + N from high/medium/low; runs the line-range pre-filter (`cited_line ≤ file_length_at_SHA`) first.

**Parse BOTH rates from verifier output** (rev 4 adds snapshot-mismatch):

- **If VERIFICATION_RATE ≥ 80% AND SNAPSHOT_MISMATCH_RATE < 5%**: proceed silently to Stage 5. Note both rates in done summary.
- **If VERIFICATION_RATE 60-80% OR SNAPSHOT_MISMATCH_RATE 5-20%**: present this AskUserQuestion:
  - Question: "Verification {vrate}%, snapshot-mismatch {srate}%. {N} HALLUCINATED, {S} SNAPSHOT_MISMATCH, {M} PARTIAL. Filter untrustworthy findings from the fix plan?"
  - Options: `Filter mismatches + hallucinations` | `Keep all findings` | `Halt and re-run from Stage 0`
  - If `Filter`: re-dispatch `module-audit-fix-planner` with the filtered set.
- **If VERIFICATION_RATE < 60% OR SNAPSHOT_MISMATCH_RATE > 20%**: HALT. Do NOT present the fix plan as actionable. Surface the verifier report directly:
  > Below the rev-4 trust floor. A high snapshot-mismatch rate specifically means recon froze the wrong SHA or the working tree drifted mid-run — re-run from Stage 0 on a clean tree. A high hallucination rate means critic prompts need tightening. Do not act on the fix plan until re-verified.

### Stage 5 — Done summary

Report metrics against success criteria from plan frontmatter:

```
PIPELINE: /module-audit rev 4
MODULE: <name>
AUDIT_SHA: <short> (working tree: <clean|degraded>)
RUN_DIR: docs/audits/_module-audit-runs/<date>-<module>/

DISPATCH COUNTS:
  Recon:        1
  Stage 1A:     <C × 4>
  Stage 1B:     10
  Stage 1.5:    3
  Stage 2:      1 (synthesizer)
  Stage 3:      1 (adjudicator)
  Stage 4:      <0 or 1> (fix planner — depends on user choice)
  Stage 4.5:    1 (verifier)
  TOTAL:        <sum>

WALL TIME: <duration>

SUCCESS CRITERIA (vs plan frontmatter):
  Synthesizer dedup rate:    <rate>%  (target ≥35%)  <PASS|FAIL>
  Adjudicator modification:  <rate>%  (target ≥20%)  <PASS|FAIL>
  Verifier verification:     <rate>%  (target ≥80%)  <PASS|FAIL>
  Verifier snapshot-mismatch:<rate>%  (target <5%)   <PASS|FAIL>   # rev 4
  Wall time:                 <min>    (target ≤25)   <PASS|FAIL>
  Findings absorbed:         <count>  (target ≥1)    <PASS|FAIL>
  ≥1 finding human missed:   <yes|no> (target yes)   <PASS|FAIL>

FAILURE FLAGS:
  Synthesizer dedup <20%:    <NO|YES — critics generating non-overlapping noise>
  Adjudicator modify <10%:   <NO|YES — steelman not catching inflation>
  Verifier rate <60%:        <NO|YES — pipeline halted at Stage 4.5>
  Snapshot-mismatch >20%:    <NO|YES — recon froze wrong SHA / tree drifted; rev-4 halt>
  Wall time >40 min:         <NO|YES>

ARTIFACTS:
  Scope manifest:       _module-audit-runs/<date>-<module>/scope_manifest.md
  Stage 1 findings:     _module-audit-runs/<date>-<module>/stage_1_findings.md
  Stage 1.5 adversarial: _module-audit-runs/<date>-<module>/stage_1_5_adversarial.md
  Synthesized findings: _module-audit-runs/<date>-<module>/synthesized_findings.md
  Verifier report:      _module-audit-runs/<date>-<module>/verifier_report.md
  Fix plan:             <docs/audits/...-fix-plan.md OR _module-audit-runs/.../audit-fix-plan.md>
  Repro sketches:       <count> in _module-audit-runs/<date>-<module>/repro-sketches/

STACK ROUTING: <Findings routed to STACK.md FOLLOW-UPS | Kept in audit run dir only (per user opt-out)>
```

If user opted to route deferred findings to STACK.md (Stage 3 question 2), append them now to STACK.md FOLLOW-UPS section with `<file:line> — <severity> — <issue> — (from /module-audit <date>-<module>)`.

**Effectiveness telemetry — append on every completed run.** After the done summary is reported, via Bash append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). Over weeks this is the data that reveals whether the audit's verification floor is catching real defects vs. surfacing noise. `outcome` is `completed` for a full run that produced verified findings, `no-op` if the run early-exited (Stage 0 redirect to per-page skills, user Cancel, or Stage 4.5 HALT below the trust floor). The finding counts (`high/medium/low`, `must_fix`) come from the Stage 3 adjudicated set; `verified_rate` is the Stage 4.5 VERIFICATION_RATE; `false_positives` is the count of findings the Stage 4.5 verifier dropped (HALLUCINATED + SNAPSHOT_MISMATCH).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"module-audit\",\"outcome\":\"<completed|no-op>\",\"high\":<h>,\"medium\":<m>,\"low\":<l>,\"must_fix\":<mf>,\"verified_rate\":<0.0-1.0>,\"false_positives\":<fp>}" >> ~/.claude/metrics.jsonl
```

If the run never reached Stage 4.5 (early-exit/no-op), emit with `outcome:"no-op"` and set `verified_rate` + `false_positives` to `0` and the finding counts to whatever Stage 3 produced (or `0` if it never adjudicated). The adjudicator row (Stage 3) is emitted separately on the-adjudicator's behalf and is independent of this row.

## Failure handling

| Failure mode | Response |
|---|---|
| Agent file missing pre-flight | Halt with clear "Required agent missing" message |
| Stage 0 recon timeout | Halt — pipeline cannot proceed without manifest |
| Stage 0 returns C<3 components | AskUserQuestion: redirect to /page-design or force-full |
| Stage 1A single agent timeout | Record `TIMEOUT — partial findings only` and continue |
| Stage 1A >50% timeout | AskUserQuestion: continue partial or halt |
| Stage 1B axis returns N/A (e.g., migration on no-migrations module) | Accept; not counted as a finding |
| Synthesizer output not in canonical shape | Halt with malformed-input error |
| Adjudicator overwhelmed (>70% KEEP rate of input) | Flag in done summary; proceed but warn synthesizer dedup likely failed |
| Verifier rate <60% | HALT — do NOT present fix plan |
| User picks Cancel at any AskUserQuestion | Exit cleanly; preserve all run artifacts for re-entry |

## Cost guards (from plan Section 7)

- Hard agent dispatch cap: >75 → halt with "Scope too large — split module"
- Per-agent timeout: 4 min
- Per-stage timeout: Stage 1 = 12 min; others = 6 min
- Token budget per stage: 150k input + 50k output. Halt if exceeded; surface user prompt.
- Repro-sketcher scope: severity ≥ high only

## When NOT to use /module-audit

- **<3 form components / heavy components** — use `/page-design` / `/page-code` per page
- **Single-page or single-component work** — use `/page-design` directly
- **Refactor of shipped code** — use `/change-heavy`
- **Single FU cleanup from STACK.md** — use `/cleanup-light`
- **Pre-launch hygiene that needs runtime testing** — use `/mobile-audit` for mobile or pair this audit with manual smoke testing

## Hard constraints

- **NEVER skip the Stage 0 cost-confirmation prompt** unless `--skip-cost-prompt` is explicitly passed
- **NEVER skip the Stage 3 user checkpoint** — the project's `feedback_pipeline_checkpoints.md` makes this non-negotiable
- **NEVER skip Stage 4.5 verification** unless user opted-out of Stage 4 (no fix plan = nothing to verify)
- **NEVER auto-append to STACK.md** without explicit user consent at Stage 3
- **NEVER modify src/** code from the orchestrator — sub-agents are read-only by tools config; the fix plan is the only write product
- **NEVER dispatch agents beyond the locked agent inventory** — if a finding requires a new agent type, halt and revise the plan first
