import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RULES } from '../lib/rules.mjs';
import { CO, STANDING, addSyncs, fu, lesson, makeLedgerProject, referenceText, stackText } from './helpers/ledger-fixture.mjs';

const CLI = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'ledger.mjs');

// Every test gets its own projects file and an empty process root, so no test reads real config.
function setup(t, { migrated = true } = {}) {
  const { repo, project } = makeLedgerProject();
  const dir = mkdtempSync(join(tmpdir(), 'ledger-cli-'));
  t.after(() => { repo.cleanup(); rmSync(dir, { recursive: true, force: true }); });
  const projectsFile = join(dir, 'projects.json');
  const entry = { ...project, migrated };
  writeFileSync(projectsFile, JSON.stringify({ projects: [entry] }));
  const env = { ...process.env, LEDGER_PROJECTS: projectsFile, LEDGER_TODAY: '2026-09-10', LEDGER_PROCESS_ROOT: dir };
  const run = (args, cwd = repo.dir, cli = CLI, extraEnv = {}) => spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', env: { ...env, ...extraEnv } });
  return { repo, dir, projectsFile, entry, run };
}

test('mode reports migrated, not migrated and not a stack project; unmigrated projects are left alone', (t) => {
  const migrated = setup(t);
  assert.equal(migrated.run(['mode']).stdout.trim(), 'LEDGER: migrated (Demo)');
  assert.equal(migrated.run(['mode'], migrated.dir).stdout.trim(), 'LEDGER: not a stack project');
  const legacy = setup(t, { migrated: false });
  assert.equal(legacy.run(['mode']).stdout.trim(), 'LEDGER: not migrated (Demo)');
  const report = legacy.run(['report']);
  assert.equal(report.status, 0);
  assert.match(report.stdout, /not migrated \(Demo\) — LedgerLoop checks don't apply here yet/);
  assert.equal(legacy.run(['audit']).status, 0);
  // The anchor sweep doesn't run in a legacy ledger or outside a Stack project.
  const legacySweep = legacy.run(['anchored']);
  assert.equal(legacySweep.status, 0);
  assert.match(legacySweep.stdout, /^LEDGER: not migrated \(Demo\)/);
  assert.doesNotMatch(legacySweep.stdout, /ANCHORED/);
  assert.equal(migrated.run(['anchored'], migrated.dir).stdout.trim(), 'LEDGER: not a stack project');
});

test('a git worktree of a Stack project counts as that project, and the audit reads the worktree files', (t) => {
  const { repo, dir, run } = setup(t);
  const worktree = join(dir, 'worktree');
  repo.git('worktree', 'add', '-q', '--detach', worktree);
  writeFileSync(join(worktree, 'STACK.md'), stackText({ lessons: [lesson(1), lesson(2), lesson(3)] }));
  assert.equal(run(['mode'], worktree).stdout.trim(), 'LEDGER: migrated (Demo)');
  assert.match(run(['report'], worktree).stdout, /^ {2}L-3 +new/m);
  assert.doesNotMatch(run(['report']).stdout, /^ {2}L-3 /m);
});

test('report prints the LIMITS line from lib/rules.mjs, then the ledger; a candidate flag prints under NOTES, not WARNINGS; summary is one line; both exit 0', (t) => {
  const { repo, run } = setup(t);
  const report = run(['report']);
  assert.equal(report.status, 0);
  assert.match(report.stdout, /LEDGER REPORT — Demo · session 2/);
  const r = RULES;
  assert.equal(report.stdout.split('\n')[3], `LIMITS  lessons ${r.lessonSlots} · members ${r.memberSlots} · probation ${r.probationSlots} for ${r.probationSessions} sessions · filed per session ${r.lessonsFiledPerSession} · rule ${r.ruleMaxChars} chars · evidence window ${r.evidenceWindowSessions} sessions · group step scheduled at ${r.groupStepScheduleAt} FUs · idle after ${r.groupStepIdleSessions} sessions · rulebook ${r.rulebookMax}`);
  assert.match(report.stdout, /on probation · 0 revived\)/);
  assert.match(report.stdout, /L-1 +member/);
  assert.match(report.stdout, /Demo\/2\.4 .* 5 FUs +scheduled/);
  assert.match(report.stdout, /\nWARNINGS \(0\)\n {2}\(none\)\n\nNOTES \(0\)\n {2}\(none\)\n\nPROPOSED ACTIONS\n/);
  assert.match(report.stdout, /NEXT IDS +L-3 · FU-7/);
  assert.match(run(['report', '--summary']).stdout, /^LEDGER Demo — lessons: 2 members, 0 on probation · group steps: 1/);
  addSyncs(repo, 3, 'Lesson-Cited: L-1\nPhase: Demo/2\n');
  assert.match(run(['report']).stdout, /\nWARNINGS \(0\)\n {2}\(none\)\n\nNOTES \(1\)\n {2}· L-1 cited 3 times with no catches — could become a check\n\nPROPOSED ACTIONS\n/);
});

