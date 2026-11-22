---
description: Pre-ship module audit pipeline. A run of the module's browser specs, a matrix audit covering form components × 4 lenses + 10 cross-cutting axes, an adversarial layer with a decorrelated Fable miss hunt, and SHA-anchored verification beside a Fable fix-plan critique. Recon freezes one AUDIT_SHA; the Stage 4.5 verifier checks findings against that commit via git show (not HEAD) to catch snapshot incoherence. Use ONLY for module-completion sweeps with ≥3 form components. For single-page work use /page-design, then /cleanup-light to build from its locked design; for changes meeting the project's Heavy-rigor trigger use /change-heavy; for every other change or FU cleanup use /cleanup-light.
argument-hint: "<module-name> [--components path1,path2,...]"
allowed-tools: Read, Write, Edit, Bash, Agent
disallowed-tools: AskUserQuestion
---

> **Gates follow `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`.** A programming call is decided and listed in the run's report; only that doc's tier-3 items are the owner's.

# /module-audit

You are running the /module-audit pipeline. **You are the top-level orchestrator** — you dispatch agents (depth-1) via the Agent tool. Subagents cannot fan out further per Stage -1 empirical verdict (locked: `flat-only`).

**Live spec:** this command and its agents are the module audit's design: the architecture, the agent inventory and the cost guards below. A change lands here and in its commit, not in a separate plan revision.

## Hard pre-conditions (verify before Stage 0)

1. **Agent files present.** Verify these exist at `${CLAUDE_PLUGIN_ROOT}/agents/`:
   - `module-recon.md`
   - `module-lens-critic.md`
   - `module-cross-cut-critic.md`
   - `module-red-team.md`
   - `module-steelman.md`
   - `module-audit-synthesizer.md`
   - `module-audit-fix-planner.md`
   - `module-audit-verifier.md`
   - `the-adjudicator.md` (reused — must exist already)
   - `fable-seat.md` (reused, for the two Fable seats)

   If any missing: halt with "Required agent missing: <name>. Pipeline cannot proceed."

2. **Stage -1 verdict already locked as `flat-only`.** Do NOT re-test nested dispatch — the verdict is recorded here and is environment-stable.

3. **Target module has ≥3 form components.** Determined by Stage 0 recon; if recon returns C<3, the orchestrator halts and redirects to per-page skills (see Stage 0 step 6).

## Inputs

- `$ARGUMENTS` — module name (required, kebab-case). Examples: `billing`, `reports`, `settings`.
- `--components <comma-separated paths>` (optional) — override automatic component discovery

## Process

### Stage 0 — Pre-flight + Reconnaissance

- Ledger mode: !`node "${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs" mode 2>&1 || echo "LEDGER: unavailable"`

**Before the first dispatch,** state in one line the effort each stage's agents run at (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Models and effort: the lens and cross-cut critics, the red team, the steelman, the Adjudicator, the fix planner and the two Fable seats are review seats; recon, the synthesizer, the verifier and a step 5 pre-commit subagent do well-specified work), and pass each level as the Agent tool's `effort` on every dispatch. Record `date +%s` then, and again as each stage starts and ends: the wall-time target and the stage budgets are read from these stamps.

1. **Resolve scope.** Parse `$ARGUMENTS`:
   - Module name → infer scope globs `src/app/(app)/<module>/**`, `src/components/<module>/**`, `src/lib/<module>/**`
   - Override with `--components` if provided
