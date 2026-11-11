// Text for `ledger.mjs report`, `report --summary` and `audit`. Plain text, so it reads the same
// in a terminal and inside a command's injected context.
import { checksLines } from './checks.mjs';

const BAR = '═'.repeat(55);
const orNone = (lines) => (lines.length ? lines : ['  (none)']);
const countState = (r, state) => r.lessons.filter((l) => l.state === state).length;
// A lesson filed after the last sync the clocks count holds no slot yet; it is counted only when there is one.
const newCount = (r, lead) => (countState(r, 'new') ? `${lead}${countState(r, 'new')} new` : '');
// With --evidence the clocks count the open session's own sync, so the report shows what the next session will find.
const clocks = (r) => (r.closedThrough > 0 ? `clocks through session ${r.closedThrough}'s sync` : 'clocks before the first sync');

export function describeTrigger(t) {
  if (t.kind === 'date') return `date ${t.date}`;
  if (t.kind === 'after') return `after ${t.campaign}/${t.unit}`;
  if (t.kind === 'count') return `count {anchor: ${t.file} :: ${t.pattern}} >= ${t.min}`;
  return `owner decision — ${t.question}`;
}

/**
 * `ledger.mjs anchored`: one line per open FU anchored to the files, STACK rows first. The header counts the files read,
 * so an empty list can be told from a sweep that read nothing. `source` says where the files came from.
 */
export function formatAnchored(a, source) {
  const where = `${a.files.length} file${a.files.length === 1 ? '' : 's'} ${source}`;
  const missing = a.missing.map((m) => `  ⚠️  ${m}`);
  if (a.files.length === 0) return [`ANCHORED FUs — ${a.project} · no files ${source}, so nothing to sweep`, ...missing].join('\n');
  const rows = [...a.stack, ...a.standing];
  const place = (row) => (row.home ? `home ${row.home}` : `Standing, trigger ${describeTrigger(row.trigger)}`);
  return [
    `ANCHORED FUs — ${a.project} · ${rows.length} open FU${rows.length === 1 ? '' : 's'} anchored to ${where}`,
    ...missing,
    ...orNone(rows.map(({ row, files }) => `  ${row.id.padEnd(8)} [${row.type} · ${row.rigor}]  ${place(row)}  ${files.join(', ')} — ${row.what}`)),
  ].join('\n');
}

export function formatSummary(r) {
  return `LEDGER ${r.project} — lessons: ${countState(r, 'member')} members, ${countState(r, 'probation')} on probation${newCount(r, ', ')} · group steps: ${r.groups.length} · fired triggers: ${r.fired.length} · waiting on owner: ${r.waitingOnOwner.length} · stops: ${r.stops.length} · warnings: ${r.warnings.length}`;
}

// Commands and the rulebook point at this line instead of restating a number, so a change to
// lib/rules.mjs reaches every reader through the report.
function limitsLine(x) {
  return [
    `LIMITS  lessons ${x.lessonSlots}`,
    `members ${x.memberSlots}`,
    `probation ${x.probationSlots} for ${x.probationSessions} sessions`,
    `filed per session ${x.lessonsFiledPerSession}`,
    `rule ${x.ruleMaxChars} chars`,
    `evidence window ${x.evidenceWindowSessions} sessions`,
    `group step scheduled at ${x.groupStepScheduleAt} FUs`,
    `idle after ${x.groupStepIdleSessions} sessions`,
    `rulebook ${x.rulebookMax}`,
  ].join(' · ');
}

function lessonLines(r) {
  return orNone(r.lessons.map((l) => {
    const state = l.state === 'probation' ? `probation ${l.age + 1}/${r.limits.probationSessions}` : l.state;
    return `  ${l.id.padEnd(6)} ${state.padEnd(13)} ${String(l.catches).padStart(2)} caught ${String(l.cites).padStart(2)} cited   ${l.rule}`;
  }));
}

function groupLines(r) {
  return orNone(r.groups.map((g) => [
    `  ${g.home.padEnd(22)}`,
    [...g.types].join('+').padEnd(24),
    g.rigor.padEnd(13),
    `${String(g.ids.length).padStart(2)} FUs `,
    (g.scheduled ? 'scheduled' : 'not scheduled').padEnd(13),
    ` idle ${g.idleFor}  `,
    g.ids.join(' '),
  ].join(' ')));
}

const share = (part, whole) => (whole ? `${Math.round((100 * part) / whole)}%` : 'n/a');

