import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FU_SECTION, LESSON_SECTION, STEP_ID, sectionLines, rowsOutside, legacyFindingLines, parseLessons, parseRules, parseFus, parseTrigger,
  parseStepOrderPointers, parseStepIds, maxId,
} from '../lib/rows.mjs';

const STACK = `# STACK

## Lessons

- **L-7** Prove every zero with a positive control before you believe it. → docs/lessons-reference.md#l-7
- **L-9** State the expected count before running a check. → docs/lessons-reference.md#l-9
- a lesson written the old way

## Follow-ups

> - **FU-1** [perf · cleanup-light] spec example — home: Demo/1.1
- **FU-942** [css-token-hygiene · change-heavy] Retire the ribbon gold — neutral surface — home: DesignRevamp/7.11 {anchor: src/styles/components.css :: /\\.ribbon/}
- **FU-943** [perf · cleanup-light] Phase-only home — home: DesignRevamp/7
- ~~**FU-944** [perf · cleanup-light] done — home: DesignRevamp/7.11~~
- [x] **FU-945** [perf · cleanup-light] also done — home: DesignRevamp/7.11

<!-- ledger:step-order DesignRevamp/7 docs/plans/p7.md -->

## Decisions
- **FU-999** [perf · cleanup-light] outside the section — home: DesignRevamp/7.12
`;

const SHAPE = 'FU rows are "- " list items, not table rows or other list shapes';

test('sectionLines stops at the next level-2 heading', () => {
  const { lines, count } = sectionLines(STACK, LESSON_SECTION);
  assert.equal(count, 1);
  assert.ok(lines.some((l) => l.includes('L-7')));
  assert.ok(!lines.some((l) => l.includes('FU-942')));
});

test('a missing heading is not an empty section: sectionLines finds no lines and the parsers say found: false', () => {
  // A project's FU heading may be "## Open follow-ups (phase-local)", which /^## Follow-ups\b/
  // doesn't match. Read as an empty ledger, it would pass every stop.
  const drifted = '# STACK\n\n## Lesson\n\n- **L-1** Rule. → r.md#l-1\n\n## Open follow-ups (phase-local)\n\n- **FU-1** [perf · cleanup-light] x — home: Demo/1.1 {anchor: manual}\n';
  const empty = '# STACK\n\n## Lessons\n\n## Follow-ups\n\n## Rules\n';
  assert.deepEqual(sectionLines(drifted, FU_SECTION), { lines: null, count: 0 });
  assert.deepEqual(parseFus(sectionLines(drifted, FU_SECTION).lines, 'stack'), { found: false, rows: [], malformed: [], resolved: [] });
  assert.deepEqual(parseLessons(drifted), { found: false, rows: [], malformed: [] });
  assert.deepEqual(parseRules(drifted), { found: false, rows: [], malformed: [] });
  assert.deepEqual(parseFus(sectionLines(empty, FU_SECTION).lines, 'stack'), { found: true, rows: [], malformed: [], resolved: [] });
  assert.deepEqual(parseLessons(empty), { found: true, rows: [], malformed: [] });
  assert.deepEqual(parseRules(empty), { found: true, rows: [], malformed: [] });
});

test('sectionLines counts every heading it matches, a "(continued)" one included, and reads only the first', () => {
  const md = '# STACK\n\n## Follow-ups\n\n- **FU-1** first\n\n## Follow-ups (continued)\n\n- **FU-2** second\n';
  assert.deepEqual(sectionLines(md, FU_SECTION), { lines: ['', '- **FU-1** first', ''], count: 2 });
});

test('rowsOutside finds rows by line position, struck or checked ones too; prose mentions and blockquotes are not rows', () => {
  const md = [
    '- **L-1** Above every section. → r.md#l-1',
    '## Current location',
    '- **FU-3** [perf · cleanup-light] Stray — home: Demo/2.4 {anchor: manual}',
    '- ~~**FU-4** [perf · cleanup-light] Struck — home: Demo/2.4~~',
    '- [x] **FU-5** [perf · cleanup-light] Checked — home: Demo/2.4',
    '- Closed FU-2 and L-3; **FU-2** is gone.',
    '> - **FU-6** [perf · cleanup-light] A format example — home: Demo/2.4',
    '## Lessons',
    '- **L-2** Listed. → r.md#l-2',
    '## Follow-ups (continued)',
    '- **FU-7** [perf · cleanup-light] Listed — home: Demo/2.4 {anchor: manual}',
    '- **L-2** Listed. → r.md#l-2',
  ].join('\n');
  assert.deepEqual(rowsOutside(md, FU_SECTION, 'FU'), [3, 4, 5]);
  // Line 12 repeats a listed row word for word; only its position gives it away.
  assert.deepEqual(rowsOutside(md, LESSON_SECTION, 'L'), [1, 12]);
});

