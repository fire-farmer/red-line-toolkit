import { test } from 'node:test';
import assert from 'node:assert/strict';
import { processDocs, read } from './helpers/process-docs.mjs';

// The commands and skills append their telemetry with hand-escaped `echo "{…}" >> ~/.claude/metrics.jsonl` templates.
// Nothing else reads a template before a run writes a row from it, and a broken one writes a row nothing can parse, or a
// field one pipeline spells differently, which the cross-pipeline readouts then miss without a word.
const appends = processDocs().flatMap((file) => read(file).split('\n').filter((l) => l.includes('>> ~/.claude/metrics.jsonl')).map((text) => ({ file, text })));
const TEMPLATE = /^\s*echo "(.*)" >> ~\/\.claude\/metrics\.jsonl\s*$/;

/** A template as the row it writes: the shell's date becomes a string and each bare `<placeholder>` value a 0. */
const row = (template) => JSON.parse(template.replace(/\\"/g, '"').replace(/\$\(date[^"]*\)/g, 'x').replace(/:<[^>]*>/g, ':0'));

test('every telemetry template writes a row that parses, with one leftovers, one swept and one adjudicator shape', () => {
  // Positive control: every append is a template this test reads, indented ones included, and a broken one fails to parse.
  assert.deepEqual(appends.filter((a) => !TEMPLATE.test(a.text)).map((a) => a.file), []);
  assert.throws(() => row('{\\"pipeline\\":\\"x\\",\\"keep\\":<k>,}'));
  const rows = appends.map((a) => ({ file: a.file, row: row(a.text.match(TEMPLATE)[1]) }));
  const leftovers = rows.filter((r) => r.row.leftovers).map((r) => `${r.file}: ${Object.keys(r.row.leftovers).join(' ')}`);
  assert.deepEqual(leftovers, ['change-heavy', 'cleanup-light', 'page-implement'].map((p) => `commands/${p}.md: fixed filed dropped tweaks`));
  // The anchor sweep's counts (pipeline-shared.md § The anchor sweep), one shape in each pipeline that runs it.
  const swept = rows.filter((r) => r.row.swept).map((r) => `${r.file}: ${Object.keys(r.row.swept).join(' ')}`);
  assert.deepEqual(swept, ['change-heavy', 'cleanup-light', 'page-implement'].map((p) => `commands/${p}.md: listed closed`));
  // The adjudicator stream is aggregated across these callers, so their rows carry the same fields.
  const adjudicator = (caller) => Object.keys(rows.find((r) => r.row.pipeline === 'adjudicator' && r.row.caller === caller).row).sort().join(' ');
  assert.deepEqual(['change-heavy', 'page-implement'].map(adjudicator), Array(2).fill(adjudicator('cleanup-light')));
});
