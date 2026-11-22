# Style catalog

Twelve American residential styles, each written to the [module template](README.md). Pitch and overhang ranges are typical practice values (⚠️). Style identifiers draw on McAlester's *A Field Guide to American Houses* as quoted by state and city preservation guides, and recent styles draw on design-media descriptions. Sources are in the [research notes](../../research/research_notes/Residential%20design%20standards%20baseline/drawing_standards_process_principles.md).

**First filter.** Craftsman, Prairie, Ranch and Mid-Century Modern share **low roofs and horizontal lines**. Cape Cod, Tudor, Modern Farmhouse and the Nordic style rely on **steep gables**. Colonial/Georgian is defined by **symmetry**. Contemporary is defined by **asymmetric composition**.

---

### Modern Farmhouse
- **Character:** a rural gable form, simplified and sharpened. It mixes rustic and modern elements.
- **Massing:** simple gabled volumes, often a main block plus a smaller connected wing. One and a half or two stories. Mostly asymmetric.
- **Roof:** front or side gables, **8:12–12:12**. Tight rakes and 6–12 in. eaves, or none. Standing-seam metal, sometimes over a shingled main roof.
- **Openings:** tall vertical windows in black frames, often grouped. Simple divided lights or none. Gable-end windows.
- **Entry/porch:** a deep covered porch, 8 ft or more, with simple square posts. It counts toward P-OUT-1.
- **Materials:** white or light board-and-batten or lap siding, black window frames, metal roof, natural wood accents.
- **Signature:** a steep gable with board-and-batten, black windows, a metal porch roof, gooseneck lights.
- **Avoid:** fake barn doors on the exterior, a shiplap cliché inside and out, and a dozen gables on a tract footprint. Design media has called it "today's McMansion", so restraint keeps it from dating.
- **Climate/rules:** the steep roof suits snow and gives usable attic space, but check knee walls against C-CEIL-2. Shallow eaves give little sun or rain protection, so compensate with the porch and E-SUN-1 shading on south and west.
- **Spec defaults:** `roof: {form: gable, pitch: "10:12", overhang_in: 8}`

### Craftsman / Bungalow
- **Character:** handcrafted, low, and anchored to the ground.
- **Massing:** one to one and a half stories, broad and low. Bungalows often have dormers.
- **Roof:** low-pitched gables, occasionally hipped, **4:12–6:12**. **Wide unenclosed eaves** of 18–30 in. with exposed rafter tails. Decorative beams or braces under the gables.
- **Openings:** grouped double-hung windows, typically with a divided upper sash over a single-pane lower sash (3-over-1 or 4-over-1). Wide flat casings.
- **Entry/porch:** a full- or partial-width porch under its own roof, on **tapered square columns set on stone or brick piers**.
- **Materials:** wood lap or shingle siding, stone or brick bases, earthy palette.
- **Signature:** exposed rafter tails, knee braces, tapered columns on piers, wide trim.
- **Avoid:** tapered columns on a two-story box with no porch roof, and thin trim.
- **Climate/rules:** deep eaves are excellent sun and rain control (E-SUN-1). Low pitches with shingles stay at or above 4:12, or need double underlayment below that (S-ROOF-3).
- **Spec defaults:** `roof: {form: gable, pitch: "5:12", overhang_in: 24}`

### Contemporary / Modern
- **Character:** composition by volume, light and material. No applied ornament.
- **Massing:** irregular, interlocking volumes. Cantilevers and courtyards are common.
- **Roof:** flat, low shed, or angled planes, **¼:12 to 4:12**, with crisp edges and parapets or thin fascias.
- **Openings:** large tall panes, window walls, clerestories. Openings are composed as a pattern, not repeated in a rhythm.
- **Entry/porch:** a recessed or carved-out entry, often marked by a canopy plane.
- **Materials:** stucco, fiber-cement panels, wood or metal cladding, glass, exposed concrete.
- **Signature:** deep reveals, floating planes, corner glass, a single material per volume.
- **Avoid:** glass in every direction (west overheating), and large cantilevers and corner glass with no engineered load path.
- **Climate/rules:** this is the style that most often breaks bracing and spans (S-BRACE-1, S-SPAN-1, S-ENG-1) and the window-to-wall ratio (E-WWR-1), so plan the solid wall early. Flat roofs need membranes, slope to drains and careful parapet flashing.
- **Spec defaults:** `roof: {form: flat, pitch: "1/4:12", overhang_in: 0}` or `{form: shed, pitch: "2:12"}`

