import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseClosedPhases } from '../lib/anchors.mjs';
import { parseFus, parseTrigger } from '../lib/rows.mjs';
import { anchoredRows, heaviest, groupSteps, countMatches, checkTrigger, evaluateFus } from '../lib/fus.mjs';
import { fu } from './helpers/ledger-fixture.mjs';

const stackRows = (lines) => parseFus(lines, 'stack');
const standingRows = (lines) => parseFus(lines, 'standing');
// A real Phases section: P6 closed with its steps listed on the line, P7 in progress with two steps done.
const PHASES = [
  '- [x] **P6 Surfaces** — closed. Done: 6.1/6.2',
  '- [ ] **P7 tell-cleanup** — IN PROGRESS. Done: 7.2/7.8a-M Open: 7.8a-C',
  '- [ ] **P8 responsive** — not started',
].join('\n');
const ctx = {
  today: '2026-09-10',
  activeCampaign: 'DesignRevamp',
  closedUnits: parseClosedPhases(PHASES),
  readText: (file) => ({ 'src/a.ts': 'useFoo(); useFoo(); useFoo();' })[file] ?? null,
};

function evaluate(overrides) {
  return evaluateFus({
    stack: stackRows([]),
    standing: standingRows([]),
    stepOrder: new Map(),
    lastTouch: new Map(),
    closedThrough: 30,
    closedIds: new Set(),
    triggerCtx: ctx,
    ...overrides,
  });
}

test('a group step takes its heaviest member rigor and groups by home', () => {
  assert.equal(heaviest(['cleanup-light', 'change-heavy', 'cleanup-light']), 'change-heavy');
  const groups = groupSteps(stackRows([
    fu(1, 'DesignRevamp/7.11', 'perf', 'cleanup-light'),
    fu(2, 'DesignRevamp/7.11', 'perf', 'change-heavy'),
    fu(3, 'DesignRevamp/7.12', 'security', 'cleanup-light'),
  ]).rows);
  assert.deepEqual(groups.map((g) => [g.home, g.ids.join(' '), g.rigor]), [
    ['DesignRevamp/7.11', 'FU-1 FU-2', 'change-heavy'],
    ['DesignRevamp/7.12', 'FU-3', 'cleanup-light'],
  ]);
});

test('countMatches counts regex and literal matches and reports a bad regex', () => {
  assert.deepEqual(countMatches('a1 a2 a3', '/a\\d/'), { count: 3 });
  assert.deepEqual(countMatches('x.y.z', '.'), { count: 2 });
  assert.match(countMatches('abc', '/(/').error, /bad pattern/);
});

test('date, count and owner triggers fire and do not fire', () => {
  const t = (text) => checkTrigger(parseTrigger(text), ctx);
  assert.equal(t('date 2026-09-10').fired, true);
  assert.equal(t('date 2026-09-11').fired, false);
  assert.equal(t('count {anchor: src/a.ts :: /useFoo\\(/} >= 3').fired, true);
  assert.equal(t('count {anchor: src/a.ts :: useFoo} >= 4').fired, false);
  assert.match(t('count {anchor: src/gone.ts :: /x/} >= 1').problem, /src\/gone\.ts is not a readable file/);
  assert.match(t('count {anchor: src/a.ts :: /(/} >= 1').problem, /bad pattern/);
  assert.deepEqual(t('owner decision — ship it?'), { fired: false, waitingOnOwner: true });
});

test('after triggers: a closed step or phase of the current campaign fires; a trigger naming any other campaign waits quietly', () => {
  const t = (text) => checkTrigger(parseTrigger(text), ctx);
  assert.deepEqual([...ctx.closedUnits].sort(), ['6', '7.2', '7.8a-M']);
  assert.equal(t('after DesignRevamp/6').fired, true);
  assert.equal(t('after DesignRevamp/6.2').fired, true);
  assert.equal(t('after DesignRevamp/7.2').fired, true);
  assert.equal(t('after DesignRevamp/7.8a-M').fired, true);
  assert.equal(t('after DesignRevamp/7.8a-C').fired, false);
  assert.equal(t('after DesignRevamp/7').fired, false);
  assert.equal(t('after DesignRevamp/8').fired, false);
  assert.deepEqual(t('after Sweep/3'), { fired: false });
  assert.deepEqual(t('after Module3/6'), { fired: false });
});

