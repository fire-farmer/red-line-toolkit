# Decision log: <project name>

> W-DEC-1. Record every non-obvious design decision and every deviation from a playbook rule here. Cite the rule IDs and give the reason. Gate sign-offs go here too. Never delete an entry; supersede it with a new one instead.

## Template

```
### D-NNN · <short title>          <date> · phase: <SD|DD|CD> · status: proposed | accepted | superseded by D-MMM
Context:   what forced the decision
Options:   A … / B … / C …
Decision:  what we chose
Rules:     rule IDs touched (e.g. "deviates from SP-KIT-2: triangle 27 ft"; "S-ENG-1: engineer to confirm LVL")
Why:       the reason the owner accepted
Follow-up: anything that must happen later (verification, engineer, AHJ question)
```

## Gate sign-offs

| Gate | Date | Checklist result | Owner sign-off | Notes |
|---|---|---|---|---|
| 0 Brief | | | | |
| 1 Program | | | | |
| 2 Schematic design | | | | |
| 3 Design development | | | | |
| 4 Handoff | | | | |

## Decisions

### D-001 · Example: kitchen on the north side            2026-11-21 · SD · accepted
Context:   The south façade is reserved for the great room and the primary bedroom (P-ORIENT-1).
Options:   A: kitchen south, living north. B: kitchen north with a 5 ft window over the sink.
Decision:  B.
Rules:     P-ORIENT-1 (living spaces south); P-LIGHT-1 met for the kitchen through the north window plus the open great room.
Why:       The family spends evenings in the great room; morning coffee is fine without direct sun.
Follow-up: Check the kitchen's daylight depth in DD.
