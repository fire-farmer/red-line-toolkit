import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RULES } from '../lib/rules.mjs';
import { auditProject, nextRuleId } from '../lib/audit.mjs';
import { LESSON_ROW_ID, fileHistory, listedSince } from '../lib/history.mjs';
import { CO, PLAN, STANDING, addSyncs, fu, lesson, makeLedgerProject, referenceText, stackText } from './helpers/ledger-fixture.mjs';

const rulebookText = (rules) => `# Rulebook\n\n## Rules\n\n${rules.join('\n')}\n`;

// `rulebook: null` leaves CLAUDE.md out, as before Task A11 creates it.
function makeProcessRoot(t, { rules = [], rulebook = rulebookText(rules), promoted = '' } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-process-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, 'reference'));
  if (rulebook !== null) writeFileSync(join(dir, 'CLAUDE.md'), rulebook);
  writeFileSync(join(dir, 'reference', 'rules.md'), `# Rules reference\n\n${promoted}`);
  return dir;
}

function setup(t, options) {
  const { repo, project } = makeLedgerProject(options);
  t.after(repo.cleanup);
  const audit = (root = {}, pendingFooters) => auditProject({ project, processRoot: makeProcessRoot(t, root), today: '2026-09-10', pendingFooters });
  return { repo, audit };
}

// The lesson answer that makes `audit --evidence` the audit deciding its session, which counts the session's own sync.
const NO_LESSON = [{ key: 'Lesson-Check', value: 'none' }];

// A Current location bullet that opens the file, so its line number is 5.
const withLocationBullet = (text, bullet) => text.replace('## Phases', `## Current location\n\n${bullet}\n\n## Phases`);

test('a freshly migrated ledger passes; migrated lessons are members; next IDs follow the highest issued', (t) => {
  const { audit } = setup(t);
  const r = audit();
  assert.deepEqual(r.stops, []);
  assert.deepEqual(r.warnings, []);
  assert.equal(r.openSession, 2);
  assert.deepEqual(r.lessons.map((l) => `${l.id} ${l.state}`), ['L-1 member', 'L-2 member']);
  assert.deepEqual(r.nextIds, { lesson: 'L-3', fu: 'FU-7', rule: 'R-1' });
  assert.equal(r.groups[0].scheduled, true);
  assert.deepEqual(r.revivals, []);
  assert.equal(r.limits, RULES);
});

test('the migration commit alone passes: its lessons are members, not lessons filed this session', (t) => {
  const { audit } = setup(t, { syncAfterMigration: false });
  const r = audit();
  assert.equal(r.openSession, 1);
  assert.deepEqual(r.stops, []);
  assert.deepEqual(r.lessons.map((l) => `${l.id} ${l.state}`), ['L-1 member', 'L-2 member']);
});

test('one lesson filed this session is new until the audit deciding the session puts it on probation; two stop the commit', (t) => {
  const { repo, audit } = setup(t);
  repo.write('STACK.md', stackText({ lessons: [lesson(1), lesson(2), lesson(3)] }));
  const one = audit({}, NO_LESSON);
  assert.deepEqual(one.stops, []);
  assert.equal(one.lessons[2].state, 'probation');
  assert.equal(audit().lessons[2].state, 'new');
  repo.write('STACK.md', stackText({ lessons: [lesson(1), lesson(2), lesson(3), lesson(4)] }));
  assert.match(audit().stops.join('\n'), /2 lessons filed this session \(L-3, L-4\)/);
});

test('a lesson filed after the last sync holds no probation slot, so the probationer that session decides is not crowded into a stop', (t) => {
  const { repo, audit } = setup(t);
  const listed = [lesson(1), lesson(2)];
  // L-3 to L-7, one per session: session 7 is L-3's deciding session, and L-8 is filed in it.
  for (let n = 3; n <= 8; n++) {
    listed.push(lesson(n));
    const stack = stackText({ lessons: listed });
    repo.commit(`docs(stack): file L-${n}\n\nFiled.\n`, { 'STACK.md': stack, 'docs/lessons-reference.md': referenceText(stack) });
    if (n < 8) addSyncs(repo, 1);
  }
  const r = audit();
  assert.deepEqual(r.lessons.slice(2).map((l) => l.state), ['probation', 'probation', 'probation', 'probation', 'probation', 'new']);
  assert.deepEqual(r.stops, []);
  const decided = audit({}, NO_LESSON);
  assert.deepEqual(decided.lessons.slice(2).map((l) => l.state), ['expired', 'probation', 'probation', 'probation', 'probation', 'probation']);
  assert.deepEqual(decided.stops, ['L-3 finished probation with no evidence — move it to the reference doc']);
});

test('a lesson committed earlier in the open session counts toward the one-per-session limit', (t) => {
  const { repo, audit } = setup(t);
  repo.commit('docs(stack): file L-3\n\nFiled mid-session.\n', { 'STACK.md': stackText({ lessons: [lesson(1), lesson(2), lesson(3)] }) });
  assert.deepEqual(audit().stops, []);
  repo.write('STACK.md', stackText({ lessons: [lesson(1), lesson(2), lesson(3), lesson(4)] }));
  assert.match(audit().stops.join('\n'), /2 lessons filed this session \(L-3, L-4\)/);
});

test('a lesson row fixed in the working tree stays filed in its own session; only a lesson new to the working tree is filed this session', (t) => {
  const { repo, audit } = setup(t);
  repo.commit('docs(stack): file L-3\n\nFiled with a link to another entry.\n', { 'STACK.md': stackText({ lessons: [lesson(1), lesson(2), lesson(3).replace('#l-3', '#l-9')] }) });
  addSyncs(repo, 1);
  repo.write('STACK.md', stackText({ lessons: [lesson(1), lesson(2), lesson(3), lesson(4)] }));
  const r = audit();
  assert.deepEqual(r.stops, []);
  assert.deepEqual(r.lessons.map((l) => `${l.id} ${l.filed} ${l.state}`), ['L-1 1 member', 'L-2 1 member', 'L-3 2 probation', 'L-4 3 new']);
});

test('through the audit, an unscheduled group step is quiet a session short of the idle window and asks at the audit deciding the session that completes it, as does the audit after that sync; an uncommitted FU-row edit touches it in the open session', (t) => {
  const { repo, audit } = setup(t);
  const fus = (what) => [...[1, 2, 3, 4, 5].map((n) => fu(n)), `- **FU-7** [perf · cleanup-light] ${what} — home: Demo/2.5 {anchor: manual}`];
  repo.commit('docs(stack): park FU-7\n', { 'STACK.md': stackText({ fus: fus('Parked') }) });
  addSyncs(repo, RULES.groupStepIdleSessions - 1);
  const idle = `group step Demo/2.5 untouched for ${RULES.groupStepIdleSessions} sessions`;
  assert.ok(!audit({}, NO_LESSON).warnings.includes(idle), 'one session short of the idle window');
  addSyncs(repo, 1);
  assert.ok(!audit().warnings.includes(idle), 'the audit after the sync that was a session short');
  assert.ok(audit({}, NO_LESSON).warnings.includes(idle));
  addSyncs(repo, 1);
  assert.ok(audit().warnings.includes(idle), 'the audit after the sync that completed the window');
  repo.write('STACK.md', stackText({ fus: fus('Parked, narrowed') }));
  assert.ok(!audit().warnings.includes(idle));
  assert.ok(!audit({}, NO_LESSON).warnings.includes(idle));
});

