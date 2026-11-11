---
description: Pre-scope competitive comparison with auto-staleness detection on docs/business/competitive-landscape.md (the single in-repo source of truth). If the file is >30 days old, auto-triggers web search and proposes a verified update. Outputs anchor doc to docs/plans/ for feeding into /module-build Concept stage. Auto-invokes steelman gate if classification = PARITY or DIFFERENTIATING.
argument-hint: '[feature description] [optional --competitors comma,separated | --web-search | --no-web-search]'
allowed-tools: Read, Write, Agent, Bash, WebSearch, WebFetch, AskUserQuestion
---

# /competitive-anchor

You are running the **/competitive-anchor pipeline** — pre-scope competitive comparison anchored to docs/business/competitive-landscape.md. The user invoked this before scoping a new feature.

User's invocation argument: **$ARGUMENTS**

---

## Stage 1 — Load context with auto-staleness check

Read `docs/business/competitive-landscape.md` (the single in-repo source of truth).

Check file modification time:
- !`stat -f %m docs/business/competitive-landscape.md` (macOS)
- Compare to current epoch — if older than 30 days (2,592,000 seconds), file is **stale**

Resolve web-search behavior:
- If `--web-search` flag: always run web search in Stage 2
- If `--no-web-search` flag: skip web search even if stale (output a warning)
- If file is stale AND no flag: auto-trigger web search + plan to propose an update to the canonical file in Stage 5
- Else: use memory as-is

Read the style guide's competitive-positioning section (e.g. STYLE_GUIDE.md "Competitive Positioning Notes"), if the project has one, for the established positioning framework.

---

## Stage 2 — Build coverage matrix

Default competitors: the main competitors named in `docs/business/competitive-landscape.md` (or per `--competitors` flag).

For each competitor:
- Has this feature? Y/N/Partial
- Implementation approach (if known from memory or web search)
- What's good about their implementation
- What's bad / missing
- Pricing tier where it sits (if known)

If web search active:
- `WebSearch` for `"<competitor name>" "<feature keywords>"` per competitor
- `WebFetch` specific feature/pricing pages to capture current implementation details
- Update matrix with current info; note which entries came from web vs. memory

Output the matrix as a markdown table.

---

## Stage 3 — Product positioning

Analyze:
- **User pain unaddressed:** what does this solve that competitors don't?
- **Angle:** where does this product sit vs. each competitor's center of gravity?
  - <Competitor A> = <its center of gravity, e.g. analysis-only>
  - <Competitor B> = <its center of gravity, e.g. reporting-only / passive>
  - <Competitor C> = <its center of gravity, e.g. full end-to-end platform>
  - This product = (state explicit angle for this feature)
- **Classification:** DIFFERENTIATING / PARITY / NICHE

---

## Stage 4 — Steelman gate (auto-invoke)

Based on Stage 3 classification:

**PARITY:** invoke the unified steelman prompt (`${CLAUDE_PLUGIN_ROOT}/reference/prompting-cheatsheet.md` § Steelman Library) with:
- Option A: build this feature (parity with competitors)
- Option B: don't build it (focus elsewhere on roadmap)

**DIFFERENTIATING:** invoke steelman with:
- Option A: build the bespoke version
- Option B: build a simpler parity version
- Option C: don't build

**NICHE:** no automatic steelman gate (niche features are usually clear differentiators with low opportunity cost).

Capture the steelman result for inclusion in the anchor doc.

---

## Stage 5 — Lock + memory update

Use `AskUserQuestion` before locking:

- **Question:** *"Anchor analysis complete (classification: [X]). Lock the artifact?"*
- **Options:**
  - `Lock — write anchor doc` → proceed
  - `Revise — change classification or recommendation` → take direction and re-draft
  - `Exit — keep in conversation only` → don't write

On approval, write to `docs/plans/YYYY-MM-DD-competitive-anchor-<feature-slug>.md`:

```yaml
---
status: anchor-complete
date: <ISO date>
feature: <feature name>
classification: DIFFERENTIATING | PARITY | NICHE
web-search-used: true | false
---
```

Body:

```markdown
# Competitive Anchor: <feature>

## Coverage matrix
[matrix from Stage 2]

## Product positioning
- User pain unaddressed: ...
- Angle: ...
- Classification: ...

## Steelman gate
[result from Stage 4]

## Recommendation
[build / defer / pivot scope based on steelman result]

## Next step
[/module-build invocation with this anchor as input, OR defer rationale]
```

If web search was used in Stage 2 AND found a verified, material change: propose the targeted update to `docs/business/competitive-landscape.md` — update only the changed section, don't rewrite untouched sections, and don't edit just to bump a date. This file is the gated source of truth: apply after the user confirms (with the project's edit-guard override, e.g. `ALLOW_BUSINESS_EDIT=1`, if a hook guards the file).

---

## Done

Summarize:
- Classification + recommendation
- Path to anchor doc
- Whether memory file was updated
- Next step: feed into `/module-build` Concept stage, OR defer per recommendation

---

## Notes for Claude executing this command

- **Auto-staleness check is mandatory.** Don't skip if file is >30 days old, unless `--no-web-search` is explicit.
- **`docs/business/competitive-landscape.md` is the single source of truth for competitor knowledge.** Always read it first, web-search only to refresh.
- **Auto-invoke steelman gate** for PARITY and DIFFERENTIATING classifications. NICHE skips.
- **One pause:** at Stage 5 lock confirmation.
- **Anchor citations:** `docs/business/competitive-landscape.md`, the style guide's competitive-positioning section.
