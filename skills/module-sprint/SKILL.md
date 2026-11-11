---
name: module-sprint
description: |
  Workflow runner that walks through the standard module-build → page-design → page-code → page-implement pipeline for a new module. Use when starting a new module from zero (e.g., Reports, Settings, Team, Billing) or when resuming a paused multi-page build.
---

# /module-sprint

You are running the module sprint workflow. **You are SCAFFOLDING, not orchestrating.** You do not dispatch agents directly. All real work happens inside the skills you invoke via the Skill tool.

## Architectural commitments

1. **Sequential, not parallel.** One page at a time. Parallel page builds destroy inter-page consistency (button styling, header decisions, error patterns drift). Sequential preserves the design language as it emerges.
2. **Each skill's own stops run as that skill defines them.** /module-build and /page-design stop at their locks (design and product calls, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`); /page-code locks and /page-implement commits without asking. Sprint adds no gates between them.
3. **State persisted between phases.** Sprint state lives at `docs/plans/_module-sprint/<module>/_sprint-state.md`. Update after each phase completes. Resumable via `--resume` flag.
4. **No agent dispatch.** Sprint uses the Skill tool only. If you find yourself reaching for the Agent tool, stop — that's the orchestrators' job, not the runner's.

## Inputs

- `$ARGUMENTS` — module name (kebab-case, e.g., `reports`)
- Optional flag: `--resume` — pick up from `_sprint-state.md`
- Optional flag: `--spec <path>` — skip Phase 0 and use an existing spec doc

## Process

### Phase 0 — Spec discovery or build

1. If `--spec <path>` provided, set spec_path to it and skip to step 4.
2. Search for `docs/plans/*-<module-name>-spec.md`:
   - If exactly one match: set spec_path = that file. Announce "Spec already locked at <path>. Skipping /module-build."
   - If multiple matches: use the newest one with `status: locked` and name it (tier 1); if none is locked, use the newest and go to step 4.
   - If no matches: proceed to step 3.
3. Invoke `/module-build` via the Skill tool, passing the module name. The skill has its own internal flow ending with its lock. Wait for it to complete and surface the spec doc path. Set spec_path = that path.
4. Verify spec_path file exists and has `status: locked` in frontmatter. If not locked, AskUserQuestion: "Spec is draft, not locked. Lock now and proceed?" (Lock | Cancel sprint).

### Phase 1 — Read spec and initialize state

1. Read the locked spec. Extract the **page list** from its "Pages" or "Page Breakdown" section. Each page should have: `name`, optionally `route`, optionally `priority/phase`.
2. Check for existing state file at `docs/plans/_module-sprint/<module>/_sprint-state.md`.
   - If `--resume` and state exists: read completed-page list; remaining = pages minus completed.
   - Else: create the state file with all pages marked pending.

State file format:

```markdown
# <Module> Sprint State

**Started:** <date>
**Spec:** <abs path to spec doc>
**Total pages:** N
**Last updated:** <date>

## Pages
- [x] page-1-name — design ✓ code ✓ implement ✓ shipped <date>
- [ ] page-2-name — design ✓ code ✓ implement (in progress: <stage>)
- [ ] page-3-name — pending
- ...

## Notes
- <free-form notes you add as the sprint runs>
```

### Phase 2 — Per-page loop

For each remaining page in spec order:

1. **Announce:** `Page N of M: <page-name>` (where N is current 1-indexed position, M is total).

2. **Start the page.** At /page-design's lock, or by interrupting, the user can say to skip this page, pause the sprint (resume later with `--resume`) or end it; sprint acts on that when the skill returns.

3. **Invoke `/page-design`** via Skill tool. Pass:
   - Module name
   - Page name and any spec excerpt for context (extract from the spec doc)
   - Path expectations: design doc lands at `docs/plans/<date>-<page-name>-design.md`

4. **Wait** for /page-design to lock. The skill emits a locked design doc.

5. **Update state file:** mark page's design stage complete (`design ✓`).

6. **Proceed to /page-code** once /page-design has locked.

7. **Invoke `/page-code`** via Skill tool. Pass module/page context + design doc path.

8. **Wait** for /page-code lock. Update state: `code ✓`.

9. **Proceed to /page-implement** once /page-code has locked.

10. **Invoke `/page-implement`** via Skill tool. Pass code plan doc path.

11. **Wait** for /page-implement to complete (it has its own post-execution critic loop and commits the page). Update state: `implement ✓ shipped <date>`.

12. **Loop** to next page.

### Phase 3 — Done

When all pages are complete:

1. Announce: `Module sprint complete. <M> pages shipped over <duration>.`
2. Update state file footer with completion timestamp.
3. Name `/module-audit <module>` as the recommended next step; don't run it. The sprint is done here, and the audit is its own post-ship command ("When NOT to use /module-sprint" below); it ends at once with a redirect when the module has fewer than 3 form components.
4. Surface a brief summary: pages shipped, any pages skipped, and the recommended `/module-audit` run.

### Telemetry — emit once per sprint session wrap

