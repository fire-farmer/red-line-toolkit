import type { Register } from 'claude-code'

import { WRITE_TOOLS, isSeatType, isDecorrelated, readOnlyBashProblem, seatModelFor } from './seat'

type Verdict = { seatModel: string; parentModel: string; isOk: boolean }

// A description that names Fable on an agent dispatched as another type: a seat the guard can't see
const NAMES_FABLE = /\bfable\b/i

export const register: Register = on => {
  // Seats this session started, by agent id: they never write
  const seats = new Set<string>()
  // Each seat's model check, by the Agent call that started it, until that call answers
  const verdicts = new Map<string, Verdict>()
  // Agent calls that look like a seat but weren't dispatched as one
  const strays = new Set<string>()

  on('agent.spawn', async ($, e, next) => {
    if (!isSeatType(e.subagentType)) {
      if (NAMES_FABLE.test(e.description)) strays.add(e.tool_use_id)
      return next(e)
    }

    const started = await next({ ...e, model: seatModelFor(e.parentModel) })
    if (started.deny !== undefined) return started

    if (started.agentId !== undefined) seats.add(started.agentId)
    const isOk = isDecorrelated(started.model, e.parentModel)
    verdicts.set(e.tool_use_id, { seatModel: started.model, parentModel: e.parentModel, isOk })
    if (!isOk) {
      $.ui.toast(`Fable seat "${e.description}" runs on ${started.model}, the author's family`, {
        timeoutMs: 15_000,
      })
    }

    return started
  })

  on('tool.call', async ($, e, next) => {
    if (e.agentId !== undefined && seats.has(e.agentId)) {
      if (WRITE_TOOLS.has(e.tool)) {
        return { deny: `${$.plugin.name}: a Fable seat only audits, so it can't call ${e.tool}. Report the finding instead.` }
      }
      if (e.tool === 'Bash') {
        const problem = readOnlyBashProblem(e.command)
        if (problem !== undefined) {
          return { deny: `${$.plugin.name}: a Fable seat runs read-only commands and the test runners only (refused: ${problem}). Report the finding instead.` }
        }
      }
      return next(e)
    }

    if (e.tool !== 'Agent' || e.tool_use_id === undefined) return next(e)

    const answered = await next(e)
    const note = noteFor(verdicts.get(e.tool_use_id), strays.has(e.tool_use_id))
    verdicts.delete(e.tool_use_id)
    strays.delete(e.tool_use_id)
    if (note === undefined || answered.deny !== undefined) return answered

    // What the orchestrator reads beside the seat's report, so the model check is on the record
    return { ...answered, context: [...(answered.context ?? []), note] }
  })
}

function noteFor(verdict: Verdict | undefined, isStray: boolean): string | undefined {
  if (verdict?.isOk) {
    return `fable-seat-guard: this seat ran on ${verdict.seatModel} and the orchestrator on ${verdict.parentModel}, so it is decorrelated. The seat's model check is done.`
  }
  if (verdict !== undefined) {
    return `fable-seat-guard: NOT DECORRELATED. This seat ran on ${verdict.seatModel}, the same family as the orchestrator (${verdict.parentModel}). Don't count its findings as decorrelated evidence: dispatch the seat again, and list the miss in the run's report.`
  }
  if (isStray) {
    return 'fable-seat-guard: this looks like a Fable seat but was dispatched as another agent type, so its model and tools went unchecked. Dispatch Fable seats with subagent_type "red-line-toolkit:fable-seat".'
  }
  return undefined
}
