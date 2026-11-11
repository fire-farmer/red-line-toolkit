---
description: Pre-commit auditor with three modes (default staged, --commit, --range). Auto-derives task and message; verifies commit-body truth, scope discipline, follow-up discipline. Diagnostic only — does not auto-fix.
argument-hint: '[optional --commit <sha> | --range <from>..<to> | --task "..." | --message "..."]'
allowed-tools: Read, Bash, AskUserQuestion
---

# /pre-commit-check

You are running the **/pre-commit-check** auditor. The user invoked this before committing (or to audit a past commit / range). Three checks: commit-body truth, scope discipline, follow-up discipline. **Diagnostic only — never auto-fix.**

User's invocation argument: **$ARGUMENTS**

---

## Stage 1 — Parse mode and gather context

Parse args:
- No positional args → **mode: staged** (default). Audit currently staged changes.
- `--commit <sha>` → **mode: single-commit retro**. Audit one past commit.
- `--range <from>..<to>` → **mode: range**. Audit every commit in the range individually.
- `--task "..."` → override inferred task description
- `--message "..."` → override auto-drafted commit message

Gather context per mode:

**Staged mode:**
- !`git status --porcelain`
- !`git diff --staged`
- Read STACK.md for current task tree
- Infer the original task from recent conversation context (what was just being worked on)
- Auto-draft a commit message from the diff (truthful description, conventional-commit format: `type(scope): subject`)

**Single-commit mode:**
- Resolve `<sha>` from the `--commit` arg (validate it via `git rev-parse <sha>` first to catch typos)
- Use the `Bash` tool to run `git show <resolved-sha> --stat` and `git show <resolved-sha>` with the actual sha substituted
- Use the existing commit message as the message-under-audit
- Infer the task from the commit message + STACK.md state at that point

**Range mode:**
- Resolve `<from>` and `<to>` from the `--range` arg (validate both via `git rev-parse`)
- Use the `Bash` tool to run `git log <resolved-from>..<resolved-to> --format='%H|%s'` with the actual refs substituted
- For each commit in the range, run the single-commit audit logic
- Build a per-commit verdict table

---

## Stage 2 — Three checks

Apply each check to the diff(s) gathered in Stage 1.

### CHECK 1 — Commit body matches diff (truth)

Verify every claim in the commit message is supported by an actual change in the diff. Flag:
- Claims about files that weren't touched
- Claims about behaviors not present in the diff
- Conjunction-laden messages ("did A and B and C and D") indicating un-focused commit
- A check listed in the project's `docs/checks.md` that failed during the work and changed it, with no `Check-Caught: <check>` footer for it (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-lifecycle.md` § Checks) → WARN; that footer is the check's evidence at its retirement review

### CHECK 2 — Scope discipline

For each changed line, ask: does this trace to the inferred task? The same fix applied at another site of the same class traces to it (R-20), and so does a minor tweak, or a fix of a real issue in the area the task works (the same feature, flow or files, whatever its class), that the commit body or the run's report lists (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs) — don't WARN on either.
- Refactoring beyond requested scope (a different class of work not listed as an in-area fix) → WARN
- Renames in files not central to the task → WARN
- Drive-by formatting changes → WARN
- New abstractions not requested → WARN

### CHECK 3 — Follow-up discipline

Verify every observation made during the work got exactly one filing-bar outcome (`${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md` § FUs in a migrated project): fixed in this change (the same class, or a listed fix of a real issue in the area the change works, a minor tweak included), filed with a named reason, or dropped with one line in the commit body.
- New `// TODO:`, `// FIXME:` or `// HACK:` comments in the diff → WARN; each is an observation hidden in code instead of getting an outcome
- An FU filed during the work in the area this change works (the same feature, flow or files; a successor FU, the unfinished remainder of this change's own work, always is) with any reason but `product`, and not parked as an owner decision → WARN: it's fixed in this change. In a migrated project, run `node "${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs" report` and WARN on each STOPS line naming a row this commit adds as filed in the area the session changed; `ledger.mjs audit` stops `/end-session` on the same rows
- An FU filed for another area with no named reason it couldn't be done now (a product decision, a real risk, an abstraction decision, or its own run: a completely separate area, written as the row's `why not now`) → WARN
- Did the work surface anything in conversation that got no outcome — neither fixed, filed nor named as dropped in the commit body? → WARN

---

## Stage 3 — Report

Output structured findings. For staged mode:

```
Mode: staged

Auto-drafted message:
  "<conventional commit message>"

Inferred task: <one-line task description>

✅/⚠️/❌ CHECK 1 (Commit truth): <pass or finding>
✅/⚠️/❌ CHECK 2 (Scope discipline): <pass or finding>
✅/⚠️/❌ CHECK 3 (Follow-up discipline): <pass or finding>

Recommendation:
  (a) <specific next step>
  (b) <alternative>
  (c) Confirm in-scope and proceed
```

For range mode: output per-commit verdict table, then summary across the range.

If any check is WARN/FAIL:

- **Called from a pipeline or another command** (any caller but the owner running it directly): report only, with no question. The caller fixes each finding and re-runs this check; a finding that is the owner's call is parked by the caller (`${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`).
- **Run directly by the owner:** use `AskUserQuestion`:

- **Question:** *"Findings detected. How to proceed?"*
- **Options:**
  - `I'll apply recommendations` → user implements suggestions; do NOT auto-fix
  - `Confirm in-scope and proceed` → user accepts as-is
  - `Move flagged changes out of diff` → instruction to unstage / split commit

If all checks PASS: surface "ready to commit" with the drafted message.

---

## Done

Output final verdict + drafted message (or original for retro modes). Run directly, the owner decides to commit or revise; called from a pipeline, the caller fixes what it found and commits.

---

## Notes for Claude executing this command

- **Diagnostic only.** Never auto-fix commit messages or auto-unstage scope-creep. Surface findings: on a direct run the owner acts on them; called from a pipeline, the caller does.
- **Zero-argument default** should work 90% of the time via auto-inference from conversation context + STACK.md.
- **Range mode is highest-leverage** — pre-PR sweep before opening a PR.
- **Anchor to CLAUDE.md** "Commit truthfully" + "Scope discipline" (the filing bar) + the STACK.md FU conventions.