Sprint is a sequencer over per-page skills (each emits its own telemetry); this row tracks the sprint *session* itself. Emit exactly **one** line per session wrap — at Phase 3 completion AND at every Pause / End exit — never per page. Append via Bash to `~/.claude/metrics.jsonl` (append-only; create if absent). Read the `pages_shipped` / `pages_total` from the state file's Pages list at exit; `outcome` reflects how the session wrapped.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"module-sprint\",\"outcome\":\"<completed|shipped|abandoned|no-op>\",\"pages_shipped\":<count completed>,\"pages_total\":<count in spec>}" >> ~/.claude/metrics.jsonl
```

`outcome` mapping: `completed` = all pages shipped (Phase 3 reached); `shipped` = Pause exit with ≥1 page shipped this session; `no-op` = Pause/End exit with 0 pages shipped (or early-exit before the per-page loop, e.g. spec never locked); `abandoned` = End exit (`**Status: ENDED**`) with the module incomplete. `pages_total` is the spec page count; if the sprint exited in Phase 0/1 before a page list was read, emit `pages_total` as `0` and `outcome` as `no-op`.

## Pause / Resume semantics

**Pause sprint** when the user asks (at /page-design's lock, or by interrupting):
- Persist current state to `_sprint-state.md` (update last-updated timestamp, mark in-progress page with its current stage)
- Emit the session-wrap telemetry row (see Phase 3 → Telemetry): `outcome` = `shipped` if ≥1 page shipped this session, else `no-op`.
- Exit cleanly with a one-line "Sprint paused. Resume with `/module-sprint <module> --resume`."
- Do NOT auto-resume from a paused state without `--resume` flag.

**End sprint** when the user asks (at /page-design's lock, or by interrupting):
- Same as pause but DO write `**Status: ENDED**` to state file header.
- Emit the session-wrap telemetry row (see Phase 3 → Telemetry): `outcome` = `abandoned` (module left incomplete).
- Subsequent `--resume` will refuse with "Sprint was ended. Start fresh with `/module-sprint <module>` (no flag) to overwrite."

## When NOT to use /module-sprint

- **Single-page work** — use `/page-design` / `/page-code` / `/page-implement` directly. Sprint adds friction for one-off page work.
- **Module audits (post-ship)** — use `/module-audit` after the module is shipped.
- **Changes to shipped modules** — use `/change-heavy` when the change meets the project's CLAUDE.md Heavy-rigor trigger, and `/cleanup-light` for everything else, at any file count.
- **Cleanup of existing FUs** — use `/cleanup-light` (one or more FUs, or a group step), unless an FU meets the Heavy-rigor trigger.
- **Spec exploration / concept work** — use the `superpowers:brainstorming` skill first; only invoke /module-sprint once you have a real intent to build.

## Constraints (hard rules)

- Sprint dispatches no agents itself; each skill it invokes handles its own dispatch.
- Each skill's own stops run as that skill defines them.
- One page at a time: sequential pages stay consistent with each other.
- The locked Module Spec doesn't change mid-sprint; a scope change ends the sprint and re-runs /module-build.
- Sprint writes no code in `src/`; /page-implement does.
- Confirm each phase's artifact landed (locked design doc, locked code plan, shipped page) before moving on; if one is missing, pause the sprint and report it.

## Failure handling

- If `/module-build` fails to lock a spec: sprint ends. User must re-run `/module-build` standalone before retrying `/module-sprint`.
- If `/page-design` returns without a locked doc: pause sprint at that page and report it; the user retries or skips it.
- If `/page-implement` verification fails (build break, test fail): pause sprint at that page, surface the failure, do NOT proceed to next page until fixed.
- If user interrupts mid-skill (Ctrl-C or similar): treat as Pause; persist state with current stage marked.

## Output

When sprint completes (Phase 3) or pauses:

```
SPRINT_STATUS: <complete | paused | ended>
MODULE: <name>
PAGES_SHIPPED: <count> / <total>
PAGES_SKIPPED: <count>
STATE_FILE: <path>
SPEC: <path>
NEXT_STEP: <"Run /module-audit <module>" | "Resume with --resume" | "Start fresh with /module-sprint <module>">
```

## Examples

<example>
Context: User wants to start building the Reports module from scratch.
user: "/module-sprint reports"
assistant: "I'll run the module-sprint workflow — starting with /module-build for the spec, then walking each page through /page-design → /page-code → /page-implement, stopping at the spec and design locks."
<commentary>Standard new-module-from-zero invocation. Sprint sequences the full pipeline; the user's stops are the spec and design locks.</commentary>
</example>

<example>
Context: User has a locked Module Spec and shipped 2 of 5 pages; wants to resume.
user: "/module-sprint reports --resume"
assistant: "I'll read the locked spec at docs/plans/<date>-reports-spec.md, check the sprint state file, and resume from the next unshipped page."
<commentary>Resume mode skips completed pages. Per-page status is tracked in docs/plans/_module-sprint/<module>/_sprint-state.md.</commentary>
</example>

<example>
Context: User asks to skip module-build because a spec already exists.
user: "/module-sprint settings — spec already locked at docs/plans/<date>-settings-spec.md"
assistant: "I'll skip /module-build, read the existing spec, and start the per-page loop."
<commentary>If a spec exists, Phase 0 is skipped silently. Sprint detects this automatically.</commentary>
</example>
