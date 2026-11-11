import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PILOT, RULES } from '../lib/rules.mjs';
import { pilotProject } from '../lib/pilot.mjs';
import { formatPilot } from '../lib/format.mjs';
import { CO, STANDING, addSyncs, fu, lesson, makeLedgerProject, referenceText, stackText } from './helpers/ledger-fixture.mjs';

const CHECK = {
  sessions: `at least ${PILOT.minSessions} sessions since migration`,
  filed: `no session filed more than ${RULES.lessonsFiledPerSession} lesson`,
  answers: 'every session commit carries a Phase: footer and a lesson answer',
  closed: 'an FU-Closed footer was recorded',
  stops: 'the audit has no stops',
  entries: 'every lesson ID has a reference entry, with an Outcome once it left',
  earned: 'a lesson filed after migration became a member on recorded evidence',
  rows: 'every FU row is well-formed, with a home or a trigger, and none is crossed out or checked off',
};

function setup(t, fixture = {}) {
  const { repo, project } = makeLedgerProject(fixture);
  t.after(repo.cleanup);
  const root = mkdtempSync(join(tmpdir(), 'ledger-pilot-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'reference'));
  writeFileSync(join(root, 'CLAUDE.md'), '# Rulebook\n\n## Rules\n');
  writeFileSync(join(root, 'reference', 'rules.md'), '# Rules reference\n');
  return { repo, pilot: (options = {}) => pilotProject({ project, processRoot: root, today: '2026-09-10', ...options }) };
}

const failing = (p) => p.checks.filter((c) => !c.pass).map((c) => c.name);
const session = (footers) => `chore(stack): end-session sync — Demo/2\n\nSession.\n\n${footers}${CO}\n`;
const flow = (s) => ({ filed: s.filed, closed: s.closed, dropped: s.dropped, stack: s.stack, standing: s.standing });
const overhead = (s) => ({ commits: s.commits, paperworkCommits: s.paperworkCommits, workLines: s.workLines, paperworkLines: s.paperworkLines });

test('straight after migration the pilot fails only on sessions run, an FU-Closed footer and a lesson earning membership', (t) => {
  const { pilot } = setup(t);
  const p = pilot();
  assert.deepEqual(failing(p), [CHECK.sessions, CHECK.closed, CHECK.earned]);
  assert.equal(p.sessions, 1);
  assert.match(formatPilot(p), /\nPILOT FAILED: 3 check\(s\)$/);
});

test('a pilot that ran its sessions passes: a lesson filed after migration earned membership on a footer, and an FU closed', (t) => {
  const { repo, pilot } = setup(t);
  const stack = stackText({ lessons: [lesson(1), lesson(2), lesson(3)], fus: [1, 2, 3, 4].map((n) => fu(n)) });
  // The work commit and the session commit both carry FU-5's footer; the check lists it once.
  repo.commit(`fix: finish FU-5\n\nDone.\n\nFU-Closed: FU-5\n${CO}\n`);
  repo.commit(session('Lesson-Check: none\nFU-Closed: FU-5\nPhase: Demo/2\n'), { 'STACK.md': stack, 'docs/lessons-reference.md': referenceText(stack) });
  addSyncs(repo, 1, 'Lesson-Cited: L-3\nPhase: Demo/2\n');
  addSyncs(repo, PILOT.minSessions - 3);
  const p = pilot();
  assert.deepEqual(failing(p), []);
  assert.equal(p.sessions, PILOT.minSessions);
  assert.equal(p.checks.find((c) => c.name === CHECK.closed).detail, 'FU-5');
  const text = formatPilot(p);
  assert.match(text, /\nOUTCOMES /);
  assert.match(text, /FU backlog +5 STACK \+ 1 Standing at migration → 4 STACK \+ 1 Standing after session 10 · filed 0 · closed 1 · dropped 0 · net -1\n/);
  assert.match(text, /\nPILOT PASSED$/);
});

test('two lessons filed in one session, a session commit with no lesson answer, a crossed-out row and a lesson that left without an Outcome each fail their check', (t) => {
  const { repo, pilot } = setup(t);
  const stack = stackText({
    lessons: [lesson(1), lesson(3), lesson(4)],
    fus: [...[1, 2, 3, 4, 5].map((n) => fu(n)), '- ~~**FU-9** [perf · cleanup-light] Old — home: Demo/2.4 {anchor: manual}~~'],
  });
  repo.commit(session('Phase: Demo/2\n'), { 'STACK.md': stack, 'docs/lessons-reference.md': `${referenceText(stack)}\n## L-2\n\nRule: gone without a trace\n` });
  const p = pilot();
  const failed = failing(p);
  for (const name of [CHECK.filed, CHECK.answers, CHECK.stops, CHECK.entries, CHECK.rows]) assert.ok(failed.includes(name), name);
  assert.equal(p.checks.find((c) => c.name === CHECK.entries).detail, 'L-2 has no Outcome');
});

test('a lesson ID with no reference entry at all fails the entry check, even though nothing listed needs it', (t) => {
  const { repo, pilot } = setup(t);
  const stack = stackText({ lessons: [lesson(1), lesson(3)] });
  repo.commit(session('Lesson-Check: none\nPhase: Demo/2\n'), { 'STACK.md': stack, 'docs/lessons-reference.md': referenceText(stack) });
  const entries = pilot().checks.find((c) => c.name === CHECK.entries);
  assert.deepEqual([entries.pass, entries.detail], [false, 'L-2 has no entry']);
});

test('a Lessons section over its byte budget fails the size check, naming its byte count', (t) => {
  const { pilot } = setup(t);
  const size = pilot({ pilot: { ...PILOT, lessonSectionBytes: 10 } }).checks.find((c) => c.name === 'the Lessons section within 10 bytes');
  assert.equal(size.pass, false);
  const [, bytes] = size.detail.match(/^(\d+) bytes$/) ?? [];
  assert.ok(Number(bytes) > 10, size.detail);
});

test('a project with no Ledger-Migration commit fails its one check instead of reading the whole history as the pilot', (t) => {
  const { repo, pilot } = setup(t);
  repo.git('checkout', '-q', '--orphan', 'fresh');
  repo.commit(session('Lesson-Check: none\nPhase: Demo/2\n'));
  const p = pilot();
  assert.deepEqual(p.checks.map((c) => `${c.name} ${c.pass}`), ['a Ledger-Migration commit is reachable from HEAD false']);
  assert.equal(p.outcomes, null);
});

test('outcomes: each session counts FUs filed, closed by footer and dropped without one; a row moved between STACK and Standing is none of them', (t) => {
  const { repo, pilot } = setup(t);
  const stack = stackText({ fus: [1, 3, 7].map((n) => fu(n)) });
  repo.commit(session('Lesson-Check: none\nFU-Closed: FU-2\nPhase: Demo/2\n'), {
    'STACK.md': stack,
    'Standing-FUs.md': `${STANDING}- **FU-4** [perf · cleanup-light] Thing 4 — trigger: date 2027-01-01\n`,
  });
  const { atMigration, sessions } = pilot().outcomes;
  assert.deepEqual(atMigration, { stack: 5, standing: 1 });
  assert.deepEqual(sessions.map(flow), [
    { filed: [], closed: [], dropped: [], stack: 5, standing: 1 },
    { filed: ['FU-7'], closed: ['FU-2'], dropped: ['FU-5'], stack: 3, standing: 2 },
  ]);
});

test('outcomes: a session splits its commits and changed lines into work and paperwork — the ledger files and docs/plans markdown, renames included', (t) => {
  const { repo, pilot } = setup(t);
  repo.commit('feat: code\n', { 'src/app.ts': 'a\nb\nc\n', 'docs/guide.md': 'g\n' });
  repo.commit('docs(plan): a plan\n', { 'docs/plans/p.md': 'x\ny\n' });
  repo.commit('feat: code and its plan\n', { 'src/b.ts': 'd\n', 'docs/plans/p.md': 'x\ny\nz\n', 'Standing-FUs.md': `${STANDING}\n` });
  mkdirSync(join(repo.dir, 'docs/plans/archive'));
  // git prints this move as docs/plans/{ => archive}/p.md, which reads as a plan either way…
  repo.git('mv', 'docs/plans/p.md', 'docs/plans/archive/p.md');
  repo.commit('docs(plans): archive a finished plan\n');
  // …and this rename as docs/plans/archive/{p.md => done-p.md}, which reads as a plan only at its new name.
  repo.git('mv', 'docs/plans/archive/p.md', 'docs/plans/archive/done-p.md');
  repo.commit('docs(plans): rename the archived plan\n');
  addSyncs(repo, 1);
  // Five commits changed files (the sync is empty): work 3+1 and 1 line; paperwork 2, 1+1 and two 0-line renames.
  assert.deepEqual(overhead(pilot().outcomes.sessions.at(-1)), { commits: 5, paperworkCommits: 3, workLines: 5, paperworkLines: 4 });
});

test('outcomes: the baseline is the last baselineSessions sessions before migration, and neither side counts the migration commit or the work just before it', (t) => {
  const { pilot } = setup(t, {
    beforeMigration: (repo) => {
      repo.commit('feat: one\n', { 'src/a.ts': 'a\n' });
      addSyncs(repo, 1);
      repo.commit('feat: two\n', { 'src/b.ts': 'b\nb\n' });
      addSyncs(repo, 1);
      repo.commit('docs(plan): three\n', { 'docs/plans/q.md': 'q\nq\nq\n' });
      addSyncs(repo, 1);
      repo.commit('docs(plan): the migration plan\n', { 'docs/plans/m.md': 'm\n' });
    },
  });
  const { baseline, sessions } = pilot({ pilot: { ...PILOT, baselineSessions: 2 } }).outcomes;
  assert.deepEqual(baseline, { sessions: 2, commits: 2, paperworkCommits: 1, workLines: 2, paperworkLines: 3 });
  // The first pilot session is the fixture's empty sync: the migration commit (which changes docs/plan.md, work) is outside it.
  assert.deepEqual(overhead(sessions[0]), { commits: 0, paperworkCommits: 0, workLines: 0, paperworkLines: 0 });
});
