---
description: Mobile-responsiveness audit at 375px. Scope is inferred from your prompt — a page, a module, or the whole app. Runs 4 layers (static, runtime-measured, throttled trace + Lighthouse, mobile-UX critique), adversarially verifies each HIGH finding to cut false positives, assigns each route works/minor/rework, and writes an audit doc (one page) or a phased Campaign (full app). Diagnostic only — never auto-fixes; hands fixes to /page-implement. Self-reviews on full-app runs (hands new lessons to /end-session and lists unused skills as suggestions).
argument-hint: '[natural-language scope — e.g. "the dashboard", "the billing module", "the whole app"; omit for changed routes]'
allowed-tools: Read, Write, Edit, Bash, Agent, Skill, Workflow, WebSearch, mcp__Claude_Browser__preview_start, mcp__Claude_Browser__preview_list, mcp__Claude_Browser__preview_stop, mcp__Claude_Browser__resize_window, mcp__Claude_Browser__javascript_tool, mcp__Claude_Browser__computer, mcp__Claude_Browser__read_page, mcp__Claude_Browser__read_console_messages, mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page, mcp__plugin_chrome-devtools-mcp_chrome-devtools__emulate, mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot, mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_screenshot, mcp__plugin_chrome-devtools-mcp_chrome-devtools__lighthouse_audit, mcp__plugin_chrome-devtools-mcp_chrome-devtools__performance_start_trace, mcp__plugin_chrome-devtools-mcp_chrome-devtools__performance_analyze_insight, mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script, mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages
disallowed-tools: AskUserQuestion
---

> **Gates follow `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`.** A programming call is decided and listed in the run's report; only that doc's tier-3 items are the owner's.

# /mobile-audit

You are running the **/mobile-audit pipeline** — a scope-adaptive mobile-responsiveness audit at 375px. It runs the same 4-layer diagnostic on whatever you point it at: one page, a module's routes, or the whole app. **Diagnostic only — never auto-fix.** The fixer is `/page-implement`, invoked later from the findings.

User's invocation argument (the scope, in plain language): **$ARGUMENTS**

Full-app is a *scope*, not a separate command. The only thing scale changes is the engine — a few routes run inline; the whole app fans out through `docs/workflows/mobile-triage-critique.js`.

---

## Operating notes

