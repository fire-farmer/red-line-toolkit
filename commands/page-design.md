---
description: Per-page design pipeline. Runs 3 parallel critics (frontend-design + UI/UX + outcome) against an initial design draft, adjudicates findings, revises, and locks. Use after a Module Spec is locked to design each page in the module.
argument-hint: [page name from Module Spec]
allowed-tools: Read, Write, Task, AskUserQuestion, Skill
---

# /page-design

You are running the **/page-design pipeline** — per-page design with parallel-critic critique. The user invoked this because they need a locked design plan for a specific page before code work begins.

User's invocation argument (page name from Module Spec): **$ARGUMENTS**

---

## Stage 0 — Pre-flight scope check

Locate the Module Spec:
- Read the most recent `docs/plans/YYYY-MM-DD-module-*-spec.md`
- Confirm the page name from $ARGUMENTS exists in the Module Spec's page list
- If not found, surface to user and pause

Run the 3-item gate (cheatsheet §5):
1. **Tier check** — confirm pipeline-worthy (3+ files, new abstraction, or risk surface)
2. **Risk surface check** — engage security-asymmetric upgrade if RLS / auth / Stripe / exports / financial calc touched
3. **Existing-primitive check** — note relevant CSS / component families to grep in Stage 1

---

## Stage 1 — Initial design plan

Draft the design plan covering:
- **Visual hierarchy:** type levels (L1-L5 per STYLE_GUIDE), color/contrast usage, primary/secondary surfaces (Command / Metric / Info card tiers)
- **Component breakdown:** which existing components are reused; what's new (justified per existing-primitive check)
- **States:** empty, loading, error, success, edge cases (zero data, max data, slow network)
- **User flow:** entry points, primary action, dead ends if any
- **Outcome goals:** what action does this page earn the user toward?
- **Mobile considerations:** 375px adjustments, touch targets ≥44×44px, sticky elements

Surface the draft. Use `AskUserQuestion` to compel a structural pause:

- **Question:** *"Initial design draft ready. Send to critics?"*
- **Options:**
  - `Approve — proceed to critique` → continue
  - `Redirect — revise draft` → take redirection and re-draft
  - `Exit — defer this page` → stop

---

## Stage 2 — Parallel critique (3 critics)

Dispatch THREE critics in parallel via the Task tool — **a single message with three tool calls**. Pass `model:` matching the orchestrator's current model family on all three dispatches.

- **Critic 2a — frontend-design lens (general-purpose):**
  > *"Review this design plan through the frontend-design lens. Path: `<absolute path>`. Anchor to CLAUDE.md 'Design Principles' (refuse AI defaults — no generic gradients, sparkle icons, rounded-2xl + soft-shadow on every surface) and your STYLE_GUIDE's refuse-list. Verify brand fidelity to your palette + monospace numerics + your card/component tier system. Output structured findings: `section — severity — issue — recommendation`."*

- **Critic 2b — UI/UX critic (general-purpose):**
  > *"Review this design plan for UI/UX issues. Path: `<absolute path>`. Verify: state coverage (empty/loading/error/edge), 375px mobile responsiveness, a11y (tap targets, focus order, keyboard nav), interaction patterns. **Enumerate friction explicitly:** extra clicks, ambiguous states, lost form data on validation error, tab/visual order mismatches, format-rigid inputs, confirmation modals on low-risk actions. Output structured findings: `section — severity — issue — recommendation`."*

- **Critic 2c — outcome critic (general-purpose):**
  > *"Review this design plan for outcome fulfillment. Path: `<absolute path>`. Question: does this page earn the user's intended action? Marketing/onboarding → conversion. Settings → frictionless completion. Dashboard → data findability. Multi-step form → completion without abandonment. Output structured findings: `section — severity — issue — recommendation`."*

Collect and concatenate outputs into a structured block for the Adjudicator.

---

## Stage 3 — Adjudicate

Dispatch The Adjudicator (`the-adjudicator`) via the Task tool. Pass the structured block from Stage 2 plus the design plan path. Apply security-asymmetric upgrade if engaged.

Present The Adjudicator's output verbatim. Use `AskUserQuestion`:

- **Question:** *"The Adjudicator marked [N] critiques ([K] KEEP, [D] DITCH, [M] MODIFY). Which to absorb?"*
- **Options:**
  - `Absorb all KEEP + MODIFY` → incorporate and revise the design plan
  - `Absorb none — keep initial design` → no revision; lock as-is
  - `Let me list specific CRITIQUE_IDs` → free-text follow-up

---

## Stage 4 — Revise + lock

Apply selected verdicts. Write to `docs/plans/YYYY-MM-DD-module-<slug>-page-<page-slug>-design.md` with frontmatter:

```yaml
---
status: locked
date: <ISO date>
module: <module name>
page: <page name>
parent-spec: <path to Module Spec>
---
```

---

## Done

Summarize:
- Path to locked design plan
- Which verdicts were absorbed
- Next step: invoke `/page-code <page-name>` against this locked design plan

**Effectiveness telemetry — append on every completed run.** Via Bash, append JSON lines to `~/.claude/metrics.jsonl` (append-only; create if absent) AFTER the summary above. Two lines: one for the Stage 3 adjudication (emitted by the orchestrator on behalf of `the-adjudicator`, which is read-only), one for this pipeline's lock. `keep/ditch/modify` come from the Stage 3 Adjudicator verdict block. If the run exits early (Stage 1/3 user exit, no lock), emit only the lines for the stages that ran — use `outcome:"abandoned"` for the page-design line and skip the adjudicator line if Stage 3 never ran.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"caller\":\"page-design\",\"outcome\":\"completed\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"page-design\",\"outcome\":\"locked\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
```

---

## Notes for Claude executing this command

- **Single critique cycle.** If second-order issues surface during `/page-code` or implementation, kick back via fresh `/page-design` invocation. Don't loop within this command.
- **Two mandatory pauses:** after initial draft (Stage 1→2) and after verdicts (Stage 3→4).
- **Pass `model:` on all critic dispatches** so they run at the same level as this pipeline.
- **The Adjudicator is `Read, Grep` only.** Don't pass it write tools.
