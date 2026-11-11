# LedgerLoop — the lesson and FU lifecycle

> **Paths.** `${CLAUDE_PLUGIN_ROOT}` in this doc is the toolkit's install folder: the folder above the `reference/` folder this file was read from. Claude Code substitutes it only in commands, agents and skills, not in a file read with the Read tool, so write the real path in its place before you run or open anything here.

How Stack projects file, place, score, close and prune lessons and follow-ups (FUs). In projects marked `"migrated": true` in `~/.claude/projects.json`, `node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs audit` checks the stops and warnings listed under The audit; the rest is the session's to apply. Unmigrated projects keep their old process.

Session steps — what `/start-session`, `/end-session`, `/cluster-fus` and the commands that file or close FUs do in a migrated project — are in `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md`, read on demand.

## Numbers

`${CLAUDE_PLUGIN_ROOT}/lib/rules.mjs` is authoritative; `${CLAUDE_PLUGIN_ROOT}/tests/lifecycle-doc.test.mjs` fails if this table disagrees with it. `ledger.mjs report` prints every value except `checkFlagCitations` and `rulebookPromotionPhases` on its `LIMITS` line. This table is the only place in this doc that states a limit; the prose below names each one by its key. Commands and the rulebook point at the `LIMITS` line instead, and the same test fails if a command, the rulebook or this doc's prose restates a number.

| Rule | Value | Key |
|---|---|---|
| Lesson slots in STACK | 20 | `lessonSlots` |
| Member slots | 15 | `memberSlots` |
| Probation slots, which members can't use | 5 | `probationSlots` |
| Probation length in sessions | 5 | `probationSessions` |
| Lessons filed per session | 1 | `lessonsFiledPerSession` |
| Evidence window in sessions | 20 | `evidenceWindowSessions` |
| Longest rule in characters | 200 | `ruleMaxChars` |
| Citations with no catches that flag a lesson as a candidate check | 3 | `checkFlagCitations` |
| Rulebook rules | 25 | `rulebookMax` |
| Separate phases with catches for a rulebook candidate | 2 | `rulebookPromotionPhases` |
| FUs in one group step that force scheduling | 5 | `groupStepScheduleAt` |
| Sessions untouched before a group step is flagged | 10 | `groupStepIdleSessions` |

A **session** ends with one `chore(stack): end-session sync` commit. Filing dates, probation and idleness all count those commits; nothing is hand-counted. The session that files a lesson doesn't count toward its probation, which ends at the audit deciding the `probationSessions`-th session after it. That audit, the one run with `--evidence`, counts its own session's sync, since the sync is about to land. Every other run counts up to the last sync, so it finds what that sync's audit decided and never ends a probation or an idle window before an audit has decided it. There, a lesson filed since the last sync shows as `new` and holds no probation slot until its session's audit.

**History stays linear.** Everything above is read from the commits reachable from HEAD. Once a project is migrated, never squash or rebase its history; merge with `--ff` or `--no-ff`. Lesson listings and group-step touches follow HEAD's first-parent line, so a row added on a branch merged with `--no-ff` counts as added by the merge commit. IDs are read from every commit, so a row a branch added and dropped keeps its ID. A squash erases the `Ledger-Migration` commit, and every migrated member turns into a probationer. The audit warns when no `Ledger-Migration` commit is reachable.

