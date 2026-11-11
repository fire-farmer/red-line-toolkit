import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PREFIX, cliModes, missingRepoPaths, processDocs, read, relativeRepoPaths, root } from './helpers/process-docs.mjs';

// A run never waits for the owner on a programming call (reference/decision-gates.md). In the commands that is
// structural: a command that never asks has no AskUserQuestion. The rulebook, a project's CLAUDE.md and the mods'
// notes have no frontmatter and reach every session, so the retired stops' wording is still checked there.

// The starter rulebook the user installs as ~/.claude/CLAUDE.md, and the project CLAUDE.md template.
const RULEBOOK = 'templates/rulebook/CLAUDE.md';
const docs = processDocs();
// The mods' own source: their notes reach the orchestrator. The typings the harness writes under .claude-plugin/
// aren't ours and change with each Claude Code release.
const isModSource = (f) => f.endsWith('.ts') && !f.endsWith('.d.ts') && !f.split('/').includes('.claude-plugin');
const mods = readdirSync(join(root, 'mods'), { recursive: true }).filter(isModSource).map((f) => `mods/${f}`);
const files = [RULEBOOK, ...docs, ...mods];
const lines = (file, text = read(file)) => text.split('\n').map((t, i) => ({ at: `${file}:${i + 1}`, text: t }));

// A project's CLAUDE.md loads in every session there and overrides the commands. The toolkit ships one, the template
// a project copies, so the project test below holds it to what the commands hold themselves to. A project whose calls
// aren't the owner's may keep its own wording, by name and with the reason: `asks` exempts it from the retired asks,
// `tweak` from the minor-tweak scope rule, `area` from that rule's in-area clause, `rigor` from the Heavy-rigor trigger.
const OUTSIDE_RULING = {};
const exempt = (p, kind) => Boolean(OUTSIDE_RULING[p.name]?.from.includes(kind));
const projects = [{ name: 'template', file: 'templates/CLAUDE.md', text: existsSync(join(root, 'templates/CLAUDE.md')) ? read('templates/CLAUDE.md') : '' }];
const registered = projects.map((p) => ({ ...p, migrated: true }));
const noCheckout = false;

