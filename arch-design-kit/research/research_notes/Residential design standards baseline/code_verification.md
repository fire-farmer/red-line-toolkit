# Code verification against primary text (VERIFY.md queue)

Status: **not verified. No primary code text could be read**, so every item below is NOT FOUND. Nothing in the playbook changes. All ⚠️ marks in `playbook/VERIFY.md` and `RULES.md` stay as they are.

## 1. Method and limits

Date: 2026-11-22. Tool: plain `curl` from a cloud session, one request at a time. HTML was stripped with Python. Nine requests in total.

| Site | What happened | Used? |
|---|---|---|
| up.codes | The site answers. The short link `https://up.codes/s/emergency-escape-and-rescue-required` returned 200, but its header shows **"South Holland Residential Code 2012"**, a local adoption, so it does not count. Three guesses at the model-code viewer (`/viewer/irc-2021`, `/viewer/general/irc-2021`, `/viewer/general/irc-2021/chapter/3/building-planning`) returned 404. Then `https://up.codes/robots.txt` was read. Its default group (`User-agent: *`) is `Disallow: /`. A separate "AI and other bots" group names **`Claude-Code`, `Claude-User`, `ClaudeBot`** and `anthropic-ai`. That group allows only `/a`, `/blog`, `/code-accuracy`, `/compare`, `/features`, `/free-law`, `/pricing` and `/pro-codes-act`, and ends with `Disallow: /`. The code text lives under `/viewer/` and `/s/`, and the site owner has opted this agent out of both. **Fetching stopped there.** No up.codes code text was used for any verdict. | No |
| codes.iccsafe.org | Skipped as instructed (CloudFront 403 to scripts). | No |
| energycodes.gov | All three plain requests (`/robots.txt`, `/sitemap.xml`, `/determinations`) returned the same 247-byte page, titled **"Request Rejected"** ("The requested URL was rejected. Please consult with your administrator."), with HTTP status 404 and a different support ID each time. This is a web-application-firewall rejection of scripted clients, not a missing page. The "root returns 404" seen earlier is very likely the same thing. Nothing was done to get around it. The IECC 2021 and 2024 tables could not be found. | No |

Limits:

- No value below comes from memory. The "Section 2021 / 2024" column repeats what the playbook and VERIFY.md *cite*. Those numbers are unverified.
- `VERIFY.md` § "To unblock this" says allowing the three hosts in the network settings would be enough. That is no longer the obstacle. The session's network now reaches all three, and the blocks are at the sites themselves: an ICC CDN 403, an up.codes robots.txt opt-out naming Claude agents, and an energycodes.gov firewall.
- Ways to finish: a person reads the free public-access view of IRC 2021/2024 and IECC 2021/2024 on ICC Digital Codes, or the same codes on up.codes, **in a browser**, and fills in the "Code text" and "Verdict" columns below. Or use the AHJ's adopted text, which governs anyway. Record the edition shown in each page header.

## 2. Verification table

Our values are copied from `playbook/02-code-baseline.md` unless another chapter is named.