test('audit exits 1 on a stop; one override is accepted, a second in a row is refused', (t) => {
  const { repo, run } = setup(t);
  const passed = run(['audit']);
  assert.equal(passed.status, 0);
  assert.match(passed.stdout, /AUDIT PASSED/);
  repo.write('STACK.md', stackText({ lessons: [lesson(1), lesson(2), lesson(3), lesson(4)] }));
  const failed = run(['audit']);
  assert.equal(failed.status, 1);
  assert.match(failed.stdout, /⛔ 2 lessons filed this session/);
  assert.match(failed.stdout, /AUDIT FAILED: 1 stop/);
  const accepted = run(['audit', '--override', 'two lessons, pruning next session']);
  assert.equal(accepted.status, 0);
  assert.match(accepted.stdout, /OVERRIDE ACCEPTED/);
  assert.match(accepted.stdout, /Over-Limit-Override: two lessons, pruning next session/);
  assert.equal(run(['audit', '--override']).status, 2);
  repo.commit(`chore(stack): end-session sync — Demo/2\n\nSession.\n\nLesson-Check: none\nOver-Limit-Override: two lessons, pruning next session\nPhase: Demo/2\n${CO}\n`);
  repo.write('STACK.md', stackText({
    lessons: [lesson(1), lesson(2), lesson(3), lesson(4)],
    fus: [...[1, 2, 3, 4, 5].map((n) => fu(n)), '- ~~**FU-7** [perf · cleanup-light] done — home: Demo/2.4~~'],
  }));
  const refused = run(['audit', '--override', 'again']);
  assert.equal(refused.status, 1);
  assert.match(refused.stdout, /OVERRIDE REFUSED/);
});

