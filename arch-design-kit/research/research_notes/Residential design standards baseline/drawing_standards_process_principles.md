# Architectural Drawing Standards, BIM Conventions, Design Process and Residential Design Principles (US, 2026)

*Method note: WebFetch was blocked by the session network policy for every external host tried (archtoolbox.com, academics.triton.edu, www.uh.edu), so all findings come from web-search result summaries, not full-page reads. Where a search summary drew on several pages at once, the citation names the cluster of pages it came from. Primary standards (NCS V7, BIMForum LOD 2025, CSI MasterFormat) are licensed or paywalled and were not read in full. Items marked UNVERIFIED in the Gaps sections come from general professional knowledge and need checking before the playbook adopts them as rules.*

## 1. US National CAD Standard (NCS): sheet identification, layer naming, drawing set organization

### Takeaway
The NCS combines the AIA CAD Layer Guidelines, the CSI Uniform Drawing System (UDS, Modules 1-8) and NIBS BIM material. It sets a three-part sheet ID, `{Discipline}{Sheet type}{Sequence}` (for example A-101), with sheet types 0-9, and hyphen-delimited layer names (`A-WALL`, `A-DOOR`, `A-GLAZ`, `A-ANNO-DIMS`). The current edition is NCS V7, released around 2024-2025 and described as mainly a reorganization. A V6-to-V7 changelog was not found.

