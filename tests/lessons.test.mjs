import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  admit, graduate, lessonState, evaluateLessons, staleMember, probationOver, evidenceRate,
} from '../lib/lessons.mjs';

const L = (n, rule = `Rule ${n}.`) => ({ id: `L-${n}`, n, rule, ref: `docs/lessons-reference.md#l-${n}` });

// `open` is the session being decided, as `audit --evidence` counts it: its own sync is about to close it.
function evaluate({
  count, filed = () => 1, open = 10, closedThrough = open, events = [], phases = new Map(), grand = [], fresh = [], starts = new Map(),
}) {
  const lessons = Array.from({ length: count }, (_, i) => L(i + 1));
  return evaluateLessons({
    lessons,
    filedSession: new Map(lessons.map((l) => [l.id, filed(l.n)])),
    openSession: open,
    closedThrough,
    events,
    phaseOf: phases,
    grandfathered: new Set(grand),
    newIds: new Set(fresh),
    starts,
  });
}

test('clocks: probation and staleness count sessions', () => {
  assert.equal(probationOver(3, 7), false);
  assert.equal(probationOver(3, 8), true);
  assert.equal(staleMember(1, 0, 20), false);
  assert.equal(staleMember(1, 0, 21), true);
  assert.equal(staleMember(1, 2, 21), false);
  assert.equal(evidenceRate(2, 4), 0.5);
  assert.equal(evidenceRate(2, 40), 0.1);
});

test('admit: a free slot, then an automatic bump of the oldest probationer with no evidence, then waiting', () => {
  const p = (id, start) => ({ id, start });
  const four = [p('L-1', 1), p('L-2', 2), p('L-3', 3), p('L-4', 4)];
  assert.deepEqual(admit(four, () => false), { outcome: 'probation' });
  const five = [...four, p('L-5', 5)];
  const evidenced = new Set(['L-1', 'L-2']);
  assert.deepEqual(admit(five, (id) => evidenced.has(id)), { outcome: 'bump', victim: 'L-3' });
  assert.deepEqual(admit(five, () => true), { outcome: 'wait' });
});

test('graduate: catches outrank citations, ties go to the owner, the first of equal members is lowest', () => {
  const m = (id, catchRate, citeRate) => ({ id, catchRate, citeRate });
  const full = [m('L-1', 0, 0.9), ...Array.from({ length: 13 }, (_, i) => m(`L-${i + 2}`, 0.5, 0)), m('L-15', 0, 0.9)];
  assert.equal(full.length, 15);
  assert.deepEqual(graduate({ hasEvidence: false }, full), { outcome: 'leave' });
  assert.deepEqual(graduate({ hasEvidence: true, catchRate: 0, citeRate: 0.1 }, full.slice(1)), { outcome: 'member' });
  assert.deepEqual(graduate({ hasEvidence: true, catchRate: 0.1, citeRate: 0 }, full), { outcome: 'replace', victim: 'L-1' });
  assert.deepEqual(graduate({ hasEvidence: true, catchRate: 0, citeRate: 0.9 }, full), { outcome: 'tie', victim: 'L-1' });
  assert.deepEqual(graduate({ hasEvidence: true, catchRate: 0, citeRate: 0.2 }, full), { outcome: 'leave' });
});

test('lessonState: migrated lessons are members; otherwise probation, then member or expired', () => {
  assert.equal(lessonState({ age: 0, hasEvidence: false, grandfathered: true }), 'member');
  assert.equal(lessonState({ age: 4, hasEvidence: false, grandfathered: false }), 'probation');
  assert.equal(lessonState({ age: 5, hasEvidence: true, grandfathered: false }), 'member');
  assert.equal(lessonState({ age: 5, hasEvidence: false, grandfathered: false }), 'expired');
});

test('probation lasts 5 sessions, and footers from the filing session do not count', () => {
  const fromFilingSession = [{ kind: 'caught', id: 'L-1', session: 3 }];
  const at = (open, events) => evaluate({ count: 1, filed: () => 3, open, events });
  assert.equal(at(7, fromFilingSession).lessons[0].state, 'probation');
  const expired = at(8, fromFilingSession);
  assert.equal(expired.lessons[0].state, 'expired');
  assert.match(expired.stops.join('\n'), /L-1 finished probation with no evidence/);
  assert.equal(at(8, [{ kind: 'cited', id: 'L-1', session: 5 }]).lessons[0].state, 'member');
});

