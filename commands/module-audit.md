---
description: Pre-ship module audit pipeline. 7-stage matrix audit covering form components × 4 lenses + 10 cross-cutting axes + adversarial layer + SHA-anchored verification. Recon freezes one AUDIT_SHA; the Stage 4.5 verifier checks findings against that commit via git show (not HEAD) to catch snapshot incoherence. Use ONLY for module-completion sweeps with ≥3 form components. For single-page work use /page-design or /page-code; for changes meeting the project's Heavy-rigor trigger use /change-heavy; for every other change or FU cleanup use /cleanup-light.
argument-hint: "<module-name> [--components path1,path2,...]"
allowed-tools: Read, Write, Edit, Bash, Agent, Skill
disallowed-tools: AskUserQuestion
---

> **Gates follow `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`.** A programming call is decided and listed in the run's report; only that doc's tier-3 items are the owner's.

# /module-audit

You are running the /module-audit pipeline. **You are the top-level orchestrator** — you dispatch agents (depth-1) via the Agent tool. Subagents cannot fan out further per Stage -1 empirical verdict (locked: `flat-only`).

**Locked architecture:** this command and its agents are the locked design (the architecture, the agent inventory and the cost guards below). Do not deviate from the locked architecture without a new revision.

## Hard pre-conditions (verify before Stage 0)

1. **Agent files present.** Verify these exist at `${CLAUDE_PLUGIN_ROOT}/agents/`:
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

2. **Stage -1 verdict already locked as `flat-only`.** Do NOT re-test nested dispatch — the verdict is recorded here and is environment-stable.

3. **Target module has ≥3 form components.** Determined by Stage 0 recon; if recon returns C<3, the orchestrator halts and redirects to per-page skills (see Stage 0 step 6).

## Inputs

- `$ARGUMENTS` — module name (required, kebab-case). Examples: `billing`, `reports`, `settings`.
- `--components <comma-separated paths>` (optional) — override automatic component discovery

## Process

### Stage 0 — Pre-flight + Reconnaissance

- Ledger mode: !`node "${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs" mode 2>&1 || echo "LEDGER: unavailable"`

1. **Resolve scope.** Parse `$ARGUMENTS`:
   - Module name → infer scope globs `src/app/(app)/<module>/**`, `src/components/<module>/**`, `src/lib/<module>/**`
   - Override with `--components` if provided
2. **Create run directory:**
   ```bash
   mkdir -p docs/audits/_module-audit-runs/<YYYY-MM-DD>-<module>/repro-sketches
   ```
3. **Dispatch `red-line-toolkit:module-recon`** with:
   - subagent_type: `red-line-toolkit:module-recon`
   - prompt: module name, scope globs, output path = `docs/audits/_module-audit-runs/<date>-<module>/scope_manifest.md`
4. **Parse recon return.** Extract:
   - MANIFEST path
   - **AUDIT_SHA** (the frozen commit; carry it through to Stage 4.5)
   - **WORKING_TREE_CLEAN** (true/false)
   - STALE_COMPONENTS count
   - ESTIMATED_DISPATCH_COUNT
   - COHERENCE_WARNING (if any)
