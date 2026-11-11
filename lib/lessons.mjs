// Lesson decisions. Pure. The history replay (replay/run.mjs) applies admit, graduate, probationOver
// and staleMember session by session. The audit reaches the same four through evaluateLessons —
// probation through lessonState, graduation through the member-overflow proposals — so the replay
// re-tests the decisions that ship.
import { RULES } from './rules.mjs';

// Higher rank first: catches per session, then citations per session. Equal ranks are the owner's call.
export const byRank = (a, b) => b.catchRate - a.catchRate || b.citeRate - a.citeRate;

export const lowestRanked = (list) => list.reduce((low, x) => (byRank(x, low) > 0 ? x : low));

export const evidenceRate = (count, sessionsOnList, rules = RULES) =>
  count / Math.max(1, Math.min(sessionsOnList, rules.evidenceWindowSessions));

export const probationOver = (start, session, rules = RULES) => session - start >= rules.probationSessions;
export const staleMember = (since, windowEvidence, session, rules = RULES) =>
  session - since >= rules.evidenceWindowSessions && windowEvidence === 0;

/** Where a newly filed lesson goes. A full probation bumps its oldest member with no evidence. */
export function admit(probation, hasEvidence, rules = RULES) {
  if (probation.length < rules.probationSlots) return { outcome: 'probation' };
  const victim = probation.filter((p) => !hasEvidence(p.id)).sort((a, b) => a.start - b.start)[0];
  return victim ? { outcome: 'bump', victim: victim.id } : { outcome: 'wait' };
}

/** What happens to a probationer whose `probationSessions` are over. */
export function graduate(candidate, members, rules = RULES) {
  if (!candidate.hasEvidence) return { outcome: 'leave' };
  if (members.length < rules.memberSlots) return { outcome: 'member' };
  const low = lowestRanked(members);
  const order = byRank(candidate, low);
  if (order < 0) return { outcome: 'replace', victim: low.id };
  return order === 0 ? { outcome: 'tie', victim: low.id } : { outcome: 'leave' };
}

/**
 * Computed, never stored. Lessons listed by the migration commit start as members; others are on
 * probation for `probationSessions` sessions, then stay only with evidence. A still-listed expired lesson is a stop.
 * `age` counts the sessions closed after the filing one, so a lesson filed after the last session the clocks
 * count is `new`: its own sync starts its probation, and until then it holds no probation slot.
 */
export function lessonState({ age, hasEvidence, grandfathered }, rules = RULES) {
  if (grandfathered) return 'member';
  if (age < 0) return 'new';
  if (!probationOver(0, age, rules)) return 'probation';
  return hasEvidence ? 'member' : 'expired';
}

function scoreLesson(lesson, { filedSession, openSession, closedThrough, events, phaseOf, grandfathered, starts }, rules) {
  const filed = filedSession.get(lesson.id) ?? openSession;
  // Footers from the session that filed the lesson don't count toward it.
  const evidence = events.filter((e) => e.id === lesson.id && e.kind !== 'closed' && e.session > filed);
  const recent = evidence.filter((e) => e.session > closedThrough - rules.evidenceWindowSessions);
  const catches = recent.filter((e) => e.kind === 'caught').length;
  const cites = recent.length - catches;
  const age = closedThrough - filed;
  return {
    ...lesson,
    filed,
    age,
    catches,
    cites,
    catchRate: evidenceRate(catches, age + 1, rules),
    citeRate: evidenceRate(cites, age + 1, rules),
    phases: new Set(evidence.filter((e) => e.kind === 'caught').map((e) => phaseOf.get(e.session)).filter(Boolean)),
    state: lessonState({ age, hasEvidence: evidence.length > 0, grandfathered: grandfathered.has(lesson.id) }, rules),
    // A listing that began more than once was evicted and filed again; frequent revivals mean the window is too short.
    revived: Math.max(0, (starts.get(lesson.id) ?? 0) - 1),
  };
}

/** The ranking cut, used when no graduate is past it: a migration kept more members than the slots. */
function rankingProposals(members, rules) {
  const ranked = [...members].sort(byRank);
  const lastKept = ranked[rules.memberSlots - 1];
  return ranked.slice(rules.memberSlots).map((r) => (byRank(r, lastKept) === 0
    ? `owner breaks the tie: ${r.id} and ${lastKept.id} rank equally for the last member slot`
    : `evict ${r.id} to the reference doc — lowest-ranked member`));
}

/**
 * More members than slots. Migrated members hold their slots first, then earlier graduates. Each
 * newer graduate past the last slot takes graduate's automatic outcome against the members ahead of
 * it (spec §3); only an exact tie goes to the owner.
 */
