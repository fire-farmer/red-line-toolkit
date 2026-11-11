# What the pipelines share

> **Paths.** `${CLAUDE_PLUGIN_ROOT}` in this doc is the toolkit's install folder: the folder above the `reference/` folder this file was read from. Claude Code substitutes it only in commands, agents and skills, not in a file read with the Read tool, so write the real path in its place before you run or open anything here.

Text `/change-heavy` and `/cleanup-light` follow (and `/page-implement`, for the review panel, the anchor sweep, the Fable seats and models and effort; `/page-code`, for models and effort), kept here once. Each command points to its section, so a change lands everywhere at once.

## The rigor trigger

The project's CLAUDE.md **Heavy rigor** trigger decides the pipeline by what a change alters, never by the folder it's in or its file count. By default `/change-heavy` runs when a change:
- alters a computed or printed figure: a value, a rounding, which figure a row prints, whether a figure prints at all;
- alters a stored, imported or exported data shape (a migration that rewrites or deletes stored values without changing the shape is borderline, so it counts);
- alters an auth, RLS, tier or payment path;
- or introduces a new data model or API shape.

A change that alters no figure, data shape or path, only labels, copy, layout or styling, runs `/cleanup-light`, which keeps its Fable review, even inside a high-risk area; `/change-heavy` is not for it. Borderline → the heavier one. These four are the default: a project's CLAUDE.md names its high-risk areas, where such changes cluster (e.g. money math, RLS/migrations, payments, auth and exports), and may state its own criteria (e.g. an LLM-backed app: what a prompt asks for or returns, a scheduling interval, a generated script, a stored data shape or stored values). A project whose CLAUDE.md states its trigger by area or by file count uses that, and one that states no trigger applies the defaults.

Work handed over from the other pipeline with FU body audit results (§ FU body verification) is decided on their corrected scope, not the FU body's stale claim, so it can't bounce back; the receiving run's own verification starts from those results.

## Risk paths

The paths a change is checked against for the security pass: API routes, auth code, payment and billing code, money math (pricing, tax and accounting), the tier or access-gating module, session middleware and the service-role clients, schema and RLS migrations, paid data API clients and their call budgets, export routes, and any risk paths your CLAUDE.md names (on a Next.js + Supabase + Stripe stack: `src/app/api/**`, `**/auth/**`, `**/auth.ts`, `**/stripe/**`, `**/billing/**`, `src/middleware.ts`, `src/lib/supabase/**` (session middleware and the service-role clients), `supabase/migrations/**` (schema and RLS policies)).

## Stack skills

Load the skills for the surfaces the change touches, via the Skill tool, before the plan is written, so its API shapes come from current guidance rather than training memory: your framework's best-practice skills for routes, pages, server code, caching and components, your database's for SQL, migrations and access policies, your payment provider's for payments. On a Next.js + Supabase + Stripe stack: App Router pages or layouts, route handlers, server actions, middleware or proxy → `vercel:nextjs`; `'use cache'`, `cacheLife`/`cacheTag` or revalidation → `vercel:next-cache-components`; new or changed hooks, effects, memoization or data fetching in components → `vercel:react-best-practices`; SQL, migrations or RLS policies → `supabase:supabase-postgres-best-practices`; Stripe → `stripe:stripe-best-practices`, as guidance only: no API or SDK version bump and no `stripe sandbox create` unless the plan has one. Load none for CSS or token-only, copy, docs or test-only work. A skill that isn't installed is skipped, not a halt. Name the skills loaded in the Done summary.

Inside these pipelines the pipeline is the workflow, so don't enter `superpowers:brainstorming`, whatever superpowers' SessionStart routing says about a request to build something.

## FU body verification

FU bodies age out: a count or a claim drifts as code lands after the row was written. Before the plan is written (`/cleanup-light` Stage 1.5, `/change-heavy` Stage 0.5), check each explicit claim in the FU body against live code, then sweep for the same class at other sites so the fix covers it whole.

