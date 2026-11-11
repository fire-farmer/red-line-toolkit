// Git history as ledger evidence: commits and their footers, session numbers, and when rows
// were listed. The parsing functions are pure; runGit, readCommits, fileHistory and showAtHead
// read the repository.
import { execFileSync } from 'node:child_process';
import { FOOTER, SESSION_SUBJECT } from './rules.mjs';
import { CAMPAIGN, STEP_ID } from './rows.mjs';

const FIELD = '\x1f';
const RECORD = '\x1e';
const FOOTER_LINE = new RegExp(`^(${Object.values(FOOTER).join('|')}):\\s*(\\S.*)$`);
// Ends at whitespace or the end of the line, so a split half (7.11-M) is never cut back to 7.11.
const HOME_IN_ROW = new RegExp(String.raw` — home: (${CAMPAIGN}\/${STEP_ID})(?=\s|$)`);
// The one form of a Phase: value that names a phase. phaseBySession keeps only these; the audit warns when the last session commit's isn't one.
export const PHASE_VALUE = new RegExp(String.raw`^${CAMPAIGN}\/\d+$`);
// The one list of evidence footers: footer events, the audit's unknown-ID check and EXPECTED_ID all read it.
export const EVENT_KIND = { [FOOTER.caught]: 'caught', [FOOTER.cited]: 'cited', [FOOTER.closed]: 'closed' };
// A key shaped like a ledger footer, so a misspelling is reported instead of silently ignored.
const LEDGER_SHAPED_KEY = /^(lessons?|fu|checks?)-/i;
const LESSON_OR_RULE = { re: /\b[LR]-\d+\b/, problem: 'names no L-<n> or R-<n> ID' };
const ID_OF_KIND = { caught: LESSON_OR_RULE, cited: LESSON_OR_RULE, closed: { re: /\bFU-\d+\b/, problem: 'names no FU-<n> ID' } };
// An evidence footer must name an ID of its kind; Lesson-Check is the one footer that takes `none`, and takes nothing else.
const EXPECTED_ID = {
  ...Object.fromEntries(Object.entries(EVENT_KIND).map(([key, kind]) => [key, ID_OF_KIND[kind]])),
  [FOOTER.check]: { re: /^none$/, problem: 'takes only none' },
};

// The one definition of a ledger ID: footer events and the audit's unknown-ID check both use it.
export const ITEM_ID = /\b(?:L|R|FU)-\d+\b/g;
export const LESSON_ROW_ID = /^- \*\*(L-\d+)\*\*/g;
export const FU_ROW_ID = /^- \*\*(FU-\d+)\*\*/g;

