// The pilot pass checks (spec §7): whether a migrated project's ledger kept its rules over the
// sessions since migration. `ledger.mjs pilot` fails when a check fails, lists the audit's warnings
// still standing for the owner to review, and ignores notes (decision 33). It also reports outcomes —
// how the FU backlog moved and how much of each session's work was paperwork — for the owner to judge
// at the end of the pilot; no outcome fails a check.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FOOTER, PILOT, RULES, SESSION_SUBJECT } from './rules.mjs';
import { FU_SECTION, LESSON_SECTION, OUTCOME_LINE, lessonEntries, maxId, parseFus, sectionLines } from './rows.mjs';
import {
  LESSON_ROW_ID, PHASE_VALUE, assignSessions, fileHistory, footerEvents, listedSince, listingChanges, readCommits, readNumstat, showAt,
} from './history.mjs';
import { LESSON_ANSWERS, auditProject } from './audit.mjs';

const check = (name, pass, detail) => ({ name, pass, detail });
const short = (sha) => sha.slice(0, 7);

/** Checks read from the commits after the migration commit. */
function historyChecks({ commits, migration, stackHistory }, rules, pilot) {
  const after = commits.slice(commits.indexOf(migration) + 1);
  const { sessionOf } = assignSessions(commits);
  const syncs = after.filter((c) => SESSION_SUBJECT.test(c.subject));
  const postMigration = new Set(after.map((c) => c.sha));
  const filings = new Map();
  for (const change of listingChanges(stackHistory, LESSON_ROW_ID)) {
    if (!change.start || !postMigration.has(change.sha)) continue;
    const session = sessionOf.get(change.sha);
    filings.set(session, (filings.get(session) ?? 0) + 1);
  }
  const overFiled = [...filings].filter(([, n]) => n > rules.lessonsFiledPerSession).map(([s, n]) => `session ${s} filed ${n}`);
  const unanswered = syncs.filter((c) => !c.trailers.some((t) => t.key === FOOTER.phase && PHASE_VALUE.test(t.value)) || !c.trailers.some((t) => LESSON_ANSWERS.includes(t.key)));
  // A work commit and its session commit often carry the same FU-Closed footer; each FU is listed once.
  const closed = [...new Set(after.flatMap((c) => c.trailers.filter((t) => t.key === FOOTER.closed).map((t) => t.value)))];
  return {
    sessions: syncs.length,
    checks: [
      check(`at least ${pilot.minSessions} sessions since migration`, syncs.length >= pilot.minSessions, `${syncs.length}`),
      check(`no session filed more than ${rules.lessonsFiledPerSession} lesson`, overFiled.length === 0, overFiled.join(', ') || 'none did'),
      check('every session commit carries a Phase: footer and a lesson answer', unanswered.length === 0, unanswered.map((c) => short(c.sha)).join(' ') || 'all do'),
      check('an FU-Closed footer was recorded', closed.length > 0, closed.join(', ') || 'none'),
    ],
  };
}

/**
 * Every lesson ID issued so far — up to the highest in STACK or the reference doc — needs a `## L-<n>`
 * entry, and one no longer listed needs an Outcome (spec §7: every reviewed lesson item has an outcome entry).
 */
function lessonEntryGaps(reference, stack, listedIds) {
  const entries = lessonEntries(reference);
  const gaps = [];
  for (let n = 1; n <= maxId([stack, reference], 'L'); n++) {
    const id = `L-${n}`;
    if (!entries.has(id)) gaps.push(`${id} has no entry`);
    else if (!listedIds.has(id) && !OUTCOME_LINE.test(entries.get(id))) gaps.push(`${id} has no Outcome`);
  }
  return gaps;
}