function paperworkShare(o) {
  const lines = o.workLines + o.paperworkLines;
  return `${o.paperworkCommits} of ${o.commits} commits paperwork-only (${share(o.paperworkCommits, o.commits)}) · ${o.paperworkLines} of ${lines} changed lines paperwork (${share(o.paperworkLines, lines)})`;
}

/** The pilot's outcomes, for the owner to judge at the end of the pilot. None of them is a check. */
function outcomeLines(o) {
  if (!o) return [];
  const last = o.sessions.at(-1);
  const count = (key) => o.sessions.reduce((n, s) => n + s[key].length, 0);
  const net = last ? last.stack + last.standing - o.atMigration.stack - o.atMigration.standing : 0;
  const after = last ? `${last.stack} STACK + ${last.standing} Standing after session ${last.session}` : 'no session yet';
  return [
    'OUTCOMES  reported for the owner to judge at the end of the pilot; never a check',
    `  FU backlog   ${o.atMigration.stack} STACK + ${o.atMigration.standing} Standing at migration → ${after} · filed ${count('filed')} · closed ${count('closed')} · dropped ${count('dropped')} · net ${net > 0 ? '+' : ''}${net}`,
    `  Paperwork    pilot, ${o.pilot.sessions} session(s): ${paperworkShare(o.pilot)}`,
    `               baseline, ${o.baseline.sessions} session(s) before migration: ${paperworkShare(o.baseline)}`,
    ...o.sessions.map((s) => `    session ${s.session}  filed ${s.filed.length} · closed ${s.closed.length} · dropped ${s.dropped.length} → ${s.stack} STACK + ${s.standing} Standing · ${paperworkShare(s)}`),
    '',
  ];
}

/** `ledger.mjs pilot`: each check, the outcomes, the warnings still standing for the owner, then one result line. */
export function formatPilot(p) {
  const failed = p.checks.filter((c) => !c.pass);
  return [
    BAR,
    `LEDGER PILOT — ${p.project} · ${p.sessions} sessions since migration`,
    BAR,
    ...p.checks.map((c) => `  ${c.pass ? '✅' : '⛔'} ${c.name} — ${c.detail}`),
    '',
    ...outcomeLines(p.outcomes),
    `WARNINGS TO REVIEW (${p.warnings.length})`,
    ...orNone(p.warnings.map((w) => `  ⚠️  ${w}`)),
    '',
    'CHECK BY HAND  /start-session briefs from the ledger report, not from every lesson and FU',
    '',
    failed.length ? `PILOT FAILED: ${failed.length} check(s)` : 'PILOT PASSED',
  ].join('\n');
}

export function formatReport(r) {
  const a = r.anchors;
  return [
    BAR,
    `LEDGER REPORT — ${r.project} · session ${r.openSession} · ${clocks(r)}`,
    BAR,
    limitsLine(r.limits),
    '',
    `LESSONS  (${countState(r, 'member')} of ${r.limits.memberSlots} members · ${countState(r, 'probation')} of ${r.limits.probationSlots} on probation${newCount(r, ' · ')} · ${r.revivals.length} revived)`,
    // --evidence already counts in the states below, so the report says what it counted.
    ...(r.pendingEvidence.length ? [`  pending this session: ${r.pendingEvidence.join(', ')}`] : []),
    ...lessonLines(r),
    '',
    'GROUP STEPS',
    ...groupLines(r),
    '',
    'FIRED TRIGGERS',
    ...orNone(r.fired.map((f) => `  ${f.id}  ${describeTrigger(f.trigger)}  — ${f.what}`)),
    '',
    'WAITING ON OWNER',
    ...orNone(r.waitingOnOwner.map((f) => `  ${f.id}  ${f.trigger.question}  — ${f.what}`)),
    '',
    `ANCHORS  ${a.checked} checked · ${a.drifted.length} drifted · ${a.manual} manual · stale-home ${r.staleHome.verifiable ? r.staleHome.count : 'could not check'}`,
    '',
    ...checksLines(r.checks),
    '',
    `STOPS (${r.stops.length})`,
    ...orNone(r.stops.map((s) => `  ⛔ ${s}`)),
    '',
    `WARNINGS (${r.warnings.length})`,
    ...orNone(r.warnings.map((w) => `  ⚠️  ${w}`)),
    '',
    `NOTES (${r.notes.length})`,
    ...orNone(r.notes.map((n) => `  · ${n}`)),
    '',
    'PROPOSED ACTIONS',
    ...orNone(r.proposals.map((p) => `  → ${p}`)),
    '',
    `NEXT IDS  ${r.nextIds.lesson} · ${r.nextIds.fu} · ${r.nextIds.rule}`,
  ].join('\n');
}
