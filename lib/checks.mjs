// A project's check registry, docs/checks.md: each check's files, what it guards, the gate that runs it and its
// run time, plus a run-time budget for one gate. A check's last catch is never typed into the registry: it is read
// from `Check-Caught: <check>` footers, as a lesson's evidence is. Pure apart from readCheckRegistry.
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { FOOTER } from './rules.mjs';
import { footerShapeWarnings, runGit, short } from './history.mjs';
import { tableCells } from './rows.mjs';

export const CHECKS_FILE = 'docs/checks.md';
const BUDGET = /^Budget: (\S.*?) (\d+(?:\.\d+)?) s\s*$/gm;
const GLOBS = /^Check files: (.+)$/gm;
const ID = /^[a-z0-9][a-z0-9.-]*$/;
const SECONDS = /^(?:\d+(?:\.\d+)?|—)$/;
const ticked = (text) => [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

/** The registry's budget, its `Check files` globs and its rows; a table row in any other shape is malformed. */
export function parseChecks(markdown) {
  const budgets = [...markdown.matchAll(BUDGET)].map((m) => ({ gate: m[1], seconds: Number(m[2]) }));
  const rows = [];
  const malformed = [];
  for (const line of markdown.split('\n').filter((l) => /^\|/.test(l))) {
    const [id, files, guards, gate, seconds, ...rest] = tableCells(line);
    if (id === 'Check' || /^-+$/.test(id ?? '')) continue;
    if (rest.length || !ID.test(id) || ticked(files ?? '').length === 0 || !guards || !gate || !SECONDS.test(seconds ?? '')) malformed.push(line);
    else rows.push({ id, files: ticked(files), guards, gate, seconds: seconds === '—' ? null : Number(seconds) });
  }
  return {
    budget: budgets[0] ?? null,
    budgets: budgets.length,
    globs: [...markdown.matchAll(GLOBS)].flatMap((m) => ticked(m[1])),
    rows,
    malformed,
  };
}

// The checks a commit's `Check-Caught` footers name; one footer may name several, as Lesson-Caught may name several lessons.
const caughtIds = (commit) => commit.trailers.filter((t) => t.key === FOOTER.checkCaught).flatMap((t) => t.value.split(/,\s*/));

/** Each check's latest `Check-Caught` commit, by check ID; `commits` run oldest first. */
export function lastCatches(commits) {
  const last = new Map();
  for (const c of commits) for (const id of caughtIds(c)) last.set(id, c);
  return last;
}

/**
 * `Check-Caught` footers git didn't read (a blank line above Co-Authored-By) or a misspelt or miscased footer name,
 * which would drop a catch without a word. The audit reports these for every footer; `ledger.mjs checks`, which also
 * runs where there is no audit, reports them for this one.
 */
export function checkFooterProblems(commits) {
  return commits.flatMap((c) => footerShapeWarnings(`commit ${short(c.sha)}`, c, (p) => /^checks?-/i.test(p)));
}

const fmt = (s) => `${Math.round(s * 10) / 10} s`;
const time = (r) => (r.seconds === null ? '—' : fmt(r.seconds));
const named = (rows) => rows.map((r) => `${r.id} ${time(r)}`);

/**
 * What the report says about the registry. `tracked` is every tracked file its `Check files` globs match; `exists`
 * says whether a listed file is there; `recent` holds the commits whose footers are still checked (the open session and
 * the one before). Drift is a warning, fixed in minutes; the budget is a note, weighed at the campaign close.
 */
export function checkFindings({ registry, tracked, emptyGlobs = [], exists, commits, recent }) {
  // No registry yet: the report's CHECKS line says so, every session, without a warning to clear.
  if (registry === null) return { summary: null, rows: [], warnings: [], notes: [] };
  const parsed = parseChecks(registry);
  const listed = new Set(parsed.rows.flatMap((r) => r.files));
  const ids = new Set(parsed.rows.map((r) => r.id));
  const caught = lastCatches(commits);
  const gated = parsed.budget ? parsed.rows.filter((r) => r.gate === parsed.budget.gate) : [];
  const total = gated.reduce((sum, r) => sum + (r.seconds ?? 0), 0);
  const warnings = [
    ...(parsed.budget ? [] : [`${CHECKS_FILE} has no "Budget: <gate> <seconds> s" line`]),
    ...(parsed.budgets > 1 ? [`${CHECKS_FILE} has ${parsed.budgets} Budget lines; only the first, for ${parsed.budget.gate}, is counted`] : []),
    ...(parsed.budget && gated.length === 0 ? [`${CHECKS_FILE}'s budget gate ${parsed.budget.gate} is no row's gate, so the budget counts nothing`] : []),
    ...(parsed.globs.length ? [] : [`${CHECKS_FILE} has no "Check files:" line of backticked globs, so an unlisted check can't be found`]),
    ...emptyGlobs.map((g) => `${CHECKS_FILE}'s Check files glob ${g} matches no file — fix it, or an unlisted check there goes unseen`),
    ...parsed.malformed.map((raw) => `${CHECKS_FILE}: row isn't | <check> | <files> | <guards> | <gate> | <seconds or —> | — ${raw}`),
    ...tracked.filter((f) => !listed.has(f)).map((f) => `${f} matches ${CHECKS_FILE}'s Check files but no check lists it — add it to a row`),
    ...[...listed].filter((f) => !exists(f)).map((f) => `${CHECKS_FILE} lists ${f}, which isn't there — drop it, or the check with it`),
    ...recent.flatMap((c) => caughtIds(c).filter((id) => !ids.has(id)).map((id) => `commit ${short(c.sha)} ${FOOTER.checkCaught} names unknown check ${id}`)),
  ];
  const over = parsed.budget && total > parsed.budget.seconds;
  const slowest = gated.filter((r) => r.seconds !== null).sort((a, b) => b.seconds - a.seconds).slice(0, 3);
  return {
    summary: {
      file: CHECKS_FILE,
      count: parsed.rows.length,
      budget: parsed.budget,
      total,
      unmeasured: parsed.rows.filter((r) => r.seconds === null).length,
      // The budgeted gate's own unmeasured checks, which its total leaves out.
      gateUnmeasured: gated.filter((r) => r.seconds === null).length,
      caught: parsed.rows.filter((r) => caught.has(r.id)).length,
      slowest,
    },
    rows: parsed.rows.map((r) => ({ ...r, lastCaught: caught.get(r.id) ?? null })),
    warnings,
    notes: over ? [`${parsed.budget.gate} checks take ${fmt(total)}, over the ${fmt(parsed.budget.seconds)} budget — the slowest: ${named(slowest).join(', ')}; the campaign close's check review keeps, merges, moves or retires them`] : [],
  };
}

/** The registry text (null when there is none), every file its `Check files` globs match, and the globs that match none. */
export function readCheckRegistry(root) {
  const path = join(root, CHECKS_FILE);
  const registry = statSync(path, { throwIfNoEntry: false })?.isFile() ? readFileSync(path, 'utf8') : null;
  const exists = (file) => Boolean(statSync(join(root, file), { throwIfNoEntry: false }));
  // Untracked files count, so a new check is caught before its commit; a tracked file deleted in the working tree doesn't.
  // One git call per glob: a glob that matches nothing returns nothing and exits 0, and must not pass for a covered one.
  const matches = (registry === null ? [] : parseChecks(registry).globs).map((g) => ({
    g, files: runGit(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', `:(glob)${g}`]).split('\0').filter((f) => f && exists(f)),
  }));
  return { registry, tracked: [...new Set(matches.flatMap((m) => m.files))], emptyGlobs: matches.filter((m) => !m.files.length).map((m) => m.g), exists };
}

/** The report's CHECKS line, and the slowest checks the budget counts under it. */
export function checksLines(s) {
  if (!s) return [`CHECKS  no registry at ${CHECKS_FILE}`];
  const left = s.gateUnmeasured ? ` (${s.gateUnmeasured} unmeasured left out)` : '';
  const head = `CHECKS  ${s.file} · ${s.count} checks${s.budget ? ` · ${s.budget.gate} ${fmt(s.total)} of a ${fmt(s.budget.seconds)} budget${left}` : ''} · ${s.unmeasured} unmeasured · ${s.caught} with a catch`;
  return s.slowest.length ? [head, `  slowest: ${named(s.slowest).join(' · ')}`] : [head];
}

/** `ledger.mjs checks`: every check, slowest first, with its gate, run time and last catch. */
export function formatChecks(result) {
  const [head] = checksLines(result.summary);
  const rows = [...result.rows].sort((a, b) => (b.seconds ?? -1) - (a.seconds ?? -1)).map((r) => {
    const caught = r.lastCaught ? `caught ${r.lastCaught.date} ${short(r.lastCaught.sha)}` : 'no catch recorded';
    return `  ${r.id.padEnd(34)} ${r.gate.padEnd(12)} ${time(r).padStart(7)}  ${caught}`;
  });
  return [head, ...rows, ...result.warnings.map((w) => `  ⚠️  ${w}`), ...result.notes.map((n) => `  · ${n}`)].join('\n');
}
