// One project's full ledger check. Reads the project's files and git history, applies the lesson
// and FU decisions, and returns everything `ledger.mjs report` and `audit` print.
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { FOOTER, RULES, SESSION_SUBJECT } from './rules.mjs';
import {
  FU_SECTION, LESSON_SECTION, OUTCOME_LINE, legacyFindingLines, lessonEntries, maxId, parseFus, parseLessons, parseRules,
  parseStepIds, parseStepOrderPointers, rowsOutside, sectionLines,
} from './rows.mjs';
import {
  activeCampaign, auditStaleHomes, classifyAnchor, closedCampaigns, isDrift, parseAnchors, parseClosedPhases, parsePhaseHomes, unrecognizedPhaseLines,
} from './anchors.mjs';
import {
  EVENT_KIND, FU_ROW_ID, ITEM_ID, LESSON_ROW_ID, PHASE_VALUE, assignSessions, changedFiles, fileHistory, footerEvents, footerShapeWarnings, lastTouchByHome,
  listedSince, listingChanges, listingStarts, phaseBySession, readCommits, runGit, short, showAt, showAtHead,
} from './history.mjs';
import { evaluateLessons } from './lessons.mjs';
import { anchoredRows, evaluateFus } from './fus.mjs';
import { checkFindings, readCheckRegistry } from './checks.mjs';

const EVIDENCE_FOOTERS = Object.keys(EVENT_KIND);
// A session's lesson answer; `ledger.mjs --evidence` takes only these footers.
export const LESSON_ANSWERS = [FOOTER.caught, FOOTER.cited, FOOTER.check];
// The history key for what isn't committed yet — STACK edits and --evidence footers. sessionOf maps it to the open session.
const WORKING_TREE = 'working tree';

// Only a regular file counts as present: reading a directory throws EISDIR and would crash the whole audit.
const isFile = (file) => statSync(file, { throwIfNoEntry: false })?.isFile();
const readIfExists = (file) => (isFile(file) ? readFileSync(file, 'utf8') : null);

/** Uncommitted STACK edits as one more history entry: lines not in HEAD are added, HEAD lines no longer present removed. */
function workingTreeEntry(head, now) {
  const [headLines, nowLines] = [head.split('\n'), now.split('\n')];
  const [inHead, inNow] = [new Set(headLines), new Set(nowLines)];
  return { sha: WORKING_TREE, added: nowLines.filter((l) => !inHead.has(l)), removed: headLines.filter((l) => !inNow.has(l)) };
}

function loadProject(project, processRoot, pendingFooters) {
  const commits = readCommits(project.path);
  const { sessionOf, closed, openSession } = assignSessions(commits);
  sessionOf.set(WORKING_TREE, openSession);
  const stack = readFileSync(join(project.path, 'STACK.md'), 'utf8');
  return {
    project,
    processRoot,
    commits,
    sessionOf,
    openSession,
    // The last session the clocks count as closed. --evidence marks the audit that decides the session: its
    // sync is about to land, so the open session counts too. Every other run stops at the last sync, so it
    // finds what that sync's audit decided; counting the open session there would end a probation or an idle
    // window a sync before any audit decides it.
    closedThrough: pendingFooters.length > 0 ? openSession : closed,
    migration: commits.findLast((c) => c.trailers.some((t) => t.key === FOOTER.migration)),
    events: footerEvents(commits, sessionOf),
    pendingFooters,
    pendingEvents: footerEvents([{ sha: WORKING_TREE, trailers: pendingFooters }], sessionOf),
    phaseOf: phaseBySession(commits, sessionOf),
    stack,
    standing: readIfExists(join(project.path, project.standing)),
    reference: readIfExists(join(project.path, project.reference)),
    rulebook: readIfExists(join(processRoot, 'CLAUDE.md')),
    rulesReference: readIfExists(join(processRoot, 'reference', 'rules.md')) ?? '',
    checkRegistry: readCheckRegistry(project.path),
    // One entry for uncommitted edits, so listings, filing sessions and group-step touches all read them the same way.
    stackHistory: [...fileHistory(project.path, 'STACK.md'), workingTreeEntry(showAtHead(project.path, 'STACK.md') ?? '', stack)],
    // Every row line either ledger file ever gained, merged branches' own commits included: those rows took their IDs too.
    rowsEverAdded: ['STACK.md', project.standing].flatMap((file) => fileHistory(project.path, file, { everyCommit: true }).flatMap((h) => h.added)),
  };
}