test('a group step with 5 FUs must be in the phase step order; an unreadable step-order doc is one stop at any group size', () => {
  const five = [1, 2, 3, 4, 5].map((n) => fu(n, 'DesignRevamp/7.11', 'css-token-hygiene', n === 5 ? 'change-heavy' : 'cleanup-light'));
  const order = (ids) => new Map([['DesignRevamp/7', { doc: 'docs/p7.md', stepIds: new Set(ids) }]]);
  assert.match(evaluate({ stack: stackRows(five) }).stops.join('\n'), /DesignRevamp\/7\.11 has 5 FUs and STACK\.md has no ledger:step-order pointer for DesignRevamp\/7/);
  const gone = { doc: 'docs/gone.md', stepIds: null };
  const goneStop = ['step-order doc docs/gone.md is not a readable file'];
  assert.deepEqual(evaluate({ stack: stackRows(five), stepOrder: new Map([['DesignRevamp/7', gone]]) }).stops, goneStop);
  // Two pointers naming the same doc still make one stop.
  assert.deepEqual(evaluate({ stack: stackRows(five.slice(0, 1)), stepOrder: new Map([['DesignRevamp/7', gone], ['DesignRevamp/8', gone]]) }).stops, goneStop);
  assert.match(evaluate({ stack: stackRows(five), stepOrder: order(['7.10']) }).stops.join('\n'), /isn't in docs\/p7\.md/);
  const listed = evaluate({ stack: stackRows(five), stepOrder: order(['7.11']) });
  assert.deepEqual(listed.stops, []);
  assert.equal(listed.groups[0].scheduled, true);
  assert.equal(listed.groups[0].rigor, 'change-heavy');
  assert.deepEqual(evaluate({ stack: stackRows(five.slice(0, 4)) }).stops, []);
});

test('closing: a still-listed FU-Closed row, a resolved row and a malformed row are stops', () => {
  const out = evaluate({
    stack: stackRows([
      fu(1, 'DesignRevamp/7.11', 'perf', 'cleanup-light'),
      '- ~~**FU-2** [perf · cleanup-light] done — home: DesignRevamp/7.11~~',
      '- **FU-3** [perf · cleanup-light] no home {anchor: manual}',
    ]),
    standing: standingRows(['- [x] **FU-4** [perf · cleanup-light] done — trigger: date 2026-01-01']),
    closedIds: new Set(['FU-1']),
  });
  const s = out.stops.join('\n');
  assert.ok(out.stops.includes('FU-1 has an FU-Closed footer but is still listed — remove the finished row, or if this row is new and reused a closed ID, give it a fresh ID with next-id fu'), s);
  assert.match(s, /STACK\.md: crossed-out or checked-off row.*FU-2/);
  assert.match(s, /STACK\.md: missing "— home:".*FU-3/);
  assert.match(s, /Standing-FUs\.md: crossed-out or checked-off row.*FU-4/);
});

test("a row from the project's reasonsFrom ID on names why it waits; older rows and owner questions don't", () => {
  const why = ' — why not now: risk: the cache layer moves next phase';
  const stack = stackRows([fu(7), `- **FU-8** [perf · cleanup-light] Thing 8${why} — home: Demo/2.4 {anchor: manual}`, fu(9)]);
  const standing = standingRows([
    '- **FU-10** [perf · cleanup-light] Later — why not now: someday: maybe — trigger: date 2027-01-01',
    '- **FU-11** [ux-copy · cleanup-light] Empty state — recommended: "None yet" — trigger: owner decision — which text?',
  ]);
  assert.deepEqual(stack.rows.map((r) => r.whyNotNow?.kind ?? null), [null, 'risk', null]);
  const stops = evaluate({ stack, standing, reasonsFrom: 8 }).stops;
  // FU-7 is grandfathered, FU-8 names a reason, FU-11 is a question; FU-9 has none and FU-10's kind isn't one of the four.
  assert.deepEqual(stops.map((s) => s.split(' ')[0]), ['FU-9', 'FU-10']);
  assert.match(stops[0], /add " — why not now: <product\|risk\|abstraction\|own run>: <one line>" before its home/);
  assert.match(stops[1], /before its trigger/);
  assert.deepEqual(evaluate({ stack, standing }).stops, [], 'a project with no reasonsFrom is not checked');
});

test('a missing Follow-ups heading or Standing file stops instead of reading as an empty ledger', () => {
  const out = evaluate({ stack: parseFus(null, 'stack'), standing: parseFus(null, 'standing') });
  assert.deepEqual(out.stops, [
    'STACK.md has no "## Follow-ups" heading — the FU ledger can\'t be checked',
    'Standing-FUs.md not found — a migrated project needs one',
  ]);
});

test('an unscheduled group step idle for 10 sessions asks once per 10-session window; a scheduled one never asks', () => {
  const stack = stackRows([fu(1, 'DesignRevamp/7.11', 'perf', 'cleanup-light')]);
  const at = (touched, stepOrder = new Map()) => evaluate({ stack, stepOrder, lastTouch: new Map([['DesignRevamp/7.11', touched]]) }).warnings.join('\n');
  assert.match(at(20), /group step DesignRevamp\/7\.11 untouched for 10 sessions/);
  assert.doesNotMatch(at(21), /untouched/);
  assert.doesNotMatch(at(19), /untouched/);
  assert.match(at(10), /group step DesignRevamp\/7\.11 untouched for 20 sessions/);
  const scheduled = new Map([['DesignRevamp/7', { doc: 'docs/p7.md', stepIds: new Set(['7.11']) }]]);
  assert.doesNotMatch(at(20, scheduled), /untouched/);
});

test('a group step mixing types is a warning', () => {
  const out = evaluate({ stack: stackRows([fu(1, 'DesignRevamp/7.11', 'security', 'cleanup-light'), fu(2, 'DesignRevamp/7.11', 'perf', 'change-heavy')]) });
  assert.match(out.warnings.join('\n'), /DesignRevamp\/7\.11 mixes types: perf, security/);
});

test('a fired Standing trigger proposes an open group step for its type, never a closed one; an owner question waits', () => {
  const out = evaluate({
    stack: stackRows([
      fu(1, 'DesignRevamp/7.2', 'observability', 'change-heavy'),
      fu(2, 'DesignRevamp/7.12', 'observability', 'change-heavy'),
      fu(3, 'DesignRevamp/6.1', 'perf', 'cleanup-light'),
    ]),
    standing: standingRows([
      '- **FU-88** [observability · change-heavy] Stale banner — trigger: after DesignRevamp/6',
      '- **FU-89** [perf · cleanup-light] Bigger cache — trigger: owner decision — worth the memory?',
      '- **FU-90** [perf · cleanup-light] Later — trigger: date 2027-01-01',
      '- **FU-91** [perf · cleanup-light] Broken — trigger: count {anchor: src/gone.ts :: /x/} >= 1',
      '- **FU-92** [perf · cleanup-light] Sooner — trigger: date 2026-09-01',
    ]),
  });
  assert.deepEqual(out.fired.map((r) => r.id), ['FU-88', 'FU-92']);
  const p = out.proposals.join('\n');
  assert.match(p, /move FU-88 from Standing into DesignRevamp\/7\.12/);
  assert.match(p, /move FU-92 from Standing into a new perf group step in DesignRevamp's current phase/);
  assert.deepEqual(out.waitingOnOwner.map((r) => r.id), ['FU-89']);
  assert.deepEqual(out.stops, ['FU-91 trigger can\'t be checked: src/gone.ts is not a readable file']);
});

test("placement stays in the current campaign: another campaign's open group step of the same type is never proposed", () => {
  const out = evaluate({
    stack: stackRows([fu(1, 'Module3/9.1')]),
    standing: standingRows(['- **FU-92** [perf · cleanup-light] Sooner — trigger: date 2026-09-01']),
  });
  assert.deepEqual(out.proposals, ["move FU-92 from Standing into a new perf group step in DesignRevamp's current phase"]);
});

test('a zero-padded phase number names the same unit: once P7 or step 7.2 is closed, after 07.2 fires and placement skips a group step at 07.2', () => {
  const closings = [
    '- [x] **P7 tell-cleanup** — closed',
    '- [ ] **P7 tell-cleanup** — IN PROGRESS. Done: 7.2/7.8a-M Open: 7.8a-C',
    '- [x] **P07 tell-cleanup** — closed',
  ];
  for (const phases of closings) {
    const triggerCtx = { ...ctx, closedUnits: parseClosedPhases(phases) };
    for (const unit of ['07.2', '7.2', '7.8a-M']) assert.equal(checkTrigger(parseTrigger(`after DesignRevamp/${unit}`), triggerCtx).fired, true, `${phases}: after ${unit}`);
    const out = evaluate({
      stack: stackRows([fu(1, 'DesignRevamp/07.2')]),
      standing: standingRows(['- **FU-92** [perf · cleanup-light] Sooner — trigger: date 2026-09-01']),
      triggerCtx,
    });
    assert.deepEqual(out.proposals, ["move FU-92 from Standing into a new perf group step in DesignRevamp's current phase"], phases);
  }
});

test('an owner question with no recommended pick is a warning: /start-session has nothing to mark', () => {
  const out = evaluate({
    standing: standingRows([
      '- **FU-89** [perf · cleanup-light] Bigger cache — trigger: owner decision — worth the memory?',
      '- **FU-93** [perf · cleanup-light] Bigger cache — recommended: 64 MB; the cache config in docs/cache.md — trigger: owner decision — how big?',
    ]),
  });
  assert.deepEqual(out.waitingOnOwner.map((r) => r.id), ['FU-89', 'FU-93']);
  assert.deepEqual(out.warnings, ['FU-89 waits on the owner with no "recommended: <pick>" — add the pick /start-session will mark when it asks (red-line-toolkit/reference/decision-gates.md § Parking)']);
});

test('an owner question ruled "not until" keeps its Standing row past the reason stop only with the reason 6L-c writes', () => {
  const parked = '- **FU-20** [perf · cleanup-light] Bigger cache — recommended: 64 MB; docs/cache.md';
  const ruled = `${parked} — Owner ruling 2026-10-16: 64 MB, not until 2027-01-01`;
  const standing = standingRows([
    `${parked} — trigger: owner decision — how big?`,
    `${ruled} — why not now: product: the owner's ruling — trigger: date 2027-01-01`.replace('FU-20', 'FU-21'),
    `${ruled} — trigger: date 2027-01-01`.replace('FU-20', 'FU-22'),
  ]);
  // ledger-session.md § End, 6L-c: the parked question needs no reason; the ruled row does, and passes with it.
  assert.deepEqual(evaluate({ standing, reasonsFrom: 20 }).stops.map((s) => s.split(' ')[0]), ['FU-22']);
});

test('anchoredRows lists the rows whose own anchors name a file, never a count trigger\'s anchor or a manual one', () => {
  const stack = stackRows([
    '- **FU-1** [perf · cleanup-light] One — home: DesignRevamp/7.2 {anchor: src/a.ts :: one}',
    '- **FU-2** [perf · cleanup-light] Two — home: DesignRevamp/7.2 {anchor: ./src/b.ts :: two} {anchor: src/a.ts :: /t[wo]+/}',
    '- **FU-3** [perf · cleanup-light] Three — home: DesignRevamp/7.2 {anchor: manual}',
  ]).rows;
  const standing = standingRows([
    '- **FU-4** [perf · cleanup-light] Count — trigger: count {anchor: src/a.ts :: one} >= 3',
    '- **FU-5** [perf · cleanup-light] Later — trigger: date 2027-01-01 {anchor: src/b.ts :: later}',
  ]).rows;
  const ids = (files) => anchoredRows([...stack, ...standing], files).map(({ row, files: matched }) => `${row.id} ${matched.join(',')}`);
  assert.deepEqual(ids(['src/a.ts']), ['FU-1 src/a.ts', 'FU-2 src/a.ts']);
  // Both sides are normalized, so ./src/b.ts and src/b.ts are one file; a row anchored to two named files lists both once.
  assert.deepEqual(ids(['src/b.ts', 'src/a.ts']), ['FU-1 src/a.ts', 'FU-2 src/b.ts,src/a.ts', 'FU-5 src/b.ts']);
  assert.deepEqual(ids(['src/c.ts']), []);
  assert.deepEqual(ids([]), []);
});
