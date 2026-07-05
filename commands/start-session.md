---
description: Start-of-session orientation. Reads STACK.md (Current location = the handoff) + Standing-FUs.md, checks for multi-session divergence, verifies working tree, surfaces batch-ready clusters + promotion candidates + FU integrity (anchor drift + orphaned-phase homes), outputs structured orientation brief. Restates current task tree per CLAUDE.md mandate. Read-only.
argument-hint: [optional]
allowed-tools: Read, Bash
---

# /start-session

You are running the **/start-session** orientation. The user has just opened a new session and needs to be oriented to the current state without re-deriving from parent plans (which produces variance).

User's invocation argument: **$ARGUMENTS**

**Core principle:** This command is **READ-ONLY**. Never modifies STACK.md, Standing-FUs.md, or any project state. Its only output is a structured orientation brief in the chat.

---

## Stage 1 — Read state

- Read `STACK.md` (canonical live state — **Current location IS the handoff** written by the last /end-session)
- Read `Standing-FUs.md` (cross-cutting backlog) — scan for any whose trigger may have fired
- Skim `docs/plans/2026-05-31-refactor-overview.md` (global scope) only if STACK's current campaign is unclear
- !`ls -la STACK.md Standing-FUs.md 2>/dev/null || true`

**FU integrity** — flags (a) any anchored FU whose cited code moved/was deleted (drift = stale location citation) and (b) any FU homed at a CLOSED phase (`stale-home` = the close-time GC was skipped). Read-only report:
- !`if [ -f package.json ] && npm run 2>/dev/null | grep -q 'verify:fus'; then npm run verify:fus 2>&1 | grep -E '^(DRIFT|STALE-HOME|FU anchors:)' || echo "⚠️  verify:fus emitted no summary — integrity check may be broken; run it manually: npm run verify:fus"; else echo "FU integrity: n/a — no verify:fus script (light project, plain-bullet FUs)"; fi`

If STACK.md doesn't exist → output: "No STACK.md found. No active major effort. Suggest running /brainstorm or /module-build to start one."

There is no separate handoff file — the previous session's handoff is STACK's Current location. To see the *prior* handoff (forensic), use `git show <sha>:STACK.md`.

---

## Stage 2 — Working tree + git divergence

- !`git status --porcelain`
- !`git log origin/main..HEAD --oneline | head -20`
- !`git log -n 1 --format="%H %s"`

Capture:
- Working tree state (clean or list of modifications)
- Commits ahead of origin
- Current HEAD SHA + subject

---

## Stage 3 — Multi-session conflict check

Compare:
- The commit that last touched STACK.md (`git log -1 --format=%H -- STACK.md` — the previous /end-session sync)
- Actual HEAD SHA (from Stage 2)

If HEAD is AHEAD of the last STACK.md sync by commits NOT made this session, another session likely committed since the last /end-session. Surface a conflict warning — STACK's Current location may be stale relative to what shipped. Recommend re-reading recent commit bodies before acting.

---

## Stage 4 — Output orientation brief

Output the brief in this exact structure (echo from STACK.md sections verbatim where possible; do not interpret or summarize):

```
═══════════════════════════════════════════════════════
SESSION ORIENTATION
═══════════════════════════════════════════════════════

GLOBAL PLAN:  <verbatim from STACK.md "Global plan" section, first 1-2 lines>

PHASE:        <verbatim from STACK Phases — the row marked ACTIVE>

CURRENT LOCATION:
  Pipeline:    <STACK Current location "Pipeline" field>
  Pending:     <STACK Current location "Pending" field>
  Next move:   <STACK Current location "Next move" field>
  Last commit: <STACK Current location "Last commit" field>

PUSH STATE:   <STACK Current location "Push state" field, or compute from `git rev-list --count origin/main..HEAD` if missing>

FU INTEGRITY: <verify:fus summary from Stage 1 — e.g. "5 checked · 0 drifted · 0 manual · 0 stale-home"; if drifted > 0 list each DRIFT line; if stale-home > 0 list each STALE-HOME line (an FU orphaned at a closed phase)>

IN-FORCE LESSONS (<count>):
<bullet list of all In-force lessons verbatim from STACK, including [audits survived: N] tags>

PROMOTION CANDIDATES:
<list any lessons with [audits survived: 3+] — these are ripe for /consolidate-memory or memory file entry>

═══════════════════════════════════════════════════════
```

