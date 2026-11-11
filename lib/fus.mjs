// FU decisions. Pure. The history replay applies reachesScheduleLimit and idleQuestionDue session by
// session; the audit reaches both through evaluateFus.
import { FU_REASONS, RIGORS, RULES } from './rules.mjs';
import { posix } from 'node:path';
import { isClosedUnit, isRegexPattern, parseAnchors } from './anchors.mjs';

export const heaviest = (rigors) => RIGORS[Math.max(...rigors.map((r) => RIGORS.indexOf(r)))];
export const reachesScheduleLimit = (size, rules = RULES) => size >= rules.groupStepScheduleAt;
export const isIdle = (lastTouchSession, session, rules = RULES) => session - lastTouchSession >= rules.groupStepIdleSessions;
// Asked once per idle window: at each whole multiple of the idle limit, never in between.
export const idleQuestionDue = (idleFor, rules = RULES) => isIdle(0, idleFor, rules) && idleFor % rules.groupStepIdleSessions === 0;

/** One group step per home. A home should hold one type; a mix is reported, not refused. */
export function groupSteps(rows) {
  const byHome = new Map();
  for (const r of rows) {
    const g = byHome.get(r.home) ?? { home: r.home, campaign: r.campaign, phase: r.phase, step: r.step, types: new Set(), ids: [], rigors: [] };
    g.types.add(r.type);
    g.ids.push(r.id);
    g.rigors.push(r.rigor);
    byHome.set(r.home, g);
  }
  return [...byHome.values()].map(({ rigors, ...g }) => ({ ...g, rigor: heaviest(rigors) }));
}

/** Same pattern convention as anchors: /regex/ or a literal. */
export function countMatches(text, pattern) {
  if (!isRegexPattern(pattern)) return { count: text.split(pattern).length - 1 };
  try {
    return { count: [...text.matchAll(new RegExp(pattern.slice(1, -1), 'g'))].length };
  } catch (e) {
    return { error: `bad pattern ${pattern}: ${e.message}` };
  }
}

/**
 * `after` reads STACK's phase checkboxes, which belong to the current campaign only. Another
 * campaign's trigger waits: it may not have started, or may be worked in alternation with this one,
 * and /end-session asks about it when its campaign closes.
 */
function afterFired({ campaign, unit }, ctx) {
  return campaign === ctx.activeCampaign && isClosedUnit(ctx.closedUnits, unit);
}

export function checkTrigger(trigger, ctx) {
  switch (trigger.kind) {
    case 'date':
      return { fired: trigger.date <= ctx.today };
    case 'after':
      return { fired: afterFired(trigger, ctx) };
    case 'owner':
      return { fired: false, waitingOnOwner: true };
    case 'count': {
      const text = ctx.readText(trigger.file);
      if (text === null) return { fired: false, problem: `${trigger.file} is not a readable file` };
      const m = countMatches(text, trigger.pattern);
      return 'error' in m ? { fired: false, problem: m.error } : { fired: m.count >= trigger.min };
    }
  }
}

function rowStops(stack, standing, closedIds, reasonsFrom) {
  // A missing heading or file would otherwise read as an empty ledger and pass every check.
  const stops = [];
  if (!stack.found) stops.push('STACK.md has no "## Follow-ups" heading — the FU ledger can\'t be checked');
  if (!standing.found) stops.push('Standing-FUs.md not found — a migrated project needs one');
  for (const [label, parsed] of [['STACK.md', stack], ['Standing-FUs.md', standing]]) {
    for (const m of parsed.malformed) stops.push(`${label}: ${m.reason} — ${m.raw}`);
    for (const raw of parsed.resolved) stops.push(`${label}: crossed-out or checked-off row left in the file — delete it; git keeps the record — ${raw}`);
  }
  for (const r of [...stack.rows, ...standing.rows]) {
    // Rows below the project's reasonsFrom ID are grandfathered; an owner decision is a question, not deferred work.
    if (reasonsFrom !== null && r.n >= reasonsFrom && !r.whyNotNow && r.trigger?.kind !== 'owner') {
      stops.push(`${r.id} names no reason it waits — add " — why not now: <${FU_REASONS.join('|')}>: <one line>" before its ${r.trigger ? 'trigger' : 'home'} (red-line-toolkit/reference/ledger-session.md § FUs)`);
    }
    if (closedIds.has(r.id)) stops.push(`${r.id} has an FU-Closed footer but is still listed — remove the finished row, or if this row is new and reused a closed ID, give it a fresh ID with next-id fu`);
  }
  return stops;
}

/** A step-order doc that can't be read schedules nothing, whatever the group size: one stop per doc, however many pointers name it. */
function stepOrderDocStops(stepOrder) {
  const unreadable = [...stepOrder.values()].filter((o) => !o.stepIds).map((o) => o.doc);
  return [...new Set(unreadable)].map((doc) => `step-order doc ${doc} is not a readable file`);
}