test('evidence leaves the window after 20 sessions and the member is proposed for eviction', () => {
  const events = [{ kind: 'caught', id: 'L-1', session: 2 }];
  const run = (open) => evaluate({ count: 1, filed: () => 1, open, events });
  assert.deepEqual(run(21).warnings, []);
  const late = run(22);
  assert.equal(late.lessons[0].state, 'member');
  assert.match(late.warnings.join('\n'), /L-1 has no evidence in the last 20 sessions/);
  assert.match(late.proposals.join('\n'), /evict L-1/);
  assert.deepEqual(late.stops, []);
});

test('six on probation stops, and proposes bumping the oldest probationer with no evidence', () => {
  const filed = (n) => [6, 7, 8, 9, 9, 10][n - 1];
  const out = evaluate({ count: 6, filed, open: 10, fresh: ['L-6'], events: [{ kind: 'cited', id: 'L-1', session: 8 }] });
  assert.match(out.stops.join('\n'), /6 lessons on probation — the limit is 5/);
  assert.match(out.proposals.join('\n'), /remove L-2 to the reference doc/);
  const allEvidenced = evaluate({
    count: 6, filed, open: 10, fresh: ['L-6'],
    events: [1, 2, 3, 4, 5].map((n) => ({ kind: 'cited', id: `L-${n}`, session: 10 })),
  });
  assert.deepEqual(allEvidenced.proposals, ['move L-6 to ## Candidates in the reference doc — every probationer has evidence; file it again when a probation slot is free']);
});

test('two lessons filed in one session stops', () => {
  const out = evaluate({ count: 2, filed: () => 10, open: 10, fresh: ['L-1', 'L-2'] });
  assert.match(out.stops.join('\n'), /2 lessons filed this session \(L-1, L-2\) — the limit is 1/);
});

test('more than 15 migrated members or 20 lessons stops; the extras are ranked out, and a tie at the cut goes to the owner', () => {
  const ids = (n) => Array.from({ length: n }, (_, i) => `L-${i + 1}`);
  const sixteen = evaluate({
    count: 16, grand: ids(16),
    events: ids(15).map((id) => ({ kind: 'caught', id, session: 5 })),
  });
  assert.match(sixteen.stops.join('\n'), /16 members — the limit is 15/);
  assert.deepEqual(sixteen.proposals, ['evict L-16 to the reference doc — lowest-ranked member']);
  assert.deepEqual(evaluate({ count: 16, grand: ids(16) }).proposals, ['owner breaks the tie: L-16 and L-15 rank equally for the last member slot']);
  const twentyOne = evaluate({ count: 21, grand: ids(21) });
  assert.match(twentyOne.stops.join('\n'), /21 lessons listed — the limit is 20/);
});

test('the legal maxima pass: 20 lessons, 15 members, 5 on probation and a 200-character rule give no stop and no length warning', () => {
  const lessons = Array.from({ length: 20 }, (_, i) => L(i + 1, i === 0 ? 'x'.repeat(200) : undefined));
  // Migrated members fill the member slots; the rest are filed late enough to still be on probation.
  const out = evaluateLessons({
    lessons,
    filedSession: new Map(lessons.map((l) => [l.id, l.n <= 15 ? 1 : [6, 7, 8, 9, 9][l.n - 16]])),
    openSession: 10,
    closedThrough: 10,
    events: [],
    phaseOf: new Map(),
    grandfathered: new Set(lessons.slice(0, 15).map((l) => l.id)),
    newIds: new Set(),
    starts: new Map(),
  });
  const tally = (state) => out.lessons.filter((l) => l.state === state).length;
  assert.deepEqual([tally('member'), tally('probation')], [15, 5]);
  assert.deepEqual(out.stops, []);
  assert.doesNotMatch(out.warnings.join('\n'), /characters/);
});