2. **Create run directory:**
   ```bash
   mkdir -p docs/audits/_module-audit-runs/<YYYY-MM-DD>-<module>
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
   - BROWSER_SPECS (the module's spec files, `none` or `no suite`)
5. **Dirty audited paths.** If `WORKING_TREE_CLEAN == false`: lens critics read the working tree but the verifier checks the frozen commit AUDIT_SHA, so uncommitted edits break citation coherence and produce false findings. When the dirty paths are this session's own work, commit them first, auditing the commit with `/pre-commit-check` in a subagent (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The pre-commit audit), and re-run recon. Otherwise halt and report the paths (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): another author's work in progress isn't this run's to commit or stash, and the audit re-runs once it lands.
6. **If STALE_COMPONENTS < 3:** end the run with `outcome: no-op` and recommend `/page-design`, then a build from its locked design (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Building from a locked design), per component in the report (tier 1). A full audit runs anyway only when the owner asks for one.
7. **State the cost and start** (tier 1: a costly run doesn't stop): one line, "~{ESTIMATED_DISPATCH_COUNT} agents over ~{30 + 3 × C} min", where C is STALE_COMPONENTS, the components Stage 1 audits; step 8's spec run adds its own minutes. The dispatch cap under Cost guards still halts.
8. **Run the module's browser specs, in the foreground, before Stage 1's first wave** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Browser specs), so they never share the machine with Stage 1B's build, test and axe runs. Stamp `date +%s` as it starts and ends. When `BROWSER_SPECS` names files:
   - The dev server compiles everything it imports, not only the audited paths step 5 checked, so check `git status --porcelain -- . ':(exclude)*.md'` first: dirty markdown (the ledger rows this command leaves for `/end-session`, docs) doesn't block the run, but any other dirty or untracked path records `SMOKE: not run — tree dirty: <paths>`. A clean result means the app's code the specs drive is AUDIT_SHA.
   - Run them per that section, with the output folder `docs/audits/_module-audit-runs/<date>-<module>/smoke/` (the full path: it goes on the command line), and write `docs/audits/_module-audit-runs/<date>-<module>/smoke_results.md`: each run's command, exit code and selected-test count; the cases passed, failed and flaky; and the finding lines below.
   - Each failing case whose test drives a route in the module's scope gets one finding line: `<spec file>:<line> "<test title>" — high — <the flow> fails: <the error's first line> — <the step that failed; its probable cause, read from the error and the trace; the trace path>`. Stage 1 copies these lines from `smoke_results.md` into `stage_1_findings.md` as its own `smoke` section, and later stages read it like any critic's; the fix group's run finds whether the app or the spec is wrong. A failure in a test of another module's routes is listed in `smoke_results.md` as out of scope, not a finding.
   - When the specs can't run (`none`, `no suite`, a dirty tree, a suite that doesn't start once its prerequisites are started, or no test selected), record `SMOKE: not run — <reason>` and go on: the audit doesn't halt for it, and a flow with no spec case is the test-coverage axis's finding.

**Carry `AUDIT_SHA` in orchestrator state for the remainder of the run — it is the coherence anchor passed to the Stage 4.5 verifier.**

### Stage 1 — Parallel audit (1A + 1B)

**Dispatch the C × 4 + 10 Agent calls in waves.** The harness runs a fixed number of subagents at once (20, unless `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` raises it) and refuses the rest of a larger message with "Concurrent subagent limit reached … Do not retry". Send a full wave in one message, then send the next calls as agents return, until all have gone. A refused call isn't a failure: send it again when a slot is free.

**Stage 1A — Per-form-component lens critics** (4 lenses, cap 4 findings each):

For each stale form component × each lens in {`architecture`, `security`, `performance`, `data-integrity`}:
- subagent_type: `red-line-toolkit:module-lens-critic`
- prompt: component path, lens name, manifest path. Reference the agent file rubric.

**Stage 1B — Cross-cut critics** (10 axes):

One Agent call per axis in {`deps`, `bundle`, `types`, `observability`, `migration`, `cost`, `reversibility`, `tier-gating`, `test-coverage`, `a11y-static`}:
- subagent_type: `red-line-toolkit:module-cross-cut-critic`
- prompt: axis name, manifest path, and for `test-coverage` the path of Stage 0's `smoke_results.md` (or that the specs didn't run). Reference the agent file rubric.

