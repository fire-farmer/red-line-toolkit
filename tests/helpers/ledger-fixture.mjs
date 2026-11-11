// A migrated Stack project: one migration commit (with the Ledger-Migration footer) and one
// end-session sync, so the open session is 2 and L-1, L-2 are migrated members. Part 1b audits
// straight after the migration commit, before any sync; `syncAfterMigration: false` builds that repo.
import { makeRepo } from './git-fixture.mjs';

export const CO = 'Co-Authored-By: Fixture <fixture@example.invalid>';
export const lesson = (n, rule = `Rule number ${n}.`) => `- **L-${n}** ${rule} → docs/lessons-reference.md#l-${n}`;
export const fu = (n, home = 'Demo/2.4', type = 'perf', rigor = 'cleanup-light') => `- **FU-${n}** [${type} · ${rigor}] Thing ${n} — home: ${home} {anchor: manual}`;

export function stackText({
  lessons = [lesson(1), lesson(2)],
  fus = [1, 2, 3, 4, 5].map((n) => fu(n)),
  phases = ['- [x] **P1 Setup**', '- [ ] **P2 Build** — IN PROGRESS'],
} = {}) {
  return [
    '# STACK', '', '## Phases', '', ...phases, '',
    '## Lessons', '', ...lessons, '',
    '## Follow-ups', '', '<!-- ledger:step-order Demo/2 docs/plan.md -->', '', ...fus, '',
  ].join('\n');
}

/** The reference doc with a `## L-<n>` entry for each lesson row in `stack`, as filing a lesson writes one; the audit warns on a listed lesson without one. */
export const referenceText = (stack) => `# Lessons reference\n${[...stack.matchAll(/^- \*\*(L-\d+)\*\*/gm)].map((m) => `\n## ${m[1]}\n`).join('')}`;

export const PLAN = [
  '| Step | Scope |', '|---|---|', '| **2.1 Build** | x |', '',
  '## Group steps', '| Step | Group type | Rigor | Order |', '|---|---|---|---|',
  '| 2.4 | perf | cleanup-light | after 2.1 |', '',
].join('\n');

export const STANDING = '# Standing FUs\n\n- **FU-6** [observability · change-heavy] Stale banner — trigger: date 2027-01-01\n';

/** Commits `count` end-session syncs carrying `footers` (by default a lesson answer and a valid Phase:); returns their SHAs. */
export function addSyncs(repo, count, footers = 'Lesson-Check: none\nPhase: Demo/2\n') {
  return Array.from({ length: count }, () => repo.commit(`chore(stack): end-session sync — Demo/2\n\nSession.\n\n${footers}${CO}\n`));
}

/** `beforeMigration(repo)` commits history ahead of the migration commit, such as the sessions a pilot baseline reads. */
export function makeLedgerProject({ lessons, syncAfterMigration = true, beforeMigration } = {}) {
  const repo = makeRepo();
  beforeMigration?.(repo);
  const stack = stackText({ lessons });
  repo.commit(`chore(stack): migrate the ledger to LedgerLoop\n\nMigration.\n\nLedger-Migration: Demo\n${CO}\n`, {
    'STACK.md': stack,
    'Standing-FUs.md': STANDING,
    'docs/plan.md': PLAN,
    'docs/lessons-reference.md': referenceText(stack),
  });
  if (syncAfterMigration) addSyncs(repo, 1);
  const project = { name: 'Demo', path: repo.dir, migrated: true, standing: 'Standing-FUs.md', reference: 'docs/lessons-reference.md' };
  return { repo, project };
}
