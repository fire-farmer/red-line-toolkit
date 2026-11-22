# Structural and Building-Science Best Practices for US Light-Frame Residential Design (2026 baseline)

Method note for the report writer: in this session WebFetch could not reach codes.iccsafe.org or up.codes (hosts blocked by the session network), so no code page was read in full. Every finding below comes from web-search results: the cited URL is the page the search tool used for that claim. The search tool's summaries were cross-checked against each other and, where noted, against hand calculations. The search budget ran out before rainscreens, overhang depths, ice dams, metal-roof slopes, NEC 240.24, radon/termite maps and hold-downs could be searched; those items are listed under Gaps with "unverified, from training knowledge" labels and must not be presented as sourced. IRC section numbers move between the 2015, 2018, 2021 and 2024 editions. Verify against the edition the jurisdiction has adopted.

## 1. Load path fundamentals: continuous load path, stacking, braced wall lines, hold-downs, uplift, and what layout choices make structure expensive

### Takeaway
The IRC prescriptive path works only when bracing and bearing walls stack vertically and the building is "regular". Braced wall panels may be no more than 25 ft o.c. along a braced wall line and must start within 12.5 ft of each end (10 ft in SDC D0–D2 for some methods). In SDC D0–D2, out-of-plane offsets of shear walls, large cantilevers, tall cripple walls and multiple irregularities push all or part of the house into engineered design. The cheapest structure is one where walls, posts and bracing line up from roof to foundation.