Read `${CLAUDE_PLUGIN_ROOT}/reference/mobile-audit.md` before Stage 0: notes from past runs on measuring the default state, off-canvas drawers, modal scoping, Lighthouse transition artifacts and static sites (the static-site note changes Stage 0's LIGHT/HEAVY choice). Then read `~/.claude/data/mobile-audit-notes.md` when it exists: your own notes from past runs. New notes go there, never into the toolkit's files or this command.

---

## Stage 0 — Infer scope + weigh the run

1. **Infer scope from $ARGUMENTS (natural language — no flag required):**
   - Names a page/feature ("the dashboard", "the billing page") → that route (or few).
   - Names a module ("the billing module", "admin") → that module's routes.
   - "the whole app" / "everything" / "all routes" → full-app.
   - Ambiguous between two of these → the narrower one.
   - Empty → default to changed routes: !`git diff --name-only HEAD` → map any `src/app/**/page.tsx` to its route.
2. **Enumerate routes.** For module/full-app: `find src/app -name page.tsx`, strip route-group `(...)` segments, drop `/api`. For `[param]` routes, pick one representative live id or mark `skipped-needs-id`.
3. **Classify run weight:**
   - **LIGHT (1–3 routes):** run inline.
   - **HEAVY (a module or full-app, many routes):** state the cost in one line and start (tier 1, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`: a costly run doesn't stop): *"Auditing [N] routes — log in, capture each at 375px, and fan out the critique workflow (~[2N] agents)."*
4. **Tier:** default audit tier **premium** (unlocks the most premium UI; record free-tier locked overlays as their own surface). Honor an explicit tier in the prompt.

Output the route list + weight (LIGHT/HEAVY) before proceeding.

---

## Stage 1 — Capture (serial — one browser)

The runtime layers share one browser session and **cannot** be parallelized — capture is always sequential. Screenshots **must be saved to disk** (a subagent critic can only read a file path, never an inline image), under the gitignored scratch `docs/audits/_mobile-triage/<ISO-date>/shots/`.

- **LIGHT:** capture inline. Per route: `navigate_page` → `emulate` `375x812x2,mobile,touch` + dark → `take_screenshot` `{filePath: shots/<slug>.png, fullPage:true}` → `take_snapshot` → the measured collector (Stage 1 Layers below).
- **HEAVY:** write and run a Playwright capture script (one run logs in + visits every route + screenshots + measures → `measured.json`). **This beats serial MCP for full-app** — one process vs ~3 round-trips per route. Reuse your app's auth setup (log in through the login form → wait for the authed landing route; wait for any gating state — e.g. a plan/tier flag — to persist in localStorage, or gated routes bounce to `/`). Use generous timeouts on first hit — Next dev compiles each route on first navigation.

Each route yields a bundle: `{ route, screenshotPath, snapshot, measured: [{layer,severity,category,detail,fix}] }`.

**Redirect / dupe handling (lesson — verify before flagging):** if a route's landed path ≠ requested path, do NOT auto-flag it broken. Read the source first — distinguish *intentional* redirects (a modal-only route like `/settings`, a waitlist gate like `/billing/enterprise`, an authed redirect on `/`) from real breakage. Exclude landed-on-dupes (e.g. three routes landing on `/dashboard`) from critique; record intentional redirects as notes, real ones as findings.

### The four layers (per captured route)

- **Layer A — static:** grep the route's source for `<button>` under 44×44, `<input>` missing `inputmode`/`autocomplete`, hover-only interactions, fixed widths >375px, sub-16px input fonts, unsafe sticky elements.
- **Layer B — runtime measured** (the collector, via `evaluate_script` or in the Playwright script): authoritative tap-target sizes (<44×44 → WCAG 2.5.5); viewport meta (`user-scalable=no`/`maximum-scale=1` blocks pinch-zoom — WCAG 1.4.4; missing viewport/`lang`); horizontal scroll (`scrollWidth > innerWidth`); elements wider than viewport; sub-16px inputs (iOS auto-zoom); orphaned inputs. **Measure the DEFAULT rendered state**: do NOT open drawers/menus/modals before capturing, and have the collector skip elements inside `[aria-hidden="true"]`, `[hidden]`, or collapsed/off-canvas containers — an open nav drawer inflated the tap-target count on the first full run (see `${CLAUDE_PLUGIN_ROOT}/reference/mobile-audit.md`), so off-default-screen controls must not be counted as visible targets. Layer B *supersedes* Layer A where they overlap (measures rendered reality, not source heuristics).
- **Layer C — throttled trace + Lighthouse** (chrome-devtools): one `emulate` call with viewport `375x812x2,mobile,touch`, `colorScheme:"dark"`, `networkConditions:"Fast 3G"` and `cpuThrottlingRate:4` (each call replaces every emulation setting, so it repeats Stage 1's viewport and dark mode). Then `performance_start_trace` (`reload: true`, `autoStop: true`) and `performance_analyze_insight` (`insightName: "LCPBreakdown"`, with the `insightSetId` the trace output lists) give the LCP and the performance verdict, and `lighthouse_audit` (`device: "mobile"`) gives accessibility and best practices: it excludes performance. The throttle is the point — 375px on desktop CPU/network hides the perf failures phones actually hit. If LCP >4s or CLS >0.25, flag it. **On the LIGHT path (the browser is already open, so cost is trivial), whether to run `debug-optimize-lcp` on a flagged route for root cause is Claude's call** (a programming call, `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`): make it and name it, with what it found, in the report. On HEAVY, just record the number and let Stage 7's skill-scout surface `debug-optimize-lcp` — do NOT dispatch it per-route (it breaks the single-Playwright-process model). (Layer C is optional on large sweeps — note if skipped for cost.)
- **Layer D — mobile-UX critique:** the usability half — Stage 2.

---

## Stage 2 — Mobile-UX critique (Layer D, parallel)

Layers A–C measure what's *technically* wrong; Layer D judges what's *unusable*. Two critics per route, against the saved 375px screenshot + snapshot + measured findings:

- **D1 — frontend-design lens:** does visual hierarchy survive at phone width? Dense/tabular data still scannable or crushed? Brand fidelity (your palette, your component tiers) intact? AI-default tropes? Density broken?
- **D2 — mobile-UX lens:** thumb-driven — is the primary action reachable without horizontal scroll/hunting? Do data tables reflow to cards or stay unusable wide tables? Do modals/drawers fit? Is anything critical below the fold or off-screen? Enumerate concrete friction.

- **LIGHT:** dispatch D1+D2 per route via the Agent tool (single message), `model:` matching the orchestrator.
- **HEAVY:** invoke the engine — it runs Critique (D1+D2 per route) → Verify (per-HIGH) → Synthesize in one call:
  `Workflow({ scriptPath: 'docs/workflows/mobile-triage-critique.js', args: { date:'<ISO-date>', tier:'<tier>', routes:[ ...bundles ] } })`
  It returns per-route verdicts, fix-ordered phases, a summary, and `falsePositives` (the refuted-HIGH count).

If no screenshot exists for a route, skip Layer D and mark it `measured-only`.

---

## Stage 3 — Verify HIGH findings (cut false positives)

Pulled from `/change-heavy`: do not let raw critic output reach the artifact unfiltered.

1. **Verify every HIGH** (adversarial, nested — one verifier per HIGH; default to *refuted* on uncertainty). The verifier re-checks the claim against the screenshot + the cited source file: is this real, or a misread (an intentional redirect, a scroll-contained table that isn't actually clipping, a target that's really ≥44px, a systemic issue mis-tagged page-specific)? **Refuted HIGHs are the run's false-positive signal** (feeds telemetry); real-but-overstated HIGHs downgrade to MEDIUM. This per-HIGH verify *is* the noise filter — it does the job a separate adjudicator stage would, without the extra ceremony. (HEAVY: the engine's Verify phase. LIGHT: dispatch verifiers via the Agent tool.)
2. **Systemic vs page-specific (the load-bearing lesson):** a finding repeated on a majority of routes with near-identical evidence (e.g. the shared nav chips ~31px on every page) is ONE shared-component fix, not N reworks. Tag it systemic; do NOT let a systemic HIGH alone force every route to rework. (HEAVY: applied inside the engine's Synthesize prompt. LIGHT: apply it here before Stage 4.)

---

## Stage 4 — Categorize + verdict

Combine verified A–D findings. Severity: **HIGH** (WCAG violation, horizontal scroll, broken layout, hidden critical content, or a Layer-D "fundamentally unusable" verdict) / **MEDIUM** (truncation, bad input types, throttled perf regression, non-blocking friction) / **LOW** (polish).

Per-route verdict — judged on **page-specific** issues (systemic counted once, not per-route):
- 🟢 **Works** — no page-specific HIGH; ≤1 page-specific MEDIUM; no blocking usability issue.
- 🟡 **Minor** — no page-specific HIGH; some MEDIUM; fixable in place.
- 🔴 **Rework** — a page-specific HIGH, or fundamentally not usable on a phone.

---

## Stage 5 — Write artifact

Write it without asking (tier 1). A layer or route that failed to capture is re-run first, or named in the artifact as missing.

- **LIGHT → audit doc** `docs/audits/<ISO-date>-mobile-audit-<slug>.md` — per-route findings (HIGH/MED with file:line + fix), verdict, 🔴/🟡 evidence screenshots referenced.
- **HEAVY → Campaign doc** `docs/audits/<ISO-date>-mobile-ux-campaign.md` (campaign form, Effort→Phase→Step): triage table at top (route · verdict · H · M · one-liner), then phases ordered **systemic-first, then severity × surface importance**, each Step → `/page-implement`. Frontmatter `status: proposed`, layers, verdict tally, artifact paths.

Always anchor to CLAUDE.md "every page mobile responsive (375px)" + STYLE_GUIDE.

---

## Stage 6 — Prune + telemetry

1. **Prune the scratch** (screenshots are transient critique inputs): keep only 🔴-route evidence shots (or none if the artifact embeds them); delete the rest. The durable record is the text artifact, not 15MB of PNGs. The scratch dir is gitignored (`docs/audits/_mobile-triage/`).
2. **Telemetry** — append one tagged line to the shared `~/.claude/metrics.jsonl` (same file all pipelines use; filter by `pipeline`):

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"mobile-audit\",\"outcome\":\"<completed|no-op>\",\"scope\":\"<light|heavy>\",\"routes\":<n>,\"works\":<w>,\"minor\":<mi>,\"rework\":<r>,\"high\":<h>,\"medium\":<m>,\"false_positives\":<refuted-HIGH count from the Verify phase>,\"fix_flip\":<routes that flipped 🔴/🟡→🟢 vs the prior run for this scope, or null>}" >> ~/.claude/metrics.jsonl
```

Field sources (every placeholder must have a producer — the `/change-heavy` telemetry discipline):
- `outcome` — `completed` when the audit ran and produced verdicts; `no-op` when Stage 0 found no in-scope routes to audit (the only early-exit). The mandatory shared-envelope status field — keep it second, right after `pipeline`.
- `works/minor/rework/high/medium` — tallied by THIS command from the engine's `routes[]` verdicts (HEAVY) or your inline per-route verdicts (LIGHT); the engine returns per-route verdicts, not pre-summed totals.
- `false_positives` — the engine's `falsePositives` return field (HEAVY) or your subagent-verifier refutals (LIGHT).
- `fix_flip` — re-audit delta vs the prior run of this scope (null on first run). The effectiveness signal: how many routes improved after fixes landed.

---

## Stage 7 — Self-review (HEAVY runs only)

The pipeline routes its own improvements and lists them in the report (tier 1); it never edits its own command file.

1. **Lessons — only if this run surfaced a NEW failure mode** (a redirect class nearly mis-flagged, a measured heuristic that over-triggered, a capture timeout). If nothing new, skip silently. Otherwise draft ≤3 candidate lessons and hand them to the project's stack-discipline flow (migrated projects: `/end-session` files them per `${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § End, within its per-session limit). Operating notes that aren't lessons are appended to `~/.claude/data/mobile-audit-notes.md` (create it with a `# /mobile-audit — my operating notes` heading if absent).
2. **Scout unused skills (cheap, in-session only).** From the session's already-available skills/MCP tools, list any mobile/a11y/perf-relevant ones this pipeline does NOT use (e.g. `design:accessibility-review`, `chrome-devtools-mcp:debug-optimize-lcp`). Surface as *suggestions* — never adopt autonomously. Web-searching for *newly-released* skills is deliberately NOT done here — that belongs to the periodic cross-pipeline `/schedule` assessment, so we don't re-scan the marketplace on every audit.

Skip Stage 7 entirely on LIGHT runs (not enough signal; not worth the tokens).

---

## Done

Summarize: artifact path; verdict tally 🟢/🟡/🔴 + HIGH/MED counts; false-positives the verify pass refuted; which of the 4 layers ran (note fallbacks: static-only / no-lighthouse / measured-only); any skipped routes (skipped-needs-id, intentional-redirect); Stage 7 outcome (lessons handed on, notes appended, skills suggested) on HEAVY runs; next step (`/page-implement` per 🔴 Step). Confirm the scratch was pruned.

---

## Notes for Claude executing this command

- **Diagnostic only.** Never auto-fix. `/page-implement` is the fixer; a 375px Playwright baseline (in your visual-test dir) is the regression guard after a fix.
- **Scope is inferred from the prompt** — no `--scope` flag. Default to changed routes; an ambiguous prompt takes the narrower scope, so it can't spawn the HEAVY workflow by accident.
- **Don't skip Stage 3.** Raw critic output has false positives (a waitlist-gate near-miss). Verify HIGHs before they reach the artifact. (Capture/disk invariants are stated once in Stage 1.)
- **Stage 7 hands lessons on and appends notes; it never edits this command.** Telemetry (Stage 6) is the data the future cross-pipeline `/schedule` assessment will read — keep it tagged `"pipeline":"mobile-audit"` in the single shared `metrics.jsonl`.
- **The engine** (`docs/workflows/mobile-triage-critique.js`) owns the HEAVY-path Critique + Verify + Synthesize fan-out; this command owns capture, the LIGHT path, scoping, and the artifact.
