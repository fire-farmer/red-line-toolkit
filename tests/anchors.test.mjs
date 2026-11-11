// Anchor and orphaned-home checks, incident comments included, so these guards outlive the incidents.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAnchors, classifyAnchor, toMatcher, isDrift, auditStaleHomes, parseClosedPhases,
  parsePhaseHomes, activeCampaign, isClosedUnit, unrecognizedPhaseLines,
} from '../lib/anchors.mjs';

// Vitest's toMatchObject: compare only the named fields.
const fields = (object, keys) => Object.fromEntries(keys.map((key) => [key, object[key]]));

describe('parseAnchors', () => {
  it('extracts a code anchor', () => {
    const md = '- [type] foo {anchor: src/lib/x.ts :: /INDUSTRY_DEFAULTS/}';
    assert.deepEqual(parseAnchors(md), [
      { kind: 'code', file: 'src/lib/x.ts', pattern: '/INDUSTRY_DEFAULTS/', raw: md.trim() },
    ]);
  });

  it('survives a regex anchor containing a brace quantifier (F4)', () => {
    const a = parseAnchors('- foo {anchor: a.ts :: /a{2,3}/}')[0];
    assert.deepEqual(fields(a, ['kind', 'file', 'pattern']), { kind: 'code', file: 'a.ts', pattern: '/a{2,3}/' });
  });

  it('extracts an anchor from a mid-row table cell', () => {
    const md = '| item {anchor: a/b.ts :: requireUser} | trigger | low |';
    assert.deepEqual(fields(parseAnchors(md)[0], ['kind', 'file', 'pattern']), { kind: 'code', file: 'a/b.ts', pattern: 'requireUser' });
  });

  it('extracts a manual anchor', () => {
    assert.equal(parseAnchors('- foo {anchor: manual}')[0].kind, 'manual');
  });

  it('ignores rows without an anchor token', () => {
    assert.deepEqual(parseAnchors('- a plain prose row\n## a heading'), []);
  });

  it('skips placeholder examples in format-spec docs (angle-bracket file slot)', () => {
    assert.deepEqual(parseAnchors('- doc {anchor: <file> :: /pattern/}'), []);
  });

  it('parses multiple anchors on one row', () => {
    const md = '- two {anchor: a.ts :: foo} and {anchor: b.ts :: bar}';
    assert.deepEqual(parseAnchors(md), [
      { kind: 'code', file: 'a.ts', pattern: 'foo', raw: md.trim() },
      { kind: 'code', file: 'b.ts', pattern: 'bar', raw: md.trim() },
    ]);
  });

  it('skips format-spec examples in header blockquotes (both <file> and manual)', () => {
    const md = '> Anchored rows carry {anchor: <file> :: /pattern/} (or {anchor: manual}).';
    assert.deepEqual(parseAnchors(md), []);
  });
});

describe('classifyAnchor', () => {
  const io = (files) => ({
    exists: (f) => f in files,
    readText: (f) => files[f],
  });

  it('ok when literal present', () => {
    const a = { kind: 'code', file: 'a.ts', pattern: 'foo', raw: '' };
    assert.equal(classifyAnchor(a, io({ 'a.ts': 'has foo here' })).status, 'ok');
  });

  it('stale when pattern absent', () => {
    const a = { kind: 'code', file: 'a.ts', pattern: 'foo', raw: '' };
    assert.equal(classifyAnchor(a, io({ 'a.ts': 'no match' })).status, 'stale');
  });

  it('missing-file when the file is gone', () => {
    const a = { kind: 'code', file: 'gone.ts', pattern: 'foo', raw: '' };
    assert.equal(classifyAnchor(a, io({})).status, 'missing-file');
  });

  it('bad-pattern (not a crash) on a malformed regex (F5)', () => {
    const a = { kind: 'code', file: 'a.ts', pattern: '/[unclosed/', raw: '' };
    assert.equal(classifyAnchor(a, io({ 'a.ts': 'x' })).status, 'bad-pattern');
  });

  it('manual short-circuits', () => {
    assert.equal(classifyAnchor({ kind: 'manual', raw: '' }, io({})).status, 'manual');
  });
});