test('parseLessons reads rows and reports old-style rows as malformed', () => {
  const { found, rows, malformed } = parseLessons(STACK);
  assert.equal(found, true);
  assert.deepEqual(rows.map((r) => r.id), ['L-7', 'L-9']);
  assert.equal(rows[0].rule, 'Prove every zero with a positive control before you believe it.');
  assert.equal(rows[0].ref, 'docs/lessons-reference.md#l-7');
  assert.deepEqual(malformed, ['- a lesson written the old way']);
});

test('a lesson or rule ID in any shape but a top-level "- " row is malformed; blockquote examples are skipped', () => {
  const lessons = [
    '## Lessons', '',
    '* **L-3** Star bullet. → docs/lessons-reference.md#l-3',
    '+ **L-4** Plus bullet. → docs/lessons-reference.md#l-4',
    '  - **L-5** Indented. → docs/lessons-reference.md#l-5',
    '| **L-6** | Table row. |',
    '> - **L-1** A format example. → docs/lessons-reference.md#l-1',
    'Prose that names no ID.',
  ];
  assert.deepEqual(parseLessons(lessons.join('\n')), { found: true, rows: [], malformed: lessons.slice(2, 6) });
  const rules = ['## Rules', '', '* **R-2** Star bullet. → reference/rules.md#r-2', '| **R-3** | Table row. |'];
  assert.deepEqual(parseRules(rules.join('\n')).malformed, rules.slice(2));
});

test("a reference link to another item's entry is malformed", () => {
  const lesson = '- **L-7** Rule seven. → docs/lessons-reference.md#l-9';
  assert.deepEqual(parseLessons(`## Lessons\n\n${lesson}\n`), { found: true, rows: [], malformed: [lesson] });
  const rule = '- **R-1** Rule one. → reference/rules.md#r-2';
  assert.deepEqual(parseRules(`## Rules\n\n${rule}\n`), { found: true, rows: [], malformed: [rule] });
});

test('parseRules reads rulebook rows', () => {
  const md = '## Rules\n\n- **R-1** Verify the premise before asserting a constraint. → reference/rules.md#r-1\n';
  assert.deepEqual(parseRules(md).rows.map((r) => [r.id, r.ref]), [['R-1', 'reference/rules.md#r-1']]);
});

test('parseFus (stack) keeps em dashes in the text and reads the home and trailing anchor', () => {
  const { found, rows, malformed, resolved } = parseFus(sectionLines(STACK, FU_SECTION).lines, 'stack');
  assert.equal(found, true);
  assert.equal(rows.length, 1);
  const r = rows[0];
  assert.equal(r.id, 'FU-942');
  assert.equal(r.type, 'css-token-hygiene');
  assert.equal(r.rigor, 'change-heavy');
  assert.equal(r.what, 'Retire the ribbon gold — neutral surface');
  assert.equal(r.home, 'DesignRevamp/7.11');
  assert.equal(r.step, '7.11');
  assert.equal(r.phase, 7);
  assert.deepEqual(r.anchors, ['{anchor: src/styles/components.css :: /\\.ribbon/}']);
  assert.equal(malformed.length, 1);
  assert.match(malformed[0].reason, /home is not/);
  assert.equal(resolved.length, 2);
});

test('parseFus (stack) reads a split-half home and strips every trailing anchor, in order', () => {
  const step = new RegExp(`^${STEP_ID}$`);
  assert.deepEqual(['7.11', '7.8a', '7.8a-C', '7'].map((id) => step.test(id)), [true, true, true, false]);
  const line = '- **FU-950** [perf · cleanup-light] Two anchors — home: DesignRevamp/7.11-M {anchor: src/a.ts :: x} {anchor: src/b.ts :: y}';
  const { rows, malformed } = parseFus([line], 'stack');
  assert.deepEqual(malformed, []);
  assert.deepEqual([rows[0].home, rows[0].step, rows[0].phase, rows[0].what], ['DesignRevamp/7.11-M', '7.11-M', 7, 'Two anchors']);
  assert.deepEqual(rows[0].anchors, ['{anchor: src/a.ts :: x}', '{anchor: src/b.ts :: y}']);
});

