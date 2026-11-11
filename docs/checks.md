# Checks — red-line-toolkit

Every test the toolkit runs, what it guards and what it costs (`reference/ledger-lifecycle.md` § Checks). `npm test` runs them before a process commit; the mod's test runs with `claude plugin test mods/fable-seat-guard`.

Seconds: each file run alone with `node --test <file>`, wall time, measured under load from other sessions; about 0.1 s is node's start-up alone. Re-measure the same way at a review.

Budget: npm test 75 s
Check files: `tests/*.test.mjs` `mods/**/*.test.ts`

| Check | Files | Guards | Gate | Seconds |
|---|---|---|---|---|
| audit | `tests/audit.test.mjs` | the ledger audit end to end on fixture repos: lessons, FUs, group steps, footers, stale homes, the anchor-sweep note, the in-area stop, the rulebook | npm test | 34.6 |
| cli | `tests/cli.test.mjs` | `ledger.mjs`: its modes, flags, exit codes and projects.json checks, and `anchored`'s file lists | npm test | 11.7 |
| pilot | `tests/pilot.test.mjs` | `ledger.mjs pilot`: its pass checks and outcomes | npm test | 7.7 |
| history | `tests/history.test.mjs` | git history as evidence: footers, sessions, row listings | npm test | 3.2 |
| checks | `tests/checks.test.mjs` | the check registry in the report, the FU reason stop through the audit, and this registry's coverage | npm test | 1.6 |
| review-panel | `tests/review-panel.test.mjs` | pipeline-shared.md's review-panel trigger snippet against fixture diffs; keep it under about 5 s | npm test | 1.6 |
| decision-gates | `tests/decision-gates.test.mjs` | who may ask the owner and how many options a question takes, Skill in allowed-tools, no pipeline loads /pre-commit-check through the Skill tool, § pointers, paths into the toolkit spelled from ${CLAUDE_PLUGIN_ROOT}/ and existing, scope rules that name the minor tweak and the area, the Heavy-rigor trigger stated by what a change alters, retired stops in the starter rulebook, the mods and the project CLAUDE.md template, copies of pipeline-shared.md, the anchor sweep in every review-panel pipeline, models named by family alias with no versioned ID and no pinned effort, and the pipelines pointing at § Models and effort | npm test | 0.15 |
| anchors | `tests/anchors.test.mjs` | FU anchors: parsing, drift, stale homes | npm test | 0.13 |
| rows | `tests/rows.test.mjs` | the lesson, rule and FU row parsers | npm test | 0.11 |
| lifecycle-doc | `tests/lifecycle-doc.test.mjs` | the lifecycle doc states the code's numbers, footers and modes, and no limit is restated elsewhere | npm test | 0.11 |
| fus | `tests/fus.test.mjs` | FU decisions: group steps, triggers, closing, the reason stop, owner picks, rows by anchor file | npm test | 0.11 |
| lessons | `tests/lessons.test.mjs` | lesson decisions: probation, ranking, eviction, notes | npm test | 0.11 |
| telemetry | `tests/telemetry.test.mjs` | every metrics.jsonl template in the commands and skills parses, with one leftovers, one swept and one adjudicator shape | npm test | 0.10 |
| fable-seat-guard | `mods/fable-seat-guard/hooks/seat.test.ts` | the Fable seat's model routing and its read-only Bash | claude plugin test | — |
