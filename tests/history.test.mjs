import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRepo } from './helpers/git-fixture.mjs';
import { CO } from './helpers/ledger-fixture.mjs';
import {
  EVENT_KIND, ITEM_ID, LESSON_ROW_ID, readCommits, unreadFooters, malformedFooters, assignSessions, phaseBySession,
  footerEvents, fileHistory, listedSince, listingStarts, lastTouchByHome, showAtHead,
} from '../lib/history.mjs';

const sync = (phase, footers = '') => `chore(stack): end-session sync — ${phase}\n\nSession.\n\n${footers}Phase: ${phase}\n${CO}\n`;
const stack = (rows) => `# STACK\n\n## Lessons\n\n${rows.join('\n')}\n`;

test('footers directly above Co-Authored-By are read; after a blank line git drops them', (t) => {
  const repo = makeRepo(); t.after(repo.cleanup);
  repo.commit(`feat: a\n\nBody.\n\nLesson-Caught: L-3\nFU-Closed: FU-10\n${CO}\n`, { 'a.txt': '1' });
  repo.commit(`feat: b\n\nBody.\n\nLesson-Cited: L-4\n\n${CO}\n`, { 'a.txt': '2' });
  const [a, b] = readCommits(repo.dir);
  assert.deepEqual(a.trailers.map((x) => x.key), ['Lesson-Caught', 'FU-Closed', 'Co-Authored-By']);
  assert.deepEqual(unreadFooters(a), []);
  assert.deepEqual(b.trailers.map((x) => x.key), ['Co-Authored-By']);
  assert.deepEqual(unreadFooters(b), ['Lesson-Cited: L-4']);
});

test('malformedFooters: a miscased or misspelled footer name, a footer naming no ID of its kind, or a Lesson-Check other than none', (t) => {
  const repo = makeRepo(); t.after(repo.cleanup);
  repo.commit(`fix: a\n\nBody.\n\nLesson-cited: L-3\nFU-Closed: 212\nLessons-Caught: L-4\nLesson-Cited: none\nLesson-Check: none\nLesson-Check: L-3\nPhase: Demo/1\n${CO}\n`, { 'a.txt': '1' });
  repo.commit(`fix: b\n\nBody.\n\nLesson-Caught: L-3, R-1\nFU-Closed: FU-12\n${CO}\n`, { 'a.txt': '2' });
  const [bad, good] = readCommits(repo.dir);
  assert.deepEqual(malformedFooters(bad), [
    'Lesson-cited: L-3 — footer names are case-sensitive; write Lesson-Cited',
    'FU-Closed: 212 — names no FU-<n> ID',
    'Lessons-Caught: L-4 — not a LedgerLoop footer name',
    'Lesson-Cited: none — names no L-<n> or R-<n> ID',
    'Lesson-Check: L-3 — takes only none',
  ]);
  assert.deepEqual(malformedFooters(good), []);
});

test('every evidence footer in EVENT_KIND has an ID rule: one naming no ID is reported', () => {
  const keys = Object.keys(EVENT_KIND);
  assert.notEqual(keys.length, 0);
  for (const key of keys) assert.equal(malformedFooters({ trailers: [{ key, value: 'nothing' }], body: '' }).length, 1, key);
});

test('sessions are numbered by end-session sync commits; later commits belong to the open session', (t) => {
  const repo = makeRepo(); t.after(repo.cleanup);
  const shas = [
    repo.commit('feat: one\n', { 'a.txt': '1' }),
    repo.commit(sync('Demo/1')),
    repo.commit('feat: two\n', { 'a.txt': '2' }),
    repo.commit(sync('Demo/2')),
    repo.commit('feat: three\n', { 'a.txt': '3' }),
  ];
  const commits = readCommits(repo.dir);
  const { sessionOf, closed, openSession } = assignSessions(commits);
  assert.deepEqual(shas.map((s) => sessionOf.get(s)), [1, 1, 2, 2, 3]);
  assert.equal(closed, 2);
  assert.equal(openSession, 3);
  assert.deepEqual([...phaseBySession(commits, sessionOf)], [[1, 'Demo/1'], [2, 'Demo/2']]);
});

test('footerEvents reads every ID in a footer, with its session', (t) => {
  const repo = makeRepo(); t.after(repo.cleanup);
  repo.commit(`fix: x\n\nBody.\n\nLesson-Cited: L-3, L-9\nFU-Closed: FU-12\n${CO}\n`, { 'a.txt': '1' });
  repo.commit(sync('Demo/1', 'Lesson-Caught: L-3\n'));
  const commits = readCommits(repo.dir);
  const { sessionOf } = assignSessions(commits);
  assert.deepEqual(
    footerEvents(commits, sessionOf).map((e) => `${e.kind} ${e.id} s${e.session}`),
    ['cited L-3 s1', 'cited L-9 s1', 'closed FU-12 s1', 'caught L-3 s1'],
  );
  assert.deepEqual('L-3, FU-12 and R-1, but not XL-4'.match(ITEM_ID), ['L-3', 'FU-12', 'R-1']);
});