function auditLessons(ctx, rules) {
  const parsed = parseLessons(ctx.stack);
  const listed = listedSince(ctx.stackHistory, LESSON_ROW_ID);
  const filedSession = new Map([...listed].map(([id, sha]) => [id, ctx.sessionOf.get(sha)]));
  // The migration commit's lessons are members, never "filed this session" — even before the first sync follows it.
  const grandfathered = new Set([...listed].filter(([, sha]) => sha === ctx.migration?.sha).map(([id]) => id));
  const result = evaluateLessons({
    lessons: parsed.rows,
    filedSession,
    openSession: ctx.openSession,
    closedThrough: ctx.closedThrough,
    events: [...ctx.events, ...ctx.pendingEvents],
    phaseOf: ctx.phaseOf,
    grandfathered,
    newIds: new Set(parsed.rows.map((r) => r.id).filter((id) => !grandfathered.has(id) && filedSession.get(id) === ctx.openSession)),
    starts: listingStarts(ctx.stackHistory, LESSON_ROW_ID),
  }, rules);
  const missing = parsed.found ? [] : ['STACK.md has no "## Lessons" heading — the lesson ledger can\'t be checked'];
  const malformed = parsed.malformed.map((raw) => `STACK.md: lesson row isn't in the L-<n> format, or its #l-<n> link names another lesson — ${raw}`);
  const reference = referenceFindings(ctx, parsed.rows);
  return { ...result, stops: [...missing, ...reference.stops, ...malformed, ...result.stops], warnings: [...reference.warnings, ...result.warnings] };
}

/**
 * Every lesson row links to its `## L-<n>` entry in the reference doc, so a missing doc or entry is a broken link.
 * A lesson whose listing ended stops until its entry records the Outcome, in the plain shape the pilot reads.
 */
function referenceFindings(ctx, lessons) {
  const path = ctx.project.reference;
  // With no doc at all, its one stop names the fix; a warning per lesson would only repeat it.
  if (ctx.reference === null) return { stops: [`reference doc ${path} is not a readable file`], warnings: [] };
  const entries = lessonEntries(ctx.reference);
  const unentered = lessons.filter((l) => !entries.has(l.id));
  const listed = listedSince(ctx.stackHistory, LESSON_ROW_ID);
  const left = [...new Set(listingChanges(ctx.stackHistory, LESSON_ROW_ID).map((c) => c.id))].filter((id) => !listed.has(id));
  const outcomeless = left.filter((id) => !OUTCOME_LINE.test(entries.get(id) ?? ''));
  return {
    stops: outcomeless.map((id) => outcomeStop(id, entries.get(id), path)),
    warnings: unentered.map((l) => `${l.id} has no "## ${l.id}" entry in ${path}`),
  };
}

function outcomeStop(id, entry, path) {
  if (entry === undefined) return `${id} left STACK but has no "## ${id}" entry in ${path} — add one with its Outcome: line`;
  // The shape /end-session wrote twice in a row: name it, so the fix is to unbold, not to hunt.
  const bold = /^\*\*Outcome\b/m.test(entry) ? ' ("**Outcome:**" in bold doesn\'t count)' : '';
  return `${id} left STACK but its entry in ${path} has no plain "Outcome: " line${bold}`;
}

/** Last session each group step changed; the history's working-tree entry puts uncommitted edits in the open session. */
const fuTouches = (ctx) => new Map([...lastTouchByHome(ctx.stackHistory)].map(([home, sha]) => [home, ctx.sessionOf.get(sha)]));

const SECTIONS = [
  { heading: LESSON_SECTION, name: '## Lessons', prefix: 'L', row: 'a lesson row' },
  { heading: FU_SECTION, name: '## Follow-ups', prefix: 'FU', row: 'an FU row' },
];