### Cited Findings
**Edition and contents**
- NCS V7 combines the AIA CAD Layer Guidelines, the CSI Uniform Drawing System (Modules 1-8) and NIBS BIM material. Its sections are: Foreword and Administration; AIA CAD Layer Guidelines; Uniform Drawing System; BIM Implementation; Plotting Guidelines; Appendixes. — [NIBS NCS project page](https://nibs.org/projects/united-states-national-cad-standard-ncs/)
- NIBS called the V7 update "primarily a reorganization effort." The ballot comment period opened April 28, 2023, with a tentative summer-fall 2023 release. Later NIBS pages list the V7 web document as 2024, and a licensing page shows a September 2025 date with a different ISBN, so the official publication date is unclear. V7 is delivered online to licensees. — [NIBS ballot notice](https://nibs.org/united-states-national-cad-standard-ballot-comment-period-to-open-april-28/); [NIBS "Get involved in the update"](https://nibs.org/get-involved-in-the-update-of-the-united-states-national-cad-standard/); [NIBS NCS project page](https://nibs.org/projects/united-states-national-cad-standard-ncs/)

**Sheet identification**
- The sheet ID has three parts: discipline designator, sheet type designator and sequence number, for example A-101. A dash separates the discipline designator (one or two characters) from the number. An underscore may replace the hyphen where a file system does not allow hyphens. — [Archtoolbox: Construction document sheet numbers](https://archtoolbox.com/construction-document-sheet-numbers); [Linarc: Plan sheet numbers explained](https://linarc736569121986169715.freshdesk.com/support/solutions/articles/1060000090232-plan-sheet-numbers-explained); [Open Exam Prep ARE 17.2](https://open-exam-prep.com/study-guides/are/ch17-pdd-documentation-specifications/pdd-cross-referencing-revisions)
- Sources differ on the discipline designator. Some describe one or two characters; others describe a single letter at Level 1 and a two-letter Level 2 designator. — same sources as above
- Sheet type designators (one digit):
  - 0 General (symbols, legends, notes)
  - 1 Plans (horizontal views)
  - 2 Elevations (vertical views)
  - 3 Sections
  - 4 Large-Scale Views
  - 5 Details
  - 6 Schedules and Diagrams
  - 7 User Defined (Calgary adds: "for types that do not fall in other categories, including typical detail sheets")
  - 8 User Defined
  - 9 3D Representations (isometrics, perspectives, photographs)
  — [City of Calgary Sheet Type Designator PDF](https://www.calgary.ca/CS/IIS/Documents/CAD/Sheet%20Type%20Designator.pdf); [University of Houston CAD Standards Appendix B](https://www.uh.edu/facilities-planning-construction/vendor-resources/cad-standards/appendix-b---sheet-type.pdf); [Scribd copy of NCS V5 excerpt](https://www.scribd.com/document/690306452/National-CAD-Standards-V5)
- The sequence number is two digits and numbers the sheets within one discipline and sheet type. — [Archtoolbox](https://archtoolbox.com/construction-document-sheet-numbers); [Nobledesktop: sheet index pages](https://nobledesktop.com/learn/blueprint-reading/understanding-sheet-index-pages-and-document-organization-in-construction-drawings)

**Layer naming (AIA CAD Layer Guidelines, now part of the NCS)**
- Names follow a hyphen-delimited pattern: Discipline - Major Group - Minor Group (optional further minor group and status field). — [Triton College layer name list](https://academics.triton.edu/faculty/fheitzman/layname.html); [U. Oregon AIA CAD Layer Standards](https://pages.uoregon.edu/arch/landcad/Layer_Standards.htm); [NCS v5 AIA CAD Layer Guidelines PDF (Autodesk forum attachment)](https://forums.autodesk.com/autodesk/attachments/autodesk/66/350158/1/NCS_v5_AIA%20CAD%20Layer%20Guidelines.pdf)
- Example layers, from the same cluster of university and state layer standards (Triton, U. Oregon, USF, TTU, New Brunswick):
  - A-WALL: walls. Modifiers include A-WALL-PRHT (partial-height walls), A-WALL-MOVE (movable partitions), A-WALL-HEAD (door and window headers) and A-WALL-JAMB (door and window jambs).
  - A-DOOR: doors. Includes A-DOOR-FULL (full-height doors: swing and leaf) and A-DOOR-IDEN (door number, hardware group, etc.).
  - A-GLAZ: windows, window walls, curtain walls and glazed partitions, with sub-layers for full- and partial-height glazing and sills.
  - A-ANNO-DIMS: witness and extension lines, dimension terminators and dimension text.
  — [Triton](https://academics.triton.edu/faculty/fheitzman/layname.html); [USF AutoCAD layer guide](https://WWW.USF.EDU/administrative-services/documents/design-construction/guide-autocad-layers.pdf); [TTU eng_gs10101](https://www.depts.ttu.edu/EngineeringServices/CADD_GIS/Documents/eng_gs10101.pdf); [New Brunswick Layer Standards](https://www2.gnb.ca:443/content/dam/gnb/Departments/trans/pdf/en/DesignConstruction/LayerStandards.pdf)
- Layer colors and pen weights are not standardized across implementations. One university list makes A-DOOR blue and A-ANNO-DIMS magenta; a Canadian standard makes dimensions white. — [USF](https://WWW.USF.EDU/administrative-services/documents/design-construction/guide-autocad-layers.pdf); [New Brunswick](https://www2.gnb.ca:443/content/dam/gnb/Departments/trans/pdf/en/DesignConstruction/LayerStandards.pdf)
- At least one state standard follows "CAD Layer Guidelines, NCS 6.0 Edition" for layer naming. — [Maryland Aviation Administration 1D.1 Layer Development](https://public.airportal.maa.maryland.gov/PEGS/Volume_1_-_AIRPortal/Appendix_1D_CAD_Standards_Appendix/1D_1_Layer_Development.htm)

**Drawing set organization (UDS)**
- The UDS is "a system of specific guidelines for organizing, managing, and presenting construction drawings." Its modules include Drawing Set Organization, Sheet Organization, Schedules, Drafting Conventions and Symbols. — [City of Calgary sheet type PDF](https://www.calgary.ca/CS/IIS/Documents/CAD/Sheet%20Type%20Designator.pdf); [Fort Wayne CADD7 Symbols](https://cityoffortwayne.org/images/stories/Utilities/docs/CADD_Files/Design_S_M_CADD_Standards/CADD7_Symbols.pdf)

### Inferences
- A residential architectural set maps directly onto sheet types:
  - A-0xx general (cover, sheet index, abbreviations, symbols legend, general notes, code summary)
  - A-1xx plans (site and architectural site plan, foundation or basement, floor plans, roof plan, reflected ceiling plans)
  - A-2xx exterior elevations
  - A-3xx building and wall sections
  - A-4xx enlarged plans (kitchen, baths, stairs)
  - A-5xx details
  - A-6xx schedules (door, window, room finish)
  - A-9xx 3D views and renderings
  This follows the sheet-type table above; per-firm variation is common.
- An AI layer and object-naming scheme can reuse the AIA pattern for BIM categories, subcategories and filters even when no DWG is produced. A-WALL, A-DOOR and A-GLAZ give an unambiguous vocabulary for wall, door and glazing objects.
- Colors and pen assignments are office choices, not NCS requirements. The playbook should define its own pen table and should not claim that an NCS color exists.

### Gaps
- The full NCS discipline designator list and its order could not be retrieved; the search returned unrelated academic code lists. UNVERIFIED list from prior knowledge, in NCS/UDS order:
  - G General, H Hazardous Materials, V Survey/Mapping, B Geotechnical, W Civil Works
  - C Civil, L Landscape, S Structural, A Architectural, I Interiors, Q Equipment
  - F Fire Protection, P Plumbing, D Process, M Mechanical, E Electrical
  - W Distributed Energy, T Telecommunications, R Resource, X Other Disciplines
  - Z Contractor/Shop Drawings, O Operations
  Level 2 examples: AD Architectural Demolition, AE Architectural Elements, AF Architectural Finishes, AS Architectural Site, AI Architectural Interiors. Confirm against NCS V7 before adopting.
- UNVERIFIED (prior knowledge): the full names of the eight UDS modules are 01 Drawing Set Organization, 02 Sheet Organization, 03 Schedules, 04 Drafting Conventions, 05 Terms and Abbreviations, 06 Symbols, 07 Notations, 08 Code Conventions. Only five were confirmed, plus "Modules 1-8" from NIBS.
- UNVERIFIED layer details from prior knowledge of the AIA CAD Layer Guidelines:
  - Status field codes: N new, E existing to remain, D existing to demolish, F future, T temporary, M items to be moved, X not in contract.
  - Other common architectural layers: A-FLOR (floor information such as stairs, casework and millwork, with A-FLOR-OTLN for outline), A-CLNG (ceiling), A-ROOF, A-EQPM (equipment), A-FURN (furniture), A-AREA (area calculations), A-DETL, A-ELEV, A-SECT.
  - Annotation minor groups: -TEXT, -NOTE, -SYMB, -KEYN, -LEGN, -REVS, -TTLB, -NPLT, -IDEN.
  - Major and minor groups are four characters each.
- No V6-to-V7 technical changelog was found.

## 2. Drawing conventions: scales, line weights, dimensioning, symbols, title blocks, schedules

### Takeaway
In US residential practice, floor plans are drawn at 1/4"=1'-0" (exactly 1:48, the usual stand-in for 1:50) and overall or site views at 1/8"=1'-0" (1:96, roughly 1:100). Details are drawn at 1-1/2"=1'-0" (exactly 1:8, often paired with metric 1:10) and larger. Line weights follow a cut > seen > hatch hierarchy, usually 3-5 weights from the ISO 128 √2 series. Wood-frame plans are usually dimensioned to face of stud, with the convention stated on the sheet.

### Cited Findings
**Scales**
- 1/4"=1'-0" is 1:48, the usual counterpart of 1:50. 1/8"=1'-0" is 1:96, the usual counterpart of 1:100. The difference is about 4%, so a graphic scale bar should be included. — [LibreCAD Common Drawing Scales](https://librecad.readthedocs.io/en/latest/appx/scales.html); [SketchUcation forum](https://community.sketchucation.com/post/1339945)
- "Most house floor plans" use 1/4"=1'-0". — [Coohom (vendor blog)](https://www.coohom.com/article/how-to-choose-the-right-scale-for-a-floor-plan-drawing)
- 1-1/2"=1'-0" is exactly 1:8. Some sources pair it with metric 1:10 as the closest preferred metric scale. — [LibreCAD](https://librecad.readthedocs.io/en/latest/appx/scales.html); [The Designer's Assistant](https://thedesignersassistant.com/?p=433)
- ISO 5455 preferred metric scales include 1:50, 1:100 and 1:200. 1:20 and 1:10 are typical metric detail scales. — [Illustrarch: graphic scale](https://illustrarch.com/articles/76929-graphic-scale-architecture.html)

**Line weights**
- The conventional ISO 128-based pen series is 0.13, 0.18, 0.25, 0.35, 0.50, 0.70, 1.00 and 1.40 mm, each step about √2 larger than the last. One forum describes a 2x progression instead (0.13, 0.25, 0.5, 1.0). — [Studio Matrx: architectural lineweights explained](https://www.studiomatrx.org/students/drawing-fundamentals/architectural-lineweights-explained); [SketchUp forum](https://forums.sketchup.com/t/confused-why-pdf-lines-dont-print-or-are-feint/220659?page=2)
- One tier mapping: about 0.70 mm for primary cut elements (walls, slabs, columns); about 0.35 mm for seen elements (furniture, fittings, door leaves); 0.13-0.18 mm for hatching, surface pattern and texture. Section cut markers are at the heavy end, 1.00-1.40 mm. — [Studio Matrx](https://www.studiomatrx.org/students/drawing-fundamentals/architectural-lineweights-explained); [LearnArchitecture.net](https://learnarchitecture.net/articles/39292-architectural-line-weights.html)
- "A heavy ground line does more to make the drawing sit convincingly than any amount of surface detail" (sections and elevations). — [Studio Matrx](https://www.studiomatrx.org/students/drawing-fundamentals/architectural-lineweights-explained) / [Portico Architecture: line weights](https://portico-architecture.squarespace.com/journal//line-weight-for-architects)
- Line weights depend on scale. A 0.70 mm wall line that works at 1:20 "becomes a black smear at 1:200", so the whole set steps down as drawings get smaller, and fine lines are dropped rather than thinned. Most drawings need about 4-5 weights; five is a practical ceiling. — [Studio Matrx](https://www.studiomatrx.org/students/drawing-fundamentals/architectural-lineweights-explained); [LearnArchitecture.net](https://learnarchitecture.net/articles/39292-architectural-line-weights.html)
- Source quality: these sources are education blogs and course pages, not ISO 128 itself.

**Dimensioning**
- Wood frame: the exterior dimension's extension line falls on the outside face of studs. Partitions are dimensioned from the outside face of studs to the partition centerline, or alternatively to the face of the partition studs. "The important thing is to be consistent." — [US Navy Engineering Aid training manual (tpub), Fig. 10-14](https://tpub.com/engbas/10-11.htm); [Dimensioning a Floor Plan (tpub)](https://engineeringtraining.tpub.com/14069/css/Dimensioning-A-Floor-Plan-337.htm)
- Practitioners recommend a sheet note stating either "dimensions to face of framing" or "dimensions to face of finished surface". Face of stud is favored for new construction because it avoids arithmetic in the field. — [Fine Homebuilding forum: plan dimensions to stud or finish](https://finehomebuilding.com/forum/plan-dimensions-to-stud-or-finish); [Archinect forum: wall-to-wall dimensions](https://archinect.com/forum/thread/149896871/wall-to-wall-dimensions-on-a-floorplan); [AUGI forum](https://forums.augi.com/archive/index.php/t-59740.html)
- Masonry openings are dimensioned to the edges of the opening. — [tpub Dimensioning a Floor Plan](https://engineeringtraining.tpub.com/14069/css/Dimensioning-A-Floor-Plan-337.htm)
- AIA Best Practices: most floor plan dimensions should be to the nearest 1/2", on rare occasions to the nearest 1/4", "but never smaller". — [AIA Best Practices: The lost art of dimensioning (PDF)](https://www.aia.org/sites/default/files/2025-12/AIA_BestPractices_Thelostartofdimensioning.pdf)
- Every element of a floor plan should be locatable from two strings of dimensions, one in each direction. — same AIA/forum cluster as above, as summarized by search

**Symbols and title blocks**
- Symbol rules in municipal CAD standards follow NCS Symbols (UDS Module 6.0). The symbol set covers drawing block titles, graphic scales, north indicators, fixture and equipment identifiers, keynote identifiers and leaders. — [Fort Wayne CADD7 Symbols](https://cityoffortwayne.org/images/stories/Utilities/docs/CADD_Files/Design_S_M_CADD_Standards/CADD7_Symbols.pdf)
- The NCS-based symbol index lists:
  - a detail indicator drawn as a dashed rectangle, with 2.5 mm (3/32") text (symbol file 014200-021)
  - a small-condition detail indicator with a 45° arrow (014200-022)
  - a drawing block title (014200-026)
  — [Fort Wayne CUE Standard Symbols Index](https://utilities.cityoffortwayne.org/resources/pdfs/CUE_Standard_Symbols_Index.pdf)
- The A/E/C symbols guide lists elevation indicators by arrow direction (for example 014000-003), a section cut indicator (014000-007) and a detail indicator (014200-013). — [USACE/Tri-Service A/E/C WS 001 Symbols Guide](https://cadbimcenter.erdc.dren.mil/Downloads/CAD/AEC_Work_Structure/AEC_WS_001_Symbols_Guide.pdf)
- Course notes describe the section mark as a 1/2"-diameter circle with a reference (detail number over sheet number). "SCALE: AS NOTED" goes in the title block when a sheet mixes scales, and "N.T.S." marks a drawing that is not to scale. — [Drafting lecture notes (SlideShare)](https://www.slideshare.net/slideshow/lecture-notes-2-draftingpdf/258002963); [SFP architectural symbols and conventions](https://www.sfponline.org/Uploads/14/architecturalsymbolsandconventions.pdf)

### Inferences
- Default scale table for the AI playbook, derived from the findings above (metric equivalents exact where possible):

  | View | US scale | Exact ratio | Metric pair |
  |---|---|---|---|
  | Site plan | 1/8"=1'-0" or engineering 1"=10'/20' | 1:96, 1:120/1:240 | 1:100, 1:200 |
  | Floor, roof, RCP, elevations, building sections | 1/4"=1'-0" | 1:48 | 1:50 |
  | Enlarged plans, wall sections | 1/2"=1'-0" or 3/4"=1'-0" | 1:24, 1:16 | 1:20 |
  | Details | 1-1/2"=1'-0" or 3"=1'-0" | 1:8, 1:4 | 1:10, 1:5 |

  Always add a graphic scale bar, since 1:48 and 1:50 differ by about 4%.
- Line weight hierarchy rule: cut lines (heaviest) > profile and ground lines > seen/beyond > hatch/reference. Use 4-5 pens at 1/4" scale and step the set down at 1/8".
- Dimension string order: the most common logic places strings in rings from the wall outward, with openings and partitions nearest, then wall jogs or grid, then the overall dimension outermost. The sources above support this only indirectly, so treat it as general guidance.

### Gaps
- UNVERIFIED dimensioning practice (prior knowledge, common US residential practice): wood-frame windows and doors are dimensioned to the centerline of the rough opening; masonry openings to the edges. Dimension strings run from overall (outermost) to openings and partitions (innermost).
- UNVERIFIED symbol conventions (prior knowledge):
  - Door swings: a 90° arc in a light line, with the door leaf in a medium line.
  - Door tags: often keyed to the room number (for example 101A).
  - Window tags: often a hexagon or diamond containing the type letter.
  - Room tags: name plus number.
  - North arrow: on every plan.
  NCS UDS Module 6 defines the exact symbol geometry; it was not read.
- UNVERIFIED title block contents (prior knowledge): firm, project name and address, owner, sheet title, sheet number, project number, issue date, revision block, drawn/checked by, professional seal, scale. NCS sheet sizes: ARCH D 24"x36", ARCH E1 30"x42", ANSI D 22"x34", with half-size 11"x17" prints common.
- UNVERIFIED schedule columns (prior knowledge):
  - Door schedule: mark, width x height x thickness, type, material, frame, fire rating, hardware set, remarks.
  - Window schedule: mark, type, rough opening, unit size, manufacturer/model, U-factor/SHGC, egress compliance, remarks.
  - Room finish schedule: number, name, floor, base, walls by orientation, ceiling, ceiling height, remarks.
  UDS Module 3 defines schedule formats but was not retrieved.
- The ISO 128 line-weight text itself was not accessed.

## 3. BIM conventions: LOD, IFC entities and property sets, classification, ISO 19650

### Takeaway
The current BIMForum LOD Specification is the 2025 edition, updated annually. Part I (PDF) covers element geometry; Part II (spreadsheet) covers attributes. LOD 100-500 runs from placeholder to field-verified. LOD 350 adds interfaces with other systems, for coordination. In IFC, a house is an IfcProject > IfcSite > IfcBuilding > IfcBuildingStorey > IfcSpace tree built with IfcRelAggregates, and elements are placed with IfcRelContainedInSpatialStructure. Specs and elements are classified with MasterFormat (work results, 50 divisions 00-49), UniFormat (elements A-G and Z) and OmniClass (Tables 21, 22 and 23 map to these).

### Cited Findings
**LOD (BIMForum)**
- AIA E202 (2008) introduced five Levels of Development, LOD 100-500. BIMForum refined the AIA G202-2013 definitions for 100, 200, 300 and 400, and added LOD 350 for trade coordination. — [BD+C: Level of Development standard](https://www.bdcnetwork.com/level-development-will-new-standard-bring-clarity-bim-model-detail)
- Definitions:
  - LOD 100: the element may be represented by a symbol or other generic representation, but does not meet LOD 200.
  - LOD 200: a generic system or assembly with approximate quantity, size, shape, location and orientation.
  - LOD 300: a specific system or assembly with defined quantity, size, shape, location and orientation.
  - LOD 350: LOD 300 plus interfaces with other building systems.
  - LOD 400: a specific system, object or assembly "with detailing, fabrication, assembly, and installation information."
  - LOD 500: "a field-verified representation in terms of size, shape, location, quantity, and orientation." BIMForum first set LOD 500 aside; later editions include it as a fundamental definition (2.3.6 in the 2015 edition).
  — [BD+C](https://www.bdcnetwork.com/level-development-will-new-standard-bring-clarity-bim-model-detail); [BIMForum LOD 2014 reprint](https://bimforum.org/wp-content/uploads/2022/06/BIMForum_LOD_2014_reprint.pdf)
- Current edition: the BIMForum LOD page lists "LOD-Spec-2025-Part-I-Official.pdf" and "LOD-Spec-2025-Part-II-Official.xlsx", with 2024 files as earlier versions. The spec is updated annually; 2023 was the 10th-anniversary edition. — [BIMForum LOD page](https://bimforum.org/LOD/); [LOD Spec 2025 Part I PDF](https://bimforum.org/wp-content/uploads/2024/12/LOD-Spec-2025-Part-I-Official.pdf); [BIMForum 2023 LOD Spec](https://bimforum.org/2023-level-of-development-lod-specification/)
- Part I does not address non-geometric information, "because any number of attributes can be attached to an element at any LOD". Attributes go in the Part II spreadsheet. Licensing: Part I is CC BY-NC-ND 4.0; Part II is CC BY-NC 4.0. — [BIMForum 2023 LOD Spec](https://bimforum.org/2023-level-of-development-lod-specification/)

**IFC spatial structure and entities**
- The hierarchy, from top down, is IfcProject > IfcSite > IfcBuilding > IfcBuildingStorey > IfcSpace. IfcSite, IfcBuildingStorey and IfcSpace are optional. Each file has a single IfcProject root. — [NIBS IFC4x2 Spatial Structure template](https://www.nibs.org/files/docs/IFC4x2_Bridge/schema/templates/spatial-structure.htm); [OSArch wiki: IFC spatial tree](https://wiki.osarch.org/index.php/IFC_-_Industry_Foundation_Classes/IFC_spatial_tree)
- IfcRelAggregates builds the spatial tree, which "shall be acyclic". — [buildingSMART IFC4.3 Spatial Composition](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/concepts/Object_Composition/Aggregation/Spatial_Composition/content.html)
- IfcRelContainedInSpatialStructure places physical elements (walls, doors, columns) in a spatial element. It must not be used to include other spatial structure elements. An element can be contained in only one spatial structure; IfcRelReferencedInSpatialStructure handles multi-storey references. — [NIBS IFC4x2 IfcRelContainedInSpatialStructure](https://nibs.org/files/docs/IFC4x2_Bridge/schema/ifcproductextension/lexical/ifcrelcontainedinspatialstructure.htm); [OSArch wiki](https://wiki.osarch.org/index.php/IFC_-_Industry_Foundation_Classes/IFC_spatial_tree)
- Pset_WallCommon holds the common properties for all IfcWall occurrences: Reference, Status, AcousticRating, FireRating ("according to the national fire safety classification"), LoadBearing (IfcBoolean) and IsExternal (IfcBoolean; true when the element borders outside space, ground or water). The search summary flagged an extraction glitch on the IsExternal row, so verify it on the page. — [buildingSMART IFC4.3 Pset_WallCommon](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/Pset_WallCommon.htm); [IFC Tunnel 4.4 Pset_WallCommon](https://bsi-infraroom.github.io/IFC-Documentation-Tunnel/4_4_0_0/general/HTML/schema/ifcsharedbldgelements/pset/pset_wallcommon.htm)
- Companion common property sets exist for other house elements: [Pset_DoorCommon](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/Pset_DoorCommon.htm), [Pset_WindowCommon](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/Pset_WindowCommon.htm), [Pset_SlabCommon](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/Pset_SlabCommon.htm), [Pset_RoofCommon](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/Pset_RoofCommon.htm), [Pset_CoveringCommon](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/Pset_CoveringCommon.htm) and [IfcSpace](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/IfcSpace.htm). The current buildingSMART docs are IFC 4.3 (IFC4X3_ADD2), still labeled "under development" on the doc pages.

**Classification**
- MasterFormat (CSI and CSC), latest edition 2020, has 50 divisions numbered 00-49, some reserved. Division 00 covers Procurement and Contracting Requirements and Division 01 covers General Requirements (example: 01 22 00 Unit Prices). CSI no longer publishes the full list free. — [Wikipedia: MasterFormat](https://en.wikipedia.org/wiki/MasterFormat); [Procore: CSI MasterFormat](https://www.procore.com/library/csi-masterformat)
- UniFormat Level 1 groups:
  - A Substructure
  - B Shell
  - C Interiors
  - D Services
  - E Equipment and Furnishings
  - F Special Construction and Demolition
  - G Building Sitework
  - Z General
  Level 2 subdivides these into group elements (for example A10, B20). — [Wikipedia: UniFormat](https://en.wikipedia.org/wiki/UniFormat); [Archtoolbox: UniFormat](https://www.archtoolbox.com/practice/contract-documents/uniformat.html); [NIST IR 6389 UniFormat II](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6389.pdf)
- OmniClass Table 21 (Elements) is based on UniFormat, Table 22 (Work Results) on MasterFormat, and Table 23 (Products) on EPIC. Table 21 renumbers UniFormat and omits some UniFormat 2010 content. — [NBIMS-US V3 2.4 OmniClass Intro](https://www.nibs.org/files/pdfs/nbimsv3/NBIMS-US_V3_2.4_OmniClass_Intro.pdf); [NBIMS-US V3 OmniClass Table 21](https://www.nibs.org/files/pdfs/nbimsv3/NBIMS-US_V3_2.4.4.4_Omniclass_Table_21_Elements.pdf); [CSI: About OmniClass](https://www.csiresources.org/standards-omniclass-about)

**ISO 19650 (brief)**
- Information containers move through the CDE states Work in Progress > Shared > Published, plus Archived, with an agreed approval step at each transition. These states were carried over from BS 1192. — [UK BIM Framework Guidance Part C](https://www.ukbimframework.org/wp-content/uploads/2021/02/Guidance-Part-C_Facilitating-the-common-data-environment-workflow-and-technical-solutions_Edition-1.pdf); [HK DEVB ISO 19650 Terminologies](https://www.devb.gov.hk/filemanager/en/content_1287/Appendix%20I%20-%20ISO%2019650%20Terminologies%20(v2).pdf)
- The UK National Annex naming convention uses delimited fields Project - Originator - Volume/System - Level/Location - Type - Role - Number, with unique IDs and defined code lengths. The field structure comes from the national annex, not ISO 19650 itself. Containers also carry status/suitability, revision and classification metadata. — [CDBB National Annex guidance](https://www.cdbb.cam.ac.uk/files/national_annex_guidance.pdf); [NBS: Common Data Environments](https://www.thenbs.com/knowledge/common-data-environments)

### Inferences
- LOD by phase for a residential AI pipeline:
  - Schematic design: LOD 100-200 (massing, generic walls and slabs, approximate openings).
  - Design development: LOD 200-300 (specific wall types and thicknesses, sized doors and windows, stairs).
  - Construction documents: LOD 300 (defined assemblies, exact locations).
  - LOD 350/400 are rarely needed for single-family work except for trusses, fabrication or prefab.
  This is a common industry mapping, not a BIMForum rule; BIMForum does not tie LODs to phases.
- Minimum IFC export for a house: one IfcProject; IfcSite with georeference; one IfcBuilding; one IfcBuildingStorey per level (including foundation/basement and roof levels if used); an IfcSpace per room with name and number. Each IfcWall, IfcSlab, IfcRoof, IfcDoor, IfcWindow and IfcStair is contained in exactly one storey and carries the Pset_*Common properties (at minimum IsExternal, LoadBearing and FireRating where applicable).
- File naming can borrow the ISO 19650 field order, simplified for small US projects: for example `PRJ-ORG-ZZ-01-M3-A-0001` (Project-Originator-Volume-Level-Type-Role-Number).

### Gaps
- The 2025 LOD Part I element-by-element content (for example what LOD 300 requires for B2010 Exterior Walls) was not read.
- UNVERIFIED IFC modelling details (prior knowledge):
  - IfcSlab PredefinedType values include FLOOR, ROOF, LANDING and BASESLAB.
  - IfcRoof usually aggregates IfcSlab roof slabs.
  - IfcStair aggregates IfcStairFlight, landings and IfcRailing.
  - Doors and windows fill IfcOpeningElement voids via IfcRelVoidsElement and IfcRelFillsElement.
  - Quantity sets such as Qto_WallBaseQuantities exist.
  - IfcWallStandardCase is deprecated in IFC4.3 in favor of IfcWall.
- UNVERIFIED MasterFormat division titles (prior knowledge):
  - 02 Existing Conditions; 03 Concrete; 04 Masonry; 05 Metals; 06 Wood, Plastics, and Composites; 07 Thermal and Moisture Protection
  - 08 Openings; 09 Finishes; 10 Specialties; 11 Equipment; 12 Furnishings; 13 Special Construction; 14 Conveying Equipment
  - 21 Fire Suppression; 22 Plumbing; 23 HVAC; 25 Integrated Automation; 26 Electrical; 27 Communications; 28 Electronic Safety and Security
  - 31 Earthwork; 32 Exterior Improvements; 33 Utilities
- UNVERIFIED OmniClass table numbers (prior knowledge): 11 Construction Entities by Function, 12 by Form, 13 Spaces by Function, 14 Spaces by Form. Not confirmed in this session.

## 4. Professional design process: AIA phases, deliverables, decision locks, programming, reviews

### Takeaway
AIA B101 basic services run through Schematic Design, Design Development, Construction Documents, Procurement (called "Bidding or Negotiation" before 2017) and Construction. Pre-design and programming are typically treated as their own stage. Owner approval gates each transition. A traditional fee split of about 15/20/40/5/20 % is a rule of thumb that varies by firm. Programming relies on a space list, an adjacency matrix and bubble diagrams.

### Cited Findings
- B101's five basic phases are Schematic Design, Design Development, Construction Documents, Procurement and Construction. The 2017 edition renamed "Bidding or Negotiation" to "Procurement." — [Open Exam Prep: fee allocation across phases](https://open-exam-prep.com/study-guides/are-pjm/budgeting-communication/fee-allocation-project-phases); [Monograph: guide to design phases](https://monograph.com/blog/guide-to-design-phases)
- Fee splits:
  - An illustrative traditional design-bid-build split: SD 15 %, DD 20 %, CD 40 %, Procurement/Bidding 5 %, CA 20 %. — [Open Exam Prep](https://open-exam-prep.com/study-guides/are-pjm/budgeting-communication/fee-allocation-project-phases)
  - An AIA best-practice rule of thumb: ...DD 25 %, CD 40 %, Bidding 5 %, CA 20 %. The SD figure was cut off in the snippet; inferred 10 % if the split sums to 100. — [AIA Best Practices: Setting fees](https://www.aia.org/sites/default/files/2025-12/AIA_BestPractices_Settingfees-Whattoconsider.pdf)
  - One firm's published split: 20/20/30/5/25. — [Neumann Monson](https://neumannmonson.com/basic-vs-supplemental-services-architecture-fees/)
- Schematic design: the architect meets the owner to set goals and requirements, which often defines the program, and produces study drawings illustrating design concepts. Typical deliverables are a site plan, floor plans, sections, an elevation and other illustrative materials. The owner signs off on the final SD before work proceeds. — [AIA: Defining the architect's basic services](https://www.aia.org/resource-center/defining-the-architects-basic-services); [AIA SD checklist 12.03.01](https://www.aia.org/sites/default/files/2024-12/BestPractices_12.03.01_SchematicDesign_checklist.pdf); [AIA SD phase quality management](https://www.aia.org/sites/default/files/2026-02/AIA_BestPractices_Schematicdesignphasequalitymgmt.pdf)
- Design development: develops the SD documents and lays out mechanical, electrical, plumbing, structural and architectural details. Typical deliverables are fully dimensioned plans, sections and elevations, door and window details, and outline specifications. The phase often ends with a formal presentation and owner approval. — [AIA: Defining the architect's basic services](https://www.aia.org/resource-center/defining-the-architects-basic-services); [AIA DD checklist 12.03.02](https://www.aia.org/sites/default/files/2024-12/BestPractices_12.03.02_DesignDevelopment_checklist.pdf); [AIA: Managing quality in DD](https://www.aia.org/resource-center/managing-quality-in-the-design-development-phase)
- Construction documents: once the owner approves DD, the architect prepares detailed drawings and specifications that the contractor uses to set actual construction cost and build. This is the residential-specific AIA "six steps" framing. — [AIA "6 steps" residential handout (PDF)](https://static1.squarespace.com/static/ta/5f5d57685484d50480bbf104/1133/assets/files/aia-6-steps.pdf)
- The AIA notes that listed deliverables are common examples, not requirements; the contract defines the actual deliverables. Approvals may also involve lenders or boards. — [AIA: Defining the architect's basic services](https://www.aia.org/resource-center/defining-the-architects-basic-services)
- Programming tools:
  - The adjacency matrix records how each space relates to every other.
  - The bubble diagram draws on the matrix to give a rough flow before the plan is refined.
  - A line-weight convention: triple line = must be adjacent; double line = should be adjacent; single line = "would be nice".
  - Site and building can each get their own matrix and bubble diagram.
  — [CUNY City Tech ARCH 3512 Assignment 4](https://openlab.citytech.cuny.edu/arch3512f19/files/2019/09/Assignment-4.pdf); [CUNY City Tech Programming Matrix & Bubble Diagrams](https://openlab.citytech.cuny.edu/arch3612f23/files/2022/08/Assignment-Programming-Matrix-Bubble-Diagrams.pdf)
- Vectorworks generates bubble diagrams from an adjacency-matrix worksheet, with line weights showing relationship strength. — [Vectorworks 2021: Programming studies](https://app-help.vectorworks.net/2021/eng/VW2021_Guide/Programming/Programming_studies.htm)
- Space planning teaching recommends mastering typical residential spaces first: kitchens, bathrooms, powder rooms and laundries. — [TIU space planning lecture ch. 3](https://lecture-notes.tiu.edu.iq/wp-content/uploads/2023/10/chapter-3.pdf)

### Inferences
- Phase-lock model for the playbook (synthesized from the AIA phase descriptions; this is general guidance, not AIA text):
  - Pre-design/programming locks the program (room list, target areas, budget, site constraints).
  - SD locks siting, massing, plan organization and zoning, roof form, structural concept and style direction (owner sign-off).
  - DD locks dimensions, wall types, door and window sizes and types, materials, major MEP and structural layout, and outline specs (owner sign-off).
  - CD locks everything needed for permit and bid; after this, changes become formal revisions or change orders.
- Design review checkpoints follow the gates: program review, SD review (plan, section, one elevation, massing), DD review (coordinated dimensioned set, outline specs, cost check), CD QA/QC before permit (cross-references, schedules, code), and CA submittal reviews. The AIA SD/DD checklists cited above are a ready model for these checkpoints.

### Gaps
- No authoritative residential site-analysis checklist was found. UNVERIFIED typical contents (prior knowledge):
  - Legal: boundary/survey, zoning and setbacks, height limits, FAR or lot coverage, easements.
  - Natural: topography and slope, drainage, soils, vegetation and trees, flood zone.
  - Climate: sun path and solar access, prevailing winds.
  - Context: views in and out, privacy and neighbors, noise, access/curb cut and approach, utilities, neighborhood character.
- UNVERIFIED (prior knowledge): AIA B105 is the short-form owner-architect agreement for residential or small projects; the MacLeamy curve shows that the cost of change rises as the design progresses. Neither was confirmed in this session.
- The SD percentage in the AIA fee rule of thumb was truncated in the snippet.

## 5. Foundational residential design principles

### Takeaway
Core principles come from four sources. Ching gives the ordering principles: axis, symmetry, hierarchy, datum, rhythm/repetition and transformation. Alexander's *A Pattern Language* supplies residential patterns, notably 105 South Facing Outdoors, 112 Entrance Transition, 127 Intimacy Gradient, 159 Light on Two Sides of Every Room and 179 Alcoves. Susanka's "build better, not bigger" favors quality, multi-use rooms, layering, framed openings and human scale. Le Corbusier's regulating lines and Modulor are a source of proportion. Practical heuristics are daylight depth of about 1.5-2.5x window head height and keeping hallway or "passing-through" area under about 10 % of floor area (informal benchmarks).

### Cited Findings
**Ching, *Architecture: Form, Space, and Order***
- Ordering principles:
  - Axis: a line set by two points, "terminated at both of its ends by a significant form or space"; "although it implies symmetry, it demands balance."
  - Symmetry: mirror balance about an axis or point.
  - Hierarchy: dominance through exceptional size, unique shape or strategic location.
  - Datum: "a line, plane or volume which, by its continuity and regularity, serves to gather, measure and organise a pattern of forms and spaces."
  - Rhythm: "patterned repetition or alteration of formal elements."
  - Transformation: changing a prototype's size, shape, rotation and so on while keeping its identity.
  — [Form, Space and Order Ch. 7 (archive.org)](https://archive.org/download/ArchitectureFormSpaceAndOrderCh7/Architecture_Form%20Space%20and%20Order_Ch7.pdf); [Designing Buildings Wiki: Principles of Order](https://www.designingbuildings.co.uk/wiki/Principles_of_Order_in_Architecture); [TIU Lecture 6: Ordering Principles](https://lecture-notes.tiu.edu.iq/wp-content/uploads/2023/06/Lecture-6-Ordering-Principles.pdf)
- In the 4th edition, the Principles chapter begins around p. 350. — [Isaac Kremer: FSO table of contents](https://isaackremer.com/architecture-sources-cited/architecture-form-space-order-1979/)

**Alexander, *A Pattern Language* (1977)**
- Pattern numbers:
  - 105 South Facing Outdoors
  - 106 Positive Outdoor Space
  - 110 Main Entrance
  - 111 Half-Hidden Garden
  - 112 Entrance Transition
  - 127 Intimacy Gradient
  - 159 Light on Two Sides of Every Room
  - 179 Alcoves
  — [patternlanguage.com summary](https://www.patternlanguage.com/apl/aplsummary.htm); [Scribd copy of APL](https://www.scribd.com/document/46214495/A-Pattern-Language)
- An obsidian.md summary uses a different numbering (for example 35 and 40); the book's numbers above are authoritative. — [obsidian.md](https://publish.obsidian.md/disruptively-useful/Archive/Media+Library/A+Pattern+Language)
- Pattern 159:
  - "Locate each room so that it has outdoor space outside it on at least two sides," with windows in those walls.
  - A room lit from one side has a steep light gradient, and "the part furthest from the window is uncomfortably dark."
  - "People will always gravitate to those rooms which have light on two sides, and leave the rooms which are lit only from one side unused and empty."
  - Very shallow rooms can approximate two-sided light with side-by-side windows; deeper rooms that cannot get it need high ceilings and white walls. The search summary references "not more than about eight feet deep."
  — [patternlanguage.com APL 159](https://www.patternlanguage.com/apl/apl159/apl159.htm); [Houzz: Light from Two Sides](https://www.houzz.com/magazine/a-pattern-language-light-from-two-sides-stsetivw-vs~620334)
- Pattern 127 Intimacy Gradient: arrange spaces in a sequence that starts with the entrance and the most public parts, leads to slightly more private areas, and ends with the most private rooms. — [Medium: Intimacy Gradient](https://medium.com/to-program-is-to-create/intimacy-gradient-6209c706253b)
- Pattern 112 Entrance Transition: entrances "create a transition between the outside – the public world – and some less public inner world." — [In the Hills: Patterns for Living](https://www.inthehills.ca/?p=15954); [TU Delft repository thesis](https://repository.tudelft.nl/file/File_c79593af-9890-489d-9541-61879803fe74)

**Susanka, *The Not So Big House* (1998) and *Creating the Not So Big House***
- "Build better, not bigger": quality over quantity, and "the feeling of home is a quality, not a quantity." — [Wikipedia: Sarah Susanka](https://en.wikipedia.org/wiki/Sarah_Susanka); [Fine Homebuilding: Not Small, Just Right](https://finehomebuilding.com/2014/04/23/not-small-just-right); [susanka.com](https://susanka.com/not-so-big-house/)
- Instead of rooms used only occasionally for one activity, she proposes spaces that "do double duty, or can easily be changed." — [Mother Earth News: Not So Big House](https://www.motherearthnews.com/sustainable-living/green-homes/not-so-big-house/)
- *Creating the Not So Big House* focuses on visual weight, layering and framed openings. Her stated goal is tailoring houses "to fit the way we really live – in scale with the human form"; "Comfort has almost nothing to do with how big a space is." — [Fine Homebuilding: Creating the Not So Big House](https://finehomebuilding.com/2002/02/01/creating-the-not-so-big-house-affordable-comfort); [Wikipedia](https://en.wikipedia.org/wiki/Sarah_Susanka)

**Proportion systems**
- Regulating lines: Le Corbusier took them from Auguste Choisy's *Histoire de l'architecture* (1899) and presented them as a chapter of *Vers une architecture* (1923). He applied them largely after the fact, to explain the proportions of finished designs such as Villa Stein-de Monzie, Garches (1928), where golden-section regulating lines set facade dimensions and window placement. — [Jean-Louis Cohen, EAHN journal](https://journal.eahn.org/article/id/7482/); [Wikipedia: Regulating Lines](https://en.wikipedia.org/wiki/Regulating_Lines)
- The Modulor (developed 1942-1955) links a human figure about 1.83 m tall to the golden section. It was applied from the Unité d'Habitation, Marseille (1952), onward, including Chandigarh. Historians note its six-foot basis was arbitrary. — [EAHN journal](https://journal.eahn.org/article/id/7482/)

**Circulation efficiency**
- Informal benchmarks:
  - Architects "typically aim" for hallways under 10 % of total floor area; many production plans exceed 15 % circulation. — [Coohom (vendor blog)](https://www.coohom.com/article/how-to-optimize-corridor-and-circulation-space-in-narrow-homes)
  - A builder-author redesigned any plan whose "passing through" area reached 9 % or more of living area. — [ProTradeCraft: Designing for the long hall](https://www.protradecraft.com/construction-phase/tile-flooring-drywall/article/55180731/designing-for-the-long-hall)
- Main corridor width in single-family homes is commonly 3'-0" to 3'-6". — [Coohom](https://www.coohom.com/article/how-to-optimize-corridor-and-circulation-space-in-narrow-homes)
- Single-family gross floor area is measured to the outside of exterior walls and includes walls, hallways and stairways. ANSI Z765 is the US single-family measurement standard. — [Cupertino Single Family FAQs](https://www.cupertino.gov/Your-City/Departments/Community-Development/Planning/Planning-FAQ/Single-Family-FAQs); [UFC 4-711-01 (tpub)](https://buildingcriteria2.tpub.com/ufc_4_711_01/ufc_4_711_010022.htm)
- Gross area is based on outside dimensions, net area on interior dimensions. — [The Architect's Portable Handbook, via GlobalSpec](https://www.globalspec.com/reference/53492/203279/d-programming-e)

**Daylighting rules of thumb**
- Sidelighting gives effective illumination to a depth of about 2.5x the window head height above the work plane. This assumes continuous or near-continuous windows, overcast sky, clear glazing and no shading. The figure rises to 3-3.5x under clear sky (AIA, 1982). — [Review of the daylight rule of thumb (SlideShare)](https://www.slideshare.net/slideshow/a-review-of-the-daylight-rule-of-thumb-assessing-window-head-height-to-daylit-zone-depth-for-shading-devices-in-commercial-buildings/136834491); [ASEE: Daylight rules of thumb experimentally examined](https://peer.asee.org/daylight-rules-of-thumb-experimentally-examined.pdf)
- More conservative figures: a conventional window daylights to about 1.5x head height, typically 1.5-2x, up to 2.5x without shading devices. Light shelves push this to about 2x. — [VentureWell Sustainability Workshop: apertures](https://sustainabilityworkshop.venturewell.org/buildings/apertures-daylighting.html); [BD+C: 13 daylighting guidelines](https://bdcnetwork.com/home/article/55144479/13-daylighting-guidelines); [Level (NZ): daylighting](https://www.level.org.nz/passive-design/daylighting/)
- A physical-model study found effective penetration proportional to head height above the work plane. — [ASEE](https://peer.asee.org/daylight-rules-of-thumb-experimentally-examined.pdf)

### Inferences
- Checkable rules an AI can apply to every plan:
  1. Every habitable room gets windows on at least two walls where possible (APL 159). Otherwise room depth should be at most 2x window head height. For an 8'-0" head height and a 2'-6" work plane (5.5' above it), that gives about 11'-14' of daylit depth.
  2. Zone the plan along an intimacy gradient: entry, then public living, then semi-private (family, kitchen), then private (bedrooms, baths) (APL 127).
  3. Provide an entrance transition, such as a porch, a change of level, a change of direction or a vestibule, between street and living space (APL 112).
  4. Place main outdoor space on the south side of the building, not between the building and the south boundary (APL 105).
  5. Add alcoves and window seats off main rooms (APL 179).
  6. Keep pure circulation at or below about 10 % of gross area (informal).
  7. Use Ching's datum and axis to organize facades and plans, and use regulating lines or the golden section as an optional check on facade proportions.
- Net-to-gross for houses: treating hallways under 10 % as the target, plus walls (roughly 8-12 % of gross in wood frame), implies net habitable area of about 78-85 % of gross. This is an inference, not a sourced benchmark.

### Gaps
- No authoritative net-to-gross ratio for single-family houses was found. The Architect's Portable Handbook efficiency tables were not accessible.
- UNVERIFIED further APL residential pattern numbers (prior knowledge; verify against [patternlanguage.com summary](https://www.patternlanguage.com/apl/aplsummary.htm)):
  - 107 Wings of Light; 128 Indoor Sunlight; 129 Common Areas at the Heart; 130 Entrance Room
  - 134 Zen View; 135 Tapestry of Light and Dark; 136 Couple's Realm; 137 Children's Realm
  - 138 Sleeping to the East; 139 Farmhouse Kitchen; 142 Sequence of Sitting Spaces
  - 163 Outdoor Room; 166 Gallery Surround; 167 Six-Foot Balcony; 168 Connection to the Earth
  - 180 Window Place; 190 Ceiling Height Variety; 192 Windows Overlooking Life; 199 Sunny Counter
  - 202 Built-in Seats; 222 Low Sill; 238 Filtered Light; 252 Pools of Light
- UNVERIFIED Susanka concepts (prior knowledge; not confirmed by search): "Away Room", "Shelter Around Activity", "Ceiling Height Variety", "Interior Views", "Diagonal Views", "Light to Walk Toward", the "Not So Big" target of about one-third less area than you think you need, and the dining-room/formal-living-room critique.
- UNVERIFIED proportion data (prior knowledge):
  - Golden ratio φ = (1+√5)/2 ≈ 1.618.
  - Palladio's preferred room ratios: 1:1, 1:√2, 3:4, 2:3, 3:5, 1:2.
  - Classical orders Tuscan, Doric, Ionic, Corinthian and Composite, with column height-to-diameter ratios of about 7, 8, 9, 10 and 10.
  Not searched.
- Views, privacy and indoor-outdoor connection were covered only via APL patterns. No other sourced rules (for example window-to-window privacy distances) were found.
- UNVERIFIED: the IRC requires habitable-room glazing of at least 8 % of floor area and openable area of 4 % (R303.1). This belongs to the code researcher.

## 6. Residential architectural styles reference (characteristics matrix)

### Takeaway
McAlester's *A Field Guide to American Houses* is the standard identification reference. Secondary preservation guides quote it consistently for historic styles: Craftsman, Prairie, Tudor, Queen Anne, Spanish Eclectic, Colonial/Georgian and Cape Cod. Recent styles (Modern Farmhouse, Japandi, Scandinavian, PNW Contemporary) are documented mostly in consumer design media, with little sourced exterior detail. Numeric roof pitches were not found in sources.

### Cited Findings
- Craftsman (McAlester, as quoted): "Typically a one- to two-story building with a low-pitched, gabled roof (occasionally hipped) with wide, unenclosed eave overhang; roof rafters usually exposed." Decorative false beams or braces commonly appear under gables, and porches are full- or partial-width with roofs on tapered square columns. Columns are often short and set on stone or brick piers, a regional variation. Dates: 1905-1930 (Whittier); 1900-1930 (Pennsylvania PHMC "Bungalow/Craftsman"). — [Glendale CA style guide](https://glendaleca.gov/home/showdocument?id=12690); [MissPreservation: Craftsman in Mississippi](https://misspreservation.com/2015/02/26/craftsman-style-in-mississippi/); [Angi](https://angi.com/articles/what-is-a-craftsman-house.htm); [City of Whittier Craftsman](https://www.cityofwhittier.org/government/community-development/planning-services/historic-preservation/common-residential-architectural-styles-in-whittier-to-1950/craftsman-arts-and-crafts-1905-1930); [PA PHMC Bungalow/Craftsman](https://www.phmc.state.pa.us/portal/communities/architecture/styles/bungalow.html); [Santa Barbara Craftsman guide](https://santabarbaraca.gov/sites/default/files/2022-05/Historic-Architectural-Styles-Guide_Craftsman.pdf)
- Cape Cod: steeply pitched side-gabled roof, 1-1/2 stories, two dormers, double-hung windows with shutters. — consumer style-guide cluster: [Bob Vila](https://bobvila.com/slideshow/these-are-the-most-popular-house-styles-in-america-right-now-52073); [Rocket Homes](https://rockethomes.com/blog/home-buying/classic-home-styles); [Power HRG](https://www.powerhrg.com/about/news/how-to/what-type-of-house-do-i-have-12-popular-home-styles-explained/)
- Ranch: single story, long horizontal massing, low-pitched gable or hipped roof. — same cluster; [Inman cheat sheet](https://inman.com/2017/04/21/ranch-victorian-or-tudor-the-agents-architectural-house-styles-cheat-sheet)
- Tudor: multiple steeply pitched front gables, decorative half-timbering, stucco (also brick and stone). — [AOL/House Beautiful: How to spot a Tudor](https://www.aol.com/lifestyle/spot-tudor-style-house-according-195700684.html); [Inman](https://inman.com/2017/04/21/ranch-victorian-or-tudor-the-agents-architectural-house-styles-cheat-sheet)
- Prairie: Chicago origin, most common in the Midwest, strong horizontal lines, long horizontal bands of windows and trim. — [Texas Historical Commission residential styles](https://www.thc.texas.gov/public/upload/preserve/survey/survey/architectural%20styles%20residential.pdf); [Sanford NC Architectural Styles](https://sanfordnc.net/DocumentCenter/View/1066/Architectural-Styles-PDF); [This Old House: American house styles](https://www.thisoldhouse.com/ideas/american-house-styles)
- Queen Anne: asymmetrical; steeply pitched roof, typically hipped with lower cross gables; towers or turrets; ornate woodwork. — [Alaska Architectural Style Guide](https://dnr.alaska.gov/parks/oha/StyleGuide.pdf); [Sanford NC](https://sanfordnc.net/DocumentCenter/View/1066/Architectural-Styles-PDF)
- Spanish Eclectic/Spanish Revival: influenced by California's Spanish Colonial missions and popularized by the 1915 Panama-California Exposition in San Diego. A red barrel-tile roof is the signature. — [Texas Historical Commission](https://www.thc.texas.gov/public/upload/preserve/survey/survey/architectural%20styles%20residential.pdf); [Bob Vila](https://bobvila.com/slideshow/these-are-the-most-popular-house-styles-in-america-right-now-52073)
- Georgian/Colonial Revival: a substantial, symmetrical appearance (revival 1880-1930). Federal/Adam has doors and windows in strict symmetry. — [Sanford NC](https://sanfordnc.net/DocumentCenter/View/1066/Architectural-Styles-PDF); [PA PHMC style categories](https://www.phmc.state.pa.us/Portal/Communities/Architecture/Styles/categories.html); [Historic New England style guide](https://www.historicnewengland.org/preservation/your-older-or-historic-home/architectural-style-guide)
- Mid-Century Modern: flat, straight lines; large glass windows; open spaces. — [Rocket Homes](https://rockethomes.com/blog/home-buying/classic-home-styles); [Power HRG](https://www.powerhrg.com/about/news/how-to/what-type-of-house-do-i-have-12-popular-home-styles-explained/)
- Contemporary: irregular shapes, lack of ornamentation, flat and angled roofs, large tall panes of glass, metal. — [Houzz NZ ideabook](https://www.houzz.co.nz/ideabooks/141196588/thumbs/architectural-styles)
- Modern Farmhouse: an even mix of rustic and modern elements. Interiors use paneled walls, matte black hardware, apron sinks and exposed timber. The New York Times (2023) called it "today's McMansion," a sign of waning favor. — [AOL: Is modern farmhouse losing its appeal?](https://www.aol.com/modern-farmhouse-style-losing-appeal-220000443.html); [Bob Vila: Modern farmhouse style](https://www.bobvila.com/articles/modern-farmhouse-style.md)
- Japandi: a Japanese-Scandinavian hybrid built on simplicity, natural materials and functional beauty. Neutral palette; light-to-medium wood, bamboo, linen, wool, stone and clay; black used sparingly. Suited to cooler climates such as the Pacific Northwest. — [Dwell: Japandi](https://www.dwell.com/guide/japandi-home-design-1f14fc77); [Apartment Therapy](https://www.apartmenttherapy.com/what-is-japandi-37497332); [EYRC: Japandi design](https://www.eyrc.com/houses-blog/blog/japandi-design); [LakeHomes](https://www.lakehomes.com/info/?p=29778)
- Reference works most cited by preservation offices: McAlester's *A Field Guide to American Houses* and John Poppeliers' *What Style Is It?* — [CS Monitor: How to learn house styles](https://www.csmonitor.com/1982/1015/101528.html); [Sanford NC](https://sanfordnc.net/DocumentCenter/View/1066/Architectural-Styles-PDF)

### Inferences
- The playbook's style matrix should record for each style: roof form and pitch class (low <6:12, moderate 6-9:12, steep >=9:12), massing, symmetry, window type and rhythm, porch/entry, eave and rake detail, cladding, and signature details. The sourced descriptors above fill the qualitative columns. The numeric pitch ranges in Gaps need verification or should stay as qualitative classes.
- Craftsman, Prairie, Ranch and Mid-Century share low-pitched roofs and horizontal emphasis. Cape Cod, Tudor, Queen Anne and Modern Farmhouse rely on steep gables. Georgian/Colonial is defined by symmetry. This split is a useful first filter for AI style consistency checks.

### Gaps
- No numeric roof pitches were found for any style. UNVERIFIED commonly cited ranges (prior knowledge):
  - Craftsman: about 4:12-6:12
  - Prairie: about 3:12-5:12, hipped, with deep overhangs
  - Ranch: about 3:12-5:12
  - Cape Cod: about 8:12-12:12
  - Tudor: 12:12 or steeper
  - Queen Anne: about 9:12-12:12+
  - Georgian/Colonial: about 6:12-9:12, side gable or hip
  - Spanish Revival: about 3:12-5:12 tile, or flat with parapets
  - Modern Farmhouse: about 8:12-12:12, standing-seam metal and board-and-batten
  - MCM: flat to 2:12 or butterfly
- UNVERIFIED McAlester identifiers (prior knowledge):
  - Georgian: five-ranked symmetrical facade, paneled front door centered with crown or pediment, multi-pane double-hung sash.
  - Prairie: low-pitched hipped roof, widely overhanging eaves, massive square porch supports.
  - Mission: shaped parapets.
- Pacific Northwest Contemporary/Contemporary Craftsman and Scandinavian/Nordic minimal exteriors: no sourced exterior characteristics were found. UNVERIFIED (prior knowledge):
  - PNW: deep overhangs, exposed timber, shed or low gable roofs, large glazing, cedar.
  - Nordic: steep simple gables without overhangs, dark or black cladding, minimal trim.
- Victorian varieties other than Queen Anne (Italianate, Second Empire, Stick, Shingle) and Mediterranean (as distinct from Spanish) were not researched.

## 7. How professional firms structure office standards manuals

### Takeaway
Office standards manuals set a firm's graphic look and document organization, and work best when built into project template files. Their typical contents are file and project setup, sheet sizes and title blocks, sheet numbering and set organization, layers or object styles, line types and weights, text, dimensions and symbols, schedule formats, plotting, and BIM templates. Publicly available exemplars are mostly institutional or government (university facilities, USACE, PSPC Canada). Private firm manuals were not found.

### Cited Findings
- "Office standards set the graphic appearance and organization of documents produced by a firm." "A key ingredient in making standards work is to embed them into template files that are used to start projects." — [Graphisoft Community: ARCHICAD Office Standards and Templates](https://community.graphisoft.com/t5/Project-data-BIM/ARCHICAD-Office-Standards-and-Templates/ta-p/303402)
- Typical contents: text sizes and fonts, title blocks, sheet numbering, line types and weights, layer naming, drafting conventions, symbols, sheet organization, schedule formats and production set organization. — [Graphisoft Community](https://community.graphisoft.com/t5/Project-data-BIM/ARCHICAD-Office-Standards-and-Templates/ta-p/303402); [Autodesk University: Developing CAD Standards](https://www.autodesk.com/autodesk-university/article/Developing-CAD-Standards-Complete-Guide-2019)
- Institutional manuals cover:
  - file format, drawing organization, plotting settings, scale and units, fonts and blocks — [Illinois State University CAD Standards Manual](https://facilities-v3.webdev.illinoisstate.edu/reference/guidelines/FINAL%20CAD%20STANDARDS%20MANUAL.pdf)
  - file naming — [ASU Construction Drawings CAD Standards](https://www.asu.edu/fm/documents/Construction-Drawings-CAD-Standards.pdf)
  - base point and a limited set of standard sheet sizes — [UC Riverside standard](https://pdc.ucr.edu/media/386/download)
  Further models: [Duke CAD Standards Guideline v2.2](https://facilities.duke.edu/sites/default/files/Duke%20CAD%20Standards%20Guideline_v2.2.pdf); [Massachusetts CAD Standards Manual](https://www.mass.gov/doc/cad-standards-manual/download); [U. Nebraska CAD drafting standards](https://nebraska.edu/-/media/projects/unca/offices-policies/business-and-finance-office/design-guidelines/cad/cad-drafting-standards.pdf)
- Canada's national CADD standard ships a Revit template and toolkit, and the USACE A/E/C Graphics Standard addresses drafting practice across BIM, CAD and civil modeling. — [PSPC Canada National CADD Standard](https://www.canada.ca/en/public-services-procurement/services/infrastructure-buildings/computer-aided-design-drafting-standards.html); [DTIC A/E/C standard](https://apps.dtic.mil/sti/pdfs/AD1078774.pdf)
- Autodesk recommends starting a standard by meeting with the firm's CAD/BIM leaders to identify requirements, then documenting the standard and embedding it in templates. — [Autodesk University: Developing CAD Standards](https://www.autodesk.com/autodesk-university/article/Developing-CAD-Standards-Complete-Guide-2019)

### Inferences
- A recognized-practice table of contents for the playbook (synthesized from the sources above, aligned to NCS structure):
  1. Purpose, scope, authority and referenced standards (NCS V7, BIMForum LOD 2025, IFC 4.3, MasterFormat 2020)
  2. Project setup: units, base point and coordinates, file and model naming
  3. Sheet sizes, title block and sheet layout (UDS Module 2)
  4. Set organization and sheet numbering (UDS Module 1)
  5. Layers and object categories (AIA CAD Layer Guidelines)
  6. Line types and line weights by scale
  7. Text, dimensions and annotation
  8. Symbols (UDS Module 6)
  9. Schedules (UDS Module 3)
  10. Abbreviations and notations
  11. BIM model standards: LOD per phase, IFC classes and Psets, classification codes
  12. Design process and phase gates
  13. Design principles and style guide
  14. QA/QC checklists per phase (AIA SD/DD checklists as models)
  15. Revisions and issuance
  16. Appendices: templates and examples
- For an AI system, the "template file" principle means the standards should exist as machine-readable defaults (pen tables, layer and category maps, schedule schemas, sheet lists), not only as prose.

### Gaps
- No published private-firm residential office standards manual was found. An example would be a firm's own "Office Standards" PDF. The search returned only institutional and agency documents and vendor guidance.
- None of the institutional manuals were read in full (fetch blocked), so section-level contents beyond the search summaries are not verified.
