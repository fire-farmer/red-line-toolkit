// Anchor and orphaned-home checks. The stale-home check takes the current campaign and runs on an
// open-only phase list, a zero-padded phase number names the same unit, and the unreadable-phase-line
// check keys on a phase label, not on a checkbox. Pure.
import { CAMPAIGN, STEP_ID } from './rows.mjs';

// Single source of truth for what counts as drift (vs ok / manual).
export const DRIFT_STATUSES = Object.freeze(['stale', 'missing-file', 'bad-pattern']);
export const isDrift = (status) => DRIFT_STATUSES.includes(status);

// {anchor: manual}  OR  {anchor: <file> :: <pattern>}
// file slot: no ':' or '}'. pattern: a /regex/ (the slashes let it contain '}', e.g. /a{2,3}/)
// or a brace-free literal. Global, so a row carrying several anchors is fully checked.
const ANCHOR_RE = /\{anchor:\s*(?:manual|([^:}]+?)\s*::\s*(\/[^\n]*?\/|[^}]+?))\s*\}/g;

export function parseAnchors(markdown) {
  const out = [];
  for (const line of markdown.split('\n')) {
    // Blockquote lines carry format-spec examples, never live rows.
    if (line.trimStart().startsWith('>')) continue;
    const raw = line.trim();
    for (const m of line.matchAll(ANCHOR_RE)) {
      if (m[1] === undefined) { out.push({ kind: 'manual', raw }); continue; }
      const file = m[1].trim();
      // A real path never contains angle brackets, so this only skips placeholders like <file>.
      if (file.includes('<') || file.includes('>')) continue;
      out.push({ kind: 'code', file, pattern: m[2].trim(), raw });
    }
  }
  return out;
}

// Anchors and count triggers share this convention: /regex/, or else a literal.
export const isRegexPattern = (pattern) => pattern.length > 2 && pattern.startsWith('/') && pattern.endsWith('/');

export function toMatcher(pattern) {
  if (isRegexPattern(pattern)) {
    try {
      const re = new RegExp(pattern.slice(1, -1));
      return { match: (text) => re.test(text) };
    } catch (e) {
      return { error: e.message };
    }
  }
  return { match: (text) => text.includes(pattern) };
}

export function classifyAnchor(anchor, io) {
  if (anchor.kind === 'manual') return { status: 'manual', anchor };
  if (!io.exists(anchor.file)) return { status: 'missing-file', anchor };
  const m = toMatcher(anchor.pattern);
  if ('error' in m) return { status: 'bad-pattern', anchor, detail: m.error };
  return { status: m.match(io.readText(anchor.file)) ? 'ok' : 'stale', anchor };
}

const DONE_STEP = new RegExp(String.raw`\b(${STEP_ID})\b`, 'g');
const PHASE_BULLET = /^\s*-\s*\[([ xX])\]\s*\*\*P(\d+)\b/;
// A list item whose label starts with P<n> or Phase <n>, in any case. A [x] checkbox and anything else before the label
// that isn't a letter or digit are skipped: a fixed list of markers missed 🏁, ✅ with a variation selector, links,
// emphasis and code spans. The number ends at a non-letter, non-digit, so P2P isn't a label and __P2__ is.
const PHASE_LABEL = /^\s*(?:[-*+]|\d+[.)])\s+(?:\[[xX]\]|[^\p{L}\p{N}])*P(?:hase)?[ -]?\d+(?![\p{L}\p{N}])/iu;

/**
 * Closed work units from STACK's Phases section at both granularities: a closed phase
 * (`- [x] **P6 …**` → "6") and the slices an open phase lists as done (`Done: 7.2/7.6b` →
 * "7.2", "7.6b"). The Done: list ends at a later `Open:` label or the end of the line — not at
 * a dot, because slice IDs contain one. A `-M`/`-C` split-half suffix is part of the ID, so
 * `Done: 7.8a-M` closes only that half and never the whole of 7.8a.
 */
export function parseClosedPhases(stack) {
  const closed = new Set();
  for (const line of stack.split('\n')) {
    const m = line.match(PHASE_BULLET);
    if (!m) continue;
    if (m[1].toLowerCase() === 'x') { closed.add(m[2]); continue; }
    const done = line.match(/\bDone:\s*(.*?)(?:\s+Open:|$)/i);
    if (done) for (const s of done[1].matchAll(DONE_STEP)) closed.add(s[1]);
  }
  return closed;
}

// The phase number reads as a number, so a padded 07 or 07.2 names the same unit as 7 or 7.2.
const canonicalUnit = (unit) => unit.replace(/^\d+/, (phase) => String(Number(phase)));