### Mid-Century Modern
- **Character:** postwar optimism, with indoor-outdoor living on one level.
- **Massing:** low, long, often L- or U-shaped around a patio. Post-and-beam rhythm.
- **Roof:** flat, low gable or butterfly, **0–3:12**. Deep overhangs and exposed beams extending outside.
- **Openings:** floor-to-ceiling glass to the garden side, clerestories, and solid walls to the street.
- **Entry/porch:** a recessed entry under the roof plane, often with a screen wall.
- **Materials:** wood (vertical tongue-and-groove), brick or stone feature walls, glass, warm palette with accent colors.
- **Signature:** post-and-beam, clerestory bands, a privacy-first street face with an open garden face.
- **Avoid:** heavy trim, and divided-light windows.
- **Climate/rules:** the open garden side should face south (P-ORIENT-1) with overhangs sized to it (E-SUN-1). Low roofs need low-slope roofing (S-ROOF-3) and good insulation depth. Use a raised-heel or above-deck approach (E-INSUL-1).
- **Spec defaults:** `roof: {form: gable, pitch: "2:12", overhang_in: 36}`

### Ranch
- **Character:** one level, long and horizontal, easy living.
- **Massing:** single story, a long rectangle or L, attached garage, little height variation.
- **Roof:** low gable or hip, **3:12–5:12**, with moderate eaves of 12–24 in.
- **Openings:** horizontal groupings, picture windows, sliders to the patio.
- **Entry/porch:** a modest porch or stoop, often off-center.
- **Materials:** brick, lap siding, board-and-batten accents.
- **Signature:** a long low roofline, a picture window, an attached garage.
- **Avoid:** a garage dominating the street façade (SP-GAR-1), and long double-loaded halls (SP-CIRC-1).
- **Climate/rules:** a natural fit for aging in place (SP-UD-3). A long footprint means more foundation and roof per square foot (S-SIMPLE-1). Split-bedroom layouts work well (P-ZONE-1). The example spec in this kit is a ranch.
- **Spec defaults:** `roof: {form: gable, pitch: "5:12", overhang_in: 18}`

### Colonial / Georgian
- **Character:** formal and symmetrical: order and proportion.
- **Massing:** a two-story rectangular block, symmetrical, with a center entry. Side wings are subordinate.
- **Roof:** side gable or hip, **6:12–9:12**, with modest boxed eaves and cornice detail.
- **Openings:** a five-ranked façade (windows in five vertical rows), multi-pane double-hung windows, aligned heads and sills, shutters sized to actually cover the window.
- **Entry/porch:** a centered paneled door with a crown, pediment or small portico.
- **Materials:** brick or clapboard, white trim, dark shutters.
- **Signature:** strict symmetry, a cornice, a pedimented entry, and windows smaller on the second floor than the first.
- **Avoid:** shutters too narrow to close, a broken symmetry from a misplaced garage, and a front door off axis.
- **Climate/rules:** symmetry fights orientation when the sunny side is not the front. Put the living rooms on the sunny side behind the symmetrical shell. A simple stacked box is structurally efficient (S-STACK-1, S-SIMPLE-1).
- **Spec defaults:** `roof: {form: gable, pitch: "8:12", overhang_in: 8}`