test("--evidence passes the session's lesson answer to report and audit; the report lists it under LESSONS; any other footer exits 2", (t) => {
  const { repo, run } = setup(t);
  const filed = stackText({ lessons: [lesson(1), lesson(2), lesson(3)] });
  repo.commit('docs(stack): file L-3\n\nFiled.\n', { 'STACK.md': filed, 'docs/lessons-reference.md': referenceText(filed) });
  addSyncs(repo, 5);
  // Session 7 decides L-3: without --evidence the audit finds what session 6's sync left, L-3 still on probation.
  assert.equal(run(['audit']).status, 0);
  assert.equal(run(['audit', '--evidence', 'Lesson-Check: none']).status, 1);
  const passed = run(['audit', '--evidence', 'Lesson-Cited: L-3']);
  assert.equal(passed.status, 0);
  assert.match(passed.stdout, /\nAUDIT PASSED/);
  const report = run(['report', '--evidence', 'Lesson-Cited: L-3', '--evidence', 'Lesson-Check: none']);
  assert.equal(report.status, 0);
  const lines = report.stdout.split('\n');
  assert.equal(lines[1], "LEDGER REPORT — Demo · session 7 · clocks through session 7's sync");
  assert.equal(run(['report']).stdout.split('\n')[1], "LEDGER REPORT — Demo · session 7 · clocks through session 6's sync");
  const header = lines.findIndex((l) => l.startsWith('LESSONS  ('));
  assert.equal(lines[header + 1], '  pending this session: Lesson-Cited L-3, Lesson-Check none');
  assert.match(lines[header + 2], /^ {2}L-1 +member/);
  assert.doesNotMatch(run(['report']).stdout, /pending this session/);
  assert.match(run(['report', '--summary', '--evidence', 'Lesson-Cited: L-3']).stdout, /^LEDGER Demo — lessons: 3 members, 0 on probation · .* · stops: 0 · warnings: 0\n$/);
  for (const bad of [['--evidence', 'FU-Closed: FU-1'], ['--evidence', 'lesson-cited: L-3'], ['--evidence', 'L-3'], ['--evidence']]) {
    for (const command of ['report', 'audit']) {
      const refused = run([command, ...bad]);
      assert.equal(refused.status, 2, `${command} ${bad.join(' ')}`);
      assert.equal(refused.stdout, '');
      assert.equal(refused.stderr, '--evidence takes Lesson-Caught, Lesson-Cited or Lesson-Check footers\n');
    }
  }
});

test('next-id prints the next free ID, and next-id rule works from any directory; bad input exits 2', (t) => {
  const { dir, run } = setup(t);
  assert.equal(run(['next-id', 'lesson']).stdout.trim(), 'L-3');
  assert.equal(run(['next-id', 'fu']).stdout.trim(), 'FU-7');
  writeFileSync(join(dir, 'CLAUDE.md'), '# Global rulebook\n\n## Rules\n\n- **R-3** Rule three. → reference/rules.md#r-3\n');
  assert.equal(run(['next-id', 'rule'], dir).stdout.trim(), 'R-4');
  const outside = run(['next-id', 'fu'], dir);
  assert.equal(outside.status, 2);
  assert.equal(outside.stdout.trim(), 'LEDGER: not a stack project');
  assert.equal(run(['next-id', 'banana']).status, 2);
  assert.equal(run(['frobnicate']).status, 2);
  // Names every object inherits are not ID kinds either: a plain lookup would print a function or {}.
  for (const kind of ['constructor', '__proto__', 'toString']) {
    const inherited = run(['next-id', kind]);
    assert.equal(inherited.status, 2, kind);
    assert.equal(inherited.stdout, '', kind);
    assert.match(inherited.stderr, /^usage: ledger\.mjs mode \| report/, kind);
  }
});

test('a git failure exits 3; only a directory with no repository anywhere above it is not a stack project', (t) => {
  const { repo, dir, run } = setup(t);
  const plain = run(['mode'], dir);
  assert.equal(plain.status, 0);
  assert.equal(plain.stdout.trim(), 'LEDGER: not a stack project');
  writeFileSync(join(repo.dir, '.git', 'config'), '[core\n');
  for (const command of ['mode', 'report', 'audit']) {
    const broken = run([command]);
    assert.equal(broken.status, 3, command);
    assert.match(broken.stdout, /^LEDGER ERROR: git rev-parse failed/, command);
  }
  // A .git file pointing at a deleted directory also makes git say "not a git repository"; that checkout is broken, not absent.
  const orphan = join(dir, 'orphan');
  mkdirSync(orphan);
  writeFileSync(join(orphan, '.git'), 'gitdir: /nonexistent/worktrees/orphan\n');
  const orphaned = run(['mode'], orphan);
  assert.equal(orphaned.status, 3);
  assert.match(orphaned.stdout, /^LEDGER ERROR: git rev-parse failed \(exit 128\): fatal: not a git repository/);
  // The calls after the probe fail closed too: a git that answers the probe, then fails.
  const bin = join(dir, 'bin');
  mkdirSync(bin);
  writeFileSync(join(bin, 'git'), '#!/bin/sh\n[ "$2" = --is-inside-work-tree ] && echo true && exit 0\necho "fatal: simulated" >&2\nexit 128\n', { mode: 0o755 });
  const later = run(['mode'], dir, CLI, { PATH: `${bin}:${process.env.PATH}` });
  assert.equal(later.status, 3);
  assert.match(later.stdout, /^LEDGER ERROR: Command failed: git rev-parse --show-toplevel/);
});

