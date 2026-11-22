# FreeCAD: the kit's desktop modeling app

FreeCAD is where you see the design in 3D, adjust it, and (from design development on) carry the BIM model forward. Claude drives it through the community [`freecad-mcp`](https://github.com/neka-nat/freecad-mcp) server. The kit's spec, checker and IFC exporter stay in charge of the numbers.

**Why FreeCAD and not SketchUp:** FreeCAD is free and open source, and it reads and writes real BIM (IFC) through IfcOpenShell, the same library `tools/spec_to_ifc.py` uses. It edits existing models, and Claude can run Python inside it. The official SketchUp connector creates new models only and drifts dimensions, so it stays optional for sketches away from your desk ([INTERNAL-TOOLS-SURVEY.md](INTERNAL-TOOLS-SURVEY.md)).

## Verified here

Tested headless on **FreeCAD 1.1.3 with IfcOpenShell 0.8.5** (conda-forge, Linux). The kit's example model (`examples/ranch-3bed/out/model.ifc`) loads completely through `tools/freecad_load_ifc.py`:

```
importer: NativeIFC
counts: IfcBuilding 1 · IfcBuildingStorey 1 · IfcSpace 16 · IfcWall 21 · IfcDoor 12 · IfcWindow 12 · IfcSlab 1
invalid_shapes: []   missing_shapes: []
```

That matches the spec: 16 rooms, 12 windows, 10 interior doors + the garage door + the front door. Two version traps turned up on the way:

- **`import importIFC` no longer works in FreeCAD 1.x.** The legacy importer moved to `from importers import importIFC`.
- **On FreeCAD 1.1.3 with IfcOpenShell 0.8, the legacy importer fails** (`'Settings' object has no attribute 'USE_BREP_DATA'`), because it calls an IfcOpenShell 0.7 setting. **NativeIFC works**, so the loader tries NativeIFC first and falls back to the legacy importer.

The live MCP path (your FreeCAD GUI + `freecad-mcp`) has not been exercised from here, because this cloud session can't reach your computer. The first time through on your machine, run the setup check below.

## Setup check (once, on your computer)

1. **FreeCAD has IfcOpenShell.** In FreeCAD's Python console: `import ifcopenshell; ifcopenshell.version`. The official FreeCAD installers bundle it. If you installed from conda-forge, add it with `conda install -c conda-forge ifcopenshell` in the same environment.
2. **The RPC server runs.** In FreeCAD, open the MCP Addon workbench → *Start RPC Server*, and tick *Auto-Start Server* so it starts with FreeCAD. It listens on `localhost:9875`.
3. **Secure it.** `execute_code` runs arbitrary Python in FreeCAD. Keep *Remote Connections* off (localhost only), set an auth token (*Set Auth Token* in FreeCAD, plus `FREECAD_MCP_TOKEN` in the client config), and connect one MCP client at a time.
4. **Register it with Claude Code as well as Claude Desktop.** That way the same session that edits `design.yaml` and runs the checker can also drive FreeCAD:

   ```bash
   claude mcp add freecad -e FREECAD_MCP_TOKEN=<token> -- uvx freecad-mcp --only-text-feedback
   ```

   `--only-text-feedback` drops the automatic screenshot from every tool reply. Images cost about 4× more and crowd the context, so Claude calls `get_view` when it actually needs to look. This follows the "numbers first, then one picture" rule (W-LOOK-1).
5. **Smoke test.** Ask Claude: *"Use the FreeCAD MCP to load `<KIT>/examples/ranch-3bed/out/model.ifc` with the kit's loader, report the counts, then get_view Top."* You should see the counts above and the plan.

## The loop with FreeCAD

```
1 SPEC      edit design.yaml (one change)                                  W-SPEC-1
2 CHECK     python3 <KIT>/tools/check_design.py design.yaml → 0 errors     W-CHECK-1
3 GENERATE  python3 <KIT>/tools/spec_to_ifc.py design.yaml out/model.ifc
4 LOAD      MCP execute_code:
              exec(open("<KIT>/tools/freecad_load_ifc.py").read())
              print(load_ifc("<PROJECT>/out/model.ifc", doc_name="Design"))
            → compare the counts with the spec; any invalid or missing shape is an ERROR  G-SOLID-1
5 LOOK      MCP get_view("Top") for the plan, get_view("Isometric") or ("Dimetric") for massing.
            Write the questions first, then look                           W-LOOK-1
6 RECORD    DECISIONS.md; keep the last passing version                    W-DEC-1, D-NAME-1
```

`load_ifc` closes and reloads the document each time, so FreeCAD always shows the current spec.

### Who owns the geometry: a decision per phase

- **Programming and schematic design:** `design.yaml` is the master and FreeCAD is the viewer. **Don't edit geometry in FreeCAD in these phases.** The next reload discards it. If you like a change you made in FreeCAD, tell Claude, and Claude puts it into the spec.
- **Design development and later (optional switch):** once the layout is locked (Gate 2), you may make the FreeCAD/NativeIFC model the master, to add wall types, real openings, stairs, roof and details in the BIM workbench. Record the switch in `DECISIONS.md`: freeze the spec, and set `project.master: freecad` in `design.yaml` as a note. After that:
  - The spec checker no longer sees changes. Re-check the model with `load_ifc` counts and IfcOpenShell queries against the playbook rules. Claude can write these on demand, for example "every IfcDoor fills an opening", "egress windows have net clear ≥ 5.7 sq ft" or "storey elevations match".
  - Save the IFC from FreeCAD (NativeIFC writes back to the `.ifc` losslessly) and keep a versioned copy per issue (D-NAME-1).

## Units

The spec is in inches, IFC stores metres, and FreeCAD works internally in millimetres. The IFC carries its units, so importing needs no conversion. When Claude writes FreeCAD Python directly, it uses unit-aware quantities, such as `FreeCAD.Units.Quantity("11 ft")` or `App.Units.parseQuantity("3 ft 6 in")`. It never puts bare numbers into FreeCAD (D-UNITS-1, W-PARAM-1).

## FreeCAD-specific prompts

> **Load and check.** Run the checker, regenerate out/model.ifc, then load it in FreeCAD through the MCP with the kit's loader. Report the counts next to what the spec expects (rooms, windows, doors) and list any mismatch. Then get_view Top and answer: is every bedroom door off the hall, and does any door swing into another?

> **Massing look.** get_view Dimetric of the Design document. Using the modern-farmhouse style module, tell me whether the roof form and window rhythm read right. Make suggestions as spec changes, and don't apply any yet.

> **DD in FreeCAD (after Gate 2, master switched).** In the FreeCAD document, replace the schematic exterior walls with a 2×6 + 1 in. continuous-insulation wall type. Afterwards, run an IfcOpenShell check that every exterior wall has Pset_WallCommon.IsExternal = True and that the window count is unchanged. Report the numbers.

> **Headless (no GUI).** Use execute_code_headless to run the kit's loader on out/model.ifc and save out/model.FCStd for the engineer. Report the counts.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `No module named 'ifcopenshell'` | FreeCAD's Python lacks IfcOpenShell | Install it into FreeCAD's own environment (see setup step 1) |
| `No module named 'importIFC'` | FreeCAD 1.x moved it | Use the kit's loader (it handles both paths) |
| `'Settings' object has no attribute 'USE_BREP_DATA'` | The legacy importer with IfcOpenShell 0.8 | Use the kit's loader, which tries NativeIFC first |
| MCP tools time out | RPC server not running, or a long recompute | Start the RPC server; for big models, use `execute_code` with a longer `timeout` or `execute_code_async` |
| Screenshot shows an old state | The document wasn't reloaded | Call `load_ifc` again; it closes the old document first |