test("a graduate past the last member slot takes graduate's outcome: replace, tie or leave", () => {
  // 15 migrated members and L-16, which finished probation with evidence: one member too many.
  const migrated = Array.from({ length: 15 }, (_, i) => `L-${i + 1}`);
  const overflow = (membersFooter, newcomerFooter) => evaluate({
    count: 16, filed: () => 3, grand: migrated,
    events: [...migrated.map((id) => ({ kind: membersFooter, id, session: 5 })), { kind: newcomerFooter, id: 'L-16', session: 5 }],
  });
  const replaced = overflow('cited', 'caught');
  assert.match(replaced.stops.join('\n'), /16 members — the limit is 15/);
  assert.deepEqual(replaced.proposals, ['automatic: evict L-1 to the reference doc — L-16 outranks it for the last member slot']);
  assert.deepEqual(overflow('cited', 'cited').proposals, ['owner breaks the tie: L-16 and L-1 rank equally for the last member slot']);
  assert.deepEqual(overflow('caught', 'cited').proposals, ["automatic: L-16 leaves for the reference doc — it doesn't outrank the lowest-ranked member L-1"]);
});

test('rank is a rate, not a count: a graduate caught once in a short listing outranks members caught once in a long one', () => {
  const migrated = Array.from({ length: 15 }, (_, i) => `L-${i + 1}`);
  const out = evaluate({
    count: 16, filed: (n) => (n === 16 ? 14 : 1), open: 21, grand: migrated,
    events: [...migrated, 'L-16'].map((id) => ({ kind: 'caught', id, session: 15 })),
  });
  // Equal counts, so a count ranking would send this to the owner as a tie.
  assert.equal(out.lessons[15].catches, out.lessons[0].catches);
  assert.deepEqual(out.proposals, ['automatic: evict L-1 to the reference doc — L-16 outranks it for the last member slot']);
});

test('two graduates past the last member slot each evict the lowest-ranked member still ahead of them: L-1 for L-16, then L-2 for L-17', () => {
  const migrated = Array.from({ length: 15 }, (_, i) => `L-${i + 1}`);
  const out = evaluate({
    count: 17, filed: (n) => ({ 16: 3, 17: 4 })[n] ?? 1, open: 10, grand: migrated,
    events: [
      ...migrated.map((id) => ({ kind: 'cited', id, session: 5 })),
      ...['L-16', 'L-17'].map((id) => ({ kind: 'caught', id, session: 5 })),
    ],
  });
  assert.match(out.stops.join('\n'), /17 members — the limit is 15/);
  assert.deepEqual(out.proposals, [
    'automatic: evict L-1 to the reference doc — L-16 outranks it for the last member slot',
    'automatic: evict L-2 to the reference doc — L-17 outranks it for the last member slot',
  ]);
});

test('warnings: a long rule, probation ending with no evidence; notes, never warnings: a check candidate, a rulebook candidate', () => {
  // L-1's rule is too long, L-2's probation ends at session 11's sync, L-3 is cited 3 times, L-4 caught in 2 phases.
  const out = evaluateLessons({
    lessons: [L(1, 'x'.repeat(201)), L(2), L(3), L(4)],
    filedSession: new Map([['L-1', 1], ['L-2', 6], ['L-3', 1], ['L-4', 1]]),
    openSession: 10,
    closedThrough: 10,
    events: [
      { kind: 'cited', id: 'L-3', session: 3 }, { kind: 'cited', id: 'L-3', session: 4 }, { kind: 'cited', id: 'L-3', session: 5 },
      { kind: 'caught', id: 'L-4', session: 2 }, { kind: 'caught', id: 'L-4', session: 8 },
    ],
    phaseOf: new Map([[2, 'Demo/1'], [8, 'Demo/2']]),
    grandfathered: new Set(['L-1']),
    newIds: new Set(),
    starts: new Map(),
  });
  const w = out.warnings.join('\n');
  assert.match(w, /L-1 rule is 201 characters — the limit is 200/);
  assert.match(w, /L-2 ends probation at session 11's sync with no evidence/);
  assert.doesNotMatch(w, /could become a check|rulebook candidate/);
  assert.deepEqual(out.notes, [
    'L-3 cited 3 times with no catches — could become a check',
    'L-4 caught something in 2 phases — rulebook candidate (owner decides)',
  ]);
  assert.deepEqual(out.stops, []);
});

test('revivals: a listing that began three times is two revivals', () => {
  const out = evaluate({ count: 2, grand: ['L-1', 'L-2'], starts: new Map([['L-1', 3], ['L-2', 1]]) });
  assert.deepEqual(out.lessons.map((l) => l.revived), [2, 0]);
});