| Rule ID | Item | Our value (from the chapter) | Code text (short exact quote) | Section 2021 / 2024 | Verdict | Source URL and edition shown |
|---|---|---|---|---|---|---|
| C-EGR-1 | EERO "where required" | One per sleeping room, per basement and per habitable attic; basement sleeping rooms each need their own; opens to a public way or to a yard or court ≥ 36 in. wide | not read | cited R310.1 / R319 (unverified) | NOT FOUND | none (up.codes opted out; only result was South Holland 2012, not counted) |
| C-EGR-5 | Window well and ladder | Well ≥ 9 sq ft, ≥ 36 in. projection and width; wells deeper than 44 in. need a permanent ladder, rungs ≥ 12 in. wide, ≤ 18 in. o.c. | not read | cited R310.4 / R319 (unverified) | NOT FOUND | none |
| C-DOOR-1 | Egress door | ≥ 1 side-hinged egress door, ≥ 32 in. clear width (face of door to stop, open 90°), ≥ 78 in. clear height; egress path not through the garage | not read | cited R311.2 / R318 (unverified) | NOT FOUND | none |
| C-DOOR-2 | Door landings | Landing each side of exterior doors, ≥ 36 in. in direction of travel, slope ≤ 2%; at the required egress door ≤ 1½ in. below threshold, or ≤ 7¾ in. where the door does not swing over it | not read | cited R311.3 / R318 (unverified) | NOT FOUND | none |
| C-HALL-1 | Hallway width | ≥ 36 in. clear | not read | cited R311.6 / R318 (unverified) | NOT FOUND | none |
| C-STAIR-3 | Tread and nosing | Tread ≥ 10 in.; nosing ¾–1¼ in.; no nosing required at treads ≥ 11 in. (the 11 in. exemption is the ⚠️ part) | not read | cited R311.7 / R318 (unverified) | NOT FOUND | none |
| C-STAIR-7 | Uniformity, rise, winders, spirals | Uniform within ⅜ in. in a flight; max rise between landings 151 in.; winders 10 in. at the walkline (12 in. from the narrow side), ≥ 6 in. at any point; spiral 26 in. clear, ≤ 9½ in. risers, 6′-6″ headroom | not read | cited R311.7 / R318 (unverified) | NOT FOUND | none |
| C-RAMP-1 | Ramps | ≤ 1:12 at the required egress door, ≤ 1:8 elsewhere; landings ≥ 36 in.; handrail where steeper than 1:12 | not read | cited R311.8 / R318 (unverified) | NOT FOUND | none |
| C-GUARD-2 | Window fall protection | Operable window with sill < 24 in. above floor and > 72 in. above grade outside: must not pass a 4 in. sphere, or ASTM F2090 devices; opening-control devices must still allow the escape opening | not read | cited R312.2 / R321 (unverified) | NOT FOUND | none |
| C-GLAZ-1 | Safety glazing, hazardous locations | (1) doors; (2) within 24 in. arc of either door edge, bottom < 60 in.; (3) panes > 9 sq ft, bottom < 18 in., top > 36 in., walking surface within 36 in.; (4) guards and railings; (5) tub, shower, pool enclosures, bottom < 60 in. above standing surface; (6) within 36 in. of stair or ramp, bottom < 36 in.; (7) within 60 in. arc of bottom-stair nosing, bottom < 36 in. | not read | cited R308.4 / possibly R324.4 (unverified) | NOT FOUND | none |
| C-ALARM-1 | Smoke alarms: where | Every sleeping room and every story, incl. basements and habitable attics; interconnected; hard-wired with battery backup | not read | cited R314 / R310 (unverified) | NOT FOUND | none |
| C-ALARM-2 | Smoke alarms: outside sleeping areas, spacing, 2024 changes | Outside each sleeping area; ≥ 3 ft from a bathroom door; from cooking appliances, ionization ≥ 20 ft, photoelectric ≥ 6 ft; 2024 changes some locations | not read | cited R314 / R310 (unverified) | NOT FOUND | none |
| C-ALARM-3 | CO alarms | Outside each sleeping area when there is a fuel-fired appliance or an attached garage with an opening into the dwelling; inside any bedroom that contains, or whose bath contains, a fuel-burning appliance | not read | cited R315 / unknown (2024 number not found) | NOT FOUND | none |
| C-BATH-1 | Toilet and lavatory clearances | ≥ 15 in. centerline to side wall, partition or vanity; ≥ 30 in. center to center; ≥ 21 in. clear in front | not read | cited R307.1, P2705.1 / 2024 not found | NOT FOUND | none |
| C-BATH-2 | Shower size | ≥ 900 sq in. and holds a 30 in. circle (or ≥ 25 in. min. dimension with ≥ 1,300 sq in.); opening ≥ 22 in. clear; hinged doors swing out; valve limited to 120 °F; walls nonabsorbent to 6 ft | not read | cited P2708.1 / 2024 not found | NOT FOUND | none |
| C-ACCESS-1 | Attic and crawlspace access | Attic ≥ 22×30 in. where ≥ 30 in. headroom over ≥ 30 sq ft, 30 in. headroom above the opening; with an attic appliance, opening fits the largest appliance, ≤ 20 ft passage 24 in. wide, 30×30 in. service space; crawlspace ≥ 18×24 in. through floor, ≥ 16×24 in. through wall | not read | cited R807.1, R408.4 / 2024 not found | NOT FOUND | none |
| C-SEP-1 | Townhouse and two-family separations | Townhouses: two 1-hr walls, or a common wall 1-hr if sprinklered and 2-hr if not, foundation to roof sheathing, 30 in. parapets or the roof-protection alternative. Two-family: 1-hr wall and floor (½-hr if sprinklered) | not read | cited R302.2–R302.3 / 2024 not found | NOT FOUND | none |
| C-LIGHT-1 | Natural light and ventilation | Glazing ≥ 8% of floor area, openable ≥ 4%; exceptions for mechanical ventilation (M1505) plus artificial light averaging 6 fc, or whole-house ventilation in place of openable area; adjoining room counts if the opening is ≥ ½ the wall, ≥ 1/10 of floor area and ≥ 25 sq ft | not read | cited R303 / possibly R325 (unverified) | NOT FOUND | none |
| C-LIGHT-2 | Bathroom glazing or exhaust | ≥ 3 sq ft glazing, half openable, or exhaust 50 cfm intermittent / 20 cfm continuous | not read | cited R303, M1505 / possibly R325 (unverified) | NOT FOUND | none |
| M-VENT-1 | Ventilation (`04-envelope-climate-mep.md`) | Bath 50 cfm intermittent or 20 cfm continuous; kitchen 100 cfm intermittent or 25 cfm continuous, ducted outdoors; below 5 ACH50 needs whole-house mechanical ventilation; outdoor intakes ≥ 10 ft from contaminant sources | not read | cited M1505 / 2024 not found | NOT FOUND | none |
| Z-FSD-1 | Sprinklered Table R302.1(2) | "More lenient" than Table R302.1(1); the chapter gives no values for it (example amendment: Van Meter, Iowa requires the 1-hr wall only below 3 ft) | not read | cited R302.1, Table R302.1(2) / R302.1 (unverified) | NOT FOUND | none |
| C-GAR-1 | Garage door self-closer: which edition added it | "Self-closing where adopted" (edition not stated) | not read | cited R302.5.1 / 2024 not found | NOT FOUND | none |
| E-INSUL-1 | IECC 2021 Table R402.1.3, every row | See the sub-table below | not read | cited IECC 2021 Table R402.1.3 | NOT FOUND | none (energycodes.gov firewall rejection; ICC skipped) |
| E-INSUL-1 | IECC 2024 envelope table and credit requirement | "The 2024 IECC is believed to carry most envelope values forward and adds an efficiency-credit requirement" | not read | IECC 2024 table number not found | NOT FOUND | none |
| E-AIR-1 | 2024 air-leakage values (`04-envelope-climate-mep.md`) | Chapter gives only IECC 2021: 3.0 ACH50 in zones 3–8, 5.0 ACH50 in zones 0–2, blower-door tested; no 2024 values stated | not read | cited IECC 2024 R402.4 (unverified) | NOT FOUND | none |