/** Checks read from the ledger files and the audit result as they are now. */
function ledgerChecks({ project, audit, migration, stackHistory }, rules, pilot) {
  const read = (file) => readFileSync(join(project.path, file), 'utf8');
  const stack = read('STACK.md');
  const lessonBytes = Buffer.byteLength((sectionLines(stack, LESSON_SECTION).lines ?? []).join('\n'));
  const probation = audit.lessons.filter((l) => l.state === 'probation').length;
  const long = audit.lessons.filter((l) => l.rule.length > rules.ruleMaxChars).map((l) => l.id);
  const listed = listedSince(stackHistory, LESSON_ROW_ID);
  const earned = audit.lessons.filter((l) => l.state === 'member' && listed.get(l.id) !== migration.sha).map((l) => l.id);
  const gaps = lessonEntryGaps(read(project.reference), stack, new Set(audit.lessons.map((l) => l.id)));
  const fus = [parseFus(sectionLines(stack, FU_SECTION).lines, 'stack'), parseFus(read(project.standing).split('\n'), 'standing')];
  const badRows = fus.reduce((n, f) => n + f.malformed.length + f.resolved.length, 0);
  const unscheduled = audit.groups.filter((g) => g.ids.length >= rules.groupStepScheduleAt && !g.scheduled).map((g) => g.home);
  return [
    check('the audit has no stops', audit.stops.length === 0, `${audit.stops.length} stop(s)`),
    check(`at most ${rules.lessonSlots} lessons and ${rules.probationSlots} on probation`, audit.lessons.length <= rules.lessonSlots && probation <= rules.probationSlots, `${audit.lessons.length} listed, ${probation} on probation`),
    check(`every rule within ${rules.ruleMaxChars} characters`, long.length === 0, long.join(' ') || 'all are'),
    check(`the Lessons section within ${pilot.lessonSectionBytes} bytes`, lessonBytes <= pilot.lessonSectionBytes, `${lessonBytes} bytes`),
    check('every lesson ID has a reference entry, with an Outcome once it left', gaps.length === 0, gaps.join(', ') || 'all do'),
    check('a lesson filed after migration became a member on recorded evidence', earned.length > 0, earned.join(' ') || 'none yet'),
    check('every FU row is well-formed, with a home or a trigger, and none is crossed out or checked off', badRows === 0, `${badRows} bad row(s)`),
    check('every group step at the scheduling limit is scheduled', unscheduled.length === 0, unscheduled.join(' ') || 'all are'),
  ];
}

// Paperwork is the ledger files and the plans folder's markdown; every other file a commit changes is
// work. projects.json has no plans-folder field yet (carried to Stage C), so plans are read from docs/plans/.
const PLANS_MARKDOWN = /^docs\/plans\/.+\.md$/;
const NO_OVERHEAD = Object.freeze({ commits: 0, paperworkCommits: 0, workLines: 0, paperworkLines: 0 });

/** A numstat path at its new name: `docs/plans/{p.md => archive/p.md}` and `a.md => b.md` both name the destination. */
const renamedTo = (path) => path.replace(/\{([^{}]*) => ([^{}]*)\}/, '$2').replace(/^.* => /, '').replace(/\/{2,}/g, '/');

const isPaperwork = (file, project) => {
  const path = renamedTo(file);
  return path === 'STACK.md' || path === project.standing || path === project.reference || PLANS_MARKDOWN.test(path);
};

/** Commits and changed lines, split into work and paperwork. A commit that changes no file (empty, or a merge) is neither. */
function overhead(commits, numstat, project) {
  const total = { ...NO_OVERHEAD };
  const lines = (files) => files.reduce((n, f) => n + f.lines, 0);
  for (const c of commits) {
    const files = numstat.get(c.sha) ?? [];
    if (files.length === 0) continue;
    const paper = files.filter((f) => isPaperwork(f.file, project));
    total.commits += 1;
    if (paper.length === files.length) total.paperworkCommits += 1;
    total.paperworkLines += lines(paper);
    total.workLines += lines(files) - lines(paper);
  }
  return total;
}

