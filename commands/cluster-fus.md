---
description: Re-buckets the whole FU backlog (STACK.md phase-local + Standing-FUs.md) by type, surfaces batch-ready clusters with a suggested pipeline, and flags untagged/orphaned rows. Read-only — suggests batches, does not execute them. The "cluster like-type FUs" engine.
argument-hint: [optional --type <name> to focus one type | --phase <n> to scope]
allowed-tools: Read, Bash
---

# /cluster-fus

You are running **/cluster-fus** — the FU clustering engine. Clustering like-type FUs is the only thing that makes FU cleanup tractable. This command groups the backlog by type so the user sees *batches*, not a wall of items. **Read-only:** it suggests, it does not edit or execute.

User's invocation argument: **$ARGUMENTS**

## The taxonomy (from CLAUDE.md "Stack Discipline")

`type-design · cross-form-parity · test-coverage · silent-failure · css-token-hygiene · design-system-primitive · cross-lib-dedup · observability · security · perf`

## Stage 1 — Gather

- Read `STACK.md` (phase-local FUs, under "Open follow-ups")
- Read `Standing-FUs.md` (cross-cutting FUs)
- !`ls -la STACK.md Standing-FUs.md 2>/dev/null || true`

If `--type <name>`: focus only that type. If `--phase <n>`: scope to that Phase's phase-local FUs.

## Stage 2 — Classify every FU by type

For each FU row, read its `[type · pipeline]` tag and `home:` address if present. For **untagged** rows (predate the convention), infer the type from the description + the taxonomy; legacy `Cluster N.N` tags are frozen location-IDs — map them to their phase, don't rewrite them. Track which were inferred vs tagged.

## Stage 3 — Bucket + assess batch-readiness

Group by `type`. For each type-cluster, count members and apply the pipeline rule:
- **≥5 same-type FUs** → `/change-heavy` batch candidate (a cohesive multi-file sweep)
- **2-4 same-type FUs** → `/cleanup-light` batch candidate
- **1** → not yet a batch; leave it

If members carry conflicting pipeline tags, the batch inherits the heavier (`/change-heavy`). Note any cluster spanning both STACK (phase-local) and Standing-FUs — that's a signal the work crosses the phase boundary.

## Stage 4 — Report

Output a scannable table, ordered by batch-readiness (most-ready first):

```
BATCH-READY:
  type-design        ×9   → /change-heavy   [STACK: 7 (home: Sweep/2.3) + Standing: 2]
  silent-failure     ×4   → /cleanup-light          [STACK: 4 (Sweep/1.4)]
  test-coverage      ×6   → /change-heavy    [STACK: 5 + Standing: 1]

NOT YET BATCHABLE (1 each): observability, perf

UNTAGGED (inferred this run — retro-tag at next touch): <count> rows
ORPHANED (`home` Step/Phase is CLOSED — needs re-home or promote-to-Standing): <list, if any>
```

For each batch-ready cluster, list its member FUs (one line each: `what — home — {anchor}`; legacy rows may still be `file:line — what`) so the user can scope a pipeline run directly.

## Stage 5 — Suggest next action

Recommend the single highest-leverage batch (largest cohesive cluster targeting open work) and name the exact pipeline + the FUs it would absorb. Example: *"Highest leverage: the 9 type-design FUs → one `/change-heavy` run on the branded-type architecture (Percentage + NumericString + union-lifts), absorbing 7 Sweep/2.3 + 2 Standing rows."*

Do NOT start the pipeline — the user decides.

## Done — emit telemetry

After the report + recommendation are delivered, append one JSON line to `~/.claude/metrics.jsonl` (append-only; create if absent) via Bash. This is a read-only diagnostic, so the row records what the run *found*, not what it changed. `outcome` is `completed` for a normal run; use `no-op` when the backlog is empty (Stage 5 had nothing to recommend).

```bash
echo "{\"ts\":\"$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)\",\"pipeline\":\"cluster-fus\",\"outcome\":\"<completed|no-op>\",\"clusters\":<total type-clusters found>,\"batch_ready\":<clusters meeting the ≥2 batch threshold>,\"untagged\":<untagged/orphaned FU rows flagged>}" >> ~/.claude/metrics.jsonl
```

`clusters` = number of distinct type-buckets from Stage 3; `batch_ready` = how many of those hit the `/cleanup-light` (2-4) or `/change-heavy` (≥5) threshold; `untagged` = the count surfaced in the UNTAGGED + ORPHANED report lines (Stage 4). On an empty backlog emit `outcome:"no-op"` with all three counts `0`.

## Failure modes

| Situation | Handling |
|---|---|
| No FUs anywhere | "Backlog empty." |
| All untagged | Still cluster (infer all); recommend a retro-tag pass |
| Orphaned FUs (closed `home`) | Surface prominently — these violate the GC rule and need disposition |