## Records

    Lesson (STACK ## Lessons):
    - **L-74** Prove every zero with a positive control before you believe it. → docs/lessons-reference.md#l-74

    STACK FU (STACK ## Follow-ups):
    - **FU-212** [css-token-hygiene · change-heavy] Retire the banner's accent fill — neutral surface — why not now: abstraction: the neutral surface token lands in 7.11 — home: DesignRevamp/7.11 {anchor: src/styles/components.css :: /\.banner/}

    Standing FU (every "- " line in Standing-FUs.md is one):
    - **FU-88** [observability · change-heavy] Stale-data banner — why not now: own run: needs the freshness timestamps P8 adds — trigger: after DesignRevamp/8 {anchor: src/lib/data-sources/pricing.ts :: fetchPrices}

    Parked owner decision (a Standing FU any run writes; ${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md § Parking):
    - **FU-301** [ux-copy · cleanup-light] Empty-state text for the invoices table — recommended: "No invoices yet — add one to start tracking"; docs/mockups/invoices-empty.png — trigger: owner decision — which empty-state text?

    Step-order pointer (in STACK, one per phase):
    <!-- ledger:step-order DesignRevamp/7 docs/plans/2026-07-15-design-revamp-p7.md -->

    Scheduled group step (in that doc, under ## Group steps, in a | Step | Group type | Rigor | Order | table; written when the step is scheduled):
    | 7.11 | css-token-hygiene | change-heavy | after 7.10 |

    Campaign close (in STACK ## Phases, replacing every line of the campaign):
    - [x] **DesignRevamp** — COMPLETE 2026-10-30

- IDs are never reused: `L-<n>` and `FU-<n>` per project, `R-<n>` for the rulebook. `ledger.mjs next-id lesson|fu|rule` gives the next one.
- An FU row names why it waits, as the last part of its text before ` — home:` or ` — trigger:`: `— why not now: <product|risk|abstraction|own run>: <one line>` — a product decision, a real risk, an abstraction decision, or work that needs its own run (a completely separate area, not the feature, flow or files the change that found it works). A row in that area takes `product` only (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs). The audit holds rows from the project's `reasonsFrom` ID in `~/.claude/projects.json` on to it; older rows are grandfathered, and an `owner decision` row, a question rather than deferred work, needs none.
- Every FU is a `- ` list item, never a table row. A STACK FU carries at least one `{anchor: …}` (`{anchor: manual}` for architectural or absence FUs); a Standing FU may have none.
- Rigor is `cleanup-light` or `change-heavy`. Triggers are exactly: `date YYYY-MM-DD` · `after <Campaign>/<Phase or Step>` · `count {anchor: <file> :: /<pattern>/} >= N` · `owner decision — <question>`.
- A step is scheduled when its ID is the first cell of a table row in the doc the pointer names. A `## Group steps` row counts only with a real Order: an empty cell, `—`, `-` or `TBD` doesn't. Crossed-out rows never count.

## Footers

Directly above `Co-Authored-By`, with no blank line between — git silently drops footers after a blank line, and the audit warns when it finds one.

| Footer | Meaning |
|---|---|
| `Lesson-Caught: L-<n>` or `R-<n>` | The lesson, or a rulebook rule, changed the outcome: it stopped a real defect, a wrong plan step, or the reversal of a ratified decision. The commit says what. |
| `Lesson-Cited: L-<n>` or `R-<n>` | A plan, pre-flight or review relied on the lesson or rule, and nothing was wrong. |
| `Lesson-Check: none` | No lesson caught or was cited this session. |
| `FU-Closed: FU-<n>` | This commit finished the FU. The session deletes its row; the audit stops while it's still listed. |
| `Check-Caught: <check>` | A check in the project's `docs/checks.md` failed on this commit's work and changed it (§ Checks). Several checks are comma-separated. |
| `Phase: <Campaign>/<Phase>` | On every session commit. |
| `Over-Limit-Override: <reason>` | Commit past a broken limit. Never in two sessions in a row. |
| `Ledger-Migration: <Project>` | Once, on the commit that migrates a project. Lessons listed by it start as members. |

Naming a lesson in a summary is neither a catch nor a citation. Footers from the session that filed a lesson don't count toward it.

## Lessons

- **Filing.** At most `lessonsFiledPerSession` per session, the strongest candidates first. Others go to the reference doc under `## Candidates`, and are filed later only if their problem comes back. A fact that doesn't say what to do at a decision point goes to the reference doc, not STACK. The rule fits in `ruleMaxChars` characters; the backstory lives in the reference doc.
- **Probation.** A new lesson takes one of the `probationSlots` probation slots for `probationSessions` sessions. If every slot is taken, the oldest probationer with no evidence leaves automatically. If every probationer has evidence, the new lesson goes to the reference doc under `## Candidates` and can be filed again once a probation slot is free. Nothing waits in a queue.
- **After probation.** With evidence, it becomes a member if a member slot is free or it outranks the lowest-ranked member (who then leaves). Without evidence, it leaves.
- **Ranking.** Catches per session on the list, then citations per session. `/end-session` 6L-d breaks ties (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md`).
- **Evidence window.** A member with no evidence in the last `evidenceWindowSessions` sessions is proposed for eviction.
- **Leaving,** best outcome first: becomes a check (a script or test enforces it; the reference entry names it) · promoted to the rulebook (caught something in at least `rulebookPromotionPhases` separate phases and applies to any project; the owner approves) · evicted to the reference doc. Eviction is reversible: a revived lesson keeps its ID and starts probation again. The report counts revivals on its LESSONS line; frequent revivals mean the evidence window is too short.
- **Flag.** Cited at least `checkFlagCitations` times with no catches → it could become a check. A report note, never a warning or an action (see Notes under The audit).
- **Campaign close.** Members with evidence inside the evidence window carry into the next campaign; the rest move to the reference doc.

## FUs

- **STACK FUs** are work for the current campaign. Each is filed into the phase's group step for its type, created the first time that type is filed in the phase. The rows' `home:` values are the group, so filing never writes a `## Group steps` row. A group step's rigor is its heaviest member's, and a pickup re-decides it against the project's CLAUDE.md Heavy-rigor trigger. Review leftovers (Stage 5 sibling patterns, Stage 7 declined-but-valid findings, adjacent observations) pass the filing bar in `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs first. The same class, and a real issue in the area the change works (the same feature, flow or files, a minor tweak included), are fixed in the change unless it's the owner's call; anything else files here only with a named reason and a pass of the 2-week filter, or is dropped with a line in the commit body.
- **Scheduling.** A group step is scheduled when the step-order doc has a row for it with a real Order. Its `## Group steps` row, `| <step> | <type> | <rigor> | <order> |`, is written when it's scheduled: when it reaches `groupStepScheduleAt` FUs (it must be in the step order before `/end-session` commits, or be split), or earlier when the owner chooses. The row lists no FUs: a step's members are the rows whose `home:` names it. A group step that isn't scheduled and has gone untouched for `groupStepIdleSessions` sessions is flagged once per window of that many sessions: schedule it, merge it into another step, or drop it on purpose.
- **Closing.** The commit that finishes an FU carries `FU-Closed: FU-<n>`, and the session deletes the row. When a group step starts, its first task checks every member against live code and closes the ones already done. A crossed-out or checked-off row left in a file is a stop.
- **Close-out.** The owner can freeze a phase for close-out: its `## Phases` bullet names the date and the FUs it will finish (`close-out frozen <YYYY-MM-DD>: FU-120, FU-121, …`). From then on a new FU homes in the next open phase's group step for its type, unless it's a regression in code the frozen phase changed, and a Standing row that fires or is folded in during close-out goes there too. The frozen list still finishes in the closing phase. (Without the freeze, Standing rows pulled into a nearly finished phase produce new FUs homed back in it, so its finish line moves with every discovery.)
- **Phase close.** Each open group step is carried to the next phase, dropped on purpose (IDs listed in the closing commit), or moved to Standing with a checkable trigger. Never in bulk.
- **Standing FUs** are work that can't be done in the current campaign, each with one checkable trigger. Every session the audit tests every trigger; a fired trigger is proposed for the active campaign's group step for its type (the session moves it, § End 6L-d). An `after` trigger fires only for the current campaign, the one the latest `Phase:` footer names; a trigger naming another campaign waits, and `/end-session` fires or drops it when that campaign closes. A row without a checkable trigger is a stop. No cap. The 2-week filter still applies: not due in two weeks and no checkable trigger → don't record it. The one exception is an `owner decision` row, a question parked for the owner rather than deferred work: any run writes one (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking), with no named reason or 2-week pass, and the next `/start-session` asks it (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § Start).

## The audit

`node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs <mode>`, from inside the project:

| Mode | Used by | Result |
|---|---|---|
| `mode` | every command | `LEDGER: migrated`, `not migrated`, or `not a stack project` |
| `report [--summary] [--evidence "<footer>"]…` | `/start-session`, `/end-session` (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § End, 6L-d), `/cluster-fus`, and commands filing an FU (to find its group step) | Limits, lessons (with revivals), group steps, fired triggers, owner questions, anchors, checks, stops, warnings, notes, proposed actions, next IDs |
| `audit [--override "<reason>"] [--evidence "<footer>"]…` | `/end-session` (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § End, 7L), after writing | The report; exit 1 on any stop |
| `next-id lesson\|fu\|rule` | filing | The next free ID; `rule` works from any directory |
| `anchored [<file>…]` | `/cleanup-light`, `/change-heavy` and `/page-implement`, once the change is written (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep) | The open STACK and Standing FUs whose own anchors name the files the working tree changes against HEAD, untracked ones included, or the named files; the header counts the files it read |
| `checks` | `/end-session`'s check review at a campaign close (§ Checks); runs in any git checkout | Every check in `docs/checks.md`, slowest first, with its gate, run time and last catch, then the registry's warnings |
| `pilot` | the owner, after a migration's pilot sessions | The pilot pass checks since the `Ledger-Migration` commit; then its outcomes, reported and never a check: each session's FUs filed, closed with an `FU-Closed` footer and dropped without one, with the STACK and Standing totals, and its paperwork-only commits and paperwork share of changed lines (the ledger files and `docs/plans/` markdown) against the `baselineSessions` sessions before migration; then the warnings still standing for the owner; exit 1 when a check fails |

`--evidence` takes one of the open session's `Lesson-Caught`, `Lesson-Cited` or `Lesson-Check` footers per flag, so the audit that decides the session counts and checks its lesson answer before the session commit carries it. The flag also makes the clocks count the session's own sync, so the report shows what the next session will find. A flag the mode doesn't take, a misspelling such as `--evidences`, `-evidence` or `--evidence=…` included, prints the usage line and exits 2 before the project is looked up; a flag's own value is never read as a flag.

The script only reads. It never edits a ledger file: when a row has to change, the audit stops or proposes, and the session makes the edit. A broken script never fails open: when git fails, a checkout marked bare has no work tree, `~/.claude/projects.json` is invalid (a missing or blank field, a `path` that isn't absolute, a `reasonsFrom` that isn't an FU ID, or a key it doesn't know), two `~/.claude/projects.json` entries point at the same checkout, a checkout has a `STACK.md` that no `~/.claude/projects.json` entry points at, or anything else goes wrong, it prints `LEDGER ERROR: <message>` and exits 3. `/end-session` then halts and reports to the owner instead of falling back to the legacy stages, and the other commands that read the mode halt and report it before they file, close or cluster FUs.

**Stops** (the commit waits): more than `lessonSlots` lessons, `probationSlots` on probation or `memberSlots` members · more lessons filed this session than `lessonsFiledPerSession` · a lesson past probation with no evidence · duplicate IDs · a malformed lesson, FU or rulebook row, including a table-row FU, a STACK FU with no anchor, and a lesson or rule whose reference link names another item · a legacy `/module-audit` finding line, bulleted or not · STACK without a `## Lessons` or `## Follow-ups` heading, no Standing file, or a rulebook without a `## Rules` heading · more than one `## Lessons` or `## Follow-ups` section in STACK, or a lesson or FU row outside its own section · a reference doc that isn't a readable file · a lesson whose STACK listing ended with no `## L-<n>` entry, or with an entry that has no plain `Outcome: ` line — a bold `**Outcome:**` doesn't count, since the pilot reads only the plain shape · a group step at `groupStepScheduleAt` or more FUs outside the step order · a step-order doc that isn't a readable file, whatever the size of its group steps · a crossed-out or checked-off row · a Standing row with no checkable trigger, or one that can't be checked · an `FU-Closed` footer for a row still listed — a finished row not yet removed, or a new row that reused a closed ID · an FU row at or above the project's `reasonsFrom` ID with no `why not now` reason, other than an owner decision · an FU row filed this session, in neither STACK nor the Standing file at the last sync (nor rendered by a `Ledger-Migration` commit after it), whose own anchor names a file changed since that sync, committed or not, unless its reason is `product` or it's an owner decision: an issue in the area the session's runs worked is fixed in the run that found it (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs). The stop names the commits that changed the file; it can't judge a row anchored only `{anchor: manual}` · a list item under STACK's `## Phases` whose label starts with `P<n>` or `Phase <n>` in any case (under any bullet, and past any checkbox, emoji such as ✅ or 🏁, `~~`, emphasis, code span or link) that isn't a `- [ ] **P<n> …**` or `- [x] **P<n> …**` bullet, so the audit can't tell whether it's closed; a label that starts with anything else, such as a campaign close's `- [x] **<Campaign>** — COMPLETE`, isn't a phase line · a latest `Phase:` footer naming a campaign that no `## Phases` bullet label, `home:` value or step-order pointer in STACK names, case-sensitively, such as a misspelling — prose, including prose after a phase label, doesn't count · a stale-home check that couldn't run, because STACK has no phase bullet the check can read, open or closed, while FUs are homed in the current campaign; an open first phase with nothing closed yet is readable, and passes · an FU homed at a closed phase or step of the current campaign, where a zero-padded phase number such as `07.2` names the same unit as `7.2` · an FU homed in a campaign `## Phases` marks closed with a `- [x] **<Campaign>**` line, whichever campaign is current · more than `rulebookMax` rulebook rules.

**Warnings:** a rule over `ruleMaxChars` characters · probation ending with no evidence at the next audit that decides a session (the warning names that session) · a member with no evidence inside the evidence window · a listed lesson with no `## L-<n>` entry in the reference doc · a rulebook rule whose source lesson is still listed · a `## Group steps` row with no Order cell, which doesn't count as scheduled · an unscheduled group step untouched for `groupStepIdleSessions` sessions (once per window of that many), or a group step mixing types · a fired trigger · an anchor that no longer matches, names a missing file, or has an invalid pattern · an `owner decision` row with no `recommended: <pick>` for `/start-session` to mark · in commits of the open session and the one just closed: a footer git didn't read, a misspelled or miscased footer, a `Lesson-Caught`, `Lesson-Cited` or `FU-Closed` footer that names no ID of its kind (such as `Lesson-Cited: none`), a `Lesson-Check` footer with any value but `none`, or a footer naming an unknown ID — and the same value and unknown-ID problems in an `--evidence` footer · a last session commit with no `Phase:` footer, no lesson answer, or a `Phase:` that isn't `<Campaign>/<Phase>` · no `Ledger-Migration` commit reachable from HEAD · in `docs/checks.md`: a file a `Check files` glob matches that no row lists, a glob that matches no file, a listed file that's gone, a malformed row, no `Budget:` or `Check files:` line, a second `Budget:` line, a budget gate that no row's gate names, or a `Check-Caught` footer in the open session or the one just closed that names no listed check · a previous-session override (always first).

**Notes** (never block a commit, and are never warnings): a lesson cited at least `checkFlagCitations` times with no catches — could become a check · a lesson that caught something in at least `rulebookPromotionPhases` separate phases — rulebook candidate (owner decides) · FUs homed in other open campaigns, which the stale-home check doesn't compare with STACK's phases, since campaigns may alternate · the checks a registry's budget counts running over it, with the slowest named · STACK FUs filed before the open session, anchored to files changed since the last sync and still open, so a skipped anchor sweep shows (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep). A project with no `docs/checks.md` gets neither a warning nor a note: the report's CHECKS line says so. The report lists them under `NOTES`; `/end-session` acts on the two lesson notes only at a campaign close (a rulebook candidate is parked for the owner), together with the rulebook promotion flow, the anchor-sweep note's count goes in the session's FUs-filed line (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § End, read in 6L-d, printed in 6L-c), the retirement review (§ Checks) acts on the over-budget note, and the other-campaigns note is for information only.

**Override.** When a stop truly can't be fixed this session, the session runs `audit --override "<reason>"` without asking, which prints the footer to add, and gives the reason in its report (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § End, 7L). It's refused when the previous session's commit carried one. The `rulebookMax` stop is the owner's: it halts instead.

## Checks

A project's checks — the guard tests, lint rules, hook gates and visual specs that hold a ruling in place — have a creation gate (`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § A ruling gets a check) and, here, an exit. Each project lists them in `docs/checks.md`; `${CLAUDE_PLUGIN_ROOT}/lib/checks.mjs` reads it:

    Budget: pre-commit 45 s
    Check files: `scripts/*.test.ts` `src/**/*-guard.test.ts`

    | Check | Files | Guards | Gate | Seconds |
    |---|---|---|---|---|
    | accent-ban | `scripts/accent-ban.test.ts` `scripts/accent-ban.core.test.ts` | no raw accent hex or accent fill outside the allowlist | pre-commit | 2.6 |

- **Inventory.** One row per check: its ID, every file it runs, what it guards, the gate that runs it and its run time in seconds, `—` when unmeasured. `Check files` holds the git globs that find check files. A new check gets its row in the commit that adds it; the audit warns on a file a glob matches that no row lists, and on a listed file that's gone.
- **Evidence.** A commit whose work a listed check failed on, so the work changed, carries `Check-Caught: <check>` (§ Footers); `/pre-commit-check` warns when one is missing. The report and `ledger.mjs checks` read each check's last catch from these footers, so the registry never records it by hand.
- **Budget.** `Budget: <gate> <seconds> s` caps the summed run time of the checks that gate runs. The report's CHECKS line shows the total against it, says how many of that gate's checks are unmeasured and left out, and names the three slowest; running over it is a note.
- **Retirement review,** at each campaign close (`/end-session` Stage 7): run `ledger.mjs checks`, re-measure the Seconds by the method the registry names, and decide each check without asking (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): keep it, merge it into another, move it out of its gate, or retire it, with a one-line reason in the commit body. A check with no catch in the campaign, or one that encodes a ruling the next campaign contests, is the first candidate; one that caught something is kept unless its subject is gone. (Without it, a campaign adds checks and retires none.)
