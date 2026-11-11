// Parsers for the LedgerLoop row formats. Pure: markdown in, records out.
import { FU_REASONS, RIGORS } from './rules.mjs';

// A step number with an optional letter and an optional split-half suffix: 7.11, 7.8a, 7.8a-C.
// Homes, `after` triggers, step-order cells and git history all build on this one pattern,
// because a gate that parses its two inputs by different rules silently answers the wrong question.
export const STEP_ID = '\\d+\\.\\d+[a-z]?(?:-[A-Za-z]+)?';
// A campaign name (Refactor, Module3, DesignRevamp), shared by the same parsers for the same reason.
export const CAMPAIGN = '[A-Za-z][\\w-]*';

const LESSON_ROW = /^- \*\*L-(\d+)\*\* (.+?) → (\S+#l-(\d+))\s*$/;
const RULE_ROW = /^- \*\*R-(\d+)\*\* (.+?) → (\S+#r-(\d+))\s*$/;
// The rigor is read loosely so a slash or a typo gets a reason that says what to fix.
const FU_ROW = /^- \*\*FU-(\d+)\*\* \[([a-z0-9-]+) · ([^\]]+)\] (.+)$/;
// The filing bar's named reason, the last part of an FU's text before its home or trigger.
const REASON = new RegExp(String.raw` — why not now: (${FU_REASONS.join('|')}): (\S.*)$`);
// Anything meant as an FU row, whatever its shape: a bold FU ID or a `[type · rigor]` tag.
const FU_MARK = /\*\*FU-\d+\*\*|\[[^\]\s·]+ · [^\]]+\]/;
export const FU_SECTION = /^## Follow-ups\b/;
export const LESSON_SECTION = /^## Lessons\b/;
// Pre-LedgerLoop /module-audit Stage 5 appended deferred findings with this marker, bulleted or not.
const LEGACY_FINDING = '(from /module-audit ';
const HOME = new RegExp(String.raw`^(${CAMPAIGN})\/(${STEP_ID})$`);
const TRIGGER = new RegExp(
  String.raw`^(?:date (\d{4}-\d{2}-\d{2})|after (${CAMPAIGN})\/(${STEP_ID}|\d+)|count \{anchor: ([^:}]+?) :: (\/[^\n]*?\/|[^}]+?)\} >= (\d+)|owner decision — (.+))$`,
);
// One {anchor: …} at the very end of a row. Stripping these from the end, one at a time, never
// reaches a count trigger's own anchor, which is always followed by `>= <n>`.
const TRAILING_ANCHOR = /\s+(\{anchor:(?:(?!\{anchor:).)*\})\s*$/;
const RESOLVED = /^(?:- ~~|- \[[xX]\]|\| *~~|- ✅|\| *✅)|\*\*RESOLVED/;
const POINTER = new RegExp(String.raw`<!--\s*ledger:step-order\s+(${CAMPAIGN})\/(\d+)\s+(\S+)\s*-->`, 'g');
const STEP_CELL = new RegExp(String.raw`^\|\s*\**(${STEP_ID})\b`);
const GROUP_STEPS = /^## Group steps\b/;
// An Order cell that schedules nothing; migrate/review.mjs re-exports this so render-fus.mjs and
// review.mjs's own scheduling check read the one pattern instead of a second, driftable copy.
export const NO_ORDER = /^(?:|—|-|TBD)$/i;

/**
 * Lines under the first `## ` heading matching `heading`, up to the next `## ` heading, and how many
 * headings match: every check reads only the first, so a second section would go unchecked. `lines`
 * is null when no heading matches, so a renamed heading can't read as an empty ledger that passes
 * every check.
 */
export function sectionLines(markdown, heading) {
  const lines = markdown.split('\n');
  const starts = lines.flatMap((l, i) => (/^## /.test(l) && heading.test(l) ? [i] : []));
  if (starts.length === 0) return { lines: null, count: 0 };
  const out = [];
  for (let i = starts[0] + 1; i < lines.length && !/^## /.test(lines[i]); i++) out.push(lines[i]);
  return { lines: out, count: starts.length };
}

/**
 * 1-based numbers of the lines shaped like `prefix` rows — a "- " item led by a bold ID, struck or
 * checked ones included — outside every section `heading` matches, where no check would read them.
 * Position decides, not content, so a copy of a listed row elsewhere is caught too. A blockquote
 * never matches: it's a format example.
 */
export function rowsOutside(markdown, heading, prefix) {
  const shaped = new RegExp(String.raw`^- (?:~~|\[[xX]\]|✅)?\s*\*\*${prefix}-\d+\*\*`);
  const out = [];
  let inside = false;
  markdown.split('\n').forEach((line, i) => {
    if (/^## /.test(line)) inside = heading.test(line);
    if (!inside && shaped.test(line)) out.push(i + 1);
  });
  return out;
}

/**
 * Lesson or rule rows: `- **L-7** <rule> → <doc>#l-7`. A line naming an ID in any other shape is
 * malformed rather than skipped, and so is a reference link to another item's entry.
 */
function parseListRows(lines, prefix, re) {
  const idMark = new RegExp(String.raw`\*\*${prefix}-\d+\*\*`);
  const rows = [];
  const malformed = [];
  for (const line of lines ?? []) {
    if (line.trimStart().startsWith('>')) continue;
    const m = line.match(re);
    if (m && m[4] === m[1]) rows.push({ id: `${prefix}-${m[1]}`, n: Number(m[1]), rule: m[2], ref: m[3], raw: line });
    else if (line.startsWith('- ') || idMark.test(line)) malformed.push(line);
  }
  return { found: lines !== null, rows, malformed };
}

export function parseLessons(stackMd) {
  return parseListRows(sectionLines(stackMd, LESSON_SECTION).lines, 'L', LESSON_ROW);
}

export function parseRules(rulebookMd) {
  return parseListRows(sectionLines(rulebookMd, /^## Rules\b/).lines, 'R', RULE_ROW);
}

// How a lesson that left STACK records its end in its reference entry. The audit and the pilot read this
// one pattern, so a shape one accepts can't fail the other (a bold **Outcome:** passed the audit and failed the pilot).
export const OUTCOME_LINE = /^Outcome: /m;

/** The reference doc's `## L-<n>` entries by lesson ID, each running from its heading to the next entry's. */
export function lessonEntries(referenceMd) {
  return new Map(referenceMd.split(/^(?=## L-\d+\b)/m).map((s) => [s.match(/^## (L-\d+)\b/)?.[1], s]).filter(([id]) => id));
}

export function parseTrigger(text) {
  const m = text.match(TRIGGER);
  if (!m) return null;
  if (m[1]) return { kind: 'date', date: m[1] };
  if (m[2]) return { kind: 'after', campaign: m[2], unit: m[3] };
  if (m[4]) return { kind: 'count', file: m[4].trim(), pattern: m[5].trim(), min: Number(m[6]) };
  return { kind: 'owner', question: m[7].trim() };
}

/** One `- ` line as an FU row, or `{reason}` saying what to fix. */
function parseFuRow(line, kind) {
  const head = line.match(FU_ROW);
  if (!head) return { reason: 'not an FU row' };
  const [, n, type, rigor, text] = head;
  if (!RIGORS.includes(rigor)) return { reason: 'rigor must be cleanup-light or change-heavy (no slash)' };
  const marker = kind === 'stack' ? ' — home: ' : ' — trigger: ';
  const at = text.lastIndexOf(marker);
  if (at < 0) return { reason: `missing "${marker.trim()}"` };
  let rest = text.slice(at + marker.length);
  const anchors = [];
  for (let a = rest.match(TRAILING_ANCHOR); a; a = rest.match(TRAILING_ANCHOR)) {
    anchors.unshift(a[1]);
    rest = rest.slice(0, a.index);
  }
  const what = text.slice(0, at);
  const why = what.match(REASON);
  const base = { id: `FU-${n}`, n: Number(n), type, rigor, what, whyNotNow: why ? { kind: why[1], text: why[2] } : null, anchors, raw: line };
  if (kind === 'standing') {
    const trigger = parseTrigger(rest.trim());
    return trigger ? { ...base, trigger } : { reason: 'trigger is not checkable' };
  }
  const home = rest.trim().match(HOME);
  if (!home) return { reason: 'home is not <Campaign>/<Phase>.<Step>' };
  if (anchors.length === 0) return { reason: 'STACK FU needs an {anchor: …} (use {anchor: manual} for architectural or absence FUs)' };
  const [, campaign, step] = home;
  return { ...base, campaign, phase: Number(step.split('.')[0]), step, home: `${campaign}/${step}` };
}

const isLegacyFinding = (line, kind) => line.includes(LEGACY_FINDING) && 'reason' in parseFuRow(line, kind);

/** 1-based numbers of the legacy /module-audit finding lines anywhere in a ledger file; a blockquote is a format example. */
export function legacyFindingLines(markdown, kind) {
  return markdown.split('\n').flatMap((line, i) => (!line.trimStart().startsWith('>') && isLegacyFinding(line, kind) ? [i + 1] : []));
}

/**
 * FU rows: STACK rows carry a group-step `home:` and an anchor, Standing rows a checkable
 * `trigger:`. An FU in any shape but a top-level `- ` item is malformed, so a table row can't
 * escape the checks. Resolved rows come back separately, because leaving one in a file is itself
 * a breach. A legacy /module-audit finding is left out: legacyFindingLines reports it once, by
 * line number. `found` is false when there was no section to read.
 */
export function parseFus(lines, kind) {
  const rows = [];
  const malformed = [];
  const resolved = [];
  for (const line of lines ?? []) {
    if (line.trimStart().startsWith('>') || isLegacyFinding(line, kind)) continue;
    if (RESOLVED.test(line)) { resolved.push(line); continue; }
    if (!line.startsWith('- ')) {
      if (FU_MARK.test(line)) malformed.push({ raw: line, reason: 'FU rows are "- " list items, not table rows or other list shapes' });
      continue;
    }
    const row = parseFuRow(line, kind);
    if ('reason' in row) malformed.push({ raw: line, reason: row.reason });
    else rows.push(row);
  }
  return { found: lines !== null, rows, malformed, resolved };
}

export function parseStepOrderPointers(stackMd) {
  return [...stackMd.matchAll(POINTER)].map((m) => ({ campaign: m[1], phase: Number(m[2]), doc: m[3] }));
}

/** A markdown table row's cells, trimmed. */
export const tableCells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
// The 4th cell of `| Step | Group type | Rigor | Order |`, never the last: a short row's last cell is its Rigor.
const orderCell = (line) => tableCells(line)[3];

/**
 * Step IDs the step order schedules: the first cell of a table row. A crossed-out row doesn't
 * count, and neither does a `## Group steps` row without a real Order, because filing FUs into a
 * group step never schedules it. Group-step rows too short to have an Order cell come back in
 * `noOrderCell`, so the audit can say why their steps aren't scheduled.
 */
export function parseStepIds(docMd) {
  const ids = new Set();
  const noOrderCell = [];
  let inGroupSteps = false;
  for (const line of docMd.split('\n')) {
    if (/^## /.test(line)) inGroupSteps = GROUP_STEPS.test(line);
    const m = line.match(STEP_CELL);
    if (!m) continue;
    if (!inGroupSteps) { ids.add(m[1]); continue; }
    const order = orderCell(line);
    if (order === undefined) noOrderCell.push(m[1]);
    else if (!NO_ORDER.test(order)) ids.add(m[1]);
  }
  return { ids, noOrderCell };
}

export function maxId(texts, prefix) {
  const re = new RegExp(`\\b${prefix}-(\\d+)\\b`, 'g');
  let max = 0;
  for (const text of texts) for (const m of text.matchAll(re)) max = Math.max(max, Number(m[1]));
  return max;
}