test('listedSince keeps the start through a rewording and restarts after a removal; listingStarts counts every start', (t) => {
  const repo = makeRepo(); t.after(repo.cleanup);
  const c1 = repo.commit('docs: file L-1\n', { 'STACK.md': stack(['- **L-1** First wording. → r.md#l-1']) });
  const c2 = repo.commit('docs: reword L-1, file L-2\n', { 'STACK.md': stack(['- **L-1** Second wording. → r.md#l-1', '- **L-2** Other. → r.md#l-2']) });
  const beforeEviction = listedSince(fileHistory(repo.dir, 'STACK.md'), LESSON_ROW_ID);
  assert.equal(beforeEviction.get('L-1'), c1);
  repo.commit('docs: evict L-1\n', { 'STACK.md': stack(['- **L-2** Other. → r.md#l-2']) });
  const c4 = repo.commit('docs: revive L-1\n', { 'STACK.md': stack(['- **L-2** Other. → r.md#l-2', '- **L-1** Revived. → r.md#l-1']) });
  const history = fileHistory(repo.dir, 'STACK.md');
  const since = listedSince(history, LESSON_ROW_ID);
  assert.equal(since.get('L-1'), c4);
  assert.equal(since.get('L-2'), c2);
  assert.deepEqual([...listingStarts(history, LESSON_ROW_ID)], [['L-1', 2], ['L-2', 1]]);
});

test('fileHistory reads a merge commit against its first parent, so a row filed while resolving a conflict counts', (t) => {
  const repo = makeRepo(); t.after(repo.cleanup);
  const first = '- **L-1** First. → r.md#l-1';
  repo.commit('docs: file L-1\n', { 'STACK.md': stack([first]) });
  repo.git('checkout', '-q', '-b', 'side');
  repo.commit('docs: file L-2 on a branch\n', { 'STACK.md': stack([first, '- **L-2** Branch. → r.md#l-2']) });
  repo.git('checkout', '-q', 'main');
  repo.commit('docs: file L-3 on main\n', { 'STACK.md': stack([first, '- **L-3** Main. → r.md#l-3']) });
  assert.throws(() => repo.git('merge', '-q', 'side'));
  const merge = repo.commit('Merge branch side\n', {
    'STACK.md': stack([first, '- **L-3** Main. → r.md#l-3', '- **L-2** Branch. → r.md#l-2', '- **L-4** Filed while resolving. → r.md#l-4']),
  });
  assert.equal(listedSince(fileHistory(repo.dir, 'STACK.md'), LESSON_ROW_ID).get('L-4'), merge);
});

test('a lesson filed on a branch is listed from the merge, counted once, so its removal after the merge ends the listing', (t) => {
  const repo = makeRepo(); t.after(repo.cleanup);
  const first = '- **L-1** First. → r.md#l-1';
  const branch = '- **L-2** Branch. → r.md#l-2';
  repo.commit('docs: file L-1\n', { 'STACK.md': stack([first]) });
  repo.git('checkout', '-q', '-b', 'side');
  repo.commit('docs: file L-2 on a branch\n', { 'STACK.md': stack([first, branch]) });
  repo.git('checkout', '-q', 'main');
  repo.commit('feat: unrelated\n', { 'a.txt': '1' });
  repo.git('merge', '-q', '--no-ff', '-m', 'Merge branch side', 'side');
  const merge = repo.git('rev-parse', 'HEAD').trim();
  assert.equal(listedSince(fileHistory(repo.dir, 'STACK.md'), LESSON_ROW_ID).get('L-2'), merge);
  repo.commit('docs: evict L-2\n', { 'STACK.md': stack([first]) });
  assert.equal(listedSince(fileHistory(repo.dir, 'STACK.md'), LESSON_ROW_ID).has('L-2'), false);
  const revived = repo.commit('docs: revive L-2\n', { 'STACK.md': stack([first, branch]) });
  const history = fileHistory(repo.dir, 'STACK.md');
  assert.equal(listedSince(history, LESSON_ROW_ID).get('L-2'), revived);
  assert.equal(listingStarts(history, LESSON_ROW_ID).get('L-2'), 2);
});

test('lastTouchByHome records the last commit that changed a row homed at each group step, split halves apart', (t) => {
  const repo = makeRepo(); t.after(repo.cleanup);
  const row = (n, home, anchor = ' {anchor: manual}') => `- **FU-${n}** [perf · cleanup-light] Thing ${n} — home: ${home}${anchor}`;
  const rows = [row(1, 'Demo/1.2'), row(2, 'Demo/1.3')];
  const c1 = repo.commit('docs: file\n', { 'STACK.md': `${rows.join('\n')}\n` });
  rows.push(row(3, 'Demo/1.3'));
  const c2 = repo.commit('docs: file\n', { 'STACK.md': `${rows.join('\n')}\n` });
  rows.push(row(4, 'Demo/1.3-M', ''));
  const c3 = repo.commit('docs: file into a split half\n', { 'STACK.md': `${rows.join('\n')}\n` });
  assert.deepEqual([...lastTouchByHome(fileHistory(repo.dir, 'STACK.md'))], [['Demo/1.2', c1], ['Demo/1.3', c2], ['Demo/1.3-M', c3]]);
});

test('showAtHead returns the committed text, or null for a file HEAD does not have', (t) => {
  const repo = makeRepo(); t.after(repo.cleanup);
  repo.commit('docs: a\n', { 'a.txt': 'hello\n' });
  assert.equal(showAtHead(repo.dir, 'a.txt'), 'hello\n');
  assert.equal(showAtHead(repo.dir, 'missing.md'), null);
});
