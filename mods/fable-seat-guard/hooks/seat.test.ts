import { describe, expect, test } from 'claude-code/testing'

import { WRITE_TOOLS, familyOf, isDecorrelated, isSeatType, readOnlyBashProblem, seatModelFor } from './seat'

test('a seat keeps the tools it reports and reads with, and loses the ones that write', () => {
  // SubagentHandback is how a seat delivers its report: refusing it silenced every seat
  for (const tool of ['SubagentHandback', 'Read', 'Grep', 'Glob', 'Bash']) expect(WRITE_TOOLS.has(tool)).toBe(false)
  for (const tool of ['Edit', 'MultiEdit', 'NotebookEdit', 'Write']) expect(WRITE_TOOLS.has(tool)).toBe(true)
})

test('the seat is found bare or namespaced by its plugin, and nothing else is', () => {
  expect(isSeatType('fable-seat')).toBe(true)
  expect(isSeatType('red-line-toolkit:fable-seat')).toBe(true)
  for (const other of ['general-purpose', 'red-line-toolkit:the-adjudicator', 'not-a-fable-seat', 'fable-seat-x', undefined]) {
    expect(isSeatType(other)).toBe(false)
  }
})

describe('model family', () => {
  test('reads the family from an id or an alias', () => {
    expect(familyOf('claude-opus-5-5')).toBe('opus')
    expect(familyOf('claude-fable-5-1')).toBe('fable')
    expect(familyOf('haiku')).toBe('haiku')
    expect(familyOf('gpt-x')).toBe('unknown')
    expect(familyOf(undefined)).toBe('unknown')
  })

  test('the seat takes the family the orchestrator is not', () => {
    expect(seatModelFor('claude-opus-5-5')).toBe('fable')
    expect(seatModelFor('claude-sonnet-5-5')).toBe('fable')
    expect(seatModelFor('claude-fable-5-1')).toBe('opus')
  })

  test('a seat on the author family, or an unknown one, is not decorrelated', () => {
    expect(isDecorrelated('claude-fable-5-1', 'claude-opus-5-5')).toBe(true)
    expect(isDecorrelated('claude-opus-5-5', 'claude-fable-5-1')).toBe(true)
    expect(isDecorrelated('claude-opus-5-5', 'claude-opus-5')).toBe(false)
    expect(isDecorrelated(undefined, 'claude-opus-5-5')).toBe(false)
  })
})

describe('read-only Bash', () => {
  test('lets the commands a seat audits with through', () => {
    for (const command of [
      'git diff HEAD',
      'git diff --staged --stat',
      'git -C /repo log --oneline -5',
      'grep -rn "=>" src/styles | head -20',
      "rg 'color-mix' src/styles",
      'sed -n 1,40p src/app.tsx',
      'find src -name "*.css"',
      'git show HEAD:src/a.ts 2>/dev/null || cat src/a.ts',
      'wc -l src/a.ts 2>&1',
      'LC_ALL=C sort src/list.txt',
      'git ls-tree -r HEAD --name-only tests',
      'node --test tests/decision-gates.test.mjs',
      'npm test',
      'npm test -- --test-reporter=dot 2>&1 | tail -20',
      'node --test --test-name-pattern="panel" tests/review-panel.test.mjs',
    ]) {
      expect(readOnlyBashProblem(command)).toBeUndefined()
    }
  })

  test('refuses anything that writes or runs something else', () => {
    const refused: Array<[string, string]> = [
      ['echo x > src/a.ts', 'output redirection'],
      ['cat a >> b', 'output redirection'],
      ['sed -i s/a/b/ src/a.ts', 'sed -i s/a/b/ src/a.ts'],
      ['sed --in-place s/a/b/ f', 'sed --in-place s/a/b/ f'],
      ['find . -name x -delete', 'find . -name x -delete'],
      ['find . -execdir rm {} +', 'find . -execdir rm {} +'],
      ['sort -o out.txt in.txt', 'sort -o out.txt in.txt'],
      ['git checkout -- src/a.ts', 'git checkout'],
      ['git diff --output=patch.diff', 'git --output'],
      ['git', 'git'],
      ['rm -rf src', 'rm'],
      ['grep x a | tee b', 'tee'],
      ['npm run build', 'npm'],
      ['npm install', 'npm'],
      ['npm run test', 'npm'],
      ['node -e "require(1)"', 'node'],
      ['node scripts/ledger.mjs audit', 'node'],
      ['node --test x > out.txt', 'output redirection'],
      ['node --test --import ./x.mjs t.mjs', 'node'],
      ['node --test -e 1', 'node'],
      ['node --test --test-reporter=./r.mjs t.mjs', 'node'],
      ['node --test --test-reporter-destination=out.txt t.mjs', 'node'],
      ['npm test --script-shell=bash', 'npm'],
      ['npm test -- --require x', 'npm'],
      ['cat $(ls)', 'command or process substitution'],
      ['diff <(git show HEAD:a) a', 'command or process substitution'],
      ['ls && touch done', 'touch'],
      ['constructor x', 'constructor'],
      ['toString', 'toString'],
    ]
    for (const [command, problem] of refused) {
      expect(readOnlyBashProblem(command)).toBe(problem)
    }
  })
})
