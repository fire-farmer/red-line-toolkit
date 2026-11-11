# MEMORY.md — the index of what the owner has told Claude

Claude Code's auto-memory. The **index** below loads every session; each body (a `memory/<slug>.md` file) loads when the work matches it, so the always-on prompt stays small.

**What lives here:** the owner's preferences and feedback about how to work (a `memory/feedback_*.md` file), and facts about the project and its people that the repo can't record. Writing one is a tier-3 decision: it loads into every session, so it waits for the owner's approval (the toolkit's `reference/decision-gates.md` § Tier 3).

**What never lives here: lessons.** A lesson is a project rule in STACK `## Lessons`, scored by the ledger. One that keeps catching defects across phases and applies to any project is promoted to the **rulebook** (`~/.claude/CLAUDE.md`, as `R-<n>`), with the owner's approval — never to a memory file (the toolkit's `reference/ledger-lifecycle.md` § Lessons).

## Index
<!-- One line per memory: a link to the body, and a hook so a future session knows when it's
     relevant. Keep it to a line; the body holds the detail. -->

- [&lt;slug&gt;](memory/&lt;slug&gt;.md) — _the one-line preference or fact · when it applies._

<!-- Body file format (memory/<slug>.md): the one-line preference or fact up top, then the why and how
     to apply it. -->