- **Caller counts:** `grep -rn` the cited selector or identifier and compare with the stated count.
- **File paths:** confirm the cited file holds the construct described; a row's `{anchor:}` pattern must still match (`ledger.mjs audit` checks every anchor in a migrated project, a legacy project's `npm run verify:fus` does).
- **"Single-user" or "N-only" claims:** an exhaustive grep, alternate construction patterns included (template literals, `classnames()`, dynamic class composition, inline `style` overrides).
- **"May cascade" and other scope hedges:** read every callsite of the specific selector or identifier cited, not every file that might relate.
- **A census by agents** reading code is recorded as a hand sweep, not a census (§ A ruling gets a check).

`/change-heavy` runs it full-breadth, adding a DOM-injection probe in the preview server for a CSS cascade or runtime-behavior claim, and a sweep for sibling selectors or identifiers in the same family that may share the FU's anti-pattern under another name.

Either way, a wrong claim goes in a visible audit-results block in chat ("Stage 1.5 audit results" in `/cleanup-light`, "Stage 0.5 audit results" in `/change-heavy`, whose Stage 1 plan carries the block when the run continues), with the corrected facts, never absorbed silently.

When the gaps are so severe that the premise is wrong (e.g., "single-user" turns out to be 20 callers), decide without asking (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`) and give the reason in the audit results:
- **Validated-no-action close** when nothing is left to do: close the FU with the rationale (each command's Done, state 2, which puts adjacent observations through the filing bar).
- **Otherwise, run the rigor check again on the corrected scope** (`/cleanup-light` Stage 1's pre-flight gate, step 1; `/change-heavy` Stage 0 step 3, its split included). When the work now belongs to the other pipeline, hand it over with the FU and the audit results as its argument (§ The rigor trigger); when it stays, continue with the corrected scope into the plan.

## Claim discipline

The plan is where an unchecked claim costs most: a wrong assertion in code costs one test run, the same assertion in a plan costs a critique round, an adjudication and a revision. While writing one (`/change-heavy` Stage 1, `/cleanup-light`'s PLAN block):
- **Never write a code shape you have not opened this turn.** Paste it from the file, never type it from memory of a sibling.
- **A count comes from the command that will verify it,** not a similar grep over an adjacent set.
- **Probe before designing in an unfamiliar seam,** about five probes: run the form rather than derive a library's behaviour by reading it.

The failure these prevent is asserting from adjacency: reporting something near the fact (a grep over a similar set, a comment a few lines off, a file read earlier and since edited) as though the fact itself were checked. The plan's critics, and in `/change-heavy` its Adjudicator, treat an unchecked load-bearing claim as a finding (in `/cleanup-light`'s PLAN block, one not marked `UNVERIFIED`).

## The review panel

The diff picks the review panel: `/cleanup-light`'s Stage 3 critics, and review-pr's aspects in `/change-heavy` Stage 6 and `/page-implement` Stage 4. Run this from the repo root once the change is written. First mark the change's new files intent-to-add, so every reader of the diff sees them (the critics, review-pr, the Fable seats, `/security-review` and the commit's staging): `git add -N -- <the untracked files this change adds>`, only those paths, never another session's. An intent-to-add path shows in `git diff` and `git diff HEAD` but not in `git diff --cached`, so the commit still stages it by path. Do it again for a file a revise step creates, before a re-audit or a security re-check reads the diff. `code` counts changed files that are neither prose (`*.md`, `*.mdx`, `*.txt`) nor tests. Over-triggering costs one critic run and a miss ships the defect, so the matchers stay loose, and they read code files only, so prose never trips them. `${CLAUDE_PLUGIN_ROOT}/tests/review-panel.test.mjs` runs this snippet against fixture repos.

```bash
P="'*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs'"
NOTEST="':!*.test.*' ':!*.spec.*' ':!*tests/*' ':!*__tests__/*'"
CHANGED=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } | sort -u)
CODE=$( { eval git diff -U0 HEAD -- $P | grep -E '^[+-]' | grep -vE '^(\+\+\+|---) '; eval git ls-files -z --others --exclude-standard -- $P | xargs -0 cat 2>/dev/null; } )
SHAPES=$( { eval git diff -U0 HEAD -- $P $NOTEST | grep -E '^(\+|@@)' | grep -vE '^\+\+\+ |^@@ -[0-9,]+ \+[0-9]+,0 @@' | sed -E 's/^@@[^@]*@@ ?//; s/^\+//'; eval git ls-files -z --others --exclude-standard -- $P $NOTEST | xargs -0 cat 2>/dev/null; } )
echo "errors=$(printf '%s\n' "$CODE" | grep -cE '\b(try|catch|finally|throw)\b|\.catch\(')"
echo "types=$( { printf '%s\n' "$SHAPES" | grep -E '^[[:space:]]*export[[:space:]]+(declare[[:space:]]+)?(const[[:space:]]+)?(type|interface|enum)[[:space:]]+[A-Za-z_]'; printf '%s\n' "$CHANGED" | grep -E '(^|/)types/'; } | grep -c .)"
echo "tests=$(printf '%s\n' "$CHANGED" | grep -cE '\.(test|spec)\.[cm]?[jt]sx?$|(^|/)(tests|__tests__)/|^(src/)?lib/')"
echo "code=$(printf '%s\n' "$CHANGED" | grep -vE '\.(md|mdx|txt)$' | grep -vE '\.(test|spec)\.[cm]?[jt]sx?$|(^|/)(tests|__tests__)/' | grep -c .)"
```

- **`/cleanup-light`'s Stage 3 on a prose diff** (`code=0`: only prose and tests changed, as in most changes to the toolkit) runs the prose critic in place of the scope, code-review and simplifier critics, and the test-coverage critic when `tests` is above 0. The security, silent-failure and type-design critics don't run. The Adjudicator and the Fable seats run as on any diff: a Fable review on every run is a standing ruling. The quick lane (`/cleanup-light` § The quick lane) runs seat 3h alone. The one exception is the Stage 5.5 re-audit, which a prose diff skips when its post-review fixes changed 10 lines or fewer in all (that counts every fix Stage 4 absorbed, not only Fable's); a diff with code keeps all three Fable seats.
- **`/cleanup-light`'s security pass** (Stage 3c) runs when the diff touches a risk path (§ Risk paths), or when a changed code file outside them handles auth, RLS, Stripe, exports or money math; the report names that file. Words in the task alone don't engage it, and a prose diff never does. `/change-heavy` and `/page-implement` keep their own security triggers.
- **The specialists** fire on their counts, and a count of 0 skips one: silent-failure on `errors`; type-design on `types`, which counts an exported type, interface or enum that the diff adds or edits inside, or a changed file under a `types/` directory, but not a removal on its own, a file-private type or a test fixture (an edit just below an exported type can still trip it, which only over-triggers); test-coverage on `tests`, which counts changed tests, test helpers and the pure-logic layer (e.g. `src/lib/` in a Next.js app, `lib/` in the toolkit).
- **review-pr** (`/change-heavy` Stage 6 and `/page-implement` Stage 4) gets the aspects `code comments`, plus `tests`, `errors` and `types` when their count is above 0, with `parallel` after them, since by default it runs its agents one at a time. It finds the change with `git diff --name-only`, and its code-reviewer reads `git diff`; the intent-to-add step above is what puts a new file in both.
- **The per-critic tally** feeds the telemetry `critics` field (`/cleanup-light`, and `/change-heavy`'s Stage 7 row). In `/cleanup-light`, a `fable-decorrelation` line stays when a critic also raised it, marked `(also: <that critic>)`, and a critic's line never takes an `also: fable-decorrelation` mark: the critics' `unique` counts what it did before the Fable audit joined Stage 3, and Fable's counts what it found alone. Before the Adjudicator runs, every finding line starts with the label of the source that raised it, `[<label>] file:line — …`, and a defect two sources raise at one site keeps only its first line, with `(also: <label>, …)` added. After the verdicts, a finding counts for its own label and each label in its `also` mark: per source, `raised` is the findings that count for it, `kept` those of them that got KEEP or MODIFY, and `unique` its kept findings without an `also` mark. Only sources that ran get an entry.

## The anchor sweep

Every FU row anchors to the code it's about, so a run already in a file can fix what was filed against it. Once the change is written and before its review — `/cleanup-light` at the end of Stage 2, `/change-heavy` at the end of Stage 5, `/page-implement` at the end of Stage 2 — run from the repo root:

    node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs anchored

It lists the open STACK and Standing FUs anchored to the files the working tree changes against HEAD, untracked ones included (the files `CHANGED` lists in § The review panel, plus a renamed file's old name), and counts the files it read. A project that isn't migrated prints its mode line instead, and the sweep doesn't run there; a `LEDGER ERROR` line halts and reports, as before any FU row is touched. The FUs this run was invoked on, or its group step's members, aren't swept: they're the run's own work. Check each other listed row's claim against live code first (R-6), then give it one outcome:

- **Closed** — a STACK row already done or moot in live code, or any other the run can fix: every listed row is anchored to a file this change touches, so it's in the area the change works (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs), the same class (R-20), a minor tweak or larger. Fix it in this change when it isn't done, list it with its ID beside the minor tweaks and in-area fixes in the critic and Fable prompts and the commit body, delete its row and put `FU-Closed: FU-<n>` on the commit.
- **Left open** — only for one of these reasons, each in the report in a few words: the owner's call (design, copy or UX no ruling covers, or a product decision), which stays parked or waits for its group step; the Heavy-rigor trigger, unless this run is `/change-heavy`; a group step another session is working now (name it), so two sessions don't fix one FU; or a Standing row, whose trigger defers it on purpose (some record the owner's "not yet").

The report carries one line: `Anchor sweep: <N> listed · <K> closed (FU-…) · <M> left (FU-<n>: <reason>, …)`, where N counts the rows judged, the CLI's list without the run's own FUs, so N = K + M. The run's telemetry row counts the listed and closed FUs in `swept`, and the closed ones in `fus_closed` where the row has it, never in `leftovers`. (A later run often edits an open FU's anchor file and passes the FU by.) The ledger report's NOTES name the STACK FUs anchored to files changed since the last sync and still open, so a skipped sweep shows.

## A ruling gets a check

When the work carries out a ruling over every surface or every reader (its goal says "every surface", or the ruling names a class of reads), the plan names a check that enforces the ruling itself, not only the defect this run fixes. The check produces the census from the code (a type-checker or AST pass, or a pinned grep), never from agents reading it: a census by agents reading code is a hand sweep, and the plan records it as one. The check is built before the sweep (R-8) and is red before it: its count is the census, and a zero before the sweep means the detector is wrong (R-1). The sweep runs until the check passes. It is built during the run and listed in the report. (The case is in `~/.claude/reference/rules.md` R-8.)

## The Fable seats

The plan critiques and diff audits on a family other than the orchestrator's: `/cleanup-light` Stage 1.7, seat 3h and Stage 5.5; `/change-heavy` Critic 2c and Stages 6 and 7.5; `/page-implement` Stage 4.
- **Decorrelation is by family.** A seat runs on a family other than the one that wrote and fixes the work: `model: fable`, or `model: opus` when the orchestrator is Fable. Fable auditing Fable is no decorrelation, though telemetry still logs the seat as run. Every seat is dispatched as `red-line-toolkit:fable-seat`, whose tools are read-only (`${CLAUDE_PLUGIN_ROOT}/agents/fable-seat.md`).
- **Fable finds; the orchestrator fixes.** A seat's findings at `/cleanup-light` seat 3h, `/change-heavy` Critic 2c and Stage 6, and `/page-implement` Stage 4 go through the Adjudicator like any other source, its security floor included; the orchestrator disposes of `/cleanup-light`'s plan critique, of each re-audit and of the quick lane's one Fable pass directly.
- **No skip gate.** Every run with a diff gets its audit, CSS and token edits included: the orchestrator that wrote the diff never decides it obviously changed nothing.
- **Audit for unintended change.** The prompt carries the intended delta (the plan, or the change and its minor tweaks and in-area fixes), so the fix itself isn't reported as a defect and reverted.
- **Duplication is a codebase property,** so the seat searches the project's stylesheets and components for an existing equivalent of anything new.
- **Never the security lens.** Fable's cyber classifier can refuse on auth, RLS or Stripe; `/security-review` covers security, and Fable audits correctness.
- **Goal-stated prompts.** State the lens and what to hunt for; a scaffolded checklist lowers Fable's output.
- **One re-audit, never a loop.** A finding that survives the fix is fixed once and reported, or sends the run back to its plan.

**The model check.** The `fable-seat-guard` mod puts every `fable-seat` dispatch on the family the orchestrator isn't and adds a `fable-seat-guard:` note to the seat's result naming the model that ran. A `NOT DECORRELATED` note means the findings don't count as decorrelated evidence: dispatch the seat again and list the miss in the report. A seat result with no such note means the guard isn't loaded, so confirm the seat's model by hand before trusting its output — a silent downgrade would launder correlated review as decorrelated evidence.

## Models and effort

- **Models: the family alias, never a version.** Every dispatch and agent definition names a family (`fable`, `opus`, `sonnet` or `haiku`) or `inherit`, never a full model ID with a release number in it. An alias resolves to the newest release of its family, so a pipeline moves to a new model the day it ships, with no edit. `${CLAUDE_PLUGIN_ROOT}/tests/decision-gates.test.mjs` fails on a versioned ID. A user's settings can still remap an alias; when a run starts on an older release than expected, look there.
- **Effort: the planning stage sets it.** The run's plan names an effort (`low`, `medium`, `high`, `xhigh` or `max`) for the agents each stage dispatches. Agents of one model in one stage share a level unless the plan gives a dispatch its own line. The run passes the level as the Agent tool's `effort` on every dispatch it writes, next to the `model:` it passes. Agents a skill launches itself (`/simplify`, `pr-review-toolkit:review-pr`) run at the session's level, since neither skill sets one; the subagent-driven-development dispatches in `/change-heavy` Stage 4 are the run's, so they carry the plan's level. The plan is `/cleanup-light` Stage 1.7's PLAN block, `/change-heavy` Stage 1's plan, or for `/page-implement` the code plan `/page-code` writes. A run of these pipelines with no planning stage (the quick lane, a `/cleanup-light` run that skips 1.7, a plan locked before plans named an effort) states its levels in chat before its first dispatch. With no effort set, a subagent runs at the session's level or its model's default.
- **Choosing a level.** From Anthropic's guide for the current models: `low` for mechanical sweeps and quick, well-specified subagents; `medium` for routine coding; `high` for review seats, hard coding and long unattended work, and the start when unsure; `xhigh` only where a gain has been measured, such as in an A/B log; `max` not in a pipeline. Each step up costs more time and tokens, and at `high` and above Fable thinks before almost every reply. A session can't change its own effort, so the parent sets a session's effort from its own plan when it starts the session. When a run hands off to `/change-heavy` in the same session, that run continues at the session's level, and its report names that level so the parent can start the next heavy session higher.
- **Report.** Each pipeline's report gives the effort of every dispatch it writes next to its model, and lists skill-launched agents as "session level", so a missed defect can be traced to a seat that ran lower.

## The pre-commit audit

A pipeline's commit stage runs `/pre-commit-check` in a foreground `general-purpose` subagent, never through the Skill tool. A command loaded through the Skill tool arrives as a new user turn, so the session takes the audit for the whole request, prints its report and ends its turn with the run uncommitted (`${CLAUDE_PLUGIN_ROOT}/tests/decision-gates.test.mjs`). The subagent's report returns as a tool result and the run carries on in the same turn.

The subagent has none of the run's conversation (R-22), so the dispatch carries: the working tree's absolute path; "Read `${CLAUDE_PLUGIN_ROOT}/commands/pre-commit-check.md` and run it in staged mode, called from a pipeline: report only"; `--task "<the run's task in one line>"`; and `--message` with the drafted commit message, its footers included. Fix each WARN or FAIL and dispatch it again (tier 1); a finding that is the owner's call is parked (tier 3). Then commit.