test('a bare checkout exits 3, since a work tree git won\'t show must not pass for "not a stack project"; inside .git still is not one', (t) => {
  const { repo, run } = setup(t);
  assert.equal(run(['mode'], join(repo.dir, '.git')).stdout.trim(), 'LEDGER: not a stack project');
  repo.git('config', 'core.bare', 'true');
  const bare = run(['mode']);
  assert.equal(bare.status, 3);
  assert.equal(bare.stdout.trim(), `LEDGER ERROR: git rev-parse: ${realpathSync(repo.dir)} is not inside a work tree`);
});

test('an unknown flag exits 2 with the usage text before the project lookup: a misspelt --evidence would otherwise run the audit without it', (t) => {
  const { repo, run } = setup(t);
  const usage = 'usage: ledger.mjs mode | report [--summary] | audit [--override "<reason>"] | next-id lesson|fu|rule | pilot | checks | anchored [<file>…]\n';
  const refused = (args) => {
    const result = run(args);
    assert.equal(result.status, 2, args.join(' '));
    assert.equal(result.stdout, '', args.join(' '));
    assert.equal(result.stderr, usage, args.join(' '));
  };
  for (const args of [
    ['audit', '--evidence=Lesson-Cited: L-3'], ['audit', '--evidences', 'Lesson-Cited: L-3'], ['report', '-evidence', 'Lesson-Cited: L-3'], ['mode', '--verbose'],
    ['report', '--override', 'reason'], ['audit', '--summary'], ['next-id', 'fu', '--verbose'], ['next-id', 'rule', '--verbose'], ['anchored', '--all'],
  ]) refused(args);
  // A flag's value is never read as a flag.
  const dashed = run(['audit', '--override', '-1 stop, fixed next session']);
  assert.equal(dashed.status, 0);
  assert.match(dashed.stdout, /\nAUDIT PASSED/);
  // Before the lookup: a broken repository still gets the usage error, not LEDGER ERROR.
  writeFileSync(join(repo.dir, '.git', 'config'), '[core\n');
  refused(['mode', '--verbose']);
});

test('a checkout with STACK.md that no projects.json entry points at is an error; without STACK.md it is not a stack project', (t) => {
  const { repo, dir, projectsFile, entry, run } = setup(t);
  const expected = `LEDGER ERROR: STACK.md at ${realpathSync(repo.dir)} but no projects.json entry points at this checkout — register the project or fix its path in ${projectsFile}`;
  writeFileSync(projectsFile, JSON.stringify({ projects: [] }));
  const unregistered = run(['mode']);
  assert.equal(unregistered.status, 3);
  assert.equal(unregistered.stdout.trim(), expected);
  writeFileSync(projectsFile, JSON.stringify({ projects: [{ ...entry, path: join(dir, 'moved') }] }));
  const moved = run(['mode']);
  assert.equal(moved.status, 3);
  assert.equal(moved.stdout.trim(), expected);
  rmSync(join(repo.dir, 'STACK.md'));
  const noStack = run(['mode']);
  assert.equal(noStack.status, 0);
  assert.equal(noStack.stdout.trim(), 'LEDGER: not a stack project');
});

