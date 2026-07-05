---
description: Pre-commit auditor with three modes (default staged, --commit, --range). Auto-derives task and message; verifies commit-body truth, scope discipline, follow-up discipline. Diagnostic only — does not auto-fix.
argument-hint: [optional --commit <sha> | --range <from>..<to> | --task "..." | --message "..."]
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

### CHECK 2 — Scope discipline

For each changed line, ask: does this trace to the inferred task?
- Refactoring beyond requested scope → WARN
- Renames in files not central to the task → WARN
- Drive-by formatting changes → WARN
- New abstractions not requested → WARN

### CHECK 3 — Follow-up discipline

Verify orphan observations are properly captured:
- New `// TODO:` comments in the diff → should be in STACK.md FOLLOW-UPS, not silently in code
- New `// FIXME:` or `// HACK:` comments → same
- STACK.md updated with observations made during the work?
- Did the work surface anything in conversation that didn't make it to STACK.md?

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

If any check is WARN/FAIL, use `AskUserQuestion`:

- **Question:** *"Findings detected. How to proceed?"*
- **Options:**
  - `I'll apply recommendations` → user implements suggestions; do NOT auto-fix
  - `Confirm in-scope and proceed` → user accepts as-is
  - `Move flagged changes out of diff` → instruction to unstage / split commit

If all checks PASS: surface "ready to commit" with the drafted message.

---

## Done

Output final verdict + drafted message (or original for retro modes). User decides to commit or revise.

---

## Notes for Claude executing this command

- **Diagnostic only.** Never auto-fix commit messages or auto-unstage scope-creep. Surface findings, let user act.
- **Zero-argument default** should work 90% of the time via auto-inference from conversation context + STACK.md.
- **Range mode is highest-leverage** — pre-PR sweep before opening a PR.
- **Anchor to CLAUDE.md** "Commit truthfully" + "Scope discipline" + STACK.md FOLLOW-UPS convention.
