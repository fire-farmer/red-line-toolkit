// The LedgerLoop numbers and names. The checks, the CLI and the history replay all read
// them from here, so changing a rule is one edit and the replay re-tests it.

export const RULES = Object.freeze({
  lessonSlots: 20,
  memberSlots: 15,
  probationSlots: 5,
  probationSessions: 5,
  lessonsFiledPerSession: 1,
  evidenceWindowSessions: 20,
  ruleMaxChars: 200,
  checkFlagCitations: 3,
  rulebookMax: 25,
  rulebookPromotionPhases: 2,
  groupStepScheduleAt: 5,
  groupStepIdleSessions: 10,
});

export const FOOTER = Object.freeze({
  caught: 'Lesson-Caught',
  cited: 'Lesson-Cited',
  check: 'Lesson-Check',
  closed: 'FU-Closed',
  phase: 'Phase',
  override: 'Over-Limit-Override',
  migration: 'Ledger-Migration',
  // A check in the project's docs/checks.md stopped a real defect (lib/checks.mjs).
  checkCaught: 'Check-Caught',
});

export const RIGORS = Object.freeze(['cleanup-light', 'change-heavy']);

// Why a filed FU can't be done in the change that found it: the filing bar's named reason (red-line-toolkit/reference/ledger-session.md § FUs).
export const FU_REASONS = Object.freeze(['product', 'risk', 'abstraction', 'own run']);

// The pilot's own numbers (spec §7): its pass-check thresholds, and how many sessions before migration
// its outcomes compare against. They judge a migration, not the ledger, so they stay out of RULES and
// the lifecycle doc's Numbers table.
export const PILOT = Object.freeze({
  minSessions: 10,
  lessonSectionBytes: 5000,
  baselineSessions: 10,
});

// Every Stack project ends a work session with exactly one commit whose subject starts like this.
export const SESSION_SUBJECT = /^chore\(stack\): end-session sync\b/;
