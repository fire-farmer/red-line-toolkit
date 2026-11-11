import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { auditProject } from '../lib/audit.mjs';
import { CHECKS_FILE, checkFindings, checkFooterProblems, readCheckRegistry } from '../lib/checks.mjs';
import { formatReport } from '../lib/format.mjs';
import { CO, makeLedgerProject } from './helpers/ledger-fixture.mjs';
import { root } from './helpers/process-docs.mjs';

const REGISTRY = [
  '# Checks', '', 'Budget: pre-commit 3 s', 'Budget: lint 1 s',
  'Check files: `scripts/*.test.ts` `src/**/*-guard.test.ts`', 'Check files: `eslint-rules/*.mjs` `tests/nope/*.test.ts`', '',
  '| Check | Files | Guards | Gate | Seconds |', '|---|---|---|---|---|',
  '| gold-ban | `scripts/gold-ban.test.ts` `scripts/gold-ban.core.test.ts` | no raw gold | pre-commit | 2.5 |',
  '| route-auth | `src/lib/auth/route-auth-guard.test.ts` | every route calls a guard | pre-commit | 1.5 |',
  '| visual | `tests/visual/a.spec.ts` | the buttons render | pre-commit | — |',
  '| eslint-rule | `eslint-rules/x.mjs` | a lint rule | lint | 0.4 |',
  '| bad-row | `scripts/x.ts` | x | pre-commit | soon |', '',
].join('\n');

function setup(t, { registry = REGISTRY, reasonsFrom } = {}) {
  const { repo, project } = makeLedgerProject();
  t.after(repo.cleanup);
  const processRoot = mkdtempSync(join(tmpdir(), 'ledger-process-'));
  t.after(() => rmSync(processRoot, { recursive: true, force: true }));
  mkdirSync(join(processRoot, 'reference'));
  writeFileSync(join(processRoot, 'reference', 'rules.md'), '# Rules reference\n');
  const files = { 'scripts/gold-ban.test.ts': 'x', 'scripts/gold-ban.core.test.ts': 'x', 'src/lib/auth/route-auth-guard.test.ts': 'x', 'eslint-rules/x.mjs': 'x' };
  repo.commit(`test: add checks\n\nBody.\n\nCheck-Caught: gold-ban, route-auth\n${CO}\n`, { ...files, ...(registry ? { [CHECKS_FILE]: registry } : {}) });
  const typo = repo.commit(`fix: a typo'd catch\n\nBody.\n\nCheck-Caught: gold-bann\n${CO}\n`);
  // Untracked: a new check is seen before its commit.
  repo.write('scripts/new-ban.test.ts', 'x');
  const audit = () => auditProject({ project: { ...project, reasonsFrom }, processRoot, today: '2026-09-10' });
  return { audit, typo };
}

test('the check registry: drift is a warning, the budget a note, and a catch comes from its Check-Caught footer', (t) => {
  const { audit, typo } = setup(t);
  const r = audit();
  assert.deepEqual(r.stops, []);
  assert.deepEqual(r.warnings, [
    'docs/checks.md has 2 Budget lines; only the first, for pre-commit, is counted',
    "docs/checks.md's Check files glob tests/nope/*.test.ts matches no file — fix it, or an unlisted check there goes unseen",
    "docs/checks.md: row isn't | <check> | <files> | <guards> | <gate> | <seconds or —> | — | bad-row | `scripts/x.ts` | x | pre-commit | soon |",
    "scripts/new-ban.test.ts matches docs/checks.md's Check files but no check lists it — add it to a row",
    "docs/checks.md lists tests/visual/a.spec.ts, which isn't there — drop it, or the check with it",
    `commit ${typo.slice(0, 7)} Check-Caught names unknown check gold-bann`,
  ]);
  assert.deepEqual(r.notes, ['pre-commit checks take 4 s, over the 3 s budget — the slowest: gold-ban 2.5 s, route-auth 1.5 s; the campaign close\'s check review keeps, merges, moves or retires them']);
  const { slowest, ...summary } = r.checks;
  assert.deepEqual(summary, { file: 'docs/checks.md', count: 4, budget: { gate: 'pre-commit', seconds: 3 }, total: 4, unmeasured: 1, gateUnmeasured: 1, caught: 2 });
  assert.deepEqual(slowest.map((c) => c.id), ['gold-ban', 'route-auth'], 'an unmeasured check is not ranked');
  assert.match(formatReport(r), /^CHECKS {2}docs\/checks\.md · 4 checks · pre-commit 4 s of a 3 s budget \(1 unmeasured left out\) · 1 unmeasured · 2 with a catch\n {2}slowest: gold-ban 2\.5 s · route-auth 1\.5 s$/m);
});

test('no registry is a line in the report; a budget gate no row names, or a footer the checks cannot read, is a warning', (t) => {
  const r = setup(t, { registry: null }).audit();
  assert.equal(r.checks, null);
  assert.deepEqual([r.warnings, r.notes], [[], []]);
  assert.match(formatReport(r), /^CHECKS {2}no registry at docs\/checks\.md$/m);
  const typoGate = checkFindings({ registry: REGISTRY.replace('Budget: pre-commit', 'Budget: pre-comit'), tracked: [], exists: () => true, commits: [], recent: [] });
  assert.ok(typoGate.warnings.includes("docs/checks.md's budget gate pre-comit is no row's gate, so the budget counts nothing"));
  const commit = { sha: 'abcdef0123', trailers: [{ key: 'Check-caught', value: 'a' }, { key: 'Checks-Caught', value: 'b' }], body: 'Check-Caught: c\n\nCo-Authored-By: x' };
  assert.deepEqual(checkFooterProblems([commit]), [
    "commit abcdef0 has footers git didn't read — a blank line above Co-Authored-By drops them: Check-Caught: c",
    'commit abcdef0 has a malformed ledger footer: Check-caught: a — footer names are case-sensitive; write Check-Caught',
    'commit abcdef0 has a malformed ledger footer: Checks-Caught: b — not a LedgerLoop footer name',
  ]);
});

test("the audit stops on a row from the project's reasonsFrom ID on that names no reason", (t) => {
  // The fixture's STACK rows FU-1 to FU-5 and its Standing row FU-6 name none: below FU-4 they are grandfathered.
  const stops = setup(t, { reasonsFrom: 'FU-4' }).audit().stops;
  assert.deepEqual(stops.map((s) => s.split(' ')[0]), ['FU-4', 'FU-5', 'FU-6']);
});

test("this repo's own registry lists every test file, and `ledger.mjs checks` prints it", () => {
  const registry = readCheckRegistry(root);
  // Positive control: the globs reach this file and the mod's test.
  for (const known of ['tests/checks.test.mjs', 'mods/fable-seat-guard/hooks/seat.test.ts']) assert.ok(registry.tracked.includes(known), known);
  // History is left out: a footer in a past commit is the report's to warn on, never a red suite.
  assert.deepEqual(checkFindings({ ...registry, commits: [], recent: [] }).warnings, []);
  const out = spawnSync(process.execPath, [join(root, 'scripts', 'ledger.mjs'), 'checks'], { cwd: root, encoding: 'utf8' });
  assert.equal(out.status, 0, out.stderr);
  assert.match(out.stdout, /^CHECKS {2}docs\/checks\.md · \d+ checks · npm test .*\n {2}\S/);
});