test('parseFus (stack) says what to fix: a slashed rigor, a missing anchor, a row in another list shape', () => {
  const reasons = (line) => parseFus([line], 'stack').malformed.map((m) => m.reason);
  assert.deepEqual(reasons('- **FU-951** [perf · /cleanup-light] Slash — home: DesignRevamp/7.11 {anchor: manual}'), ['rigor must be cleanup-light or change-heavy (no slash)']);
  assert.deepEqual(reasons('- **FU-952** [perf · cleanup-light] No anchor — home: DesignRevamp/7.11'), ['STACK FU needs an {anchor: …} (use {anchor: manual} for architectural or absence FUs)']);
  assert.deepEqual(reasons('* **FU-953** [perf · cleanup-light] Star — home: DesignRevamp/7.11 {anchor: manual}'), [SHAPE]);
  assert.deepEqual(reasons('  - **FU-954** [perf · cleanup-light] Indented — home: DesignRevamp/7.11 {anchor: manual}'), [SHAPE]);
});

test('a legacy /module-audit finding line, bulleted or not, is left to the audit unless it is a valid FU row', () => {
  // Pre-LedgerLoop /module-audit Stage 5 appended deferred findings to STACK's follow-ups in this shape.
  // The audit stops on each one by line number, so parseFus doesn't also report the bulleted one as malformed.
  const line = 'src/components/billing/InvoiceForm.tsx:557 — medium — parseFloat(taxRate) || 7.25 accepts negative/unbounded rates; persists to Invoice — (from /module-audit 2026-05-18-billing)';
  const valid = '- **FU-7** [security · cleanup-light] Bound taxRate (from /module-audit 2026-05-18-billing) — home: Demo/2.4 {anchor: manual}';
  const { rows, malformed } = parseFus([line, `- ${line}`, valid], 'stack');
  assert.deepEqual(rows.map((r) => r.id), ['FU-7']);
  assert.deepEqual(malformed, []);
  assert.deepEqual(legacyFindingLines(['## Follow-ups', line, `- ${line}`, `> - ${line}`, valid].join('\n'), 'stack'), [2, 3]);
  assert.deepEqual(legacyFindingLines(`- ${line}`, 'standing'), [1]);
});

test('parseFus ignores blockquote examples', () => {
  const { rows, malformed } = parseFus(['> - **FU-1** [perf · cleanup-light] example — home: Demo/1.1'], 'stack');
  assert.equal(rows.length + malformed.length, 0);
});

test('parseTrigger reads the four checkable forms and rejects vague ones', () => {
  assert.deepEqual(parseTrigger('date 2026-10-15'), { kind: 'date', date: '2026-10-15' });
  assert.deepEqual(parseTrigger('after DesignRevamp/8'), { kind: 'after', campaign: 'DesignRevamp', unit: '8' });
  assert.deepEqual(parseTrigger('after DesignRevamp/7.8a'), { kind: 'after', campaign: 'DesignRevamp', unit: '7.8a' });
  assert.deepEqual(parseTrigger('after DesignRevamp/7.8a-C'), { kind: 'after', campaign: 'DesignRevamp', unit: '7.8a-C' });
  assert.deepEqual(parseTrigger('count {anchor: src/hooks/useFoo.ts :: /useFoo\\(/} >= 3'), { kind: 'count', file: 'src/hooks/useFoo.ts', pattern: '/useFoo\\(/', min: 3 });
  assert.deepEqual(parseTrigger('count {anchor: a.css :: /a{2}/} >= 2'), { kind: 'count', file: 'a.css', pattern: '/a{2}/', min: 2 });
  assert.deepEqual(parseTrigger('owner decision — flat or rising salary?'), { kind: 'owner', question: 'flat or rising salary?' });
  assert.equal(parseTrigger('when relevant'), null);
  assert.equal(parseTrigger('post-launch'), null);
});

test('parseFus (standing) separates a count trigger from a trailing anchor', () => {
  const line = '- **FU-88** [observability · change-heavy] Stale banner — trigger: count {anchor: src/a.ts :: /x/} >= 3 {anchor: src/b.ts :: fetchB}';
  const { rows } = parseFus([line], 'standing');
  assert.equal(rows[0].trigger.kind, 'count');
  assert.equal(rows[0].trigger.file, 'src/a.ts');
  assert.deepEqual(rows[0].anchors, ['{anchor: src/b.ts :: fetchB}']);
});

