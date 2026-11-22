# Verification queue

The research for this playbook ran in a sandbox whose network blocked the primary code sites (codes.iccsafe.org, up.codes). Some values came from secondary sources: city handouts, ICC and NAHB training decks, and code-explainer sites. Those are marked ✅. The rest came from expert knowledge of the code text without a source and are marked ⚠️. They are believed correct, and the checker already uses several of them. This page lists what still needs a primary-source check, so the playbook's foundation becomes fully sourced over time.

**How to clear an item:** read the adopted edition's text (ICC Digital Codes public access, or the AHJ's adoption ordinance), confirm or correct the value and section number, update the chapter and `RULES.md` (⚠️ → ✅), update `LIMITS` in `tools/check_design.py` if it changed, and run the tests.

## Code values (IRC 2021, with the 2024 numbers)

| Item | Rule | Where to verify |
|---|---|---|
| EERO "where required": every sleeping room, basement, habitable attic; opening onto a yard or court ≥ 36 in. | C-EGR-1 | IRC 2021 R310.1 / 2024 R319 |
| Window well dimensions and ladder | C-EGR-5 | R310.4 / R319 |
| Egress door 32 in. × 78 in. clear; landings | C-DOOR-1, C-DOOR-2 | R311.2–R311.3 / R318 |
| Hallway 36 in. | C-HALL-1 | R311.6 / R318 |
| Nosing exemption at 11 in. treads; 151 in. maximum rise; ⅜ in. uniformity | C-STAIR-3, C-STAIR-7 | R311.7 / R318 |
| Ramps 1:12 and 1:8 | C-RAMP-1 | R311.8 / R318 |
| Window fall protection: 24 in. sill, 72 in. above grade | C-GUARD-2 | R312.2 / R321 |
| Safety glazing hazardous locations | C-GLAZ-1 | R308.4 / possibly R324.4 |
| Smoke alarm locations and 2024 changes | C-ALARM-1, C-ALARM-2 | R314 / R310 |
| CO alarm section number in 2024 | C-ALARM-3 | R315 / ? |
| Toilet and lavatory clearances 15, 30 and 21 in. | C-BATH-1 | R307.1, P2705.1 |
| Shower 900 sq in., 30 in. circle | C-BATH-2 | P2708.1 |
| Attic and crawlspace access sizes | C-ACCESS-1 | R807.1, R408.4 |
| Townhouse and two-family separations | C-SEP-1 | R302.2–R302.3 |
| Light and ventilation percentages and exceptions; bath glazing and exhaust | C-LIGHT-1, C-LIGHT-2, M-VENT-1 | R303, M1505 / possibly R325 |
| Sprinklered Table R302.1(2) | Z-FSD-1 | R302.1 |
| Garage door self-closer: which edition added it | C-GAR-1 | R302.5.1 |

## Energy

| Item | Rule | Where to verify |
|---|---|---|
| IECC 2021 Table R402.1.3, every row | E-INSUL-1 | IECC 2021 / energycodes.gov |
| IECC 2024 envelope table and the credit requirement | E-INSUL-1 | IECC 2024 |
| 2024 air-leakage values | E-AIR-1 | IECC 2024 R402.4 |

## Guidelines and practice

| Item | Rule | Where to verify |
|---|---|---|
| NKBA kitchen values (aisles, triangle, landings) | SP-KIT-1, SP-KIT-2 | the current NKBA Kitchen Planning Guidelines |
| NKBA bath values | SP-BATH-1 | the current NKBA Bath Planning Guidelines |
| Universal design clearances | SP-UD-1, SP-UD-2, SP-UD-3 | ICC A117.1 (current edition), 2010 ADA Standards |
| Truss span guidance (40 ft) | S-ROOF-1 | truss manufacturer and SBCA literature |
| Rainscreen gap | E-RAIN-1 | Building Science Corporation, cladding manufacturer |
| NEC 240.24: panel locations | M-ELEC-1 | NFPA 70 |

## How to clear this list: a person reads, Claude records

Automated reading doesn't work, and changing network settings won't fix that. On 2026-11-22 the session's network was opened to all three sites, and each one still refused scripted access on its own side:

- **codes.iccsafe.org** (ICC Digital Codes): its CloudFront bot protection returns 403 to scripts.
- **up.codes**: its robots.txt opts Claude's agents out by name (`ClaudeBot`, `Claude-User`, `Claude-Code`, `anthropic-ai`) from everything except its marketing pages. Claude respects that, including when browsing on your behalf.
- **energycodes.gov**: its firewall answers scripted requests with "Request Rejected".

So the verification is a reading job for a person. The table in [code_verification.md](../research/research_notes/Residential%20design%20standards%20baseline/code_verification.md) lists every item with the playbook's current value and empty "Code text" and "Verdict" columns:

1. Open the free public view of the IRC/IECC 2021 (and 2024) at ICC Digital Codes, or your AHJ's adopted text, in your own browser.
2. Read each section, and paste the sentence (or just the number) into the table, or into a chat with Claude.
3. Claude updates the chapter, `RULES.md` (⚠️ → ✅) and `LIMITS` in `tools/check_design.py`, then runs the tests.

The AHJ's adopted code is the text that matters for a real project anyway (W-VERIFY-1).