/**
 * Whether a unit (`7`, `7.2`, `7.8a-M`) is closed: it, or its whole phase, is in `closed`, because a
 * closed phase's line records only the phase number. The stale-home check, `after` triggers and
 * placement all ask this one question, so they can't disagree about a padded number.
 */
export function isClosedUnit(closed, unit) {
  const targets = [unit, unit.split('.')[0]].map(canonicalUnit);
  return [...closed].some((c) => targets.includes(canonicalUnit(c)));
}

/**
 * 1-based numbers of the list items in STACK's `## Phases` section labelled as a phase that aren't
 * `- [ ] **P<n> …**` or `- [x] **P<n> …**` bullets: another bullet, a marker such as ✅, 🏁 or ~~, no checkbox,
 * or a label that isn't a bold, capital `P<n>`. parseClosedPhases can't read them, so a phase closed that way
 * would silently count as open. The label decides: a campaign close's `- [x] **<Campaign>** — COMPLETE` line
 * doesn't start with a phase.
 */
export function unrecognizedPhaseLines(stack) {
  const out = [];
  let inPhases = false;
  stack.split('\n').forEach((line, i) => {
    if (/^## /.test(line)) inPhases = /^## Phases\b/.test(line);
    if (inPhases && PHASE_LABEL.test(line) && !PHASE_BULLET.test(line)) out.push(i + 1);
  });
  return out;
}

// A campaign close collapses its phases into one `- [x] **<Campaign>** — COMPLETE <date>` line (red-line-toolkit/reference/ledger-session.md § End).
const CLOSED_CAMPAIGN = new RegExp(String.raw`^\s*-\s*\[[xX]\]\s*\*\*(${CAMPAIGN})\*\*`);

/**
 * Campaigns STACK's `## Phases` section marks closed. The bold run must be the campaign name alone,
 * so a phase bullet (`**P7 tell-cleanup**`) or a prose label (`**Mobile UX fixes**`) never matches.
 */
export function closedCampaigns(stack) {
  const closed = new Set();
  let inPhases = false;
  for (const line of stack.split('\n')) {
    if (/^## /.test(line)) inPhases = /^## Phases\b/.test(line);
    const m = inPhases ? line.match(CLOSED_CAMPAIGN) : null;
    if (m && !/^P(?:hase)?-?\d+$/i.test(m[1])) closed.add(m[1]);
  }
  return closed;
}

const PHASE_HOME = new RegExp(String.raw`home:\s*(${CAMPAIGN})\/(${STEP_ID}|\d+)`, 'g');

/** `home: <Campaign>/<phase>[.<step>]`, keeping the split-half suffix so both sides compare alike. */
export function parsePhaseHomes(markdown) {
  const out = [];
  for (const line of markdown.split('\n')) {
    if (line.trimStart().startsWith('>')) continue;
    for (const [, campaign, slice] of line.matchAll(PHASE_HOME)) {
      out.push({ campaign, phase: Number(slice.split('.')[0]), slice, raw: line.trim() });
    }
  }
  return out;
}

/** The campaign owning the most phase-numbered homes, the audit's fallback when no Phase: footer names one. Null when there are none. */
export function activeCampaign(homes) {
  const counts = new Map();
  for (const h of homes) counts.set(h.campaign, (counts.get(h.campaign) ?? 0) + 1);
  let best = null;
  let max = 0;
  for (const [campaign, n] of counts) if (n > max) { max = n; best = campaign; }
  return best;
}

/**
 * Homes pointing at a closed unit of `campaign`, the current one. STACK's phases belong to that
 * campaign alone, so homes in any other come back unchecked in `elsewhere`. Any phase bullet the
 * parser reads is enough to compare against, an open one included: in a campaign's first phase
 * nothing is closed yet, so no home can be stale. Only when STACK has none at all does it say it
 * couldn't compare, instead of returning a passing empty list.
 */
export function auditStaleHomes(stack, markdowns, campaign) {
  const closed = parseClosedPhases(stack);
  const homes = markdowns.flatMap(parsePhaseHomes);
  const current = homes.filter((h) => h.campaign === campaign);
  const elsewhere = homes.filter((h) => h.campaign !== campaign);
  if (current.length > 0 && !stack.split('\n').some((line) => PHASE_BULLET.test(line))) {
    return {
      verifiable: false, stale: [], campaign, elsewhere, homeCount: current.length,
      reason: 'no "- [x] **P<n>" phase bullets found in STACK.md, so no phase can be seen as closed',
    };
  }
  return { verifiable: true, stale: current.filter((h) => isClosedUnit(closed, h.slice)), campaign, elsewhere };
}
