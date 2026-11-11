import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { FOOTER, RULES } from '../lib/rules.mjs';
import { parseRules } from '../lib/rows.mjs';
import { cliModes, root, read } from './helpers/process-docs.mjs';

// A row of the lifecycle doc's Numbers table: | <rule> | <value> | `<key>` |
const NUMBERS_ROW = /^\| [^|]+ \| (\d+) \| `(\w+)` \|$/gm;
// Every code file but rules.mjs, listed from the directory so a new lib module is scanned without editing this test.
const CODE = [
  ...readdirSync(join(root, 'lib')).filter((f) => f.endsWith('.mjs') && f !== 'rules.mjs').map((f) => `lib/${f}`),
  'scripts/ledger.mjs',
];

test('the lifecycle doc states exactly the numbers lib/rules.mjs enforces', () => {
  const stated = Object.fromEntries(
    [...read('reference/ledger-lifecycle.md').matchAll(NUMBERS_ROW)].map((m) => [m[2], Number(m[1])]),
  );
  assert.deepEqual(stated, { ...RULES });
});

test('the rulebook parses with no malformed rows and at most 25 rules', () => {
  const { rows, malformed } = parseRules(read('templates/rulebook/CLAUDE.md'));
  assert.deepEqual(malformed, []);
  assert.ok(rows.length <= RULES.rulebookMax);
});

// Limits live in lib/rules.mjs only (decision 25). The lifecycle doc states each once, in the Numbers
// table the first test checks. A number restated anywhere else goes stale at the first rule change, so
// commands, the rulebook and the session file point at the report's LIMITS line, and the doc's prose and
// code comments name the key.
test("no limit is restated outside lib/rules.mjs and the lifecycle doc's Numbers table", () => {
  const phrases = [
    `${RULES.memberSlots} members`,
    `${RULES.probationSlots} on probation`,
    `${RULES.probationSessions} sessions`,
    `${RULES.ruleMaxChars} characters`,
    `${RULES.rulebookMax} rules`,
    `${RULES.groupStepScheduleAt} FUs`,
    `${RULES.evidenceWindowSessions} sessions`,
    `${RULES.groupStepIdleSessions} sessions`,
    `${RULES.lessonSlots} lessons`,
    `${RULES.lessonSlots} slots`,
    `${RULES.lessonsFiledPerSession} lesson per session`,
    `${RULES.lessonsFiledPerSession} lessons? filed`,
    `${RULES.checkFlagCitations} citations`,
    `${RULES.checkFlagCitations} or more times`,
    `${RULES.rulebookPromotionPhases} separate phases`,
    `${RULES.rulebookPromotionPhases} or more separate phases`,
  ];
  const files = [
    'commands/start-session.md', 'commands/end-session.md', 'commands/cleanup-light.md', 'commands/change-heavy.md', 'commands/cluster-fus.md',
    'commands/page-implement.md', 'commands/module-audit.md', 'commands/mobile-audit.md',
    'templates/rulebook/CLAUDE.md', 'reference/ledger-lifecycle.md', 'reference/ledger-session.md', ...CODE,
  ];
  const restated = files.flatMap((file) => {
    const text = read(file).replace(NUMBERS_ROW, '');
    return phrases.filter((p) => new RegExp(`\\b${p}\\b`, 'i').test(text)).map((p) => `${file}: "${p}"`);
  });
  assert.deepEqual(restated, []);
});

// Two lists the doc restates by hand: the footers the history reads, and the CLI's modes.
test("the doc's Footers table lists exactly lib/rules.mjs's footers, and its mode table exactly the CLI's modes", () => {
  const doc = read('reference/ledger-lifecycle.md');
  const section = (name) => doc.split(/^## /m).find((s) => s.startsWith(`${name}\n`));
  const firstCells = (name) => [...section(name).matchAll(/^\| `([\w-]+)/gm)].map((m) => m[1]);
  assert.deepEqual(firstCells('Footers').sort(), Object.values(FOOTER).sort());
  assert.deepEqual(firstCells('The audit').sort(), cliModes().sort());
});