describe('toMatcher', () => {
  it('treats /.../ as regex', () => {
    const m = toMatcher('/a.c/');
    assert.equal('match' in m && m.match('abc'), true);
  });
  it('treats bare text as a literal substring', () => {
    const m = toMatcher('a.c');
    assert.equal('match' in m && m.match('xabcx'), false); // literal dot
  });
  it('returns an error object for a bad regex', () => {
    assert.equal('error' in toMatcher('/[/'), true);
  });
});

describe('isDrift', () => {
  it('flags drift statuses, not ok / manual', () => {
    assert.equal(isDrift('stale'), true);
    assert.equal(isDrift('missing-file'), true);
    assert.equal(isDrift('bad-pattern'), true);
    assert.equal(isDrift('ok'), false);
    assert.equal(isDrift('manual'), false);
  });
});

describe('auditStaleHomes', () => {
  // The bug this suite exists for: the audit read closed phases from `- [x] **P<n>` bullets,
  // but a campaign that collapses to ONE bullet with its phases in prose (DesignRevamp) yields
  // an empty closed set — so every home passed and the CLI printed "0 stale-home" while 7
  // un-GC'd `home: DesignRevamp/7.8a` rows sat in the file. It was cited as a clean gate in an
  // end-session sync and a locked plan before anyone noticed it had never been able to fire.
  const PER_PHASE_STACK = [
    '- [x] **P1 Security** — done',
    '- [x] **P7 tell-cleanup** — done',
    '- [ ] **P8 responsive** — active',
  ].join('\n');

  const COLLAPSED_STACK = [
    '- [x] **Post-refactor cleanup sweep** — COMPLETE',
    '- [ ] **DesignRevamp — build (Track A)** — P7 in progress, 7.2/7.6b done',
  ].join('\n');

  const ORPHAN = '- **[css-token-hygiene]** a parked thing — home: DesignRevamp/7.8a {anchor: manual}';
  const LIVE = '- **[css-token-hygiene]** another thing — home: DesignRevamp/8.1 {anchor: manual}';

  it('flags a home pointing at a closed phase', () => {
    const audit = auditStaleHomes(PER_PHASE_STACK, [ORPHAN, LIVE], 'DesignRevamp');
    assert.equal(audit.verifiable, true);
    assert.equal(audit.stale.length, 1);
    assert.equal(audit.stale[0].phase, 7);
  });

  it('does not flag a home pointing at an OPEN phase', () => {
    const audit = auditStaleHomes(PER_PHASE_STACK, [LIVE], 'DesignRevamp');
    assert.equal(audit.verifiable, true);
    assert.deepEqual(audit.stale, []);
  });

  // The regression guard. Same orphan, same campaign — only the STACK bullet shape differs.
  // Before the fix this returned a clean empty array indistinguishable from "checked, none found".
  it('reports UNVERIFIABLE rather than a passing 0 when no phase bullets exist to compare against', () => {
    const audit = auditStaleHomes(COLLAPSED_STACK, [ORPHAN, LIVE], 'DesignRevamp');
    assert.equal(audit.verifiable, false);
    assert.deepEqual(audit.stale, []);
    assert.equal(audit.campaign, 'DesignRevamp');
    assert.equal(audit.homeCount, 2); // both went unchecked — that count is the point
  });

  it('stays verifiable-with-zero when there are no phase homes at all', () => {
    const audit = auditStaleHomes(COLLAPSED_STACK, ['- a row with home: Standing {anchor: manual}'], 'DesignRevamp');
    assert.equal(audit.verifiable, true);
    assert.deepEqual(audit.stale, []);
  });

  // Slice granularity. A phase stays open for weeks while slices close under it, so a
  // phase-only check is blind to the orphans that actually occur — it reported 0 while an FU
  // sat homed at the closed slice 7.6b. STACK's depth rule forbids a bullet per slice, hence
  // the inline `Done:` list on the open phase bullet.
  const SLICE_STACK = [
    '- [x] **P6 Surfaces** — done',
    '- [ ] **P7 tell-cleanup** — IN PROGRESS. Done: 7.2/7.6b/7.9. Open: 7.8a · 7.6c.',
  ].join('\n');

  it('flags an FU homed at a CLOSED SLICE under an OPEN phase', () => {
    const audit = auditStaleHomes(SLICE_STACK, ['- x — home: DesignRevamp/7.6b {anchor: manual}'], 'DesignRevamp');
    assert.equal(audit.verifiable, true);
    assert.equal(audit.stale.length, 1);
    assert.equal(audit.stale[0].slice, '7.6b');
  });

  it('does NOT flag an open slice under the same open phase', () => {
    const audit = auditStaleHomes(SLICE_STACK, ['- x — home: DesignRevamp/7.8a {anchor: manual}'], 'DesignRevamp');
    assert.deepEqual(audit.stale, []);
  });

  it('does not swallow the Open: list as done (7.6c must stay live)', () => {
    const audit = auditStaleHomes(SLICE_STACK, ['- x — home: DesignRevamp/7.6c {anchor: manual}'], 'DesignRevamp');
    assert.deepEqual(audit.stale, []);
  });

  // Regression: slice IDs contain a period, so bounding the Done: list with [^.]* captures
  // just "7" and matches nothing — the gate silently reports 0 again.
  it('parses a Done: list whose slice ids contain periods', () => {
    assert.equal(parseClosedPhases(SLICE_STACK).has('7.6b'), true);
    assert.equal(parseClosedPhases(SLICE_STACK).has('7.6c'), false);
  });

  // Regression (7.8a-M close, 2026-07-26): a slice can SPLIT into halves that close
  // independently. `Done: … 7.8a-M` must close ONLY the -M half. Without the suffix in the
  // capture group the regex takes bare "7.8a", marks the whole slice closed, and orphans every
  // FU homed there while -C is still open — a false positive that would be "fixed" by
  // corrupting a correct ledger.
  const SPLIT_STACK = [
    '- [x] **P6 Surfaces** — done',
    '- [ ] **P7 tell-cleanup** — IN PROGRESS. Done: 7.2/7.6b + **7.8a-M COMPLETE** — M0 `abc`. Open: 7.8a-C · 7.6c.',
  ].join('\n');

  it('closes only the -M half, leaving FUs homed at the parent slice live', () => {
    const closed = parseClosedPhases(SPLIT_STACK);
    assert.equal(closed.has('7.8a-M'), true);
    assert.equal(closed.has('7.8a'), false);
    const audit = auditStaleHomes(SPLIT_STACK, ['- x — home: DesignRevamp/7.8a {anchor: manual}'], 'DesignRevamp');
    assert.deepEqual(audit.stale, []);
  });

  it('still flags an FU homed at the closed -M half itself', () => {
    const audit = auditStaleHomes(SPLIT_STACK, ['- x — home: DesignRevamp/7.8a-M {anchor: manual}'], 'DesignRevamp');
    assert.equal(audit.stale.length, 1);
    assert.equal(audit.stale[0].slice, '7.8a-M');
  });

  it('still flags a whole closed phase', () => {
    const audit = auditStaleHomes(SLICE_STACK, ['- x — home: DesignRevamp/6.3 {anchor: manual}'], 'DesignRevamp');
    assert.equal(audit.stale.length, 1);
  });
});

