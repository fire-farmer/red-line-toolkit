---
description: End-of-session sync. Writes the handoff INTO STACK.md Current location (no separate file), runs the lessons audit + promotion, surfaces + clusters new FUs, GC's FUs homed at any just-closed phase (verify gate blocks a close that leaves orphans), verifies working tree, commits with an address-tagged subject. Git history is the forensic trail. Invoke at session end or when context runs low.
argument-hint: [optional]
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

# /end-session

You are running the **/end-session** sync. The user is wrapping up a session and needs STACK.md updated + a self-contained handoff prompt generated so the next session resumes cleanly without prose-handoff variance.

User's invocation argument: **$ARGUMENTS**

**Core principle:** STACK is the canonical continuity ledger. End-of-session sync replaces free-form handoffs. Every step here either captures state to STACK or generates the orientation brief.

---

## Stage 1 — Working tree check (gate)

- !`git status --porcelain`
- !`git diff --stat`

If working tree is clean → proceed to Stage 2.

If dirty → surface the changes and ask the user via AskUserQuestion:
- **Option A:** Commit pending changes first (suggest running `/pre-commit-check` then commit)
- **Option B:** Stash with descriptive message (e.g., `git stash push -m "WIP: <one-line>"`)
- **Option C:** Document the dirty state in Current location's "Pending" field and proceed (rare — only when WIP is intentional cross-session)

Wait for explicit user decision before continuing. Do not silently proceed with a dirty tree.

---

## Stage 2 — Multi-session divergence check

Use git to find when STACK was last touched (more robust than parsing prose). Anything committed after that is candidate "this session" work:

- !`STACK_LAST_TOUCH=$(git log -1 --format=%H -- STACK.md); STACK_LAST_SUBJECT=$(git log -1 --format=%s -- STACK.md); HEAD_SHA=$(git rev-parse HEAD); echo "STACK last modified by: $STACK_LAST_TOUCH"; echo "  Subject:              $STACK_LAST_SUBJECT"; echo "Actual HEAD:            $HEAD_SHA"; if [ "$STACK_LAST_TOUCH" != "$HEAD_SHA" ]; then echo ""; echo "Commits since STACK was last synced:"; git log --oneline "$STACK_LAST_TOUCH"..HEAD; else echo "(STACK in sync with HEAD — no commits since last sync)"; fi`

If HEAD ≠ Last commit but the commits in between were NOT made in this session (i.e., another session committed in the meantime), surface the divergence:

```
⚠️  STACK was touched by another session since last /end-session.
Commits since recorded Last commit: <list>
Review these before proceeding — they may invalidate the Current location entry.
```

AskUserQuestion: proceed with sync, or pause to reconcile manually?

---

## Stage 3 — Gather session state

Session baseline = last commit that touched STACK.md (the previous /end-session sync). Commits after that = this session's work:

- !`BASELINE=$(git log -1 --format=%H -- STACK.md 2>/dev/null); echo "Session baseline: ${BASELINE:-<none>} (last STACK.md sync)"; echo ""; echo "Commits this session:"; git log --oneline "$BASELINE"..HEAD 2>/dev/null || echo "(none — STACK in sync with HEAD)"`
- Read STACK.md fully (all sections)
- Identify which Campaign / Phase / Step is active

Build a working summary for the interactive stage:
- Commits made this session (count + brief subjects)
- Files most touched (top 3-5)
- Plan files referenced

---

## Stage 4 — Verify Current location accuracy

Compare what STACK's Current location says vs actual git state:

| Field | STACK says | Actual |
|---|---|---|
| Pipeline | (read from STACK) | (infer from recent commits — e.g., `/change-heavy` in commit subjects?) |
| Pending | (read from STACK) | (any AskUserQuestion you remember being unresolved this session?) |
| Next move | (read from STACK) | (still accurate, or did this session change direction?) |
| Last commit | (read from STACK) | !`git rev-parse HEAD` |

For each field with drift, mark for update in Stage 7.

---

## Stage 5 — Detect phase completions

