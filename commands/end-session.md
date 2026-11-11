---
description: End-of-session sync. Writes the handoff INTO STACK.md Current location (no separate file), runs the lessons audit + promotion, surfaces + clusters new FUs, GC's FUs homed at any just-closed phase (verify gate blocks a close that leaves orphans), verifies working tree, commits with an address-tagged subject. Git history is the forensic trail. Invoke at session end or when context runs low.
argument-hint: "[optional]"
allowed-tools: Read, Write, Edit, Bash, Skill
disallowed-tools: AskUserQuestion
---

# /end-session

You are running the **/end-session** sync. The user is wrapping up a session and needs STACK.md updated + a self-contained handoff prompt generated so the next session resumes cleanly without prose-handoff variance.

User's invocation argument: **$ARGUMENTS**

**Core principle:** STACK is the canonical continuity ledger. End-of-session sync replaces free-form handoffs. Every step here either captures state to STACK or generates the orientation brief.

- Ledger mode: !`node "${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs" mode 2>&1 || echo "LEDGER: unavailable"`

**Ledger branch** — act on the mode line before Stage 1:
- `LEDGER: migrated` → read `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § End before Stage 1 and follow it. It names the stages and bullets below that it replaces; the rest run as written.
- `LEDGER: unavailable`, or a line starting `LEDGER ERROR` → ledger.mjs didn't run, so this command can't tell whether the project is migrated. Run Stages 1–5, then halt and show the owner the error line (a broken tool, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`). The legacy stages run only once the owner says the project isn't migrated; never fall back silently.
- A line starting `LEDGER: not migrated` or `LEDGER: not a stack project` → follow the stages as written. Any other output, or no mode line at all → treat it as `LEDGER: unavailable`.

---

## Stage 1 — Working tree check (gate)

- !`git status --porcelain`
- !`git diff --stat`

If working tree is clean → proceed to Stage 2.

If dirty and every dirty path is already named as intentional WIP in Current location's Pending → proceed without asking (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`), say so in one line, and never stage those paths.