// Each retired stop by the shape it was written in, with a line of the old text it must catch. A sentence that
// records a stop's retirement is history, not a stop. The shapes are instructions to wait.
const RETIRED = [
  [/\bend checkpoint\b/i, 'The prod push waits for the end checkpoint.'],
  [/\bStage \d+ checkpoint\b/i, "the Stage 9 checkpoint's approval"],
  [/\bcommit approval\b/i, 'which is also the commit approval'],
  [/\(tier 2\b|\btiers 1[–-]2\b/i, 'one question before the commit (tier 2)'],
  [/\bcost[- ](?:gate|confirmation|prompt)\b/i, 'the Stage 0 cost-confirmation AskUserQuestion'],
  [/(?:\ba|—) real stops?\b/i, 'AskUserQuestion — a real stop'],
  [/\b(?:do not|don't|no) auto-escalat/i, 'User decides — do not auto-escalate.'],
  [/\bwith the owner'?s answer\b|\bowner said yes\b/i, "any recommended check with the owner's answer"],
  [/\bstop and ask\b/i, 'stop and ask before touching FU rows'],
  [/\bwait for the decision\b/i, 'Wait for the decision.'],
  [/\bcommit question\b/i, "Stage 9's commit question is where the owner corrects one"],
  [/\btier[- ]3 stops?\b/i, 'The tier-3 stops below still stop.'],
  [/\btier[- ]3 triggers?\b|\bstops? for the owner\b/i, 'It stops for the owner only on a tier-3 trigger.'],
  [/\bstop(?:s|ping)? between phases\b/i, 'Stop between phases for assessment.'],
];
// Asking the owner on a programming call, retired by the same ruling.
const RETIRED_ASKS = [
  [/\bask before proceeding\b/i, 'Ask before proceeding if:'],
  [/\bask\b[^.;]*\barchitectural (?:decision|choice)s?\b/i, 'Ask instead of guess on architectural decisions.'],
  [/\balignment-critical\b/i, '**The owner prefers clarifying questions for alignment-critical decisions.**'],
];
const HISTORY = /\b(?:retired|replaced)\b/i;
const matcher = (table) => (text) =>
  text.split(/(?<=[.;!?])\s+/).some((s) => !HISTORY.test(s) && table.some(([p]) => p.test(s)));
const retired = matcher([...RETIRED, ...RETIRED_ASKS]);
const retiredStop = matcher(RETIRED);

test('each retired stop is matched by its own pattern, prose about the new gates is not, and the rulebook and the mods bring back none', () => {
  for (const [pattern, sample] of [...RETIRED, ...RETIRED_ASKS]) {
    assert.match(sample, pattern);
    assert.ok(retired(sample), sample);
  }
  for (const ok of [
    'A light run that meets the trigger auto-escalates to /change-heavy.',
    "When the owner's answer arrives, the session writes the ruling into the row.",
    'The end checkpoint was retired.',
    'Tier 2 subscribers see the export button.',
    "a checkpoint once recommended all four leftovers",
    '## Tier 3 — what waits for the owner',
    '### When to ask instead of guess',
    'The tier-3 items below still go to the owner.',
    "An architectural choice is a programming fork, so it's Claude's.",
  ]) assert.equal(retired(ok), false, ok);
  // History covers its own sentence only; a project outside the ask ruling is still held to the retired stops.
  assert.ok(retired('This replaced the old gate; the end checkpoint commits by pathspec.'));
  assert.equal(retiredStop('Ask before proceeding if:'), false);
  assert.ok(retiredStop('The prod push waits for the end checkpoint.'));
  // Positive control: the mods are reached, and the harness's typings aren't ours.
  assert.ok(mods.includes('mods/fable-seat-guard/hooks/register.ts'), 'the mods are not scanned');
  assert.equal(isModSource('fable-seat-guard/.claude-plugin/types/claude-code/index.d.ts'), false);
  assert.deepEqual([RULEBOOK, ...mods].flatMap((f) => lines(f)).filter((l) => retired(l.text)).map((l) => l.at), []);
});

// Who may ask the owner: the commands decision-gates.md § Asked live names, whose job is the decision, and
// /pre-commit-check run directly (§ Asking the question). Every other command and skill takes AskUserQuestion out of
// its tools in its frontmatter, so it can't ask even where a sentence tells it to.
function askers() {
  const gates = read('reference/decision-gates.md');
  const section = (name) => gates.split(/^#+ /m).find((s) => s.startsWith(`${name}\n`)) ?? '';
  // Each section's first paragraph is the list; the prose after it may name other commands without making them askers.
  const list = (name) => section(name).split(/\n\s*\n/)[1] ?? '';
  const names = [...`${list('Asked live')}${list('Asking the question')}`.matchAll(/`\/([a-z-]+)`/g)].map((m) => m[1]);
  const docFor = (n) => [`commands/${n}.md`, `skills/${n}/SKILL.md`].find((f) => docs.includes(f));
  return new Set(['reference/decision-gates.md', ...names.map(docFor).filter(Boolean)]);
}

const fieldOf = (text, key) => (text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '').match(new RegExp(`^${key}:(.*)$`, 'm'))?.[1] ?? '';
const field = (f, key) => fieldOf(read(f), key);
const removesAsk = (f) => /\bAskUserQuestion\b/.test(field(f, 'disallowed-tools'));

// AskUserQuestion takes 2–4 options per question (§ Asking the question), so an asker's written `Options:` list past
// four can't be asked as written. A list starts at a line's start (after an indent and a bullet) or a sentence's; an
// inline one separates options with ` · ` or ` | `, a nested one is every bullet at the first indent under the label.
const OPTIONS = /(?:^\s*(?:- )?|\.\s)\**Options:\**\s*(.*)$/;
const BULLET = /^\s*(?:[-*]|\d+\.) /;
const indent = (line) => line.match(/^\s*/)[0].length;
function optionLists(text) {
  const all = text.split('\n');
  return all.flatMap((line, i) => {
    const m = line.match(OPTIONS);
    if (!m) return [];
    if (m[1].trim()) return [{ line: i + 1, count: m[1].trim().split(/\s[·|]\s/).length }];
    const child = indent(all[i + 1] ?? '');
    let count = 0;
    for (let j = i + 1; j < all.length && all[j].trim() && indent(all[j]) > indent(line); j++) if (indent(all[j]) === child && BULLET.test(all[j])) count++;
    return [{ line: i + 1, count }];
  });
}

test('only the commands decision-gates.md names ask the owner, every other command removes the tool, and each question fits the form', () => {
  const allowed = askers();
  // Positive control: the two sections parse to the commands that ask live or are run directly.
  assert.deepEqual([...allowed].sort(), [
    'commands/competitive-anchor.md', 'commands/module-build.md', 'commands/page-design.md', 'commands/pre-commit-check.md',
    'commands/start-session.md', 'reference/decision-gates.md', 'skills/module-sprint/SKILL.md',
  ]);
  const runnable = docs.filter((f) => f.startsWith('commands/') || f.startsWith('skills/'));
  const neverAsk = runnable.filter((f) => !allowed.has(f));
  // Positive control: the never-ask set comes from the docs and holds the pipelines; the field reader sees a removal.
  for (const known of ['commands/cleanup-light.md', 'commands/change-heavy.md', 'commands/page-implement.md', 'commands/end-session.md']) {
    assert.ok(neverAsk.includes(known), `${known} isn't in the never-ask set`);
  }
  assert.equal(fieldOf('---\nallowed-tools: Read\ndisallowed-tools: Bash, AskUserQuestion\n---\n', 'disallowed-tools'), ' Bash, AskUserQuestion');
  assert.equal(fieldOf('---\nallowed-tools: Read\n---\ndisallowed-tools: AskUserQuestion\n', 'disallowed-tools'), '', 'a body line is not frontmatter');
  assert.deepEqual(neverAsk.filter((f) => !removesAsk(f)), [], 'a command that never asks keeps AskUserQuestion');
  assert.deepEqual(neverAsk.filter((f) => /\bAskUserQuestion\b/.test(field(f, 'allowed-tools'))), [], 'a command that never asks pre-approves AskUserQuestion');
  assert.deepEqual(runnable.filter((f) => allowed.has(f) && removesAsk(f)), [], 'a command that asks live removes AskUserQuestion');
  const asks = files.flatMap((f) => lines(f)).filter((l) => /AskUserQuestion/.test(l.text) && !/^(?:dis)?allowed-tools:/.test(l.text));
  assert.ok(asks.some((l) => l.at.startsWith('commands/page-design.md:')), 'the scan finds no AskUserQuestion in /page-design');
  assert.deepEqual(asks.filter((l) => !allowed.has(l.at.replace(/:\d+$/, ''))).map((l) => l.at), []);
  // Positive control: the parser counts each list shape, and finds the lists the askers carry.
  const nested = ['- **Options:**', ...['`A`', '`B`', '`C`', '`D`', '**E**'].map((o) => `  - ${o} → x`), '    - a sub-point, not an option', '- next item'].join('\n');
  assert.deepEqual(optionLists(nested), [{ line: 1, count: 5 }]);
  assert.deepEqual(optionLists('- Options: `A` | `B` · `C` → c · `D` | **E**'), [{ line: 1, count: 5 }]);
  assert.deepEqual(optionLists('One stop. Options: `A` · `B`.'), [{ line: 1, count: 2 }]);
  assert.deepEqual(optionLists('The test reads an `Options:` list.'), []);
  const lists = [...allowed].flatMap((f) => optionLists(read(f)).map((l) => ({ f, ...l })));
  for (const known of ['commands/module-build.md', 'commands/pre-commit-check.md', 'commands/start-session.md']) assert.ok(lists.some((l) => l.f === known), `no option list found in ${known}`);
  assert.deepEqual(lists.filter((l) => l.count < 2 || l.count > 4).map((l) => `${l.f}:${l.line} — ${l.count} options`), []);
});

// A command that invokes a skill needs the Skill tool; without it the run stops on a permission prompt.
test('a command that invokes a skill lists Skill in allowed-tools', () => {
  const INVOKES = /via the Skill tool|\b(?:invoke|through) `\/[a-z]/i;
  const commands = docs.filter((f) => f.startsWith('commands/'));
  const invoking = commands.filter((f) => INVOKES.test(read(f).replace(/^---\n[\s\S]*?\n---\n/, '')));
  // Positive control: the matcher finds the pipelines that run /pre-commit-check.
  for (const known of ['commands/cleanup-light.md', 'commands/end-session.md', 'commands/module-audit.md']) assert.ok(invoking.includes(known), known);
  const tools = (f) => read(f).match(/^allowed-tools:(.*)$/m)?.[1] ?? '';
  assert.deepEqual(invoking.filter((f) => !/\bSkill\b/.test(tools(f))), []);
});

// Stale wording: a run fixes a minor tweak in a file it already touches and lists it, whatever its class
// (reference/ledger-session.md § FUs). A scope rule that admits only the same class sends that tweak to an
// FU row or a drop, so every statement of one names the tweak too. A blank-line block states a scope rule when it admits
// the same class (or bans what isn't) and names what happens to the rest; a list item that states it alone must name the
// tweak, or the lines leading its list must, so one bullet's "minor tweak" can't cover a stale neighbour. Under the
// "fix in the moment" ruling a real issue in the area the change works is fixed now too, whatever its class,
// so a scope rule names the area as well: one that names only the same class and the tweak files that issue.
const SAME_CLASS = /same[- ](?:class|defect)|different class|while I'?m here|noticed nearby/i;
const OUTCOME = /\b(?:drop|dropped|file|filed|filing bar|leftovers?|follow-ups?|in scope|WARN)\b/i;
const TWEAK = /minor tweak/i;
const AREA = /in the area|in-area|separate area/i;
const ITEM = /^\s*(?:>\s*)?(?:[-*]|\d+\.)\s/;
const untweaked = (text) => text.replace(/minor tweak/gi, '');
const covers = (text) => TWEAK.test(text) && AREA.test(text);
// A project exempt from the in-area clause is held to the minor tweak alone.
const tweakOnly = (text) => TWEAK.test(text);
const ruleFor = (p) => (exempt(p, 'area') ? tweakOnly : covers);

/**
 * Each `<file>:<line>` where a statement is stale by `isStale`: a blank-line block (its first line), or a list item in it
 * (the item's) unless the lines leading the list carry what `leadCovers` asks for, so one item can't cover a stale neighbour.
 */
function staleStatements(file, text, isStale, leadCovers) {
  const found = new Set();
  const all = text.split('\n');
  for (let start = 0, i = 0; i <= all.length; i++) {
    if (i < all.length && all[i].trim() !== '') continue;
    const block = all.slice(start, i);
    if (isStale(block.join('\n'))) found.add(start + 1);
    const first = block.findIndex((l) => ITEM.test(l));
    if (first >= 0 && !leadCovers(block.slice(0, first).join('\n'))) {
      for (let at = first, j = first + 1; j <= block.length; j++) {
        if (j < block.length && !ITEM.test(block[j])) continue;
        if (isStale(block.slice(at, j).join('\n'))) found.add(start + at + 1);
        at = j;
      }
    }
    start = i + 1;
  }
  return [...found].map((n) => `${file}:${n}`);
}

/** Each `<file>:<line>` where a scope rule leaves out what `named` requires (by default the minor tweak and the area). */
const staleScopeRules = (file, text, named = covers) => staleStatements(file, text, (t) => SAME_CLASS.test(t) && OUTCOME.test(t) && !named(t), named);

test('every scope rule in the process docs and the rulebook names the minor tweak and the area', () => {
  // Positive control: the matcher catches a rule that names only the same class, one that names the tweak but not the
  // area, and a stale bullet beside one that names both unless the lines leading the list name them; an FU-body sweep is
  // not a scope rule.
  const stale = (text) => staleScopeRules('f', text);
  assert.deepEqual(stale('Fix it now when it is the same class as the change; otherwise file it or drop it.'), ['f:1']);
  assert.deepEqual(stale('Fix the same class now, and a minor tweak in a touched file; otherwise file it or drop it.'), ['f:1']);
  assert.deepEqual(stale('Fix the same class now, and a real issue in the area the change works, a minor tweak included; otherwise file it or drop it.'), []);
  assert.deepEqual(stale('Sweep for the same class at other sites so the fix covers it whole.'), []);
  assert.deepEqual(stale('- Scope is the class: the same defect at every site is in scope.\n- Fix a minor tweak or an in-area issue too.'), ['f:1']);
  assert.deepEqual(stale('A minor tweak or an in-area fix is fine; the rest:\n- A different class of work → WARN'), []);
  assert.deepEqual(stale('A minor tweak in a touched file is fine; the rest:\n- A different class of work → WARN'), ['f:1', 'f:2']);
  assert.deepEqual(staleScopeRules('f', 'Fix the same class now, and a minor tweak in a touched file; otherwise file it or drop it.', tweakOnly), []);
  assert.deepEqual(staleScopeRules('f', 'Fix it now when it is the same class as the change; otherwise file it or drop it.', tweakOnly), ['f:1']);
  assert.deepEqual(stale('No scope creep. Fixes noticed nearby go to follow-ups.'), ['f:1']);
  // Positive control: the scan reaches the pipelines' leftover rules and the filing bar itself.
  const ruled = (f) => staleScopeRules(f, untweaked(read(f))).length > 0;
  for (const known of ['commands/cleanup-light.md', 'commands/page-implement.md', 'commands/change-heavy.md', 'reference/ledger-session.md', 'commands/pre-commit-check.md']) {
    assert.ok(docs.includes(known) && ruled(known), `no scope rule found in ${known}`);
  }
  assert.deepEqual([RULEBOOK, ...docs].flatMap((f) => staleScopeRules(f, read(f))), []);
});

// `<file>.md § <Section>` points at a heading of that file. A pointer whose file or heading is renamed sends the
// reader nowhere, and a pipeline that follows it skips the step.
const POINTER = /((?:\$\{CLAUDE_PLUGIN_ROOT\}\/)?(?:[\w./~-]+\/)?[\w-]+\.md)`? § ([^\n`]+)/g;
const headings = (file) => [...read(file).matchAll(/^#+ (.+)$/gm)].map((m) => m[1].trim());
const names = (text, h) => text.startsWith(h) && !/[\w-]/.test(text[h.length] ?? '');
// A pointer spelled from ${CLAUDE_PLUGIN_ROOT}/ (or red-line-toolkit/ in code) must resolve exactly. One into the user's
// process home resolves to the starter it was installed from. A bare or relative one still resolves here, so this check
// reports only a missing file or heading; the spelling check below rejects it in the toolkit's files.
const HOME = { '~/.claude/CLAUDE.md': RULEBOOK, '~/.claude/reference/rules.md': 'templates/rulebook/rules.md' };
const resolve = (path) => {
  if (HOME[path]) return HOME[path];
  const full = path.startsWith(PREFIX) ? path.slice(PREFIX.length) : path.match(/^red-line-toolkit\/(.+)$/)?.[1];
  return (full ? [full] : ['', 'reference/'].map((dir) => `${dir}${path}`)).find((f) => existsSync(join(root, f)));
};
const pointers = (entries) => entries.flatMap((l) => [...l.text.matchAll(POINTER)].map((m) => ({ ...l, file: m[1], rest: m[2], index: m.index })));
const broken = (found) => found.filter((p) => {
  const file = resolve(p.file);
  return !file || !headings(file).some((h) => names(p.rest, h));
});
const brokenLines = (found) => broken(found).map((p) => `${p.at} → ${p.file} § ${p.rest.slice(0, 40)}`);

// The CLI's source, whose `§` pointers ledger.mjs prints in other projects. A mod's tests are left out: their command
// strings are inputs to the guard, relative to this checkout on purpose.
const code = ['lib', 'scripts'].flatMap((d) => readdirSync(join(root, d), { recursive: true })
  .filter((f) => /\.m?js$/.test(f)).map((f) => `${d}/${f}`));
const notes = [RULEBOOK, ...docs, ...mods.filter((f) => !f.endsWith('.test.ts'))];
const spelledAt = (file, text, opts) => relativeRepoPaths(text, opts).map((h) => `${file}:${h.line} ${h.hit} → ${h.to}`);
const missingAt = (file, text) => missingRepoPaths(text).map((m) => `${file}:${m.line} ${m.hit}`);

test('every `<file>.md § <section>` pointer names a heading in that file, and every path into the toolkit is spelled from ${CLAUDE_PLUGIN_ROOT}/ and exists', () => {
  const found = pointers([...files, ...code].flatMap((f) => lines(f)));
  // Positive control: the shared reference's sections are reached, and a missing heading or file is caught.
  assert.ok(found.some((p) => p.file.endsWith('pipeline-shared.md') && p.rest.startsWith('Risk paths')), 'no pointer to pipeline-shared.md § Risk paths found');
  const fake = pointers([{ at: 'fixture', text: '`${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § Parking; `${CLAUDE_PLUGIN_ROOT}/reference/no-such-doc.md` § Start' }]);
  assert.equal(broken(fake).length, 2);
  assert.deepEqual(brokenLines(found), []);
  // Positive controls, one per reason: a relative spelling that resolves here, a bare name, a path under another
  // directory, a root file of this repo and a printed pointer, on its line or wrapped onto the next, are caught; the rule
  // arrow, a path after "the toolkit's", a project-local path, a file every project keeps and a pointer-free path in
  // code pass, while a plain rules.md citation and prose after the span are still caught; an absolute path to no file is
  // caught.
  const spelled = '`reference/pipeline-shared.md` § Risk paths; `ledger-session.md` § FUs; `agents/fable-seat.md`; `tests/visual/`; `package-lock.json`; `Standing-FUs.md`; `lib/rules.mjs`';
  assert.equal(broken(pointers([{ at: 'fixture', text: spelled }])).length, 0);
  assert.deepEqual(relativeRepoPaths(spelled).map((h) => h.kind), ['reference', 'bare', 'agents', 'lib']);
  assert.deepEqual(relativeRepoPaths('- **R-99** See reference/decision-gates.md. → reference/rules.md#r-99').map((h) => h.hit), ['reference/decision-gates.md']);
  assert.deepEqual(relativeRepoPaths('see reference/rules.md#r-4').map((h) => h.hit), ['reference/rules.md']);
  assert.deepEqual(relativeRepoPaths("Read the toolkit's `reference/ledger-session.md`, then follow reference/decision-gates.md § Parking.").map((h) => h.hit), ['reference/decision-gates.md']);
  assert.deepEqual(relativeRepoPaths("join(root, 'reference', 'rules.md'); `x (ledger-session.md § FUs)`", { pointers: true }).map((h) => h.to), ['${CLAUDE_PLUGIN_ROOT}/reference/ledger-session.md']);
  assert.deepEqual(relativeRepoPaths(" * since FUs are anchored to the old one; pipeline-shared.md\n * § The review panel's CHANGED lists only the new.", { pointers: true }).map((h) => h.hit), ['pipeline-shared.md']);
  assert.deepEqual(missingRepoPaths('${CLAUDE_PLUGIN_ROOT}/scripts/ledger.mjs; ${CLAUDE_PLUGIN_ROOT}/scripts/no-such.sh').map((m) => m.hit), ['${CLAUDE_PLUGIN_ROOT}/scripts/no-such.sh']);
  assert.deepEqual([...notes.flatMap((f) => spelledAt(f, read(f))), ...code.flatMap((f) => spelledAt(f, read(f), { pointers: true }))], []);
  assert.deepEqual([...notes, ...code].flatMap((f) => missingAt(f, read(f))), []);
});

// A project's CLAUDE.md points into the toolkit rather than restating it, so those pointers must land; its own pointers
// (`docs/STYLE_GUIDE.md` § …) resolve in the project, not here, and are left to it. Its scope rule names the minor
// tweak and the area, as the commands' do, and it brings back no retired stop. A project exempt from either stays
// unmigrated: the audit's in-area stop has no per-project switch, so migrating one is the moment to decide.
test("the project CLAUDE.md template points at real headings here, names the minor tweak and the area, and brings back no retired stop", { skip: noCheckout }, () => {
  assert.deepEqual(registered.filter((p) => (exempt(p, 'tweak') || exempt(p, 'area')) && p.migrated).map((p) => p.name), []);
  for (const p of projects) assert.ok(p.text.split('\n').length > 1, `${p.file} is missing or empty`);
  // A CLAUDE.md isn't plugin content, so it names the toolkit's docs as "the toolkit's `reference/<doc>.md` § <section>".
  const intoHere = (entries) => pointers(entries).filter((p) => /the toolkit's `?$/i.test(p.text.slice(0, p.index)) || p.file.startsWith(PREFIX));
  // Positive control: a missing heading and a missing reference/ are caught, a project-local pointer is passed over,
  // and every checkout that points into decision-gates.md has those pointers reached.
  const fake = intoHere([{ at: 'fixture', text: "the toolkit's `reference/decision-gates.md` § No such heading; `${CLAUDE_PLUGIN_ROOT}/decision-gates.md` § The report; `docs/STYLE_GUIDE.md` § Colour" }]);
  assert.equal(fake.length, 2);
  assert.equal(broken(fake).length, 2);
  const found = intoHere(projects.flatMap((p) => lines(p.file, p.text)));
  for (const p of projects.filter((x) => x.text.includes("the toolkit's `reference/decision-gates.md` §"))) {
    assert.ok(found.some((f) => f.at.startsWith(`${p.file}:`) && f.file.endsWith('/decision-gates.md')), `${p.name}'s decision-gates.md pointers aren't reached`);
  }
  assert.deepEqual(brokenLines(found), []);
  // A bare or relative pointer into this repo resolves nowhere from the project, and an absolute one must name a file.
  // A project's own lib/ or scripts/ path may share a name with one here, and a project may keep a reference/ of its own
  // so only bare names and reference/ paths to a doc here count. Positive control: both are
  // caught; a project-local path that also exists here and a project's own reference/ doc are passed over.
  const intoReference = (h) => h.kind === 'bare' || (h.kind === 'reference' && existsSync(join(root, h.hit)));
  const relative = (p) => relativeRepoPaths(p.text).filter(intoReference).map((h) => `${p.file}:${h.line} ${h.hit} → ${h.to}`);
  assert.deepEqual(relative({ file: 'fixture', text: '(`ledger-lifecycle.md` § FUs); `reference/ledger-lifecycle.md` § FUs; `lib/rules.mjs`; `reference/brand-voice.md`' }),
    ['fixture:1 ledger-lifecycle.md → ${CLAUDE_PLUGIN_ROOT}/reference/ledger-lifecycle.md', 'fixture:1 reference/ledger-lifecycle.md → ${CLAUDE_PLUGIN_ROOT}/reference/ledger-lifecycle.md']);
  assert.deepEqual(projects.flatMap(relative), []);
  assert.deepEqual(projects.flatMap((p) => missingAt(p.file, p.text)), []);
  // Positive control: the template's filing bar is reached.
  const tpl = projects[0];
  assert.ok(staleScopeRules(tpl.file, untweaked(tpl.text)).length > 0, 'no scope rule found in templates/CLAUDE.md');
  // Positive control: the template is held to the area too, so its filing bar with the area wording stripped is stale.
  assert.ok(staleScopeRules(tpl.file, tpl.text.replace(/in the area|in-area|separate area/gi, ''), ruleFor(tpl)).length > 0, "templates/CLAUDE.md isn't held to the area");
  assert.deepEqual(projects.filter((p) => !exempt(p, 'tweak')).flatMap((p) => staleScopeRules(p.file, p.text, ruleFor(p))), []);
  const stops = (p) => lines(p.file, p.text).filter((l) => (exempt(p, 'asks') ? retiredStop : retired)(l.text)).map((l) => l.at);
  assert.deepEqual(projects.flatMap(stops), []);
});

// The Heavy-rigor trigger is what a change alters: a computed or printed figure, a stored, imported or
// exported data shape, an auth, RLS, tier or payment path, or a new data model or API shape. A statement of the heavy
// pipeline that says where a change reaches instead (a risk area, "reaches one of these areas", "touches synthesis-engine
// prompts") states the retired folder rule, which sends a label or layout change in a billing module to /change-heavy. It
// passes by naming the criteria or pointing at § The rigor trigger; a dated history note passes too.
const HEAVY = /\/change-heavy|heavy[- ]rigor/i;
const REACHES = new RegExp([
  String.raw`\b(?:high-risk|risk|heavy-rigor)[- ]areas?\b`,
  String.raw`\breach(?:es|ing)?\b[^.\n|]{0,30}\bareas?\b`,
  String.raw`\bareas? (?:it|they) reach(?:es)?\b`,
  String.raw`\btouch(?:es|ing)?\b[^.\n|]{0,20}\b(?:synthesis|FSRS|voice|money|auth|RLS|Stripe|exports?|migrations?|payments?|calculat\w*|financial)\b`,
].join('|'), 'i');
const ALTERS = /computed or printed figure|data shape|§ The rigor trigger/i;
const HISTORY_NOTE = /\bUntil \d{4}-\d{2}-\d{2}\b/;
const folderRule = (t) => HEAVY.test(t) && REACHES.test(t) && !ALTERS.test(t) && !HISTORY_NOTE.test(t);
const folderTriggers = (file, text) => staleStatements(file, text, folderRule, (t) => ALTERS.test(t));
const stripCriteria = (text) => text.replace(/computed or printed figure|data shape|§ The rigor trigger/gi, '');
// The project template, where a project's trigger is stated (the cheat sheet ships in reference/, so it's in docs).
const rigorDocs = () => projects.filter((p) => !exempt(p, 'rigor')).map((p) => ({ file: p.file, text: p.text }));

test('every statement of the Heavy-rigor trigger names what a change alters, not the area it reaches', () => {
  // Positive control: each shape of the folder rule is caught (an area by every spelling, reach and touch wording, a stale
  // item beside a correct one), and the criteria, a pointer, a lead-in carrying them, a history note and a security risk
  // path pass.
  const at = (text) => folderTriggers('f', text);
  assert.deepEqual(at('Invoke /change-heavy when a change reaches one of these high-risk areas: money math, RLS.'), ['f:1']);
  assert.deepEqual(at('Use `/change-heavy` when a change reaches one of these areas, whatever its file count:'), ['f:1']);
  assert.deepEqual(at('`/change-heavy` if it touches synthesis-engine prompts.'), ['f:1']);
  assert.deepEqual(at('| Change reaching a Heavy-rigor area | `/change-heavy` |'), ['f:1']);
  assert.deepEqual(at('A risk-area change goes to /change-heavy.'), ['f:1']);
  assert.deepEqual(at('Each Heavy-rigor area FU goes to `/change-heavy`.'), ['f:1']);
  assert.deepEqual(at('A dedup goes to `/change-heavy` by the areas it reaches.'), ['f:1']);
  assert.deepEqual(at('> **Format**:\n> - rigor: `change-heavy` when it alters a computed or printed figure\n> - honesty: a dedup follows the Heavy-rigor areas it reaches'), ['f:3']);
  assert.deepEqual(at('Invoke /change-heavy when a change alters a computed or printed figure; the high-risk areas are where that happens.'), []);
  assert.deepEqual(at('A batch that meets the trigger (`pipeline-shared.md` § The rigor trigger) → /change-heavy, wherever it reaches.'), []);
  assert.deepEqual(at('By default `/change-heavy` runs when a change:\n- alters a stored data shape;\n- alters a computed or printed figure.'), []);
  assert.deepEqual(at('(Until 2026-11-04 any change in a high-risk area ran /change-heavy.)'), []);
  assert.deepEqual(at('The security pass runs when the diff touches a risk path.'), []);
  // Positive control: the scan reaches the canonical statement and the template's: each goes stale with its criteria
  // stripped.
  assert.ok(folderTriggers('p', stripCriteria(read('reference/pipeline-shared.md'))).length > 0, 'the canonical trigger in pipeline-shared.md is not reached');
  const projectDocs = rigorDocs();
  const tplDoc = projectDocs.find((d) => d.file === 'templates/CLAUDE.md');
  assert.ok(tplDoc && folderTriggers(tplDoc.file, stripCriteria(tplDoc.text)).length > 0, "templates/CLAUDE.md's trigger is not reached");
  assert.deepEqual([...[RULEBOOK, ...docs].map((f) => ({ file: f, text: read(f) })), ...projectDocs].flatMap((d) => folderTriggers(d.file, d.text)), []);
});

// reference/pipeline-shared.md holds text the pipelines share, once. A sentence of it copied back into a command or
// another doc is a second copy that drifts.
test('no doc carries a copy of a reference/pipeline-shared.md sentence', () => {
  const shared = read('reference/pipeline-shared.md').split('\n').filter((l) => l && !l.startsWith('#')).slice(1);
  const sentences = shared.flatMap((p) => p.split(/(?<=[.;:])\s+/)).filter((s) => s.length >= 60);
  // Positive control: every section contributes sentences.
  assert.ok(sentences.length >= headings('reference/pipeline-shared.md').length, 'too few shared sentences to check');
  const copies = docs.filter((f) => f !== 'reference/pipeline-shared.md').flatMap((f) => {
    const text = read(f);
    return sentences.filter((s) => text.includes(s)).map((s) => `${f}: ${s.slice(0, 60)}`);
  });
  assert.deepEqual(copies, []);
});

// The anchor sweep runs in every pipeline that writes a change, between the change and its review: the commands that
// pick a review panel are those pipelines. One that stops pointing at the sweep leaves the FUs where it works open.
test('every pipeline that reviews a written change runs the anchor sweep, and the sweep runs a mode the CLI takes', () => {
  const panel = docs.filter((f) => f.startsWith('commands/') && read(f).includes('§ The review panel'));
  // Positive control: the review-panel pipelines are found.
  assert.deepEqual(panel.sort(), ['commands/change-heavy.md', 'commands/cleanup-light.md', 'commands/page-implement.md']);
  // The instruction that runs it, not a mention: each Done summary names the section too.
  const runs = /\brun `\$\{CLAUDE_PLUGIN_ROOT\}\/reference\/pipeline-shared\.md` § The anchor sweep:/;
  assert.ok(!runs.test('- Anchor sweep: its line from `${CLAUDE_PLUGIN_ROOT}/reference/pipeline-shared.md` § The anchor sweep, or why it didn\'t run'));
  assert.deepEqual(panel.filter((f) => !runs.test(read(f))), []);
  const sweep = read('reference/pipeline-shared.md').split(/^## /m).find((s) => s.startsWith('The anchor sweep\n')) ?? '';
  const mode = sweep.match(/node "?\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/ledger\.mjs"? (\w+)/)?.[1];
  const modes = cliModes();
  assert.ok(mode && modes.includes(mode), `the sweep runs ledger.mjs ${mode}, which isn't one of ${modes.join(', ')}`);
});

// Pipelines name a model by family alias so every run gets the newest release of that family the day it ships
// (reference/pipeline-shared.md § Models and effort). A versioned ID pins
// a run to one release and silently ages, so none may appear in a dispatch instruction, an agent definition, the
// process code or the project CLAUDE.md template. Effort is the run's plan's call, so no definition pins one either.
const MODEL_ALIASES = new Set(['fable', 'opus', 'sonnet', 'haiku', 'inherit']);
const VERSIONED_ID = /\bclaude-(?:[a-z]+-)*\d/;
const isComment = (text) => /^\s*(?:\/\/|\/\*|\*)/.test(text);
const isCode = (file) => /\.(?:m?js|ts)$/.test(file);
const frontmatterEnd = (text) => (text.startsWith('---\n') ? text.indexOf('\n---', 4) : -1);
const modelProblems = (file, text, { ids = true } = {}) => {
  const found = [];
  const fmLines = frontmatterEnd(text) < 0 ? 0 : text.slice(0, frontmatterEnd(text)).split('\n').length;
  for (const [n, { at, text: t }] of lines(file, text).entries()) {
    const values = isCode(file)
      ? [...t.matchAll(/\bmodel:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
      : [...t.matchAll(/`model:\s*([^`\s]+)`/g)].map((m) => m[1]).concat(n < fmLines && /^model:/.test(t) ? [t.slice(6).replace(/#.*$/, '').trim().replace(/^['"]|['"]$/g, '')] : []);
    for (const v of values) if (!MODEL_ALIASES.has(v)) found.push(`${at}: model: ${v}`);
    if (n < fmLines && /^effort:/.test(t)) found.push(`${at}: pinned effort`);
    if (ids && !file.endsWith('.test.ts') && !(isCode(file) && isComment(t)) && VERSIONED_ID.test(t)) found.push(`${at}: versioned model ID`);
  }
  return found;
};

test('pipelines name models by family alias, never a versioned ID, and leave effort to the plan', () => {
  assert.deepEqual(modelProblems('commands/x.md', 'Dispatch it with **`model: fable`**, or `model: opus` if not.\nPass `model:` matching it.'), []);
  assert.deepEqual(modelProblems('commands/x.md', 'Dispatch it with `model: claude-fable-5-2`.'), [
    'commands/x.md:1: model: claude-fable-5-2',
    'commands/x.md:1: versioned model ID',
  ]);
  assert.deepEqual(modelProblems('agents/x.md', '---\nname: x\nmodel: sonnet-5\neffort: high\n---\nThe data model: Invoice rows.'), [
    'agents/x.md:3: model: sonnet-5',
    'agents/x.md:4: pinned effort',
  ]);
  assert.deepEqual(modelProblems('agents/x.md', '---\nmodel: "opus" # same level\n---'), []);
  assert.deepEqual(modelProblems('templates/CLAUDE.md', 'Synthesis calls claude-opus-5-5.', { ids: false }), []);
  assert.deepEqual(modelProblems('lib/x.js', "agent(p, { model: 'fable' })\nagent(p, { model: 'opus-5' })"), ['lib/x.js:2: model: opus-5']);
  assert.deepEqual(modelProblems('mods/m/hooks/x.ts', "/** `claude-opus-5-5` → `opus` */\nconst pin = 'claude-3-5-sonnet'"), [
    'mods/m/hooks/x.ts:2: versioned model ID',
  ]);
  const problems = [...files, ...code].flatMap((f) => modelProblems(f, read(f)))
    // A project may name the API model its own product calls, so its CLAUDE.md is held to the `model:` spans only.
    .concat(projects.flatMap((p) => modelProblems(p.file, p.text, { ids: false })));
  assert.deepEqual(problems, [], `name the family alias (${[...MODEL_ALIASES].join(', ')}) and leave effort to the plan:\n${problems.join('\n')}`);
  const unpointed = ['cleanup-light', 'change-heavy', 'page-code', 'page-implement']
    .filter((c) => !read(`commands/${c}.md`).includes('pipeline-shared.md` § Models and effort'));
  assert.deepEqual(unpointed, [], 'each pipeline that plans or runs code points at § Models and effort');
});

// A command loaded through the Skill tool arrives as a new user turn. A report-only command loaded that way, as
// /pre-commit-check is at a pipeline's commit stage, reads to the session as the whole request: it prints the report and
// ends its turn, and the run sits uncommitted until someone answers. Pipelines run it in
// a subagent instead (reference/pipeline-shared.md § The pre-commit audit), whose report returns as a tool result.
const SKILL_LOADED = /\/pre-commit-check[^.\n]{0,40}Skill tool/;

test('no process doc loads /pre-commit-check through the Skill tool', () => {
  const hits = processDocs().filter((file) => SKILL_LOADED.test(read(file)));
  assert.deepEqual(hits, []);
});

test('the matcher catches the Skill-tool call it bans', () => {
  assert.ok(SKILL_LOADED.test('2. **Invoke `/pre-commit-check`** via the Skill tool with no arguments.'));
  assert.ok(!SKILL_LOADED.test('Run `/pre-commit-check` in a subagent (§ The pre-commit audit).'));
});

test('each pipeline that commits points at § The pre-commit audit', () => {
  assert.match(read('reference/pipeline-shared.md'), /^## The pre-commit audit$/m);
  for (const file of ['commands/cleanup-light.md', 'commands/change-heavy.md', 'commands/page-implement.md']) {
    assert.match(read(file), /§ The pre-commit audit/, file);
  }
});
