# LedgerLoop — session steps

> **Paths.** `${CLAUDE_PLUGIN_ROOT}` in this doc is the toolkit's install folder: the folder above the `reference/` folder this file was read from. Claude Code substitutes it only in commands, agents and skills, not in a file read with the Read tool, so write the real path in its place before you run or open anything here.

What `/start-session`, `/end-session` and the FU commands do in a project whose mode line prints `LEDGER: migrated`. Each command reads its section, and any section that section points to, when it reaches the branch or pointer that names it. Policy and row formats: `${CLAUDE_PLUGIN_ROOT}/reference/ledger-lifecycle.md`. Every limit comes from the `LIMITS` line of `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs report`; never work from a remembered number.

**Next IDs.** `next-id` must print exactly one `L-<n>`, `FU-<n>` or `R-<n>` line. On anything else, stop and show the owner; never work out an ID by hand.

## Start

`/start-session` in a migrated project.

**Read.** The Stage 1 report replaces reading lessons and FUs in `STACK.md` and `Standing-FUs.md`, and Stage 1's `verify:fus` line: don't read `Standing-FUs.md`; read STACK only for Phases, Current location and the Security / Action required callout.

**Brief (Stage 4, and Stage 6's closing line).** The owner reads the brief to decide what to do first, so it holds only the next move, blockers and anomalies. Print this block in place of Stage 4's template:

    ═══ SESSION <n from the report header> · <Campaign> › <active phase: name and status, a few words> ═══
    NEXT     <Current location's Next move, in one or two plain sentences>
    STATE    <✓ tree clean or ⚠️ dirty> · <✓ no other session since the last sync or ⚠️ N commits> · <N> unpushed vs upstream (<Push state's gate: hold, or push-eligible>)
    BUGS     <one line per open item in the Security / Action required callout>
    OWED     <Pending items that are an action or a blocker this session, one line each>
    LEDGER   <✓ when the report has no stops, warnings, fired triggers, drifted anchors or stale homes> · <N> owner questions[ — <ID> blocks the next move, when one does]
    YOUR CALL <numbered decisions the owner must make before work starts>

- NEXT, STATE and LEDGER always print. Omit BUGS, OWED and YOUR CALL when they have nothing. Keep every line to one line, except NEXT.
- Paraphrase in plain words; never quote a STACK field whole. Leave out Pending items that are information or a hold not due this session.
- **Unchecked premises.** A recommendation in NEXT or YOUR CALL whose premise hasn't been opened this session (an FU body's claim about how a library or service behaves, a count, a cause) says `premise unchecked` and names the check that would confirm it, so it doesn't read as settled. The brief is read-only, so it flags the premise and the run that picks the item checks it before work (R-6, R-24).
- Not printed by default: lessons, group steps, the owner questions themselves, NOTES, the Global plan, the Pipeline field and recent commits. The lessons are in your context from the report; apply them while you work.
- A stop, warning, fired trigger, drifted anchor or stale home in the report replaces LEDGER's ✓ with ⚠️ and expands under the brief through the Warnings rows below. Owner questions never expand.
- **`full` argument:** after the brief and its warnings, print the Stage 1 report output as-is in a code block, then the last five commits.
- Stage 6's closing line is skipped: NEXT carries it.

**Warnings (Stage 5).** Emit under the brief, one line each. Emit these rows first, in this order, then the rest of Stage 5's table:

| Condition | Warning |
|---|---|
| The report's first warning is a previous-session override | `⚠️  The last session committed with Over-Limit-Override: <reason>. Fix that limit this session — a second override in a row is refused.` Emit it above every other warning. |
| The report lists stops | `⛔ Ledger stops (N): <each stop>. /end-session won't commit until they're fixed.` |
| The report lists fired triggers | `💡 Standing FU <ID> trigger fired — move it into <the group step PROPOSED ACTIONS names>.` |
| The report lists other warnings | `⚠️  Ledger warnings (N): <each warning>.` |

Skip these Stage 5 rows, because the report replaces them: FU anchor drift, orphaned FU home, promotion candidates, FU type-cluster, Standing FU trigger, and "Stack appears complete". Skip "Push-eligible" too: STATE carries it.

**Owner questions.** After the brief and its warnings, `/start-session` Stage 5.5 asks the owner the report's WAITING ON OWNER rows; their answers are applied by the run that picks the row, or in 6L-c.

## End

`/end-session` in a migrated project. Read this section before Stage 1, then run the command's stages with the replacements below.

**What this replaces:**
- **Stage 5:** the phase-close "Trigger Lessons audit" bullet and the "Lessons audit is optional" note — 6L-d acts on the report every session, and 6L-e handles the closing phase's group steps; and the campaign-close "Lessons forcing-function" bullet — 6L-e carries members with evidence into the next campaign.
- **Stage 6:** its opening line and 6a–6d. Run 6e, then 6L-a to 6L-e below.
- **Stage 7:** the three lesson bullets, the new-FUs bullet, the promoted-lessons bullet and the phase-close FU GC bullet, which 6L-b to 6L-e already wrote; and the campaign-close ritual's "FU GC" bullet, which 6L-e already dispositioned.
- **Stage 7's post-write verify gate:** its label, its two `!` lines and the checks under it. 7L runs instead, after Stage 7's edits are written.
- **Stage 9:** the "Stage:" and "Commit:" bullets. 9L runs instead.
- **Failure modes:** the memory-promotion row and the verify-gate row. 7L's halts apply instead.

**What still runs as written:** Stages 1–4; the rest of Stage 5; 6e; the rest of Stage 7 — refresh Current location, flip the phase checkboxes, and at a campaign close append to the global doc, replace every line of the campaign under `## Phases` with one `- [x] **<Campaign>** — COMPLETE <date>` line (the campaign's name alone in bold: the audit reads that form to stop on FUs still homed in the closed campaign), run the check review, and re-point Current location; Stage 8; the rest of Stage 9 — the commit and its report, the process-home logs bullet and the after-commit `git status --porcelain` check; and the other Failure-mode rows.

**Questions.** A migrated `/end-session` follows `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` and asks the owner nothing. Stage 1's dirty tree, Stage 2's divergence, 6L-a's evidence, a lesson pick, the 6L-d choices (applied as the report recommends) and the 6L-e close decisions are decided, applied and listed in Stage 9's report. A rulebook candidate and 6e's rule proposal are parked as owner decisions. A ledger stop the session can't fix is overridden, with its reason in the report (7L). An unreadable mode line, a refused override, the `rulebookMax` stop and a 7L result outside the four halt and report. Deferrals are never silent.

### 6L — Ledger sync

Runs after 6e, instead of 6a–6d. Write each row in 6L-b and 6L-c the moment it's decided, so the 6L-d report and each `next-id` call see this session's filings. Delete 6L-a's finished FU rows only once 6L-c is done: `next-id` sees an ID only in the ledger files and committed history, so deleting an uncommitted FU row earlier would let it issue that ID again.

**6L-a. Evidence — derived, never asked.** Read this session's own record — the work you did, the plan and its critiques, the commits — and write the footers yourself. No question: the footers are listed in Stage 9's report, and the owner corrects one after it in a follow-up commit.
- **Caught** → a lesson or rule that changed an outcome here: it stopped a real defect, a wrong plan step, or the reversal of a ratified decision. You must be able to name the moment in one line; if you can't, it isn't a catch. Footer: `Lesson-Caught: L-<n>`, or `R-<n>` for a rulebook rule.
- **Cited** → the work relied on it and nothing was wrong: a plan step, a pre-flight or a review followed it. Footer: `Lesson-Cited: L-<n>` or `R-<n>`. Naming a lesson in a summary is neither.
- **FU finished** → every FU this session's work completed. Delete each row once 6L-c is done (see above). If the commit that finished it has no `FU-Closed:` footer, the session commit carries `FU-Closed: FU-<n>`.
- **Nothing qualifies** → footer `Lesson-Check: none`. A session with no catch and no citation is a real outcome; record it rather than reaching for an ID.

**Accuracy beats volume.** Claim the fewest IDs that are true: an ID you cannot tie to a specific action this session doesn't go in, and a citation is never written up as a catch. The audit ranks lessons on these footers, so a padded answer promotes the wrong lesson and an empty one lets a live rule expire.

List each footer in Stage 9's report with its one-line reason, so the owner can correct a wrong ID in a follow-up commit. 6L-d's report and 7L's audit pass each lesson footer with `--evidence "<Key>: <value>"`, so this session's evidence counts before 9L commits it.

Footers from the session that filed a lesson don't count toward it, so don't add any for a lesson filed today.

**6L-b. New lessons, up to the `filed per session` limit.**
1. For each candidate apply two tests. *Does it tell you what to do at a decision point?* If not, it's a fact: write it now to `docs/lessons-reference.md` under `## Facts`. *Does the rule fit the `rule` character limit?* The backstory goes in the reference doc.
2. An entry already under `## Candidates` whose problem came back this session joins the candidates; say so in the summary. So does an evicted lesson whose problem came back: it keeps its own `L-<n>` (skip step 4), step 5 adds a dated `Revived:` line to its existing `## L-<n>` entry instead of a new entry, and it starts probation again.
3. If no more candidates pass both tests than the `filed per session` limit allows, file them without asking. Only when more pass, file the strongest — the one with the clearest catch this session — and list the choice in Stage 9's report. Write the others now to the reference doc under `## Candidates`, dated.
4. Get the ID by running via Bash: `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs next-id lesson` (see Next IDs).
5. Now append `- **L-<n>** <rule> → docs/lessons-reference.md#l-<n>` to STACK's `## Lessons`, and add a `## L-<n>` entry to the reference doc with the rule, the date, the campaign and phase, and the backstory.

Never write a memory file for a lesson.

**6L-c. FUs and bugs — filed without a question.** Route by KIND and apply the 2-week filter as CLAUDE.md says. List each filing in the chat summary as one plain line.

Close the list with one line: **`FUs filed this session: N (closed M, passed by P).`**, with P from 6L-d. N is the leading indicator for whether the plan-phase claim discipline in `/change-heavy` Stage 1 is paying off — those rules exist to stop wrong plans, wrong plans produce findings, and findings become FUs; its claims ledger was cut when Fable's plan findings didn't fall, and three rules remain. Report the numbers; do not act on a single session's value.
- **Owner answers.** An owner question the owner answered this session, at `/start-session` or in any message, that no run has applied yet is applied now and listed in Stage 9's report. Write `Owner ruling <date>: <answer>` at the end of the row's text, before its `— why not now:`, `— home:` or `— trigger:` part, then act on it:
  - a pick moves the row into this campaign's group step for its type as a STACK row (§ FUs: it keeps its ID and gains a home, an anchor and `— why not now: product: owner's ruling`), or closes it when a run already did the work. A pick on a parked rule or promotion (6e, 6L-e) runs that step's write instead;
  - a pick "not until <date or Campaign/step>" keeps the row in Standing: add `— why not now: product: owner's ruling` and replace `owner decision` with that `date` or `after` trigger, so it fires into a group step with the ruling on it;
  - a "no" deletes the row, its ID named in the commit body;
  - `Keep parked` leaves it for the next `/start-session` to ask again.
- **Doable in this campaign** → file it in STACK per § FUs. Review leftovers pass the filing bar (§ FUs) there first: fixed now (the same class, or a real issue in the area the change works, a minor tweak included), filed only for a separate area or the owner's call, with **both** a named reason **and** a pass of the 2-week filter, or dropped with a line in the commit body. A reviewer's "file as FU" grouping is input, not the filing decision.
- **Can't be done in this campaign** → `Standing-FUs.md`, with its ID from `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs next-id fu` (see Next IDs): `- **FU-<n>** [<type> · <rigor>] <what> — why not now: <product|risk|abstraction|own run>: <one line> — trigger: <date YYYY-MM-DD | after <Campaign>/<Phase or Step> | count {anchor: <file> :: /<pattern>/} >= N | owner decision — <question>>` (an owner decision needs no `why not now`, and takes `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking's shape, with its `recommended:` pick). No checkable trigger → don't file it. An issue in the area the session's runs worked isn't one of these: it's fixed in the run, and the audit stops on a Standing row for it too, unless its reason is `product` or it's an owner decision.
- **Scheduling.** A group step that has reached the `group step scheduled at` limit must be scheduled before the commit, or split; 6L-d decides which (tier 1) and lists it in Stage 9's report. Schedule a group step — then, or earlier when the owner asks for it — by adding `| <step> | <type> | <rigor> | <order> |` under `## Group steps` in the doc named by STACK's `<!-- ledger:step-order <Campaign>/<Phase> <doc> -->` line. The Order cell must be real, such as `after 7.10`; a row whose Order is empty, `—`, `-` or `TBD` doesn't count as scheduled.

**6L-d. Act on the report.** Run via Bash `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs report --evidence "<Key>: <value>"`, one `--evidence` per lesson footer from 6L-a; it now includes this session's filings and its lesson answer, and its clocks count this session's sync, so a probation or idle window that ends with this session shows now, in time to act on in this sync.
- **Automatic — apply now, without asking, and list each in the summary:** every proposal that starts `automatic:`; bumping the oldest probationer with no evidence; removing a lesson that finished probation with no evidence; moving a new lesson to `## Candidates` when every probationer has evidence.
- **The rest** — evictions, ties between lessons, moving fired Standing FUs into the named group step, idle group steps (schedule, merge or drop), and a group step at the `group step scheduled at` limit (its Order, or how to split it): apply the report's recommendation, or the most defensible choice when it makes none, and list each in Stage 9's report so the owner can change one afterwards (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`).
- A lesson that leaves: delete its STACK row and add `Outcome: <evicted | expired | became a check: <check> | promoted: R-<n>> — <date>` to its reference entry. Its ID is never reused.
- The report's NOTES never block a commit and aren't warnings. Don't raise them here; 6L-e offers them at a campaign close. The one read here is the anchor-sweep note: its count is 6L-c's `passed by P` (0 with no note), the FUs this session's runs left open in files they changed (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep).

**6L-e. Phase or campaign close (Stage 5 detected one).** Decided without asking (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`), one decision per item, never one for several, each listed in Stage 9's report with its reason.
- **Each open group step in the closing phase:** carry it forward (re-home its FUs to the next phase's group step for that type), the default; drop it on purpose when live code shows its work is done or moot (delete the rows and list the IDs in the commit body); or move it to Standing with a checkable trigger when the next phase can't do it.
- **Campaign close — lessons:** members with evidence inside the `evidence window` carry into the next campaign; the rest leave for the reference doc.
- **Campaign close — Standing rows whose `after` trigger names the closing campaign:** fire each now (move it into the next campaign's group step for its type), the default; or drop it on purpose when live code shows it's moot (delete the row and list its ID in the commit body).
- **Campaign close — the report's NOTES:** act on each `could become a check` and `rulebook candidate` note as below; the over-budget checks note goes to the retirement review (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-lifecycle.md` § Checks), and the other-campaigns and anchor-sweep notes are for information only. A note left alone gets one line in the report saying why; nothing is recorded.
  - `could become a check`: once a script or test enforces the lesson, it leaves with `Outcome: became a check: <that check>`. If the check doesn't exist yet, file it as an FU per § FUs, homed in the next campaign's group step for its type, since this campaign is closing.
  - `rulebook candidate`: park it as an owner decision (tier 3, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking), with the drafted one-line rule as the recommended pick. Once the owner approves it: get `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs next-id rule` (see Next IDs); append `- **R-<n>** <rule> → reference/rules.md#r-<n>` under `## Rules` in `~/.claude/CLAUDE.md`; add a `## R-<n>` section to `~/.claude/reference/rules.md` with `Rule:`, `Source: <Project> L-<n>`, `Promoted:` and `Backstory:` lines; delete the STACK row and record its outcome as 6L-d says. 9L commits your process home (`~/.claude`) when it's under version control in a repo of your own.

### 7L — Ledger audit

Replaces Stage 7's verify gate; its `!` output ran when /end-session started. After Stage 7's edits are written, run via Bash, with one `--evidence "<Key>: <value>"` per lesson footer from 6L-a:

    node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs audit --evidence "<Key>: <value>"; echo "exit $?"

Its result line is one of exactly four. Act on it:
- `AUDIT PASSED` → go on to Stage 8.
- `AUDIT FAILED` → apply every automatic proposal (6L-d lists them) and run the audit again. Then fix each remaining ⛔ stop and run it again until it passes. A stop that truly can't be fixed this session is overridden without asking (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): run `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs audit --override "<reason>"` with the same `--evidence` flags, and give the stop and the reason in Stage 9's report. The one exception is the stop for more than `rulebookMax` rulebook rules: the rulebook is the owner's (tier 3), so that stop halts and reports. The override limits itself: the next session is warned to fix the limit, and a second override in a row is refused.
- `OVERRIDE ACCEPTED` → 9L adds its `Over-Limit-Override:` line.
- `OVERRIDE REFUSED` → the last session already used one. Halt before 9L and report it (a true blocker): the stops must be fixed, and there is no second override.
- **Anything else** — a `LEDGER ERROR` line, `exit 3`, a stack trace, or none of the four lines → halt before Stage 8. Show the owner the output; the ledger is unchecked, so don't commit.

Each ⚠️ warning → fix it now if it takes minutes; otherwise name it to the owner in one line.

### 9L — Commit

Stage 9, with these differences:
- **Stage by explicit path:** `STACK.md`, `Standing-FUs.md`, `docs/lessons-reference.md`, the campaign plan doc if a group step changed, the global doc if a campaign close updated it, and `docs/checks.md` with the files of each check the check review merged or retired. Never a memory file.
- **Footers** go directly above `Co-Authored-By`, with no blank line between — git silently drops footers after a blank line. In order: every `Lesson-Caught:` and `Lesson-Cited:` line from 6L-a, or `Lesson-Check: none`; every `FU-Closed:` line; `Over-Limit-Override: <reason>` only after `OVERRIDE ACCEPTED`; then `Phase: <Campaign>/<Phase>`. Example:

      chore(stack): end-session sync — DesignRevamp/7 (slice 3)

      Filed L-12, closed FU-944, scheduled the css-token-hygiene group step as 7.11.

      Lesson-Cited: L-4
      FU-Closed: FU-944
      Phase: DesignRevamp/7
      Co-Authored-By: <this session's attribution line>

- **After committing,** run via Bash `git log -1 --format='%(trailers:only)'` and confirm every footer you wrote is listed. A missing one means a blank line crept in: amend only if this commit is still HEAD and unpushed.
- **Process-home commits.** The process-home logs bullet runs as in Stage 9. A rulebook promotion (6L-e) is its own commit: if `~/.claude` (or the file) is under version control in a repo of your own, commit it there, staging by explicit path (`~/.claude/CLAUDE.md` and `~/.claude/reference/rules.md`), as `feat(rulebook): R-<n> from <Project> L-<n>` with the same attribution line.

## FUs

Filing and closing FUs in a migrated project, from any command. Every command that files or closes an FU points here.

**Filing a STACK FU.**
1. Get the ID: `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs next-id fu` (see Next IDs). Write the row before asking for the next ID.
2. Find the home: this campaign's current-phase group step for the FU's type. `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs report` lists them under GROUP STEPS; reuse that step, or create the next step number when the type has none. That number is one past the highest step number for this phase among `home:` values, step-order table rows and `Done:` lists — never taken from other numbers in STACK's prose.
3. Append the row to STACK's `## Follow-ups`: `- **FU-<n>** [<type> · <cleanup-light|change-heavy>] <what — fix shape> — why not now: <product|risk|abstraction|own run>: <one line> — home: <Campaign>/<Phase>.<Step> {anchor: <file> :: /<pattern>/}`. The type comes from CLAUDE.md's taxonomy; use `{anchor: manual}` for architectural or absence FUs.
4. Before committing the row, run `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs report` again and read its STOPS. A stop that names the row because it's in the area the session changed (§ The filing bar, below) means the row isn't filed: fix the issue in the run that changed that file, folding it into the live run when there is one, or in this one. Only the owner's call keeps it: `why not now: product`, or an owner decision parked in Standing.

Filing never writes a `## Group steps` row: the `home:` values are the group, and the row is written only when the step is scheduled (§ End, 6L-c).

**Rows stay in their own section.** A lesson row lives only under STACK's `## Lessons` and a STACK FU row only under its `## Follow-ups`, one section of each; `ledger.mjs audit` stops on a second section and on a row anywhere else, such as a lesson or FU row pasted into Current location. Quote an example row in a `>` blockquote instead.

**The filing bar.** Work noticed during a change is a review leftover: `/change-heavy`'s Stage 5 sibling patterns, Stage 7 declined-but-valid findings and a validated-no-action close's adjacent observations; `/cleanup-light`'s Stage 1.5 adjacent observations and Stage 2 out-of-scope work; `/page-implement`'s Stage 1 out-of-scope work and Stage 2 sibling patterns; anything an Adjudicator MISSED line or `/pre-commit-check` surfaces; and a check a Fable seat recommends, which is filed or dropped, never built in the run that recommends it. Each leftover gets exactly one outcome:
1. **Fix it now** when it's the same class as the change: the same defect or the same fix at another site (R-20). This is the default. **Fix in the moment:** a real issue in the area the change works, the same feature, flow or files, is fixed now too, whatever its class, because a new run costs far more than finishing it in this one. A **minor tweak** is the smallest such fix: a few lines in a file the change already touches that need no plan of their own and add no abstraction, such as a typo in a comment or doc, a stale comment, dead code or a small defect. A larger one joins the run's plan, and hands a light run to `/change-heavy` when it meets the Heavy-rigor trigger. List each one in the run's report and commit body, and with the minor tweaks in the intended change its critics and Fable audit are given. A tweak to what a user sees, reads or does (design, copy, UX) that's genuinely the owner's, one no design, spec or ruling they approved covers, isn't fixed: it's parked (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking) and named in the run's report. An in-area fix of another kind than the work (a refactor beside a feature, a copy change) lands in the same run as its own commit, so the project's no-mixing rules hold. A small fix that passes the quick lane's entry test (`${CLAUDE_PLUGIN_ROOT}/commands/cleanup-light.md` § The quick lane) runs in a session that's already open: in the parent session as its own lane run, or folded into a live run working that area, where it joins that run's review and commit, never in a new session.
2. **File it** only when it's in a completely separate area or it's the owner's call: it passes CLAUDE.md's 2-week filter *and* has a named reason it can't be done in this change. An issue in the area has one reason only, a product decision (the owner's call). Work in another area may also wait on a real risk, an abstraction decision, or its own run: a completely separate area, not another class beside the change. Write it into the row as `— why not now: <product|risk|abstraction|own run>: <one line>` (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-lifecycle.md` § Records). `ledger.mjs audit` stops on a new row without it, and on a row filed this session whose anchor names a file the session changed, unless its reason is `product` or it's an owner decision. It files into this campaign's group step for its type; work this campaign can't do goes to Standing only through `/end-session` 6L-c, with a checkable trigger. An owner decision is parked by the run that meets it (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking).
3. **Drop it**, with one line in the commit body naming what was dropped and why. Git keeps the record.

A successor FU, the unfinished remainder of an FU or class this change worked on, is in the area by definition: the same run finishes it, unless the rest is the owner's call.

**The rigor tag** on a row is the pipeline the FU would need today: `change-heavy` only when it meets the project's CLAUDE.md Heavy-rigor trigger, else `cleanup-light`. The pipeline is decided again at pickup, so an older row's tag is advisory.

**Legacy `/module-audit` findings.** The `<file:line> — <severity> — <issue> — (from /module-audit <date>-<module>)` shape, which `/module-audit` Stage 5 once appended for deferred findings, is legacy; `ledger.mjs audit` stops on it, bulleted or not. Rewrite one left in STACK as a STACK FU: `- **FU-<n>** [<type> · <cleanup-light|change-heavy>] <issue — fix shape> (from /module-audit <date>-<module>) — home: <Campaign>/<Phase>.<Step> {anchor: <file> :: /<pattern>/}`.

**When a group step starts, check its members against live code.** `/change-heavy` at Stage 0.5, before its plan is written, or `/cleanup-light` before it clears a group step's FUs as a batch, checks every member FU against live code and closes the ones already done, as below.

**Closing an FU.**
- Delete its row from `STACK.md` (or `Standing-FUs.md`). There is no completed log. Never cross a row out or tick it — `ledger.mjs audit` stops on that.
- The commit that finishes it carries `FU-Closed: FU-<n>`, one line per FU, directly above `Co-Authored-By`, with no blank line between (git drops a footer that follows a blank line).
- **`/change-heavy`, Done:** for each member FU this run finished, and each FU its Stage 5 anchor sweep closed, delete its row and put its `FU-Closed:` line in the commit that lands the work, drafting that message first and auditing it with `/pre-commit-check --message "<that message>"`; list those lines in the summary so the commit message carries them. A member closed in the live-code check gets its line on the commit that deletes its row.
- **`/cleanup-light`, Stage 6:** closing deletes the row, as above; nothing moves to a completed log. Stage 7 puts `FU-Closed: FU-<n>` in the commit message.
- **`/page-implement`, Stage 6, when its Stage 2 anchor sweep closed an FU** (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep): draft the commit message as `/cleanup-light`'s Stage 7 does below, with one `FU-Closed: FU-<n>` line per closed FU, audit it with `/pre-commit-check --message "<that message>"`, and commit with that exact message.
- **`/cleanup-light`, Stage 7, when this run closed an FU in Stage 1.5, the Stage 2 anchor sweep or Stage 6:** in step 1, also stage `Standing-FUs.md` if it changed. In step 2, draft the commit message yourself: a conventional subject, a body saying what changed, then one `FU-Closed: FU-<n>` line per closed FU directly above `Co-Authored-By: <this session's attribution line>`, with no blank line between. Invoke `/pre-commit-check --message "<that message>"` instead of the no-argument form, so its commit-body check audits the message that will be committed, and commit with that exact message.
- **A close with no commit of its own** (a validated-no-action close skips `/cleanup-light` Stage 7): name every FU this run closed, so the next `/end-session` 6L-a picks them up and puts their `FU-Closed:` footers on the session commit.

## Cluster

`/cluster-fus` in a migrated project. Clustering already happened at filing — every STACK FU sits in a group step — so skip Stages 2–5.
1. Run via Bash `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs report`.
2. Report each group step (home, type, FU count, rigor, scheduled or not, sessions idle); anything unplaced (malformed rows under STOPS); fired triggers; and owner questions (WAITING ON OWNER).
3. Recommend one group step to schedule next: any unscheduled group step at the `group step scheduled at` limit on the report's `LIMITS` line first (the audit stops on those), otherwise the largest unscheduled one.
4. Emit the Done telemetry with `clusters` = group steps, `batch_ready` = group steps at 2 or more FUs, `untagged` = malformed rows.
