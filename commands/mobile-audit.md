---
description: Mobile-responsiveness audit at 375px. Scope is inferred from your prompt — a page, a module, or the whole app. Runs 4 layers (static, runtime-measured, throttled Lighthouse, mobile-UX critique), adversarially verifies each HIGH finding to cut false positives, assigns each route works/minor/rework, and writes an audit doc (one page) or a phased Campaign (full app). Diagnostic only — never auto-fixes; hands fixes to /page-implement. Self-reviews on full-app runs (proposes lessons + scouts unused/new skills, both gated on your approval).
argument-hint: [natural-language scope — e.g. "the dashboard", "the billing module", "the whole app"; omit for changed routes]
allowed-tools: Read, Write, Edit, Bash, Task, Skill, Workflow, SlashCommand, WebSearch, AskUserQuestion, mcp__Claude_Preview__preview_start, mcp__Claude_Preview__preview_resize, mcp__Claude_Preview__preview_eval, mcp__Claude_Preview__preview_screenshot, mcp__Claude_Preview__preview_inspect, mcp__Claude_Preview__preview_snapshot, mcp__Claude_Preview__preview_console_logs, mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page, mcp__plugin_chrome-devtools-mcp_chrome-devtools__emulate, mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot, mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_screenshot, mcp__plugin_chrome-devtools-mcp_chrome-devtools__lighthouse_audit, mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script, mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages
---

# /mobile-audit

You are running the **/mobile-audit pipeline** — a scope-adaptive mobile-responsiveness audit at 375px. It runs the same 4-layer diagnostic on whatever you point it at: one page, a module's routes, or the whole app. **Diagnostic only — never auto-fix.** The fixer is `/page-implement`, invoked later from the findings.

User's invocation argument (the scope, in plain language): **$ARGUMENTS**

This command replaced the former `/mobile-flow` (2026-06-21): full-app is now a *scope*, not a separate command. The only thing scale changes is the engine — a few routes run inline; the whole app fans out through `docs/workflows/mobile-triage-critique.js`.

---

## Stage 0 — Infer scope + cost gate

1. **Infer scope from $ARGUMENTS (natural language — no flag required):**
   - Names a page/feature ("the dashboard", "the billing page") → that route (or few).
   - Names a module ("the billing module", "admin") → that module's routes.
   - "the whole app" / "everything" / "all routes" → full-app.
   - Empty → default to changed routes: !`git diff --name-only HEAD` → map any `src/app/**/page.tsx` to its route.
