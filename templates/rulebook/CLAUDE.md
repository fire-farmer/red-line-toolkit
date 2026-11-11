# Global rulebook

Loaded in every Claude Code session on this machine, in every project. One-line rules that help in any project, up to the rulebook limit (`rulebookMax` in the toolkit's `lib/rules.mjs`, printed on the `LIMITS` line of `ledger.mjs report`); each rule's backstory is in `~/.claude/reference/rules.md`. A Stack project where the toolkit's `scripts/ledger.mjs mode` (run with `node`) prints `LEDGER: migrated` follows the lesson and FU policy in the toolkit's `reference/ledger-lifecycle.md`, read on demand. Every other project follows the ledger process in its own CLAUDE.md.

**Decision gates.** In every project, a pipeline never waits for the owner on a programming call (the toolkit's `reference/decision-gates.md`). Claude decides and reports everything else, plan locks, costly runs and forks included, and a run with nothing for the owner commits locally and reports afterwards. Design, copy and UX items, product or business calls, and rulebook or memory promotions are parked as `owner decision` Standing rows, with a recommended pick and a mockup or precise description, while the rest of the run commits; push, production database changes, deleting data and anything sent to another person or service wait for their go. Broken tools, true blockers and the loop guards halt and report. When acting without asking, take the right way over the quick patch: the owner keeps tech debt low.

## Rules

Each rule is one line: `**R-<n>** <rule> → reference/rules.md#r-<n>`, written as a list item.

- **R-1** Prove a check before you trust it: aim it at the defect's dominant real encoding, run a positive control through the same command, matcher and environment, and see it fail with the fix removed. → reference/rules.md#r-1
- **R-2** When an edit changes a set that a count, gate or constraint enumerates, restate that enumeration in the same edit. → reference/rules.md#r-2
- **R-4** Never write a line number, count, SHA or clause citation you have not just opened; cite symbols or selectors rather than line numbers. → reference/rules.md#r-4
- **R-5** Bound StructuredOutput schema fields with at least 3x headroom; when an agent dies on schema, recover its last tool-call input from the transcript before re-running. → reference/rules.md#r-5
- **R-6** Re-verify the premise of a locked decision, plan carve-out or FU body against live code at execution; a ratification or record is not evidence its premise still holds. → reference/rules.md#r-6
- **R-7** Before deriving a design position from first principles, search the decision record (git log --grep, plan docs) for a ruling that already measured it. → reference/rules.md#r-7
- **R-8** A constraint that must hold needs a machine check, built before any sweep so the detector produces the corpus; when a written rule fails twice, ship the check, not a stricter sentence. → reference/rules.md#r-8
- **R-9** State the expected value before running a check, including a predicted no-op, and make scripts assert their effect instead of announcing success. → reference/rules.md#r-9
- **R-10** When a finding is absorbed, grep its subject across plans, comments and ledger rows; the documents that prescribed a defect must change with the code. → reference/rules.md#r-10
- **R-12** When a plan is split, superseded or re-locked, reconcile every parent batch and re-homed item by name against the children, and re-enter the pipeline at critique, not implement. → reference/rules.md#r-12
- **R-14** Match a verification gate on the declaration shape, not the bare name, so comments documenting the rule can't break its expected count. → reference/rules.md#r-14
- **R-15** Sanitize persisted enums at every load boundary (storage rehydrate and database load); types don't cover corrupted stored state. → reference/rules.md#r-15
- **R-16** Before trusting a browser-pane read, assert document.hasFocus() and wait before capture; sentinel-test the capture, and move to Playwright when probes disagree. → reference/rules.md#r-16
- **R-17** Derive any list of a set's members from its one exhaustive source (union, Record, enum); a hand-copied list compiles and silently diverges. → reference/rules.md#r-17
- **R-19** Before calling plan- or spec-driven work done, re-read every promise (tasks, verify bullets, decisions, spec, mockup) against the shipped artifact. → reference/rules.md#r-19
- **R-20** Include more of the same correct fix by default; defer extra scope only when it is a real risk, product or abstraction decision, and steelman the option you skip. → reference/rules.md#r-20
- **R-21** Fix a security bug across its whole class: find every enforcement point (page gate, API guard, RLS, client) and prefer one chokepoint to scattered exemptions. → reference/rules.md#r-21
- **R-22** Put every artifact a subagent prompt refers to (plan path, prior findings, intended change) in the dispatch itself; a subagent starts with no context. → reference/rules.md#r-22
- **R-23** Treat a search count as a claim: re-derive a capped count uncapped, sample matches for a shared shape, and search sibling symbols and inline copies too. → reference/rules.md#r-23
- **R-24** Before asserting a constraint is fixed, external, coupled or absent, open the artifact that defines it; if you can't find it quickly, say it is unverified. → reference/rules.md#r-24
- **R-25** Re-check HEAD, index and files just before any irreversible step, commit by explicit pathspec in shared trees, and verify a fix's effect, not its success output. → reference/rules.md#r-25
- **R-26** One in, one out for process: a new rule, check, stage or reviewer retires one of equal weight in the same change; report the net count. → reference/rules.md#r-26
