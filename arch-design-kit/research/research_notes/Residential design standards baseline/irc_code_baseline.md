# US Residential Code Baseline (IRC 2021/2024, IECC, accessibility, NKBA, zoning inputs)

*Research method and limits, so the report writer knows how far to trust this file: codes.iccsafe.org and up.codes could not be fetched in this session (the session's network allowlist blocks them), and the shared web-search budget ran out after 9 extended searches. Everything under "Cited Findings" comes from search-result excerpts that the search tool attributed to the linked pages. I did not open those pages to read the full text, and most of them are secondary (municipal handouts, code-explainer sites, ICC/NAHB training decks). Values under "Gaps" tagged **[UNVERIFIED]** come from the model's knowledge of the code text. They are included because the playbook needs a complete baseline, but each one has to be checked against the ICC text the AHJ adopted before it is treated as a rule. Confidence tags: H = high, M = medium, L = low.*

---

## 0. Edition map, 2024 renumbering, and adoption/amendment context

### Takeaway
The 2024 IRC **reorganized and renumbered Chapter 3**, so a 2021 section number can point to a different topic in 2024 (2024 R310 is Smoke Alarms, not EERO). Checklists should carry both numbers and key on the section title. The AHJ's adopted edition and local amendments always govern.

### Cited Findings
- NAHB: the 2024 IRC regrouped Chapter 3 by topic. Structural and fire-resistance sections come first, then fire/CO detection and sprinklers, then room configuration, egress, indoor environment and energy systems. — [NAHB, 2024 Significant Code Changes for the IRC](https://www.nahb.org/-/media/NAHB/advocacy/docs/top-priorities/codes/code-adoption/signficant-code-changes-2024-irc.pdf?rev=a90577b5da8d4931b8beb20f21105df2&hash=D95B3F0AC6ADA32006389A67428A19A5)
- 2021 to 2024 mappings shown in ICC's significant-changes deck and a Montana state training deck, with the 2024 number listed first:
  - Smoke Alarms: R314 → **R310**
  - Automatic Fire Sprinkler Systems: R313 → **R309**
  - Protection of Wood Against Decay: R317 → **R304**
  - Minimum Room Areas: R304 → **R312**
  - Ceiling Height: R305 → **R313**
  - Garages and Carports: R309 → **R317**
  — [ICC 2024 IRC Significant Changes (Sessions 1 & 31)](https://www.iccsafe.org/wp-content/uploads/Session-1-and-31-2024-IRC-Significant-Changes.pdf); [Montana DLI, Update 2021 to 2024 IRC](https://bsd.dli.mt.gov/_docs/Training/IRC-Update-2021-2024.pdf)
- Means of Egress: R311 → **R318**. Emergency Escape and Rescue Openings: R310 → **R319**. Guards and Window Fall Protection: R312 → **R321**. One secondary source says handrails moved to **R320**. — [ICC 2024 IRC Chapter 3 (v2.1)](https://codes.iccsafe.org/content/IRC2024V2.1/chapter-3-building-planning); [CAAK, Notable IRC Changes 2018 to 2024](https://caak.org/wp-content/uploads/2025/10/IRC-Update-2015-to-2024_9-2025.pdf); [Open Exam Prep B1 guide](https://open-exam-prep.com/blog/icc-residential-building-inspector-b1-exam-guide-2026)
- An exam-prep guide maps Glazing R308 → **R324** (R308.4 → R324.4) and Light, Ventilation and Heating R303 → **R325**. The ICC relocation table I found did not confirm either move. — [Open Exam Prep B1 guide](https://open-exam-prep.com/blog/icc-residential-building-inspector-b1-exam-guide-2026)
- R302.1 Exterior Walls keeps its number in the 2024 IRC. — [ICC 2024 IRC R302.1](https://codes.iccsafe.org/s/IRC2024P1/chapter-3-building-planning/IRC2024P1-Pt03-Ch03-SecR302.1)
- Evidence of local amendment:
  - Van Meter, Iowa amends Table R302.1. — [Van Meter IA Code 156.21](https://codelibrary.amlegal.com/codes/vanmeteria/latest/vanmeter_ia/0-0-0-3308)
  - Washington's SBCC runs an IRC Technical Advisory Group review of the 2024 changes. — [WA SBCC IRC TAG report](https://sbcc.wa.gov/sites/default/files/2026-05/IRC%20TAG%20Significant%20Changes%20Report_Edited080212025.pdf)
  - South Carolina publishes a modification index for its 2024 codes. — [SC LLR 2024 Modification Index](https://www.llr.sc.gov/bcc/PDFfiles/2024%20Final%20Modification%20Index%20with%20Hyperlinks.pdf)
  - NAHB publishes suggested amendments to the 2024 I-Codes for jurisdictions to adopt. — [NAHB 2024 I-Codes Suggested Amendments](https://www.nahb.org/-/media/NAHB/advocacy/docs/top-priorities/codes/code-adoption/suggested-amendments-2024-i-codes.pdf?rev=1140958b62124a50b3463354ce7aea96&hash=DE1FCE6EDC5C2F85F75D0147D873DF8F)

### Inferences
- Each checklist item should carry **both** section numbers, for example "Means of egress: R311 (2021) / R318 (2024)", plus the section title. Many jurisdictions are still on 2018 or 2021, and 2024 numbers reuse old numbers for different topics.
- Treat any section number as "verify against the adopted edition". Numbers below are 2021 unless marked.

### Gaps
- No complete 2021→2024 crosswalk for Chapter 3 was retrieved. Unconfirmed 2024 numbers: CO alarms (likely R311), toilet/bath/shower spaces, light and ventilation, glazing, townhouse sprinkler subsections, and whether R302.2, R302.3 and R302.5–R302.6 keep their numbers. Fix: fetch the 2024 IRC TOC ([ICC TOC PDF](https://shop.iccsafe.org/media/wysiwyg/material/3100S24-TOC.pdf)) once the network allows it.
- No national dataset of IRC adoption editions or amendment frequency was retrieved. **[UNVERIFIED, M]** Commonly amended items:
  - R313.2: one- and two-family sprinkler mandate. Removed in most states; few states require it statewide.
  - R302.5.1: garage door self-closing requirement.
  - IECC/N11 energy provisions.
  - Fire separation distance tables.
  - Stair geometry in a few states, for example older NY and MA practice.

---

## 1. Habitable rooms: minimum area/dimension (R304), ceiling height (R305), light and ventilation (R303)

### Takeaway
Habitable rooms need **≥70 sq ft and ≥7 ft in any horizontal dimension**, with kitchens exempt. Ceilings must be **≥7 ft** in habitable space and hallways, and **≥6 ft 8 in** in bathrooms, toilet rooms, laundry rooms and non-habitable basement areas. Beams and ducts may drop to **6 ft 4 in**. Under sloped ceilings, the required area needs ≥5 ft headroom with half of it at ≥7 ft. In 2024, R304 becomes R312 and R305 becomes R313.

### Cited Findings
- 2021 IRC R304: habitable rooms ≥ **70 sq ft** floor area (kitchens excepted) and ≥ **7 ft in any horizontal dimension**. — [ICC 2021 IRC Ch. 3](https://codes.iccsafe.org/content/IRC2021P2/chapter-3-building-planning); [Fine Homebuilding, Minimum Dimensions in the IRC](https://www.finehomebuilding.com/2024/01/10/minimum-dimensions-in-the-irc); [jaspector, IRC 2024 Habitable Room Size](https://www.jaspector.com/codes/irc-2024/ch03-building-planning/habitable-room-size-irc-2024/)
- Sloped-ceiling areas under **5 ft** do not count toward minimum room area. The search tool cited the 2012 edition, R304.4. — [Boise R305 handout](https://www.cityofboise.org/media/3924/434-irc-code-section-r305-ceiling-height.pdf); [ICC 2021 IRC Ch. 3](https://codes.iccsafe.org/content/IRC2021P2/chapter-3-building-planning)
- R305.1: habitable space, hallways, and portions of basements containing them need a ceiling height ≥ **7 ft**. — [Boise R305 handout](https://www.cityofboise.org/media/3924/434-irc-code-section-r305-ceiling-height.pdf); [jaspector, IRC 2024 Ceiling Height](https://www.jaspector.com/codes/irc-2024/ch03-building-planning/ceiling-height-requirements-irc-2024/)
- Bathrooms, toilet rooms and laundry rooms: ceiling ≥ **6 ft 8 in**. — [Boise R305 handout](https://www.cityofboise.org/media/3924/434-irc-code-section-r305-ceiling-height.pdf)
- Sloped ceilings (2021 text): the required floor area must have ceiling height ≥ **5 ft**, and ≥ **50%** of the required floor area must be ≥ **7 ft**. — [Boise R305 handout](https://www.cityofboise.org/media/3924/434-irc-code-section-r305-ceiling-height.pdf)
- R305.1.1, basements: portions without habitable space or hallways need ≥ **6 ft 8 in**. At beams, girders, ducts or other obstructions, height may be ≥ **6 ft 4 in** from the finished floor. — [GreenLancer, Basement Ceiling Height](https://www.greenlancer.com/post/irc-r305-1-basement-ceiling-height-code); [Boise R305 handout](https://www.cityofboise.org/media/3924/434-irc-code-section-r305-ceiling-height.pdf)
- Sources describe the 6 ft 4 in beam allowance in different ways, so it should be checked against the adopted text. — [Building Code Forum, R305 breakdown](https://www.thebuildingcodeforum.com/forum/threads/ceiling-height-requirements-in-residential-construction-a-breakdown-of-section-r305.36865/)
- 2024: minimum room areas renumbered to R312 and ceiling height to R313. — [ICC 2024 IRC Significant Changes](https://www.iccsafe.org/wp-content/uploads/Session-1-and-31-2024-IRC-Significant-Changes.pdf)

### Inferences
- Modeling rule: test every habitable room for area ≥70 sq ft and minimum clear dimension ≥7 ft. Kitchens are exempt.
  - For attic or knee-wall rooms, compute area only where height ≥5 ft.
  - Then check that ≥50% of the *required* 70 sq ft has ≥7 ft headroom.
- Default ceiling targets: 7'-0" minimum for habitable rooms and halls, 6'-8" for baths and laundry. Keep beam and duct soffits at or above 6'-4" in finished basements.

### Gaps
- R303 light and ventilation was not covered by any successful search. **[UNVERIFIED, H]** 2021 R303:
  - R303.1, habitable rooms:
    - Glazing ≥ **8%** of floor area.
    - Openable natural-ventilation area ≥ **4%** of floor area.
    - Glazing may be omitted where mechanical ventilation per M1505 is provided *and* artificial light gives an average **6 footcandles** at 30 in above the floor.
    - Natural ventilation may be omitted where whole-house mechanical ventilation per M1505 is provided.
  - R303.2, adjoining rooms: a room counts as part of an adjoining room where ≥½ of the common wall is open and the opening is ≥ **1/10** of the interior room's floor area and ≥ **25 sq ft**.
  - R303.3, bathrooms: glazing ≥ **3 sq ft**, half of it openable. Exception: mechanical exhaust to outdoors, **50 cfm** intermittent or **20 cfm** continuous per M1505.
  - R303.4: dwellings tested below **5 ACH50** need whole-house mechanical ventilation per M1505.4.
  - R303.5: outdoor air intakes ≥ **10 ft** from contaminant sources.
  - Required glazing must open onto a street, alley, yard or court on the same lot.
  - Stair illumination ≥ **1 footcandle** at treads and landings, with a switch at each floor level where the stair has ≥ **6 risers**.
  - R303.10, heating: able to hold **68 °F** at 3 ft above the floor and 2 ft from exterior walls where the winter design temperature is <60 °F.
- **[UNVERIFIED, H]** R305.1 exception: tub/shower with a showerhead needs ceiling ≥ **6 ft 8 in** over a **30 × 30 in** area at the showerhead.
- **[UNVERIFIED, M]** The former "at least one room ≥120 sq ft" rule was deleted in the 2015 IRC, and the 2021 and 2024 editions carry only the 70 sq ft / 7 ft rule.
- Not determined: whether the 2024 IRC changed any values in R303–R305, beyond renumbering.

---

## 2. Emergency escape and rescue openings (2021 R310 / 2024 R319)

### Takeaway
EEROs need net clear opening **≥5.7 sq ft**, or **5.0 sq ft** at grade floor. They also need net clear **height ≥24 in**, **width ≥20 in**, and sill **≤44 in** above the finished floor. Openings with sills below grade need window wells. The minimum height and width together do not reach the minimum area: a 20 in wide opening needs about 42 in of clear height.

### Cited Findings
- Net clear opening ≥ **5.7 sq ft (0.530 m²)**. Exception: grade-floor openings ≥ **5 sq ft (0.465 m²)**. — [UpCodes R310.1](https://up.codes/s/emergency-escape-and-rescue-required); [Jersey County IL R310 handout](https://jerseycounty-il.gov/wp-content/uploads/2022/10/Emergency_Escape___Rescue_Openings_pg_1.pdf)
- Minimum net clear opening height **24 in (610 mm)**. Minimum net clear width **20 in (508 mm)**. — [Delta Twp MI R310 handout](https://cms9files.revize.com/deltatwpmi/Document_Center/Department/Building/Residential%20Building%20Information%20&%20Safety/Escape-Openings.pdf); [We Know Codes, Egress and Emergency Escape](https://www.weknowcodes.com/wp-content/uploads/2021/07/Egress-and-Emergency-Escape-in-Residential-Dwellings.pdf)
- Sill height ≤ **44 in (1118 mm)**, measured from the finished floor to the bottom of the clear opening. — [Jersey County IL R310 handout](https://jerseycounty-il.gov/wp-content/uploads/2022/10/Emergency_Escape___Rescue_Openings_pg_1.pdf)
- Minimum width and minimum height together will not give the minimum area. A 20 in wide window must be **42 in** high to reach 5.7 sq ft. — [Washington Terrace UT, Window Egress Requirements](https://washingtonterrace.gov/vertical/sites/%7B9D63E994-3168-4A6B-BFBB-6BA2F03103EB%7D/uploads/WINDOW_EGRESS_REQUIREMENTS(1).pdf)
- EEROs with a finished sill height below the adjacent ground elevation require a window well. — [Delta Twp MI R310 handout](https://cms9files.revize.com/deltatwpmi/Document_Center/Department/Building/Residential%20Building%20Information%20&%20Safety/Escape-Openings.pdf)
- 2024 values are the same: 5.7 sq ft, 24 in, 20 in, 44 in. One 2024 guide places them at "R310.2.1–R310.2.4". That conflicts with the ICC renumbering of EERO to **R319**, so its section labels look unreliable. — [EgressUSA, IRC 2024 Egress Window Requirements](https://egressusa.com/irc-2024-egress-window-requirements/); [jaspector, IRC 2024 Egress Window](https://www.jaspector.com/codes/irc-2024/ch03-building-planning/egress-window-requirements-irc-2024/); [CAAK 2018 to 2024 changes](https://caak.org/wp-content/uploads/2025/10/IRC-Update-2015-to-2024_9-2025.pdf)
- Older (2012-era) handouts use R310.1.1–R310.1.3 for these items. Sub-numbering differs by edition. — [Craig County handout (2009 IRC)](https://cms3.revize.com/revize/craigco/Egress%20Emergency%20Escape%20Window.pdf?t=201911211733540&t=201911211733540)

### Inferences
- Window-schedule check: clear opening (W × H) ≥ 820.8 sq in (5.7 sq ft) above grade, or 720 sq in (5.0 sq ft) at grade floor. Then check H ≥ 24, W ≥ 20 and sill ≤ 44 in AFF.
  - Casements usually meet the area at smaller rough openings than single-hung or sliders.
  - Use manufacturer "net clear opening" data, not rough-opening size.
- The 2021 and 2024 numbers are unchanged. Only the section numbers moved.

### Gaps
- **[UNVERIFIED, H]** Where required (2021 R310.1):
  - Every sleeping room, each basement and each habitable attic needs ≥1 operable EERO.
  - Where a basement has sleeping rooms, each sleeping room needs one.
  - EEROs must open directly to a public way, or to a yard or court ≥36 in wide that opens to a public way.
  - Exceptions: storm shelters, and basements used only for mechanical equipment ≤200 sq ft.
  - **[UNVERIFIED, M]** Sprinklered dwellings (NFPA 13D/P2904): basement sleeping rooms can be exempt when the basement has either 2 means of egress, or 1 means of egress plus 1 EERO.
- **[UNVERIFIED, H]** Window wells (2021 R310.4 area wells):
  - Horizontal area ≥ **9 sq ft**, with horizontal projection and width ≥ **36 in**. The window must be able to open fully.
  - Wells deeper than **44 in** need a permanently affixed ladder or steps, which may encroach ≤ **6 in** into the required dimensions.
  - Ladder rungs: inside width ≥ **12 in**, projection ≥ **3 in** from the wall, spacing ≤ **18 in** on center vertically.
- **[UNVERIFIED, H]** Operation and coverings:
  - EEROs must open from inside without keys, tools or special knowledge.
  - Bars, grilles and covers must be releasable the same way, with no more force than normal operation.
  - Window opening control devices must comply with ASTM F2090.
  - EEROs under decks or porches need a clear path ≥ **36 in** high to a yard or court.
- **[UNVERIFIED, M]** 2021 added explicit EERO-door provisions. Exact 2024 subsections under R319 are not verified.

---

## 3. Means of egress: doors, hallways, landings, stairs, winders, spiral, handrails, ramps (2021 R311 / 2024 R318)

### Takeaway
Stairs: **36 in** minimum width, **7-3/4 in** maximum riser, **10 in** minimum tread, **3/4–1-1/4 in** nosing and **6 ft 8 in** headroom. Winders need **10 in** at the walkline (12 in from the narrow side) and **6 in** at any point. Handrails sit **34–38 in** above the nosings and need a graspable profile. These values are consistent across 2018 and 2021, and the 2024 numbers appear unchanged. One site claiming an 8-1/4 in riser and 9 in tread in 2024 looks wrong.

### Cited Findings
- Stair width ≥ **36 in**. Handrails may project ≤ **4.5 in** into it. Where handrails project, clear width between them ≥ **31-1/2 in**. — [buildingcode.blog, Stairway Code Requirements](https://www.buildingcode.blog/blog/stairwaycoderequirements); [Timnath CO, 2018 Residential Stair Guide](https://timnath.org/wp-content/uploads/2022/03/2018-RESIDENTIAL-STAIR-GUIDE.pdf)
- Riser ≤ **7-3/4 in**. Tread ≥ **10 in**. Nosing ≥ **3/4 in** and ≤ **1-1/4 in** (R311.7.5.3). — [stair-calculator.com, IRC R311.7](https://www.stair-calculator.com/guides/stair-building-code-guide.html); [trademastercalc, IRC Stair Code](https://trademastercalc.com/reference/irc-stair-code); [jaspector, IRC 2021 stair details](https://www.jaspector.com/codes/irc-2021/ch03-building-planning/stairway-tread-riser-handrail-details/)
- Headroom **6 ft 8 in**, clear over every nosing including beams and ducts. One 2018 guide states 6 ft 6 in, which conflicts. — [trademastercalc](https://trademastercalc.com/reference/irc-stair-code); conflicting: [Timnath 2018 guide](https://timnath.org/wp-content/uploads/2022/03/2018-RESIDENTIAL-STAIR-GUIDE.pdf)
- Winders: ≥ **6 in** depth at any point, and ≥ **10 in** at 12 in from the narrow edge. — [buildingcode.blog](https://www.buildingcode.blog/blog/stairwaycoderequirements)
- Spiral stairs (R311.7.10.1):
  - ≥ **26 in** clear width below the handrail.
  - All treads identical. Riser ≤ **9-1/2 in**. Headroom **78 in (6 ft 6 in)**.
  - One source gives tread ≥ **7-1/2 in** at 12 in from the narrow edge and a walkline radius ≤ 24-1/2 in.
  — [trademastercalc](https://trademastercalc.com/reference/irc-stair-code)
- One site says 2024 IRC R311.7 has a **maximum 8.25 in riser and minimum 9 in tread**, which differs from the 2018/2021 values of 7-3/4 and 10. — [jaspector, IRC 2024 Stairway Requirements](https://www.jaspector.com/codes/irc-2024/ch03-building-planning/stairway-requirements-irc-2024/). *Treated as suspect:* it cites R311.7 for 2024, but egress was renumbered to R318 in 2024 ([CAAK](https://caak.org/wp-content/uploads/2025/10/IRC-Update-2015-to-2024_9-2025.pdf)).
- Handrail height **34–38 in**, measured vertically from the sloped plane along the tread nosings (R311.7.8.1). One source quotes an older 30–34 in text. — [Routt County CO, IRC Code & Commentary excerpt](https://co.routt.co.us/DocumentCenter/View/15202/Handrail-Stairway-Residential-Codes-IRC?bidId=); [NY DOS TB-1005](https://dos.ny.gov/system/files/documents/2019/10/tb-1005-rcnys-residential-exit-doors-stairs-and.pdf)
- Graspability:
  - Type I circular handrail: **1-1/4 to 2 in** outside diameter.
  - Non-circular: perimeter **4 to 6-1/4 in**, with **2-1/4 in** maximum cross-section dimension.
  - Sources disagree on the subsection number; one cites R311.7.8.3.
  — [redxapps, Deck Stairs Code IRC 2021](https://www.redxapps.com/guides/deck-stairs-code); [tallyard IRC quick reference](https://www.tallyard.com/guides/residential-code-limits-reference)
- Local amendments can be stricter. — [stair-calculator.com](https://www.stair-calculator.com/guides/stair-building-code-guide.html)
- 2024: Means of Egress is **R318**, and handrails reportedly **R320**. — [CAAK](https://caak.org/wp-content/uploads/2025/10/IRC-Update-2015-to-2024_9-2025.pdf); [ICC 2024 IRC Ch. 3](https://codes.iccsafe.org/content/IRC2024V2.1/chapter-3-building-planning)

### Inferences
- The "6 ft 6 in" headroom in the Timnath excerpt is very likely the *spiral-stair* headroom, which equals 78 in. It is not general stair headroom.
- Stair solver defaults for modeling:
  - Riser count = ceil(floor-to-floor / 7.75).
  - Tread ≥10 in plus nosing 3/4–1-1/4 in, or no nosing if tread ≥11 in (see Gaps).
  - Rise and run uniform within 3/8 in.
  - 36 in clear above the handrail.
  - 6'-8" headroom checked along the nosing line.
  - 36 in deep landings at the top and bottom.
- The 2024 riser and tread values should be treated as 7-3/4 / 10 until the ICC text is checked. The 8-1/4 / 9 figures match legacy CABO and New York practice, not the IRC.

### Gaps
- **[UNVERIFIED, H]** Doors and hallways (2021):
  - R311.1: ≥1 egress door per dwelling. The path to it must not pass through a garage.
  - R311.2: the egress door is side-hinged, with clear width ≥ **32 in** (face of door to stop, door open 90°) and clear height ≥ **78 in** (top of threshold to bottom of stop).
  - R311.6: hallway width ≥ **3 ft**.
- **[UNVERIFIED, H]** Landings at doors (R311.3):
  - A landing or floor on each side of each exterior door, at least as wide as the door and ≥ **36 in** in the direction of travel. Slope ≤ **2%** (1/4:12).
  - Required egress door: landing ≤ **1-1/2 in** below the top of the threshold, or ≤ **7-3/4 in** if the door does not swing over the landing.
  - Other exterior doors: ≤ **7-3/4 in**. A landing is not required where an exterior stair of ≤2 risers serves the door and the door does not swing over it.
- **[UNVERIFIED, H]** Stair details (R311.7):
  - Clear width at and below the handrail: ≥ **27 in** with handrails on both sides.
  - Headroom exception: a floor opening may project ≤ **4-3/4 in** into required headroom.
  - Maximum vertical rise between floors or landings: **151 in** (since 2018).
  - Riser and tread tolerance within a flight ≤ **3/8 in**.
  - Open risers: no **4 in** sphere where the stair is >30 in above the floor below.
  - Nosing: leading-edge radius ≤ **9/16 in**. Nosing is not required when tread ≥ **11 in**.
  - Landings: ≥ **36 in** deep and as wide as the stair. A top landing may be omitted at an interior stair where no door swings over the stair.
  - Walking-surface slope ≤ **1:48**.
  - Handrails required on ≥1 side of each flight with **≥4 risers**, continuous from above the top riser to above the bottom riser, with ends returned or terminated in newels.
  - Handrail clearance to wall ≥ **1-1/2 in**.
- **[UNVERIFIED, M]** Spiral stair tread depth: 2015+ text reads ≥ **6-3/4 in at the walkline**. The pre-2015 text read 7-1/2 in at 12 in from the narrow edge. The cited "7-1/2 in" may be outdated.
- **[UNVERIFIED, M]** Type II handrails: perimeter >6-1/4 in, with a finger recess on both sides that starts within 3/4 in of the top and reaches ≥5/16 in deep within 7/8 in below the widest point.
- **[UNVERIFIED, M]** Alternating-tread devices and ship's ladders (R311.7.11/.12) cannot be used as required egress. Ship's ladders: tread ≥5 in, projected tread ≥8-1/2 in, riser ≤9-1/2 in, clear width ≥20 in, handrails both sides.
- **[UNVERIFIED, H]** Ramps (R311.8):
  - Slope ≤ **1:12 (8.33%)** where serving the required egress door. Other ramps ≤ **1:8 (12.5%)**.
  - Landings ≥ **36 in** at the top, bottom, door locations and changes of direction.
  - Handrails on ≥1 side where slope exceeds 1:12. Height 34–38 in.

---

## 4. Guards and window fall protection (2021 R312 / 2024 R321)

### Takeaway
Guards are required where a walking surface is **>30 in** above the floor or grade below. They must be **≥36 in** high, or **≥34 in** on the open sides of stairs measured from the nosing line. Openings must stop a **4 in sphere**, or a **4-3/8 in sphere** on stair open sides, and the stair triangle must stop a **6 in sphere**. The IRC window-sill fall-protection trigger is **24 in**, not 36 in; 36 in is the IBC value (see Gaps).

### Cited Findings
- Guards are required on open sides of stairs, landings, balconies and floors more than **30 in** above the surface below. Minimum guard height **36 in**. — [southernstaircase, Stair Railing Height and Code](https://southernstaircase.com/stair-railing-height-and-code-requirements/); [primehomeandgarden, Stair Railing Height Code](https://primehomeandgarden.com/stair-railing-height/)
- On stairs, where the guard doubles as the handrail, the top is ≥ **34 in** and ≤ **38 in**. — [Routt County CO excerpt](https://co.routt.co.us/DocumentCenter/View/15202/Handrail-Stairway-Residential-Codes-IRC?bidId=)
- Openings must not pass a **4 in sphere**. Open sides of stairs: **4-3/8 in sphere**. The triangle formed by tread, riser and bottom rail: **6 in sphere**. — [redxapps, Deck Stairs Code](https://www.redxapps.com/guides/deck-stairs-code); [Wikipedia, Cable railing](https://en.wikipedia.org/wiki/Cable_railing); [senmit, Cable railing code](https://senmit.com/blogs/deck-design-guide/cable-railing-code-requirements-diy-guide)
- 2024 section title is **R321 "Guards and Window Fall Protection"** (formerly R312). — [ICC 2024 IRC Ch. 3](https://codes.iccsafe.org/content/IRC2024V2.1/chapter-3-building-planning); [CAAK](https://caak.org/wp-content/uploads/2025/10/IRC-Update-2015-to-2024_9-2025.pdf)

### Inferences
- Use a deck/balcony/loft rule: if the finished surface is >30 in above the surface below at any point within 36 in horizontally of the edge (see Gaps), model a 36 in guard with ≤4 in openings. On stair open sides, model 34 in measured above the nosing line with ≤4-3/8 in openings.

### Gaps
- **[UNVERIFIED, H]** R312.1.1: the 30 in drop is measured "at any point within **36 in** horizontally" of the open edge, and insect screening does not count as a guard.
- **[UNVERIFIED, H]** Window fall protection, IRC 2021 R312.2.1:
  - Trigger: an operable window whose sill top is **<24 in** above the finished floor *and* **>72 in** above finished grade or the surface below outside.
  - Such a window must do one of three things:
    - Not pass a **4 in sphere** when fully open.
    - Have fall-prevention devices complying with **ASTM F2090**.
    - Have window opening control devices complying with R312.2.2, which must still allow the EERO net clear opening.
  - **[UNVERIFIED, H]** The **36 in** sill value in the research question is the **IBC** threshold (IBC 1015.8 for R-2/R-3), not the IRC. Checklists for IRC dwellings should use 24 in unless the AHJ amends it.
- Not determined: any 2024 change to guard heights or opening limits.

---

## 5. Fire safety: exterior walls vs. fire separation distance (R302.1), townhouse/two-family separation, garage separation (R302.5/R302.6), sprinklers (R313→R309), smoke alarms (R314→R310), CO alarms (R315)

### Takeaway
Close to property lines:
- Exterior walls with fire separation distance (FSD) **<5 ft** must be **1-hour rated, exposed from both sides**.
- **No openings at <3 ft**, **25% of wall area at 3 to <5 ft**, unlimited at ≥5 ft.
- **No projections at <2 ft**. Projections at 2 to <5 ft are rated on the underside.
- A separate, more lenient table applies to sprinklered dwellings. Some jurisdictions amend these thresholds.

Garages:
- Garage side of the dwelling separation: **½ in gypsum**.
- Garage ceiling under habitable rooms: **5/8 in Type X**.
- Door to the house: 1-3/8 in solid wood or steel, or 20-minute rated.
- No garage door may open directly into a sleeping room.

### Cited Findings
- Exterior walls of dwellings, townhouses and accessory buildings must follow **Table R302.1(1)** by FSD, or **Table R302.1(2)** where the dwelling is fully sprinklered. Confirmed in 2024 text. — [ICC 2024 IRC R302.1](https://codes.iccsafe.org/s/IRC2024P1/chapter-3-building-planning/IRC2024P1-Pt03-Ch03-SecR302.1)
- 2024 Table R302.1(1) walls: **1-hour rated** below 5 ft, **not rated (0 hr) at ≥5 ft**. The projection row was truncated in the retrieved excerpt. — [ICC 2024 IRC R302.1](https://codes.iccsafe.org/s/IRC2024P1/chapter-3-building-planning/IRC2024P1-Pt03-Ch03-SecR302.1)
- Openings: **not allowed <3 ft**, **25% maximum of wall area at 3 ft**, **unlimited at 5 ft**. Projections: **not allowed <2 ft**. — [UpCodes, Exterior Wall Location (R302)](https://up.codes/s/exterior-wall-location); [NY 2020 RCNYS R302.1](https://codes.iccsafe.org/s/NYSRC2020P1/chapter-3-building-planning/NYSRC2020P1-Pt03-Ch03-SecR302.1); [CA 2022 CRC R302.1](https://codes.iccsafe.org/s/CARC2022P2/part-iii-building-planning-and-construction/CARC2022P2-Pt03-Ch03-SecR302.1)
- **Amendment example:** Van Meter, Iowa amended Table R302.1 to require 1-hour walls (exposure from both sides) only at **<3 ft**, with 1-hour underside protection on projections at 2 ft. This is an older, more lenient wall threshold than the model code's <5 ft. — [Van Meter IA 156.21](https://codelibrary.amlegal.com/codes/vanmeteria/latest/vanmeter_ia/0-0-0-3308)
- One explainer claims the 2021 IRC reorganized the R302.1 table without changing thresholds, describing "<3 ft = 1-hr, no openings." That conflicts with the 2024 ICC text (1-hr below 5 ft). — [jaspector, IRC 2018 FSD](https://www.jaspector.com/codes/irc-2018/ch03-building-planning/fire-separation-distance-property-line-irc-2018/) vs. [ICC 2024 R302.1](https://codes.iccsafe.org/s/IRC2024P1/chapter-3-building-planning/IRC2024P1-Pt03-Ch03-SecR302.1)
- Garage separation, Table R302.6:
  - **½ in gypsum board** on the garage side, separating the garage from the residence and its attics.
  - **5/8 in Type X gypsum** where habitable rooms are above the garage.
  - Structure supporting that floor/ceiling: **½ in gypsum**.
  — [Boise #435 Dwelling/Garage Separation](https://www.cityofboise.org/media/3925/435-dwelling-garage-separation_final-feb-2022.pdf); [ICC eNews R302.6 commentary](https://media.iccsafe.org/news/eNews/2010v7n10/IRC302.6.pdf); [UpCodes R302.6](https://up.codes/s/dwelling-garage-fire-separation-required)
- An ICC Q&A says the garage separation is **not a fire-resistance-rated assembly**. — [ICC eNews R302.6](https://media.iccsafe.org/news/eNews/2010v7n10/IRC302.6.pdf)
- R302.5.1:
  - Openings from a private garage directly into a sleeping room are **not permitted**.
  - Other openings need solid wood doors ≥ **1-3/8 in**, solid or honeycomb-core steel doors ≥ **1-3/8 in**, or **20-minute fire-rated** doors.
  - The quoted text adds "equipped with a self-closing or automatic-closing device". Which edition that wording comes from was not established.
  — [Seamless Home, Drywall Requirements Between Garage and House](https://www.seamlesshome.com/blog/drywall-requirements-between-a-garage-and-the-house); [mybuildingpermit.com Tip Sheet 6](https://mybuildingpermit.com/sites/default/files/inline-files/TS_06_Residential_Garage_Separation_Final.pdf)
- Local summary (Frisco, TX): 5/8 in Type X on the garage side where the garage separates from living space or is within 3 ft of the dwelling. This is a local amendment or summary, not model text. — [Frisco TX significant changes](https://friscotexas.gov/DocumentCenter/View/28796/Significant-Changes-to-the-IBC_IRC_WLA-12-27-22)
- Townhouses: a Frisco summary describes a townhouse definition change to "three to eight attached townhouse units". NAHB notes removal of the requirement that area separation walls between attached units comply with Chapter 3. Neither claim was confirmed in ICC text. — [Frisco TX](https://friscotexas.gov/DocumentCenter/View/28796/Significant-Changes-to-the-IBC_IRC_WLA-12-27-22); [NAHB 2024 changes](https://www.nahb.org/-/media/NAHB/advocacy/docs/top-priorities/codes/code-adoption/signficant-code-changes-2024-irc.pdf?rev=a90577b5da8d4931b8beb20f21105df2&hash=D95B3F0AC6ADA32006389A67428A19A5)
- Smoke alarms (2024 R310):
  - Must follow NFPA 72 and the manufacturer's installation instructions. The 2024 change adds the manufacturer-instructions requirement and clarifies locations.
  - Broomfield's handout says 2024 R310 changed required smoke-alarm locations to align with an IBC change concerning garages.
  — [ICC 2024 IRC Significant Changes](https://www.iccsafe.org/wp-content/uploads/Session-1-and-31-2024-IRC-Significant-Changes.pdf); [ICC 2024 IRC Ch. 3](https://codes.iccsafe.org/content/IRC2024P1/chapter-3-building-planning); [Broomfield 2024 handout](https://www.broomfield.org/DocumentCenter/View/48805/2024-CODE-SIGNIFICANT-CHANGE-HANDOUT)
- CO alarms are required where the dwelling has an attached garage with an opening into the dwelling. — [ICC 2024 IRC Ch. 3](https://codes.iccsafe.org/content/IRC2024P1/chapter-3-building-planning)
- Unconfirmed claim: one site says 2024 requires **10-year sealed-battery** alarms and recognizes wireless interconnection. — [jaspector, IRC 2024 Smoke Alarms](https://www.jaspector.com/codes/irc-2024/ch03-building-planning/smoke-alarm-requirements-irc-2024/)
- Sprinklers: 2021 R313 becomes 2024 **R309**. — [ICC 2024 IRC Significant Changes](https://www.iccsafe.org/wp-content/uploads/Session-1-and-31-2024-IRC-Significant-Changes.pdf)

### Inferences
- Site-plan rule. FSD is measured to the lot line, to the centerline of a street, or to an imaginary line between buildings on the same lot (see Gaps).
  - Flag any exterior wall with FSD <5 ft for a 1-hour, both-sides rating.
  - Allow no openings or vents in walls at FSD <3 ft.
  - At 3 to 5 ft, cap openings at 25% of the wall area.
  - Allow no eave or projection at FSD <2 ft.
  - Then confirm the local table, because amendments to these thresholds exist.
- Garage rule:
  - ½ in gypsum on all garage-side walls and ceilings adjacent to the house or its attic.
  - 5/8 in Type X on the garage ceiling under habitable rooms.
  - No garage door into a bedroom.
  - The house-to-garage door is a 1-3/8 in solid-core or 20-minute door. Assume a self-closer unless the AHJ says otherwise.

### Gaps
- **[UNVERIFIED, H]** Full 2021 **Table R302.1(1)**, no sprinklers:

  | Element | <2 ft | 2 to <3 ft | 3 to <5 ft | ≥5 ft |
  |---|---|---|---|---|
  | Walls | 1-hr, exposure both sides | 1-hr | 1-hr | 0-hr |
  | Projections | Not allowed | 1-hr underside, heavy timber, or FRT wood | same as 2 to <3 ft | 0-hr |
  | Openings | Not allowed | Not allowed | 25% maximum | Unlimited |
  | Penetrations | Comply with R302.4 | Comply with R302.4 | None required | None required |

  - Footnotes (M): eave underside may be 0-hr where fireblocking runs from the top plate to the roof sheathing; rake underside may be 0-hr where there are no gable vents.
- **[UNVERIFIED, M]** **Table R302.1(2)**, sprinklered:

  | Element | 0 to <2 ft | 2 to <3 ft | ≥3 ft |
  |---|---|---|---|
  | Walls | 1-hr, exposure from outside | 1-hr | 0-hr |
  | Projections | Not allowed | 1-hr underside | 0-hr |
  | Openings | Not allowed | Not allowed | Unlimited |
  | Penetrations | Comply with R302.4 | Comply with R302.4 | None required |

  - A footnote allows 0 ft FSD in sprinklered subdivisions where the adjoining lot provides a ≥6 ft open setback.
- **[UNVERIFIED, H]** R302.1 exceptions: walls perpendicular to the FSD line; walls of dwellings and accessory structures on the same lot; permit-exempt sheds and playhouses; detached garages within 2 ft of the lot line may have eaves ≤4 in; code-compliant foundation vents.
- **[UNVERIFIED, H]** Townhouses (R302.2, 2021):
  - Separation is either **two 1-hour walls** (R302.2.1), or a **common wall** (R302.2.2) rated **1-hour if sprinklered** per R313 or **2-hour if not**, rated for exposure from both sides.
  - Continuous from the foundation to the underside of the roof sheathing, and along the full length including attached accessory structures.
  - **Parapets ≥30 in** above the roof (R302.2.4). Exception: roof covering ≥Class C plus noncombustible or FRT sheathing, *or* 5/8 in Type X under the deck, for **4 ft** each side of the wall.
  - Each unit structurally independent.
- **[UNVERIFIED, H]** Two-family dwellings (R302.3):
  - **1-hour** wall and floor separation (ASTM E119/UL 263), continuous to the exterior wall and from the foundation to the roof sheathing.
  - Exception 1: ½-hour where sprinklered per NFPA 13.
  - Exception 2: the wall may stop at the ceiling if the ceiling is 5/8 in Type X, an attic draftstop sits above the wall, and the supporting framing has ½ in gypsum.
  - Supporting construction must have an equal rating.
- **[UNVERIFIED, H]** Table R302.6 also requires **½ in gypsum on the interior side of exterior walls** of a garage located **<3 ft from a dwelling** on the same lot.
- **[UNVERIFIED, H]** Related protections:
  - R302.5.2: ducts penetrating the garage separation must be ≥**No. 26 gage** steel with no openings into the garage.
  - R302.7: enclosed accessible space under stairs needs **½ in gypsum** on the enclosed side.
  - R302.13: floors over basements need a ½ in gypsum membrane or equivalent on the underside of floor framing. Exceptions include floors over crawl spaces, ≥2×10 dimensional lumber, and sprinklered areas. This matters for I-joist basements.
- **[UNVERIFIED, H]** Sprinklers (2021 R313):
  - R313.1: townhouses shall have automatic residential sprinklers (P2904 or NFPA 13D). Exception: additions/alterations to existing unsprinklered townhouses.
  - R313.2: one- and two-family dwellings, same rule and same exception.
  - **[UNVERIFIED, M]** R313.2 is deleted or overridden by statute in most states, with only a few (e.g., CA, MD) mandating it statewide. The townhouse mandate R313.1 is also amended in some states.
- **[UNVERIFIED, H]** Smoke alarms (2021 R314.3):
  - Locations: in each sleeping room; outside each separate sleeping area in the immediate vicinity of bedrooms; on each additional story including basements and habitable attics (not crawl spaces or uninhabitable attics).
  - Split levels: an alarm on the upper level serves an adjacent lower level less than one full story below, if there is no intervening door.
  - Keep ≥**3 ft** horizontally from the door of a bathroom with a tub or shower.
  - R314.3.1, distance from permanently installed cooking appliances: ionization ≥**20 ft**; ionization with silence switch ≥**10 ft**; photoelectric ≥**6 ft**.
  - R314.4: interconnected, wireless permitted.
  - R314.6: hard-wired with battery backup.
  - R314.2.2: alterations needing a permit, or added sleeping rooms, trigger alarms per new-construction rules.
  - Listing: UL 217.
- **[UNVERIFIED, H]** CO alarms (2021 R315):
  - Required in new dwellings with a fuel-fired appliance *or* an attached garage with an opening into the dwelling.
  - Location: outside each separate sleeping area in the immediate vicinity of bedrooms. Also inside a bedroom whose own space or attached bath contains a fuel-burning appliance.
  - Listing: UL 2034, or UL 2034 + UL 217 for combination units.
  - Hard-wired with battery backup.
  - **[UNVERIFIED, M]** 2021 added interconnection for multiple CO alarms.
- Not verified: the exact 2024 smoke-alarm location changes (garages, R310) and the 2024 CO section number.
- **[UNVERIFIED, M]** Fireblocking (R302.11) and draftstopping (R302.12): attic/floor draftstopping in concealed spaces at ≤**1,000 sq ft**, and where floor/ceiling assemblies contain usable space both above and below.

---

## 6. Safety glazing in hazardous locations (2021 R308.4 / 2024 possibly R324.4)

### Takeaway
No search budget was left to verify R308.4. The baseline below is unverified model knowledge with high confidence in structure. The 2024 renumbering to R324 comes from one secondary source only.

### Cited Findings
- 2024 renumbering: Glazing R308 → **R324**, and hazardous locations R308.4 → **R324.4**. Secondary source only, not confirmed against ICC. — [Open Exam Prep B1 guide](https://open-exam-prep.com/blog/icc-residential-building-inspector-b1-exam-guide-2026)

### Inferences
- An AI modeler should flag glazing by location rules: doors, near doors, large low windows, wet areas, stairs, and bottom landings. Tag those panes "tempered/laminated (safety glazing)" in the window and door schedule.

### Gaps
- **[UNVERIFIED, H]** 2021 R308.4 hazardous locations (safety glazing required):
  1. **R308.4.1 Doors:** glazing in fixed and operable panels of swinging, sliding and bifold doors. Exceptions: openings that won't pass a 3 in sphere, and decorative glazing.
  2. **R308.4.2 Adjacent to doors:** glazing within a **24 in arc** of either vertical edge of a door in the closed position, with its bottom edge **<60 in** above the floor. Also glazing in a wall perpendicular to the door, within 24 in of the hinge side of an in-swinging door.
     - Exceptions: decorative glazing; an intervening wall or barrier; doors to closets or storage ≤3 ft deep; glazing on the latch side and perpendicular to the door; glazing adjacent to the fixed panel of patio doors.
  3. **R308.4.3 Windows:** an individual pane that meets *all four* conditions:
     - Exposed area > **9 sq ft**.
     - Bottom edge < **18 in** above the floor.
     - Top edge > **36 in** above the floor.
     - A walking surface within **36 in** horizontally.
     - Exceptions: decorative glazing; a protective horizontal rail at 34–38 in that can resist 50 plf and is ≥1-1/2 in tall; outboard panes ≥25 ft above grade.
  4. **R308.4.4 Guards and railings:** all glazing, regardless of size or height.
  5. **R308.4.5 Wet surfaces:** glazing in walls, enclosures or fences containing or facing tubs, showers, hot tubs, spas, whirlpools, saunas, steam rooms or pools, where the bottom edge is **<60 in** above a standing or walking surface. Exception: glazing **≥60 in** horizontally from the water's edge.
  6. **R308.4.6 Adjacent to stairs and ramps:** glazing within **36 in** horizontally of the walking surface with its bottom edge **<36 in** above it.
     - Exceptions: a rail at 34–38 in; a solid wall or panel; glazing ≥18 in from the walking surface.
  7. **R308.4.7 Bottom stair landing:** glazing **<36 in** above the landing and within a **60 in** horizontal arc (less than 180°) from the bottom tread nosing.
- **[UNVERIFIED, M]** R308.6 skylights and sloped glazing need laminated, tempered or other listed glazing, with screens under some types.
- Not determined: any 2024 substantive change to R308.4.

---

## 7. Toilet, bath and shower spaces (R307 + IRC Chapter 27 plumbing clearances)

### Takeaway
No source was retrieved for these values because the search budget was exhausted. The baseline below is unverified model knowledge with high confidence. The numbers in the research question match model knowledge: 15 in to the water-closet centerline, 21 in clear in front, and a 900 sq in / 30 in shower.

### Cited Findings
- None retrieved in this session. See Gaps.

### Inferences
- Bath layout defaults:
  - WC centerline ≥15 in from any side wall, vanity or obstruction, and ≥30 in center-to-center to an adjacent fixture.
  - ≥21 in clear in front of WC, lavatory and bidet.
  - Shower ≥30 in clear in every direction, with ≥24 in clear in front of the shower opening.
  - Treat these as code floors. Use the NKBA/universal-design values in §10–11 as design targets.

### Gaps
- **[UNVERIFIED, H]** IRC **P2705.1** and **Figure R307.1**:
  - WC, lavatory or bidet ≥ **15 in** from its center to any side wall, partition, vanity or obstruction, and ≥ **30 in** center-to-center between adjacent fixtures.
  - ≥ **21 in** clearance in front of the WC, lavatory or bidet to any wall, fixture or door.
  - **[UNVERIFIED, M]** Figure R307.1 also shows **24 in** clear in front of a shower opening, 21 in in front of a tub, and about 4 in from the lavatory edge to the wall.
- **[UNVERIFIED, H]** **P2708.1** showers:
  - Floor area ≥ **900 sq in**, able to contain a **30 in circle**, maintained to **70 in** above the drain.
  - Exception: ≥ **25 in** minimum dimension where area ≥ **1,300 sq in**.
  - Hinged shower doors open outward.
  - Shower access opening ≥ **22 in** clear.
  - Shower and tub-shower valves must be pressure-balance, thermostatic or combination type, limited to **120 °F** (P2708.4). Tub fillers are also limited to 120 °F (P2713.3).
- **[UNVERIFIED, H]** R307.2: tub and shower walls get a nonabsorbent finish to **≥6 ft** above the floor.
- **[UNVERIFIED, H]** The IRC has no water-closet compartment minimum. The 30 × 60 in compartment is an **IPC 405.3.1** rule, not IRC.
- **[UNVERIFIED, H]** M1505: bathroom exhaust **50 cfm** intermittent or **20 cfm** continuous. Kitchen exhaust **100 cfm** intermittent or **25 cfm** continuous.
- Not determined: the 2024 section number for R307.

---

## 8. Garages, attic access (R807), crawlspace access (R408), ramp slope

### Takeaway
Garage-to-house separation is in §5. Garage floors must be noncombustible and sloped to drain or toward the vehicle door. The attic and crawlspace access sizes below were not verified this session, but model confidence is high: attic **22 × 30 in** and crawlspace **18 × 24 in** through the floor or **16 × 24 in** through the wall. In 2024, garages and carports move to **R317**.

### Cited Findings
- 2024: Garages and Carports renumbered R309 → **R317**. — [ICC 2024 IRC Significant Changes](https://www.iccsafe.org/wp-content/uploads/Session-1-and-31-2024-IRC-Significant-Changes.pdf)
- Garage separation requirements are summarized in §5. — [Boise #435](https://www.cityofboise.org/media/3925/435-dwelling-garage-separation_final-feb-2022.pdf)

### Inferences
- Every attic with ≥30 in of headroom over ≥30 sq ft needs an access hatch. Locate it in a hallway or closet ceiling and model it in the reflected ceiling plan (RCP). Size it up when an attic furnace or air handler is planned (see Gaps).

### Gaps
- **[UNVERIFIED, H]** R807.1 attic access:
  - Required for attics with combustible ceiling or roof construction where vertical height is ≥ **30 in** over an area ≥ **30 sq ft**.
  - Rough opening ≥ **22 × 30 in**, in a hallway or other readily accessible location. In a wall, 22 in wide × 30 in high.
  - Ceiling access needs ≥ **30 in** of unobstructed headroom above the opening.
- **[UNVERIFIED, M]** M1305.1.3, appliances in attics:
  - Opening and passageway large enough to remove the largest appliance, and ≥ **30 in high × 22 in wide**.
  - Passageway ≤ **20 ft** long, with ≥ **24 in** wide solid flooring.
  - Level service space ≥ **30 × 30 in** at the appliance's service side.
  - Lighting and a receptacle near the appliance.
- **[UNVERIFIED, H]** R408.4 crawlspace access:
  - Through the floor: ≥ **18 × 24 in**.
  - Through a perimeter wall: ≥ **16 × 24 in**.
  - Where below grade, an areaway ≥ **16 × 24 in** with its bottom below the access threshold.
  - Through-wall access may not be located under a door to the residence.
  - **[UNVERIFIED, M]** Appliances in crawlspaces (M1305.1.4): opening and passage ≥ **22 × 30 in**, ≤20 ft long.
- **[UNVERIFIED, H]** R408 crawlspace ventilation:
  - Net vent area ≥ **1 sq ft per 150 sq ft** of crawlspace, or 1/1,500 with a Class I vapor retarder.
  - One vent within **3 ft** of each corner.
  - Unvented crawlspace options are in R408.3.
- **[UNVERIFIED, H]** R317.1: wood joists within **18 in**, or girders within **12 in**, of exposed ground in a crawlspace must be naturally durable or preservative-treated. This sets a practical ≥18 in crawlspace clearance target.
- **[UNVERIFIED, H]** R309.1 (2021): garage floor of approved noncombustible material, sloped to a drain or toward the main vehicle entry. R309.2: carports open on ≥2 sides.
- Ramp slopes: see §3 Gaps (1:12 at the egress door, 1:8 elsewhere).

---

## 9. Energy code baseline: IECC 2021/2024 residential prescriptive R-values and U-factors; climate zones

### Takeaway
No IECC table could be retrieved or verified this session. The table below is model knowledge of **IECC 2021 Table R402.1.3** (prescriptive path), believed medium-to-high accuracy, and must be verified before use. The 2024 IECC is believed to carry the envelope values forward largely unchanged, with new **additional-efficiency credit** requirements. That belief is also unverified.

### Cited Findings
- None retrieved in this session. See Gaps.

### Inferences
- Climate-zone concept for the playbook:
  - IECC Figure R301.1 and Table R301.1 assign each US county a zone number (**0–8**, hotter to colder) and a moisture regime (**A** moist, **B** dry, **C** marine).
  - Prescriptive envelope R-values and U-factors step with the zone number.
  - The design tool should look up the project county, then read its row in the table below.
  - The IRC's Chapter 11 [RE] mirrors IECC residential. In the IRC the same tables are N1102.x.

### Gaps
- **[UNVERIFIED, M–H]** IECC 2021 Table R402.1.3, insulation and fenestration by component (also IRC 2021 Table N1102.1.3). "ci" = continuous insulation, "x+y" = cavity + ci, NR = no requirement.

| CZ | Fen. U | Skylight U | Glazed SHGC | Ceiling R | Wood-frame wall R | Mass wall R (ext/int) | Floor R | Basement wall R | Slab R, depth | Crawl wall R |
|---|---|---|---|---|---|---|---|---|---|---|
| 0–1 | 0.50 | 0.75 | 0.25 | 30 | 13 or 0+10 | 3/4 | 13 | 0 | 0 | 0 |
| 2 | 0.40 | 0.65 | 0.25 | 49 | 13 or 0+10 | 4/6 | 13 | 0 | 0 | 0 |
| 3 | 0.30 | 0.55 | 0.25 | 49 | 20 or 13+5ci or 0+15ci | 8/13 | 19 | 5ci or 13 | 10ci, 2 ft | 5ci or 13 |
| 4 (not Marine) | 0.30 | 0.55 | 0.40 | 60 | 20+5ci or 13+10ci or 0+15ci | 8/13 | 19 | 10ci or 13 | 10ci, 4 ft | 10ci or 13 |
| 5 and 4C | 0.30 | 0.55 | NR | 60 | 20+5ci or 13+10ci or 0+15ci | 13/17 | 30 | 15ci or 19 or 13+5ci | 10ci, 4 ft | 15ci or 19 or 13+5ci |
| 6 | 0.30 | 0.55 | NR | 60 | 20+5ci or 13+10ci or 0+15ci | 15/20 | 30 | 15ci or 19 or 13+5ci | 10ci, 4 ft | 15ci or 19 or 13+5ci |
| 7–8 | 0.30 | 0.55 | NR | 60 | 20+5ci or 13+10ci or 0+15ci | 19/21 | 38 | 15ci or 19 or 13+5ci | 10ci, 4 ft | 15ci or 19 or 13+5ci |

- **[UNVERIFIED, M]** The 2021 IECC raised ceilings from R-38 to R-49 (CZ2–3) and from R-49 to R-60 (CZ4–8). It tightened fenestration U-factors to 0.30 in CZ3–4 and added continuous-insulation wall options in CZ4–5. Climate zone 0 was added in the 2021 map.
- **[UNVERIFIED, M]** IECC 2021 air leakage (R402.4.1.2): ≤ **5.0 ACH50** in CZ0–2 and ≤ **3.0 ACH50** in CZ3–8. Mandatory **R408 additional efficiency package**: choose one of five options.
- **[UNVERIFIED, L–M]** IECC 2024: prescriptive envelope table believed largely carried over from 2021. Additional-efficiency requirement converted to a **credit system (≥10 credits, R408)**. Electric-readiness and EV provisions moved to appendices.
- Not determined:
  - Exact 2024 table values by zone.
  - State adoption status. Many states remain on the 2015 or 2018 IECC, or adopted 2021 with amendments.
  - The IECC fenestration and insulation tables need a primary-source fetch (ICC or energycodes.gov) before checklist use.

---

## 10. Accessibility and aging-in-place for private single-family homes

### Takeaway
No accessibility source was retrieved this session. Based on model knowledge (unverified, high confidence in the general framework): private one- and two-family homes and non-elevator townhouses are generally **not** covered by the Fair Housing Act design and construction rules or the ADA. FHA covers buildings with **4+ units** first occupied after **March 13, 1991**. Universal-design clearances are therefore recommendations unless a local "visitability" ordinance or a funding program requires them.

### Cited Findings
- None retrieved in this session. See Gaps.

### Inferences
- For a design playbook, treat accessibility in private homes as a *client-selectable design standard* rather than a code check. Offer two tiers:
  - **Visitable:** one zero-step entrance, 32 in clear doors on the entry level, an accessible half bath on the entry level.
  - **Aging-in-place / universal:** a full accessible suite on the entry level.

### Gaps
- **[UNVERIFIED, H]** Fair Housing Amendments Act 1988 design and construction requirements (24 CFR 100.205):
  - Apply to "covered multifamily dwellings" in buildings of **4 or more units** first occupied after **March 13, 1991**: all units in elevator buildings, and ground-floor units in non-elevator buildings.
  - Seven requirements:
    - Accessible building entrance on an accessible route.
    - Accessible public and common-use areas.
    - Usable doors (nominal **32 in** clear).
    - Accessible route into and through the unit.
    - Environmental controls in accessible locations.
    - Reinforced bathroom walls for grab bars.
    - Usable kitchens and bathrooms.
  - Detached single-family homes and multistory townhouse units without elevators are generally not covered.
- **[UNVERIFIED, M]** IRC 2021 R320.1: where there are **four or more dwelling units or sleeping units in a single structure**, IBC Chapter 11 provisions for Group R-3 apply. Otherwise the IRC has no accessibility mandate for one- and two-family dwellings. 2024 number not verified.
- **[UNVERIFIED, M]** ICC A117.1-2017 introduced **Type C (Visitable) units**:
  - Required elements include an entrance on a circulation path and an entry-level toilet room.
  - Key dimensions (door clear widths about 32 in, interior circulation path widths, toilet-room clear floor space) were **not verified**.
  - The IBC 2021 and 2024 reference A117.1-2017. Whether a 2021, 2024 or later A117.1 edition exists and is referenced was **not verified**. The question's "2021/2024 A117.1" may refer to the IBC editions that reference A117.1-2017.
- **[UNVERIFIED, H]** Universal-design clearances commonly drawn from the 2010 ADA Standards and A117.1 (recommended targets, not IRC requirements):
  - **32 in** clear door width, typically a **36 in** door leaf.
  - **60 in** turning circle (ADA 304.3.1), or a T-turn within a **60 in** square with **36 in** arms.
  - **30 × 48 in** clear floor space at fixtures and controls (ADA 305.3).
  - **36 in** minimum accessible route width.
  - Zero-step entry with thresholds ≤ **1/2 in**.
  - Ramps ≤ **1:12**.
  - Reach range **15–48 in** for switches and outlets.
  - Grab-bar blocking at toilet, tub and shower.
  - Curbless shower about **60 × 30 in** or larger, or a 36 × 36 transfer shower.
- Not determined: local visitability ordinances, which vary by city and state, and HUD, Section 504 or state-funding triggers.

---

## 11. NKBA kitchen and bath planning guidelines

### Takeaway
No NKBA source was retrieved this session. The values below are model knowledge of the NKBA Kitchen and Bathroom Planning Guidelines (2012 Access Standards edition, still widely cited). They are unverified, with medium-to-high confidence. NKBA guidelines are recommendations, not code.

### Cited Findings
- A 2026 guide covering room sizes, clearances, code minimums and NKBA numbers was surfaced by search but not read. It is a candidate source for verification. — [ClampPro, Room Sizes and Clearances (2026)](https://clamppro.com/guides/room-sizes-clearances/)

### Inferences
- Use NKBA values as design targets layered above the IRC floor. For example, the IRC requires only 21 in in front of a water closet, while NKBA recommends 30 in and prefers 48 in.

### Gaps
- **[UNVERIFIED, M–H]** NKBA Kitchen Planning Guidelines (selected):
  - **Entry door:** ≥ **32 in** clear, about a 34 in door.
  - **Work triangle:**
    - Sum of the three legs ≤ **26 ft**, each leg **4–9 ft**.
    - No leg crosses an island or peninsula by more than **12 in**.
    - No major traffic through the triangle.
  - **Aisles and walkways:**
    - Work aisle ≥ **42 in** for one cook, ≥ **48 in** for multiple cooks.
    - Walkway ≥ **36 in**.
  - **Traffic clearance at seating:**
    - **32 in** from counter or table edge to an obstruction if no traffic passes.
    - **36 in** to edge past a seated diner.
    - **44 in** to walk past.
  - **Knee space per seat** (24 in wide at each height):

    | Counter height | Knee-space depth |
    |---|---|
    | 30 in | 18 in |
    | 36 in | 15 in |
    | 42 in | 12 in |

  - **Landing and prep areas:**
    - Primary sink landing: ≥ **24 in** on one side and ≥ **18 in** on the other.
    - Prep area: ≥ **36 in wide × 24 in deep** continuous counter immediately next to a sink.
    - Refrigerator: **15 in** on the handle side, or 15 in on either side of a side-by-side, or 15 in within **48 in** across.
    - Cooking surface: **12 in** on one side and **15 in** on the other. At an island, also **9 in** behind the cooktop at counter height.
    - Oven: **15 in** next to it or within 48 in across.
    - Microwave: **15 in** above, below or adjacent to the handle side.
    - Combined landing areas: take the longer one and add **12 in**.
  - **Dishwasher:** within **36 in** of a sink edge, with **21 in** standing space beside it.
  - **Cooktop clearance:** **24 in** to a protected or noncombustible surface above, **30 in** to an unprotected surface, or per the manufacturer.
  - **Microwave height:** bottom about 3 in below the user's shoulder and ≤ **54 in** above the floor.
  - **Total counter frontage:** ≥ **158 in**, 24 in deep, with 15 in clearance above.
  - **Storage frontage:** about **1,400 / 1,700 / 2,000 in** for small (<150 sq ft), medium (151–350 sq ft) and large (>350 sq ft) kitchens.
  - **Counter heights:** standard **36 in**. NKBA recommends varied heights, about **28–36 in** and **36–45 in**.
- **[UNVERIFIED, M]** NKBA Bathroom Planning Guidelines (selected):
  - Door ≥ **32 in** clear.
  - Clear floor space ≥ **30 × 48 in** at each fixture. Clear space in front of the water closet ≥ **30 in** recommended (code 21 in), ideally **48 in**.
  - Water closet centerline **18 in** to the side wall or obstruction recommended (code 15 in).
  - Toilet compartment **36 × 66 in** recommended.
  - Lavatory centerline ≥ **20 in** from the side wall and **36 in** between double-bowl centerlines.
  - Vanity height **30–34 in** or **34–43 in** depending on user.
  - Shower interior ≥ **36 × 36 in** recommended (code 30 × 30 / 900 sq in). Shower seat **17–19 in** high.
  - **60 in** turning space recommended for universal design.
  - Grab-bar blocking.
- Not determined: whether NKBA updated its guidelines after 2012 (for example, a 2020s edition) and any numeric changes.

---

## 12. Zoning inputs the designer must obtain from the jurisdiction

### Takeaway
Zoning governs the building envelope on the lot, and the building code governs construction. A residential design brief should capture the local values below before massing. This list is standard professional practice, not cited numeric data.

### Cited Findings
- No zoning-specific source was retrieved this session. The IRC itself references the lot line for fire separation distance (§5), which ties zoning setbacks to R302.1. — [ICC 2024 IRC R302.1](https://codes.iccsafe.org/s/IRC2024P1/chapter-3-building-planning/IRC2024P1-Pt03-Ch03-SecR302.1)

### Inferences
- Items to request from the zoning code, planning department or HOA. Values vary locally; no defaults should be assumed.
  - Zoning district and permitted use. Is a single-family, duplex, townhouse or ADU allowed?
  - Minimum lot area, width and frontage.
  - Setbacks:
    - Front, side (interior and street side) and rear.
    - Corner-lot rules.
    - Allowed encroachments for eaves, bays, porches, stairs, chimneys and HVAC equipment.
    - Build-to lines.
  - Height:
    - Maximum height in ft and stories.
    - How height is measured: grade reference, midpoint of roof vs. ridge.
    - Daylight planes or bulk planes.
    - Accessory-structure height.
  - Lot coverage: maximum building and/or impervious coverage.
  - Floor area ratio (FAR) or maximum gross floor area, and what counts (garages, basements, attics, porches).
  - Parking: number of spaces, covered or uncovered, garage size minimums, driveway width, curb-cut and apron rules.
  - Accessory dwelling unit (ADU) rules: size, separation, parking, owner occupancy.
  - Design and overlay rules:
    - Historic districts.
    - Design review.
    - Garage-door placement relative to the façade.
    - Entry orientation.
    - Window and transparency requirements.
  - Environmental and site overlays:
    - Flood zone and design flood elevation (also IRC R322).
    - Wildland-urban interface (WUI).
    - Steep slope.
    - Shoreline and wetlands.
    - Tree protection.
  - Easements, utility locations, sight triangles, grading and stormwater limits.
  - HOA covenants and CC&Rs, which are private restrictions and may be stricter than zoning.
- FSD under the IRC (§5) is measured to the lot line. Zoning side setbacks below about 5 ft therefore usually trigger rated walls and opening limits. Coordinate both.

### Gaps
- No local values gathered, by design.
- Not verified: the IRC R322 flood provisions and WUI code (IWUIC) triggers. They are out of scope for this pass but relevant where the site is in an overlay.