// /end-session 6L-c writes an owner ruling at the end of a row's text, before its reason, home or trigger
// (ledger-session.md § End); written after the trigger it would make the row unparseable.
test("an owner ruling before a row's reason, home or trigger parses; one after its trigger is malformed", () => {
  const ruling = 'Owner ruling 2026-10-16: 64 MB, not until P9';
  const standing = parseFus([
    `- **FU-1** [perf · cleanup-light] Bigger cache — recommended: 64 MB; docs/cache.md — ${ruling} — why not now: product: waits for P9 — trigger: after DesignRevamp/9`,
    `- **FU-2** [perf · cleanup-light] Bigger cache — ${ruling} — trigger: date 2027-01-01 {anchor: src/cache.ts :: size}`,
    `- **FU-3** [perf · cleanup-light] Bigger cache — trigger: date 2027-01-01 — ${ruling}`,
  ], 'standing');
  assert.deepEqual(standing.rows.map((r) => [r.id, r.trigger.kind, r.whyNotNow?.kind ?? null, r.what.includes(ruling)]), [
    ['FU-1', 'after', 'product', true],
    ['FU-2', 'date', null, true],
  ]);
  assert.deepEqual(standing.malformed.map((m) => m.reason), ['trigger is not checkable']);
  const stack = parseFus([`- **FU-4** [perf · cleanup-light] Bigger cache — ${ruling} — why not now: own run: the cache module — home: DesignRevamp/9.1 {anchor: manual}`], 'stack');
  assert.deepEqual(stack.rows.map((r) => [r.home, r.whyNotNow.kind]), [['DesignRevamp/9.1', 'own run']]);
});

test('parseFus (standing) reports an uncheckable trigger as malformed', () => {
  const { rows, malformed } = parseFus(['- **FU-89** [perf · cleanup-light] Later — trigger: when relevant'], 'standing');
  assert.equal(rows.length, 0);
  assert.equal(malformed[0].reason, 'trigger is not checkable');
});

test('parseFus (standing): table rows are malformed, resolved rows in any shape are resolved, an anchor is optional', () => {
  const lines = [
    '| **FU-120** [perf · cleanup-light] Table row — trigger: date 2027-01-01 |',
    '| `[perf · /cleanup-light]` **DB perf advisories** — a legacy table row | when relevant | low |',
    '| ✅ **RESOLVED 2026-06-25** — done |',
    '| ~~**FU-121** [perf · cleanup-light] crossed out~~ |',
    '- ✅ **FU-122** [perf · cleanup-light] done — trigger: date 2027-01-01',
    '- **FU-123** [perf · cleanup-light] done — trigger: date 2027-01-01 **RESOLVED 2026-09-01**',
    '- **FU-124** [perf · cleanup-light] After a split half — trigger: after DesignRevamp/7.8a-C',
    '| Item | Trigger | Sev |',
  ];
  const { rows, malformed, resolved } = parseFus(lines, 'standing');
  assert.deepEqual(malformed, lines.slice(0, 2).map((raw) => ({ raw, reason: SHAPE })));
  assert.deepEqual(resolved, lines.slice(2, 6));
  assert.deepEqual(rows.map((r) => [r.id, r.trigger, r.anchors]), [['FU-124', { kind: 'after', campaign: 'DesignRevamp', unit: '7.8a-C' }, []]]);
});

test('step-order pointers and step IDs; crossed-out rows are not scheduled', () => {
  assert.deepEqual(parseStepOrderPointers(STACK), [{ campaign: 'DesignRevamp', phase: 7, doc: 'docs/plans/p7.md' }]);
  const doc = [
    '| Slice | Scope | Rigor | Est. |', '|---|---|---|---|',
    '| **7.0 Band primitive** | x | H | 1d |',
    '| ~~**7.8b A9 delete**~~ superseded | x | L | 0 |',
    '', '## Group steps', '| Step | Group type | Rigor | Order |', '|---|---|---|---|',
    '| 7.11 | css-token-hygiene | change-heavy | after 7.10 |',
  ].join('\n');
  assert.deepEqual([...parseStepIds(doc).ids].sort(), ['7.0', '7.11']);
});

test('group steps: a row without a real Order is not scheduled, and a row too short to have an Order cell is reported', () => {
  const doc = [
    '| Slice | Scope | Rigor | Est. |', '|---|---|---|---|',
    '| **7.8a-C Tokens half** | x | H | 1d |',
    '', '## Group steps', '| Step | Group type | Rigor | Order |', '|---|---|---|---|',
    '| 7.11 | css-token-hygiene | change-heavy | after 7.10 |',
    '| 7.12 | perf | cleanup-light |  |',
    '| 7.13 | perf | cleanup-light | — |',
    '| 7.14 | perf | cleanup-light | - |',
    '| 7.15 | perf | cleanup-light | TBD |',
    '| 7.17 | perf | cleanup-light |',
    '', '## Notes', '| 7.16 | a later table under another heading | x | y | |',
  ].join('\n');
  const { ids, noOrderCell } = parseStepIds(doc);
  assert.deepEqual([...ids].sort(), ['7.11', '7.16', '7.8a-C']);
  assert.deepEqual(noOrderCell, ['7.17']);
});

test('maxId scans every text and ignores other prefixes', () => {
  assert.equal(maxId(['FU-3 and FU-941', 'L-12', 'FU-10'], 'FU'), 941);
  assert.equal(maxId(['nothing here'], 'L'), 0);
});