### Cape Cod
- **Character:** a compact, steep-roofed cottage.
- **Massing:** one and a half stories, a side-gabled rectangle, symmetrical, central chimney.
- **Roof:** steep side gable, **8:12–12:12**, minimal overhang, two or three front dormers.
- **Openings:** double-hung with shutters, symmetrical about the door.
- **Entry/porch:** a centered door, often without a porch.
- **Materials:** shingle or clapboard siding, simple trim.
- **Signature:** steep side gables, dormers, a symmetrical small façade.
- **Avoid:** oversized dormers that swallow the roof.
- **Climate/rules:** the upstairs bedrooms sit under sloped ceilings. Check C-CEIL-2 (area under 5 ft doesn't count; 50% at 7 ft) and put each bedroom's escape opening in a dormer or gable end (C-EGR-1, C-EGR-4).
- **Spec defaults:** `roof: {form: gable, pitch: "10:12", overhang_in: 4}`

### Prairie
- **Character:** a horizontal house of the Midwestern plains, with a strong ground line.
- **Massing:** two stories with a dominant one-story wing or porch, emphatically horizontal.
- **Roof:** low hipped, **3:12–5:12**, with **widely overhanging eaves** of 24–48 in.
- **Openings:** ribbon bands of casements, often with geometric art glass.
- **Entry/porch:** an often-hidden entry and broad terraces.
- **Materials:** stucco or brick with contrasting horizontal trim bands, and massive square piers.
- **Signature:** deep horizontal eaves, banded windows, a contrasting belt course.
- **Avoid:** vertical proportions, and thin eaves.
- **Climate/rules:** deep eaves are excellent for E-SUN-1. Watch daylight depth under them (P-LIGHT-1). Ribbon windows that wrap corners affect bracing (S-BRACE-1).
- **Spec defaults:** `roof: {form: hip, pitch: "4:12", overhang_in: 36}`

### Spanish Revival / Mediterranean
- **Character:** sunlit stucco masses under red tile, from the California missions and the 1915 San Diego exposition.
- **Massing:** asymmetric volumes, often around a courtyard, with towers or a raised wing.
- **Roof:** low gable or hip, **3:12–5:12**, in **red barrel tile**, or flat with shaped parapets (Mission). Small eaves.
- **Openings:** deep-set windows in thick walls, arched openings at the entry and loggia, wrought-iron grilles.
- **Entry/porch:** an arched entry, loggia or courtyard.
- **Materials:** smooth stucco, clay tile, wood beams, tile accents.
- **Signature:** red tile roof, arches, deep reveals, a courtyard.
- **Avoid:** fake shallow arches, and tile on low-snow-capacity framing.
- **Climate/rules:** best in hot and dry zones. Tile is heavy, so check the framing (S-ROOF-3, S-ENG-1). Thick-wall reveals help shading. Flat roofs and parapets need membrane drainage and flashing (E-LAYERS-1).
- **Spec defaults:** `roof: {form: hip, pitch: "4:12", overhang_in: 12}`

### Tudor
- **Character:** a picturesque English cottage or manor.
- **Massing:** asymmetric, with multiple steep front-facing cross gables and a massive chimney.
- **Roof:** **12:12 and steeper**, steep cross gables, small eaves.
- **Openings:** tall narrow casements in groups, sometimes leaded diamond panes.
- **Entry/porch:** a rounded or Tudor-arched door, often in a projecting gable.
- **Materials:** brick or stone base, stucco with decorative half-timbering above, slate or shingle roof.
- **Signature:** steep overlapping front gables, half-timbering, a prominent chimney.
- **Avoid:** half-timbering pasted on a flat façade, and gable clutter.
- **Climate/rules:** many cross gables mean many valleys, which cost money and leak (S-ROOF-3, S-SIMPLE-1), so limit them to two or three. Steep roofs reduce headroom upstairs (C-CEIL-2).
- **Spec defaults:** `roof: {form: cross-gable, pitch: "12:12", overhang_in: 6}`

### Japandi / Nordic minimal
- **Character:** calm, natural and functional: Japanese restraint with Scandinavian warmth.
- **Massing:** simple gable or shed volumes, often a pure "house shape", one or two stories.
- **Roof:** steep simple gable, **8:12–12:12**, with **minimal or no overhang** in the Nordic version, or a low, deep-eaved roof in the Japanese version.
- **Openings:** few, large, carefully framed windows. Corner seats and deep sills.
- **Entry/porch:** a quiet recessed entry with a covered threshold (P-ENTRY-1).
- **Materials:** charred or dark-stained wood (Nordic), or light wood and stone; light-to-medium wood inside; neutral palette with black used sparingly.
- **Signature:** a pure gable, monochrome cladding, framed views, natural materials.
- **Avoid:** dark cladding in hot climates, and no overhangs in rainy climates without a rainscreen.
- **Climate/rules:** without overhangs the walls take all the weather, so the rainscreen and flashing must be excellent (E-RAIN-1, E-FLASH-1), with shading by other means (E-SUN-1). Suits cool climates.
- **Spec defaults:** `roof: {form: gable, pitch: "10:12", overhang_in: 0}`

### Pacific Northwest Contemporary
- **Character:** timber, glass and deep shelter under a big roof, opened to the trees.
- **Massing:** linked volumes stepping with the site, with big roofs dominating.
- **Roof:** low gable or shed, **2:12–5:12**, with **deep overhangs** of 24–48 in. and exposed timber.
- **Openings:** large glazing under overhangs, clerestories under shed breaks.
- **Entry/porch:** a covered entry deck, timber posts.
- **Materials:** cedar, dark metal, stone, exposed glulam.
- **Signature:** a big sheltering roof, exposed timber, glass protected by eaves.
- **Avoid:** glass without overhangs in a rain climate.
- **Climate/rules:** built for marine climates (zone 4C/5C): deep eaves, rainscreen (E-RAIN-1), and an engineered ridge for open vaults (S-ROOF-2). Big glazing needs a planned bracing strategy (S-BRACE-1).
- **Spec defaults:** `roof: {form: shed, pitch: "3:12", overhang_in: 36}`
