---
description: Per-page code planning pipeline. Runs 3 parallel critics (structure + security + performance) against an initial code plan, adjudicates with security-asymmetric upgrade, revises, and locks. Use after /page-design locks a design plan.
argument-hint: [page name from locked design plan]
allowed-tools: Read, Write, Task, AskUserQuestion, Skill
---

# /page-code

You are running the **/page-code pipeline** — per-page code planning from a locked design plan. The user invoked this because they need a locked code plan complete enough that implementation is mechanical.

User's invocation argument (page name): **$ARGUMENTS**

---

## Stage 0 — Pre-flight scope check

Locate the locked design plan:
- Read `docs/plans/YYYY-MM-DD-module-*-page-<page-slug>-design.md`
- Confirm `status: locked`
- If not locked, refuse and tell user to lock the design plan first

Run the 3-item gate (cheatsheet §5):
1. Tier check
2. **Risk surface check** — engage security-asymmetric upgrade if RLS / auth / Stripe / exports / financial calc touched
3. Existing-primitive check

---

## Stage 1 — Initial code plan

Read design plan + CLAUDE.md + STACK.md. Draft:
- **Files to create/modify** — exact paths (no "we'll figure out the structure later")
- **Per-file changes** — what changes, with rationale
- **Data flow** — Zustand store interactions, lib/api service modules, localStorage persistence with `createJSONStorage`
- **Security boundaries** — RLS policy updates, tier checks (server-side, not client-only), input validation, XSS vectors
- **Performance considerations** — lazy-loading candidates (`next/dynamic` for heavy modals), memoization (React.memo + parent `useCallback`), bundle impact
- **Test plan** — **if the change touches `src/lib/**` (billing / financial math / pure logic), the plan MUST name the Vitest characterization test file (`*.test.ts`, colocated) and the exact input/output pair to capture** — per CLAUDE.md's mandate that new `src/lib` modules ship with characterization tests. For UI-only changes, list what to verify manually. (Vitest covers `src/lib`; the jsdom project covers component `*.test.tsx`.)

Surface the draft. Use `AskUserQuestion`:

- **Question:** *"Initial code plan ready. Send to critics?"*
- **Options:**
  - `Approve — proceed to critique` → continue
  - `Redirect — revise plan` → take redirection and re-draft
  - `Exit — defer this page` → stop

---

## Stage 2 — Parallel critique (3 critics)

Dispatch THREE critics in parallel via the Task tool — **a single message with three tool calls**. Pass `model:` matching orchestrator.

- **Critic 2a — structure critic (general-purpose):**
  > *"Review this code plan against CLAUDE.md project conventions. Plan path: `<absolute path>`. Verify: component patterns (modals in feature folders, shared in components/shared), file size guidelines (page ≤100, API route ≤150, util ≤200, component ≤250, hook ≤150, store ≤300), Zustand store organization (one per file, persist + createJSONStorage), lib/api service module patterns (components never call fetch directly), naming conventions. Output: `file:section — severity — issue — recommendation`."*

- **Critic 2b — security critic (general-purpose):**
  > *"Review this code plan for security per CLAUDE.md 'Security Awareness'. Plan path: `<absolute path>`. Verify: RLS policies match tier matrix (your plan tiers), **server-side tier verification** (not client-only — client checks are convenience only), input validation on financial fields (guard against NaN, negative values, unreasonably large numbers), XSS prevention on user-generated content, export sanitization (CSV/PDF formula injection), Stripe webhook signature validation, no secrets in source. **Apply security-asymmetric severity** — RLS / Stripe / exports / auth findings escalate one tier. Output: `file:section — severity — issue — recommendation`."*

- **Critic 2c — performance critic (general-purpose):**
  > *"Review this code plan for performance. Plan path: `<absolute path>`. Verify: heavy modals use `next/dynamic` with `ssr: false`, list items use `React.memo` + parent `useCallback` (inline arrows defeat memo silently), bundle impact of new imports, lazy-load opportunities, hydration cost, memoization candidates that don't fire because of unstable callbacks. Output: `file:section — severity — issue — recommendation`."*

Collect and concatenate.

---

## Stage 3 — Adjudicate (security asymmetric upgrade)

Dispatch The Adjudicator via Task tool. Apply the security-asymmetric rule: security findings can escalate MEDIUM → HIGH; nothing else can.

Present verdicts verbatim. Use `AskUserQuestion`:

- **Question:** *"The Adjudicator marked [N] critiques. Which to absorb?"*
- **Options:**
  - `Absorb all KEEP + MODIFY`
  - `Absorb none — keep initial plan`
  - `Let me list specific CRITIQUE_IDs`

---

## Stage 4 — Revise + lock

Apply verdicts. Write to `docs/plans/YYYY-MM-DD-module-<slug>-page-<page-slug>-code.md`:

```yaml
---
status: locked
date: <ISO date>
module: <module name>
page: <page name>
parent-design: <path to locked design plan>
---
```

---

## Done

Summarize:
- Path to locked code plan
- Files to be created/modified (count)
- Any security findings absorbed
- Next step: invoke `/page-implement <page-name>` against the locked code plan

**Effectiveness telemetry — append on lock.** Via Bash, append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent). `keep/ditch/modify` come straight from the Stage 3 Adjudicator verdict block.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"page-code\",\"outcome\":\"locked\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
```

**Adjudicator-effectiveness telemetry — emit alongside the row above.** Stage 3 dispatches the-adjudicator (read-only), so the orchestrator emits its row on its behalf — same field shape as the other callers (page-design / change-heavy / cleanup-light / module-audit), keeping the unified cross-caller adjudicator stream complete.

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"adjudicator\",\"caller\":\"page-code\",\"outcome\":\"completed\",\"keep\":<k>,\"ditch\":<d>,\"modify\":<m>}" >> ~/.claude/metrics.jsonl
```

---

## Notes for Claude executing this command

- **Single critique cycle.** If implementation surfaces plan errors, kick back via fresh `/page-code`.
- **Security asymmetric upgrade is mandatory** when risk surface engages.
- **Two mandatory pauses** at Stage 1→2 and Stage 3→4.
- **Code plan must be specific enough for mechanical implementation.** If exact file paths or test scenarios are missing, the plan is incomplete — revise before locking.
