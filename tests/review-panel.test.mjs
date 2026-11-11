import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { read } from './helpers/process-docs.mjs';

// The trigger snippet in reference/pipeline-shared.md § The review panel picks /cleanup-light's Stage 3 critics and
// review-pr's aspects. A count that comes out wrong drops a critic without a word, so each count runs here against a
// throwaway git repo per case. Every case starts at load and runs at once, so the file takes about as long as its
// slowest case (docs/checks.md keeps it under about 5 s).
const SOURCE = process.env.REVIEW_PANEL_SOURCE ?? 'reference/pipeline-shared.md';
const blocks = [...read(SOURCE).matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]).filter((b) => b.includes('echo "errors='));
const SNIPPET = blocks[0];
const exec = promisify(execFile);
const GIT = '-c user.name=Fixture -c user.email=fixture@example.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null';

/** Counts for a repo whose HEAD holds `base` and whose working tree then holds `change` (null deletes a file), with the
 * `intent` paths marked intent-to-add as § The review panel says. */
async function counts(base, change, intent = []) {
  const dir = await mkdtemp(join(tmpdir(), 'review-panel-'));
  const write = async (path, body) => {
    await mkdir(dirname(join(dir, path)), { recursive: true });
    await writeFile(join(dir, path), body);
  };
  try {
    for (const [path, body] of Object.entries({ 'README.md': '# fixture\n', ...base })) await write(path, body);
    await exec('bash', ['-c', `git init -q -b main && git add -A && git ${GIT} commit -q -m base`], { cwd: dir });
    for (const [path, body] of Object.entries(change)) await (body === null ? rm(join(dir, path)) : write(path, body));
    if (intent.length) await exec('git', ['add', '-N', '--', ...intent], { cwd: dir });
    const { stdout } = await exec('bash', ['-c', SNIPPET], { cwd: dir });
    return Object.fromEntries([...stdout.matchAll(/^(\w+)=(\d+)$/gm)].map((m) => [m[1], Number(m[2])]));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// [case, files at HEAD, the working tree's change, the counts it must give]
const CASES = [
  ['a prose diff counts no code', {}, { 'README.md': '# fixture\n\nMore prose.\n', 'docs/plan.md': 'A plan.\n' }, { errors: 0, types: 0, tests: 0, code: 0 }],
  ['a test beside prose counts as a test, not code', {}, { 'commands/x.md': 'A rule.\n', 'tests/x.test.mjs': "import { test } from 'node:test';\n" }, { tests: 1, code: 0 }],
  ['a new stylesheet is code', {}, { 'src/styles/a.css': '.a { color: red; }\n' }, { code: 1 }],
  ['a new migration and a new script are code', {}, { 'supabase/migrations/1.sql': 'select 1;\n', 'lib/a.mjs': 'export const a = 1;\n' }, { code: 2 }],
  ['an edited tracked file is code', { 'src/x.ts': 'export const x = 1;\n' }, { 'src/x.ts': 'export const x = 2;\n' }, { code: 1 }],
  ['a deleted file is code', { 'src/y.tsx': 'export const Y = () => null;\n' }, { 'src/y.tsx': null }, { code: 1 }],
  ['type-design: an added exported type', {}, { 'src/a.ts': "export type Mode = 'a' | 'b';\n" }, { types: 1 }],
  ['type-design: a new file with an exported interface', {}, { 'src/b.ts': 'export interface Row {\n  id: string;\n}\n' }, { types: 1 }],
  ['type-design: a member added inside an exported interface', { 'src/c.ts': 'export interface Row {\n  id: string;\n}\n' }, { 'src/c.ts': 'export interface Row {\n  id: string;\n  name: string;\n}\n' }, { types: 1 }],
  ['type-design: a changed file under types/', {}, { 'src/types/index.ts': 'export {};\n' }, { types: 1 }],
  ['type-design: an exported type added to an existing module', { 'src/m.ts': "import a from 'a';\nexport const x = a;\n" }, { 'src/m.ts': "import a from 'a';\nexport const x = a;\nexport type Mode = 'a';\n" }, { types: 1 }],
  ['type-design: enums in a .tsx file', {}, { 'src/n.tsx': 'export enum Tone { Up, Down }\nexport declare const enum Side { L }\n' }, { types: 2 }],
  ['type-design skips a removed type', { 'src/d.ts': 'export type Gone = 1;\nexport const x = 1;\n' }, { 'src/d.ts': 'export const x = 1;\n' }, { types: 0 }],
  ['type-design skips a type removed below another exported type', { 'src/d2.ts': 'export type Kept = 1;\nexport type Gone = 2;\nexport const x = 1;\n' }, { 'src/d2.ts': 'export type Kept = 1;\nexport const x = 1;\n' }, { types: 0 }],
  ['type-design skips a file-private type', {}, { 'src/e.ts': 'type Local = string;\nexport const f = (s: Local) => s;\n' }, { types: 0 }],
  ['type-design skips a test fixture', {}, { 'src/e.test.ts': 'export interface Fixture { a: 1 }\n' }, { types: 0 }],
  ['type-design skips a spec fixture', {}, { 'src/e.spec.tsx': 'export interface Spec { a: 1 }\n' }, { types: 0 }],
  ['type-design skips a __tests__ helper', {}, { 'src/__tests__/fixtures.ts': 'export interface Fx { a: 1 }\n' }, { types: 0 }],
  ["test-coverage: a pure-logic layer under src/lib/", {}, { 'src/lib/money.ts': 'export const add = (a: number, b: number) => a + b;\n' }, { tests: 1 }],
  ["test-coverage: this repo's pure-logic layer", {}, { 'lib/audit.mjs': 'export const audit = () => [];\n' }, { tests: 1 }],
  ['test-coverage: an edited tracked file', { 'src/lib/money.ts': 'export const one = 1;\n' }, { 'src/lib/money.ts': 'export const one = 2;\n' }, { tests: 1 }],
  ['test-coverage: a test helper is a test, not code', {}, { 'tests/helpers/fx.mjs': 'export const fx = 1;\n' }, { tests: 1, code: 0 }],
  ['test-coverage skips a component', {}, { 'src/components/Card.tsx': 'export const Card = () => null;\n' }, { tests: 0 }],
  ['silent-failure: a try/catch in new code', {}, { 'src/f.ts': 'try { run(); } catch (e) { log(e); }\n' }, { errors: 1 }],
  ['silent-failure: a catch added to a tracked file', { 'src/h.ts': 'export const h = () => go();\n' }, { 'src/h.ts': 'export const h = () => go().catch(() => null);\n' }, { errors: 1 }],
  ['silent-failure: a try/catch removed', { 'src/i.ts': 'try { run(); } catch (e) { log(e); }\n' }, { 'src/i.ts': 'run();\n' }, { errors: 1 }],
  ['silent-failure: a .tsx file', {}, { 'src/j.tsx': 'export const J = () => { try { a(); } finally { b(); } };\n' }, { errors: 1 }],
  ['silent-failure skips prose', {}, { 'docs/g.md': 'Wrap it in try and catch the error.\n' }, { errors: 0 }],
  // An intent-to-add file leaves `ls-files --others` and joins `git diff HEAD`: it must count once, not twice or not at all.
  ['an intent-to-add file counts once', {}, { 'src/k.ts': "export type K = 1;\ntry { a(); } catch (e) { b(e); }\n" }, { code: 1, types: 1, errors: 1 }, ['src/k.ts']],
];
// Settled at once, so a case that fails before its test awaits it is reported by that test, not as an unhandled rejection.
const results = CASES.map(([, base, change, , intent]) => counts(base, change, intent).then((value) => ({ value }), (error) => ({ error })));

test(`exactly one trigger snippet in ${SOURCE}`, () => assert.equal(blocks.length, 1));

CASES.forEach(([name, , , expected], i) => {
  test(name, async () => {
    const { value, error } = await results[i];
    if (error) throw error;
    assert.deepEqual(Object.fromEntries(Object.keys(expected).map((key) => [key, value[key]])), expected);
  });
});