function scheduleStop(g, stepOrder) {
  const key = `${g.campaign}/${g.phase}`;
  const order = stepOrder.get(key);
  const lead = `group step ${g.home} has ${g.ids.length} FUs`;
  if (!order) return `${lead} and STACK.md has no ledger:step-order pointer for ${key} — add the pointer and the step before committing`;
  // An unreadable doc already has its own stop, so it isn't reported twice.
  if (!order.stepIds) return null;
  return g.scheduled ? null : `${lead} and isn't in ${order.doc} — add it to the step order, or split it, before committing`;
}

function groupFindings(g, { stepOrder }, rules) {
  const out = { stops: [], warnings: [], proposals: [] };
  const stop = reachesScheduleLimit(g.ids.length, rules) ? scheduleStop(g, stepOrder) : null;
  if (stop) out.stops.push(stop);
  // A scheduled step is waiting its turn. An unscheduled one asks once per idle window, as the replay counts it.
  if (!g.scheduled && idleQuestionDue(g.idleFor, rules)) {
    out.warnings.push(`group step ${g.home} untouched for ${g.idleFor} sessions`);
    out.proposals.push(`schedule ${g.home}, merge it into another step, or drop it on purpose`);
  }
  if (g.types.size > 1) out.warnings.push(`group step ${g.home} mixes types: ${[...g.types].sort().join(', ')}`);
  return out;
}

/** A group step in a closed phase or step takes no new work: the audit already stops on its rows. */
function placement(row, groups, ctx) {
  const open = (g) => !isClosedUnit(ctx.closedUnits, g.step);
  const target = groups.filter((g) => g.campaign === ctx.activeCampaign && g.types.has(row.type) && open(g)).sort((a, b) => b.phase - a.phase)[0];
  return target
    ? `move ${row.id} from Standing into ${target.home} (the ${row.type} group step)`
    : `move ${row.id} from Standing into a new ${row.type} group step in ${ctx.activeCampaign}'s current phase`;
}

// A parked owner question's pick (red-line-toolkit/reference/decision-gates.md § Parking): `<what> — recommended: <pick>; <mockup or description>`.
const RECOMMENDED = /\brecommended: \S/;

function standingTriggers(rows, groups, ctx) {
  const out = { fired: [], waitingOnOwner: [], stops: [], warnings: [], proposals: [] };
  for (const r of rows) {
    const result = checkTrigger(r.trigger, ctx);
    if (result.problem) out.stops.push(`${r.id} trigger can't be checked: ${result.problem}`);
    else if (result.waitingOnOwner) {
      out.waitingOnOwner.push(r);
      if (!RECOMMENDED.test(r.what)) out.warnings.push(`${r.id} waits on the owner with no "recommended: <pick>" — add the pick /start-session will mark when it asks (red-line-toolkit/reference/decision-gates.md § Parking)`);
    }
    else if (result.fired) {
      out.fired.push(r);
      out.warnings.push(`${r.id} trigger fired`);
      out.proposals.push(placement(r, groups, ctx));
    }
  }
  return out;
}

/** `closedThrough` is the last session the idle clock counts as closed; a touch after it, in the open session, isn't idle time. */
export function evaluateFus(input, rules = RULES) {
  const { stack, standing, stepOrder, lastTouch, closedThrough, closedIds, triggerCtx, reasonsFrom = null } = input;
  const groups = groupSteps(stack.rows).map((g) => ({
    ...g,
    idleFor: Math.max(0, closedThrough - (lastTouch.get(g.home) ?? closedThrough)),
    scheduled: Boolean(stepOrder.get(`${g.campaign}/${g.phase}`)?.stepIds?.has(g.step)),
  }));
  const findings = groups.map((g) => groupFindings(g, input, rules));
  const triggers = standingTriggers(standing.rows, groups, triggerCtx);
  return {
    groups,
    fired: triggers.fired,
    waitingOnOwner: triggers.waitingOnOwner,
    stops: [...rowStops(stack, standing, closedIds, reasonsFrom), ...stepOrderDocStops(stepOrder), ...findings.flatMap((f) => f.stops), ...triggers.stops],
    warnings: [...findings.flatMap((f) => f.warnings), ...triggers.warnings],
    proposals: [...findings.flatMap((f) => f.proposals), ...triggers.proposals],
  };
}

/**
 * Open FU rows whose own anchors name one of `files` (repo-relative paths), each with the files it matched, for the
 * anchor sweep (red-line-toolkit/reference/pipeline-shared.md § The anchor sweep). A count trigger's anchor says what to count, not where the
 * row's work is, so only trailing anchors are read, as in the drift check.
 */
export function anchoredRows(rows, files) {
  const wanted = new Set(files.map(posix.normalize));
  return rows.flatMap((row) => {
    const named = row.anchors.flatMap(parseAnchors).filter((a) => a.kind === 'code').map((a) => posix.normalize(a.file));
    const matched = [...new Set(named)].filter((f) => wanted.has(f));
    return matched.length ? [{ row, files: matched }] : [];
  });
}