/** Every check reads only the first section of its kind, so a second section, or a row outside its own, would go unchecked. */
function sectionStops(stack) {
  return SECTIONS.flatMap(({ heading, name, prefix, row }) => {
    const { count } = sectionLines(stack, heading);
    // With no section at all, the missing-heading stop names the one fix; "move it into that section" would name nothing.
    if (count === 0) return [];
    const outside = rowsOutside(stack, heading, prefix).map((n) => `STACK.md line ${n}: ${row} outside "${name}" — move it into that section`);
    return count > 1 ? [`STACK.md has ${count} "${name}" sections — merge them into one`, ...outside] : outside;
  });
}

/** Each phase's step-order doc, the step IDs it schedules, and its group-step rows too short to have an Order cell. */
function stepOrderFor(path, stack) {
  const stepOrder = new Map();
  for (const p of parseStepOrderPointers(stack)) {
    const text = readIfExists(join(path, p.doc));
    const parsed = text === null ? { ids: null, noOrderCell: [] } : parseStepIds(text);
    stepOrder.set(`${p.campaign}/${p.phase}`, { doc: p.doc, stepIds: parsed.ids, noOrderCell: parsed.noOrderCell });
  }
  return stepOrder;
}

// The campaign the latest valid Phase: footer names, or null before the first. phaseOf runs in session order, so its last value is the latest.
const footerCampaign = (ctx) => [...ctx.phaseOf.values()].at(-1)?.split('/')[0] ?? null;

/** The latest valid Phase: footer names the current campaign; without one, the campaign owning most homes. */
function currentCampaign(ctx) {
  return footerCampaign(ctx) ?? activeCampaign(parsePhaseHomes(ctx.stack));
}

/**
 * Whether STACK names `campaign` where a campaign is named on purpose: the bold label opening a
 * `## Phases` list item (`- [ ] **DesignRevamp — build**`), a `home:` value or a step-order pointer.
 * Prose is never read, not even the prose after a phase label — a near-miss spelling there would pass
 * a whole-word test. Case-sensitive, and the name ends where no letter, digit, _ or - continues it;
 * PHASE_VALUE admits no regex metacharacter, so no escaping.
 */