5. **Dirty audited paths.** If `WORKING_TREE_CLEAN == false`: lens critics read the working tree but the verifier checks the frozen commit AUDIT_SHA, so uncommitted edits break citation coherence and produce false findings. When the dirty paths are this session's own work, commit them first (through `/pre-commit-check`) and re-run recon. Otherwise halt and report the paths (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): another author's work in progress isn't this run's to commit or stash, and the audit re-runs once it lands.
6. **If STALE_COMPONENTS < 3:** end the run with `outcome: no-op` and recommend `/page-design` + `/page-code` per component in the report (tier 1). A full audit runs anyway only when the owner asks for one.
7. **State the cost and start** (tier 1: a costly run doesn't stop): one line, "~{ESTIMATED_DISPATCH_COUNT} agents over ~{estimated_minutes} min". The dispatch cap under Cost guards still halts.

**Carry `AUDIT_SHA` in orchestrator state for the remainder of the run — it is the coherence anchor passed to the Stage 4.5 verifier.**

### Stage 1 — Parallel audit (1A + 1B in single message)

**Dispatch C × 4 + 10 = (C × 4 + 10) Agent tool calls in ONE message** for true parallelism. For a 4-component module: 26 concurrent dispatches.

**Stage 1A — Per-form-component lens critics** (4 lenses, cap 4 findings each):

For each stale form component × each lens in {`architecture`, `security`, `performance`, `data-integrity`}:
- subagent_type: `red-line-toolkit:module-lens-critic`
- prompt: component path, lens name, manifest path. Reference the agent file rubric.

**Stage 1B — Cross-cut critics** (10 axes):

One Agent call per axis in {`deps`, `bundle`, `types`, `observability`, `migration`, `cost`, `reversibility`, `tier-gating`, `test-coverage`, `a11y-static`}:
- subagent_type: `red-line-toolkit:module-cross-cut-critic`
- prompt: axis name, manifest path. Reference the agent file rubric.

**After all return:**
- Persist all findings to `_module-audit-runs/<date>-<module>/stage_1_findings.md` (markdown with sections per source)
- Apply failure-recovery contract:
  - Per-agent timeout: 4 min. Timed-out agents record `<source> — TIMEOUT — partial findings only`.
  - Per-stage budget: 12 min. Stage-level early-cut flags partial findings.
  - **If >50% of Stage 1A lens-critics time out**: halt and report (a broken tool, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`). A fix plan built on under half the lenses would read as complete.

### Stage 1.5 — Adversarial (parallel in single message after 1A+1B complete)

**Dispatch 3 Agent calls in ONE message:**

1. `red-line-toolkit:module-red-team` — reads `stage_1_findings.md` + manifest; finds ≤5 misses (cross-finding chains, missed lenses, scope creep).
2. `red-line-toolkit:module-steelman` — **MUST-FIX findings only** (not high). Writes one-sentence defense per finding.
3. `red-line-toolkit:module-repro-sketcher` — for severity ≥ high findings with concrete failure mode. Writes test sketches to `_module-audit-runs/<date>-<module>/repro-sketches/`.

**After all return:**
- Persist to `_module-audit-runs/<date>-<module>/stage_1_5_adversarial.md`

### Stage 2 — Synthesis

Dispatch `red-line-toolkit:module-audit-synthesizer`:
- prompt: paths to `stage_1_findings.md`, `stage_1_5_adversarial.md`, `scope_manifest.md`. Output path = `_module-audit-runs/<date>-<module>/synthesized_findings.md`.

Synthesizer dedupes + tags + emits in **adjudicator-canonical CRITICS shape**. Verify the output file starts with `PLAN:` and `CRITICS:` — if not, halt with malformed-input error.

**Record dedup metric:** raw_findings_count / deduped_findings_count = dedup_rate. Target ≥35% (success criterion).

### Stage 3 — Adjudication + dispositions

1. Dispatch `red-line-toolkit:the-adjudicator`:
   - subagent_type: `red-line-toolkit:the-adjudicator`
   - prompt: path to `synthesized_findings.md`. Apply standard KEEP/DITCH/MODIFY rubric with security-asymmetric upgrade.
2. **Record severity-modification metric**: count of `MODIFY` verdicts / total verdicts = modification_rate. Target ≥20% (success criterion).
3. **Dispositions, without asking** (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): every KEEP and MODIFY finding is `fix-now`, pre-existing ones included — the thorough default. A finding whose fix is a design, copy, UX or product call is `owner`: park it per `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking and record its row ID. The ledger-mode rule in Stage 5 covers this write: on a mode line that is none of the three, halt and report it instead. The report lists the dispositions and the ditched findings, so the owner can pull one back.

4. **Adjudicator telemetry — emit on the-adjudicator's behalf.** `the-adjudicator` is `Read, Grep` only and cannot write its own metrics row, so the orchestrator emits it here, right after the verdict block is recorded. Via Bash, append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). `caller` tags this row as a module-audit dispatch so the monthly assessment can separate adjudicator usage by invoking pipeline. `keep/ditch/modify` come straight from the Stage 3 verdict block.

   ```bash
   echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"outcome\":\"completed\",\"caller\":\"module-audit\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
   ```

### Stage 4 — Fix plan generation

**Runs when Stage 3 marked at least one finding `fix-now`;** otherwise go to Stage 5.

Dispatch `red-line-toolkit:module-audit-fix-planner`:
- prompt: adjudicated findings path + the Stage 3 dispositions + scope manifest. Output path = `docs/audits/<YYYY-MM-DD>-<module>-audit-fix-plan.md` (top-level under docs/audits/, not inside `_module-audit-runs/`).

### Stage 4.5 — Verification (runs whenever Stage 4 wrote a fix plan)

Dispatch `red-line-toolkit:module-audit-verifier` with the **frozen AUDIT_SHA**:
- prompt: **AUDIT_SHA** (from Stage 0 orchestrator state) + synthesized findings path + manifest path + sample size 10.
- The verifier runs `git show AUDIT_SHA:<file>` for each finding — NOT HEAD.
- Verifier stratifies: all must-fix + N from high/medium/low; runs the line-range pre-filter (`cited_line ≤ file_length_at_SHA`) first.

**Parse BOTH rates from verifier output:**

- **If VERIFICATION_RATE ≥ 80% AND SNAPSHOT_MISMATCH_RATE < 5%**: proceed silently to Stage 5. Note both rates in done summary.
- **If VERIFICATION_RATE 60-80% OR SNAPSHOT_MISMATCH_RATE 5-20%**: filter without asking (tier 1): drop the HALLUCINATED and SNAPSHOT_MISMATCH findings, re-dispatch `red-line-toolkit:module-audit-fix-planner` with the filtered set, and list the dropped findings and the PARTIALs in the report.
- **If VERIFICATION_RATE < 60% OR SNAPSHOT_MISMATCH_RATE > 20%**: HALT. Do NOT present the fix plan as actionable. Surface the verifier report directly:
  > Below the rev-4 trust floor. A high snapshot-mismatch rate specifically means recon froze the wrong SHA or the working tree drifted mid-run — re-run from Stage 0 on a clean tree. A high hallucination rate means critic prompts need tightening. Do not act on the fix plan until re-verified.

### Stage 5 — Done summary

Report metrics against success criteria from plan frontmatter:

```
PIPELINE: /module-audit
MODULE: <name>
AUDIT_SHA: <short>
RUN_DIR: docs/audits/_module-audit-runs/<date>-<module>/

DISPATCH COUNTS:
  Recon:        1
  Stage 1A:     <C × 4>
  Stage 1B:     10
  Stage 1.5:    3
  Stage 2:      1 (synthesizer)
  Stage 3:      1 (adjudicator)
  Stage 4:      <0 or 1> (fix planner — 0 when nothing was fix-now)
  Stage 4.5:    1 (verifier)
  TOTAL:        <sum>

WALL TIME: <duration>

SUCCESS CRITERIA (vs plan frontmatter):
  Synthesizer dedup rate:    <rate>%  (target ≥35%)  <PASS|FAIL>
  Adjudicator modification:  <rate>%  (target ≥20%)  <PASS|FAIL>
  Verifier verification:     <rate>%  (target ≥80%)  <PASS|FAIL>
  Verifier snapshot-mismatch:<rate>%  (target <5%)   <PASS|FAIL>
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
  Fix plan:             <docs/audits/...-fix-plan.md, or none>
  Repro sketches:       <count> in _module-audit-runs/<date>-<module>/repro-sketches/

WAITING ON OWNER: <the findings Stage 3 parked, with their row IDs | none>
```

Migrated projects (`LEDGER: migrated`): file and close FUs per `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs; if the mode line starts with none of `LEDGER: migrated`, `LEDGER: not migrated` or `LEDGER: not a stack project` (for example `LEDGER: unavailable` or `LEDGER ERROR`), halt and report it before touching FU rows.

**Effectiveness telemetry — append on every completed run.** After the done summary is reported, via Bash append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). Over weeks this is the data that reveals whether the audit's verification floor is catching real defects vs. surfacing noise. `outcome` is `completed` for a full run that produced verified findings, `no-op` if the run early-exited (Stage 0 redirect to per-page skills, a halt, or Stage 4.5 HALT below the trust floor). The finding counts (`high/medium/low`, `must_fix`) come from the Stage 3 adjudicated set; `verified_rate` is the Stage 4.5 VERIFICATION_RATE; `false_positives` is the count of findings the Stage 4.5 verifier dropped (HALLUCINATED + SNAPSHOT_MISMATCH); `owner_parked` counts the `owner decision` rows Stage 3 parked (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"module-audit\",\"outcome\":\"<completed|no-op>\",\"high\":<h>,\"medium\":<m>,\"low\":<l>,\"must_fix\":<mf>,\"verified_rate\":<0.0-1.0>,\"false_positives\":<fp>,\"owner_parked\":<n>}" >> ~/.claude/metrics.jsonl
```

If the run never reached Stage 4.5 (early-exit/no-op), emit with `outcome:"no-op"` and set `verified_rate` + `false_positives` to `0` and the finding counts to whatever Stage 3 produced (or `0` if it never adjudicated). The adjudicator row (Stage 3) is emitted separately on the-adjudicator's behalf and is independent of this row.

## Failure handling

| Failure mode | Response |
|---|---|
| Agent file missing pre-flight | Halt with clear "Required agent missing" message |
| Stage 0 recon timeout | Halt — pipeline cannot proceed without manifest |
| Stage 0 returns C<3 components | End with `outcome: no-op`; recommend /page-design + /page-code per component |
| Audited paths dirty with another author's work | Halt and report the paths |
| Stage 1A single agent timeout | Record `TIMEOUT — partial findings only` and continue |
| Stage 1A >50% timeout | Halt and report |
| Stage 1B axis returns N/A (e.g., migration on no-migrations module) | Accept; not counted as a finding |
| Synthesizer output not in canonical shape | Halt with malformed-input error |
| Adjudicator overwhelmed (>70% KEEP rate of input) | Flag in done summary; proceed but warn synthesizer dedup likely failed |
| Verifier rate <60% | HALT — do NOT present fix plan |
| Any halt | Exit cleanly; preserve all run artifacts for re-entry |

## Cost guards

- Hard agent dispatch cap: >75 → halt with "Scope too large — split module"
- Per-agent timeout: 4 min
- Per-stage timeout: Stage 1 = 12 min; others = 6 min
- Token budget per stage: 150k input + 50k output. Halt and report if exceeded.
- Repro-sketcher scope: severity ≥ high only

## When NOT to use /module-audit

- **<3 form components / heavy components** — use `/page-design` / `/page-code` per page
- **Single-page or single-component work** — use `/page-design` directly
- **A change to shipped code** — use `/change-heavy` when it meets the project's Heavy-rigor trigger, `/cleanup-light` otherwise, at any file count
- **FU cleanup from STACK.md** — use `/cleanup-light` (one or more FUs, or a group step), unless an FU meets the Heavy-rigor trigger
- **Pre-launch hygiene that needs runtime testing** — use `/mobile-audit` for mobile or pair this audit with manual smoke testing

## Hard constraints

- A full audit spends dozens of agent runs: Stage 0 states the estimate and starts, and the dispatch cap halts.
- Stage 3 marks every KEEP and MODIFY finding `fix-now`; only a design, copy, UX or product finding waits for the owner, parked as an owner decision.
- Stage 4.5 verification runs whenever Stage 4 produced a fix plan.
- The orchestrator doesn't modify `src/`: sub-agents are read-only by tools config. The write products are the fix plan and any owner decision Stage 3 parked in `Standing-FUs.md`; the next `/end-session` commits them.
- Dispatch only the locked agent inventory; a finding that needs a new agent type sends the plan back for revision.
