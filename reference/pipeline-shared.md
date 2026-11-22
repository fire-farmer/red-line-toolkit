# What the pipelines share

> **Paths.** `${CLAUDE_PLUGIN_ROOT}` in this doc is the toolkit's install folder: the folder above the `reference/` folder this file was read from. Claude Code substitutes it only in commands, agents and skills, not in a file read with the Read tool, so write the real path in its place before you run or open anything here.

Text `/change-heavy` and `/cleanup-light` follow (and `/page-design`, for the Fable seats, models and effort, a module's design spec and building from a locked design; `/module-audit`, for the rigor trigger, the Fable seats, models and effort, browser specs, building from a locked design and the pre-commit audit; `/start-session`, for a module's design spec; `/end-session`, for a module's design spec, building from a locked design and the pre-commit audit), kept here once. Each command points to its section, so a change lands everywhere at once.

## The rigor trigger

The project's CLAUDE.md **Heavy rigor** trigger decides the pipeline by what a change alters, never by the folder it's in or its file count. By default `/change-heavy` runs when a change:
- alters a computed or printed figure: a value, a rounding, which figure a row prints, whether a figure prints at all;
- alters a stored, imported or exported data shape (a migration that rewrites or deletes stored values without changing the shape is borderline, so it counts);
- alters an auth, RLS, tier or payment path;
- or introduces a new data model or API shape.

A change that alters no figure, data shape or path, only labels, copy, layout or styling, runs `/cleanup-light`, which keeps its Fable review, even inside a high-risk area; `/change-heavy` is not for it. Borderline → the heavier one. These four are the default: a project's CLAUDE.md names its high-risk areas, where such changes cluster (e.g. money math, RLS/migrations, payments, auth and exports), and may state its own criteria (e.g. an LLM-backed app: what a prompt asks for or returns, a scheduling interval, a generated script, a stored data shape or stored values). A project whose CLAUDE.md states its trigger by area or by file count uses that, and one that states no trigger applies the defaults.

Work handed over from the other pipeline with FU body audit results (§ FU body verification) is decided on their corrected scope, not the FU body's stale claim, so it can't bounce back; the receiving run's own verification starts from those results.

Planning a module or a page from a locked design runs in `/change-heavy` as "force heavy" does, and Stage 0 doesn't split it (§ Building from a locked design).

## Risk paths

The paths a change is checked against for the security pass: API routes, auth code, payment and billing code, money math (pricing, tax and accounting), the tier or access-gating module, session middleware and the service-role clients, schema and RLS migrations and declarative schema files, paid data API clients and their call budgets, export routes, and any risk paths your CLAUDE.md names (on a Next.js + Supabase + Stripe stack: `src/app/api/**`, `**/auth/**`, `**/auth.ts`, `**/stripe/**`, `**/billing/**`, `src/middleware.ts`, `src/lib/supabase/**` (session middleware and the service-role clients), `supabase/schemas/**` and `supabase/migrations/**` (schema and RLS policies)).

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

The diff picks the review panel: `/cleanup-light`'s Stage 3 critics, and review-pr's aspects in `/change-heavy` Stage 6. Run this from the repo root once the change is written. First mark the change's new files intent-to-add, so every reader of the diff sees them (the critics, review-pr, the Fable seats, `/security-review` and the commit's staging): `git add -N -- <the untracked files this change adds>`, only those paths, never another session's. An intent-to-add path shows in `git diff` and `git diff HEAD` but not in `git diff --cached`, so the commit still stages it by path. Do it again for a file a revise step creates, before a re-audit or a security re-check reads the diff. `code` counts changed files that are neither prose (`*.md`, `*.mdx`, `*.txt`) nor tests. Over-triggering costs one critic run and a miss ships the defect, so the matchers stay loose, and they read code files only, so prose never trips them. `${CLAUDE_PLUGIN_ROOT}/tests/review-panel.test.mjs` runs this snippet against fixture repos.

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
- **`/cleanup-light`'s security pass** (Stage 3c) runs when the diff touches a risk path (§ Risk paths), or when a changed code file outside them handles auth, RLS, Stripe, exports or money math; the report names that file. Words in the task alone don't engage it, and a prose diff never does. `/change-heavy` keeps its own security triggers, and work from a locked design always engages both pipelines' passes (§ Building from a locked design).
- **The specialists** fire on their counts, and a count of 0 skips one: silent-failure on `errors`; type-design on `types`, which counts an exported type, interface or enum that the diff adds or edits inside, or a changed file under a `types/` directory, but not a removal on its own, a file-private type or a test fixture (an edit just below an exported type can still trip it, which only over-triggers); test-coverage on `tests`, which counts changed tests, test helpers and the pure-logic layer (e.g. `src/lib/` in a Next.js app, `lib/` in the toolkit).
- **review-pr** (`/change-heavy` Stage 6) gets the aspects `code comments`, plus `tests`, `errors` and `types` when their count is above 0, with `parallel` after them, since by default it runs its agents one at a time. It finds the change with `git diff --name-only`, and its code-reviewer reads `git diff`; the intent-to-add step above is what puts a new file in both.
- **The per-critic tally** feeds the telemetry `critics` field (`/cleanup-light`, `/change-heavy`'s Stage 7 row and `/page-design`'s row, whose Fable seat is `fable-decorrelation` too). In `/cleanup-light`, a `fable-decorrelation` line stays when a critic also raised it, marked `(also: <that critic>)`, and a critic's line never takes an `also: fable-decorrelation` mark: the critics' `unique` counts what it did before the Fable audit joined Stage 3, and Fable's counts what it found alone. Before the Adjudicator runs, every finding line starts with the label of the source that raised it, `[<label>] file:line — …`, and a defect two sources raise at one site keeps only its first line, with `(also: <label>, …)` added. After the verdicts, a finding counts for its own label and each label in its `also` mark: per source, `raised` is the findings that count for it, `kept` those of them that got KEEP or MODIFY, and `unique` its kept findings without an `also` mark. Only sources that ran get an entry.

