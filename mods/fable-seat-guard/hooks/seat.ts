// The agent type the pipelines dispatch a decorrelated audit seat as: the toolkit's agents/fable-seat.md.
// A plugin's agents are namespaced, so the toolkit dispatches it as `red-line-toolkit:fable-seat`.
export const SEAT_TYPE = 'fable-seat'

/** Whether a dispatch's subagent type is the seat: bare, or namespaced by the plugin that ships it. */
export function isSeatType(subagentType: string | undefined): boolean {
  return subagentType === SEAT_TYPE || (subagentType ?? '').endsWith(`:${SEAT_TYPE}`)
}

// The tools that change files, which a seat never calls. Its agent file, the toolkit's agents/fable-seat.md, decides which tools a
// seat has; this is not an allow-list, because the harness adds tools of its own (SubagentHandback
// delivers the seat's report) that no list here can name.
export const WRITE_TOOLS: ReadonlySet<string> = new Set(['Edit', 'MultiEdit', 'NotebookEdit', 'Write'])

const FAMILIES = ['fable', 'opus', 'sonnet', 'haiku'] as const
export type Family = (typeof FAMILIES)[number] | 'unknown'

/** The family a model id or alias belongs to: `claude-opus-5-5` → `opus`. */
export function familyOf(model: string | undefined): Family {
  const id = (model ?? '').toLowerCase()
  return FAMILIES.find(family => id.includes(family)) ?? 'unknown'
}

/** The seat's model: Fable, or Opus when the orchestrator is itself Fable. */
export function seatModelFor(parentModel: string): 'fable' | 'opus' {
  return familyOf(parentModel) === 'fable' ? 'opus' : 'fable'
}

/** Decorrelated: the seat ran on a known family that isn't the orchestrator's. */
export function isDecorrelated(seatModel: string | undefined, parentModel: string): boolean {
  const seat = familyOf(seatModel)
  return seat !== 'unknown' && seat !== familyOf(parentModel)
}

// Commands a seat may run, and for some, the arguments that would make them write.
// A guard against a seat changing the tree by accident, not a sandbox.
const READ_ONLY: Record<string, RegExp | null> = {
  cat: null,
  cd: null,
  cut: null,
  diff: null,
  echo: null,
  file: null,
  head: null,
  jq: null,
  ls: null,
  nl: null,
  pwd: null,
  stat: null,
  tail: null,
  tr: null,
  wc: null,
  basename: null,
  dirname: null,
  realpath: null,
  grep: null,
  rg: null,
  sed: /(^|\s)(-[a-zA-Z]*i|--in-place)/,
  sort: /(^|\s)(-[a-zA-Z]*o|--output)/,
  find: /(^|\s)-(delete|exec|execdir|ok|okdir|fprint|fprint0|fprintf|fls)\b/,
}

const READ_ONLY_GIT = new Set([
  'blame',
  'cat-file',
  'describe',
  'diff',
  'grep',
  'log',
  'ls-files',
  'ls-tree',
  'merge-base',
  'rev-parse',
  'shortlog',
  'show',
  'status',
])

/** Why `command` could change something, or undefined when it only reads. */
export function readOnlyBashProblem(command: string): string | undefined {
  // Quoted text is data (a grep pattern with `=>` in it), so drop it before looking for operators
  const bare = command
    .replace(/'[^']*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/\d?>&\d/g, ' ')
    .replace(/\d?>\s*\/dev\/null/g, ' ')

  if (/\$\(|`|<\(/.test(bare)) return 'command or process substitution'
  if (/>/.test(bare)) return 'output redirection'

  for (const segment of bare.split(/&&|\|\||[;|\n]/)) {
    const words = segment.trim().split(/\s+/).filter(Boolean)
    while (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[0] ?? '')) words.shift()
    const name = words[0]
    if (name === undefined) continue

    const rest = words.slice(1)
    const args = rest.join(' ')

    if (name === 'git') {
      const sub = gitSubcommand(rest)
      if (sub === undefined || !READ_ONLY_GIT.has(sub)) return `git ${sub ?? ''}`.trim()
      if (/(^|\s)--output\b/.test(args)) return 'git --output'
      continue
    }

    // Running the tests lets a seat confirm a check is red or green; node and npm run nothing else.
    // Only paths and a few `--test-*` options pass: a flag like --import, -e or --script-shell runs other code.
    if (name === 'node' && rest[0] === '--test' && rest.slice(1).every(isTestArg)) continue
    if (name === 'npm' && rest[0] === 'test' && (rest.length === 1 || (rest[1] === '--' && rest.slice(2).every(isTestArg)))) continue

    // An own key only: `name in` would let `constructor` or `toString` through as commands
    const writes = Object.hasOwn(READ_ONLY, name) ? READ_ONLY[name] : undefined
    if (writes === undefined) return name
    if (writes !== null && writes.test(args)) return `${name} ${args}`.trim()
  }

  return undefined
}

// A test runner's argument a seat may pass: a path, or an option that only filters or formats the run. A custom
// reporter is a module path, and a reporter destination writes a file, so neither passes.
const TEST_OPTION = /^--test-(?:name-pattern|skip-pattern|only|concurrency|timeout)(?:=|$)|^--test-reporter=(?:spec|tap|dot)$/
const isTestArg = (arg: string): boolean => !arg.startsWith('-') || TEST_OPTION.test(arg)

/** The subcommand of `git <args>`, past `-C <path>`, `-c <key=value>` and other flags. */
function gitSubcommand(args: string[]): string | undefined {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i] ?? ''
    if (arg === '-C' || arg === '-c') i += 1
    else if (!arg.startsWith('-')) return arg
  }
  return undefined
}
