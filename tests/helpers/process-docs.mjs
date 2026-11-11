// The markdown files a command, reference doc, agent or skill reads, listed from the directories so a new one is scanned.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const read = (file) => readFileSync(join(root, file), 'utf8');

/** The CLI's modes, from the first word of each `|`-separated part of ledger.mjs's usage line. */
export const cliModes = () => read('scripts/ledger.mjs').match(/const USAGE = 'usage: ledger\.mjs (.+)';/)[1].split(' | ').map((m) => m.split(' ')[0]);

export function processDocs() {
  const list = (dir) => readdirSync(join(root, dir)).filter((f) => f.endsWith('.md')).map((f) => `${dir}/${f}`);
  const skills = readdirSync(join(root, 'skills'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => `skills/${d.name}/SKILL.md`);
  return [...list('commands'), ...list('reference'), ...list('agents'), ...skills];
}

// Sessions read these files from the plugin's install folder, so a path into the toolkit that leaves out
// ${CLAUDE_PLUGIN_ROOT}/ resolves nowhere in the project the session works in: reference/…, a bare reference doc's name, or a path under another of
// this repo's top-level directories, or one of its root files, that exists here (a project's own tests/visual or lib/api
// doesn't, and is passed over). The top level is what git tracks or would add, so local clutter (a package-lock.json the
// allowlist .gitignore ignores) never joins it. docs/ and the root files every project keeps too name the project's own,
// so they never count. Two shapes are relative by design: the rule arrow `→ reference/rules.md#r-<n>`, which lib/rows.mjs parses, and
// a path after "the toolkit's", the spelling for files Claude Code doesn't substitute in (a CLAUDE.md, code). With `pointers`, only a path that starts a `§` pointer counts,
// on its line or wrapped onto a comment's next one, as in code, where the pointers are what ledger.mjs prints. Each hit
// carries its absolute spelling, which a failure prints as the fix.
const PROJECT_OWN = new Set(['docs', 'CLAUDE.md', 'README.md', 'Standing-FUs.md', 'package.json']);
const isDir = new Map();
for (const f of execFileSync('git', ['-C', root, 'ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).split('\n').filter(Boolean)) {
  const [head, ...rest] = f.split('/');
  isDir.set(head, isDir.get(head) || rest.length > 0);
}
const top = [...isDir].filter(([name]) => !name.startsWith('.') && name !== 'reference' && !PROJECT_OWN.has(name));
const literal = (name) => name.replace(/\./g, '\\.');
const PATH = new RegExp(String.raw`(?<![\w./~-])(?:(?<dir>reference|${top.filter(([, dir]) => dir).map(([name]) => name).join('|')})/[\w./-]*[\w-]` +
  `|(?<bare>${readdirSync(join(root, 'reference')).filter((f) => f.endsWith('.md')).map(literal).join('|')})(?![\w-])` +
  `|(?<file>${top.filter(([, dir]) => !dir).map(([name]) => literal(name)).join('|') || '(?!)'})(?![\w-]))`, 'g');
// The toolkit's spelling where ${CLAUDE_PLUGIN_ROOT} isn't substituted: "the toolkit's `reference/…`", and red-line-toolkit/… in code.
const NAMED = /the toolkit's `?$|red-line-toolkit\/$/i;
export const PREFIX = '${CLAUDE_PLUGIN_ROOT}/';
const WRAPPED = /^\s*(?:\*|\/\/)\s*§ /;

export function relativeRepoPaths(text, { pointers = false } = {}) {
  const lines = text.split('\n');
  return lines.flatMap((line, i) => {
    return [...line.matchAll(PATH)].flatMap((m) => {
      const { dir, bare } = m.groups;
      const after = line.slice(m.index + m[0].length);
      if (line.slice(0, m.index).endsWith('→ ') && m[0] === 'reference/rules.md' && after.startsWith('#r-')) return [];
      if (NAMED.test(line.slice(0, m.index))) return [];
      if (dir && dir !== 'reference' && !existsSync(join(root, m[0]))) return [];
      if (pointers && !/^`? § /.test(after) && !(after.trim() === '' && WRAPPED.test(lines[i + 1] ?? ''))) return [];
      return [{ line: i + 1, hit: m[0], to: `${PREFIX}${bare ? `reference/${bare}` : m[0]}`, kind: bare ? 'bare' : dir ?? 'file' }];
    });
  });
}

/** Each `${CLAUDE_PLUGIN_ROOT}/<path>` in `text` that names no file here. */
export const missingRepoPaths = (text) => text.split('\n').flatMap((line, i) => [...line.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]*[\w-])/g)]
  .filter((m) => !existsSync(join(root, m[1]))).map((m) => ({ line: i + 1, hit: m[0] })));