test('projects.json is checked before use: a misspelt, missing or blank field, a relative path, or two entries for one checkout exits 3 and says which', (t) => {
  const { repo, entry, projectsFile, run } = setup(t);
  const rejects = (projects, message) => {
    writeFileSync(projectsFile, JSON.stringify({ projects }));
    const result = run(['mode']);
    assert.equal(result.status, 3, message);
    assert.equal(result.stdout.trim(), `LEDGER ERROR: ${message}`);
  };
  // JSON.stringify drops undefined, so each entry below lacks that key entirely.
  rejects([{ ...entry, migrated: undefined, Migrated: true }], 'projects.json entry 0 (Demo): migrated must be true or false');
  rejects([{ ...entry, path: undefined }], 'projects.json entry 0 (Demo): path must be a non-empty string');
  rejects({}, 'projects.json: projects must be an array');
  // A relative path resolves against wherever the CLI runs, so the same entry could name a different checkout.
  rejects([{ ...entry, path: 'relative/demo' }], 'projects.json entry 0 (Demo): path must be an absolute path');
  rejects([{ ...entry, name: '   ' }], 'projects.json entry 0 (   ): name must be a non-empty string');
  // A misspelt optional key would switch its check off without a word.
  rejects([{ ...entry, reasonsFrom: '1244' }], 'projects.json entry 0 (Demo): reasonsFrom must be an FU ID such as FU-1244');
  rejects([{ ...entry, reasonFrom: 'FU-1244' }], 'projects.json entry 0 (Demo): unknown key reasonFrom — the keys are name, path, migrated, standing, reference, reasonsFrom; a misspelt one would switch its check off');
  // Two entries for one checkout would audit it under whichever came first.
  rejects([entry, { ...entry, name: 'Demo copy' }], `projects.json entries 0 and 1 both point at ${realpathSync(repo.dir)}`);
});

test('an unexpected error exits 3 with LEDGER ERROR, never 1 like a failed audit', (t) => {
  const { dir, projectsFile, run } = setup(t);
  writeFileSync(projectsFile, '{ "projects": [');
  const malformed = run(['mode']);
  assert.equal(malformed.status, 3);
  assert.match(malformed.stdout, /^LEDGER ERROR: /);
  // A bad edit to lib/ is an unexpected error too: a copy of the CLI beside a broken lib/audit.mjs.
  const copy = join(dir, 'copy');
  mkdirSync(join(copy, 'lib'), { recursive: true });
  mkdirSync(join(copy, 'scripts'));
  copyFileSync(CLI, join(copy, 'scripts', 'ledger.mjs'));
  writeFileSync(join(copy, 'lib', 'audit.mjs'), 'export const broken = ;\n');
  const broken = run(['audit'], undefined, join(copy, 'scripts', 'ledger.mjs'));
  assert.equal(broken.status, 3);
  assert.match(broken.stdout, /^LEDGER ERROR: /);
});

test('pilot prints each check and exits 1 until the pilot passes; it takes no flags and leaves unmigrated projects alone', (t) => {
  const migrated = setup(t);
  const pilot = migrated.run(['pilot']);
  assert.equal(pilot.status, 1);
  assert.match(pilot.stdout, /LEDGER PILOT — Demo · 1 sessions since migration/);
  assert.match(pilot.stdout, /⛔ an FU-Closed footer was recorded — none/);
  assert.match(pilot.stdout, /\nPILOT FAILED: 3 check\(s\)\n$/);
  assert.equal(migrated.run(['pilot', '--summary']).status, 2);
  const legacy = setup(t, { migrated: false });
  const skipped = legacy.run(['pilot']);
  assert.equal(skipped.status, 0);
  assert.match(skipped.stdout, /not migrated \(Demo\)/);
});

