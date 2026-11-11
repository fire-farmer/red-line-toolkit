# CLAUDE.md — <your project>

The always-on rules for how the coding agent works in this repo. It's read every session. The toolkit's commands cite the section headers below, so keep them. A CLAUDE.md isn't plugin content, so it names the toolkit's files as "the toolkit's `reference/<doc>.md`": the plugin's install folder, which the commands spell `${CLAUDE_PLUGIN_ROOT}`.

## Working Principles

These govern *how* to approach tasks. When they conflict with other guidance in this file, they win.

### Default workflow

This applies when you're about to **implement substantive code**: a multi-file change, new logic, or anything high-risk. For direction calls ("which approach?", "is this worth doing now?"), lead with the decision brief (Communication style) instead of a `PLAN` block. A small fix that passes the quick lane's entry test (`/cleanup-light` § The quick lane: at most 2 files, no new CSS class, token or shared component and no edit to an existing one used outside those files, nothing beyond the named fix, nothing in the Heavy-rigor trigger, no risk path, no design or copy choice of the owner's, an existing test or check covering it) takes that lane: the edit, its affected tests, one Fable pass and a commit, in a session that's already open.

**1. Plan first.** Before writing code, output a `PLAN` block:
- **Problem:** 1–2 sentence restatement of the ask
- **Approach:** Chosen approach + one alternative considered and rejected (one-line reason)
- **Assumptions:** What you're taking as given; flag any that, if wrong, invalidate the plan
- **Reuses:** The existing class, token or component this change reuses, or `New: <name> — nothing existing fits because <reason>`. Required whenever the change adds or changes a CSS class, a token or a shared component; the Fable plan critique checks it against the codebase
- **Scope:** Files that will change
- **Risks:** Failure modes, edge cases
- **Verify:** How you'll know each step succeeded — test to write, command to run, page/route to check

**1b. Claims in a plan.** Never write a code shape you have not opened this turn (paste it from the file, never retype it from a sibling); take a count from the command that will verify it (R-4, R-23, R-9); and probe an unfamiliar seam before designing in it — budget about five; run the form, don't derive behaviour by reading. The toolkit's `reference/pipeline-shared.md` § Claim discipline is the full rule.

**2. Implement against the plan.** If you realize partway through that the plan is wrong, stop and revise the plan — don't silently diverge.

**3. Self-review.** After implementation, output a `REVIEW` block:
- **Riskiest part:** Single riskiest line/decision and why
- **Not tested:** What a skeptical reviewer would want tested that you didn't test
- **Leftovers:** Everything noticed along the way, each with its filing-bar outcome (see Scope discipline)

Skip only when the change is mechanical and obviously correct.

**Heavy rigor (heavy-mode pipeline).** The trigger is **what a change alters, not its folder or size** (the toolkit's `reference/pipeline-shared.md` § The rigor trigger). Invoke `/change-heavy` when a change alters a **computed or printed figure** (a value, a rounding, which figure a row prints, whether a figure prints at all), a **stored, imported or exported data shape** (a migration that rewrites or deletes stored values counts), or an **auth, RLS, tier or payment path**, or when it introduces a **new data model or API shape**. Those changes cluster in your high-risk areas — name yours here, with their paths: e.g. **money math** (`src/lib/billing/**`), **RLS and migrations** (`supabase/migrations/**`), **payments**, **auth** (auth routes, middleware, tier gating) and **exports** (PDF, CSV, share). A change there that only alters labels, copy, layout or styling runs `/cleanup-light`, which keeps its Fable review. **Borderline → the heavier one.** **Everything else runs `/cleanup-light`, at any file count** — one FU, a whole group step, or a named task — with a PLAN block and a Fable plan critique for work that touches 3+ files, adds a new abstraction, or changes styling.

**Fable reviews every change to code.** Every pipeline run includes a decorrelated Fable review — a model family other than the one that wrote the diff — that also searches for duplicated styling. It finds; it never fixes. A quick-lane fix gets its one Fable pass before its commit; only docs, ledger and comment-only edits made outside a pipeline skip Fable.

**Commit truthfully.** The commit body describes the actual staged diff, not the intended diff or experimentation that got rolled back mid-session.

### Scope discipline

- Change the minimum lines required. Do not reformat, rename, or restructure outside scope. **Scope is the class, not the cited site:** the same fix at every site of the same defect is in scope (R-20), and so is a listed fix of a real issue in the area the change works, a minor tweak included (the filing bar below).
- **The filing bar.** Anything noticed during a change gets exactly one outcome, never a silent edit: **fix it now** when it's the same class as the change (the default), or when it's a real issue in the area the change works, whatever its class (fix in the moment, below), the smallest being a **minor tweak** in a file the change already touches — a few lines that need no plan of their own and add no abstraction — each listed in the report and the commit body (a design, copy or UX choice that's genuinely the owner's, one no approved design, spec or ruling covers, is parked instead); **file it** only when it passes the 2-week filter *and* has a named reason it can't be done now (a product decision, a real risk, an abstraction decision, or work that needs its own run); otherwise **drop it**, with one line in the commit body. A successor FU (the unfinished remainder of work this change did) is in the area, so the same run finishes it. **Fix in the moment:** a real issue found in the area a run is working (the same feature, flow or files) is fixed in that run, even when it's another class, because a new run costs far more than finishing it there. "Work that needs its own run" means a completely separate area, not another class beside the change. `ledger.mjs audit` stops on an FU filed in a file its session changed unless its reason is `product` or it's an owner decision. Full rule: the toolkit's `reference/ledger-session.md` § FUs.
- Never mix refactoring with feature changes in the same diff (an in-area fix of the other kind lands in the same run as its own commit).
- If the task touches >3 files or introduces a new abstraction, write the PLAN first and list it in the run's report (the toolkit's `reference/decision-gates.md` § The report).
- **Trace test:** every changed line should trace directly to the user's request, to the same class of fix, or to a listed in-area fix or minor tweak. If it doesn't, it gets a filing-bar outcome.
- **User-facing copy changes count as feature changes**, not refactor. Even one-word string updates belong in their own `chore(copy):` or `feat:` commit, not folded into a refactor diff.

### Code structure rules

- **No abstraction until 2+ concrete callers** — YAGNI wins by default
- **Function budget:** ~40 lines max, ~3 levels of nesting max — if heading past, reconsider structure
- **No new dependencies** without flagging in the PLAN and justifying
- **No catching exceptions you can't meaningfully handle** — let them propagate
- **No defensive checks** for conditions that cannot occur given types and known callers
- **No comments that restate code** — comments explain *why*, not *what*
- **Prefer deleting code over adding** — prefer clarifying existing code over wrapping it
- **Match existing local style** even when you'd do it differently — sibling files set the convention
- **Clean up orphans your changes created** (imports/vars/functions you made unused) — but don't delete pre-existing dead code unless asked

### Cohesion gate before extraction (File Size Guidelines)

Don't extract a new file/function unless it earns it. A proposed extraction must state in one sentence what it wins — owns a state cluster the parent has no awareness of, needs memoization for stability in a `.map()`, etc. **Reject** extractions justified only by:
- "Future testability" alone
- "Visual isolation" alone (visual-leaf extractions require >100 LOC *and* isolation)
- "Pattern consistency with siblings" as the primary reason
- "2+ callers in the same parent file" — that's within-file repetition; use a private inner function

### When to ask instead of guess

**Only the tier-3 items go to the owner, and only in the way that section says** (most are parked, not asked). When one is asked, surface the alternatives explicitly — each option with one plain pro + con and your recommended pick flagged. Options inform the decision; they don't offload it.

**What goes to the owner:** the toolkit's `reference/decision-gates.md` § Tier 3 — what waits for the owner; a parked item is an `owner decision` row in `Standing-FUs.md`.

**Everything else is act-and-report** (the toolkit's `reference/decision-gates.md` § Tier 1 — act and report): a run with nothing for the owner commits locally and then reports. The toolkit's `reference/decision-gates.md` § Telling them apart sorts an unclear case.

Do **not** ask about things this file or your style guide already answers, or things resolvable by reading adjacent code.

### Communication style

The owner reads these responses to make a *decision*, not to watch the work happen.

- **Lead with the answer, in plain language.** Bottom line first; supporting detail after.
- **Don't narrate the investigation.** Give the conclusion; surface a mid-course discovery only when it changes the recommendation.
- **Recommend with conviction.** Take a position and defend it; the owner pushes back. Options, when given, each get one plain pro + one plain con, with your pick flagged.
- **Default to the right way.** The owner would rather pay for the thorough fix than carry tech debt. Recommend it — and when acting without asking, do it — unless the extra is gold-plating nobody will ever see; say which.

**The decision brief** — the shape when the owner needs to make a call. Use the fields that apply, one line each: **Problem** (who it hits) · **Recommendation** (do now / defer / drop, and why) · **Right vs. quick** (thorough route or shortcut, and is the shortcut genuinely fine here?) · **Options** (only for a real fork) · **Blast radius** · **Risks**.

**Deferrals are never silent.** Any time you recommend defer / drop / shortcut, name what's being parked, in one plain line, so the owner can veto on the spot. The structured FU row goes in the file at `/end-session`, not in the chat.

## Stack Discipline

You (Claude) own the stack. **Guiding constraint: the process must stay lighter than the problem it solves** — if tracking an item costs more than the item is worth, the tracking won't happen. Clustering and audits are done by the session commands, not by hand.

**Three files:**
- `docs/plans/<date>-global-plan.md` (from `templates/GLOBAL-PLAN.md`) — global scope: each campaign's git range, synopsis and plan links. The "where are we in the journey" anchor.
- `STACK.md` — live state: current campaign/phase, the campaign's FUs in group steps, and the lessons in force.
- `Standing-FUs.md` — FUs that **can't be done in the current campaign**, each with one checkable trigger that `ledger.mjs` tests every session.

**Session bookends:** `/start-session` (read-only orient from `ledger.mjs report`) and `/end-session` (sync: Current location, lesson evidence derived from the session, lesson and FU filing, `ledger.mjs audit` before the commit). This project runs LedgerLoop: register it in `~/.claude/projects.json` with `"migrated": true`; session steps are in the toolkit's `reference/ledger-session.md`, policy in the toolkit's `reference/ledger-lifecycle.md`.

**Hard rule:** maximum stack depth is **2** (strategic position only — pipeline stages are status metadata on a depth-2 entry). At depth 2 and find something else → record it, finish the current branch.

### Work-item taxonomy (naming standard)

- **Campaign** — a multi-phase effort with its own plan doc and a readable slug (e.g. `Billing`, `DesignRevamp`).
- **Phase** — a major theme within a Campaign. ID `1…n`. One STACK bullet each.
- **Step** — a work unit within a Phase. ID `<phase>.<step>` (e.g. `2.3`).
- **FU** — a parked task. ID `FU-<n>` (from `ledger.mjs next-id fu`). **`home:` is a fully-qualified address — `<Campaign>/<Phase>.<Step>`**, the phase's group step for the FU's type; a Standing FU carries a `trigger:` instead.

**Not a taxonomy level — `rigor`:** `cleanup-light` or `change-heavy`, decided by the Heavy-rigor trigger (Default workflow). It classifies a single *change*, orthogonal to the work-item tree.

### When you discover something — route by KIND first

**Bug** (something is *wrong or at risk right now*) → route by **severity, not phase**:
- **HIGH / security / breaks-deployed-code** → "Security / Action required" callout in STACK. Surface immediately. Found in the area a run is working → fixed in that run (handed to `/change-heavy` when it meets the Heavy-rigor trigger); otherwise fix standalone via `/cleanup-light` or `/change-heavy`.
- **Medium / low** → FU lane (below), tagged as a bug.

**FU** (current behavior is fine but could be better) → apply the 2-week filter (*"would the user do this in the next 2 weeks?"* — if no **and no concrete trigger will resurface it (→ Standing)**, don't record), then tag and route:

> **Rows** follow the toolkit's `reference/ledger-lifecycle.md` § Records; `ledger.mjs audit` stops on a row that breaks it. This project's values:
> - **type** ∈ `type-design · cross-form-parity · test-coverage · silent-failure · css-token-hygiene · design-system-primitive · cross-lib-dedup · observability · security · perf` (edit to suit; drives group steps)
> - **rigor** ∈ `cleanup-light` or `change-heavy`, decided by the Heavy-rigor trigger; a label, copy, layout or styling FU is `cleanup-light`. **Borderline → the heavier one.**
> - **Review leftovers** (critic findings, sibling patterns, declined-but-valid items) pass the filing bar (Scope discipline) before they become rows.

**Group steps** are how FU cleanup gets done: every STACK FU is filed into its phase's group step for its type, and a group step at the scheduling limit is placed in the campaign plan doc's `## Group steps` table before `/end-session` commits (the toolkit's `reference/ledger-lifecycle.md` § FUs).

### Lessons — LedgerLoop

STACK `## Lessons` lists the rules in force, one line each, with backstory and outcomes in `docs/lessons-reference.md`. Filing, evidence footers, ranking and leaving: the toolkit's `reference/ledger-lifecycle.md` § Lessons. A lesson never goes to memory.

### Per-task requirements

- Verify the build is clean and the lint count is preserved or improved.
- During multi-phase plan execution, run `/pre-commit-check` before each phase commit.

## Risk surfaces

Paths and topics that trigger the security-review stages: auth, row-level security, payments/webhooks, financial/calculation code, data export, public API routes. Name yours here (the toolkit's `reference/pipeline-shared.md` § Risk paths has the default list).

## Voice & style

Match the surrounding code. Point a canonical style guide (e.g. `docs/STYLE_GUIDE.md`) here if you have one.
