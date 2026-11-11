# Rulebook reference

One section per rule ever placed in `~/.claude/CLAUDE.md`. Sections are never deleted and IDs are never reused. Get the next ID with the toolkit's `scripts/ledger.mjs next-id rule` (run with `node`), from any directory. Format:

    ## R-<n>
    Rule: <the rule exactly as it appears in CLAUDE.md>
    Source: <Project> L-<n>     (a rule moved at a migration names the L-ID its reference entry took)
    Promoted: <YYYY-MM-DD> — <the catches that earned it: phases and commits, or "one-time migration review; no footer evidence yet">
    Backstory: <what went wrong and what the rule prevents>     (a rule moved at a migration points at its project's entry instead: <Project> docs/lessons-reference.md#l-<n>)
    Outcome: <only if it left the rulebook — date and why>

`ledger.mjs audit` reads the `Source:` line: a rule whose source lesson is still listed in that project's STACK means the promotion was committed in one repo only.

The starter rules below ship with the toolkit, so they carry no `Source:` or `Promoted:` line; a rule you promote yourself takes both.

## R-1

Rule: Prove a check before you trust it: aim it at the defect's dominant real encoding, run a positive control through the same command, matcher and environment, and see it fail with the fix removed.
Backstory: A sweep regex built on `color-mix\([^)]*…` was meant to find every encoding of a colour value, but a character class can't cross the `)` that closes a nested `var(`, so it read zero against the very values it hunted; the slice shipped against that clean-looking corpus and a critic found the missed site afterwards. A broken matcher and an empty corpus return the same answer. In a second case a control ran with an explicit path list and matched, while the run it licensed passed the paths as one unquoted zsh variable, which collapses to one word: every "0 consumers" was a `No such file` warning. A control that takes a different route through the shell proves nothing about the measurement it licenses.
It later absorbed R-18: a guard is aimed at how the defect is actually written in the codebase, not its textbook shape (a redaction rule that caught only `{ error: err.message }` passed green while the dominant idiom, `const m = err.message; { error: m }`, kept leaking), and a guard test asserts the bad value's absence and goes red when the guard is deleted. A test whose assertions hold with or without the guard protects nothing.

## R-2

Rule: When an edit changes a set that a count, gate or constraint enumerates, restate that enumeration in the same edit.
Backstory: A task's gate asserted "exactly 13 remain" in a file; a fix approved later in the same plan removed lines from that file, no critic noticed that the fix broke the task's own gate, and the Adjudicator caught it as a miss. In another task a change to an alias set left its own comment carrying the old count. The tell is a published count whose subject the same change touches: restate the number in the edit that moves it, and state the expected value before measuring (R-9).

## R-3

Rule: Never quote a count from a capped search (head -N, result limits) as a total; re-derive it uncapped before it reaches a decision or the user.
Backstory: A `grep -rl … | head -12` was quoted as "12 components" in a decision put to the owner; the real total was 16, and the number was load-bearing in the option chosen. A capped search reported as a total is a fabricated count.
Outcome: merged into R-23, one in, one out for R-26. Both rules said the same thing: a search count is a claim to re-derive, not a total.

## R-4

Rule: Never write a line number, count, SHA or clause citation you have not just opened; cite symbols or selectors rather than line numbers.
Backstory: A multi-lens review found every measured mechanism claim reproduced exactly, while every line citation and count it checked was wrong. Line citations also rotted within one session from the author's own commits, and one stale citation sat inside the comment that was fixing a stale citation. A mechanism claim is checked against code you are already reading; a cross-reference, against a file you are not. Cite the construct (a selector or symbol), not the number.

## R-5

Rule: Bound StructuredOutput schema fields with at least 3x headroom; when an agent dies on schema, recover its last tool-call input from the transcript before re-running.
Backstory: Several read-only auditors in a large fan-out hit the retry cap because one `maxLength`-bounded string overflowed on their final StructuredOutput call, after all their investigation was done; the full result sat in the rejected tool-call input in the agent's transcript. Loosening the bounds for a second run still lost one, and a re-run rarely reproduces the first run's evidence.

## R-6

Rule: Re-verify the premise of a locked decision, plan carve-out or FU body against live code at execution; a ratification or record is not evidence its premise still holds.
Backstory: An audit mid-sweep found three of eight locked decisions resting on premises that had rotted, such as a ruling to mint a new token when an existing token already owned the role. The lock is what stops anyone reopening the artifact: the ratification reads as settled, so the premise is never re-derived unless execution checks it. The same holds for an FU body written before later code landed.

## R-7

Rule: Before deriving a design position from first principles, search the decision record (git log --grep, plan docs) for a ruling that already measured it.
Backstory: A design proposal re-derived an option that a ratified fork had measured and rejected in writing weeks earlier, after the owner had reviewed rendered variants; it took two pushes from the owner to surface. Commit messages and plan docs carry the reasoning, so `git log --grep` on the subject is the cheapest check there is.

## R-8

Rule: A constraint that must hold needs a machine check, built before any sweep so the detector produces the corpus; when a written rule fails twice, ship the check, not a stricter sentence.
Backstory: A plan wrote a prohibition on hand-derived figures into its constraints in the strongest terms available, then shipped six fabricated figures anyway. The rule didn't bind; the provenance file the plan made it generate did, since a reviewer diffing comments against it found all six in one pass. If you have written a rule twice and broken it twice, stop sharpening the sentence and ship the artifact that makes violations mechanically visible.
The check guards the constraint, not its copies: a test that kept two copies of shared pipeline text in step was retired once the text moved to one file. When two copies must match, single-source them instead of guarding the copies.
It later absorbed R-11, the build-the-detector-before-the-sweep order. A ruling meant to hold on every surface was re-applied again and again, because each run built a check for its own defect and none for the ruling; a census run by read-only agents was a hand sweep, and more FUs in the same class followed it. A type-checker detector built first counted every ungated read before the sweep. The pipelines now require that check for a ruling that spans surfaces (the toolkit's `reference/pipeline-shared.md` § A ruling gets a check).

## R-9

Rule: State the expected value before running a check, including a predicted no-op, and make scripts assert their effect instead of announcing success.
Backstory: Widening a matcher against a corpus already verified at 60 had to be a no-op, so 60 was stated first; it came back 55, because a new capture group had renumbered the groups in a sibling branch. A guard expected to fail at about 1.09 failed at NaN instead, which exposed a parser that couldn't read hex at all. A scripted edit printed its own success message without asserting the replacement happened, leaving the central fix unapplied while every later step assumed it had landed. "It should fail" isn't a prediction, and a tool that reports success isn't evidence it succeeded.

## R-10

Rule: When a finding is absorbed, grep its subject across plans, comments and ledger rows; the documents that prescribed a defect must change with the code.
Backstory: After a selector defect was found and fixed in the code, a re-audit found the locked plan still carrying the defective selectors in its copy-paste blocks and the false claim in three places, so re-running those steps, or tidying the code to match the plan of record, would reintroduce the regression. The plan is the copy that gets re-executed.

## R-11

Rule: When a sweep's completeness matters, build the detector first and let it produce the corpus; do not hand-sweep and write the guard afterwards.
Backstory: A batch ran several commits of hand-swept fixes and wrote its guard last. The final hand sweep's regex couldn't match a prefixed form (`hover:opacity-80`) or a class inside a template literal, and reported 3 remaining sites when there were 14; the guard, written afterwards, found all 14 at once. When a batch's correctness rests on "did we find them all", the detector is the instrument at the start, not the deliverable at the end.
Outcome: merged into R-8, to free rulebook slots for lessons waiting on promotion. R-8 already asked for a machine check; R-11's build-the-detector-before-the-sweep order joined it.

## R-12

Rule: When a plan is split, superseded or re-locked, reconcile every parent batch and re-homed item by name against the children, and re-enter the pipeline at critique, not implement.
Backstory: A plan split into two halves silently lost a batch that appeared in neither. Build, lint, the test suite and two decorrelated audits all passed on both halves, because every gate verifies the artifact against its own plan, and a batch that exists in no plan is invisible. Walking the parent's re-home table then found a second miss: one re-homed FU never landed in any child.
It later absorbed R-13, the re-enter-at-critique step: twice in one session a mandated stage was skipped right after a plan was restructured, because each felt like a continuation of an already-critiqued plan.

## R-13

Rule: When a plan is split, superseded or re-locked, treat the new artifact as uncritiqued and re-enter the pipeline at critique, not implement.
Backstory: Twice in one session a mandated stage was skipped right after a plan was restructured: a split-off plan doc was locked without its own critique, and its first slice was committed without the always-on decorrelated audit. Both felt like continuations of an already-critiqued plan; neither was, because the artifact had changed. The owner's question caught the second, and the audit, once run, found two HIGH findings.
Outcome: merged into R-12, to free rulebook slots for lessons waiting on promotion. Both rules opened on a split or superseded plan; R-13's re-enter-at-critique step joined R-12's reconciliation.

## R-14

Rule: Match a verification gate on the declaration shape, not the bare name, so comments documenting the rule can't break its expected count.
Backstory: A plan prescribed comments that named a token while its own gates grepped the bare token name expecting zero; later `/simplify` added two explanatory comments naming another gated token, turning a gate that expected 2 into one returning 4. Matching the declaration shape (the property and the `var(--token)` together) fixes it. It is the inverse of R-1's dominant encoding: that guards against a check matching too little, a false pass; this, against matching too much, an unpassable gate that erodes trust in the whole verification block. A gate is only a gate if its expected value is mechanically derivable from correct code.

## R-15

Rule: Sanitize persisted enums at every load boundary (storage rehydrate and database load); types don't cover corrupted stored state.
Backstory: A `?? fallback` on a persisted enum that keyed a `Record` was dropped as type-dead. A corrupted local-storage blob whose version matched skipped the migration, put an out-of-union value into state, and crashed the whole app shell where the old code had degraded quietly. The fix is one sanitize at the store's merge (out-of-union → default), not scattered guards in consumers, and plan critics sharpened it to both persistence seams, since a rehydrate-only filter misses the database load.

## R-16

Rule: Before trusting a browser-pane read, assert document.hasFocus() and wait before capture; sentinel-test the capture, and move to Playwright when probes disagree.
Backstory: Browser-pane screenshots lag live style and DOM changes, so a before/after pair can be two identical frames; only a deliberate full-screen sentinel exposed it. Worse failures give confident wrong answers rather than nulls. The pane silently lost `document.hasFocus()`, which made every `el.focus()` a no-op while `getComputedStyle` still returned plausible resting values, and produced a false "no focusable element has a focus indicator" reading one step from being reported. The same element read by the same method returned contradictory values across probes: when two probes disagree, the instrument is broken, so stop and move to a real browser instead of re-probing for a tiebreak. An overlay that mounts on a double `requestAnimationFrame` needs two paints before it reads as open.

## R-17

Rule: Derive any list of a set's members from its one exhaustive source (union, Record, enum); a hand-copied list compiles and silently diverges.
Backstory: A decorrelated audit generalized two site fixes into a class, and a sweep then found 25 more hand-listed copies of sets: a list of options driving wrong figures, an enum throwing on a database write, admin role gates silently denying access, an import coercing values to defaults. The failure is always silent and delayed, since the copy compiles clean and misbehaves only once the real set grows. Validating that a value is legal isn't enough; also check it's coherent, and a sanitizer that rejects unknowns must also restore missing members. `satisfies readonly Union[]` catches an extra member but not a missing one: for "must list all" use a `Record<Union, true>` keyset or a `never`-default switch, so the type-checker breaks when the union grows.

## R-18

Rule: Write a guard against the defect's dominant real encoding, prove it red on a known violation, and confirm it fails when the guarded fix is removed.
Backstory: A proposed lint rule caught only a direct `{ error: x.message }`, but the codebase's dominant idiom was `const m = err.message; { error: m }`, so a syntax-only rule would pass green while real leaks shipped: a false guarantee, worse than no guard. Separately, a latest-wins test asserted only state that held with or without its guard, and passed with the guard deleted; a test reviewer caught it by removing the guard. Enumerate how the defect actually appears before writing the guard, and treat a zero on a corpus known to contain it as a rule that's too narrow.
Outcome: merged into R-1, to free rulebook slots for lessons waiting on promotion. R-1 already asked for a positive control; R-18's dominant real encoding and its red-with-the-fix-removed check joined it.

## R-19

Rule: Before calling plan- or spec-driven work done, re-read every promise (tasks, verify bullets, decisions, spec, mockup) against the shipped artifact.
Backstory: Phase after phase, a full multi-lens review cleared a diff that this pass then caught: a wrong lead slide, a dead click target, a promised motion that never shipped, a treatment applied to some instances and not all, a headline prefix missed. Reviewers check the code as written; only re-reading the promises catches code that is correct but not what was promised. A clean verdict is signal too, and is what lets a phase close with confidence.

## R-20

Rule: Include more of the same correct fix by default; defer extra scope only when it is a real risk, product or abstraction decision, and steelman the option you skip.
Backstory: The recurring miss was a scope-discipline reflex: recommend the minimal fix, the owner asks "why not the fuller one?", and the recommendation flips, usually on evidence that was already in view. Bin the extra scope. More of the same correct fix (another instance of the pattern, a change that only rejects invalid input or aligns code with its own documented label, a cheap and verifiable security fix that is inert today) is included by default. A change that could break a legitimate use, needs a product call, or builds an abstraction with no second caller is deferred and flagged. The forcing question before any defer: is this the same fix already shipped elsewhere, on another surface? If so, do it now. Give the one-line case for the option you don't recommend, so the user never spends a turn asking for it.

## R-21

Rule: Fix a security bug across its whole class: find every enforcement point (page gate, API guard, RLS, client) and prefer one chokepoint to scattered exemptions.
Backstory: Hardening the admin API-mutation guard left the middleware's admin page gate as its divergent twin: it checked only the role, so a suspended admin could still render pages backed by service-role data while their mutations were blocked. Review caught it. Separately, a scheduled job blocked by two gates was fixed with one early return that covered both and any future gate, instead of a mirrored exemption at each. For a security control, completeness beats a minimal diff.

## R-22

Rule: Put every artifact a subagent prompt refers to (plan path, prior findings, intended change) in the dispatch itself; a subagent starts with no context.
Backstory: Four audit-seat prompts referred to "what the plan intended" and "the prior findings" without passing the plan path or the findings into the dispatch, so each silently degraded to a generic skim while still reporting, and logging, a full audit. A same-model self-review missed it, since from the orchestrator's seat the context is obviously present; only a decorrelated re-audit caught it. The fixes then introduced new inconsistencies of their own, caught by a second bounded re-audit.

## R-23

Rule: Treat a search count as a claim: re-derive a capped count uncapped, sample matches for a shared shape, and search sibling symbols and inline copies too.
Backstory: A critic cited a pattern repeating "50+ times codebase-wide" to justify a migration; sampling showed the matches shared only a substring and came in many shapes, and the target shape had a single site, so the migration didn't exist. A symbol grep under-counts too: grepping one client factory missed its sibling factory and misclassified 17 routes, and the same math written inline with no named function is invisible to a symbol grep. List every synonym for the role and grep the operand pattern as well.
It later absorbed R-3: never quote a capped search's count as a total. That made room for R-26 under its one in, one out.

## R-24

Rule: Before asserting a constraint is fixed, external, coupled or absent, open the artifact that defines it; if you can't find it quickly, say it is unverified.
Backstory: Four misses in a row, each one glance from the answer: two tokens asserted to be coupled were separate declarations; a harness string asserted to be fixed was configurable by the instruction already in context; a contrast ratio stated as measured was fabricated; and a column called phantom was defined by a migration that existed but hadn't been applied, which nearly led to deleting a designed cache. The tell each time was a confident claim about something outside the code with the defining artifact unopened.

## R-25

Rule: Re-check HEAD, index and files just before any irreversible step, commit by explicit pathspec in shared trees, and verify a fix's effect, not its success output.
Backstory: An `--amend` rewrote another session's commit because HEAD had advanced during a long run. In a shared tree, another session staged its own files into the shared index, so a bare `git commit` would have swept its work into this one; an explicit pathspec recorded only this run's files. A `REVOKE` returned success but was a no-op under a table-level grant, and only re-querying the privileges caught it. A build over a warm cache skipped typechecking an edited file and printed success. A success signal, a cached gate or a state observed earlier is an assumption to re-check before acting on it.

## R-26

Rule: One in, one out for process: a new rule, check, stage or reviewer retires one of equal weight in the same change; report the net count.
Backstory: In one stretch every process run added machinery, and the run meant to retire checks retired none while adding a registry, a footer and per-run paperwork. Only a subtraction pass held to a hard net-negative rule came out lean. Process grows one incident at a time and shrinks only when something forces it, so subtraction has to be the default for every process change. No check enforces the rule.