**After all return:**
- Persist all findings to `_module-audit-runs/<date>-<module>/stage_1_findings.md` (markdown with sections per source, and a `smoke` section copied from `smoke_results.md`'s finding lines when Stage 0 has any)
- Apply failure-recovery contract:
  - An agent that errors, or returns neither findings nor its agent's no-findings or N/A line (`NO_FINDINGS_AT_THIS_LENS`, `NO_FINDINGS_AT_THIS_AXIS`), is recorded as `<source> — FAILED — no findings`. A clean lens isn't a failure.
  - **If more than half of the Stage 1A lens critics fail**: halt and report (a broken tool, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`). A fix plan built on under half the lenses would read as complete.
  - The stage's budget (Cost guards) is a flag, read from its stamps when it ends: the run learns the time only when an agent returns, so it can't cut a stage short.

### Stage 1.5 — Adversarial (one message, after 1A+1B complete)

Every critic finding so far comes from one model family, so the misses they share are the ones this stage hunts. **Dispatch 3 Agent calls in one message:**

1. `red-line-toolkit:module-red-team` — reads `stage_1_findings.md` + manifest; finds ≤5 misses (cross-finding chains, missed lenses, scope creep). It stays on the orchestrator's family because its strongest misses are chains through security, tier and export findings, which a Fable seat doesn't review.
2. **Fable miss hunt** — a `fable-seat` (`subagent_type: red-line-toolkit:fable-seat`, **`model: fable`**, or `model: opus` if the orchestrator is Fable; `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats, whose model check it gets). Pass absolute paths:
   > *"Decorrelated miss hunt over a module audit. Every critic finding so far came from one model family; you're on another. Read <stage_1_findings.md> and <scope_manifest.md>, and the code they cite as it is at the audited commit (`git show <AUDIT_SHA>:<path>`). Find up to 5 real correctness defects the findings miss or understate: a wrong figure, a broken data path, a state the user can reach that the code doesn't handle, two findings that together make a worse bug. Do NOT review security, auth, RLS or tier access (the security lens and the red team cover them), and don't restate a finding. Output `file:line — severity — issue — evidence`, or `NO_FABLE_MISSES — <reason>`."*
3. `red-line-toolkit:module-steelman` — **MUST-FIX findings only** (not high). Writes one-sentence defense per finding.

**After all return:**
- Persist to `_module-audit-runs/<date>-<module>/stage_1_5_adversarial.md`, one section per seat, the red team's findings numbered R1… and the miss hunt's M1…; the Fable section opens with the guard's note on the model that ran.

### Stage 2 — Synthesis

Dispatch `red-line-toolkit:module-audit-synthesizer`:
- prompt: paths to `stage_1_findings.md`, `stage_1_5_adversarial.md`, `scope_manifest.md`. Output path = `_module-audit-runs/<date>-<module>/synthesized_findings.md`.

Synthesizer dedupes + tags + emits in **adjudicator-canonical CRITICS shape**. Verify the output file starts with `PLAN:` and `CRITICS:` — if not, halt with malformed-input error.

**Record dedup metric:** dedup_rate = 1 − deduped_findings_count / raw_findings_count, the share of raw findings the synthesizer merged away. Target ≥25% (success criterion).

### Stage 3 — Adjudication + dispositions

1. Dispatch `red-line-toolkit:the-adjudicator`:
   - subagent_type: `red-line-toolkit:the-adjudicator`
   - prompt: path to `synthesized_findings.md`. Apply standard KEEP/DITCH/MODIFY rubric with security-asymmetric upgrade.
2. **Record severity-modification metric**: count of `MODIFY` verdicts / total verdicts = modification_rate. Target ≥20% (success criterion).
3. **Dispositions, without asking** (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): every KEEP and MODIFY finding is `fix-now`, pre-existing ones included — the thorough default. A finding whose fix is a design, copy, UX or product call is `owner`: park it per `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking and record its row ID. The ledger-mode rule in Stage 5 covers this write: on a mode line that is none of the three, halt and report it instead. The report lists the dispositions and the ditched findings, so the owner can pull one back.

4. **Persist the verdicts and dispositions** to `_module-audit-runs/<date>-<module>/adjudication.md`; Stage 4 and the Stage 4.5 critique read them.
5. **Adjudicator telemetry — emit on the-adjudicator's behalf.** `red-line-toolkit:the-adjudicator` is `Read, Grep` only and cannot write its own metrics row, so the orchestrator emits it here, right after the verdict block is recorded. Via Bash, append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). `caller` tags this row as a module-audit dispatch so the monthly assessment can separate adjudicator usage by invoking pipeline. `keep/ditch/modify` come straight from the Stage 3 verdict block.

   ```bash
   echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"outcome\":\"completed\",\"caller\":\"module-audit\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
   ```

### Stage 4 — Fix plan generation

**Runs when Stage 3 marked at least one finding `fix-now`;** otherwise go to Stage 5.

Dispatch `red-line-toolkit:module-audit-fix-planner`:
- prompt: `adjudication.md` (the Stage 3 verdicts and dispositions) + `synthesized_findings.md` + scope manifest, and on a Stage 4.5 re-plan the findings to apply. Output path = `docs/audits/<YYYY-MM-DD>-<module>-audit-fix-plan.md` (top-level under docs/audits/, not inside `_module-audit-runs/`).

### Stage 4.5 — Verification + Fable fix-plan critique (one message, whenever Stage 4 wrote a fix plan)

Dispatch the verifier and the critique together: the stage takes the slower of the two, plus the critique's disposition.

Dispatch `red-line-toolkit:module-audit-verifier` with the **frozen AUDIT_SHA**:
- prompt: **AUDIT_SHA** (from Stage 0 orchestrator state) + synthesized findings path + manifest path + sample size 10.
- The verifier runs `git show AUDIT_SHA:<file>` for each finding — NOT HEAD.
- Verifier stratifies: all must-fix + N from high/medium/low; runs the line-range pre-filter (`cited_line ≤ file_length_at_SHA`) first. A finding whose only source is `smoke` is left out of the sample and the rates: its evidence is the recorded run in `smoke_results.md`, which `git show` can't re-check.

Dispatch the **Fable fix-plan critique**, a `fable-seat` on the decorrelated family as in Stage 1.5, with absolute paths to the fix plan, `adjudication.md`, `synthesized_findings.md` and the manifest:

> *"Decorrelated critique of a module audit's fix plan, before its groups become ledger rows and runs. You did not write it. Read <fix plan>; <adjudication.md> holds the verdicts and dispositions, so a DITCHed or owner finding is in no group on purpose; <synthesized_findings.md> holds every finding with its sources; <scope_manifest.md> maps the module. Code is as at the audited commit (`git show <AUDIT_SHA>:<path>`). Each group is worked as its own run, one at a time, the lowest-numbered open group whose Depends-on groups are closed. Hunt for what no single group's review can see: a group that needs another group's change first but doesn't name it in Depends on (or names one it doesn't need, or a cycle); groups that change the same files with no dependency between them, so a later group's citations and fix go stale once the earlier one lands; a fix whose same-class sites (R-20) sit in no group. Note in passing a Pipeline tag the rigor trigger contradicts (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The rigor trigger, and the project CLAUDE.md's Heavy-rigor trigger), or a fix that is really a design, copy, UX or product call. Do NOT review security and do NOT restyle. Output numbered findings — severity, evidence (group + path), fix — or `CLEAN`."*

**Parse BOTH rates from verifier output:**

- **If VERIFICATION_RATE ≥ 80% AND SNAPSHOT_MISMATCH_RATE < 5%**: apply the critique (below), then go to Stage 5. Note both rates in done summary.
- **If VERIFICATION_RATE 60-80% OR SNAPSHOT_MISMATCH_RATE 5-20%**: filter without asking (tier 1): drop the HALLUCINATED and SNAPSHOT_MISMATCH findings, apply the filter and the critique (below), whose one re-plan carries the filtered set when the filter removed any, and list the dropped findings and the PARTIALs in the report.
- **If VERIFICATION_RATE < 60% OR SNAPSHOT_MISMATCH_RATE > 20%**: HALT. Do NOT present the fix plan as actionable. Surface the verifier report directly:
  > Below the rev-4 trust floor. A high snapshot-mismatch rate specifically means recon froze the wrong SHA or the working tree drifted mid-run — re-run from Stage 0 on a clean tree. A high hallucination rate means critic prompts need tightening. Do not act on the fix plan until re-verified.

  The critique is discarded with the plan; `fix_plan_critique.md` records it as discarded.

**Applying the filter and the critique** (on a PROCEED or a FILTER, and on a FILTER even when the critique refused, returned nothing or was CLEAN). The orchestrator disposes of each critique finding directly (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The Fable seats) and records it in `_module-audit-runs/<date>-<module>/fix_plan_critique.md`, in this order:
1. **What only the orchestrator can do.** Park an owner call per `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking, with Stage 5's ledger-mode rule covering the write, and move it to the plan's Waiting on owner. Open an uncovered same-class site at AUDIT_SHA before it joins its finding. Report a defect no finding holds instead of adding it to a group unreviewed. Then update `adjudication.md`: an owner move's disposition becomes `owner`, and a finding the filter removed becomes `removed (verifier)`.
2. **The plan edits, in one place.** When the filter removed findings, or a critique finding is a split, merge or reorder, re-dispatch `red-line-toolkit:module-audit-fix-planner` once with the existing plan, the updated `adjudication.md`, and every plan-edit finding and verified added site (Depends on, Pipeline tag, split, merge, reorder, added same-class sites), so group numbers stay whole and the cross-references follow. Otherwise edit the plan directly.
3. **Check the header.** The plan header's fix-now and waiting-on-owner counts match `adjudication.md`.

### Stage 5 — Ledger rows + Done summary

**Ledger rows for the fix plan** (when Stage 4 wrote one and Stage 4.5 let it stand: a HALT files none, and after a FILTER the rows follow the re-planned groups). The fix plan holds the work, but only a row tracks it (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs: an FU kept in plan prose keeps its row), and a project may keep audit output out of git (by ignoring `docs/audits/`), where `/start-session`, the ledger and a worktree session never see the plan. File one FU row per fix-plan group, by the ledger mode Stage 0 printed:
- **`LEDGER: migrated`:** per that § FUs, in this campaign's current-phase group step for the group's type, shaped `- **FU-<n>** [<type> · <cleanup-light|change-heavy>] <the group's fix, in one line>; <N> findings — why not now: own run: /module-audit <date>-<module> fix group <g>, sequenced by its fix plan (<the plan's absolute path> § Group <g>) — home: <Campaign>/<Phase>.<Step> {anchor: <the group's main file> :: /<pattern>/}`. The type is the group's **Type**, and the rigor tag its **Pipeline** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The rigor trigger). The reason's text is what § FUs treats as a fix-plan row. File and close any other FU the run meets per the same section.
- **`LEDGER: not migrated`:** file the groups per the project's CLAUDE.md. **`LEDGER: not a stack project`:** the fix plan is the only record, and the report says so.
- **Any other mode line** (for example `LEDGER: unavailable` or `LEDGER ERROR`): halt and report it before touching FU rows.

Write each row's ID into its group's heading in the fix plan. The rows wait, with the owner rows Stages 3 and 4.5 parked, for the next `/end-session` commit; the fix groups start after it, one per run in the plan's order (§ FUs, When a group step starts).

**Done summary.** Report metrics against the success criteria below:

```
PIPELINE: /module-audit
MODULE: <name>
AUDIT_SHA: <short>
RUN_DIR: docs/audits/_module-audit-runs/<date>-<module>/

DISPATCH COUNTS:
  Recon:        <1 or 2> (2 when Stage 0 committed this session's dirty paths)
  Pre-commit:   <0 or 1> (Stage 0 step 5)
  Stage 1A:     <C × 4>
  Stage 1B:     10
  Stage 1.5:    3 (red team, Fable miss hunt, steelman; +1 for a re-dispatched Fable seat)
  Stage 2:      1 (synthesizer)
  Stage 3:      1 (adjudicator)
  Stage 4:      <0–2> (fix planner — 0 when nothing was fix-now, +1 for the one re-plan when the filter removed findings or a critique asked for a split, merge or reorder)
  Stage 4.5:    <0, 2 or 3> (verifier + Fable fix-plan critique, +1 for a re-dispatched Fable seat — 0 without a fix plan)
  TOTAL:        <sum>

EFFORT: <each stage's agents: level>
SMOKE: <the module's specs: P passed, F failed (K findings, O out of scope), L flaky> | not run — <reason>
FABLE SEATS: miss hunt <model, from the guard's note> — raised <n>, kept <k>, unique <u> · fix-plan critique <model> — <n> findings: <dispositions>, or not dispatched (no fix plan) | <a seat that refused or wasn't decorrelated, named>

WALL TIME: <min> (recon <m> · smoke <m> · 1 <m> · 1.5 <m> · 2 <m> · 3 <m> · 4 <m> · 4.5 <m>, from the stage stamps)

SUCCESS CRITERIA (sized from two measured runs):
  Synthesizer dedup rate:    <rate>%  (target ≥25%)  <PASS|FAIL>
  Adjudicator modification:  <rate>%  (target ≥20%)  <PASS|FAIL>
  Verifier verification:     <rate>%  (target ≥80%)  <PASS|FAIL>
  Verifier snapshot-mismatch:<rate>%  (target <5%)   <PASS|FAIL>
  Wall time:                 <min>    (less the smoke segment; target ≤30 + 3 × C, provisional: one measured run) <PASS|FAIL>
  Findings absorbed:         <count>  (target ≥1)    <PASS|FAIL>
  ≥1 finding human missed:   <yes|no> (target yes)   <PASS|FAIL>

FAILURE FLAGS:
  Synthesizer dedup <20%:    <NO|YES — critics generating non-overlapping noise>
  Adjudicator modify <10%:   <NO|YES — steelman not catching inflation>
  Verifier rate <60%:        <NO|YES — pipeline halted at Stage 4.5>
  Snapshot-mismatch >20%:    <NO|YES — recon froze wrong SHA / tree drifted; rev-4 halt>
  Wall time >1.5 × target:   <NO|YES> (less the smoke segment)
  Stage over budget:         <NO|YES — the stage and its minutes>

ARTIFACTS:
  Scope manifest:       _module-audit-runs/<date>-<module>/scope_manifest.md
  Smoke results:        <_module-audit-runs/<date>-<module>/smoke_results.md, or none (not run)>
  Stage 1 findings:     _module-audit-runs/<date>-<module>/stage_1_findings.md
  Stage 1.5 adversarial: _module-audit-runs/<date>-<module>/stage_1_5_adversarial.md
  Synthesized findings: _module-audit-runs/<date>-<module>/synthesized_findings.md
  Adjudication:         _module-audit-runs/<date>-<module>/adjudication.md
  Verifier report:      _module-audit-runs/<date>-<module>/verifier_report.md
  Fix-plan critique:    <_module-audit-runs/<date>-<module>/fix_plan_critique.md, or none (no fix plan)>
  Fix plan:             <docs/audits/...-fix-plan.md, or none>

FIX-PLAN ROWS: <FU-<a>…FU-<b>, one per group | none: why (no fix plan, a HALT, no ledger)>
WAITING ON OWNER: <the findings Stages 3 and 4.5 parked, with their row IDs | none>
```

**Effectiveness telemetry — append on every completed run.** After the done summary is reported, via Bash append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). Over weeks this is the data that reveals whether the audit's verification floor is catching real defects vs. surfacing noise. `outcome` is `completed` for a full run that produced verified findings, `no-op` if the run early-exited (Stage 0 redirect to per-page skills, a halt, or Stage 4.5 HALT below the trust floor). The finding counts (`high/medium/low`, `must_fix`) come from the Stage 3 adjudicated set; `verified_rate` is the Stage 4.5 VERIFICATION_RATE; `false_positives` is the count of findings the Stage 4.5 verifier dropped (HALLUCINATED + SNAPSHOT_MISMATCH); `owner_parked` counts the `owner decision` rows Stages 3 and 4.5 parked (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking). The row also carries what the next re-sizing of the targets needs: `components` (C), `agents` (the dispatch total), `wall_min` (from the stamps, less the smoke segment, so it stays comparable with the runs the targets were sized on), `dedup_rate` and `modify_rate` (0.0–1.0), and `fix_rows` (the rows Stage 5 filed). `fable_raised`, `fable_kept` and `fable_unique` count the Stage 1.5 miss hunt's findings, those Stage 3 kept, and those kept with no other source on their synthesizer `SRC:` line, so the seat's yield can be read; all three are `-1` when the miss hunt refused or its note said NOT DECORRELATED, so a lost seat never reads as a clean zero. `smoke_findings` counts the Stage 0 browser-spec cases that became findings, `-1` when the specs didn't run (the SMOKE line says why), so an unrun suite never reads as a clean zero either.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"module-audit\",\"outcome\":\"<completed|no-op>\",\"high\":<h>,\"medium\":<m>,\"low\":<l>,\"must_fix\":<mf>,\"verified_rate\":<0.0-1.0>,\"false_positives\":<fp>,\"owner_parked\":<n>,\"components\":<c>,\"agents\":<n>,\"wall_min\":<n>,\"dedup_rate\":<0.0-1.0>,\"modify_rate\":<0.0-1.0>,\"fix_rows\":<n>,\"fable_raised\":<n|-1>,\"fable_kept\":<n|-1>,\"fable_unique\":<n|-1>,\"smoke_findings\":<n|-1>}" >> ~/.claude/metrics.jsonl
```

If the run never reached Stage 4.5 (early-exit/no-op), emit with `outcome:"no-op"` and set `verified_rate`, `false_positives` and `fix_rows` to `0`, the finding counts and rates to whatever Stages 2–3 produced (or `0` for a stage that never ran), the sizes and minutes to what the run reached, the `fable_*` fields to what Stages 1.5–3 produced (`fable_raised` `-1` if the miss hunt never ran; `fable_kept` and `fable_unique` `-1` if Stage 3 never ran), and `smoke_findings` to Stage 0's count (`-1` if step 8 never ran). The adjudicator row (Stage 3) is emitted separately on the-adjudicator's behalf and is independent of this row.

**Fable telemetry — whenever a Fable seat ran.** `plan_findings` counts the Stage 4.5 critique's findings (`-1` without a fix plan, on a HALT, or when the critique refused or wasn't decorrelated), and `audit_findings` the Stage 1.5 miss hunt's (`-1` when the miss hunt never ran, refused or wasn't decorrelated); there's no re-audit, and `check_recommended` is whether a seat recommended a check, which is filed or dropped, never built in the run. `security_engaged` is `true`: Stage 1A runs a security lens on every component.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"fable-audit\",\"outcome\":\"completed\",\"caller\":\"module-audit\",\"plan_findings\":<n|-1>,\"audit_findings\":<n|-1>,\"reaudit\":\"n-a\",\"reaudit_findings\":-1,\"reaudit_kept\":-1,\"check_recommended\":<true|false>,\"check_built\":false,\"security_engaged\":true}" >> ~/.claude/metrics.jsonl
```