Scan commits this session for phase-completion patterns:
- Commit subjects matching `Step <p.s> RESOLVED`, `Phase <N> SHIPPED`, `Campaign CLOSED`, etc. (legacy history used `Cluster <N>` / `Tier <N>` subjects)
- STACK checkbox state — was any `- [ ]` flipped to `- [x]` this session?

If any phase or mini-phase closed:
- Mark for checkbox flip in Stage 7
- **Trigger Lessons audit** in Stage 6b (audit cadence: every Phase-close + at Campaign-close)
- **Flag the phase-close FU GC** for Stage 7: every FU homed at the closing phase/step must resolve / re-home / promote. This is NOT campaign-close-only — it fires at every phase close, and skipping it is what orphaned 13 FUs across P1/P2 (the Stage-7 verify gate now enforces it).

If none closed → Lessons audit is optional this session (note for user).

**Campaign-close detection (the heavy ritual; legacy: tier-close):** did this session flip the LAST open Phase in the active Campaign (all of the campaign's phase bullets now `[x]`)? If yes, flag a **campaign-close ritual** for Stage 7:
- Lessons forcing-function: EVERY in-force lesson must resolve to promote / carry-forward / drop (Stage 6c handles promotion).
- FU GC: every phase-local FU homed in the closing campaign must resolve / re-target / promote-to-Standing-FUs.
- Global-doc update: append the closed campaign's git range (`git log --oneline <first>..<last>`) + 1-para synopsis to `docs/plans/2026-05-31-refactor-overview.md`.
- Current location re-points to the next campaign's first Phase.

---

## Stage 6 — Interactive sync

Use AskUserQuestion for each of the following (one question at a time, multi-select where appropriate):

**6a. Lessons surfaced this session?**

Ask: "Did any durable lessons surface this session that should bind future sessions? (e.g., 'reality ≠ parent plan' discoveries, audit pattern improvements, recurring failure modes)"

Options:
- None this session
- Add 1-3 new In-force lessons (collect free text via follow-up)
- Add more (rare; flag if > 3)

For each new lesson:
- Record with `[audits survived: 0]` tag
- Pose the test questions:
  - "Articulable as a one-line rule?" (if not, refine or drop)
  - "Applies beyond this stack?" (if no, mark for Archive instead of In force)

**6b. Phase audit (if Stage 5 detected completions)**

For each existing In-force lesson, ask:
- KEEP IN FORCE — still binds active work
- RETIRE — no longer relevant; move to Archive
- DROP — superseded or proven wrong

For each KEEP IN FORCE, increment `[audits survived: N]`.

**6c. Promotion candidates (three-point filter — ALL three required)**

Surface lessons that pass: (1) `[audits survived: 3+]`, (2) generalizes beyond this stack, (3) articulable as a one-line rule. At a **campaign-close** (Stage 5), also surface obviously-fundamental lessons even at `survived: 1` (campaign-close + clear generalization overrides the count) — and EVERY remaining in-force lesson must resolve to promote / carry-forward / drop (forcing function).

For each candidate, ask: Promote / Keep-in-force / Drop. **On "Promote" — actually WRITE it** (don't just note it):
- Pick the destination: the relevant existing `memory/feedback_*.md` (e.g., decomp lessons → `feedback_decomp_philosophy.md`, pipeline lessons → `feedback_pipeline_checkpoints.md`) OR a new `memory/feedback_*.md` if no fit. Propose the destination; user confirms/redirects.
- Append the lesson as a one-line rule (+ a parenthetical pointer to the originating Phase/commit).
- REMOVE it from STACK (it's now auto-loaded from memory — no longer needs STACK residence).

Default threshold is 3 audits; tighten to 5 if memory grows past ~50 files.

**6d. FUs + bugs surfaced this session?**

Ask: "Did anything surface that needs tracking?" Then route each by KIND (per CLAUDE.md "Stack Discipline"):

- **Bug** (wrong/broken/at-risk now): route by **severity**. HIGH/security/deployed-code → STACK "Security / Action required" callout. Medium/low → FU lane, tagged as bug.
- **FU** (improvement): apply the 2-week filter (if no — and no concrete trigger will resurface it (→ Standing) — don't record), then tag `[type · pipeline] what — fix-shape — home: <Campaign>/<Phase>.<Step>|Standing — sev {anchor: <file> :: /pattern/}` (+ optional `gates:` `blocked-by`/`better-with`):
  - `type` from the taxonomy (type-design, silent-failure, etc.)
  - `pipeline` = `/cleanup-light` or `/change-heavy` (borderline → heavier); test-coverage & dedup FUs get the 5-second honesty check (test layer + callsite count) so the tag is true at filing
  - `home` = fully-qualified address `<Campaign>/<Phase>.<Step>` (e.g. `Sweep/1.1` → STACK phase-local) or `Standing` (→ Standing-FUs.md)
  - `anchor` = machine-verifiable citation: `{anchor: src/lib/x.ts :: /PATTERN/}` (`/.../` = always regex; the pattern must not contain `/`), a bare literal, or `{anchor: manual}` for architectural/absence FUs. New rows SHOULD anchor — `npm run verify:fus` flags drift.

**Then cluster (the batch-readiness report):** group this session's new FUs (+ optionally re-scan existing) by `type`. For each type-cluster, report the count and batch-readiness: *"type-design now ×9 → /change-heavy batch-ready; silent-failure ×4 → /cleanup-light."* (≥5 same-type → /change-heavy; 2-4 → /cleanup-light.) This is the lightweight inline version of `/cluster-fus` — surfaces batches forming so cleanup stays tractable.

**6e. Recommendation-calibration review.** Read `memory/recommendation-calibration.md`. If this session produced any recommendation flips (I recommended an option, Scott questioned it, the rec changed), append one row each with a root-cause tag. Then scan unreviewed rows: if ≥3 share a miscalibration tag (`scope-reflex-overdefer` / `under-weighted-evidence` / `risk-aversion`) → propose hardening `memory/feedback_scope_calibration.md`; if any `gold-plating-overcorrect` → propose relaxing it back toward the YAGNI guard; if `genuine-new-info` dominates → calibration is fine, mark reviewed. Lightweight — skip silently if the log gained no new rows this session.

---

## Stage 7 — Apply updates to STACK

Edit STACK.md with all changes collected in Stages 4–6:

- Current location's 4 fields refreshed
- New In-force lessons appended with `[audits survived: 0]`
- Survived In-force lessons: increment `[audits survived: N]`
- Retired lessons moved from In force → Archive
- New FUs filed to their `home` (phase-local → STACK; Standing → Standing-FUs.md); bugs routed by severity
- Promoted lessons written to memory + removed from STACK (Stage 6c)
- Phase checkboxes flipped if applicable
- **Phase-close FU GC (if ANY phase checkbox flipped this session):** every FU homed at the now-closed phase/step (`home: <Campaign>/<closed-phase>[.<step>]`) MUST resolve / re-home (→ `Standing` or an open phase) / promote. Don't rely on remembering this — the post-write verify gate below enforces `0 stale-home`. (This step's omission at P1- and P2-close orphaned 13 FUs.)

**If Stage 5 flagged a CAMPAIGN-CLOSE, also run the ritual here:**
- FU GC: every phase-local FU homed in the closed campaign resolved / re-targeted / promoted to Standing-FUs.md (nothing orphaned)
- Append the campaign's git range + 1-para synopsis to `docs/plans/2026-05-31-refactor-overview.md`; collapse the campaign's phases to one line in STACK Phases
- Re-point Current location to the next campaign's first Phase

Show the diff before writing. AskUserQuestion confirms each major edit.

**Post-write verify gate (run ALWAYS after writing STACK — not just when an anchor was filed):**
- !`if [ -f package.json ] && npm run 2>/dev/null | grep -q 'verify:fus'; then npm run verify:fus 2>&1 | grep -E '^(DRIFT|STALE-HOME|FU anchors:)'; else echo "FU integrity: n/a — no verify:fus script (light project)"; fi`
- It MUST report **0 drifted AND 0 stale-home** before Stage 9. A drifted anchor = a typo'd citation (cheapest to fix now). **`stale-home > 0` is a HARD STOP:** a phase was flipped to `[x]` but FU(s) are still homed there — the phase-close GC was incomplete. Re-home each flagged FU (→ `Standing` or an open phase; the `STALE-HOME` lines name which), re-run until `0 stale-home`, THEN commit. Never commit a close that leaves orphans — that is exactly the failure this gate exists to stop.

---

## Stage 8 — Push-eligibility check

Per [`feedback_tier_push_gate.md`](memory/feedback_tier_push_gate.md) (legacy filename): don't recommend push mid-Phase; wait for Phase-close.

- !`git rev-list --count origin/main..HEAD`
- Read STACK's Phases section — is the active Phase closed?

Output one of:
- **Mid-phase:** "Push state: N commits ahead; NOT push-eligible (Phase X still active). Continue accumulating."
- **Phase-close:** "Push state: N commits ahead; phase closed — push-eligible. Suggest pushing before next major effort starts."
- **End-of-effort:** "Push state: N commits ahead; entire stack closed — push, then run stack-close audit ritual (separate command, TBD)."

Record push state in Current location (Stage 7) — it's part of the handoff.

---

## Stage 9 — Commit (the handoff IS Current location; git is the forensic trail)

There is **no separate handoff file.** Stage 7 wrote the full handoff into STACK Current location (state · next-move-with-tactical-first-step · pending · standing rule). The richer orientation brief is *composed on demand* by `/start-session` from STACK's sections — not stored. **Git history is the forensic trail:** every /end-session commit captures that session's Current location, recoverable via `git show <sha>:STACK.md` and greppable by the address tag below.

- !`git diff --staged --stat 2>/dev/null; git status --short`

Show the user the diff. AskUserQuestion: commit?

If yes, stage what changed and commit with an **address-tagged subject** (makes the forensic trail greppable):
- Stage: `STACK.md` + `Standing-FUs.md` (+ the `memory/feedback_*.md` file if Stage 6c promoted a lesson; + the global doc if a campaign-close updated it).
- Commit:
  ```
  chore(stack): end-session sync — <Campaign>/<Phase> (<session n/m if known>)

  <one-line summary: phases closed, lessons promoted, FUs added/clustered>

  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
  Example subject: `chore(stack): end-session sync — Sweep/1 (3/4)`. Then `git log --grep="Sweep/1"` retrieves every handoff for that phase. (Legacy history used `Cluster <N>` subjects — grep those for pre-sweep sessions.)
- !`git status` to verify clean

If no: leave changes unstaged, surface them as "ready to commit when you're ready."

---

## Failure modes

| Situation | Handling |
|---|---|
| STACK.md doesn't exist | Halt. Suggest creating one or running /brainstorm to start a new effort. |
| STACK is empty (between major efforts) | Output: "No active stack. Run /brainstorm or /module-build to start next effort." |
| Working tree dirty + user declined all 3 options | Halt. Tell user to resolve manually and re-invoke. |
| Multi-session divergence + user wants to pause | Halt. Output reconciliation hints. |
| Memory promotion candidate surfaced but user declined | Leave lesson In force with current audit count. Re-surface next audit. |
| Working tree clean BUT no commits this session | Skip Stages 3-5 partially; still run interactive sync; Current location may be near-identical to before (acceptable). |
| Phase flipped `[x]` but the Stage-7 verify gate reports `stale-home > 0` | GC incomplete — FU(s) still homed at the just-closed phase. HALT before Stage 9: re-home each (→ `Standing` or an open phase), re-run `npm run verify:fus` until `0 stale-home`, then commit. |

---

## Output expectations

By end of /end-session, the user should have:

1. **STACK.md updated** — Current location IS the handoff (state + tactical next-move + standing rule); lessons audited/promoted; new FUs tagged + clustered
2. **One commit** (if approved): `chore(stack): end-session sync — <Campaign>/<Phase> (<n/m>)` — the address-tagged forensic trail
3. **No separate handoff file** — git history holds every session's Current location; `/start-session` composes the orientation brief on demand

Variance between sessions should drop dramatically because everything is in structured fields, not free-form prose — and the forensic trail is git, not a pile of handoff docs.