### E-INSUL-1 sub-table: IECC 2021 Table R402.1.3 rows as the playbook states them

| CZ | Window U | Skylight U | SHGC | Ceiling R | Wood wall R | Floor R | Basement wall R | Slab R, depth | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 0–1 | 0.50 | 0.75 | 0.25 | 30 | 13 or 0+10ci | 13 | 0 | 0 | NOT FOUND |
| 2 | 0.40 | 0.65 | 0.25 | 49 | 13 or 0+10ci | 13 | 0 | 0 | NOT FOUND |
| 3 | 0.30 | 0.55 | 0.25 | 49 | 20 or 13+5ci or 0+15ci | 19 | 5ci or 13 | 10ci, 2 ft | NOT FOUND |
| 4 (exc. 4C) | 0.30 | 0.55 | 0.40 | 60 | 20+5ci or 13+10ci or 0+15ci | 19 | 10ci or 13 | 10ci, 4 ft | NOT FOUND |
| 5 and 4C | 0.30 | 0.55 | NR | 60 | 20+5ci or 13+10ci or 0+15ci | 30 | 15ci or 19 or 13+5ci | 10ci, 4 ft | NOT FOUND |
| 6 | 0.30 | 0.55 | NR | 60 | 20+5ci or 13+10ci or 0+15ci | 30 | 15ci or 19 or 13+5ci | 10ci, 4 ft | NOT FOUND |
| 7–8 | 0.30 | 0.55 | NR | 60 | 20+5ci or 13+10ci or 0+15ci | 38 | 15ci or 19 or 13+5ci | 10ci, 4 ft | NOT FOUND |

Counts: 0 CONFIRMED, 0 CORRECTED, 25 NOT FOUND. The 25 rows above cover all 20 rows of VERIFY.md's "Code values" and "Energy" tables. Rows that name several rules are split, one rule per row.

## 3. Corrections the playbook needs

None. No code text was read, so nothing can be confirmed or corrected. Leave `02-code-baseline.md`, `04-envelope-climate-mep.md`, `05-space-planning.md`, `RULES.md`, `VERIFY.md` and `LIMITS` in `tools/check_design.py` unchanged until a primary-text check is done.
