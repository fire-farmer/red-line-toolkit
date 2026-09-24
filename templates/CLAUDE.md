# CLAUDE.md — <your project>

The always-on rules for how the coding agent works in this repo. Keep it short; it's read every session. The toolkit commands cite the section headers below — keep them so `/change-heavy` and friends resolve their references.

## How we work together
- Lead with the answer, in plain language. Bottom line first.
- Recommend with conviction; the human pushes back.
- Ask instead of guess on alignment-critical or architectural decisions — one targeted question, not an interview.

## Default workflow
Every change: **PLAN → implement → REVIEW**. The PLAN block is Problem, Approach, Assumptions, **Reuses** (the existing class, token or component the change reuses, or `New: <name> — nothing existing fits because <reason>`), Scope, Risks, Verify.

**Rigor goes by risk, not size.**
- **Heavy rigor** — run `/change-heavy` when a change reaches one of your high-risk areas (list yours: e.g. money math, row-level security and migrations, payments, auth, exports) or introduces a new data model or API shape, whatever its file count.
- **Everything else** runs `/cleanup-light`, at any file count: one FU, a whole group of FUs, or a named task. It adds a Fable plan critique to the PLAN when the change touches 3+ files, adds a new abstraction, or changes styling.
- **A decorrelated Fable review ends every pipeline run on code** — a different model family from the one that wrote the diff. It finds; it never fixes.

## Scope discipline
- Change the minimum lines required — but scope is the class, not the cited site: the same fix at every site of the same defect is in scope.
- **The filing bar.** Anything noticed during a change gets exactly one outcome, never a silent edit: **fix it now** when it's the same class as the change (the default); **file it** only when it passes the 2-week filter (would you actually do it in the next two weeks?) *and* has a named reason it can't be done now (a product decision, a real risk, an abstraction decision); otherwise **drop it**, with one line in the commit body. A successor FU (the unfinished remainder of this change's work) needs that named reason too.

## Checking scripts
Don't build a new permanent checking script unless a Fable review recommends one and you approve it at the pipeline pause.

## Cohesion gate before extraction (File Size Guidelines)
Don't extract a new file/function unless it earns it. A proposed extraction must state in one sentence what it wins — owns a state cluster the parent has no awareness of, needs memoization for stability in a `.map()`, etc. **Reject** extractions justified only by:
- "Future testability" alone
- "Visual isolation" alone (visual-leaf extractions require >100 LOC *and* isolation)
- "Pattern consistency with siblings" as the primary reason
- "2+ callers in the same parent file" — that's within-file repetition; use a private inner function

No abstraction until 2+ real callers (YAGNI). Prefer deleting over adding.

## Risk surfaces
Paths and topics that trigger the security-review stages: `auth`, row-level security, payments/webhooks, financial/calculation code, data export, public API routes. Name yours here so the pipelines can detect them — the same list is the high-risk half of the Heavy-rigor trigger above.

## Voice & style
Match the surrounding code. Comments explain *why*, not *what*. Point a canonical style guide (e.g. `docs/STYLE_GUIDE.md`) here if you have one.