test('from git alone: a footer in the filing session does not count, probation ends at the audit deciding the 5th session after filing, evidence leaves the window 20 sessions on', (t) => {
  const { repo, audit } = setup(t);
  repo.commit(`docs(stack): file L-3\n\nFiled.\n\nLesson-Cited: L-3\n${CO}\n`, { 'STACK.md': stackText({ lessons: [lesson(1), lesson(2), lesson(3)] }) });
  const now = (pending) => {
    const r = audit({}, pending);
    return { r, l3: r.lessons.find((l) => l.id === 'L-3') };
  };
  addSyncs(repo, 1);
  const first = now();
  assert.equal(first.l3.state, 'probation');
  assert.equal(first.l3.cites, 0);
  addSyncs(repo, 1, 'Lesson-Cited: L-3\nPhase: Demo/2\n');
  addSyncs(repo, 3);
  // Session 7 is the 5th after filing: the audit after session 6's sync still finds it on probation, and session 7's own audit ends it.
  const lastSync = now();
  assert.equal(lastSync.r.openSession, 7);
  assert.equal(`${lastSync.l3.state} ${lastSync.l3.age}`, `probation ${RULES.probationSessions - 1}`);
  assert.equal(now(NO_LESSON).l3.state, 'member');
  addSyncs(repo, 15);
  assert.doesNotMatch(now(NO_LESSON).r.warnings.join('\n'), /L-3 has no evidence/);
  addSyncs(repo, 1);
  const late = now(NO_LESSON);
  assert.equal(late.r.openSession, 23);
  assert.match(late.r.warnings.join('\n'), /L-3 has no evidence in the last 20 sessions/);
  assert.doesNotMatch(now().r.warnings.join('\n'), /L-3 has no evidence/, "the audit after session 22's sync");
});

test("pending evidence: the deciding session's answer counts before it is committed, and is checked like a committed footer", (t) => {
  const { repo, audit } = setup(t);
  const filed = stackText({ lessons: [lesson(1), lesson(2), lesson(3)] });
  repo.commit('docs(stack): file L-3\n\nFiled.\n', { 'STACK.md': filed, 'docs/lessons-reference.md': referenceText(filed) });
  addSyncs(repo, 5);
  const expired = 'L-3 finished probation with no evidence — move it to the reference doc';
  // Without --evidence the audit finds what session 6's sync left: session 7 is the one that decides.
  const without = audit();
  assert.equal(without.openSession, 7);
  assert.equal(without.lessons[2].state, 'probation');
  assert.deepEqual(without.stops, []);
  assert.deepEqual(without.warnings, ["L-3 ends probation at session 7's sync with no evidence"]);
  assert.deepEqual(without.pendingEvidence, []);
  const none = audit({}, NO_LESSON);
  assert.deepEqual(none.stops, [expired]);
  assert.deepEqual(none.pendingEvidence, ['Lesson-Check none']);
  const cited = audit({}, [{ key: 'Lesson-Cited', value: 'L-3' }]);
  assert.equal(cited.lessons[2].state, 'member');
  assert.equal(cited.lessons[2].cites, 1);
  assert.deepEqual(cited.stops, []);
  assert.deepEqual(cited.warnings, []);
  assert.deepEqual(cited.pendingEvidence, ['Lesson-Cited L-3']);
  const bad = audit({}, [{ key: 'Lesson-Cited', value: 'none' }, { key: 'Lesson-Caught', value: 'L-99' }, { key: 'Lesson-Check', value: 'L-3' }]);
  assert.deepEqual(bad.stops, [expired]);
  assert.deepEqual(bad.warnings, [
    '--evidence has a malformed ledger footer: Lesson-Cited: none — names no L-<n> or R-<n> ID',
    '--evidence has a malformed ledger footer: Lesson-Check: L-3 — takes only none',
    '--evidence Lesson-Caught names unknown ID L-99',
  ]);
  assert.deepEqual(bad.pendingEvidence, ['Lesson-Cited none', 'Lesson-Caught L-99', 'Lesson-Check L-3']);
});

test("the audit after each sync finds what that sync's gate decided: a probationer with evidence reaches the full member list at its own gate, never a sync early", (t) => {
  const members = Array.from({ length: RULES.memberSlots }, (_, i) => lesson(i + 1));
  const { repo, audit } = setup(t, { lessons: members });
  const newcomer = `L-${RULES.memberSlots + 1}`;
  const filed = stackText({ lessons: [...members, lesson(RULES.memberSlots + 1)] });
  repo.commit(`docs(stack): file ${newcomer}\n\nFiled.\n`, { 'STACK.md': filed, 'docs/lessons-reference.md': referenceText(filed) });
  const view = (r) => ({ lessons: r.lessons.map((l) => `${l.id} ${l.state} ${l.age}`), stops: r.stops, warnings: r.warnings, proposals: r.proposals });
  // Each session's gate is `audit --evidence` with its lesson answer; the sync then commits that answer.
  const gateThenSync = (answer) => {
    const [key, value] = answer.split(': ');
    const gate = audit({}, [{ key, value }]);
    addSyncs(repo, 1, `${answer}\nPhase: Demo/2\n`);
    return { gate, after: audit() };
  };
  // Filed in session 2 and cited in session 3; the gates of sessions 2 to 6 keep it on probation.
  for (let session = 2; session < 2 + RULES.probationSessions; session++) {
    const { gate, after } = gateThenSync(session === 3 ? `Lesson-Cited: ${newcomer}` : 'Lesson-Check: none');
    assert.deepEqual(gate.stops, [], `session ${session}'s gate`);
    assert.deepEqual(view(after), view(gate), `the audit after session ${session}'s sync`);
  }
  // Session 7's gate ends its probation: the member limit and the automatic eviction show before the sync, so it lands in it.
  const due = audit({}, NO_LESSON);
  assert.equal(due.lessons.find((l) => l.id === newcomer).state, 'member');
  assert.deepEqual(due.stops, [`${RULES.memberSlots + 1} members — the limit is ${RULES.memberSlots}`]);
  assert.deepEqual(due.proposals, [`automatic: evict L-1 to the reference doc — ${newcomer} outranks it for the last member slot`]);
  repo.write('STACK.md', stackText({ lessons: [...members.slice(1), lesson(RULES.memberSlots + 1)] }));
  repo.write('docs/lessons-reference.md', referenceText(filed).replace('## L-1\n', '## L-1\n\nOutcome: evicted — 2026-09-18\n'));
  const { gate, after } = gateThenSync('Lesson-Check: none');
  assert.deepEqual(gate.stops, []);
  assert.deepEqual(view(after), view(gate), "the audit after session 7's sync");
});