test('anchored lists the open FUs anchored to the files the working tree changes, or to named files, from any directory', (t) => {
  const { repo, run } = setup(t);
  const row = (n, anchor, home = 'home: Demo/2.4') => `- **FU-${n}** [perf · cleanup-light] Thing ${n} — ${home} ${anchor}`;
  const stack = stackText({ fus: [
    row(1, '{anchor: src/a.ts :: one}'), row(2, '{anchor: src/b.ts :: two}'), row(3, '{anchor: manual}'), row(4, '{anchor: src/sub/new.ts :: four}'),
  ] });
  const standing = `${STANDING}${row(7, '{anchor: src/b.ts :: seven}', 'trigger: date 2027-01-01')}\n- **FU-8** [perf · cleanup-light] Count — trigger: count {anchor: src/a.ts :: one} >= 3\n`;
  repo.commit('feat: the anchored files\n', { 'STACK.md': stack, 'Standing-FUs.md': standing, 'src/a.ts': 'one\n', 'src/b.ts': 'two\n' });
  const listed = (out) => [...out.matchAll(/^ {2}(FU-\d+) /gm)].map((m) => m[1]);
  // A clean tree reads no files, and says so rather than printing an empty list.
  const clean = run(['anchored']);
  assert.equal(clean.status, 0);
  assert.equal(clean.stdout.trim(), 'ANCHORED FUs — Demo · no files changed against HEAD, so nothing to sweep');
  // An edited file and an untracked one in a subdirectory; a count trigger's anchor and a manual anchor are never listed.
  repo.write('src/a.ts', 'one\nmore\n');
  repo.write('src/sub/new.ts', 'four\n');
  const changed = run(['anchored']);
  assert.match(changed.stdout, /^ANCHORED FUs — Demo · 2 open FUs anchored to 2 files changed against HEAD$/m);
  assert.deepEqual(listed(changed.stdout), ['FU-1', 'FU-4']);
  assert.match(changed.stdout, /^ {2}FU-1 +\[perf · cleanup-light\] {2}home Demo\/2\.4 {2}src\/a\.ts — Thing 1$/m);
  // From a subdirectory: the default list is still read from the top level, and a named file resolves from where the CLI runs.
  const sub = join(repo.dir, 'src');
  assert.equal(run(['anchored'], sub).stdout, changed.stdout);
  const named = run(['anchored', 'b.ts'], sub);
  assert.match(named.stdout, /^ANCHORED FUs — Demo · 2 open FUs anchored to 1 file named$/m);
  assert.deepEqual(listed(named.stdout), ['FU-2', 'FU-7']);
  assert.match(named.stdout, /^ {2}FU-7 .* {2}Standing, trigger date 2027-01-01 {2}src\/b\.ts — Thing 7$/m);
  // A row the run already deleted, as a sweep that fixed it does, is no longer listed.
  repo.write('STACK.md', stack.replace(`${row(1, '{anchor: src/a.ts :: one}')}\n`, ''));
  assert.deepEqual(listed(run(['anchored']).stdout), ['FU-4']);
  assert.match(run(['anchored', 'src/c.ts']).stdout, /^ANCHORED FUs — Demo · 0 open FUs anchored to 1 file named\n {2}\(none\)$/m);
  // Staged changes count, and a staged rename lists the FUs anchored to the old name.
  repo.commit('chore: settle\n');
  repo.write('src/sub/new.ts', 'four\nmore\n');
  repo.git('add', 'src/sub/new.ts');
  repo.git('mv', 'src/b.ts', 'src/moved.ts');
  assert.deepEqual(listed(run(['anchored']).stdout), ['FU-2', 'FU-4', 'FU-7']);
  // A missing Standing file or Follow-ups heading is named, not read as a ledger with nothing anchored.
  rmSync(join(repo.dir, 'Standing-FUs.md'));
  assert.match(run(['anchored', 'src/b.ts']).stdout, /^ {2}⚠️ {2}Standing-FUs\.md not found, so its FUs can't be listed$/m);
  repo.write('STACK.md', '# STACK\n');
  assert.match(run(['anchored', 'src/b.ts']).stdout, /^ {2}⚠️ {2}STACK\.md has no "## Follow-ups" heading, so its FUs can't be listed$/m);
});