2. **Enumerate routes.** For module/full-app: `find src/app -name page.tsx`, strip route-group `(...)` segments, drop `/api`. For `[param]` routes, pick one representative live id or mark `skipped-needs-id`.
3. **Classify run weight + gate:**
   - **LIGHT (1–3 routes):** run inline. No confirm.
   - **HEAVY (a module or full-app, many routes):** use `AskUserQuestion` to compel a cost gate (the heavy path logs in, captures N routes, and spawns the critique workflow — dozens of agents):
     - **Question:** *"This will audit [N] routes — log in, capture each at 375px, and fan out the critique workflow (~[2N] agents). Proceed?"*
     - **Options:** `Run full sweep` → continue · `Narrow the scope` → take a smaller route list · `Exit` → stop.
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
- **Layer B — runtime measured** (the collector, via `evaluate_script` or in the Playwright script): authoritative tap-target sizes (<44×44 → WCAG 2.5.5); viewport meta (`user-scalable=no`/`maximum-scale=1` blocks pinch-zoom — WCAG 1.4.4; missing viewport/`lang`); horizontal scroll (`scrollWidth > innerWidth`); elements wider than viewport; sub-16px inputs (iOS auto-zoom); orphaned inputs. **Measure the DEFAULT rendered state**: do NOT open drawers/menus/modals before capturing, and have the collector skip elements inside `[aria-hidden="true"]`, `[hidden]`, or collapsed/off-canvas containers — an open nav drawer inflated the tap-target count on the first full run (see Lessons), so off-default-screen controls must not be counted as visible targets. Layer B *supersedes* Layer A where they overlap (measures rendered reality, not source heuristics).
- **Layer C — throttled Lighthouse** (chrome-devtools): `emulate` 375px + `networkConditions:"Fast 3G"` + `cpuThrottlingRate:4`, then `lighthouse_audit`. The throttle is the point — 375px on desktop CPU/network hides the perf failures phones actually hit. If LCP >4s or perf <50, flag it. **On the LIGHT path (the browser is already open, so cost is trivial), offer a one-line opt-in — "Run `debug-optimize-lcp` on `<route>` for root cause?" — and dispatch it only if the user accepts** (don't auto-fire; keep the perf number in human view first). On HEAVY, just record the number and let Stage 7's skill-scout surface `debug-optimize-lcp` — do NOT dispatch it per-route (it breaks the single-Playwright-process model). (Layer C is optional on large sweeps — note if skipped for cost.)
- **Layer D — mobile-UX critique:** the usability half — Stage 2.

---

## Stage 2 — Mobile-UX critique (Layer D, parallel)

Layers A–C measure what's *technically* wrong; Layer D judges what's *unusable*. Two critics per route, against the saved 375px screenshot + snapshot + measured findings:

- **D1 — frontend-design lens:** does visual hierarchy survive at phone width? Dense/tabular data still scannable or crushed? Brand fidelity (your palette, your component tiers) intact? AI-default tropes? Density broken?
- **D2 — mobile-UX lens:** thumb-driven — is the primary action reachable without horizontal scroll/hunting? Do data tables reflow to cards or stay unusable wide tables? Do modals/drawers fit? Is anything critical below the fold or off-screen? Enumerate concrete friction.

- **LIGHT:** dispatch D1+D2 per route via the Task tool (single message), `model:` matching the orchestrator.
- **HEAVY:** invoke the engine — it runs Critique (D1+D2 per route) → Verify (per-HIGH) → Synthesize in one call:
  `Workflow({ scriptPath: 'docs/workflows/mobile-triage-critique.js', args: { date:'<ISO-date>', tier:'<tier>', routes:[ ...bundles ] } })`
  It returns per-route verdicts, fix-ordered phases, a summary, and `falsePositives` (the refuted-HIGH count).

If no screenshot exists for a route, skip Layer D and mark it `measured-only`.

---

## Stage 3 — Verify HIGH findings (cut false positives)

Pulled from `/change-heavy`: do not let raw critic output reach the artifact unfiltered.

1. **Verify every HIGH** (adversarial, nested — one verifier per HIGH; default to *refuted* on uncertainty). The verifier re-checks the claim against the screenshot + the cited source file: is this real, or a misread (an intentional redirect, a scroll-contained table that isn't actually clipping, a target that's really ≥44px, a systemic issue mis-tagged page-specific)? **Refuted HIGHs are the run's false-positive signal** (feeds telemetry); real-but-overstated HIGHs downgrade to MEDIUM. This per-HIGH verify *is* the noise filter — it does the job a separate adjudicator stage would, without the extra ceremony. (HEAVY: the engine's Verify phase. LIGHT: dispatch verifiers via Task.)
2. **Systemic vs page-specific (the load-bearing lesson):** a finding repeated on a majority of routes with near-identical evidence (e.g. the shared nav chips ~31px on every page) is ONE shared-component fix, not N reworks. Tag it systemic; do NOT let a systemic HIGH alone force every route to rework. (HEAVY: applied inside the engine's Synthesize prompt. LIGHT: apply it here before Stage 4.)

---

## Stage 4 — Categorize + verdict

Combine verified A–D findings. Severity: **HIGH** (WCAG violation, horizontal scroll, broken layout, hidden critical content, or a Layer-D "fundamentally unusable" verdict) / **MEDIUM** (truncation, bad input types, throttled perf regression, non-blocking friction) / **LOW** (polish).

Per-route verdict — judged on **page-specific** issues (systemic counted once, not per-route):
- 🟢 **Works** — no page-specific HIGH; ≤1 page-specific MEDIUM; no blocking usability issue.
- 🟡 **Minor** — no page-specific HIGH; some MEDIUM; fixable in place.
- 🔴 **Rework** — a page-specific HIGH, or fundamentally not usable on a phone.

---

## Stage 5 — Write artifact (gated)

`AskUserQuestion` before writing: `Write artifact` · `Surface inline only` · `Revise — re-run a layer/route`.

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
- `false_positives` — the engine's `falsePositives` return field (HEAVY) or your Task-verifier refutals (LIGHT).
- `fix_flip` — re-audit delta vs the prior run of this scope (null on first run). The effectiveness signal: how many routes improved after fixes landed.

---

## Stage 7 — Self-review (HEAVY runs only; every write gated)

The pipeline surfaces its own improvements; **you** decide. Never self-edit without approval (unsupervised self-modification drifts — your own "keep curation deliberate" rule).

1. **Propose lessons — only if this run surfaced a NEW failure mode** (a redirect class nearly mis-flagged, a measured heuristic that over-triggered, a capture timeout). If nothing new, skip silently. Otherwise draft ≤3 candidate lessons → `AskUserQuestion` to approve → write accepted ones into **Lessons** below AND surface for STACK.md per your stack-discipline flow.
2. **Scout unused skills (cheap, in-session only).** From the session's already-available skills/MCP tools, list any mobile/a11y/perf-relevant ones this pipeline does NOT use (e.g. `design:accessibility-review`, `chrome-devtools-mcp:debug-optimize-lcp`). Surface as *suggestions* — never adopt autonomously. Web-searching for *newly-released* skills is deliberately NOT done here — that belongs to the periodic cross-pipeline `/schedule` assessment, so we don't re-scan the marketplace on every audit.

Skip Stage 7 entirely on LIGHT runs (not enough signal; not worth the tokens).

---

## Lessons (operating notes)

Empirical, from real runs. Plain notes — if one graduates to STACK.md, the survival/promotion accounting happens there, not here.

- **Collector measures the DEFAULT state only.** Don't open drawers/menus before measuring; skip `aria-hidden`/off-canvas/breakpoint-hidden elements. Capturing with the mobile nav drawer open inflated the "systemic 31px nav / 61 sub-44px targets" count on the first full run — the default mobile view is a 40px hamburger, and the per-HIGH Verify pass caught it. Tap-target counts must reflect what the user sees first.
- **Off-canvas via CSS transform evades visibility flags — test viewport bounds + exclude shared-nav containers.** A `translate-x-full` drawer is NOT `display:none`/`aria-hidden` and reports a non-zero `getBoundingClientRect`, so a collector filtering only on visibility flags + `width/height>0` still counts it. (2026-06-24 Phase-1 re-audit: a persisted `sidebarOpen` left the drawer off-canvas, and its ~8 nav rows inflated EVERY route's count identically — 29–53 raw vs 6–34 page-specific.) The collector MUST add an explicit on-screen test — `r.right > 0 && r.left < vw && r.bottom > 0` — AND exclude shared-nav containers (`aside`/`.sidebar`/`.topbar`/`nav`/`[role=navigation]`) from per-route page-specific counts (nav is ONE systemic fix, never per-route — see "Systemic vs page-specific"). This is the concrete mechanism behind "measure the default state"; the nav-count has now been over-counted twice for this exact reason.
- **Screenshots to disk, pruned after.** Inline screenshots are invisible to subagent critics; full-page PNGs are ~15MB/run and must be gitignored + pruned, not committed.
- **Playwright capture > serial MCP for full-app.** One login+visit-all run beats ~3 MCP round-trips per route; reuse your app's auth.
- **Verify "broken" before flagging.** Redirects are often intentional (modal-only route, waitlist gate, authed redirect) — read source first.
- **Systemic vs page-specific.** A shared-component issue on every route is ONE fix, not N reworks — or the triage mislabels the whole app.
- **Audit at a tier that unlocks premium UI** (default premium); wait for any gating state to persist; note free-tier locked overlays as their own surface.
- **Scope modal/overlay measurement to the modal container** (not `document`). When the captured surface is a modal/drawer, run the collector against the modal root (e.g. `[role="dialog"]`, `.modal-card`) — a `fixed inset-0` overlay leaves the page behind it in the DOM, so a document-wide tap-target/input count double-counts the background surface and inflates the verdict. Capture the modal's viewport shot (`fullPage:false`); a modal-width-vs-viewport check catches the rare overflow case. (2026-06-24 supplemental run — the original capture.mjs had no modal-scoping because it only captured full routes.)
- **Close the nav drawer before screenshotting authed routes.** Distinct from the off-canvas-collector lessons (those are about *measurement*): on a full-app authed pass the mobile nav drawer can be left *open* (persisted `sidebarOpen`) and, being `fixed`, it overlays the TOP of every `fullPage` screenshot — compromising the Layer-D *visual* critique even though the hardened collector (nav-excluded + on-screen test) measures the page DOM correctly. Before each authed `take_screenshot`, force the drawer closed (clear the `sidebarOpen` localStorage key, or `press Escape`, or click the page body) so the shot is page content, not chrome. (2026-06-24 full-app re-audit — measured layer was clean but a short page showed only the open drawer; only a tall page scrolled past it.)
- **Lighthouse contrast fails can be a mid-entrance-animation artifact — verify the SETTLED state + the reduced-motion branch before flagging.** Lighthouse audits during load, so a `[data-reveal]`/`.anim` fade that animates opacity (or color) from a dim start makes Lighthouse compute contrast against the *composited* low-opacity color, reporting fake failures (e.g. a settled 7.57:1 link read as 1.81:1 with fg `#444036`). Before promoting a contrast HIGH: (1) re-measure the element's computed contrast after load settles, and (2) check the `@media (prefers-reduced-motion: reduce)` branch sets `opacity:1` — if it does, motion-sensitive users never see the dim state and the "failure" is a sub-second transient. **A theme-SWITCH is a SECOND artifact source with the same signature:** toggling dark↔light animates fg AND bg through muddy mid-values, so measuring right after a toggle reads a fake low ratio (a light-mode gold link read 3.17:1 mid-toggle vs a settled 4.79:1 that PASSES AA). Never measure a theme by clicking the toggle then reading synchronously — set the persisted theme key + reload (renders with no transition), wait for the entrance reveal to settle, THEN measure; cross-check against the token math (`#hex` on `#bg`) which is transition-immune. In one full-site run BOTH the dark- and light-mode "contrast fails" were transition artifacts — the real settled contrast passed AA in both themes (thin margin, 4.68–4.79:1). (from a real full-site run.)
- **Static-site repos: the HEAVY engine + auth assumptions don't apply — capture inline off a local static server.** This command's HEAVY path assumes a typical SaaS app (login via your visual-test auth, plan/tier gating, `src/app/**/page.tsx`, a capture fan-out engine). On a static HTML site (pages under `site/`, no build, no auth) none of that exists. Adapt: enumerate `**/*.html`, serve with `python3 -m http.server`, and run the four layers inline via chrome-devtools MCP (`emulate 375x812x2,mobile,touch` → `take_screenshot` → collector `evaluate_script` → `lighthouse_audit`). Collapse fork-family pages (e.g. 14 guide pages forked from one engine) to 1–2 samples — they produce identical findings. (2026-07-03 static-site full-site run.)

---

## Done

Summarize: artifact path (or inline-only); verdict tally 🟢/🟡/🔴 + HIGH/MED counts; false-positives the verify pass refuted; which of the 4 layers ran (note fallbacks: static-only / no-lighthouse / measured-only); any skipped routes (skipped-needs-id, intentional-redirect); Stage 7 outcome (lessons accepted, skills suggested) on HEAVY runs; next step (`/page-implement` per 🔴 Step). Confirm the scratch was pruned.

---

## Notes for Claude executing this command

- **Diagnostic only.** Never auto-fix. `/page-implement` is the fixer; a 375px Playwright baseline (in your visual-test dir) is the regression guard after a fix.
- **Scope is inferred from the prompt** — no `--scope` flag. Default to changed routes; gate HEAVY behind the Stage 0 cost confirm so an ambiguous prompt can't spawn the workflow by accident.
- **Don't skip Stage 3.** Raw critic output has false positives (a waitlist-gate near-miss). Verify HIGHs before they reach the artifact. (Capture/disk invariants are stated once in Stage 1.)
- **Stage 7 writes nothing without your yes.** The pipeline proposes; you curate. Telemetry (Stage 6) is the data the future cross-pipeline `/schedule` assessment will read — keep it tagged `"pipeline":"mobile-audit"` in the single shared `metrics.jsonl`.
- **The engine** (`docs/workflows/mobile-triage-critique.js`) owns the HEAVY-path Critique + Verify + Synthesize fan-out; this command owns capture, the LIGHT path, gating, and the artifact.