test('duplicate IDs and a lesson list over 20 stop the commit', (t) => {
  const { repo, audit } = setup(t);
  repo.write('STACK.md', stackText({ lessons: [lesson(1), lesson(1, 'Same ID again.'), lesson(2)], fus: [1, 2, 3, 4, 5, 6].map((n) => fu(n)) }));
  const stops = audit().stops.join('\n');
  assert.match(stops, /duplicate ID L-1/);
  assert.match(stops, /duplicate ID FU-6/);
  const big = setup(t, { lessons: Array.from({ length: 21 }, (_, i) => lesson(i + 1)) });
  assert.match(big.audit().stops.join('\n'), /21 lessons listed — the limit is 20/);
});

test('footers: evidence is recorded; an unread, malformed or unknown-ID footer warns in its session and the next only', (t) => {
  const { repo, audit } = setup(t);
  repo.commit(`fix: guard\n\nThe lesson stopped a wrong plan step.\n\nLesson-Caught: L-1\n${CO}\n`, { 'a.txt': '1' });
  repo.commit(`fix: blank line\n\nBody.\n\nLesson-Cited: L-2\n\n${CO}\n`, { 'a.txt': '2' });
  repo.commit(`fix: unknown\n\nBody.\n\nLesson-Cited: L-99\n${CO}\n`, { 'a.txt': '3' });
  repo.commit(`fix: miscased\n\nBody.\n\nLesson-cited: L-2\n${CO}\n`, { 'a.txt': '4' });
  const r = audit();
  assert.equal(r.lessons[0].catches, 1);
  assert.equal(r.lessons[1].cites, 0);
  const warnings = r.warnings.join('\n');
  assert.match(warnings, /footers git didn't read.*Lesson-Cited: L-2/);
  assert.match(warnings, /Lesson-Cited names unknown ID L-99/);
  assert.match(warnings, /malformed ledger footer: Lesson-cited: L-2/);
  addSyncs(repo, 1);
  assert.match(audit().warnings.join('\n'), /names unknown ID L-99/);
  addSyncs(repo, 1);
  assert.doesNotMatch(audit().warnings.join('\n'), /didn't read|unknown ID|malformed ledger footer/);
});

test('an FU-Closed footer for a listed row stops until the row is removed', (t) => {
  const { repo, audit } = setup(t);
  repo.commit(`fix: thing 1\n\nDone.\n\nFU-Closed: FU-1\n${CO}\n`, { 'a.txt': '1' });
  assert.deepEqual(audit().stops, ['FU-1 has an FU-Closed footer but is still listed — remove the finished row, or if this row is new and reused a closed ID, give it a fresh ID with next-id fu']);
  repo.write('STACK.md', stackText({ fus: [2, 3, 4, 5].map((n) => fu(n)) }));
  assert.deepEqual(audit().stops, []);
});

test('the anchor-sweep note names older STACK FUs anchored to files changed since the last sync, committed or not', (t) => {
  const { repo, audit } = setup(t);
  const row = (n, file) => `- **FU-${n}** [perf · cleanup-light] Thing ${n} — home: Demo/2.4 {anchor: ${file} :: thing}`;
  const fus = [fu(1), fu(2), row(7, 'src/a.ts'), row(9, 'src/b.ts')];
  const standing = `${STANDING}- **FU-10** [perf · cleanup-light] Later — trigger: date 2027-01-01 {anchor: src/a.ts :: later}\n`;
  repo.commit('feat: anchored rows\n', { 'STACK.md': stackText({ fus }), 'Standing-FUs.md': standing, 'src/a.ts': 'thing\n', 'src/b.ts': 'thing\n' });
  addSyncs(repo, 1);
  const sweepNotes = () => audit().notes.filter((n) => n.startsWith('anchor sweep:'));
  // Nothing changed since the sync: no note.
  assert.deepEqual(sweepNotes(), []);
  // A committed edit to src/a.ts and an uncommitted one to src/b.ts; a row filed this session and a Standing row are left out.
  repo.commit('fix: a\n', { 'src/a.ts': 'thing\nmore\n', 'STACK.md': stackText({ fus: [...fus, row(8, 'src/a.ts')] }) });
  repo.write('src/b.ts', 'thing\nmore\n');
  assert.deepEqual(sweepNotes(), ["anchor sweep: 2 open STACK FU(s) filed before this session are anchored to files changed since the last sync: FU-7, FU-9 — a run's anchor sweep closes such a row or names why it stays (red-line-toolkit/reference/pipeline-shared.md § The anchor sweep)"]);
  // A row filed this session and not yet committed, as 6L-c writes one before 6L-d's report, is left out too.
  repo.write('STACK.md', stackText({ fus: [...fus, row(8, 'src/a.ts'), row(11, 'src/a.ts')] }));
  assert.match(sweepNotes()[0], /: FU-7, FU-9 —/);
  // A row the run closed is gone from STACK, so it leaves the note.
  repo.write('STACK.md', stackText({ fus: [fu(1), fu(2), row(9, 'src/b.ts'), row(8, 'src/a.ts')] }));
  assert.match(sweepNotes()[0], /^anchor sweep: 1 open STACK FU\(s\) .*: FU-9 —/);
});

test("an FU filed this session anchored to a file the session changed stops the commit, unless it's the owner's call", (t) => {
  const { repo, audit } = setup(t);
  const row = (n, file, reason = 'own run: later') => `- **FU-${n}** [perf · cleanup-light] Thing ${n} — why not now: ${reason} — home: Demo/2.4 {anchor: ${file} :: thing}`;
  const later = (n, tail) => `- **FU-${n}** [perf · cleanup-light] Later ${n} — ${tail} {anchor: src/a.ts :: thing}`;
  const older = [fu(1), fu(2), row(7, 'src/a.ts')];
  const files = { 'src/a.ts': 'thing\n', 'src/b.ts': 'thing\n', 'src/c.ts': 'thing\n' };
  repo.commit('feat: anchored rows\n', { ...files, 'STACK.md': stackText({ fus: older }), 'Standing-FUs.md': `${STANDING}${later(9, 'why not now: own run: later — trigger: date 2027-01-01')}\n` });
  addSyncs(repo, 1);
  const inArea = () => audit().stops.filter((s) => s.includes('filed this session in the area')).map((s) => s.split(' ')[0]);
  const sweepNote = () => audit().notes.find((n) => n.startsWith('anchor sweep:'));
  // A worktree run changes src/a.ts on its branch and is merged. Nothing filed yet: an older row in a changed file is the
  // anchor sweep's, not this stop's.
  repo.git('checkout', '-q', '-b', 'run');
  const side = repo.git('rev-parse', '--short', repo.commit('fix: a\n', { 'src/a.ts': 'thing\nmore\n' })).trim();
  repo.git('checkout', '-q', 'main');
  repo.git('merge', '-q', '--no-ff', '-m', 'Merge the run', 'run');
  const merge = repo.git('rev-parse', '--short', 'HEAD').trim();
  assert.deepEqual(inArea(), []);
  // A ledger commit after the merge files the run's leftovers, as a worktree run's are, and moves the fired Standing FU-9 into
  // STACK. FU-10 and FU-13 stop; FU-11's file is unchanged; FU-12 and FU-14 are the owner's call; FU-16's anchor is a ledger file,
  // which filing changes; FU-9 was listed at the sync, so it joins FU-7 in the anchor-sweep note instead.
  const filed = [row(10, 'src/a.ts'), row(11, 'src/c.ts'), row(12, 'src/a.ts', 'product: the owner picks the copy'), row(9, 'src/a.ts'), row(16, 'STACK.md')];
  const standing = `${STANDING}${later(13, 'why not now: risk: needs a new table — trigger: date 2027-01-01')}\n${later(14, 'trigger: owner decision — which copy?')}\n`;
  repo.commit("chore(stack): the run's leftovers\n", { 'STACK.md': stackText({ fus: [...older, ...filed] }), 'Standing-FUs.md': standing });
  assert.deepEqual(inArea(), ['FU-10', 'FU-13']);
  assert.match(sweepNote(), /: FU-7, FU-9 —/);
  // The stop names the merge, not the branch commit inside it, so the session can tell whose run's area it is.
  assert.ok(audit().stops.includes(`FU-10 was filed this session in the area the session changed (src/a.ts by ${merge}) — fix it in that run or this one; only the owner's call waits, as "why not now: product" or an owner decision (red-line-toolkit/reference/ledger-session.md § FUs)`));
  assert.ok(!audit().stops.some((s) => s.includes(side)));
  // A row written but not committed, anchored to an uncommitted change, stops too, as at /end-session before its commit.
  repo.write('src/b.ts', 'thing\nmore\n');
  repo.write('STACK.md', stackText({ fus: [...older, ...filed, row(15, 'src/b.ts')] }));
  assert.deepEqual(inArea(), ['FU-10', 'FU-15', 'FU-13']);
  assert.ok(audit().stops.some((s) => s.startsWith('FU-15 was filed this session in the area the session changed (src/b.ts by uncommitted edits) —')));
  // The guarded condition removed: with src/a.ts back to its content at the sync, the session didn't change it.
  repo.write('src/a.ts', 'thing\n');
  assert.deepEqual(inArea(), ['FU-15']);
});

test('the rows a migration commit renders after a legacy sync are no in-area filing', (t) => {
  // A legacy sync, then work on src/a.ts, then the migration commit, which renders FU-7 anchored to that file.
  const beforeMigration = (repo) => {
    repo.commit('feat: a\n', { 'src/a.ts': 'thing\n' });
    addSyncs(repo, 1);
    repo.commit('fix: a\n', { 'src/a.ts': 'thing\nmore\n' });
  };
  const { repo, project } = makeLedgerProject({ syncAfterMigration: false, beforeMigration });
  t.after(repo.cleanup);
  const rendered = stackText({ fus: [fu(1), `- **FU-7** [perf · cleanup-light] Thing 7 — why not now: own run: later — home: Demo/2.4 {anchor: src/a.ts :: thing}`] });
  repo.commit(`chore(stack): render the rows\n\nLedger-Migration: Demo\n${CO}\n`, { 'STACK.md': rendered });
  const r = auditProject({ project, processRoot: makeProcessRoot(t), today: '2026-09-10' });
  assert.deepEqual(r.stops.filter((s) => s.includes('filed this session in the area')), []);
  // It's an older row in a changed file, so the anchor-sweep note names it instead.
  assert.match(r.notes.find((n) => n.startsWith('anchor sweep:')) ?? '', /: FU-7 —/);
});

test('an ID is never issued again: a dropped or closed row keeps its ID taken, on a merged branch too; a closed ID is never unknown, and an ID named only in a commit body counts', (t) => {
  const { repo, audit } = setup(t);
  // No subject names the dropped or closed ID: commit bodies are scanned too, and would hide a history that forgot the row.
  repo.commit('docs(stack): drop a Standing row on purpose\n', { 'Standing-FUs.md': '# Standing FUs\n\n' });
  assert.equal(audit().nextIds.fu, 'FU-7');
  repo.commit(`fix: thing five\n\nDone.\n\nFU-Closed: FU-5\n${CO}\n`, { 'STACK.md': stackText({ fus: [1, 2, 3, 4].map((n) => fu(n)) }) });
  assert.doesNotMatch(audit().warnings.join('\n'), /unknown ID FU-5/);
  repo.commit('docs: note that FU-941 was closed before migration\n');
  assert.equal(audit().nextIds.fu, 'FU-942');
  // The branch adds and drops a row in each file, so the merge changes neither and HEAD's first-parent line never shows the rows.
  repo.git('checkout', '-q', '-b', 'side');
  repo.commit('docs(stack): park two rows on a branch\n', {
    'STACK.md': stackText({ fus: [1, 2, 3, 4, 942].map((n) => fu(n)) }),
    'Standing-FUs.md': '# Standing FUs\n\n- **FU-943** [perf · cleanup-light] Later — trigger: date 2027-01-01\n',
  });
  repo.commit(`fix: finish the parked work\n\nDone.\n\nFU-Closed: FU-942\n${CO}\n`, { 'STACK.md': stackText({ fus: [1, 2, 3, 4].map((n) => fu(n)) }), 'Standing-FUs.md': '# Standing FUs\n\n' });
  repo.git('checkout', '-q', 'main');
  repo.git('merge', '-q', '--no-ff', '-m', 'Merge branch side', 'side');
  const merged = audit();
  assert.equal(merged.nextIds.fu, 'FU-944', 'the Standing row the branch dropped is named nowhere else');
  assert.doesNotMatch(merged.warnings.join('\n'), /unknown ID FU-942/, 'the STACK row the branch closed was issued');
});

test('a group step at 5 FUs outside the step order stops, an empty Order cell included; a crossed-out row stops', (t) => {
  const { repo, audit } = setup(t);
  repo.write('docs/plan.md', '| Step | Scope |\n|---|---|\n| **2.1 Build** | x |\n');
  assert.match(audit().stops.join('\n'), /group step Demo\/2\.4 has 5 FUs and isn't in docs\/plan\.md/);
  repo.write('docs/plan.md', PLAN.replace('after 2.1', ''));
  assert.match(audit().stops.join('\n'), /group step Demo\/2\.4 has 5 FUs and isn't in docs\/plan\.md/);
  repo.write('docs/plan.md', PLAN);
  repo.write('STACK.md', stackText({ fus: [...[1, 2, 3, 4, 5].map((n) => fu(n)), '- ~~**FU-7** [perf · cleanup-light] done — home: Demo/2.4~~'] }));
  assert.match(audit().stops.join('\n'), /crossed-out or checked-off row/);
});

test("a group-step row too short to have an Order cell isn't scheduled: it warns, and the 5-FU stop fires", (t) => {
  const { repo, audit } = setup(t);
  repo.write('docs/plan.md', PLAN.replace('| 2.4 | perf | cleanup-light | after 2.1 |', '| 2.4 | perf | cleanup-light |'));
  const r = audit();
  assert.equal(r.groups[0].scheduled, false);
  assert.deepEqual(r.warnings, ["docs/plan.md: group step 2.4 row has no Order cell — it doesn't count as scheduled"]);
  assert.deepEqual(r.stops, ["group step Demo/2.4 has 5 FUs and isn't in docs/plan.md — add it to the step order, or split it, before committing"]);
});

test('rows stay in their own section: a second section stops, and so does a lesson or FU row anywhere else; a blockquoted example does not', (t) => {
  const { repo, audit } = setup(t);
  const rows = [...[1, 2, 3, 4, 5].map((n) => fu(n)), ...[7, 8, 9, 10].map((n) => fu(n, 'Demo/2.5'))];
  repo.write('STACK.md', `${stackText({ fus: rows })}## Follow-ups (continued)\n\n${fu(11, 'Demo/2.5')}\n`);
  assert.deepEqual(audit().stops, ['STACK.md has 2 "## Follow-ups" sections — merge them into one']);
  repo.write('STACK.md', `${stackText()}## Lessons (continued)\n\n${lesson(3)}\n`);
  assert.deepEqual(audit().stops, ['STACK.md has 2 "## Lessons" sections — merge them into one']);
  // Current location opens the file, so its first bullet is line 5.
  const withLocation = (bullets, lessons) => stackText({ lessons }).replace('## Phases', ['## Current location', '', ...bullets, '', '## Phases'].join('\n'));
  repo.write('STACK.md', withLocation([fu(7), `> ${fu(8)}`, '- Closed FU-3 and L-2 last session.']));
  assert.deepEqual(audit().stops, ['STACK.md line 5: an FU row outside "## Follow-ups" — move it into that section']);
  repo.write('STACK.md', withLocation([lesson(4)], [lesson(1), lesson(2), lesson(3)]));
  assert.deepEqual(audit().stops, ['STACK.md line 5: a lesson row outside "## Lessons" — move it into that section']);
});

test('a legacy /module-audit finding line stops once, bulleted or not, in STACK.md or the Standing file', (t) => {
  const { repo, audit } = setup(t);
  const legacy = 'src/components/billing/InvoiceForm.tsx:557 — medium — parseFloat(taxRate) || 7.25 accepts negative/unbounded rates; persists to Invoice — (from /module-audit 2026-05-18-billing)';
  repo.write('STACK.md', stackText({ fus: [...[1, 2, 3, 4, 5].map((n) => fu(n)), legacy, `- ${legacy}`] }));
  repo.write('Standing-FUs.md', `${STANDING}${legacy}\n- ${legacy}\n`);
  const stop = (file, n) => `${file} line ${n} is a legacy /module-audit finding — rewrite it as an FU row (red-line-toolkit/reference/ledger-session.md § FUs)`;
  assert.deepEqual(audit().stops, [stop('STACK.md', 22), stop('STACK.md', 23), stop('Standing-FUs.md', 4), stop('Standing-FUs.md', 5)]);
});

test('a count trigger or an anchor naming a directory is reported, not a crash', (t) => {
  const { repo, audit } = setup(t);
  repo.write('Standing-FUs.md', '# Standing FUs\n\n- **FU-6** [perf · cleanup-light] Third caller — trigger: count {anchor: docs :: /plan/} >= 3\n');
  repo.write('STACK.md', stackText({ fus: [...[1, 2, 3, 4, 5].map((n) => fu(n)), '- **FU-7** [perf · cleanup-light] Directory anchor — home: Demo/2.5 {anchor: docs :: /plan/}'] }));
  const r = audit();
  assert.match(r.stops.join('\n'), /FU-6 trigger can't be checked: docs is not a readable file/);
  assert.match(r.warnings.join('\n'), /anchor missing-file: docs :: \/plan\//);
});

test("a Standing row's trailing anchor is drift-checked; its count trigger's own anchor, which may match nothing yet, is not", (t) => {
  const { repo, audit } = setup(t);
  repo.write('Standing-FUs.md', '# Standing FUs\n\n- **FU-6** [perf · cleanup-light] Third caller — trigger: count {anchor: docs/plan.md :: /NoCallerYet/} >= 3 {anchor: src/gone.ts :: fetchB}\n');
  const r = audit();
  assert.deepEqual(r.stops, []);
  assert.match(r.warnings.join('\n'), /anchor missing-file: src\/gone\.ts :: fetchB/);
  assert.doesNotMatch(r.warnings.join('\n'), /NoCallerYet/);
  // STACK's manual anchors, one per fixture row, and the Standing row's trailing anchor.
  assert.equal(r.anchors.checked, 6);
});

test('an FU homed at a closed phase stops; a fired Standing trigger is never proposed into that closed group step', (t) => {
  const { repo, audit } = setup(t);
  repo.write('STACK.md', stackText({ phases: ['- [x] **P1 Setup**', '- [x] **P2 Build**'] }));
  repo.write('Standing-FUs.md', '# Standing FUs\n\n- **FU-6** [perf · change-heavy] Cache — trigger: date 2026-09-01\n');
  const r = audit();
  assert.match(r.stops.join('\n'), /FU homed at closed Demo\/2\.4/);
  assert.deepEqual(r.fired.map((f) => f.id), ['FU-6']);
  assert.match(r.proposals.join('\n'), /move FU-6 from Standing into a new perf group step in Demo's current phase/);
});

test('after triggers follow the latest valid Phase: footer: a closed phase of the current campaign fires; another campaign waits, even one worked earlier', (t) => {
  const { repo, audit } = setup(t);
  addSyncs(repo, 1, 'Lesson-Check: none\nPhase: Old/3\n');
  addSyncs(repo, 1);
  addSyncs(repo, 1, 'Lesson-Check: none\nPhase: 7\n');
  repo.write('Standing-FUs.md', [
    '# Standing FUs', '',
    '- **FU-6** [perf · cleanup-light] After setup — trigger: after Demo/1',
    '- **FU-7** [perf · cleanup-light] After the old campaign — trigger: after Old/9',
    '- **FU-8** [perf · cleanup-light] After the next campaign — trigger: after Next/1',
    '',
  ].join('\n'));
  const r = audit();
  assert.deepEqual(r.fired.map((f) => f.id), ['FU-6']);
  assert.deepEqual(r.stops, []);
  assert.match(r.warnings.join('\n'), /the last session commit's Phase: 7 isn't <Campaign>\/<Phase>/);
});

test("after a campaign switch the latest Phase: footer wins over the first: the new campaign's closed phase fires and the first campaign's waits", (t) => {
  const { repo, audit } = setup(t);
  addSyncs(repo, 1, 'Lesson-Check: none\nPhase: Next/1\n');
  repo.write('Standing-FUs.md', [
    '# Standing FUs', '',
    '- **FU-6** [perf · cleanup-light] After Demo setup — trigger: after Demo/1',
    '- **FU-7** [perf · cleanup-light] After Next setup — trigger: after Next/1',
    '',
  ].join('\n'));
  assert.deepEqual(audit().fired.map((f) => f.id), ['FU-7']);
});

test('a session commit with no Phase: footer and no lesson answer warns', (t) => {
  const { repo, audit } = setup(t);
  const [bare] = addSyncs(repo, 1, '');
  const w = audit().warnings.join('\n');
  assert.ok(w.includes(`the last session commit (${bare.slice(0, 7)}) has no Phase: footer`), w);
  assert.ok(w.includes(`the last session commit (${bare.slice(0, 7)}) has no lesson answer (Lesson-Caught, Lesson-Cited or Lesson-Check: none)`), w);
});

test('a squashed history loses the migration commit: a warning, and the migrated lessons count as probationers', (t) => {
  const { repo, audit } = setup(t);
  repo.git('checkout', '-q', '--orphan', 'squashed');
  repo.commit('Squashed commit of the following:\n\nEverything.\n');
  const r = audit({}, NO_LESSON);
  assert.match(r.warnings.join('\n'), /no Ledger-Migration commit is reachable from HEAD — was history squashed or rebased\? Migrated lessons now count as probationers/);
  assert.deepEqual(r.lessons.map((l) => l.state), ['probation', 'probation']);
  // No sync is left either, so until one lands they are lessons filed in the open session.
  assert.deepEqual(audit().lessons.map((l) => l.state), ['new', 'new']);
});

test("the previous session's override is reported first, so a second one can be refused", (t) => {
  const { repo, audit } = setup(t);
  assert.equal(audit().previousOverride, null);
  repo.commit(`chore(stack): end-session sync — Demo/2\n\nSession.\n\nLesson-Check: none\nOver-Limit-Override: suite red, fixing next session\nPhase: Demo/2\n${CO}\n`);
  const r = audit();
  assert.equal(r.previousOverride.reason, 'suite red, fixing next session');
  assert.match(r.warnings[0], /the previous session committed with Over-Limit-Override/);
});

test("an override two sessions ago isn't the previous session's: nothing is reported, so the next override isn't refused", (t) => {
  const { repo, audit } = setup(t);
  addSyncs(repo, 1, 'Lesson-Check: none\nOver-Limit-Override: suite red\nPhase: Demo/2\n');
  addSyncs(repo, 1);
  const r = audit();
  assert.equal(r.previousOverride, null);
  assert.deepEqual(r.warnings, []);
});

test('rulebook: 25 rules pass and more stop; a promoted lesson still in STACK warns; the next rule ID needs only the process repo', (t) => {
  const { audit } = setup(t);
  const rules = Array.from({ length: 26 }, (_, i) => `- **R-${i + 1}** Rule ${i + 1}. → reference/rules.md#r-${i + 1}`);
  assert.deepEqual(audit({ rules: rules.slice(0, 25) }).stops, [], 'the legal maximum of rulebook rows');
  assert.match(audit({ rules }).stops.join('\n'), /rulebook has 26 rules — the limit is 25/);
  const promoted = { rules: rules.slice(0, 1), promoted: '## R-1\n\nRule: Rule 1.\nSource: Demo L-2\n' };
  const r = audit(promoted);
  assert.match(r.warnings.join('\n'), /R-1 was promoted from L-2, which is still listed in STACK/);
  assert.equal(r.nextIds.rule, 'R-2');
  assert.equal(nextRuleId(makeProcessRoot(t, promoted)), 'R-2');
  assert.equal(nextRuleId(makeProcessRoot(t, { rulebook: null })), 'R-1');
});

test("a promotion record names its project: another project's L-2 promoted to a rule doesn't warn about this project's L-2", (t) => {
  const { audit } = setup(t);
  const rules = [1, 2].map((n) => `- **R-${n}** Rule ${n}. → reference/rules.md#r-${n}`);
  const promoted = '## R-1\n\nRule: Rule 1.\nSource: Other L-2\n\n## R-2\n\nRule: Rule 2.\nSource: Demo L-1\n';
  assert.deepEqual(audit({ rules, promoted }).warnings, ['R-2 was promoted from L-1, which is still listed in STACK — remove the lesson (the promotion committed in one repo only)']);
});

test('a missing ledger heading, Standing file or rulebook heading stops; a missing rulebook file just means no rules yet', (t) => {
  const { repo, audit } = setup(t);
  assert.deepEqual(audit({ rulebook: null }).stops, []);
  assert.deepEqual(audit({ rulebook: '# Rulebook\n\nNo rules section.\n' }).stops, ['CLAUDE.md (rulebook) has no "## Rules" heading']);
  repo.write('STACK.md', stackText().replace('## Lessons', '## Lesson').replace('## Follow-ups', '## Open follow-ups (phase-local)'));
  rmSync(join(repo.dir, 'Standing-FUs.md'));
  assert.deepEqual(audit().stops, [
    'STACK.md has no "## Lessons" heading — the lesson ledger can\'t be checked',
    'STACK.md has no "## Follow-ups" heading — the FU ledger can\'t be checked',
    'Standing-FUs.md not found — a migrated project needs one',
  ]);
});

test('a check candidate and a rulebook candidate reach the result as notes, never as warnings or stops', (t) => {
  const { repo, audit } = setup(t);
  addSyncs(repo, 1, 'Lesson-Cited: L-1\nLesson-Caught: L-2\nPhase: Demo/2\n');
  addSyncs(repo, 1, 'Lesson-Cited: L-1\nLesson-Caught: L-2\nPhase: Demo/3\n');
  addSyncs(repo, 1, 'Lesson-Cited: L-1\nPhase: Demo/3\n');
  const r = audit();
  assert.deepEqual(r.notes, [
    'L-1 cited 3 times with no catches — could become a check',
    'L-2 caught something in 2 phases — rulebook candidate (owner decides)',
  ]);
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(r.stops, []);
});

test('only a <Campaign>/<Phase> Phase: footer names a phase: catches under Phase: Demo/7 and Phase: 7 are one phase, and the bad value still warns', (t) => {
  const { repo, audit } = setup(t);
  addSyncs(repo, 1, 'Lesson-Caught: L-1\nPhase: Demo/7\n');
  addSyncs(repo, 1, 'Lesson-Caught: L-1\nPhase: 7\n');
  const r = audit();
  assert.deepEqual([...r.lessons[0].phases], ['Demo/7']);
  assert.deepEqual(r.notes, []);
  assert.deepEqual(r.warnings, ["the last session commit's Phase: 7 isn't <Campaign>/<Phase>"]);
});

test('a lesson evicted and filed again is counted as a revival and starts probation again', (t) => {
  const { repo, audit } = setup(t);
  repo.commit('docs(stack): evict L-2\n\nNo evidence.\n', { 'STACK.md': stackText({ lessons: [lesson(1)] }) });
  addSyncs(repo, 1);
  repo.commit('docs(stack): revive L-2\n\nIts problem came back.\n', { 'STACK.md': stackText() });
  const r = audit({}, NO_LESSON);
  assert.deepEqual(r.revivals.map((l) => `${l.id} ${l.revived}`), ['L-2 1']);
  assert.equal(r.lessons[1].state, 'probation');
  assert.deepEqual(r.stops, []);
});

test('a lesson that left STACK stops until its own reference entry has a plain Outcome: line; a bold one does not count', (t) => {
  const { repo, audit } = setup(t);
  // L-2 is last in the reference doc, so appended lines land in its entry; the L-1 variant puts an Outcome in the wrong entry.
  const withL2 = (lines) => `${referenceText(stackText())}\nRule: Rule number 2.\n${lines}`;
  const noOutcome = 'L-2 left STACK but its entry in docs/lessons-reference.md has no plain "Outcome: " line';
  // Uncommitted, as /end-session audits it: the row is gone from the working tree only.
  repo.write('STACK.md', stackText({ lessons: [lesson(1)] }));
  repo.write('docs/lessons-reference.md', withL2(''));
  assert.deepEqual(audit().stops, [noOutcome]);
  repo.write('docs/lessons-reference.md', withL2('\n**Outcome:** evicted — 2026-09-10\n'));
  assert.deepEqual(audit().stops, [`${noOutcome} ("**Outcome:**" in bold doesn't count)`]);
  repo.write('docs/lessons-reference.md', withL2('').replace('## L-1\n', '## L-1\n\nOutcome: evicted — 2026-09-10\n'));
  assert.deepEqual(audit().stops, [noOutcome]);
  repo.write('docs/lessons-reference.md', '# Lessons reference\n\n## L-1\n');
  assert.deepEqual(audit().stops, ['L-2 left STACK but has no "## L-2" entry in docs/lessons-reference.md — add one with its Outcome: line']);
  repo.write('docs/lessons-reference.md', withL2('\nOutcome: evicted — 2026-09-10\n'));
  assert.deepEqual(audit().stops, []);
});

test('removing a stray copy of a lesson row leaves its listing running: a migrated member stays a member, filed where it was', (t) => {
  const { repo, audit } = setup(t);
  repo.commit('docs(stack): note the lesson this session relied on\n', { 'STACK.md': withLocationBullet(stackText(), '- **L-2** relied on this session') });
  addSyncs(repo, 1);
  repo.commit('docs(stack): drop the note\n', { 'STACK.md': stackText() });
  for (let syncs = 0; syncs <= 8; syncs++) {
    if (syncs > 0) addSyncs(repo, 1);
    const l2 = audit().lessons.find((l) => l.id === 'L-2');
    assert.equal(`${l2.state} filed ${l2.filed}`, 'member filed 1', `after ${syncs} more syncs`);
  }
});

test('an eviction that leaves a lesson-row note stops on the note; once the note goes the listing has ended, and a revival starts probation', (t) => {
  const { repo, audit } = setup(t);
  const evicted = stackText({ lessons: [lesson(1)] });
  repo.commit('docs(stack): evict L-2\n', { 'STACK.md': withLocationBullet(evicted, '- **L-2** evicted to the reference doc') });
  assert.deepEqual(audit().stops, ['STACK.md line 5: a lesson row outside "## Lessons" — move it into that section']);
  repo.commit('docs(stack): drop the note\n', { 'STACK.md': evicted });
  assert.equal(listedSince(fileHistory(repo.dir, 'STACK.md'), LESSON_ROW_ID).has('L-2'), false);
  addSyncs(repo, 7);
  repo.commit('docs(stack): revive L-2\n\nIts problem came back.\n', { 'STACK.md': stackText() });
  const r = audit({}, NO_LESSON);
  assert.deepEqual(r.revivals.map((l) => `${l.id} ${l.revived}`), ['L-2 1']);
  assert.equal(`${r.lessons[1].state} filed ${r.lessons[1].filed}`, `probation filed ${r.openSession}`);
  assert.deepEqual(r.stops, []);
});

test("the stale-home check reads the current campaign from the Phase: footer, not the campaign with most homes; other campaigns' homes are a note", (t) => {
  const { repo, audit } = setup(t);
  repo.commit('docs(stack): file\n', { 'STACK.md': stackText({ fus: [...[1, 2, 3, 4, 5].map((n) => fu(n)), fu(7, 'Demo/1.2'),
    ...[8, 9, 10, 11].map((n) => fu(n, 'Next/1.1')), ...[12, 13, 14].map((n) => fu(n, 'Next/1.2'))] }) });
  const r = audit();
  const stale = r.stops.filter((s) => s.startsWith('FU homed at closed'));
  assert.equal(stale.length, 1);
  assert.match(stale[0], /Demo\/1\.2/);
  assert.deepEqual(r.notes, ["7 FU(s) homed in other campaigns (Next) aren't checked against Demo's phases"]);
});

test("a stale-home check that can't run stops instead of passing, and so does a checkbox phase line not in **P<n> form", (t) => {
  const { repo, audit } = setup(t);
  repo.write('STACK.md', stackText({ phases: [] }));
  const r = audit();
  assert.deepEqual(r.stops, ['stale-home check could not run: no "- [x] **P<n>" phase bullets found in STACK.md, so no phase can be seen as closed']);
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(r.staleHome, { verifiable: false, count: 0 });
  // Unbolded, a closed P2 would read as open and its FUs at Demo/2.4 would pass.
  repo.write('STACK.md', stackText({ phases: ['- [x] **P1 Setup**', '- [x] P2 Build'] }));
  assert.deepEqual(audit().stops, ['STACK.md line 6 looks like a phase line but isn\'t in "**P<n> …**" form — can\'t tell whether it\'s closed']);
});

test("a campaign's open first phase, with nothing closed yet, lets the stale-home check run: FUs homed in it pass with no stop and no warning", (t) => {
  const { repo, audit } = setup(t);
  repo.write('STACK.md', stackText({ phases: ['- [ ] **P1 Build** — IN PROGRESS'], fus: [1, 2, 3, 4].map((n) => fu(n, 'Demo/1.1')) }));
  const r = audit();
  assert.deepEqual(r.stops, []);
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(r.staleHome, { verifiable: true, count: 0 });
});

test("a campaign-close line isn't a phase line; a closed phase in another bullet style, marker, format or spelling stops instead of reading as open", (t) => {
  const { repo, audit } = setup(t);
  const unrecognized = 'STACK.md line 6 looks like a phase line but isn\'t in "**P<n> …**" form — can\'t tell whether it\'s closed';
  // The fixture's FUs sit at Demo/2.4. Read as open, a P2 closed in any of these forms would pass them unchecked.
  const closedP2Forms = [
    '* [x] **P2 Build**', '1. [x] **P2 Build**', '- ✅ **P2 Build**', '- ~~**P2 Build**~~',
    // Before the label: an emoji, ✅ with the variation selector editors insert, a link, emphasis or a code span.
    '- [x] 🏁 **P2 Build**', '- 🏁 **P2 Build**', '- ✅️ **P2 Build**', '- [x] ✅️ **P2 Build**', '- **✅ P2 Build**',
    '- [x] [**P2 Build**](docs/plan.md)', '- [x] **[P2 Build](docs/plan.md)**', '- [x] [P2 Build](docs/p2.md)',
    '- [x] ***P2 Build***', '- [x] __P2 Build__', '- [x] *P2 Build*', '- [x] `P2 Build`', '- [x] `P2` Build',
    // The label itself spelled another way.
    '- [x] **P 2 Build**', '- [x] **Phase-2 Build**', '- [x] **PHASE 2**', '- [x] **p2 Build**', '- [x] phase 2 Build',
  ];
  for (const closedP2 of closedP2Forms) {
    repo.write('STACK.md', stackText({ phases: ['- [x] **P1 Setup**', closedP2] }));
    const r = audit();
    assert.deepEqual(r.stops, [unrecognized], closedP2);
    assert.deepEqual(r.staleHome, { verifiable: true, count: 0 }, closedP2);
  }
  // A campaign close collapses Demo to one line and opens the next campaign's first phase.
  addSyncs(repo, 1, 'Lesson-Check: none\nPhase: Next/1\n');
  repo.write('STACK.md', stackText({ phases: ['- [x] **Demo** — COMPLETE (P1–P2)', '- [ ] **P1 Next** — IN PROGRESS'], fus: [1, 2, 3, 4].map((n) => fu(n, 'Next/1.1')) }));
  const closed = audit();
  assert.deepEqual(closed.stops, []);
  assert.deepEqual(closed.warnings, []);
});

const unnamed = (campaign) => `Phase: ${campaign} names a campaign no ## Phases label, home or step-order pointer in STACK.md names — fix the footer or the campaign name`;

test("a Phase: footer naming a campaign no Phases label, home or pointer names stops: every home would be checked against a campaign that doesn't exist", (t) => {
  const { repo, audit } = setup(t);
  assert.deepEqual(audit().stops, [], 'Phase: Demo/2 names the campaign STACK homes its FUs in');
  for (const campaign of ['Dmeo', 'Dem', 'demo']) {
    addSyncs(repo, 1, `Lesson-Check: none\nPhase: ${campaign}/2\n`);
    assert.deepEqual(audit().stops, [unnamed(campaign)], campaign);
  }
  addSyncs(repo, 1);
  assert.deepEqual(audit().stops, [], 'a later Phase: Demo/2 replaces the misspelling');
});

test("a near-miss campaign name in STACK's prose doesn't pass the misspelled-campaign stop: only a Phases label, a home or a step-order pointer names a campaign", (t) => {
  const { repo, audit } = setup(t);
  addSyncs(repo, 1, 'Lesson-Check: none\nPhase: Dmeo/2\n');
  repo.write('STACK.md', withLocationBullet(stackText(), '- Next: finish the Dmeo walkthrough'));
  assert.deepEqual(audit().stops, [unnamed('Dmeo')]);
  // Prose after a phase label is still prose.
  repo.write('STACK.md', stackText({ phases: ['- [x] **P1 Setup**', '- [ ] **P2 Build** — Dmeo walkthrough'] }));
  assert.deepEqual(audit().stops, [unnamed('Dmeo')]);
  // A Phases bullet labelled with the campaign names it, with no home or pointer of its own.
  repo.write('STACK.md', stackText({ phases: ['- [x] **P1 Setup**', '- [ ] **P2 Build** — IN PROGRESS', '- [ ] **Dmeo** — queued'] }));
  assert.deepEqual(audit().stops, []);
});

test("FUs still homed in a campaign STACK's phases mark closed stop, whether or not the next campaign's phases make the stale-home check readable", (t) => {
  const { repo, audit } = setup(t);
  const inClosed = (n) => `FU homed in closed campaign Demo (Demo/2.4) — carry it into the next campaign's group step, move it to Standing with a trigger, or drop it on purpose: ${fu(n)}`;
  // At the close: Demo's phases collapse to one line while the latest Phase: footer still names Demo.
  repo.write('STACK.md', stackText({ phases: ['- [x] **Demo** — COMPLETE (P1–P2)'] }));
  const atClose = audit();
  assert.deepEqual(atClose.stops, [1, 2, 3, 4, 5].map(inClosed));
  assert.deepEqual(atClose.staleHome, { verifiable: true, count: 5 });
  // The next campaign opens: its phase line makes the check readable, and Demo's leftover home still stops instead of passing as another campaign's.
  addSyncs(repo, 1, 'Lesson-Check: none\nPhase: Next/1\n');
  repo.write('STACK.md', stackText({ phases: ['- [x] **Demo** — COMPLETE (P1–P2)', '- [ ] **P1 Next** — IN PROGRESS'], fus: [fu(1, 'Next/1.1'), fu(2)] }));
  const next = audit();
  assert.deepEqual(next.stops, [inClosed(2)]);
  assert.deepEqual(next.notes, []);
});

test('missing docs are loud: an unreadable reference doc or step-order doc stops once, and a listed lesson with no reference entry warns', (t) => {
  const { repo, audit } = setup(t);
  const reference = join(repo.dir, 'docs', 'lessons-reference.md');
  const noReference = ['reference doc docs/lessons-reference.md is not a readable file'];
  rmSync(reference);
  const deleted = audit();
  assert.deepEqual(deleted.stops, noReference);
  assert.deepEqual(deleted.warnings, []);
  mkdirSync(reference);
  assert.deepEqual(audit().stops, noReference);
  rmSync(reference, { recursive: true });
  // An entry for L-20 is not one for L-2.
  repo.write('docs/lessons-reference.md', '# Lessons reference\n\n## L-1\n\n## L-20\n');
  const r = audit();
  assert.deepEqual(r.stops, []);
  assert.deepEqual(r.warnings, ['L-2 has no "## L-2" entry in docs/lessons-reference.md']);
  repo.write('docs/lessons-reference.md', referenceText(stackText()));
  rmSync(join(repo.dir, 'docs', 'plan.md'));
  const noStepOrder = ['step-order doc docs/plan.md is not a readable file'];
  repo.write('STACK.md', stackText({ fus: [1, 2, 3, 4].map((n) => fu(n)) }));
  assert.deepEqual(audit().stops, noStepOrder);
  repo.write('STACK.md', stackText());
  assert.deepEqual(audit().stops, noStepOrder);
});