export function runGit(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

export function readCommits(repo) {
  const out = runGit(repo, ['log', '--reverse', '--format=%H%x1f%as%x1f%s%x1f%(trailers:only,unfold)%x1f%B%x1e']);
  return out
    .split(RECORD)
    .map((record) => record.replace(/^\n/, ''))
    .filter(Boolean)
    .map((record) => {
      const [sha, date, subject, trailerText, body] = record.split(FIELD);
      return { sha, date, subject, trailers: parseTrailers(trailerText), body };
    });
}

export function parseTrailers(text) {
  return text
    .split('\n')
    .map((line) => line.match(/^([A-Za-z][\w-]*):\s*(.*)$/))
    .filter(Boolean)
    .map((m) => ({ key: m[1], value: m[2].trim() }));
}

/** Footer lines git didn't read — almost always a blank line between them and Co-Authored-By. */
export function unreadFooters(commit) {
  const read = new Set(commit.trailers.map((t) => `${t.key}: ${t.value}`));
  const unread = [];
  for (const line of commit.body.split('\n')) {
    const m = line.trim().match(FOOTER_LINE);
    if (m && !read.has(`${m[1]}: ${m[2].trim()}`)) unread.push(`${m[1]}: ${m[2].trim()}`);
  }
  return unread;
}

function footerProblem(key, value) {
  const name = Object.values(FOOTER).find((footer) => footer.toLowerCase() === key.toLowerCase());
  if (name && name !== key) return `footer names are case-sensitive; write ${name}`;
  if (!name) return LEDGER_SHAPED_KEY.test(key) ? 'not a LedgerLoop footer name' : null;
  const expected = EXPECTED_ID[key];
  return expected && !expected.re.test(value) ? expected.problem : null;
}

/**
 * Footers git read but the ledger can't use: a name that differs from a LedgerLoop footer only in
 * case, a ledger-shaped name that isn't one, or a caught, cited or closed footer naming no ID of
 * its kind. Each would otherwise drop its evidence without a word.
 */
export function malformedFooters(commit) {
  const problems = [];
  for (const { key, value } of commit.trailers) {
    const why = footerProblem(key, value);
    if (why) problems.push(`${key}: ${value} — ${why}`);
  }
  return problems;
}

export const short = (sha) => sha.slice(0, 7);

/**
 * Report lines, led by `lead`, for a commit's ledger footers that git didn't read and for those it read that the ledger
 * can't use. `keep` narrows them to some footers: `ledger.mjs checks` keeps the Check-Caught ones.
 */
export function footerShapeWarnings(lead, commit, keep = () => true) {
  const unread = unreadFooters(commit).filter(keep);
  return [
    ...(unread.length ? [`${lead} has footers git didn't read — a blank line above Co-Authored-By drops them: ${unread.join('; ')}`] : []),
    ...malformedFooters(commit).filter(keep).map((m) => `${lead} has a malformed ledger footer: ${m}`),
  ];
}

/**
 * Session k is every commit after the (k-1)th end-session sync commit, up to and including the
 * kth. Commits after the last sync belong to the open session, which the next sync will close.
 */
export function assignSessions(commits) {
  const sessionOf = new Map();
  let session = 1;
  for (const c of commits) {
    sessionOf.set(c.sha, session);
    if (SESSION_SUBJECT.test(c.subject)) session += 1;
  }
  return { sessionOf, closed: session - 1, openSession: session };
}

/** Each session's latest valid Phase: value. An invalid value names no phase, so it counts toward no campaign or rulebook candidate. */
export function phaseBySession(commits, sessionOf) {
  const phases = new Map();
  for (const c of commits) {
    const phase = c.trailers.findLast((t) => t.key === FOOTER.phase && PHASE_VALUE.test(t.value));
    if (phase) phases.set(sessionOf.get(c.sha), phase.value);
  }
  return phases;
}

export function footerEvents(commits, sessionOf) {
  const events = [];
  for (const c of commits) {
    for (const t of c.trailers) {
      const kind = EVENT_KIND[t.key];
      if (!kind) continue;
      for (const id of t.value.match(ITEM_ID) ?? []) events.push({ kind, id, session: sessionOf.get(c.sha), sha: c.sha });
    }
  }
  return events;
}

/**
 * Added and removed lines per commit that touched `file`, oldest first, along HEAD's first-parent
 * line. A merge commit shows its diff against its first parent, so rows filed or removed while
 * resolving a conflict still count. The merged branch's own commits are left out: that diff already
 * carries their lines, and a row counted twice would stay listed after its removal.
 * `everyCommit` walks every parent instead, for the texts an issued ID can appear in: a row a branch
 * added and dropped never reaches the first-parent line, but it took its ID. --full-history, because
 * git's default walk prunes a merged branch whose net change to the file is nothing.
 */
export function fileHistory(repo, file, { everyCommit = false } = {}) {
  const walk = everyCommit ? '--full-history' : '--first-parent';
  const out = runGit(repo, ['log', '--reverse', walk, '--format=@@@%H', '-p', '-U0', '--diff-merges=first-parent', '--', file]);
  return out.split(/^@@@/m).filter(Boolean).map((chunk) => {
    const [sha, ...lines] = chunk.split('\n');
    const added = [];
    const removed = [];
    let inHunk = false;
    for (const line of lines) {
      if (line.startsWith('diff --git')) inHunk = false;
      else if (line.startsWith('@@ ')) inHunk = true;
      else if (inHunk && line.startsWith('+')) added.push(line.slice(1));
      else if (inHunk && line.startsWith('-')) removed.push(line.slice(1));
    }
    return { sha: sha.trim(), added, removed };
  });
}

/**
 * Lines changed per file in every commit, keyed by SHA: added plus deleted, a binary file counting 0.
 * Renames are detected and keep git's `{old => new}` path form; a merge commit lists no files.
 */
export function readNumstat(repo) {
  const out = runGit(repo, ['-c', 'core.quotepath=off', 'log', '-M', '--numstat', '--format=@@@%H']);
  const bySha = new Map();
  for (const chunk of out.split(/^@@@/m).filter(Boolean)) {
    const [sha, ...lines] = chunk.split('\n');
    const files = [];
    for (const line of lines) {
      const m = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
      if (m) files.push({ file: m[3], lines: (Number(m[1]) || 0) + (Number(m[2]) || 0) });
    }
    bySha.set(sha.trim(), files);
  }
  return bySha;
}

/** How many of `lines` are rows of each ID. */
function rowCounts(lines, rowId) {
  const counts = new Map();
  for (const line of lines) for (const [, id] of line.matchAll(rowId)) counts.set(id, (counts.get(id) ?? 0) + 1);
  return counts;
}

/**
 * Each time an ID's listing starts or ends, oldest first. An ID is listed while any line is its row:
 * the listing starts when that count leaves 0 and ends when it returns to 0. A commit nets its
 * removals against its additions, so a rewording (one line out, one in) is neither, and removing a
 * stray copy of a row leaves the listing running. listedSince and listingStarts both read this, so
 * they agree on what a start is.
 */
export function listingChanges(history, rowId) {
  const changes = [];
  const count = new Map();
  for (const { sha, added, removed } of history) {
    const net = rowCounts(added, rowId);
    for (const [id, n] of rowCounts(removed, rowId)) net.set(id, (net.get(id) ?? 0) - n);
    for (const [id, n] of net) {
      const before = count.get(id) ?? 0;
      count.set(id, before + n);
      if (before === 0 && n > 0) changes.push({ id, sha, start: true });
      else if (before > 0 && before + n === 0) changes.push({ id, sha, start: false });
    }
  }
  return changes;
}

/** The commit that began each listed ID's current listing. */
export function listedSince(history, rowId) {
  const since = new Map();
  for (const { id, sha, start } of listingChanges(history, rowId)) {
    if (start) since.set(id, sha);
    else since.delete(id);
  }
  return since;
}

/** How many times each ID's listing began; a lesson's revivals are its starts minus one. */
export function listingStarts(history, rowId) {
  const starts = new Map();
  for (const { id, start } of listingChanges(history, rowId)) if (start) starts.set(id, (starts.get(id) ?? 0) + 1);
  return starts;
}

export function lastTouchByHome(history) {
  const touch = new Map();
  for (const { sha, added, removed } of history) {
    for (const line of [...added, ...removed]) {
      const m = line.match(HOME_IN_ROW);
      if (m) touch.set(m[1], sha);
    }
  }
  return touch;
}

export function showAt(repo, ref, file) {
  if (!runGit(repo, ['ls-tree', '--name-only', ref, '--', file]).trim()) return null;
  return runGit(repo, ['show', `${ref}:${file}`]);
}

export const showAtHead = (repo, file) => showAt(repo, 'HEAD', file);

/**
 * Files the working tree changes against `since` (HEAD, or a commit before it), staged, unstaged or untracked, as paths
 * from `repo`'s top level. A renamed file counts under both names, since FUs are anchored to the old one;
 * red-line-toolkit/reference/pipeline-shared.md § The review panel's CHANGED lists only the new. `repo` must be that top level: `ls-files --others` prints paths relative
 * to the directory it runs in, `diff --name-only` from the top.
 */
export function changedFiles(repo, since = 'HEAD') {
  const list = (args) => runGit(repo, ['-c', 'core.quotepath=off', ...args]).split('\n').filter(Boolean);
  return [...new Set([...list(['diff', '--name-only', '--no-renames', since]), ...list(['ls-files', '--others', '--exclude-standard'])])];
}
