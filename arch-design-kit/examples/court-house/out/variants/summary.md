# Variants: variants.py

80 tried · 35 passed (concept mode) · 45 dropped · 6 kept (CR-SEARCH-1)

| ID | Pick | Params | Features | Warnings |
|---|---|---|---|---|
| V01 | nearest the median | court_w_ft=18, court_d_ft=14, ring_ft=14, living_side=S, open_side=none | aspect 1.10 · compactness 0.87 · shape_factor 5.86 · south_glazing 0.00 · circulation 0.05 · outdoor 0.13 · levels 1.00 | none |
| V02 | most different | court_w_ft=28, court_d_ft=24, ring_ft=12, living_side=S, open_side=E | aspect 1.08 · compactness 0.68 · shape_factor 7.47 · south_glazing 0.00 · circulation 0.07 · outdoor 0.28 · levels 1.00 | none |
| V03 | most different | court_w_ft=14, court_d_ft=24, ring_ft=14, living_side=N, open_side=E | aspect 1.24 · compactness 0.78 · shape_factor 6.59 · south_glazing 0.00 · circulation 0.08 · outdoor 0.16 · levels 1.00 | none |
| V04 | most different | court_w_ft=28, court_d_ft=14, ring_ft=14, living_side=S, open_side=E | aspect 1.33 · compactness 0.80 · shape_factor 6.84 · south_glazing 0.00 · circulation 0.04 · outdoor 0.17 · levels 1.00 | none |
| V05 | most different | court_w_ft=18, court_d_ft=18, ring_ft=14, living_side=S, open_side=E | aspect 1.00 · compactness 0.80 · shape_factor 6.56 · south_glazing 0.00 · circulation 0.06 · outdoor 0.16 · levels 1.00 | none |
| V06 | most different | court_w_ft=22, court_d_ft=24, ring_ft=14, living_side=S, open_side=E | aspect 1.04 · compactness 0.75 · shape_factor 6.92 · south_glazing 0.00 · circulation 0.07 · outdoor 0.21 · levels 1.00 | none |

## Dropped (first error each)

- {'court_w_ft': 18, 'court_d_ft': 14, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1344 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 14, 'court_d_ft': 18, 'ring_ft': 12, 'living_side': 'S', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1344 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 14, 'court_d_ft': 24, 'ring_ft': 12, 'living_side': 'S', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1488 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 22, 'court_d_ft': 18, 'ring_ft': 16, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 2189 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 14, 'court_d_ft': 18, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1344 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 28, 'court_d_ft': 18, 'ring_ft': 16, 'living_side': 'S', 'open_side': 'E'}: Z-SETBACK-1 L1/PANTRY: room extends into a setback (check projections such as eaves separately)
- {'court_w_ft': 28, 'court_d_ft': 14, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1517 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 22, 'court_d_ft': 24, 'ring_ft': 16, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 2342 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 14, 'court_d_ft': 18, 'ring_ft': 14, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1579 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 18, 'court_d_ft': 24, 'ring_ft': 12, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1469 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 18, 'court_d_ft': 24, 'ring_ft': 16, 'living_side': 'N', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 2368 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 14, 'court_d_ft': 14, 'ring_ft': 14, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1490 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 22, 'court_d_ft': 24, 'ring_ft': 16, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 2342 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 22, 'court_d_ft': 14, 'ring_ft': 12, 'living_side': 'S', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1440 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 14, 'court_d_ft': 18, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1258 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 28, 'court_d_ft': 14, 'ring_ft': 16, 'living_side': 'N', 'open_side': 'none'}: Z-SETBACK-1 L1/PANTRY: room extends into a setback (check projections such as eaves separately)
- {'court_w_ft': 22, 'court_d_ft': 14, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1440 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 28, 'court_d_ft': 18, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1594 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 22, 'court_d_ft': 14, 'ring_ft': 12, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1373 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 28, 'court_d_ft': 14, 'ring_ft': 16, 'living_side': 'S', 'open_side': 'none'}: Z-SETBACK-1 L1/PANTRY: room extends into a setback (check projections such as eaves separately)
- {'court_w_ft': 18, 'court_d_ft': 18, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1440 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 14, 'court_d_ft': 14, 'ring_ft': 14, 'living_side': 'N', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1568 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 28, 'court_d_ft': 14, 'ring_ft': 16, 'living_side': 'N', 'open_side': 'E'}: Z-SETBACK-1 L1/PANTRY: room extends into a setback (check projections such as eaves separately)
- {'court_w_ft': 14, 'court_d_ft': 14, 'ring_ft': 14, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1490 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 18, 'court_d_ft': 24, 'ring_ft': 16, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 2214 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 28, 'court_d_ft': 18, 'ring_ft': 16, 'living_side': 'S', 'open_side': 'none'}: Z-SETBACK-1 L1/PANTRY: room extends into a setback (check projections such as eaves separately)
- {'court_w_ft': 18, 'court_d_ft': 14, 'ring_ft': 12, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1277 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 18, 'court_d_ft': 24, 'ring_ft': 16, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 2214 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 18, 'court_d_ft': 14, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1277 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 28, 'court_d_ft': 14, 'ring_ft': 12, 'living_side': 'S', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1584 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 22, 'court_d_ft': 18, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1450 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 14, 'court_d_ft': 18, 'ring_ft': 12, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1258 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 28, 'court_d_ft': 24, 'ring_ft': 16, 'living_side': 'S', 'open_side': 'E'}: Z-SETBACK-1 L1/PANTRY: room extends into a setback (check projections such as eaves separately)
- {'court_w_ft': 28, 'court_d_ft': 24, 'ring_ft': 14, 'living_side': 'N', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 2240 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 28, 'court_d_ft': 24, 'ring_ft': 16, 'living_side': 'S', 'open_side': 'none'}: Z-SETBACK-1 L1/PANTRY: room extends into a setback (check projections such as eaves separately)
- {'court_w_ft': 28, 'court_d_ft': 18, 'ring_ft': 12, 'living_side': 'S', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1594 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 14, 'court_d_ft': 24, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1488 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 18, 'court_d_ft': 24, 'ring_ft': 12, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 1469 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 18, 'court_d_ft': 24, 'ring_ft': 16, 'living_side': 'S', 'open_side': 'none'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 2368 sq ft is outside the budget 1900 ± 15%
- {'court_w_ft': 22, 'court_d_ft': 18, 'ring_ft': 16, 'living_side': 'N', 'open_side': 'E'}: CR-HARD-1 project.area_budget_sqft: net conditioned area 2189 sq ft is outside the budget 1900 ± 15%