### Cited Findings
- Braced wall panels shall be located no more than 25 ft on center along a braced wall line. The distance from each end of the braced wall line to the outermost panel may not exceed 12.5 ft in total (R602.10.1.4 in the cited edition). — [UpCodes R602.10.1.4 Braced Wall Panel Location](https://up.codes/s/braced-wall-panel-location)
- In SDC D0–D2, Method WSP/BV-WSP and continuous-sheathing panels may begin no more than 10 ft from each end of a braced wall line, provided each end meets listed conditions. Method PFH/ABW panels have similar 10-ft allowances. — [The Building Code Forum, R602.10 thread](https://www.thebuildingcodeforum.com/forum/threads/irc-wall-bracing-r602-10-question.34519/); [ABTG IRC 2015 Wall Bracing Guide](https://www.appliedbuildingtech.com/system/files/abtgrr_1601-01_irc_2015_wall_bracing_guide.pdf)
- Reference guides for bracing design: the ABTG/APA "IRC Wall Bracing: A Guide for Builders, Designers and Plan Reviewers", and BSC GM-0902 on bracing with insulating (foam) sheathing. — [ABTG guide PDF](https://www.appliedbuildingtech.com/system/files/abtgrr_1601-01_irc_2015_wall_bracing_guide.pdf); [BSC GM-0902](https://buildingscience.com/documents/guides-and-manuals/irc-faqs/irc-faq-wall-bracing-requirements-for-insulating-sheathing)
- The IRC seismic provisions "shall not be used for structures, or portions thereof, located in Seismic Design Categories C [townhouses], D0, D1 and D2 and considered to be irregular" (R301.2.2.6). Irregular portions "shall be designed in accordance with accepted engineering practice to the extent the irregular features affect the performance of the remaining structural system." The rest of the building may still use the prescriptive provisions. — [UpCodes Irregular Buildings](https://up.codes/s/irregular-buildings); [2015 IRC Ch. 3 (ICC public)](https://codes.iccsafe.org/public/document/IRC2015/chapter-3-building-planning)
- Irregularity types in the IRC seismic section include:
  - Shear wall or braced wall panels "not in one plane vertically from the foundation to the uppermost story in which they are required" (out-of-plane offset). Where this applies, the entire story must be engineered.
  - Cantilever conditions tied to a back-span-to-cantilever ratio of at least 2:1.
  - Cripple wall or post-and-beam clear height over 7 ft, which triggers engineering of the floor above.
  - When multiple irregularities occur, the entire building needs engineered design by a registered design professional.

  The exact list and wording vary by edition. — [WA State Residential Code 2021 Ch. 3](https://codes.iccsafe.org/content/WARC2021P1/chapter-3-building-planning); [Oregon 2021 ORSC significant changes](https://www.oregon.gov/bcd/codes-stand/Documents/2021orsc-significant-changes.pdf); [CED Engineering, Seismic Design of Dwellings](https://www.cedengineering.com/userfiles/S08-007%20-%20Seismic%20Design%20and%20Construction%20of%20Dwellings%20and%20Townhouses%20-%20US.pdf)
- Single-top-plate (advanced) framing requires that all members above the top plate be stack-framed, meaning vertically aligned with the members directly below, with a maximum alignment offset tolerance of 1 in. — [APA Advanced Framing Construction Guide](https://constructioninstruction.com/wp-content/uploads/2020/11/APA-Advanced-Framing-Construction-Guide.pdf)
- Builder guidance on cost: "four-corner foundation" and "stacked exterior walls" are cited as cost-efficiency measures. — [Pro Builder, 4 Detached Home Plans That Reduce Building Costs](https://www.probuilder.com/design/house-review/article/55198384/4-detached-home-plans-that-reduce-building-costs)

### Inferences
- Rule for the AI modeler (rule of thumb): put exterior walls and main bearing lines in the same plan position on every floor. Upper-floor bearing walls should sit directly over lower bearing walls, beams or foundation walls. Treat any upper wall that does not land on structure below as a "transfer" that needs a sized beam and an engineer flag.
- Rule: every floor must have braced wall lines on all four sides plus interior lines so that no two parallel braced wall lines are farther apart than the adopted table allows (see Gaps for spacing). Place solid-wall bracing segments (no windows) within 12.5 ft of each building corner (10 ft in high-seismic areas), and at least every 25 ft along each line. In practice, avoid floor-to-ceiling glass at corners and long uninterrupted glazed walls. Those need portal frames, alternate bracing methods or engineered shear walls.
- Rule: flag as "engineer required" any of the following in SDC D0–D2:
  - upper-story exterior walls set back or projected from the walls below (out-of-plane offset);
  - cantilevers carrying walls or roofs;
  - cripple walls taller than 7 ft (stepped foundations on slopes);
  - more than one of these conditions on one house.
- Point loads (girder trusses, beam ends, posts) need a continuous post or stud pack down to a footing. Each point load should be traced to the foundation and a pad footing added where it lands. This rule follows from the stack-framing requirement above; the specific hold-down and squash-block rules are not sourced here (see Gaps).

### Gaps
- Braced wall line spacing limits (Table R602.10.1.3) not retrieved. Unverified, from training knowledge: about 60 ft max spacing in SDC A–C/wind-governed areas; 25 ft in SDC D0–D2, with up to 35 ft allowed under conditions; braced wall line offsets up to ±4 ft allowed (R602.10.1.2). Verify.
- Required bracing length tables (R602.10.3), portal-frame/narrow-panel methods (CS-PF, PFH, ABW), and minimum panel lengths (typically 48 in. for WSP at 8-ft wall height) were not retrieved.
- Hold-down, uplift-connector (R802.11 roof uplift) and continuous-load-path connector requirements were not searched (search budget exhausted). The wind uplift tie requirements in R802.11 and the WFCM (AWC Wood Frame Construction Manual) need a follow-up search.
- No source quantified the cost premium of transfers or cantilevers.

## 2. Spans and sizes: floor joists, I-joists, trusses, rafters, headers, beams, ridge beam vs. ridge board

### Takeaway
Under the 2021 IRC 40-psf living-area table, a Douglas fir-larch No. 2 2x10 at 16 in. o.c. spans about 15'-7" and a 2x12 about 18'-1". Bending governs for both, and a hand calculation agrees. I-joists come in 9-1/2, 11-7/8, 14 and 16 in. depths and are designed to L/480. Headers are sized from IRC Table R602.7(1) by building width and snow load. For example, a double 2x10 in an exterior bearing wall carrying roof and ceiling spans about 9'-0" at a 12-ft building width and about 6'-10" at 24 ft (30-psf ground snow). Where ceiling joists or rafter ties don't tie the walls, the ridge must be a supported beam rather than a ridge board.

### Cited Findings
- **Which floor table applies.** IRC Table R502.3.1(2) (40 psf live load, 10 psf dead load, L/360) governs floor joists in living areas other than sleeping rooms and attics. Table R502.3.1(1) (30 psf live) governs sleeping rooms and attics. — [2015 IRC Ch. 5 (ICC)](https://codes.iccsafe.org/content/IRC2015P3/chapter-5-floors); [Jaspector IRC 2024 floor joist span tables](https://www.jaspector.com/codes/irc-2024/ch05-floors/floor-joist-span-tables-irc-2024/)
- **DF-L No. 2 at 16 in. o.c., 40 psf live + 10 psf dead (Table R502.3.1(2), 2021 IRC).** 2x10 spans 15'-7"; 2x12 spans 18'-1". Strength (bending) governs. — [joistspan.com 2x10 table (2021 IRC)](https://joistspan.com/floor-joists/2x10/); [BuildEstimatory joist span table](https://buildestimatory.com/guides/joist-span-table/). Some secondary sites list 15'-5"/18'-4" or 18'-10" instead, which conflicts — [TradeMasterCalc](https://trademastercalc.com/span-tables/floor-joist); [ExpertBuildCalc](https://expertbuildcalc.com/guides/lumber-span-tables/)
- **SPF No. 2 2x10 at 16 in. o.c. (2015 IRC, 40 psf table).** Cited as 15'-5". — [Eng-Tips thread](https://eng-tips.com/threads/floor-joists-code-vs-engineering.520028/post-8997801)
- **Southern pine No. 2 2x10 at 16 in. o.c.** Cited as about 15'-6" (2024) or 16'-1" (2018). The 2018 page mislabels tables, so these values are unreliable. — [Jaspector IRC 2024](https://www.jaspector.com/codes/irc-2024/ch05-floors/floor-joist-span-tables-irc-2024/); [Jaspector IRC 2018](https://www.jaspector.com/codes/irc-2018/ch05-floors/floor-joist-span-irc-2018/)
- **Sleeping-room table, DF-L No. 2 2x10.** 19'-10" / 17'-5" / 15'-11" / 14'-3" at 12 / 16 / 19.2 / 24 in. o.c. With a 20-psf dead load (finished ceiling below), 2x10 at 16 in. is 14'-3" and 2x12 is 16'-6". — [BuildEstimatory](https://buildestimatory.com/guides/joist-span-table/); [joistspan.com](https://joistspan.com/floor-joists/2x10/)
- **Cantilevers (R502.3.3).** The 2015 IRC says "cantilever spans shall not exceed the nominal depth of the wood floor joist," with tables allowing longer cantilevers that support a light-frame bearing wall and roof. Secondary sources describe the 2018/2024 rules differently: one gives a back span of at least 2x the cantilever, another gives a cantilever of no more than 1/4 of the allowable back span. The 2024 IRC clarified what "blocking at the support" means. — [2015 IRC Ch. 5](https://codes.iccsafe.org/content/IRC2015P3/chapter-5-floors); [Jaspector 2024 cantilever](https://www.jaspector.com/codes/irc-2024/ch05-floors/cantilever-floor-requirements-irc-2024/); [Jaspector 2018 cantilever](https://www.jaspector.com/codes/irc-2018/ch05-floors/floor-joist-cantilever-limits-irc-2018/); [Building Code Forum 2024 cantilever clarification](https://www.thebuildingcodeforum.com/forum/threads/2024-irc-clarifies-floor-joist-cantilevers-what-%E2%80%9Cblocking-at-the-support%E2%80%9D-actually-means.39147/); [JLC Cantilevers in the 2015 Code](https://www.jlconline.com/?p=43992)
- **I-joists.** APA performance-rated I-joists come in net depths of 9-1/2, 11-7/8, 14 and 16 in. Live-load deflection is limited to span/480, stiffer than sawn-lumber L/360. Spans are manufacturer-specific (TJI, LPI, PWI, Roseburg). A Weyerhaeuser table fragment suggests about 20'-4" for an 11-7/8 in. joist at 16 in. o.c., but the load conditions were unclear. — [APA I-Joist Selection and Specification guide](https://interfor.com/wp-content/uploads/2023/05/APA-Engineered-Wood-Construction-Guide-I-Joist-Selection-and-Specification.pdf); [LP LPI Residential Technical Guide](https://lpcorp.com/resources/product-literature/technical-guides/lpi-residential-technical-guide); [Weyerhaeuser tech support table](https://www.techsupport.weyerhaeuser.com/hc/en-us/article_attachments/200535140)
- **Headers (IRC Table R602.7(1), 2021 format with building widths 12/24/36 ft).** A two-ply 2x10 in an exterior bearing wall supporting roof and ceiling, at 30 psf ground snow, spans:
  - 9'-0" at a 12-ft building width (1 jack stud each end);
  - 6'-10" at 24 ft (2 jacks);
  - 5'-9" at 36 ft (2 jacks).

  The 2015 table (different widths) lists 8'-5" with 2 jacks for 2-2x10 roof and ceiling only. — [reuven.tools header span chart](https://reuven.tools/reference/header-spans/); [joistspan.com headers (2021 IRC R602.7(1),(2))](https://joistspan.com/headers/); [2015 IRC Ch. 6](https://codes.iccsafe.org/content/IRC2015/chapter-6-wall-construction)
- **When headers are not required, and when to call an engineer.** R602.7.4: load-bearing headers are not required in interior or exterior nonbearing walls. An engineer is required when the opening exceeds the table limits, carries point loads, or falls outside the table's range. — [Jaspector IRC 2024 header sizing](https://www.jaspector.com/codes/irc-2024/ch06-wall-construction/header-sizing-irc-2024/)
- **Ridge beam vs. ridge board.** R802.3 (2015 Seattle Residential Code text): "where ceiling joist or rafter ties do not provide continuous ties across the structure, a ridge beam shall be provided and supported on each end by a wall or girder." — [Seattle Residential Code 2015/2021 Ch. 8](https://seattle.gov/documents/departments/sdci/codes/seattleresidentialcode/2021srcchapter8.pdf)
- **Footing-side check on point loads.** IRC Table R403.1 widths assume uniform wall loads; point loads need their own footing design (see Q4). — [Grand Rapids MN footings handout](https://cityofgrandrapidsmn.com/sites/default/files/fileattachments/community_development/page/2526/footings_foundations_and_slabs.pdf)

### Inferences
- Hand check confirming the cited DF-L No. 2 values (my calculation, assumed NDS values Fb = 900 psi, E = 1.6e6 psi, Cr = 1.15, CF = 1.1 for 2x10 and 1.0 for 2x12):
  - 2x10 at 16 in., 50 psf total: bending limit about 15.6 ft (15'-7"); deflection limit at L/360 under 40 psf about 16.4 ft. Bending governs.
  - 2x12: bending about 18.1 ft (18'-1"); deflection about 19.9 ft.
  - This supports 15'-7"/18'-1" over the conflicting secondary values.
- Modeling rules of thumb (not code):
  - 2x10 floors for clear spans up to about 15 ft.
  - 2x12 floors up to about 18 ft.
  - 11-7/8 in. I-joists or floor trusses for about 16–20 ft.
  - Beyond about 20 ft, add a mid-span beam or bearing line, or specify deeper engineered joists/trusses from a manufacturer table.
- Rule: keep floor joists running the short direction of the plan and place a central beam or bearing wall roughly at mid-depth of a 24–32 ft deep house. This creates two spans of 12–16 ft that standard lumber can handle.
- Rule: headers in exterior bearing walls should use the R602.7(1) table for the building width. Openings wider than about 6–9 ft in bearing walls (depending on width and snow) need LVL/glulam or engineered beams, and that decision should be surfaced as "engineer/supplier sizing required."
- Rule: a cathedral ceiling or vaulted room without rafter ties or ceiling joists needs a structural ridge beam with posts down to the foundation at each end. A ridge board is acceptable only when ceiling joists or rafter ties complete the triangle.

### Gaps
- Rafter span tables (R802.4.1/R802.5) and ceiling joist tables were not retrieved.
- Unverified, from training knowledge: R802.3 requires a ridge beam where roof slope is less than 3:12, and the ridge board must be at least 1 in. nominal thickness and not less in depth than the cut end of the rafter. Verify.
- Unverified, from training knowledge: R502.4 says bearing partitions perpendicular to joists shall not be offset from supporting girders/walls more than the joist depth, unless joists are sized for the load. Verify.
- Open-web floor truss and roof truss clear spans were not found in search results. Unverified, from training knowledge: common residential roof trusses span roughly 24–40 ft clear with no interior bearing, and floor trusses 14–24 in. deep span roughly 18–30 ft. Truss spans are designed by the truss manufacturer per R802.10 / ANSI/TPI 1 and should be treated as supplier-engineered.
- LVL/glulam beam sizing ranges: no source retrieved. These are always sized from manufacturer tables or by an engineer.
- Southern pine No. 2 2x10 spans have conflicting sources. Current SP design values (post-2013) give shorter spans than older tables.

## 3. Dimensional and framing modules: 16/24 in. o.c., 4x8 sheets, advanced framing, wall thicknesses, plate heights, rough openings, stairs

### Takeaway
Lay out the house on a 2-ft module, which works with 16 and 24 in. o.c. framing and 4x8 sheets. Precut studs set wall heights: 92-5/8 in. studs give an 8-ft (97-1/8 in.) wall, 104-5/8 in. gives 9 ft, and 116-5/8 in. gives 10 ft where stocked. Advanced framing (2x6 at 24 in., single top plates, 2-stud corners, fewer jacks and headers) requires stacked framing within 1 in. Stairs (max 7-3/4 in. riser, min 10 in. tread, 6'-8" headroom, 36 in. width) set the minimum stair footprint for a given floor-to-floor height.

### Cited Findings
- **Advanced framing package.** 2x6 walls at 24 in. o.c., single top plates, two-stud corners, and reduced headers and jack studs, replacing 2x4 at 16 in. with double top plates and three-stud corners. — [BSC BSI-030 Advanced Framing](https://buildingscience.com/documents/insights/bsi-030-advanced-framing); [PNNL-hosted BSI-030 PDF](https://basc.pnnl.gov/sites/default/files/resource/BSI-030_Advanced_Framing.pdf)
- 2x6 at 24 in. o.c. is the most commonly adopted advanced framing technique. Single top plates require stack framing within a 1-in. alignment tolerance. — [APA Advanced Framing Construction Guide](https://constructioninstruction.com/wp-content/uploads/2020/11/APA-Advanced-Framing-Construction-Guide.pdf)
- Building America field measures included 2-stud corners, 2-stud interior/exterior headers, reduced studs around openings and single top plates. A combined-measures report found about 13% energy savings over standard framing. Building America field studies covered thousands of homes. — [DOE Building America Advanced Framing innovation profile](https://www.energy.gov/sites/prod/files/2014/01/f6/1_1b_ba_innov_advancedframing_011713.pdf); [BSC BA-1004 Advanced Framing at Community Scale](https://buildingscience.com/documents/bareports/ba-1004-ba-special-research-advanced-framing-deployment/view)
- Minimum-stud guidance (DOE Building America Solution Center resource guide). — [BASC Advanced Framing: Minimum Wall Studs](https://basc.pnnl.gov/resource-guides/advanced-framing-minimum-wall-studs)
- **Precut studs.**
  - 8-ft walls: 92-5/8 in. precut studs give an 8'-1-1/8" (97-1/8 in.) wall with a sole plate and two top plates at 1-1/2 in. each. Drywall takes most of the extra, leaving a small gap at the floor.
  - 9-ft walls: 104-5/8 in. studs are commonly stocked.
  - 10-ft walls: 116-5/8 in. precuts exist, but regional availability varies; some markets have no 10-ft precuts.

  — [JLC Precut Stud Lengths](https://www.jlconline.com/how-to/framing/precut-stud-lengths_o); [Fine Homebuilding: Do precut studs make sense](https://www.finehomebuilding.com/project-guides/framing/do-precut-studs-make-sense); [FHB forum: studs precut to 92-5/8](https://finehomebuilding.com/forum/studs-pre-cut-to-92-5-8-why); [Lowe's 2x4x104-5/8 stud listing](https://www.lowes.com/pd/2-in-x-4-in-x-104-5-8-in-Fir-Stud/5014027031); [FHB forum: how tall is a 10 ft wall](https://finehomebuilding.com/forum/how-tall-is-a-10-tall-wall)
- **Story-height limits.** For wood wall framing, story height "shall not exceed 11 feet 7 inches," together with the laterally unsupported bearing-wall stud height of Table R602.3(5), which is 10 ft. R602.3.1 / Table R602.3(6) allow walls up to 12 ft and story height up to 13'-7" under conditions. NAHB says the 2021 IRC restored 12-ft bearing walls when studs are engineered for gravity loads. Taller walls otherwise need engineering. — [Building Code Forum, 11'-4" walls thread](https://www.thebuildingcodeforum.com/forum/threads/11-4-high-wood-frame-walls.34204/); [NAHB 2021 significant IRC changes](https://www.nahb.org/-/media/NAHB/advocacy/docs/top-priorities/codes/code-adoption/2021-signficant-code-changes-for-the-irc.pdf); [California Residential Code story height summary](https://gocodebook.com/us/california/california-residential-code/definitions/building-elements-dimensions-and-safety/building-height-and-story-height)
- **Stairs (R311.7).** Maximum riser 7-3/4 in.; minimum tread 10 in.; minimum headroom 6'-8" measured from the sloped nosing line; minimum clear width 36 in. above handrail height, with handrails allowed to project up to 4-1/2 in. — [Boulder CO stair guide](https://bouldercolorado.gov/media/1481/download); [Viewrail 2021 IRC Visual Interpretation](https://www.viewrail.com/wp-content/uploads/2025/04/2021-International-Residential-Code-Visual-Interpretation.pdf); [Boise treads & risers handout](https://www.cityofboise.org/media/14405/437-treads-risers_march-2022.pdf)
- 24-in. o.c. framing depends on sheathing and drywall rated for 24-in. spans and on local code acceptance. — [APA Advanced Framing Construction Guide](https://constructioninstruction.com/wp-content/uploads/2020/11/APA-Advanced-Framing-Construction-Guide.pdf)

### Inferences
- Floor-to-floor arithmetic (my calculation from the cited stud lengths): floor-to-floor = stud + 4-1/2 in. (three plates) + floor depth + 3/4 in. subfloor.

  | Wall | Wall height | Floor | Floor-to-floor |
  |---|---|---|---|
  | 8 ft | 97-1/8 in. | 2x10 (9-1/4 in.) | about 107-1/8 in. (8'-11") |
  | 8 ft | 97-1/8 in. | 11-7/8 in. I-joist | about 109-3/4 in. (9'-1-3/4") |
  | 9 ft | 109-1/8 in. | 11-7/8 in. I-joist | about 121-3/4 in. (10'-1-3/4") |
  | 10 ft | 121-1/8 in. | 11-7/8 in. I-joist | about 133-3/4 in. (11'-1-3/4") |

- Stair arithmetic from R311.7 (my calculation):
  - For about 109-3/4 in. floor-to-floor: 109.75 / 7.75 = 14.2, so at least 15 risers (about 7.32 in. each) and 14 treads × 10 in. = 140 in. (11'-8") minimum horizontal run, before landings.
  - For 9-ft plates (about 122 in.): 16 risers at about 7.6 in. and 15 treads = 150 in. (12'-6") run.
  - Add 6'-8" headroom clearance through the floor opening above. The stair opening in the upper floor must typically be about 10–12 ft long × 36 in. or more clear, plus finishes. This opening needs doubled trimmer and header joists (R502.10).
- Modeling rules (rules of thumb):
  - Snap overall exterior dimensions to 2-ft increments (e.g., 24×36, 28×40), ideally on 4-ft increments, to cut sheathing waste.
  - Locate window and door rough openings to fall on or next to the stud layout grid.
  - Stack upper-floor walls, joists and rafters on the same 24-in. grid when using single top plates.
  - Choose 2x6 walls (5-1/2 in. stud) for cavity R-20/R-21 class insulation in most climates. 2x4 walls are 3-1/2 in.
  - Total finished wall thickness: about 4-1/2 in. for a 2x4 interior partition (1/2 in. drywall each side); about 6-1/2 to 7 in. for a 2x6 exterior wall with sheathing and drywall, before cladding and exterior insulation.
- Ceiling-height rule: specify plate heights as 8'-1-1/8", 9'-1-1/8" or about 10'-1-1/8" (precut-stud based) rather than arbitrary heights. Cutting studs from long lumber adds waste and labor.

### Gaps
- Standard door and window rough openings were not retrieved. Unverified, from training knowledge: a prehung interior door's rough opening is typically door width + 2 in. by about 82-1/2 in. high for a 6'-8" (80 in.) door; window rough openings are typically the unit size + 1/2 in. each way (per manufacturer). On an 8-ft wall with 92-5/8 in. studs, a standard header height is about 82-1/2 in. to the bottom of the header. Verify with manufacturer data.
- An NAHB Research Center / Home Innovation Research Labs advanced framing guide was not retrieved directly.
- Insulated header details (2-ply with rigid foam, or single-ply at the exterior face) were not found in search results; see BSI-030 and the APA guide above.
- Wall thickness and finish dimensions in the Inferences are standard lumber dimensions from training knowledge (2x4 = 1-1/2 × 3-1/2 in.; 2x6 = 1-1/2 × 5-1/2 in.), not separately sourced in this session.
- The maximum vertical rise of a single stair flight (unverified, from training knowledge: 151 in. in the 2018+ IRC R311.7.3, earlier 144 in.) was not confirmed by search.

## 4. Foundations: slab vs. crawlspace vs. basement, frost depth, footing sizes, soil bearing, drainage and grading, termites, moisture, radon

### Takeaway
Grade must fall at least 6 in. within 10 ft of the foundation (R401.3). Footings must be at least 12 in. wide and 6 in. thick (R403.1.1), with widths from Table R403.1 scaled by soil bearing. The 1,500 psf default gives 12 in. for one-story light frame and about 15–16 in. for two-story. Slab is cheapest, crawlspace moderate, basement most expensive; frost depth and site slope drive the choice. Footings always go below the frost line, so deep-frost regions shift the economics toward basements or frost-protected shallow foundations.

### Cited Findings
- **Grading (R401.3).** "The grade shall fall a minimum of 6 inches within the first 10 feet" from the foundation. Where lot lines, walls, slopes or other physical barriers prohibit 6 in. of fall within 10 ft, drains or swales are required. Impervious surfaces within 10 ft of the foundation must slope at least 2% away from the building. — [NACHI Foundation Load and Water Paths (R401.2 & R401.3)](https://nachi.org/foundation-load-water.htm); [Seattle Residential Code 2021 Ch. 4](https://seattle.gov/documents/departments/sdci/codes/seattleresidentialcode/2021srcchapter4.pdf); [Massachusetts 780 CMR R401.3](https://www.law.cornell.edu/regulations/massachusetts/780-CMR-CHAPTER-51-ch-R4-R401.3)
- **Minimum footing size (R403.1.1).** Concrete footings at least 12 in. wide and 6 in. thick. — [MyBuildingPermit 2021 Residential Footing & Foundation inspection checklist](https://mybuildingpermit.com/sites/default/files/2021_IC_Residential_%20Footing_and_Foundation_Final_0.pdf); [WAC 51-51-0403](https://lawfilesext.leg.wa.gov/Law/WAC/WAC%20%2051%20%20TITLE/WAC%20%2051%20-%2051%20%20CHAPTER/WAC%20%2051%20-%2051%20-0403.htm)
- **Footing widths (Table R403.1).** Widths are indexed to soil load-bearing values from Table R401.4.1, number of stories and construction type. The restructured R403.1(1)–(3) tables cover 1,500 to 4,000 psf soils.
  - At 1,500 psf, conventional light frame: 12 in. for one story; 15 in. for two stories (Minnesota handout copy). Topeka's local table shows 16 in. for two stories.
  - Table notes allow scaling width by (1,500 psf ÷ actual soil capacity).

  — [Grand Rapids MN footings, foundations and slabs](https://cityofgrandrapidsmn.com/sites/default/files/fileattachments/community_development/page/2526/footings_foundations_and_slabs.pdf); [Topeka Municipal Code 14.55.430](https://topeka.municipal.codes/TMC/14.55.430); [ICC change proposal R403.1.1 (Bajnai)](https://www.iccsafe.org/wp-content/uploads/bcac/R40311-Bajnai.pdf); [WA 2018 rulemaking](https://lawfilesext.leg.wa.gov/law/WSR/2018/21/18-21-130.htm)
- **Foundation-type costs.** Cost ranks slab lowest, crawlspace moderate, basement highest. Basements take longest and cost more mainly due to excavation. One source lists slabs at about $7,500–12,000 and crawlspaces at $10,000–25,000, noting large regional variation; these are consumer-site estimates, not cost studies. — [The Plan Collection: Slab vs. Crawl Space vs. Basement](https://www.theplancollection.com/blog/1--building-on-slab-vs--crawl-space-vs--basement--advantages---disadvantage); [Angi: slab vs crawl space](https://angi.com/articles/slab-vs-crawl-space-foundations.htm); [This Old House: slab vs crawl space](https://www.thisoldhouse.com/foundations/slab-vs-crawl-space)
- **Frost depth.** Slabs suit areas with shallow or no frost lines; crawlspaces suit areas where the frost line is a few feet down. Footings must sit below the frost line regardless of foundation type. — [Angi: slab vs crawl space](https://angi.com/articles/slab-vs-crawl-space-foundations.htm); [Fine Homebuilding: What's better, crawlspace or slab-on-grade](https://www.finehomebuilding.com/item/15173/whats-better-crawlspace-or-slab-on-grade)
- **Moisture, radon and termites.**
  - A green-building source argues slabs (stem walls or basements) give more control over water and soil gases like radon than crawlspaces. Another notes local codes may require radon vents in crawlspaces.
  - Crawlspaces allow termite inspection; slabs hide the soil-contact interface.
  - GBA has published a guest blog titled "New vented crawl spaces should be illegal", indicating the building-science community's shift toward sealed/conditioned crawlspaces.

  — [GBA: What kind of foundation](https://greenbuildingadvisor.com/question/what-kind-of-foundation); [GBA: New vented crawl spaces should be illegal](https://www.greenbuildingadvisor.com/blogs/dept/guest-blogs/new-vented-crawl-spaces-should-be-illegal); [Bob Vila: slab vs crawl space](https://bobvila.com/articles/slab-vs-crawl-space)

### Inferences
- Modeling rules:
  - Default to slab-on-grade (or frost-protected shallow foundation) in warm and shallow-frost climates and on flat sites.
  - Default to a conditioned (unvented) crawlspace or basement in deep-frost climates, where footings must go deep anyway.
  - On sloped sites, consider a walk-out basement but avoid tall stepped cripple walls over 7 ft in seismic areas (see Q1).
- Rule: always model a grading envelope: finished grade sloping 6 in. in the first 10 ft away from every wall; hardscape at 2%; swales where setbacks are tight. Keep the top of the foundation above finished grade (see Gaps for the clearance).
- Rule: footings under every bearing wall and every concentrated post. Show continuous perimeter footings at least 12 in. wide (wider for two-story, poor soils or heavy cladding) and isolated pad footings under girder posts and point loads.

### Gaps
- Table R401.4.1 presumptive soil bearing values were not retrieved. Unverified, from training knowledge: 1,500 psf default for clay/silt/unknown; 2,000 psf for sandy/gravelly soils; 3,000 psf for sand/gravel; 4,000 psf for sedimentary rock; 12,000 psf for crystalline bedrock. Verify.
- Unverified, from training knowledge, for minimum depth and clearances:
  - R403.1.4: exterior footings at least 12 in. below undisturbed ground and below the jurisdiction's frost line (Table R301.2(1)).
  - R404.1.6: foundation must extend at least 6 in. above finished grade (4 in. where masonry veneer is used).
  - R317.1: wood within 8 in. of soil must be treated.
  - Frost depths are set locally and range from 0 in. (Gulf states) to 60 in. or more (northern MN). No source retrieved.
- R408 crawlspace venting ratio (unverified: 1 sq ft per 150 sq ft, or 1/1,500 with a ground vapor retarder) and unvented crawlspace options were not retrieved.
- Slab (R506) minimums (unverified: 3-1/2 in. thick, 6-mil polyethylene vapor retarder, 4 in. base) were not retrieved.
- Radon: IRC Appendix AF (radon-resistant construction, required in EPA Zone 1 counties where adopted) and the EPA radon zone map were not retrieved.
- Termites: IRC Figure R301.2(7) termite infestation probability and R318 protection were not retrieved.
- Anchor-bolt rules (unverified, R403.1.6: 1/2 in. bolts at 6 ft o.c., within 12 in. of plate ends, 7 in. embedment) were not retrieved.

## 5. Roofs: pitch by material, overhangs, valleys and complexity, attic ventilation, unvented attics, ice dams, gutters

### Takeaway
Asphalt shingles need at least 2:12, with double/low-slope underlayment from 2:12 up to 4:12. Vented attics need 1 sq ft net free vent area per 150 sq ft of attic floor, reducible to 1/300 with 40–50% of the vent area high and the rest low. Unvented attics (R806.5) need the entire assembly inside the thermal envelope plus air-impermeable insulation at or above Table R806.5 minimums (2021: R-5 in CZ 1–3, R-10 in 4C, R-15 in 4A/4B, R-20 in CZ5, R-25 in CZ6, R-30 in CZ7, R-35 in CZ8). Simple gable or hip roofs at or below about 6:12 with few valleys and dormers are the low-cost default.

### Cited Findings
- **Asphalt shingle slope (R905.2.2).** Shingles "shall be used only on roof slopes of two units vertical in 12 units horizontal (2:12) or greater." Slopes from 2:12 to 4:12 require double (low-slope) underlayment. Sources disagree whether exactly 4:12 needs double layers; one local guide says at 4:12 or greater a single layer suffices. The 2021 IRC kept the 2:12 minimum and the 4:12 threshold. — [Hopkins MN Asphalt Shingles (R905.2)](https://hopkinsmn.com/615/Asphalt-Shingles-R9052); [Seattle 2012 SRC Ch. 9](https://seattle.gov/documents/departments/sdci/codes/seattleresidentialcode/2012srcchapter9.pdf); [Conejos County CO re-roofing guide](https://conejoscounty.colorado.gov/sites/conejoscounty/files/documents/2018%20Building%20Guide%20SFR-ReRoofing.pdf); [Jaspector roof slope asphalt shingles IRC 2018](https://www.jaspector.com/codes/irc-2018/ch09-roof-assemblies/roof-slope-asphalt-shingles-code-irc-2018/)
- A roofing consultant does not recommend asphalt shingles at 2:12 or 3:12, despite code allowing them. — [RoofObservations: minimum pitch for asphalt shingles](https://roofobservations.com/minimum-roof-pitch-for-asphalt-shingles/)
- **Attic ventilation (R806.2).** 1 sq ft of net free ventilating area per 150 sq ft of vented space by default. This may be reduced to 1/300 when 40–50% of the required ventilation is located high in the attic and the balance low. Older editions also allowed 1/300 with a Class I/II (at most 1 perm) vapor retarder on the warm side of the ceiling. — [IIBEC Attic Ventilation 101](https://iibec.org/attic-ventilation-101/); [GBA: A crash course in roof venting](https://www.greenbuildingadvisor.com/article/a-crash-course-in-roof-venting); [ICC BCAC IRC R806 proposal](https://iccsafe.org/wp-content/uploads/bcac/IRC-R806.pdf); [DOE BASC: Calculating attic passive ventilation](https://basc.pnnl.gov/information/calculating-attic-passive-ventilation)
- **Unvented attic conditions (R806.5, 2015+).** The assembly must lie entirely within the building thermal envelope with a continuous air-control layer. Newer editions allow vapor diffusion ports (defined in R202) as an alternative path. — [GBA 2015 IRC R806.5 PDF](https://images.greenbuildingadvisor.com/app/uploads/2018/10/06131742/2015-IRC-R806.5.pdf); [DOE BASC: Controlling moisture in unvented attics](https://basc.pnnl.gov/code-compliance/controlling-moisture-unvented-attics-code-compliance-brief); [BSC vapor diffusion ports (GBA-hosted)](https://images.greenbuildingadvisor.com/app/uploads/2022/05/14005807/1718_1652504286_Vapor-Diffusion-Ports-BSC.pdf)
- **Table R806.5 (2021 IRC), minimum air-impermeable or rigid insulation above or directly under the roof deck for condensation control.**

  | Climate zone | Minimum R-value |
  |---|---|
  | 2B, 3B (tile roofs) | none |
  | 1, 2A, 2B, 3A, 3B, 3C | R-5 |
  | 4C | R-10 |
  | 4A, 4B | R-15 |
  | 5 | R-20 |
  | 6 | R-25 |
  | 7 | R-30 |
  | 8 | R-35 |

  A Duluth MN handout confirms CZ7 = R-30. PNNL advises keeping air-impermeable insulation at 50% or more of total roof R-value in cold climates. — [GBA-hosted IRC Ch. 8 PDF](https://images.greenbuildingadvisor.com/app/uploads/2022/02/02234723/CHAPTER_8_ROOF-CEILING_CONSTRUCTION-1.pdf); [Duluth unvented attic handout](https://duluthmn.gov/media/imyaalov/handout-residential-unvented-attic-assemblies-164.pdf); [DOE BASC Unvented attic insulation](https://basc.pnnl.gov/resource-guides/unvented-attic-insulation); [Insulation Institute BI509 Unvented Roofs](https://insulationinstitute.org/wp-content/uploads/2026/05/BI509-Unvented-Roofs-for-Conditioned-Attics-Solutions-That-Work.pdf)
- Vented vs. unvented attic trade-offs. — [DOE BASC Vented versus unvented attic](https://basc.pnnl.gov/resource-guides/vented-versus-unvented-attic); [Asphalt Roofing Manufacturers Association ventilation white paper (Sept 2025)](https://www.asphaltroofing.org/wp-content/uploads/2025/09/Ventilation-White-Paper-20250903-Revised-FINAL.pdf)
- **Roof cost.** Complex rooflines with multiple peaks, valleys and dormers carry higher material and labor costs. One builder recommends simple roof forms with pitches not exceeding 6:12. Houseplans.com cites "few roof cuts, lower roof pitches, and fewer offsets" as what makes houses easy to build. — [Architectural Designs: 8 ways to reduce cost](https://www.architecturaldesigns.com/blog/8-ways-to-reduce-the-cost-to-build-your-new-home); [Houseplans: What makes a house easy to build](https://www.houseplans.com/blog/what-makes-a-house-easy-to-build)

### Inferences
- Modeling rules:
  - Default pitched roofs to 4:12–8:12 for asphalt shingles (at or above 4:12 avoids low-slope underlayment detailing).
  - Never model shingles below 2:12; use membranes or standing-seam metal for low slopes.
  - Prefer one main gable or hip ridge running the long axis.
  - Each valley, dormer, cricket or intersecting ridge is a leak-risk and cost item; keep them few and deliberate.
- Rule: if ducts or air handlers are in the attic, prefer an unvented (conditioned) attic per R806.5, or move the ducts into the conditioned space below (see Q8). If the attic stays vented, model soffit (low) and ridge (high) vents in a roughly 50/50 split at 1/300, plus baffles keeping vent channels open at the eaves.
- Rule: complex roofs with hips, valleys and cathedral sections are much harder to vent. Cathedral ceilings need either a vent channel per rafter bay or an unvented assembly with the Table R806.5 rigid/air-impermeable layer, so the roof form should be chosen with the ventilation strategy in mind.

### Gaps
- Metal roofing slopes (R905.10.2) were not verified because the search budget was exhausted. Unverified, from training knowledge: 3:12 minimum for lapped, nonsoldered-seam metal panels without sealant; 1/2:12 with applied sealant; 1/4:12 for standing-seam panels. Verify.
- Low-slope membranes (R905.9 BUR, R905.11 modified bitumen, R905.12/13 thermoset/thermoplastic) were not verified. Unverified, from training knowledge: 1/4:12 minimum slope (1/8:12 for coal-tar BUR). Verify.
- Overhang depths and their wall-wetting benefits (BSC/Lstiburek; rule-of-thumb 12–24 in.) were not searched.
- Ice dams (air-sealing the ceiling plane, R-value at eaves, ice barrier underlayment required where there is a history of ice forming, typically extending 24 in. inside the exterior wall line per R905.1.2) were not searched.
- Gutter and downspout sizing and the R801.3 roof drainage requirement were not searched.
- Unverified, from training knowledge: R806.3 requires a 1-in. minimum air space between insulation and roof sheathing at vents; vents within 3 ft of the ridge count as "high." Verify.

## 6. Building envelope and building science: four control layers, WRB and flashing, continuous insulation, thermal bridging, air sealing targets, vapor retarder classes, rainscreens, capillary breaks, the "perfect wall"

### Takeaway
Lstiburek's "perfect wall" puts the water, air and vapor control layers on the outside face of the structure, with insulation outside that and cladding outermost. The same logic is applied to roofs ("the perfect wall leaned over") and slabs. The control functions in order of importance are water, air, vapor, then thermal. Code targets: 2021 IECC air leakage of 3.0 ACH50 in CZ 3–8 and 5.0 ACH50 in CZ 0–2. Interior Class I/II vapor retarders are required in CZ 5–8 and Marine 4, unless Class III is allowed via vented cladding or continuous exterior insulation (R702.7). Windows must be fully flashed with a sloped or back-dammed sill pan and shingle-lapped WRB.

### Cited Findings
- **The four control layers.** Water (bulk rain), air, vapor and thermal, listed in order of importance with rain control first. The perfect wall sequence is structure, then a control-layer membrane (water/air/vapor), then insulation, then cladding. The perfect roof is "the perfect wall leaned over," and the same logic applies to slabs. — [BSC Insight BSI-001 Perfect Wall (PNNL-hosted)](https://basc.pnnl.gov/library/perfect-wall-bsi-001); [BSC "Insulate America" presentation](https://buildingscience.com/sites/default/files/presentation-docs/insulate_america_c.pdf); [GBA: The perfect wall, roof and slab podcast](https://greenbuildingadvisor.com/article/the-perfect-wall-roof-and-slab-building-science-podcast); [Energy Vanguard: Combobulating the perfect wall](https://energyvanguard.com/blog/combobulating-the-perfect-wall-the-basics-of-control-layers)
- The "institutional perfect wall" (BSC graphic hosted by DOE BASC) works in all climate zones for water, air, vapor and thermal control. — [DOE BASC image: institutional perfect wall](https://basc.pnnl.gov/images/institutional-perfect-wall-works-all-climate-zones-water-air-vapor-and-thermal-control)
- Envelope flaws concentrate at connections, especially windows, which must control water, air, heat and vapor. Codes emphasize thermal control because it is easiest to specify and measure. — [BSC "History of the Perfect Wall" (Lstiburek, 2026)](https://www.buildingscience.com/sites/default/files/2026-08/15%20-%20Joe%20Lstiburek%20The%20History%20of%20the%20Perfect%20Wall%E2%80%A6%E2%80%A6.pdf); [BSC presentation](https://buildingscience.com/sites/default/files/presentation-docs/insulate_america_c.pdf)
- **Air leakage (2021 IECC R402.4.1.2).** Maximum 5.0 ACH50 in CZ 0, 1 and 2; 3.0 ACH50 in CZ 3–8. An ICC source also quotes a backstop for any compliance path of 5.0 ACH50 and 0.28 cfm/sq ft. A Minnesota proposal sought 2.0 ACH50 for CZ 3–8, and an Austin summary says CZ 2 dropped to 4 ACH50; neither was confirmed as final 2024 IECC text. — [ICC BSJ: Significant changes to air leakage in the 2021 IECC](https://www.iccsafe.org/building-safety-journal/bsj-technical/significant-changes-to-air-leakage-in-the-2021-international-energy-conservation-code/); [ICC IECC Residential CAR update](https://www.iccsafe.org/wp-content/uploads/IECC-RES-CAR-update-72622.pdf); [Minnesota DLI residential code TAG handout](https://www.dli.mn.gov/sites/default/files/pdf/020524-res-code-TAG-handout.pdf); [RESNET: What to Expect in the 2024 IECC](https://www.resnet.us/wp-content/uploads/What-to-Expect-in-the-2024-IECC.pdf); [DOE 2024 IECC Determination TSD](https://www.energycodes.gov/sites/default/files/2024-12/2024_IECC_Determination_TSD.pdf)
- **Vapor retarders (R702.7).**
  - Class I or II vapor retarders are required on the interior side of frame walls in CZ 5, 6, 7, 8 and Marine 4.
  - Class I is 0.1 perm or less; Class II is over 0.1 up to 1.0 perm; Class III is over 1.0 up to 10 perm (e.g., latex paint on drywall).
  - Class III is permitted where the table's conditions are met, such as vented cladding or continuous exterior insulation.
  - Class I is discouraged where it would create a double vapor barrier. A non-responsive Class I interior retarder combined with Class I exterior insulation requires an approved design.
  - Per the Insulation Institute (2021/2024 IRC), minimum exterior continuous insulation to allow Class III is R-2.5 over 2x4 / R-3.75 over 2x6 in Marine 4, and R-12.5 over 2x4 / R-20 over 2x6 in CZ 8. The 2015 IRC values were R-7.5 / R-11.25 in Marine 4 and R-10 over 2x4 in CZ 7–8. The tables changed between editions.

  — [ICC TechNote TN06 Vapor Retarders](https://www.iccsafe.org/wp-content/uploads/proclamations/TN06-Vapor-Retarders_pdf.pdf); [Insulation Institute: Vapor Retarders](https://insulationinstitute.org/vapor-retarders/); [JLC: Vapor control in walls with continuous insulation](https://www.jlconline.com/how-to/insulation/vapor-control-in-walls-with-continuous-insulation_o); [GBA: Vapor retarders](https://greenbuildingadvisor.com/article/vapor-retarders)
- **Window flashing sequence (DOE Building America / BASC).**
  1. Cut an "I" (modified I) in the housewrap over the rough opening.
  2. Install a back dam and self-adhesive sill flashing; tape the corners. A site-made sill pan without a back dam must slope to the exterior.
  3. Caulk the outside edges of the head and side jambs, but do not caulk across the sill. Set the window.
  4. Flash the jambs, then the head, with head flashing over the jamb flashing.
  5. Upper WRB layers lap lower layers by at least 6 in.
  6. Air-seal the window-to-rough-opening gap from the interior with backer rod or non-expanding foam and caulk.

  — [DOE BASC: Fully flashed window and door openings](https://basc.pnnl.gov/resource-guides/fully-flashed-window-and-door-openings); [DOE Building America window flashing PDF](https://www1.eere.energy.gov/buildings/publications/pdfs/building_america/window_flashing.pdf); [DOE Building America Water Management Guide](https://www1.eere.energy.gov/buildings/publications/pdfs/building_america/water_management_residential.pdf); [JLC: Best practices for window flashing](https://www.jlconline.com/how-to/exteriors/best-practices-for-window-flashing/); [ICC TN05 Window and Door Flashing](https://conejoscounty.colorado.gov/sites/conejoscounty/files/TN05-Window-and-Door-Flashing_pdf.pdf)
- **Window-to-floor/wall area.** The Phius CORE prescriptive path limits window-to-wall ratio to 18% or less and skylights to 3% or less of roof area. DOE ZERH prescriptive-path homes with window-to-floor-area ratio over 15% must meet additional requirements. — [GBA: Passive House 2021 streamlined prescriptive path](https://greenbuildingadvisor.com/article/passive-house-2021-now-offers-a-streamlined-prescriptive-path-to-certification); [Phius CORE Prescriptive 2021 Reference Tables](https://www.phius.org/sites/default/files/2022-04/Phius%20CORE%20Prescriptive%202021%20-%20Reference%20Tables.pdf); [DOE BASC: ZERH window requirements](https://basc.pnnl.gov/information/doe-zero-energy-ready-home-window-requirements)

### Inferences
- Modeling rules for every exterior assembly (walls, roof, slab or crawl), with the AI labeling each layer:
  1. Water control: WRB, or roofing underlayment, or sub-slab polyethylene plus capillary-break gravel.
  2. Air control: a named continuous plane, e.g., taped sheathing or drywall, traced unbroken from slab to wall to roof.
  3. Vapor control: chosen by climate zone per R702.7.
  4. Thermal control: cavity insulation plus continuous insulation where required.

  Flag any discontinuity at floor rims, top plates, kneewalls, cantilevers, bay windows and wall-to-roof intersections as an air-barrier risk.
- Rule: in CZ 5–8 and Marine 4, either specify an interior Class I/II retarder (kraft or smart membrane) or provide exterior continuous insulation at or above the R702.7 minimum for the edition. Never pair poly on the interior with foil-faced foam on the exterior without an approved design.
- Rule: every window and door in the model carries a "fully flashed" detail flag: sloped or back-dammed sill pan, shingle-lapped jamb and head flashing, WRB lapped at least 6 in., interior air seal.
- Rule: target 3.0 ACH50 or less (CZ 3–8) or 5.0 or less (CZ 0–2) as the code floor. For high-performance targets, use ZERH or Phius as the stretch benchmark (see Gaps).
- Rule: keep glazing at or below 15–18% of wall or floor area as a starting point unless energy modeling justifies more. Above 15% window-to-floor area, ZERH prescriptive adds requirements, and Phius prescriptive caps window-to-wall ratio at 18%.

### Gaps
- Rainscreen gap dimensions (BSC typically recommends a 3/8 in. or larger drained and vented cavity behind claddings like stucco, fiber cement or wood; R703.7.3 stucco drainage requirements) were not retrieved.
- Continuous-insulation R-value tables (IECC Table R402.1.3, e.g., R-20+5 or R-13+10 walls in CZ 6–8) were not retrieved.
- Thermal bridging quantification (framing factor ~25% for 16-in. o.c. vs. lower for advanced framing) was not retrieved.
- Capillary-break details (gravel under slab, sill gasket, coating on footing top) were not retrieved.
- The final 2024 IECC ACH50 values were not confirmed. Unverified, from training knowledge: the 2024 IECC kept 5.0 ACH50 (CZ 0–2) and 3.0 ACH50 (CZ 3–8), added an option to express leakage in cfm50 per sq ft of enclosure, and set a 5.0 ACH50 / 0.28 cfm50/sf backstop for performance/ERI paths. Verify.
- Phius and ZERH whole-house air-tightness targets (e.g., Phius CORE 0.06 cfm50/sf of envelope) were not retrieved.

## 7. Climate-responsive and passive design: orientation, overhang sizing, window-to-wall ratio, cross ventilation, thermal mass, PHIUS reference

### Takeaway
Size south overhangs to fully shade south glass at the summer solstice and admit full sun at the winter solstice, using a sun-angle calculation or overhang tool for the site latitude. No single DOE formula exists. Overhangs lose effectiveness quickly beyond about 30° off true south. Phius CORE prescriptive caps window-to-wall ratio at 18% and skylights at 3%, which is a useful upper bound for an envelope-first design.

### Cited Findings
- DOE passive-solar guidance: "Size south-facing overhangs to shade windows in summer and allow solar gain in winter." The method draws the summer sun angle upward from the bottom of the glazing on a scaled wall section. — [NREL/DOE Passive Solar Design for the Home (NREL 29236)](https://www.nrel.gov/docs/fy01osti/29236.pdf); [DOE-derived sheet on SlideShare](https://www.slideshare.net/prabhats3/29236)
- Common approach: size overhangs to fully shade south windows on the summer solstice (June 21) and admit full sun on the winter solstice (December 21). — [GBA: Cost-effective passive solar design](https://greenbuildingadvisor.com/article/cost-effective-passive-solar-design)
- "There is as yet no universally simple formula for sizing overhangs." Latitude, climate, solar transmittance, illuminance and window size all matter. Beyond about 30° off true south, overhang effectiveness "begins to decrease significantly." — [InspectAPedia: Passive solar overhangs](https://inspectapedia.com/Solar/Passive_Solar_Overhangs.php); [MIL-HDBK-1003/19 (tpub)](https://ufgscriteria.tpub.com/3_440_03/3_440_030041.htm)
- DOE-funded analyses give overhang design formulas as functions of window height, latitude and solar altitude, with worked examples at 36°N. — [OSTI: Summer heat-gain control in passive-solar buildings: fixed horizontal overhangs](https://www.osti.gov/biblio/6050675); [OSTI: Roof overhang design for solar control](https://www.osti.gov/biblio/5578965)
- Roofs and skylights receive much more midsummer solar radiation per square foot than vertical walls, which argues against large unshaded skylights. — [DOE BASC image: midsummer roof and skylight radiation](https://basc.pnnl.gov/images/midsummer-roof-and-skylights-will-receive-much-more-solar-radiation-square-foot-unshaded)
- Phius prescriptive window-to-wall ratio at most 18%, skylights at most 3% of roof area. — [GBA: Passive House 2021 prescriptive path](https://greenbuildingadvisor.com/article/passive-house-2021-now-offers-a-streamlined-prescriptive-path-to-certification)
- Phius certification guidebooks (v3.2, v24.1.1) and DOE's climate-specific passive building guide are the reference documents for passive building targets. — [Phius Certification Guidebook v24.1.1](https://phius.org/sites/default/files/2024-09/Phius%20Certification%20Guidebook%20v24.1.1%20%281%29.pdf); [DOE Building America: Climate-specific passive building](https://www1.eere.energy.gov/buildings/publications/pdfs/building_america/climate-specific-passive-building.pdf); [DOE: Phius information](https://www.energy.gov/eere/buildings/articles/phius-information)
- A compact form factor (fewer corners, junctions and projections) also reduces air-leakage points, which is why Passive House favors it. — [Homebuilding.co.uk: Form factor](https://www.homebuilding.co.uk/self-build/form-factor)

### Inferences
- Solar geometry (standard formulas; my inference, not from a cited source here):
  - Noon solar altitude is 90° − latitude + 23.45° at the summer solstice and 90° − latitude − 23.45° at the winter solstice. At 40°N that is about 73.5° summer and 26.5° winter.
  - The overhang projection that fully shades a window of height H, whose top sits a gap G below the overhang, at noon on the summer solstice is P ≈ (H + G) / tan(summer altitude). At 40°N with H + G = 6 ft, P ≈ 1.8 ft.
  - The same overhang shades only about 0.9 ft down from the soffit at the winter solstice, so winter sun is admitted.
  - Have the modeling AI compute this per site latitude rather than hard-coding a depth.
- Modeling rules:
  - Orient the long axis of the house within about ±15–30° of east–west so the largest glazing faces south.
  - Minimize east and west glass, which is hard to shade with overhangs.
  - Put fixed horizontal overhangs on south glazing sized from solar geometry.
  - Use vertical fins, deep porches or exterior shading on east/west glass.
- Rule: keep total glazing near or below 15–18% of wall area as a default; increase only with energy modeling.

### Gaps
- No sourced guidance was retrieved on cross-ventilation rules of thumb (e.g., opening area ratios, plan depth limits for single-sided vs. cross ventilation) or on thermal-mass sizing ratios (e.g., the south-glass-to-floor-area ratio of about 7–12% commonly quoted in DOE/NREL passive solar literature; unverified).
- Phius CORE/ZERO numeric criteria (heating/cooling demand limits, airtightness) were not retrieved.

## 8. MEP planning rules of thumb that affect layout

### Takeaway
Layout should give a compact core: wet rooms stacked and back-to-back, a central water heater keeping hot-water piping volume small (ZERH: at most 0.5 gal between source and any fixture), and all ducts inside conditioned space (a ZERH requirement). Electrical panels need a clear working space 30 in. wide (or equipment width), 3 ft deep (minimum for typical residential voltage) and 6-1/2 ft high (NEC 110.26). Dryer ducts are limited to 35 ft equivalent length, minus 5 ft per 90° elbow and 2.5 ft per 45° elbow (IRC M1502.4.5.1).

### Cited Findings
- **Ducts.** DOE Zero Energy Ready Home requires all ductwork inside conditioned space, which builders call the biggest design difference from ENERGY STAR. Options include ducts in an unvented attic or conditioned crawlspace, or buried in attic insulation. Smaller compact duct systems are easier to locate inside the envelope. A Building America case used a heat-pump air handler in a mechanical closet inside conditioned space. — [Pro Builder: ZERH requires all ductwork in conditioned space](https://www.probuilder.com/construction/codes-standards/article/55214430/zero-energy-ready-home-requires-all-ductwork-to-be-in-conditioned-space); [DOE BASC: Compact air distribution](https://basc.pnnl.gov/resource-guides/compact-air-distribution); [DOE Building America: compact buried ducts, hot-humid](https://www.energy.gov/eere/buildings/articles/building-america-solutions-new-homes-case-study-compact-buried-ducts-hot); [DOE: Integration of HVAC system design with simplified duct distribution](https://www.energy.gov/eere/buildings/articles/integration-hvac-system-design-simplified-duct-distribution-building)
- **Hot water.** ZERH limits stored water in piping and manifolds between the hot-water source and any fixture to 0.5 gallons, and allows demand-controlled recirculation. — [DOE ZERH V2 National Program Requirements (Dec 2022)](https://www.energy.gov/sites/default/files/2022-12/DOE%20ZERH%20V2%20National%20Program%20Requirements%20-%20DEC%202022.pdf); [DOE BASC: Demand plumbing](https://basc.pnnl.gov/resource-guides/demand-plumbing)
- Core plumbing strategy: position hot-water fixtures near a centrally located water heater; home-run PEX manifolds are one method. — [DOE BASC: Core and manifold plumbing](https://basc.pnnl.gov/resource-guides/core-and-manifold-plumbing)
- A heat-pump water heater in conditioned space can increase space-conditioning load by cooling the surrounding air, so placement matters. — [PNNL: HPWH and space conditioning interaction (July 2014)](https://rpsc.energy.gov/sites/default/files/tech-resource/attachment/PNNL_HPWH_SpaceConditioning_July-2014.pdf); [GBA: Lessons from Asheville's first ZERH](https://greenbuildingadvisor.com/article/lessons-from-ashevilles-first-zero-energy-ready-home)
- **Electrical panel working space (NEC 110.26).**
  - Depth per Table 110.26(A)(1), measured from the enclosure front: 3 ft minimum for typical residential conditions, up to 5 ft at higher voltage or exposure conditions.
  - Width: 30 in. or the equipment width, whichever is greater.
  - Height: 6-1/2 ft or the equipment height, whichever is greater.
  - Sources cite a 90° equipment-door rule and require that open equipment doors not impede access to or exit from the working space (cited as 110.26(C)(3)). The exact subsection for the 90° opening was not confirmed.
  - Exception: in existing dwelling units, service equipment or panelboards of 200 A or less may have headroom under 6-1/2 ft.

  — [IAEI: Working space requirements for electrical panelboards](https://iaeimagazine.org/issue/july-august-2020/working-space-requirements-for-electrical-panelboards/); [EC&M: Adequate workspace keeps electricians safe](https://www.ecmweb.com/code-basics/adequate-workspace-keeps-electricians-safe); [IAEI: Electrical room basics](https://iaeimagazine.org/columns/nfpa-code-talk/electrical-room-basics/); [InspectAPedia NEC 110.26 PDF](https://inspectapedia.com/electric/US-NEC-110.26-Electrical-Panel_Working-Space.pdf)
- **Dryer exhaust (IRC M1502.4.5.1, "specified length" method, 2018+; M1502.4.4.1 in older editions).**
  - Maximum 35 ft from the transition-duct connection to the outlet terminal; the transition duct is not counted.
  - Deduct 5 ft per 4-in.-radius mitered 90° elbow and 2.5 ft per 45° elbow. Example: two 90° elbows leave 25 ft of straight duct.
  - Alternatively, use the manufacturer's instructions or a listed booster fan.
  - Where equivalent length exceeds 35 ft, a permanent label is required within 6 ft of the duct connection.

  — [Jaspector: IRC 2021 dryer vent length limit](https://www.jaspector.com/codes/irc-2021/ch15-exhaust-systems/dryer-vent-length-limit/); [InspectAPedia: Clothes dryer vent code IRC](https://inspectapedia.com/Appliances/Clothes-Dryer-Vent-Code-IRC.pdf); [Columbus OH CIC-14 dryer exhaust (2026)](https://www.columbus.gov/files/sharedassets/city/v/2/building-and-zoning/cics/cic-14-domestic-clothes-dryer-exhaust-2026.pdf); [DOE BASC: Proper clothes dryer venting](https://basc.pnnl.gov/resource-guides/proper-clothes-dryer-venting); [Open Exam Prep: dryer exhaust](https://open-exam-prep.com/study-guides/icc-residential-mechanical/exhaust-ventilation-systems/dryer-exhaust)

### Inferences
- Modeling rules:
  - Stack second-floor bathrooms directly over first-floor bathrooms, kitchen or laundry. Put back-to-back wet rooms on a shared plumbing wall; make that wall 2x6 (or furred) to carry a 3-in. drain/vent stack.
  - Locate the water heater centrally so the longest hot-water run stays short enough to meet the ZERH 0.5-gal limit. Roughly, 1/2-in. PEX holds about 0.01 gal/ft, so tens of feet; the exact volume per foot was not sourced.
  - Place the laundry on an exterior wall so the dryer duct runs well under 35 ft with at most 1–2 elbows.
  - Keep the main panel on an exterior or garage wall, with a 30 in. wide × 36 in. deep × 6.5 ft high clear zone in front. Not in bathrooms, closets or over stairs (see Gaps).
- Rule: give the HVAC system an interior mechanical closet or room inside the thermal envelope. Route ducts in dropped soffits, open-web floor trusses or interior chases, not in vented attics or vented crawlspaces. Floor trusses or a dropped hallway ceiling can carry trunk lines between floors.
- Rule: reserve a vertical chase, at least about 2 × 3 ft (rule of thumb, unsourced), in a closet stack for supply and return trunks in two-story houses.

### Gaps
- NEC 240.24 (unverified, from training knowledge: overcurrent devices not located in clothes closets (240.24(D)), bathrooms (240.24(E)) or over the steps of a stairway (240.24(F))) was not confirmed. NEC 2023 is the current edition; the NEC 2026 edition status was not checked.
- Mechanical room sizing rules of thumb (e.g., furnace/air handler plus water heater closet sizes, the 30-in. working space in front of appliances per IRC M1305.1) were not retrieved.
- Water heater location rules (garage elevation 18 in. for ignition sources, pan and drain where leakage would cause damage, IRC M2005/P2801) were not retrieved.
- Plumbing vent and fixture clearance minimums (e.g., 15 in. from toilet centerline to side wall, 21 in. clear in front, IRC P2705/R307) were not retrieved; another researcher on room-level standards may cover these.

## 9. Lateral and hazard considerations: seismic design category, wind exposure and high-wind zones, when an engineer is required

### Takeaway
The IRC prescriptive wind provisions stop where wind design is required: ultimate design wind speed of 140 mph or more, or hurricane-prone regions at 130 mph or more south of the Virginia–North Carolina border. Those houses need engineered design or a referenced standard (WFCM, ICC 600). In SDC C (townhouses), D0, D1 and D2, irregular buildings require engineering of the irregular portions. Stories over 11'-7" and studs over 10 ft also exceed the basic prescriptive limits.

### Cited Findings
- The IRC's prescriptive wind provisions are not used where wind design is required, including hurricane-prone areas with design wind speeds of 130 mph or more south of the VA–NC border, and areas at 140 mph or more (R301.2.1.1). A topographic wind speed-up table (R301.2.1.5.1) can push a site over the threshold. — [FEMA 2018 IRC Compilation of Wind-Resistant Provisions](https://www.fema.gov/sites/default/files/2020-08/2018_IRC_Compliation_of_wind_resist_provisions_20191211.pdf); [FEMA 2021 IRC compilation](https://www.fema.gov/sites/default/files/documents/fema_international-residential-building-code_10152021.pdf); [2021 IRC Ch. 3 (ICC)](https://codes.iccsafe.org/content/IRC2021P2/chapter-3-building-planning)
- Seismic: SDC is assigned from IRC maps. Buildings in SDC E may be designed to SDC D2 requirements where the IBC would place them in SDC D. Irregular buildings in SDC C (townhouses) and D0–D2 need engineering of the irregular portions, and the entire building when there are multiple irregularities (see Q1). — [2018 IRC Ch. 3 (ICC)](https://codes.iccsafe.org/content/IRC2018P3/chapter-3-building-planning); [UpCodes Irregular Buildings](https://up.codes/s/irregular-buildings); [CED Engineering seismic course](https://www.cedengineering.com/userfiles/S08-007%20-%20Seismic%20Design%20and%20Construction%20of%20Dwellings%20and%20Townhouses%20-%20US.pdf)
- Story height above 11'-7" (wood framing) or studs above the Table R602.3(5) limit (10 ft) need R301.3 exceptions, Chapter 6 tall-wall provisions or engineering. — [Building Code Forum](https://www.thebuildingcodeforum.com/forum/threads/11-4-high-wood-frame-walls.34204/); [NAHB 2021 IRC changes](https://www.nahb.org/-/media/NAHB/advocacy/docs/top-priorities/codes/code-adoption/2021-signficant-code-changes-for-the-irc.pdf)
- Engineer needed when header spans exceed IRC tables or carry point loads. — [Jaspector header sizing](https://www.jaspector.com/codes/irc-2024/ch06-wall-construction/header-sizing-irc-2024/)

### Inferences
- "Engineer required" flags the modeling AI should raise:
  1. Site design wind speed of 140 mph or more, or 130 mph or more in a hurricane-prone region (coastal Gulf/Atlantic).
  2. SDC D0–D2 with any irregularity, especially stacked-wall offsets, cantilevers or tall cripple walls; any SDC E.
  3. More than three stories above grade plane, story height over 11'-7", or wall studs over 10 ft without a tall-wall table.
  4. Spans beyond IRC tables: beams, girders, LVL/glulam, steel; large headers; transfer beams.
  5. Point loads not carried directly to footings; post-and-beam or large open plans lacking braced wall lines.
  6. Foundations on soils below 1,500 psf, expansive soils, fill, or retaining conditions.
  7. Any concrete, steel, ICF or SIP system outside its prescriptive scope. ICF walls have IRC R404/R608 prescriptive tables but large openings need engineering; SIPs have limited IRC R610 provisions.
- Rule: in high-wind zones, model hip roofs (better than gables in wind), limit overhangs (uplift), use impact-rated or protected openings, and simplify plan shapes.

### Gaps
- The three-stories-above-grade-plane IRC scope limit (R101.2) and the SDC-based limits (e.g., SDC D2 limits on stories and on masonry veneer) were not confirmed by search; they are from training knowledge (IRC applies to detached one- and two-family dwellings and townhouses not more than three stories above grade plane). Verify.
- Wind exposure categories (B, C, D) and their effect on bracing amounts were not retrieved.
- The WFCM (AWC Wood Frame Construction Manual) and ICC 600 high-wind prescriptive standards were not retrieved.
- Notes on concrete, steel, SIP and ICF systems are inferences, not sourced.

## 10. Cost-efficient massing: simple rectangles, corner count, roof simplicity, stacking floors, standard spans

### Takeaway
Builder and building-science sources agree that a compact rectangle (near-cube), few corners and offsets, stacked exterior walls, a simple roof at or below about 6:12, and standard spans are the main levers on cost and energy. Quantified savings figures (10–20%) are vendor claims without data. Long clear spans in a simple box can erase some of the savings.

### Cited Findings
- Designs with fewer corners simplify the foundation and framing. Rectangular or square plans are cheapest. — [Architectural Designs: 8 ways to reduce cost](https://www.architecturaldesigns.com/blog/8-ways-to-reduce-the-cost-to-build-your-new-home); [Houseplans: What makes a house easy to build](https://www.houseplans.com/blog/what-makes-a-house-easy-to-build)
- "Once you turn the corners, it is very simple to build… few roof cuts, lower roof pitches, and fewer offsets." — [Houseplans blog](https://www.houseplans.com/blog/what-makes-a-house-easy-to-build)
- A four-corner foundation and stacked exterior walls are cost-efficiency measures in builder plan reviews. — [Pro Builder: 4 Detached Home Plans That Reduce Building Costs](https://www.probuilder.com/design/house-review/article/55198384/4-detached-home-plans-that-reduce-building-costs)
- A house shape "close to a cube" minimizes exterior surface area, heat loss and construction cost. The same thread cautions that "span is expensive." — [GBA Q&A: design elements for cost-effective, energy-efficient simple construction](https://greenbuildingadvisor.com/question/design-elements-for-cost-effective-energy-efficient-and-simple-construction)
- Every additional corner, roof junction, projection or level change adds materials, labor and complexity, and adds air-leakage points. — [Homebuilding.co.uk: Form factor](https://www.homebuilding.co.uk/self-build/form-factor)
- Claimed savings of 10–20% (or 10–18%) from simplified layouts are unsupported vendor figures. — [Coohom: reduce cost of a 1200 sq ft house](https://www.coohom.com/article/how-to-reduce-the-cost-of-building-a-1200-sq-ft-house-without-cutting-quality)
- Simple roof forms with pitches not exceeding 6:12 are recommended for cost. — [Architectural Designs](https://www.architecturaldesigns.com/blog/8-ways-to-reduce-the-cost-to-build-your-new-home)

### Inferences
- Massing rules for the modeling AI (rules of thumb):
  1. Start from a rectangle at a ratio of about 1:1.3 to 1:2, with depth of about 24–32 ft so floors can be framed in two standard joist spans over a central beam or bearing wall, or roof trusses can clear-span.
  2. Use 2-ft (ideally 4-ft) increments for overall dimensions.
  3. Count outside corners: 4 is ideal; each pair added (an L, bump-out or bay) is a deliberate cost decision.
  4. Prefer two-story stacked boxes over sprawling one-story plans for the same floor area. This gives less foundation and roof per square foot; it is an inference from the surface-area argument.
  5. Use one ridge direction, gable or hip, at 4:12–8:12, with few valleys and dormers.
  6. Align upper and lower exterior walls; avoid cantilevers and upper-floor setbacks.
  7. Keep spans within standard lumber, I-joist and truss ranges (Q2); use engineered beams only where the design benefit is clear.
- A cost-comparison heuristic the AI can compute: perimeter-to-floor-area ratio, i.e., wall area per square foot of floor. A 32×32 square has P/A = 0.125 ft⁻¹; a 16×64 rectangle with the same area has P/A = 0.156 ft⁻¹, about 25% more wall. This is my calculation, not sourced.

### Gaps
- No rigorous study (NAHB, RSMeans, Home Innovation Labs) quantifying cost per corner, per valley or per perimeter foot was found.
- No sourced data on cost differences between one- and two-story homes of equal area.
