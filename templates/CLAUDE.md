# CLAUDE.md — <your project>

The always-on rules for how the coding agent works in this repo. Keep it short; it's read every session. The toolkit commands cite the section headers below — keep them so `/change-heavy` and friends resolve their references.

## How we work together
- Lead with the answer, in plain language. Bottom line first.
- Recommend with conviction; the human pushes back.
- Ask instead of guess on alignment-critical or architectural decisions — one targeted question, not an interview.

## Default workflow
For ordinary changes: **PLAN → implement → REVIEW**. Reach for `/change-heavy` only when a change touches 3+ files, introduces new abstractions, or hits a risk surface (auth, payments, data model, financial/calculation code).

## Cohesion gate before extraction (File Size Guidelines)
Don't extract a new file/function unless it earns it. A proposed extraction must state in one sentence what it wins — owns a state cluster the parent has no awareness of, needs memoization for stability in a `.map()`, etc. **Reject** extractions justified only by:
- "Future testability" alone
- "Visual isolation" alone (visual-leaf extractions require >100 LOC *and* isolation)
- "Pattern consistency with siblings" as the primary reason
- "2+ callers in the same parent file" — that's within-file repetition; use a private inner function

No abstraction until 2+ real callers (YAGNI). Prefer deleting over adding.

## Risk surfaces
Paths and topics that trigger the security-review stages: `auth`, row-level security, payments/webhooks, financial/calculation code, data export, public API routes. Name yours here so the pipelines can detect them.

## Voice & style
Match the surrounding code. Comments explain *why*, not *what*. Point a canonical style guide (e.g. `docs/STYLE_GUIDE.md`) here if you have one.