// Not in the original suite: an indented phase bullet with two-digit steps, how homes are read,
// and the active-campaign scope that verify-fus.core.ts describes only in a comment.
describe('beyond verify-fus.core.test.ts', () => {
  it('parseClosedPhases reads an indented phase bullet and two-digit steps, and never closes the open phase itself', () => {
    const stack = [
      '- [x] **P6 Surfaces** — closed',
      '  - [ ] **P7 tell-cleanup** — IN PROGRESS. Done: 7.2/7.6b/7.8a-M/7.10 Open: 7.8a-C',
      '- [ ] **P8 responsive** — not started',
    ].join('\n');
    const closed = parseClosedPhases(stack);
    for (const id of ['6', '7.2', '7.6b', '7.8a-M', '7.10']) assert.ok(closed.has(id), `expected closed: ${id}`);
    for (const id of ['7', '7.8a-C', '7.8a', '8']) assert.ok(!closed.has(id), `expected open: ${id}`);
  });

  it('parsePhaseHomes keeps the split-half suffix and skips blockquotes and Standing', () => {
    const homes = parsePhaseHomes('- x — home: DesignRevamp/7.8a-M\n> - home: Example/1.1\n- y — home: Standing');
    assert.deepEqual(homes.map((h) => `${h.campaign}/${h.slice}`), ['DesignRevamp/7.8a-M']);
  });

  // Homes in another campaign are future or forward-gated, not orphaned: a `Module3/1.1` home
  // must not match the current campaign's closed P1. They come back unchecked, for the audit's note.
  it('auditStaleHomes flags homes at closed units of the campaign it is given only, even when another campaign owns more homes', () => {
    const stack = '- [x] **P1 Numbers**\n- [ ] **P7 x** — Done: 7.2';
    const md = ['- a — home: DesignRevamp/1.3', '- b — home: DesignRevamp/7.2', '- c — home: DesignRevamp/7.11', '- d — home: Module3/1.1'].join('\n');
    const audit = auditStaleHomes(stack, [md], 'DesignRevamp');
    assert.equal(audit.verifiable, true);
    assert.deepEqual(audit.stale.map((h) => h.slice), ['1.3', '7.2']);
    assert.deepEqual(audit.elsewhere.map((h) => `${h.campaign}/${h.slice}`), ['Module3/1.1']);
    assert.equal(activeCampaign(parsePhaseHomes(md)), 'DesignRevamp');
    const module3 = auditStaleHomes(stack, [md], 'Module3');
    assert.deepEqual(module3.stale.map((h) => `${h.campaign}/${h.slice}`), ['Module3/1.1']);
    assert.equal(module3.elsewhere.length, 3);
  });

  it('isClosedUnit: a unit is closed when it or its phase is, and phase numbers compare as numbers on both sides', () => {
    const closed = parseClosedPhases('- [x] **P7 tell-cleanup** — closed\n- [ ] **P8 responsive** — Done: 8.2/8.3a-M Open: 8.3a-C');
    for (const unit of ['7', '07', '7.2', '07.2', '7.8a-M', '07.8a-M', '8.2', '08.2', '8.3a-M']) assert.ok(isClosedUnit(closed, unit), `closed: ${unit}`);
    for (const unit of ['8', '08', '8.3a', '8.3a-C', '70.2', '17.2']) assert.ok(!isClosedUnit(closed, unit), `open: ${unit}`);
    const padded = parseClosedPhases('- [x] **P07 tell-cleanup** — closed\n- [ ] **P08 responsive** — Done: 08.2');
    for (const unit of ['7', '7.2', '8.2', '08.2']) assert.ok(isClosedUnit(padded, unit), `closed: ${unit}`);
    assert.ok(!isClosedUnit(padded, '8.3'));
  });

  it('auditStaleHomes reads a zero-padded home or closed phase as the same unit: 07.2 is stale once P7, P07 or step 7.2 is closed', () => {
    const home = (slice) => `- x — home: DesignRevamp/${slice} {anchor: manual}`;
    const stacks = [
      '- [x] **P7 tell-cleanup** — closed',
      '- [x] **P6 Surfaces**\n- [ ] **P7 tell-cleanup** — Done: 7.2/7.8a-M Open: 7.8a-C',
      '- [x] **P07 tell-cleanup** — closed',
    ];
    for (const stack of stacks) {
      for (const slice of ['07.2', '7.2', '7.8a-M']) assert.equal(auditStaleHomes(stack, [home(slice)], 'DesignRevamp').stale.length, 1, `${stack}: ${slice}`);
    }
  });

  it('unrecognizedPhaseLines: phase-labelled lines in ## Phases that are not **P<n> checkbox bullets, by line number; blockquotes and other sections are not phase lines', () => {
    const stack = [
      '# STACK', '## Phases', '- [x] **P1 Setup**', '- [x] P2 Build', '  - [ ] **Phase 3** — next', '- [ ] **P4 x** — Done: 4.1',
      '> - [x] P9 example', '## Security', '- [ ] rotate the key',
    ].join('\n');
    assert.deepEqual(unrecognizedPhaseLines(stack), [4, 5]);
  });

  // A campaign close collapses the campaign to one `**<Campaign>**` line, which names no phase. Every other
  // spelling of a phase line must stop: the parser reads none of them, so a phase closed that way would read as open.
  it('unrecognizedPhaseLines keys on a P<n> or Phase <n> label under any bullet or marker; a campaign line is not a phase line, and none of these close a phase', () => {
    const stack = [
      '## Phases',
      '- [x] **Demo** — COMPLETE (P1–P2)',
      '- [ ] **P1 Next** — IN PROGRESS',
      '* [x] **P2 Build**',
      '+ [x] **P3 Build**',
      '1. [x] **P4 Build**',
      '2) [x] **P5 Build**',
      '- ✅ **P6 Build**',
      '- ~~**P7 Build**~~',
      '- **P8 Build** — no checkbox',
      '- [x] **Phase 9** — CLOSED',
      '  - [x] **3A — Manage sprint**',
    ].join('\n');
    assert.deepEqual(unrecognizedPhaseLines(stack), [4, 5, 6, 7, 8, 9, 10, 11]);
    assert.deepEqual([...parseClosedPhases(stack)], []);
  });

  // A fixed list of markers before the label missed 🏁, ✅ with a variation selector, links, emphasis and code spans,
  // and each let a closed phase read as open. A label that starts with a word or a number is still not a phase.
  it('unrecognizedPhaseLines reads the label past any checkbox, emoji, strikethrough, emphasis, code span or link, in any case; a label starting with a word, a date or P2P is not a phase line', () => {
    const stack = [
      '## Phases',
      '- [x] 🏁 **P2 Build**',
      '- ✅️ **P3 Build**',
      '- **✅ P4 Build**',
      '- [x] [**P5 Build**](docs/plan.md)',
      '- [x] **[P6 Build](docs/plan.md)**',
      '- [x] ***P7 Build***',
      '- [x] __P8__',
      '- [x] `P9` Build',
      '- [x] **P 10 Build**',
      '- [x] **Phase-11 Build**',
      '- [x] **PHASE 12**',
      '- [x] phase 13 Build',
      '- [x] **Demo** — COMPLETE (P1–P2)',
      '- [x] **Post-refactor cleanup sweep** — 🏁 **COMPLETE 2026-06-19** (P1 Security · P2 root-dedups)',
      '- [x] **P2P Payments**',
      '- [x] **p2p sync**',
      '- [x] **Platform**',
      '- [ ] **Module 3 — Accounting**',
      '- [x] 2026-09-12: P2 closed',
      '| P2 | table |',
    ].join('\n');
    assert.deepEqual(unrecognizedPhaseLines(stack), [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    assert.deepEqual([...parseClosedPhases(stack)], []);
  });

  // A campaign's first phase has nothing closed yet: no home can be stale, so the check ran and passed.
  it('auditStaleHomes runs on an open-only phase list; only a STACK with no phase bullet the parser reads, open or closed, is unverifiable', () => {
    const homes = ['- x — home: Demo/1.1 {anchor: manual}'];
    const open = auditStaleHomes('- [ ] **P1 Build** — IN PROGRESS', homes, 'Demo');
    assert.equal(open.verifiable, true);
    assert.deepEqual(open.stale, []);
    const unreadable = auditStaleHomes('- [x] **Demo** — COMPLETE (P1–P2)\n- [ ] P1 Next', homes, 'Demo');
    assert.equal(unreadable.verifiable, false);
    assert.equal(unreadable.homeCount, 1);
  });
});