Below the brief, output recent commit context for grounding:

```
RECENT COMMITS (last 5):
<git log --oneline -5 output>
```

---

## Stage 5 — Surface warnings

Emit each that applies (each warning is a `⚠️` line):

| Condition | Warning |
|---|---|
| Working tree dirty | `⚠️  Working tree dirty: <list modified files>. Resolve before starting new work.` |
| HEAD ahead of last STACK.md sync by commits not from this session | `⚠️  STACK Current location may be stale (N commits since last /end-session sync). Verify against recent commit bodies.` |
| Multi-session conflict detected (Stage 3) | `⚠️  Possible multi-session conflict — STACK touched by another session since last /end-session. Review commits before acting.` |
| Plan file referenced in STACK doesn't exist | `⚠️  Broken plan link: <path>. The active phase's plan file was renamed or deleted.` |
| FU anchor drift (Stage 1 verify:fus reported > 0 drifted) | `⚠️  FU anchor drift: N anchored FU(s) no longer match cited code. Run npm run verify:fus for detail; re-anchor or resolve before relying on those FUs.` |
| Orphaned FU home (Stage 1 verify:fus reported > 0 stale-home) | `⚠️  Orphaned FUs: N FU(s) homed at a CLOSED phase — the close-time GC was skipped. Re-home each → Standing or an open phase (run /cluster-fus to disposition) before the home lies further. See the STALE-HOME lines for which.` |
| Promotion candidates exist (Stage 4) | `💡 N In-force lessons have survived 3+ audits — consider promoting at next /end-session audit or running /consolidate-memory.` |
| FU type-cluster at batch threshold (≥5 same-type, OR ≥2-3 for /cleanup-light) | `💡 N <type> FUs cluster together → /change-heavy (or /cleanup-light) batch-ready. Run /cluster-fus for the full bucketing.` |
| Standing FU whose trigger may have fired (Nth caller now exists, date passed) | `💡 Standing FU "<x>" trigger may have fired — re-evaluate.` |
| Push-eligible (Phase-close reached) | `💡 Push-eligible (N commits ahead; phase closed). Consider pushing before starting next effort.` |
| STACK has empty Open follow-ups + no active phase | `💡 Stack appears complete. Consider running stack-close audit ritual (promote In-force lessons, reset STACK).` |

---

## Stage 6 — Closing

Append a single-line action prompt at the bottom:

```
Ready to proceed. Recommended first action: <verbatim from STACK Current location "Next move">
```

---

## Failure modes

| Situation | Handling |
|---|---|
| STACK.md doesn't exist | Output: "No active stack. Start a major effort with /brainstorm, /module-build, or /change-heavy." Exit. |
| Git not initialized or no commits | Output: "Repo state unusual. Verify git state before proceeding." Exit. |
| `git log origin/main..HEAD` fails (no upstream configured) | Skip push-state checks. Note absence in brief. |
| STACK.md exists but is malformed (no Current location section) | Output: "STACK.md missing required sections. Run /end-session in last working session or repair manually." Exit. |

---

## Output expectations

By end of /start-session, the user should see:

1. **A self-contained orientation brief** — global plan, active phase, current location, in-force lessons, promotion candidates
2. **Recent commits for grounding**
3. **Any warnings** about state inconsistencies
4. **A single recommended next action**

The user can now start work without manually reading STACK.md or recalling chat context. This command satisfies CLAUDE.md's "restate before any context switch" mandate.

**Read-only:** No file writes, no commits, no state changes. Idempotent — running twice produces the same output.