## Failure handling

| Failure mode | Response |
|---|---|
| Agent file missing pre-flight | Halt with clear "Required agent missing" message |
| Stage 0 recon fails or returns no manifest | Halt — pipeline cannot proceed without manifest |
| Stage 0 returns C<3 components | End with `outcome: no-op`; recommend /page-design, then a build from its locked design, per component |
| Audited paths dirty with another author's work | Halt and report the paths |
| A dispatch refused at the concurrent-subagent limit | Send it again when a slot is free; not a failure |
| Stage 1A single agent fails | Record `FAILED — no findings` and continue |
| Stage 1A >50% fail | Halt and report |
| Stage 1B axis returns N/A (e.g., migration on no-migrations module) | Accept; not counted as a finding |
| Stage 0's browser specs can't run (none, no suite, a dirty tree, a suite that won't start, no test selected) | Record `SMOKE: not run — <reason>`, set `smoke_findings` to `-1`, and go on |
| A Fable seat's note says NOT DECORRELATED | Dispatch it once more; if it still is, keep its output, marked same-family in the report |
| A Fable seat refuses or returns nothing | Go on without it and name the miss in the report |
| Synthesizer output not in canonical shape | Halt with malformed-input error |
| Adjudicator overwhelmed (>70% KEEP rate of input) | Flag in done summary; proceed but warn synthesizer dedup likely failed |
| Verifier rate <60% | HALT — do NOT present fix plan |
| Any halt | Exit cleanly; preserve all run artifacts for re-entry |

## Cost guards

A measured run (C = 14, 73 agents by recon's estimate) took about 70 min from its dispatch timestamps: recon 4.5, Stage 1 18 (66 agents, 20 at a time), Stage 1.5 9, synthesizer 14.5, Adjudicator 7, fix planner 12, verifier 5.
- Hard agent dispatch cap: an estimate over 75, more than 14 form components → halt with "Scope too large — split module"
- Stage budgets, flagged in the Done summary from the stage stamps: Stage 1 = 30 min; every other stage = 20 min

## When NOT to use /module-audit

- **<3 form components / heavy components** — use `/page-design` per page, then `/cleanup-light` to build from its locked design
- **Single-page or single-component work** — use `/page-design` directly
- **A change to shipped code** — use `/change-heavy` when it meets the project's Heavy-rigor trigger, `/cleanup-light` otherwise, at any file count
- **FU cleanup from STACK.md** — use `/cleanup-light` (one or more FUs, or a group step), unless an FU meets the Heavy-rigor trigger
- **Mobile runtime testing** (375px tap targets, overflow, throttled load) — use `/mobile-audit`. This audit runs the module's browser-spec cases that exist (Stage 0), and a flow with no case is its test-coverage axis's finding.

## Hard constraints

- A full audit spends dozens of agent runs: Stage 0 states the estimate and starts, and the dispatch cap halts.
- Stage 3 marks every KEEP and MODIFY finding `fix-now`; only a design, copy, UX or product finding waits for the owner, parked as an owner decision.
- Stage 4.5 verification runs whenever Stage 4 produced a fix plan.
- The orchestrator doesn't modify `src/`: sub-agents are read-only by tools config. The write products are the fix plan, its group rows (Stage 5) and any owner decision Stages 3 and 4.5 parked in `Standing-FUs.md`. Stage 0's spec run also leaves Playwright output in the run directory and writes marked test rows on the local stack, which the specs delete; it can start the local stack, which it leaves running, seed it, and mint the suite's saved session (for example `tests/visual/.auth/storage.json`); a dev server the suite starts stops when each run ends. The next `/end-session` commits the rows, and commits the fix plan only where the project tracks `docs/audits/`; where it's kept local-only, the rows and the plan's absolute path are the record.
- Dispatch only the agents this command names, the two Fable seats included.