const addOverhead = (rows) => rows.reduce((t, r) => Object.fromEntries(Object.keys(NO_OVERHEAD).map((k) => [k, t[k] + r[k]])), { ...NO_OVERHEAD });

/** The FU IDs listed at `sha`: the rows under STACK's Follow-ups, and every Standing row. */
function listedFus(repo, sha, project) {
  const ids = (lines, kind) => parseFus(lines, kind).rows.map((r) => r.id);
  return {
    stack: ids(sectionLines(showAt(repo, sha, 'STACK.md') ?? '', FU_SECTION).lines, 'stack'),
    standing: ids((showAt(repo, sha, project.standing) ?? '').split('\n'), 'standing'),
  };
}

/** Each session as a [start, end) span of commit indexes: everything after the previous boundary up to and including its own. */
const spans = (boundaries) => boundaries.slice(1).map((end, i) => [boundaries[i] + 1, end + 1]);

/**
 * Outcomes, reported and never checked. Each session since migration: the FUs it filed, closed with an
 * FU-Closed footer and dropped without one (a row moved between STACK and Standing is none of them), the
 * totals it left, and its work and paperwork. The baseline is the same overhead over the last
 * `baselineSessions` sessions before migration. Neither side counts the migration commit or the commits
 * between the last sync before it and the migration itself: that is the migration's own work.
 */
function outcomes({ project, commits, migration }, pilot) {
  const { sessionOf } = assignSessions(commits);
  const numstat = readNumstat(project.path);
  const at = commits.indexOf(migration);
  const syncs = commits.flatMap((c, i) => (SESSION_SUBJECT.test(c.subject) ? [i] : []));
  let previous = listedFus(project.path, migration.sha, project);
  const atMigration = { stack: previous.stack.length, standing: previous.standing.length };
  const sessions = spans([at, ...syncs.filter((i) => i > at)]).map(([start, end]) => {
    const slice = commits.slice(start, end);
    const { sha } = slice.at(-1);
    const listed = listedFus(project.path, sha, project);
    const [was, now] = [previous, listed].map((l) => new Set([...l.stack, ...l.standing]));
    const closed = [...new Set(footerEvents(slice, sessionOf).filter((e) => e.kind === 'closed').map((e) => e.id))];
    previous = listed;
    return {
      session: sessionOf.get(sha),
      sha,
      filed: [...now].filter((id) => !was.has(id)),
      closed,
      dropped: [...was].filter((id) => !now.has(id) && !closed.includes(id)),
      stack: listed.stack.length,
      standing: listed.standing.length,
      ...overhead(slice, numstat, project),
    };
  });
  const before = spans([-1, ...syncs.filter((i) => i < at)]).slice(-pilot.baselineSessions);
  return {
    atMigration,
    sessions,
    pilot: { sessions: sessions.length, ...addOverhead(sessions) },
    baseline: { sessions: before.length, ...addOverhead(before.map(([start, end]) => overhead(commits.slice(start, end), numstat, project))) },
  };
}

export function pilotProject({ project, processRoot, today, rules = RULES, pilot = PILOT }) {
  const audit = auditProject({ project, processRoot, today, rules });
  const commits = readCommits(project.path);
  const migration = commits.findLast((c) => c.trailers.some((t) => t.key === FOOTER.migration));
  if (!migration) {
    return { project: project.name, sessions: 0, checks: [check('a Ledger-Migration commit is reachable from HEAD', false, 'none found')], warnings: audit.warnings, outcomes: null };
  }
  const ctx = { project, audit, commits, migration, stackHistory: fileHistory(project.path, 'STACK.md') };
  const history = historyChecks(ctx, rules, pilot);
  return {
    project: project.name,
    sessions: history.sessions,
    checks: [...history.checks, ...ledgerChecks(ctx, rules, pilot)],
    warnings: audit.warnings,
    outcomes: outcomes(ctx, pilot),
  };
}