Otherwise decide without asking (tier 1) and name every unexplained path in the Stage 9 report:
- **This session's own uncommitted work** → commit it first, through `/pre-commit-check`; when it's intentional work in progress, record it in Current location's "Pending" field instead.
- **Anything else** (another author's work in progress) → record it in Current location's "Pending" field and never stage it. Never stash it.

Never proceed silently past an unexplained dirty tree.

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

If every intervening commit is this session's, or is explained by a plan doc or STACK, proceed and name them in one line (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`). Otherwise reconcile without asking: read each intervening commit, carry what it changed into Current location, and name the commits in the Stage 9 report.

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
| Pending | (read from STACK) | (any question left unanswered, or owner item parked, this session?) |
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
- **Flag the phase-close FU GC** for Stage 7: every FU homed at the closing phase/step must resolve / re-home / promote. This is NOT campaign-close-only — it fires at every phase close, and skipping it orphans FUs (the Stage-7 verify gate enforces it).

If none closed → Lessons audit is optional this session (note for user).

**Campaign-close detection (the heavy ritual; legacy: tier-close):** did this session flip the LAST open Phase in the active Campaign (all of the campaign's phase bullets now `[x]`)? If yes, flag a **campaign-close ritual** for Stage 7:
- Lessons forcing-function: EVERY in-force lesson must resolve to promote / carry-forward / drop (Stage 6c handles promotion).
- FU GC: every phase-local FU homed in the closing campaign must resolve / re-target / promote-to-Standing-FUs.
- Global-doc update: append the closed campaign's git range (`git log --oneline <first>..<last>`) + 1-para synopsis to `docs/plans/<YYYY-MM-DD>-refactor-overview.md`.
- Current location re-points to the next campaign's first Phase.
- Stage 8's `/code-review ultra` reminder, when the campaign was built on a branch other than the default branch.

---

## Stage 6 — Sync

Decide each of the following from the session's own record without asking (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`) and list every decision in the Stage 9 report. A promotion that writes memory and 6e's rule proposal change what loads in every session, so they're the owner's (tier 3): park each as an owner decision with the drafted text as the recommended pick, and write nothing until they answer.

**6a. Lessons surfaced this session?**

Decide from the session's record whether any durable lessons surfaced that should bind future sessions (e.g., 'reality ≠ parent plan' discoveries, audit pattern improvements, recurring failure modes):
- None this session
- 1–3 new In-force lessons, each written as a one-line rule from the session's own evidence
- More than 3 is rare: file the strongest three and flag the rest in the Stage 9 report

For each new lesson:
- Record with `[audits survived: 0]` tag — **in STACK ONLY.**
- ⛔ **Do NOT write a permanent-memory file for a new lesson.** A memory file is written at PROMOTION (Stage 6c) and nowhere else. Writing one at filing time bypasses the three-point filter entirely, auto-loads an unearned rule into every future session, and leaves the STACK counter measuring a promotion that already silently happened. If a lesson feels obviously fundamental at filing, say so and let Stage 6c's campaign-close override promote it *on the record* — do not pre-write the file.
- Bump the `<!-- net-in-force: N -->` marker in STACK's lessons header (the verify gate asserts it).
- Pose the test questions:
  - "Articulable as a one-line rule?" (if not, refine or drop)
  - "Applies beyond this stack?" (if no, mark for Archive instead of In force)

**6b. Phase audit (if Stage 5 detected completions)**

For each existing In-force lesson, decide:
- KEEP IN FORCE — still binds active work
- RETIRE — no longer relevant; move to Archive
- DROP — superseded or proven wrong

For each KEEP IN FORCE, increment `[audits survived: N]`.

**6c. Promotion candidates (three-point filter — ALL three required)**

Surface lessons that pass: (1) `[audits survived: 3+]`, (2) generalizes beyond this stack, (3) articulable as a one-line rule. At a **campaign-close** (Stage 5), also surface obviously-fundamental lessons even at `survived: 1` (campaign-close + clear generalization overrides the count) — and EVERY remaining in-force lesson must resolve to promote / carry-forward / drop (forcing function).

For each candidate, decide Promote / Keep-in-force / Drop. A Promote is parked as an owner decision, with the destination and the one-line rule as the recommended pick; Keep and Drop are listed in the Stage 9 report. **Once the owner approves a Promote — actually WRITE it** (don't just note it):
- Pick the destination: the relevant existing `memory/feedback_*.md` (one file per theme, such as decomposition or pipeline lessons) OR a new `memory/feedback_*.md` if no fit. Name the destination in the parked row, where the owner can redirect it.
- Append the lesson as a one-line rule (+ a parenthetical pointer to the originating Phase/commit).
- REMOVE it from STACK (it's now auto-loaded from memory — no longer needs STACK residence) and **decrement the `<!-- net-in-force: N -->` marker**. Leave a tombstone line naming the destination file, so the promotion is auditable from STACK alone.
- **Before writing any file, check it does not already exist.** If a memory file for this lesson is already present, the lesson was pre-written at filing (the Stage 6a violation): verify the file is a strict SUPERSET of the STACK row, fold forward any increment-evidence that exists ONLY in STACK — destination before source — and then remove the row. Never delete the STACK row on a name match alone.

Default threshold is 3 audits; tighten to 5 if memory grows past ~50 files.

**6d. FUs + bugs surfaced this session?**

Decide from the session's record what surfaced that needs tracking. Then route each by KIND (per CLAUDE.md "Stack Discipline"):

- **Bug** (wrong/broken/at-risk now): route by **severity**. HIGH/security/deployed-code → STACK "Security / Action required" callout. Medium/low → FU lane, tagged as bug.
- **FU** (improvement): apply the 2-week filter (if no — and no concrete trigger will resurface it (→ Standing) — don't record), then tag `[type · pipeline] what — fix-shape — home: <Campaign>/<Phase>.<Step>|Standing — sev {anchor: <file> :: /pattern/}` (+ optional `gates:` `blocked-by`/`better-with`):
  - `type` from the taxonomy (type-design, silent-failure, etc.)
  - `pipeline` = `/change-heavy` only when the FU meets the project's CLAUDE.md Heavy-rigor trigger, else `/cleanup-light` (borderline → heavier); test-coverage & dedup FUs get the 5-second honesty check (test layer + callsite count) so the tag is true at filing
  - `home` = fully-qualified address `<Campaign>/<Phase>.<Step>` (e.g. `Sweep/1.1` → STACK phase-local) or `Standing` (→ Standing-FUs.md)
  - `anchor` = machine-verifiable citation: `{anchor: src/lib/x.ts :: /PATTERN/}` (`/.../` = always regex; the pattern must not contain `/`), a bare literal, or `{anchor: manual}` for architectural/absence FUs. New rows SHOULD anchor — `ledger.mjs audit` (migrated) or `npm run verify:fus` (legacy) flags drift.

**Then cluster (the batch-readiness report):** group this session's new FUs (+ optionally re-scan existing) by `type`. For each type-cluster, report the count and batch-readiness: *"type-design now ×9 → /cleanup-light batch-ready; silent-failure ×4 (alters an auth path) → /change-heavy."* (2 or more same-type is a batch; its pipeline is the project's Heavy-rigor trigger, not its size.) This is the lightweight inline version of `/cluster-fus` — surfaces batches forming so cleanup stays tractable.

**6e. Recommendation-calibration review.** Read the repository's own `memory/recommendation-calibration.md` when the repo root has one (a repo-local log, not your auto-memory); otherwise read the shared `~/.claude/data/recommendation-calibration.md`. If this session produced any recommendation flips (I recommended an option, the owner questioned it, the rec changed), append one row each, to the log you read, with a root-cause tag. Then scan unreviewed rows: if ≥3 share a miscalibration tag (`scope-reflex-overdefer` / `under-weighted-evidence` / `risk-aversion`) → propose hardening the scope-calibration rule (rulebook rule R-20); if any `gold-plating-overcorrect` → propose relaxing it back toward the YAGNI guard; if `genuine-new-info` dominates → calibration is fine, mark reviewed. Lightweight — skip silently if the log gained no new rows this session.

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
- **Phase-close FU GC (if ANY phase checkbox flipped this session):** every FU homed at the now-closed phase/step (`home: <Campaign>/<closed-phase>[.<step>]`) MUST resolve / re-home (→ `Standing` or an open phase) / promote. Don't rely on remembering this — the post-write verify gate below enforces `0 stale-home`. (Omitting this step at a phase close orphans FUs.)

**If Stage 5 flagged a CAMPAIGN-CLOSE, also run the ritual here:**
- FU GC: every phase-local FU homed in the closed campaign resolved / re-targeted / promoted to Standing-FUs.md (nothing orphaned)
- Append the campaign's git range + 1-para synopsis to `docs/plans/<YYYY-MM-DD>-refactor-overview.md`; collapse the campaign's phases to one line in STACK Phases
- Re-point Current location to the next campaign's first Phase
- Check review: run `node "${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs" checks`, then keep, merge, move out of its gate or retire each check in `docs/checks.md`, decided without asking and one line each in the commit body (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-lifecycle.md` § Checks). A project with no registry writes one first.

List the edits in the Stage 9 report.

**Post-write verify gate (run ALWAYS after writing STACK — not just when an anchor was filed).** The two `!` lines below run when /end-session starts, before anything is written, so their output shows the previous STACK. After writing, run the same two commands via Bash (without the leading `!` and backticks) and apply the checks below to that output:
- !`if [ -f package.json ] && npm run 2>/dev/null | grep -q 'verify:fus'; then npm run verify:fus 2>&1 | grep -E '^(DRIFT|STALE-HOME|FU anchors:)'; else echo "FU integrity: n/a — no verify:fus script (a migrated project's ledger.mjs audit checks anchors; a light project has none)"; fi`
- !`if [ -f STACK.md ] && grep -q '^<!-- net-in-force:' STACK.md; then d=$(grep -o '^<!-- net-in-force: [0-9]* -->' STACK.md | grep -o '[0-9]*'); a=$(grep -c '^- .*\[audits survived:' STACK.md); if [ "$d" = "$a" ]; then echo "Net in force: $a ok"; else echo "NET-IN-FORCE MISMATCH: declared $d, actual $a"; fi; else echo "Net in force: n/a — no marker in STACK"; fi`

It MUST report **`Net in force: N ok`**. A `NET-IN-FORCE MISMATCH` means the lessons ledger is lying about its own size — either a row was added/removed without bumping the marker, or a lesson was promoted without being removed. Either one lets a duplicated lesson stay invisible. The check is armed in both directions: a declared count one too high fails it, and so does a row silently deleted.

⚠️ **What this gate does NOT buy:** it counts rows, it does not compare them to the memory store. A lesson that lives in BOTH places while the marker is correctly updated will still pass. Only Stage 6a's prohibition prevents that class; the count check catches the drift it causes downstream. To check the store directly, list the counted rows against `ls ~/.claude/projects/<project>/memory/` and read both bodies — a name match is not proof of equivalence.
- It MUST report **0 drifted AND 0 stale-home** before Stage 9. A drifted anchor = a typo'd citation (cheapest to fix now). **`stale-home > 0` is a HARD STOP:** a phase was flipped to `[x]` but FU(s) are still homed there — the phase-close GC was incomplete. Re-home each flagged FU (→ `Standing` or an open phase; the `STALE-HOME` lines name which), re-run until `0 stale-home`, THEN commit. Never commit a close that leaves orphans — that is exactly the failure this gate exists to stop.

---

## Stage 8 — Push-eligibility check

Don't recommend a push mid-Phase; wait for Phase-close.

- !`git rev-list --count origin/main..HEAD`
- Read STACK's Phases section — is the active Phase closed?

Output one of:
- **Mid-phase:** "Push state: N commits ahead; NOT push-eligible (Phase X still active). Continue accumulating."
- **Phase-close:** "Push state: N commits ahead; phase closed — push-eligible. Suggest pushing before next major effort starts."
- **End-of-effort:** "Push state: N commits ahead; entire stack closed — push, then run stack-close audit ritual (separate command, TBD)."

**Campaign close on a branch — `/code-review ultra` before the merge.** Current branch, then the default branch:
- !`git rev-parse --abbrev-ref HEAD; d=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##'); echo "${d:-unknown}"; [ -n "$d" ] && { git merge-base --is-ancestor HEAD "origin/$d" && echo merged || echo "not merged"; }`

The output is the current branch, the default branch, and whether HEAD is already in the default branch. Add the line below to the output when the current branch isn't the default branch and either of two things holds. Either Stage 5 flagged a campaign close, or Current location already carries this line and the check reads `not merged`. (A default of `unknown` counts as "isn't" unless the current branch is `main` or `master`.)

*"Before merging `<branch>` into `<default>`, run `/code-review ultra` yourself. It reviews this branch against `<default>` in the cloud, it's billed, and only you can start it. Merge once its findings are dispositioned."*

Carry the line in Current location's push state, so every later sync repeats it until the check reads `merged`. Then drop it. Claude never launches `/code-review ultra`, whether through Bash, a hook or anything else.

Record push state in Current location (Stage 7) — it's part of the handoff.

---

## Stage 9 — Commit (the handoff IS Current location; git is the forensic trail)

There is **no separate handoff file.** Stage 7 wrote the full handoff into STACK Current location (state · next-move-with-tactical-first-step · pending · standing rule). The richer orientation brief is *composed on demand* by `/start-session` from STACK's sections — not stored. **Git history is the forensic trail:** every /end-session commit captures that session's Current location, recoverable via `git show <sha>:STACK.md` and greppable by the address tag below.

- !`git diff --staged --stat 2>/dev/null; git status --short`

Commit without asking (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § The report): stage what changed and commit with an **address-tagged subject** (makes the forensic trail greppable), then report every decision the sync made — evidence footers, lessons filed or picked, promotions, FUs filed and closed, ledger choices, unexplained dirty paths — with the commit hash:

- Stage: `STACK.md` + `Standing-FUs.md` (+ the `memory/feedback_*.md` file if Stage 6c promoted a lesson; + the global doc if a campaign-close updated it; + `docs/checks.md` and the files of each check its check review merged or retired).
- Commit:
  ```
  chore(stack): end-session sync — <Campaign>/<Phase> (<session n/m if known>)

  <one-line summary: phases closed, lessons promoted, FUs added/clustered>

  <this session's attribution line>
  ```
  Example subject: `chore(stack): end-session sync — Sweep/1 (3/4)`. Then `git log --grep="Sweep/1"` retrieves every handoff for that phase. (Legacy history used `Cluster <N>` subjects — grep those for pre-sweep sessions.)
- **Process-home logs (every project).** This session's commands may have appended rows to `~/.claude/data/` (the logs and `mobile-audit-notes.md`). If `~/.claude` (or the file) is under version control in a repo of your own, commit it there: run via Bash `git -C <that repo> status --porcelain -- <those paths>`. If it lists changes, commit exactly those paths: `git -C <that repo> add -- <those paths>`, then `git -C <that repo> commit -q -m "chore(data): <Project> log rows" -m "<this session's attribution line>" -- <those paths>`, where `<Project>` is the name in the mode line (or the repository's directory name).
- After committing, run via Bash `git status --porcelain` in this repository and, when those logs are under version control, `git -C <that repo> status --porcelain -- <those paths>`; neither may list anything except the work in progress Stage 1 recorded in Current location's Pending field — otherwise halt and show the owner.

---

## Failure modes

| Situation | Handling |
|---|---|
| STACK.md doesn't exist | Halt. Suggest creating one or running /module-build to start a new effort. |
| STACK is empty (between major efforts) | Output: "No active stack. Run /module-build to start the next effort." |
| Dirty paths that are neither this session's nor named in Pending | Recorded in Pending, never staged, named in the Stage 9 report. |
| Multi-session divergence | Reconciled into Current location; the commits are named in the Stage 9 report. |
| The owner declines a parked memory promotion | Leave the lesson In force with its audit count. Re-surface it at the next audit. |
| Working tree clean BUT no commits this session | Skip Stages 3-5 partially; still run the Stage 6 sync; Current location may be near-identical to before (acceptable). |
| Phase flipped `[x]` but the Stage-7 verify gate reports `stale-home > 0` | GC incomplete — FU(s) still homed at the just-closed phase. HALT before Stage 9: re-home each (→ `Standing` or an open phase), re-run `npm run verify:fus` until `0 stale-home`, then commit. |

---

## Output expectations

By end of /end-session, the user should have:

1. **STACK.md updated** — Current location IS the handoff (state + tactical next-move + standing rule); lessons audited/promoted; new FUs tagged + clustered
2. **One commit**: `chore(stack): end-session sync — <Campaign>/<Phase> (<n/m>)` — the address-tagged forensic trail
3. **No separate handoff file** — git history holds every session's Current location; `/start-session` composes the orientation brief on demand

Variance between sessions should drop dramatically because everything is in structured fields, not free-form prose — and the forensic trail is git, not a pile of handoff docs.