function campaignNamed(stack, campaign) {
  const label = new RegExp(String.raw`^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s*)?\*\*${campaign}(?![\w-])`);
  return (sectionLines(stack, /^## Phases\b/).lines ?? []).some((line) => label.test(line))
    || parsePhaseHomes(stack).some((h) => h.campaign === campaign)
    || parseStepOrderPointers(stack).some((p) => p.campaign === campaign);
}

/**
 * FUs homed at a closed unit of the current campaign, or anywhere in a campaign `## Phases` marks
 * closed. The check stops, never passes, when it can't read which units are closed or the Phase:
 * footer names a campaign STACK never names; homes in other open campaigns are only noted, since
 * campaigns may alternate.
 */
function staleHomeFindings(ctx) {
  const named = footerCampaign(ctx);
  const campaign = currentCampaign(ctx);
  const closed = closedCampaigns(ctx.stack);
  const texts = [ctx.stack, ctx.standing ?? ''];
  const result = auditStaleHomes(ctx.stack, texts, campaign);
  // A closed campaign's phases are collapsed into one line, so none of its units can be read as open: every home in it is stale.
  const inClosed = texts.flatMap(parsePhaseHomes).filter((h) => closed.has(h.campaign));
  const stale = result.stale.filter((h) => !closed.has(h.campaign));
  const readable = result.verifiable || closed.has(campaign);
  const openElsewhere = result.elsewhere.filter((h) => !closed.has(h.campaign));
  const others = [...new Set(openElsewhere.map((h) => h.campaign))].sort();
  const unmentioned = named !== null && !campaignNamed(ctx.stack, named);
  return {
    summary: { verifiable: readable, count: stale.length + inClosed.length },
    stops: [
      // A misspelt campaign owns no home and closes no phase, so every check below would pass against it.
      ...(unmentioned ? [`Phase: ${named} names a campaign no ## Phases label, home or step-order pointer in STACK.md names — fix the footer or the campaign name`] : []),
      // after triggers and placement read the same closed units, so an unreadable phase line misleads them too.
      ...unrecognizedPhaseLines(ctx.stack).map((n) => `STACK.md line ${n} looks like a phase line but isn't in "**P<n> …**" form — can't tell whether it's closed`),
      ...(readable ? [] : [`stale-home check could not run: ${result.reason}`]),
      ...stale.map((h) => `FU homed at closed ${h.campaign}/${h.slice} — close it, re-home it, or carry its group step forward: ${h.raw}`),
      ...inClosed.map((h) => `FU homed in closed campaign ${h.campaign} (${h.campaign}/${h.slice}) — carry it into the next campaign's group step, move it to Standing with a trigger, or drop it on purpose: ${h.raw}`),
    ],
    notes: others.length ? [`${openElsewhere.length} FU(s) homed in other campaigns (${others.join(', ')}) aren't checked against ${campaign}'s phases`] : [],
  };
}

function auditFus(ctx, today, rules) {
  const stack = parseFus(sectionLines(ctx.stack, FU_SECTION).lines, 'stack');
  const standing = parseFus(ctx.standing?.split('\n') ?? null, 'standing');
  const stepOrder = stepOrderFor(ctx.project.path, ctx.stack);
  const current = currentCampaign(ctx);
  // parseFus leaves legacy findings out, so each gets this one stop, wherever it sits in the file.
  const legacy = [['STACK.md', ctx.stack, 'stack'], [ctx.project.standing, ctx.standing ?? '', 'standing']].flatMap(([file, text, kind]) =>
    legacyFindingLines(text, kind).map((n) => `${file} line ${n} is a legacy /module-audit finding — rewrite it as an FU row (red-line-toolkit/reference/ledger-session.md § FUs)`));
  const noOrderCell = [...stepOrder.values()].flatMap((o) => o.noOrderCell.map((step) => `${o.doc}: group step ${step} row has no Order cell — it doesn't count as scheduled`));
  const result = evaluateFus({
    stack,
    standing,
    stepOrder,
    lastTouch: fuTouches(ctx),
    closedThrough: ctx.closedThrough,
    closedIds: new Set(ctx.events.filter((e) => e.kind === 'closed').map((e) => e.id)),
    reasonsFrom: ctx.project.reasonsFrom ? Number(ctx.project.reasonsFrom.slice('FU-'.length)) : null,
    triggerCtx: {
      today,
      activeCampaign: current,
      closedUnits: parseClosedPhases(ctx.stack),
      readText: (file) => readIfExists(join(ctx.project.path, file)),
    },
  }, rules);
  return {
    ...result,
    stops: [...legacy, ...result.stops],
    warnings: [...noOrderCell, ...result.warnings],
    ids: [...stack.rows, ...standing.rows].map((r) => r.id),
    stackRows: stack.rows,
    standingRows: standing.rows,
    // A count trigger's own anchor may legitimately match nothing yet, so only trailing anchors are drift-checked.
    standingAnchors: standing.rows.flatMap((r) => r.anchors),
  };
}

function anchorFindings(path, texts) {
  const io = { exists: (f) => isFile(join(path, f)), readText: (f) => readFileSync(join(path, f), 'utf8') };
  const results = texts.flatMap(parseAnchors).map((a) => classifyAnchor(a, io));
  return { checked: results.length, drifted: results.filter((r) => isDrift(r.status)), manual: results.filter((r) => r.status === 'manual').length };
}

/** Every session commit since migration needs a Phase: footer and a lesson answer (spec §7); the last one can still be amended. */
function lastSessionWarnings(ctx) {
  const at = ctx.commits.findLastIndex((c) => SESSION_SUBJECT.test(c.subject));
  const migratedAt = ctx.commits.indexOf(ctx.migration);
  if (migratedAt < 0 || at <= migratedAt) return [];
  const last = ctx.commits[at];
  const lead = `the last session commit (${short(last.sha)})`;
  const phase = last.trailers.findLast((t) => t.key === FOOTER.phase);
  const warnings = [];
  if (!phase) warnings.push(`${lead} has no Phase: footer`);
  else if (!PHASE_VALUE.test(phase.value)) warnings.push(`the last session commit's Phase: ${phase.value} isn't <Campaign>/<Phase>`);
  if (!last.trailers.some((t) => LESSON_ANSWERS.includes(t.key))) warnings.push(`${lead} has no lesson answer (Lesson-Caught, Lesson-Cited or Lesson-Check: none)`);
  return warnings;
}

// Filing sessions and grandfathering are read from the commits reachable from HEAD; a squash or rebase erases the migration commit.
const migrationWarnings = (ctx) => (ctx.project.migrated && !ctx.migration
  ? ['no Ledger-Migration commit is reachable from HEAD — was history squashed or rebased? Migrated lessons now count as probationers']
  : []);

/** Every text an issued ID can appear in: the ledger files now, and every row ever added to them. */
const idTexts = (ctx) => [ctx.stack, ctx.standing ?? '', ctx.reference ?? '', ...ctx.rowsEverAdded];

/** Footer values the ledger can't use, and IDs nothing issued, each led by where the footers came from. */
function footerWarnings(lead, commit, issued) {
  const warnings = footerShapeWarnings(lead, commit);
  for (const t of commit.trailers.filter((x) => EVIDENCE_FOOTERS.includes(x.key))) {
    for (const id of t.value.match(ITEM_ID) ?? []) if (!issued.has(id)) warnings.push(`${lead} ${t.key} names unknown ID ${id}`);
  }
  return warnings;
}

// The commits whose footers are still checked: the open session and the one just closed (historyWarnings says why).
const recentCommits = (ctx) => ctx.commits.filter((c) => ctx.sessionOf.get(c.sha) >= ctx.openSession - 1);

/**
 * Warnings read from git history. A pushed commit can't be amended, so a bad footer is reported in
 * its own session and the next only, not for as long as its evidence counts (`evidenceWindowSessions`).
 */
function historyWarnings(ctx) {
  const issued = new Set([...idTexts(ctx), ctx.rulebook ?? '', ctx.rulesReference].flatMap((text) => text.match(ITEM_ID) ?? []));
  const warnings = [...migrationWarnings(ctx), ...lastSessionWarnings(ctx)];
  for (const c of recentCommits(ctx)) {
    warnings.push(...footerWarnings(`commit ${short(c.sha)}`, c, issued));
  }
  // --evidence footers already count toward the lessons, so they're checked by the same rules before the session commit carries them.
  // --evidence footers have no commit body, so git can't have dropped one.
  return [...warnings, ...footerWarnings('--evidence', { trailers: ctx.pendingFooters, body: '' }, issued)];
}

function duplicateStops(ids) {
  const seen = new Set();
  const dupes = new Set();
  for (const id of ids) (seen.has(id) ? dupes : seen).add(id);
  return [...dupes].map((id) => `duplicate ID ${id} — IDs are never reused; give one of the rows the next free ID`);
}

function promotedFrom(rulesReference) {
  return rulesReference.split(/^## /m)
    .map((section) => section.match(/^(R-\d+)\b[\s\S]*?^Source: (\S+) (L-\d+)\s*$/m))
    .filter(Boolean)
    .map((m) => ({ rule: m[1], project: m[2], lesson: m[3] }));
}

function rulebookFindings(ctx, lessonIds, rules) {
  // No rulebook file means no rules yet; a file without its heading would silently pass every rule check.
  if (ctx.rulebook === null) return { stops: [], warnings: [] };
  const parsed = parseRules(ctx.rulebook);
  if (!parsed.found) return { stops: ['CLAUDE.md (rulebook) has no "## Rules" heading'], warnings: [] };
  const ruleIds = new Set(parsed.rows.map((r) => r.id));
  const stops = parsed.malformed.map((raw) => `rulebook row isn't in the R-<n> format, or its #r-<n> link names another rule — ${raw}`);
  if (parsed.rows.length > rules.rulebookMax) stops.push(`rulebook has ${parsed.rows.length} rules — the limit is ${rules.rulebookMax}`);
  const warnings = promotedFrom(ctx.rulesReference)
    .filter((p) => p.project === ctx.project.name && ruleIds.has(p.rule) && lessonIds.has(p.lesson))
    .map((p) => `${p.rule} was promoted from ${p.lesson}, which is still listed in STACK — remove the lesson (the promotion committed in one repo only)`);
  return { stops, warnings };
}

function previousOverride(commits) {
  const lastSync = commits.findLast((c) => SESSION_SUBJECT.test(c.subject));
  const override = lastSync?.trailers.find((t) => t.key === FOOTER.override);
  return override ? { sha: lastSync.sha, reason: override.value } : null;
}

/**
 * `ledger.mjs anchored`: the open STACK and Standing FUs anchored to `files`, read from the working tree as the audit reads
 * them, so a row this run already deleted isn't listed. Malformed rows aren't listed either; the audit stops on them. A
 * missing heading or file is named, so it can't read as a ledger with nothing anchored.
 */
export function anchoredFus({ project, files }) {
  const stack = parseFus(sectionLines(readFileSync(join(project.path, 'STACK.md'), 'utf8'), FU_SECTION).lines, 'stack');
  const standing = parseFus(readIfExists(join(project.path, project.standing))?.split('\n') ?? null, 'standing');
  const missing = [
    ...(stack.found ? [] : ['STACK.md has no "## Follow-ups" heading, so its FUs can\'t be listed']),
    ...(standing.found ? [] : [`${project.standing} not found, so its FUs can't be listed`]),
  ];
  return { project: project.name, files, missing, stack: anchoredRows(stack.rows, files), standing: anchoredRows(standing.rows, files) };
}

/** FU IDs with a row in STACK or the Standing file at `sha`, so a row moved between them isn't new. */
function listedAt(ctx, sha) {
  const text = ['STACK.md', ctx.project.standing].map((f) => showAt(ctx.project.path, sha, f) ?? '').join('\n');
  return new Set(text.split('\n').flatMap((line) => [...line.matchAll(FU_ROW_ID)].map((m) => m[1])));
}

/**
 * The open session's area: the last sync, the files the working tree changes against it, and the FU IDs listed at it, which
 * are the rows filed before this session. A migration commit after a legacy sync renders the existing ledger, so its rows
 * count as listed too, as its lessons count as members. Null before the first sync.
 */
function sessionArea(ctx) {
  const lastSync = ctx.commits.findLast((c) => SESSION_SUBJECT.test(c.subject));
  if (!lastSync) return null;
  const listed = listedAt(ctx, lastSync.sha);
  if (ctx.migration && ctx.commits.indexOf(ctx.migration) > ctx.commits.indexOf(lastSync)) {
    for (const id of listedAt(ctx, ctx.migration.sha)) listed.add(id);
  }
  return { sha: lastSync.sha, changed: changedFiles(ctx.project.path, lastSync.sha), listed };
}

/**
 * STACK FUs filed before this session, anchored to a file changed since the last sync and still open. A run's anchor sweep
 * closes such a row or names why it stays (red-line-toolkit/reference/pipeline-shared.md § The anchor sweep), so the list shows what was passed by.
 */
function passedByNotes(stackRows, area) {
  if (!area) return [];
  const passed = anchoredRows(stackRows.filter((r) => area.listed.has(r.id)), area.changed).map(({ row }) => row.id);
  return passed.length ? [`anchor sweep: ${passed.length} open STACK FU(s) filed before this session are anchored to files changed since the last sync: ${passed.join(', ')} — a run's anchor sweep closes such a row or names why it stays (red-line-toolkit/reference/pipeline-shared.md § The anchor sweep)`] : [];
}

/** Each file, with the first-parent commits since the sync that changed it, so a stop shows whose run's area it is. */
function changedBy(ctx, area, files) {
  const uncommitted = new Set(changedFiles(ctx.project.path));
  return files.map((file) => {
    const by = runGit(ctx.project.path, ['log', '--first-parent', '--format=%h', `${area.sha}..HEAD`, '--', `:(literal)${file}`]).split('\n').filter(Boolean);
    return `${file} by ${[...by, ...(uncommitted.has(file) ? ['uncommitted edits'] : [])].join(', ')}`;
  });
}

/**
 * FUs filed this session whose own anchors name a file the session changed: an issue in the area a run worked, which that
 * run fixes (red-line-toolkit/reference/ledger-session.md § FUs). Only the owner's call waits: a `product` reason or an owner
 * decision. The window is the session, not the commit that files the row, because a worktree run's leftovers are filed in a
 * ledger commit after its merge, and that commit changes none of their files. The ledger files change whenever a row is
 * filed, so they're no area of work.
 */
function inAreaStops(ctx, rows, area) {
  if (!area) return [];
  const ledger = new Set(['STACK.md', ctx.project.standing, ctx.project.reference]);
  const filed = rows.filter((r) => !area.listed.has(r.id) && r.whyNotNow?.kind !== 'product' && r.trigger?.kind !== 'owner');
  return anchoredRows(filed, area.changed.filter((f) => !ledger.has(f))).map(({ row, files }) => `${row.id} was filed this session in the area the session changed (${changedBy(ctx, area, files).join('; ')}) — fix it in that run or this one; only the owner's call waits, as "why not now: product" or an owner decision (red-line-toolkit/reference/ledger-session.md § FUs)`);
}

/** Rulebook IDs are global, so the next one needs only the process repo and works from any directory. */
export function nextRuleId(processRoot) {
  const texts = [join(processRoot, 'CLAUDE.md'), join(processRoot, 'reference', 'rules.md')].map((f) => readIfExists(f) ?? '');
  return `R-${maxId(texts, 'R') + 1}`;
}

function nextIds(ctx) {
  const texts = [...idTexts(ctx), ...ctx.commits.map((c) => c.body)];
  return {
    lesson: `L-${maxId(texts, 'L') + 1}`,
    fu: `FU-${maxId(texts, 'FU') + 1}`,
    rule: nextRuleId(ctx.processRoot),
  };
}

/**
 * `pendingFooters` is the open session's lesson answer, `[{key, value}]`, counted and checked before it's committed.
 * Any footer makes this the audit that decides the session, so its clocks count the session's own sync.
 */
export function auditProject({ project, processRoot, today, rules = RULES, pendingFooters = [] }) {
  const ctx = loadProject(project, processRoot, pendingFooters);
  const lessons = auditLessons(ctx, rules);
  const fus = auditFus(ctx, today, rules);
  const anchors = anchorFindings(project.path, [ctx.stack, ...fus.standingAnchors]);
  const stale = staleHomeFindings(ctx);
  const rulebook = rulebookFindings(ctx, new Set(lessons.lessons.map((l) => l.id)), rules);
  const override = previousOverride(ctx.commits);
  const area = sessionArea(ctx);
  const checks = checkFindings({ ...ctx.checkRegistry, commits: ctx.commits, recent: recentCommits(ctx) });
  return {
    project: project.name,
    openSession: ctx.openSession,
    closedThrough: ctx.closedThrough,
    limits: rules,
    lessons: lessons.lessons,
    revivals: lessons.lessons.filter((l) => l.revived > 0),
    // Each ID a pending footer names, or its value when it names none (Lesson-Check none).
    pendingEvidence: pendingFooters.flatMap(({ key, value }) => (value.match(ITEM_ID) ?? [value]).map((item) => `${key} ${item}`)),
    groups: fus.groups,
    fired: fus.fired,
    waitingOnOwner: fus.waitingOnOwner,
    anchors,
    staleHome: stale.summary,
    checks: checks.summary,
    previousOverride: override,
    stops: [
      ...sectionStops(ctx.stack),
      ...duplicateStops([...lessons.lessons.map((l) => l.id), ...fus.ids]),
      ...lessons.stops,
      ...fus.stops,
      ...inAreaStops(ctx, [...fus.stackRows, ...fus.standingRows], area),
      ...rulebook.stops,
      ...stale.stops,
    ],
    warnings: [
      ...(override ? [`the previous session committed with Over-Limit-Override: ${override.reason} (${short(override.sha)}) — fix the broken limit this session; a second override in a row is refused`] : []),
      ...lessons.warnings,
      ...fus.warnings,
      ...rulebook.warnings,
      ...anchors.drifted.map((r) => `anchor ${r.status}: ${r.anchor.file} :: ${r.anchor.pattern}${r.detail ? ` (${r.detail})` : ''}`),
      ...historyWarnings(ctx),
      ...checks.warnings,
    ],
    notes: [...lessons.notes, ...stale.notes, ...checks.notes, ...passedByNotes(fus.stackRows, area)],
    proposals: [...lessons.proposals, ...fus.proposals],
    nextIds: nextIds(ctx),
  };
}
