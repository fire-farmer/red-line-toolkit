#!/usr/bin/env node
// LedgerLoop CLI — run from anywhere inside a Stack project or a git worktree of one.
//   mode                           LEDGER: migrated | not migrated | not a stack project
//   report [--summary]             the ledger report (always exits 0)
//   audit [--override "<reason>"]  the report, then exit 1 when a limit is broken
//   next-id lesson|fu|rule         the next free ID (rule IDs are global, so `next-id rule` runs anywhere)
//   pilot                          the pilot pass checks since migration; exit 1 when one fails
//   checks                         every check in docs/checks.md with its gate, run time and last catch (any git checkout)
//   anchored [<file>…]             the open FUs anchored to these files, by default those the working tree changes against HEAD
// report and audit also take --evidence "<Lesson-Caught|Lesson-Cited|Lesson-Check>: <value>", once per footer:
// the session's lesson answer lands in the session commit, after the audit, so it has to count before then.
// It also marks the audit that decides the session: its clocks count the session's own sync (lib/audit.mjs, closedThrough).
// Exit 2 is a usage error, including any flag the command doesn't take; exit 3 is an unexpected error, printed as `LEDGER ERROR: <message>`.
// The process home holds the user's own process state: projects.json, the rulebook (CLAUDE.md) and
// reference/rules.md. It is ~/.claude, where Claude Code loads the rulebook from.
// LEDGER_PROJECTS, LEDGER_TODAY and LEDGER_PROCESS_ROOT replace the projects file, today's date and
// the process home (the tests use all three).
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

const processRoot = process.env.LEDGER_PROCESS_ROOT ?? join(homedir(), '.claude');
const USAGE = 'usage: ledger.mjs mode | report [--summary] | audit [--override "<reason>"] | next-id lesson|fu|rule | pilot | checks | anchored [<file>…]';
const EVIDENCE_USAGE = '--evidence takes Lesson-Caught, Lesson-Cited or Lesson-Check footers';
// The flags each command takes. An ignored misspelling would decide the session without it: `audit --evidences …` never counts the answer.
const FLAGS = { mode: [], 'next-id': [], pilot: [], checks: [], anchored: [], report: ['--summary', '--evidence'], audit: ['--override', '--evidence'] };
const TAKES_VALUE = ['--override', '--evidence'];

/** Whether a token shaped like a flag isn't one `accepted` lists. A flag's value is skipped, so a reason starting with "-" isn't read as a flag. */
function hasUnknownFlag(accepted, args) {
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('-')) continue;
    if (!accepted.includes(args[i])) return true;
    if (TAKES_VALUE.includes(args[i])) i += 1;
  }
  return false;
}

/** Every `--evidence "<Key>: <value>"` as a footer, or null when one isn't a single lesson-answer footer. */
function evidenceFooters(args, parseTrailers, lessonAnswers) {
  const footers = args.flatMap((arg, i) => (arg === '--evidence' ? [parseTrailers(args[i + 1] ?? '')] : []));
  return footers.every((f) => f.length === 1 && lessonAnswers.includes(f[0].key)) ? footers.flat() : null;
}