function overflowProposals(members, grandfathered, rules) {
  const migrated = (m) => Number(grandfathered.has(m.id));
  const ordered = [...members].sort((a, b) => migrated(b) - migrated(a) || a.filed - b.filed);
  const candidates = ordered.slice(rules.memberSlots).filter((m) => !grandfathered.has(m.id));
  let working = ordered.filter((m) => !candidates.includes(m));
  const proposals = [];
  for (const c of candidates) {
    const low = lowestRanked(working);
    const { outcome } = graduate({ hasEvidence: true, catchRate: c.catchRate, citeRate: c.citeRate }, working, rules);
    if (outcome === 'replace') {
      proposals.push(`automatic: evict ${low.id} to the reference doc — ${c.id} outranks it for the last member slot`);
      working = [...working.filter((m) => m !== low), c];
    } else if (outcome === 'tie') {
      proposals.push(`owner breaks the tie: ${c.id} and ${low.id} rank equally for the last member slot`);
    } else {
      proposals.push(`automatic: ${c.id} leaves for the reference doc — it doesn't outrank the lowest-ranked member ${low.id}`);
    }
  }
  return working.length > rules.memberSlots ? [...proposals, ...rankingProposals(working, rules)] : proposals;
}

function probationProposals(probation, newIds, rules) {
  const settled = probation.filter((r) => !newIds.has(r.id));
  const evidenced = new Set(settled.filter((r) => r.catches + r.cites > 0).map((r) => r.id));
  const decision = admit(settled.map((r) => ({ id: r.id, start: r.filed })), (id) => evidenced.has(id), rules);
  const arriving = probation.filter((r) => newIds.has(r.id)).map((r) => r.id).join(', ');
  if (decision.outcome === 'bump') return [`remove ${decision.victim} to the reference doc — the oldest probationer with no evidence leaves automatically`];
  if (decision.outcome === 'wait' && arriving) return [`move ${arriving} to ## Candidates in the reference doc — every probationer has evidence; file it again when a probation slot is free`];
  return [];
}

function limitStops(rows, { newIds, grandfathered }, rules) {
  const stops = [];
  const proposals = [];
  const probation = rows.filter((r) => r.state === 'probation');
  const members = rows.filter((r) => r.state === 'member');
  if (rows.length > rules.lessonSlots) stops.push(`${rows.length} lessons listed — the limit is ${rules.lessonSlots}`);
  if (probation.length > rules.probationSlots) {
    stops.push(`${probation.length} lessons on probation — the limit is ${rules.probationSlots}`);
    proposals.push(...probationProposals(probation, newIds, rules));
  }
  if (members.length > rules.memberSlots) {
    stops.push(`${members.length} members — the limit is ${rules.memberSlots}`);
    proposals.push(...overflowProposals(members, grandfathered, rules));
  }
  if (newIds.size > rules.lessonsFiledPerSession) {
    stops.push(`${newIds.size} lessons filed this session (${[...newIds].join(', ')}) — the limit is ${rules.lessonsFiledPerSession}; keep the strongest and move the rest to the reference doc as candidates`);
  }
  for (const r of rows.filter((x) => x.state === 'expired')) stops.push(`${r.id} finished probation with no evidence — move it to the reference doc`);
  return { stops, proposals };
}

function lessonFindings(rows, { closedThrough }, rules) {
  const warnings = [];
  const proposals = [];
  const notes = [];
  for (const r of rows) {
    const evidence = r.catches + r.cites;
    if (r.rule.length > rules.ruleMaxChars) warnings.push(`${r.id} rule is ${r.rule.length} characters — the limit is ${rules.ruleMaxChars}`);
    // A session number, not "next session": the audit that decides a session counts its own sync and a start-of-session report doesn't, so "next" would name a different session in each.
    if (r.state === 'probation' && r.age === rules.probationSessions - 1 && evidence === 0) warnings.push(`${r.id} ends probation at session ${r.filed + rules.probationSessions}'s sync with no evidence`);
    if (r.state === 'member' && staleMember(r.filed, evidence, closedThrough, rules)) {
      warnings.push(`${r.id} has no evidence in the last ${rules.evidenceWindowSessions} sessions`);
      proposals.push(`evict ${r.id} to the reference doc — no evidence in ${rules.evidenceWindowSessions} sessions (it can be revived with its ID)`);
    }
    // Candidates are notes, not warnings: nothing needs fixing, and the owner weighs them at a campaign close.
    if (r.cites >= rules.checkFlagCitations && r.catches === 0) notes.push(`${r.id} cited ${r.cites} times with no catches — could become a check`);
    if (r.phases.size >= rules.rulebookPromotionPhases) notes.push(`${r.id} caught something in ${r.phases.size} phases — rulebook candidate (owner decides)`);
  }
  return { warnings, proposals, notes };
}

/**
 * `closedThrough` is the last session the clocks count as closed: age, ranking, the evidence window and
 * staleness all read it. `openSession` is only where an unlisted lesson counts as filed.
 */
export function evaluateLessons(input, rules = RULES) {
  const rows = input.lessons.map((lesson) => scoreLesson(lesson, input, rules));
  const limits = limitStops(rows, input, rules);
  const findings = lessonFindings(rows, input, rules);
  return { lessons: rows, stops: limits.stops, warnings: findings.warnings, proposals: [...limits.proposals, ...findings.proposals], notes: findings.notes };
}