## The anchor sweep

Every FU row anchors to the code it's about, so a run already in a file can fix what was filed against it. Once the change is written and before its review — `/cleanup-light` at the end of Stage 2, `/change-heavy` at the end of Stage 5 — run from the repo root:

    node ${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs anchored

It lists the open STACK and Standing FUs anchored to the files the working tree changes against HEAD, untracked ones included (the files `CHANGED` lists in § The review panel, plus a renamed file's old name), and counts the files it read. A project that isn't migrated prints its mode line instead, and the sweep doesn't run there; a `LEDGER ERROR` line halts and reports, as before any FU row is touched. The FUs this run was invoked on, or its group step's members, aren't swept: they're the run's own work. Check each other listed row's claim against live code first (R-6), then give it one outcome:

- **Closed** — a STACK row already done or moot in live code, or any other the run can fix: every listed row is anchored to a file this change touches, so it's in the area the change works (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs), the same class (R-20), a minor tweak or larger. Fix it in this change when it isn't done, list it with its ID beside the minor tweaks and in-area fixes in the critic and Fable prompts and the commit body, delete its row and put `FU-Closed: FU-<n>` on the commit.
- **Left open** — only for one of these reasons, each in the report in a few words: the owner's call (design, copy or UX no ruling covers, or a product decision), which stays parked or waits for its group step; the Heavy-rigor trigger, unless this run is `/change-heavy`; a group step another session is working now (name it), so two sessions don't fix one FU; a `/module-audit` fix-plan row that isn't this run's own group (its `why not now` names its group), which waits for that group's run so the plan's order holds; or a Standing row, whose trigger defers it on purpose (some record the owner's "not yet").

The report carries one line: `Anchor sweep: <N> listed · <K> closed (FU-…) · <M> left (FU-<n>: <reason>, …)`, where N counts the rows judged, the CLI's list without the run's own FUs, so N = K + M. The run's telemetry row counts the listed and closed FUs in `swept`, and the closed ones in `fus_closed` where the row has it, never in `leftovers`. (A later run often edits an open FU's anchor file and passes the FU by.) The ledger report's NOTES name the STACK FUs anchored to files changed since the last sync and still open, so a skipped sweep shows.

## A ruling gets a check

When the work carries out a ruling over every surface or every reader (its goal says "every surface", or the ruling names a class of reads), the plan names a check that enforces the ruling itself, not only the defect this run fixes. The check produces the census from the code (a type-checker or AST pass, or a pinned grep), never from agents reading it: a census by agents reading code is a hand sweep, and the plan records it as one. The check is built before the sweep (R-8) and is red before it: its count is the census, and a zero before the sweep means the detector is wrong (R-1). The sweep runs until the check passes. It is built during the run and listed in the report. (The case is in `~/.claude/reference/rules.md` R-8.)

## The Fable seats

The plan critiques and diff audits on a family other than the orchestrator's: `/cleanup-light` Stage 1.7, seat 3h and Stage 5.5; `/change-heavy` Critic 2c and Stages 6 and 7.5; `/page-design` Critic 2c, which reviews rendered screens rather than a plan or diff; `/module-audit` Stage 1.5's miss hunt over an audit's findings and its Stage 4.5 fix-plan critique.
- **Decorrelation is by family.** A seat runs on a family other than the one that wrote and fixes the work: `model: fable`, or `model: opus` when the orchestrator is Fable. Fable auditing Fable is no decorrelation, though telemetry still logs the seat as run. Every seat is dispatched as `red-line-toolkit:fable-seat`, whose tools are read-only (`${CLAUDE_PLUGIN_ROOT}/agents/fable-seat.md`).
- **Fable finds; the orchestrator fixes.** A seat's findings at `/cleanup-light` seat 3h, `/change-heavy` Critic 2c and Stage 6, `/page-design` Critic 2c and `/module-audit`'s miss hunt go through the Adjudicator like any other source, its security floor included; the orchestrator disposes of `/cleanup-light`'s plan critique, `/module-audit`'s fix-plan critique, each re-audit and the quick lane's one Fable pass directly.
- **No skip gate.** Every run with a diff gets its diff audit, CSS and token edits included, and every `/page-design` run gets its 2c: the orchestrator that wrote the diff never decides it obviously changed nothing.
- **Audit for unintended change** (the plan and diff seats, not `/module-audit`'s two). The prompt carries the intended delta (the plan, or the change and its minor tweaks and in-area fixes), so the fix itself isn't reported as a defect and reverted.
- **Duplication is a codebase property,** so a plan or diff seat (not `/module-audit`'s) searches the project's stylesheets and components for an existing equivalent of anything new.
- **Never the security lens.** Fable's cyber classifier can refuse on auth, RLS or Stripe; `/security-review` covers security (in `/module-audit`, its security lens and red team do), and Fable audits correctness.
- **Goal-stated prompts.** State the lens and what to hunt for; a scaffolded checklist lowers Fable's output.
- **One re-audit, never a loop.** A finding that survives the fix is fixed once and reported, or sends the run back to its plan.

**The model check.** The `fable-seat-guard` mod puts every `fable-seat` dispatch on the family the orchestrator isn't and adds a `fable-seat-guard:` note to the seat's result naming the model that ran. A `NOT DECORRELATED` note means the findings don't count as decorrelated evidence: dispatch the seat again and list the miss in the report. A seat result with no such note means the guard isn't loaded, so confirm the seat's model by hand before trusting its output — a silent downgrade would launder correlated review as decorrelated evidence.

## Models and effort

- **Models: the family alias, never a version.** Every dispatch and agent definition names a family (`fable`, `opus`, `sonnet` or `haiku`) or `inherit`, never a full model ID with a release number in it. An alias resolves to the newest release of its family, so a pipeline moves to a new model the day it ships, with no edit. `${CLAUDE_PLUGIN_ROOT}/tests/decision-gates.test.mjs` fails on a versioned ID. A user's settings can still remap an alias; when a run starts on an older release than expected, look there.
- **Effort: the planning stage sets it.** The run's plan names an effort (`low`, `medium`, `high`, `xhigh` or `max`) for the agents each stage dispatches. Agents of one model in one stage share a level unless the plan gives a dispatch its own line. The run passes the level as the Agent tool's `effort` on every dispatch it writes, next to the `model:` it passes. Agents a skill launches itself (`/simplify`, `pr-review-toolkit:review-pr`) run at the session's level, since neither skill sets one; the subagent-driven-development dispatches in `/change-heavy` Stage 4 are the run's, so they carry the plan's level. The plan is `/cleanup-light` Stage 1.7's PLAN block, `/change-heavy` Stage 1's plan or `/page-design` Stage 1's brief. A run of these pipelines with no planning stage (the quick lane, a `/cleanup-light` run that skips 1.7, a plan locked before plans named an effort) states its levels in chat before its first dispatch. `/module-audit` has none: Stage 0 states each stage's level before its first dispatch. With no effort set, a subagent runs at the session's level or its model's default.
- **Choosing a level.** From Anthropic's guide for the current models: `low` for mechanical sweeps and quick, well-specified subagents; `medium` for routine coding; `high` for review seats, hard coding and long unattended work, and the start when unsure; `xhigh` only where a gain has been measured, such as in an A/B log; `max` not in a pipeline. Each step up costs more time and tokens, and at `high` and above Fable thinks before almost every reply. A session can't change its own effort, so the parent sets a session's effort from its own plan when it starts the session. When a run hands off to `/change-heavy` in the same session, that run continues at the session's level, and its report names that level so the parent can start the next heavy session higher.
- **Report.** Each pipeline's report gives the effort of every dispatch it writes next to its model, and lists skill-launched agents as "session level", so a missed defect can be traced to a seat that ran lower.

## Browser specs

A UI scenario a browser can drive is a case in a committed browser spec, not a check by hand: a build from a locked design names the spec and its cases in its plan and writes them (§ Building from a locked design), `/cleanup-light` and `/change-heavy` re-run the specs a diff reaches, and `/module-audit` Stage 0 runs the module's (a check by hand leaves nothing to re-run).

- **The suite.** A project's browser suite is the one its CLAUDE.md names (for example Playwright in `tests/visual/`, on a local stack with seeded accounts). In a project without one, the scenarios are checked by hand and the report says so; adding a suite is that project's call.
- **A module's specs** are the suite's spec files that name a route in the module's scope (a grep for the route prefix, which can find a spec named for the module and the cross-cutting specs that visit its routes). **The specs a diff reaches** are the module specs of every module whose scope holds a changed file (its route, components and lib folders, the globs `/module-audit` Stage 0 infers, such as `src/app/<module>/`, `src/components/<module>/` and `src/lib/<module>/` in a Next.js app), plus any spec file the diff changes.
- **A functional spec** drives a flow end to end: enter a realistic scenario, see the figure compute, save, reopen, see every input reload. A spec that writes data runs apart from the read-only ones (in Playwright, a writer project in `playwright.config.ts` whose `testMatch` names each writer spec, with the reader project's `testIgnore` excluding it). When a writer's cleanup deletes every row carrying its marker, a failed run's orphans included, only one run of a writer spec goes at a time on one local stack, and a new writer spec takes a marker of its own.
- **Running them.** Always on the local target, never production: a writer spec pointed at production saves to the hosted project. Start the local stack if it's down, and seed it if the run says it's unseeded, as the project's CLAUDE.md says. When another checkout's dev server holds the target's port, run this checkout's on another port (in Playwright, a base-URL setting the config reads, with the suite starting its server there; mind any API key restricted to certain ports); never stop another session's server. Run only the spec files picked, each run with an output folder of its own, since a run clears its output folder. With a reader project and a writer project, run the readers, then the writer, whatever the first exits, with `--no-deps` on the writer, because a dependency project otherwise pulls in the whole reader suite:
  ```bash
  npx playwright test --project=<readers> --pass-with-no-tests --output <dir>/readers <spec files>; echo "readers exit $?"
  npx playwright test --project=<writer> --no-deps --pass-with-no-tests --output <dir>/writer <spec files>; echo "writer exit $?"
  ```
  A project left out of these runs (a second browser engine, say) leaves its cases to the full suite at each wave merge, so a pass here doesn't cover it.
- **Reading the result.** Record each run's selected-test count. A run that ends before any test result (a config, global-setup or web-server error) didn't run: record the error's first line, not a pass; and when every run selects zero tests, the specs didn't run either (`not run — no test selected`). A case is named by its `<spec file>:<line>` and its title, since one `test()` in a loop is several cases at one line. A failing case is re-run once with its run's own flags less `--pass-with-no-tests`, narrowed by `--grep` on its regex-escaped title, into an output folder of its own. The re-run must select exactly that one test: one that passes then is flaky, listed in the report, not a failure, and any other selection leaves the case failed.
- **In a change pipeline,** a failing case is a verify failure, debugged as a failed build is; when the suite can't run once its prerequisites are started, the run halts and reports it as a true blocker (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Halts). A scenario no browser can drive (an email, a webhook) stays a manual check, named in the report.

## A module's design spec

A new module starts with its design spec, the one artifact `/page-design` reads.

- **Writing it.** In conversation, outside any pipeline, with `superpowers:brainstorming` for its questions only: the skill writes no doc of its own and commits nothing, and its visual companion, its spikes, its builder check and its hand-off to `superpowers:writing-plans` are skipped. Tech choices (platform, libraries, data layer) are Claude's, so the questions leave them out.
- **Its contents:** the goal, what the module does for the user; the scope in and out; success criteria; the user value, the competitive gap or pain it answers; the data-model deltas on the project's central entity (an account, a project, an order); every page or screen with a one-line purpose; integration points; tier gating; and phases, an MVP cut first, each with its pages, dependencies and acceptance criteria.
- **The method:**
  - The spec is a hub. It owns the IA, the locked decisions, a shared-mechanics registry (each mechanic's ID, producer, consumers and status), an open-hooks table, the UI glossary (spec term, UI term, tooltip seed) and the consolidated gating table.
  - Each page's contract opens its section of the hub, or its own spec file linked from the hub: the mechanics it produces and consumes by ID, and the hooks it raises and consumes. A page never redefines a mechanic; it extends the registry.
  - A cross-page question is parked as a numbered hook with a target page, and that page's design opens by consuming its hooks; an unconsumed hook on a designed page is a blocker.
  - The walkthrough goes in data-spine order, one page per exchange, each approval banked.
  - Spec language isn't UI language: jargon never reaches the UI, and capability stays visible (a full instrument panel, with plain labels).
  - Before scoping, the competitive picture is refreshed with deep research, verified claims only.
  - Reconciling an older plan with the spec: a harvest map (what survives, extends or dies), a coverage crosswalk (every mechanic to a phase; an unmapped one is a blocker) and a dead list of overturned decisions, shown before the new plan locks.
- **Saving and approval.** It's saved as `docs/plans/<date>-<module>-design.md`. The owner's approval is recorded in a body `Status:` line ("Approved (<owner>, <date>)") or as frontmatter `status: locked`; when they disagree, the body line wins, as `/page-design` reads it. Asking for it is a question asked live (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Asked live). `/page-design` comes next, one run per page.

## Building from a locked design

What a page build needs beyond any change, run by the change pipelines from the stages that point here.

- **When.** The work names a locked page design plan (`docs/plans/*-module-<slug>-page-<page>-design.md` with `status: locked`), or it's a step whose row in a campaign doc's `## Phases` table names a part of a locked code plan, found through STACK's step-order pointer to that doc and the step's Parts row. A draft design is refused, and so is a code plan that isn't locked (`/page-design --park` relies on the first: the page waits for its owner row). Any other step of the same campaign is an ordinary change.
- **Entry.** "Plan <module or page> from <locked design>" runs in `/change-heavy`, as "force heavy" does, and Stage 0 doesn't split it (§ The rigor trigger); `/cleanup-light`'s rigor check sends it there. A figure the design's Figures list marks `new print` meets the trigger, engages the money-math risk surface and gets a characterization test for its print helper. A light step under this section always runs `/cleanup-light` Stage 1.7 and never takes the quick lane.
- **The plan.** Part-level, at `docs/plans/<date>-module-<slug>-page-<page>-code.md` (the glob `/page-design` reads), locked as `status: locked` with `locked-at`, its frontmatter also carrying `module:`, `page:`, `parent-design:` and `mockup:`. It builds from the mockup and the design plan, never from a `canvas:` link, and starts from the design plan's checked Reuses line. It holds exact files with per-file changes and their rationale; data flow (stores, service modules, persistence); security boundaries (RLS against the tier matrix, server-side tier checks, input validation on financial fields, XSS, export sanitization, webhook signatures, no secrets in source); performance considerations (`next/dynamic` with `ssr: false` for heavy modals, `React.memo` with stable parent callbacks, bundle impact, hydration); the test plan, a characterization test with its input/output pair for `src/lib/**` and, for UI, the browser spec it extends or creates, any suite-config change and its cases, each an input, an action and what the page must show, with the expected figure where known (§ Browser specs); Figures, each with its print helper; Spec decisions honoured; and the Effort line. `/change-heavy` Stage 2's Critic 2a also checks structure (component placement, file-size limits, store and service-module patterns, naming) and performance, and Critic 2b security, with Stage 3's security-asymmetric upgrade.
- **The planned close.** A plan of more than one part, each a run's work, ends its planning run in a fourth `/change-heavy` state, `planned`: the pre-commit audit runs, the run commits the locked plan and a campaign doc written from the template below, and its row logs `outcome: "planned"`. The doc is `docs/plans/<date>-module-<slug>-campaign.md`, beside the plans it links, and starts as `status: proposed`, so nothing reads it as current. The next `/end-session` opens a doc with `status: proposed` and a `- **Locked code plan:**` line, which only this template writes: it writes STACK's `## Phases` item, its bullets `**Phase <n>**` (a `**P<n>` bullet reads as a phase, and parts are `P<n>`), and one step-order pointer per phase (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-lifecycle.md` § Records), queued (⏸ QUEUED) behind an active campaign or active when none is, points STACK's Global plan at the doc when it makes the campaign active (`/page-design` Stage 0 reads the spec through it; a queued campaign gets it at the earlier one's close), and flips the doc to `status: active`; a project that isn't migrated records it as its CLAUDE.md says. A plan whose parts fit the active campaign becomes steps there instead: in the same commit the planning run writes them into that doc (their Parts rows, the plan's `Locked design` and `Locked code plan` links, and a new phase's Phases rows) and adds the new phase's `**Phase <n>**` bullet and step-order pointer to STACK, so nothing is owed. A one-part plan is written to task level before Stage 2 and built in the same run. Each campaign step's task plan is its own pipeline's: `/cleanup-light`'s Stage 1.7 PLAN block, or `/change-heavy`'s Stage 1 doc, each critiqued as usual (R-12); "enters at implement" in an older plan reads as "re-enters at critique". The run that lands the last part marks the code plan resolved.

  ```markdown
  ---
  status: proposed
  date: <ISO date>
  slug: <Module>
  ---

  # <Module> — campaign

  <What the module builds, and what comes before and after it.>

  - **Spec:** [<module> design](<date>-<module>-design.md)
  - **Locked design:** [<page> design](<date>-module-<slug>-page-<page>-design.md)
  - **Locked code plan:** [<page> code plan](<date>-module-<slug>-page-<page>-code.md), whose parts these phases build.

  **Design gaps:** a step that meets a screen or state the design doesn't cover runs `/page-design` for it, `--park` when unattended so its row carries the revised design and mockup, and builds what the locked design covers; a design found wrong goes back as `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Building from a locked design, Kick-backs says.

  ## Parts

  | Part | What it builds | Files | Depends on | Pipeline |
  |---|---|---|---|---|
  | P1 | <the part> | <its files> | — | <cleanup-light or change-heavy> |

  ## Phases

  | Step | Part | What | Pipeline |
  |---|---|---|---|
  | 1.1 | P1 | <the step> | <cleanup-light or change-heavy> |

  **Close (after the last phase):** `/module-audit <module>`, its fix groups, then `/mobile-audit`, and the R-19 re-read of the spec, the design plan and the mockup against the whole built page.

  ## Group steps

  | Step | Group type | Rigor | Order |
  |---|---|---|---|
  ```

- **Written at implement.** In `/cleanup-light` Stage 2 and `/change-heavy` Stage 4's tasks, so the review sees them: the characterization test, the browser-spec cases and the build matched to the mockup.
- **Gated at verify.** Run before the review (`/cleanup-light` at the end of Stage 2, `/change-heavy` Stage 5) and again after its fixes (`/cleanup-light` Stage 5, `/change-heavy` Stage 7's re-verify): the characterization-test gate (a `src/lib/**` change with no test added or updated is a verify failure); the browser-spec gate (each scenario not marked `manual` is a passing case, § Browser specs); for a part that builds UI its mockup shows, the comparison with the mockup at 375px and desktop width in the browser pane (`preview_start` the dev server, a second tab at the mockup's file URL; a difference in layout, hierarchy, copy, figures or states counts); and the R-19 re-read of the Figures this part prints (each through its helper) and the Spec decisions honoured against the built page. A gate that doesn't apply is reported `n/a` with why. A difference is fixed in the run: a fix before the review is reviewed with the rest, and a fix after it goes to the Fable re-audit.
- **Review.** `/security-review` on every run of this work, a third trigger beside the risk surface and the risk paths. The Fable diff audit, the critics and the Adjudicator get the code plan's and mockup's paths, and the audit's lens is `/change-heavy` Stage 6's: correctness, data integrity, logic, silent changes against the plan, accessibility and duplication.
- **Kick-backs.** A mockup that's wrong, or a review verdict that the design is, goes back to `/page-design` as a parked question (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md` § Parking), since both pipelines can't ask, and the rest commits. A locked code plan found wrong is amended with the campaign doc, each amendment its own report line, re-critiqued (R-12).
- **Old plans.** A code plan locked before this section names no browser spec and marks nothing `manual`: its UI scenarios are written as cases in the module's functional spec and named in the report, with no kick-back.
- **Report.** The gates' results (`n/a` with why), the `/mobile-audit <page>` recommendation for interactive UI, any kick-back or plan amendment, and the plan marked resolved when this run lands its last part. Both pipelines' rows carry `design: true` for this work.
- **Browser tools.** A pipeline that runs these gates (both change pipelines) pre-approves `mcp__Claude_Browser__preview_start`, `mcp__Claude_Browser__navigate`, `mcp__Claude_Browser__resize_window`, `mcp__Claude_Browser__javascript_tool` and `mcp__Claude_Browser__computer`.

## The pre-commit audit

A pipeline's commit stage runs `/pre-commit-check` in a foreground `general-purpose` subagent, never through the Skill tool. A command loaded through the Skill tool arrives as a new user turn, so the session takes the audit for the whole request, prints its report and ends its turn with the run uncommitted (`${CLAUDE_PLUGIN_ROOT}/tests/decision-gates.test.mjs`). The subagent's report returns as a tool result and the run carries on in the same turn.

The subagent has none of the run's conversation (R-22), so the dispatch carries: the working tree's absolute path; "Read `${CLAUDE_PLUGIN_ROOT}/commands/pre-commit-check.md` and run it in staged mode, called from a pipeline: report only"; `--task "<the run's task in one line>"`; and `--message` with the drafted commit message, its footers included. Fix each WARN or FAIL and dispatch it again (tier 1); a finding that is the owner's call is parked (tier 3). Then commit.