// execFileSync throws on a non-zero exit, so every git(...) call fails closed; only findProject's probe reads git's exit itself.
const git = (args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const hasGitEntryAtOrAbove = (dir) => Boolean(lstatSync(join(dir, '.git'), { throwIfNoEntry: false })) || (dirname(dir) !== dir && hasGitEntryAtOrAbove(dirname(dir)));

const KEYS = ['name', 'path', 'migrated', 'standing', 'reference', 'reasonsFrom'];

/** The projects file, checked entry by entry: a misspelt key would otherwise read as "not migrated" and skip every check. */
function readProjects(projectsFile) {
  const { projects } = JSON.parse(readFileSync(projectsFile, 'utf8'));
  if (!Array.isArray(projects)) throw new Error('projects.json: projects must be an array');
  projects.forEach((entry, i) => {
    const invalid = (field, expected) => new Error(`projects.json entry ${i} (${entry?.name ?? '?'}): ${field} must be ${expected}`);
    for (const field of ['name', 'path', 'standing', 'reference']) {
      if (typeof entry?.[field] !== 'string' || entry[field].trim() === '') throw invalid(field, 'a non-empty string');
    }
    // A relative path resolves against wherever the CLI runs, so one entry could name a different checkout from each directory.
    if (!isAbsolute(entry.path)) throw invalid('path', 'an absolute path');
    if (typeof entry?.migrated !== 'boolean') throw invalid('migrated', 'true or false');
    // The first FU ID whose row must name why it waits; older rows are grandfathered (red-line-toolkit/reference/ledger-lifecycle.md § FUs).
    if ('reasonsFrom' in entry && !/^FU-\d+$/.test(entry.reasonsFrom)) throw invalid('reasonsFrom', 'an FU ID such as FU-1244');
    const unknown = Object.keys(entry).find((key) => !KEYS.includes(key));
    if (unknown) throw new Error(`projects.json entry ${i} (${entry.name}): unknown key ${unknown} — the keys are ${KEYS.join(', ')}; a misspelt one would switch its check off`);
  });
  return projects;
}

/** The Stack project this checkout belongs to, with `path` set to this checkout so a worktree audits its own files. */
function findProject() {
  const probe = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (probe.error) throw probe.error;
  if (probe.status !== 0) {
    // Only a directory with no repository at all is "not a stack project"; a broken repository must not pass for one.
    if (probe.stderr.includes('not a git repository') && !hasGitEntryAtOrAbove(process.cwd())) return null;
    throw new Error(`git rev-parse failed (exit ${probe.status}): ${probe.stderr.trim()}`);
  }
  if (probe.stdout.trim() !== 'true') {
    // Inside a git directory there is no checkout to audit. A checkout marked bare still holds its files, and must not pass for no project.
    if (git(['rev-parse', '--is-inside-git-dir']) === 'true') return null;
    throw new Error(`git rev-parse: ${process.cwd()} is not inside a work tree`);
  }
  const top = git(['rev-parse', '--show-toplevel']);
  // A worktree's top level is its own directory; its common git directory is the main checkout's .git.
  const main = realpathSync(dirname(git(['rev-parse', '--path-format=absolute', '--git-common-dir'])));
  const projectsFile = process.env.LEDGER_PROJECTS ?? join(processRoot, 'projects.json');
  const projects = readProjects(projectsFile);
  const matches = projects.flatMap((p, i) => (existsSync(p.path) && realpathSync(p.path) === main ? [i] : []));
  // Two entries for one checkout would audit it under whichever came first.
  if (matches.length > 1) throw new Error(`projects.json entries ${matches[0]} and ${matches[1]} both point at ${main}`);
  if (matches.length === 1) return { ...projects[matches[0]], path: top };
  // An unregistered or moved Stack checkout would otherwise skip every ledger check as "not a stack project".
  if (statSync(join(top, 'STACK.md'), { throwIfNoEntry: false })?.isFile()) {
    throw new Error(`STACK.md at ${top} but no projects.json entry points at this checkout — register the project or fix its path in ${projectsFile}`);
  }
  return null;
}

function runAudit(result, args, report, short) {
  const at = args.indexOf('--override');
  const reason = at >= 0 ? (args[at + 1] ?? '').trim() : null;
  if (reason === '') {
    console.error('--override needs a reason');
    return 2;
  }
  console.log(report);
  if (result.stops.length === 0) {
    console.log('\nAUDIT PASSED');
    return 0;
  }
  if (reason === null) {
    console.log(`\nAUDIT FAILED: ${result.stops.length} stop(s). Fix them before committing, or commit once with --override "<reason>".`);
    return 1;
  }
  if (result.previousOverride) {
    console.log(`\nOVERRIDE REFUSED: the previous session also committed with Over-Limit-Override (${short(result.previousOverride.sha)}). Fix the stops.`);
    return 1;
  }
  console.log(`\nOVERRIDE ACCEPTED — add this footer to the session commit, directly above Co-Authored-By:\nOver-Limit-Override: ${reason}`);
  return 0;
}

function main([command, ...args], { LESSON_ANSWERS, auditProject, nextRuleId, parseTrailers, formatReport, formatSummary, pilotProject, formatPilot, checks, anchored }) {
  // Before any lookup. Own keys and an explicit kind list, not plain lookups: FLAGS and nextIds inherit constructor, __proto__ and toString.
  const badKind = command === 'next-id' && !['lesson', 'fu', 'rule'].includes(args[0]);
  if (!Object.hasOwn(FLAGS, command) || badKind || hasUnknownFlag(FLAGS[command], args)) {
    console.error(USAGE);
    return 2;
  }
  if (command === 'next-id' && args[0] === 'rule') {
    console.log(nextRuleId(processRoot));
    return 0;
  }
  // A check registry needs no ledger, so this runs in any checkout, this repo included.
  if (command === 'checks') {
    const top = git(['rev-parse', '--show-toplevel']);
    // With no sessions to window by, a Check-Caught footer naming an unknown check, or one git or the checks can't
    // read, is reported for the next ten commits, then ages out.
    const commits = checks.readCommits(top);
    const recent = commits.slice(-10);
    const result = checks.checkFindings({ ...checks.readCheckRegistry(top), commits, recent });
    console.log(checks.formatChecks({ ...result, warnings: [...result.warnings, ...checks.checkFooterProblems(recent)] }));
    return 0;
  }
  const project = findProject();
  if (command === 'mode') {
    console.log(project ? `LEDGER: ${project.migrated ? 'migrated' : 'not migrated'} (${project.name})` : 'LEDGER: not a stack project');
    return 0;
  }
  const pendingFooters = command === 'next-id' ? [] : evidenceFooters(args, parseTrailers, LESSON_ANSWERS);
  if (!pendingFooters) {
    console.error(EVIDENCE_USAGE);
    return 2;
  }
  if (!project) {
    console.log('LEDGER: not a stack project');
    return command === 'next-id' ? 2 : 0;
  }
  if (!project.migrated && command !== 'next-id') {
    console.log(`LEDGER: not migrated (${project.name}) — LedgerLoop checks don't apply here yet; today's checks keep running`);
    return 0;
  }
  if (command === 'anchored') {
    // A named file resolves from where the CLI runs, as the shell passed it; anchors are paths from the top level.
    const files = args.length ? args.map((f) => relative(realpathSync(project.path), resolve(f))) : anchored.changedFiles(project.path);
    console.log(anchored.formatAnchored(anchored.anchoredFus({ project, files }), args.length ? 'named' : 'changed against HEAD'));
    return 0;
  }
  const today = process.env.LEDGER_TODAY ?? new Date().toLocaleDateString('en-CA');
  if (command === 'pilot') {
    const pilot = pilotProject({ project, processRoot, today });
    console.log(formatPilot(pilot));
    return pilot.checks.every((c) => c.pass) ? 0 : 1;
  }
  const result = auditProject({ project, processRoot, today, pendingFooters });
  if (command === 'report') {
    console.log(args.includes('--summary') ? formatSummary(result) : formatReport(result));
    return 0;
  }
  if (command === 'audit') return runAudit(result, args, formatReport(result), checks.short);
  console.log(result.nextIds[args[0]]);
  return 0;
}

// Node's own crash exit is 1, the same code as AUDIT FAILED, so every unexpected error exits 3 instead.
// The lib modules load inside the try, so a bad edit to lib/ can't pass for a failed audit either.
try {
  const { LESSON_ANSWERS, anchoredFus, auditProject, nextRuleId } = await import('../lib/audit.mjs');
  const { changedFiles, parseTrailers, readCommits, short } = await import('../lib/history.mjs');
  const { formatAnchored, formatPilot, formatReport, formatSummary } = await import('../lib/format.mjs');
  const { pilotProject } = await import('../lib/pilot.mjs');
  const checks = { ...(await import('../lib/checks.mjs')), readCommits, short };
  process.exitCode = main(process.argv.slice(2), { LESSON_ANSWERS, auditProject, nextRuleId, parseTrailers, formatReport, formatSummary, pilotProject, formatPilot, checks, anchored: { anchoredFus, changedFiles, formatAnchored } });
} catch (error) {
  console.log(`LEDGER ERROR: ${error.message}`);
  console.error(error.stack);
  process.exitCode = 3;
}
