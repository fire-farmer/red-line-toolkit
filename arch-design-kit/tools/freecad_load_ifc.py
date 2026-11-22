"""freecad_load_ifc.py: open the kit's IFC model in FreeCAD and report what FreeCAD actually loaded.

Runs INSIDE FreeCAD (1.0 or later; 0.21 also works through the old import path). Two ways:

1. Live, in your FreeCAD session, through freecad-mcp's `execute_code` tool (it returns a
   screenshot too; pass view_name="Top" for a plan view):

       exec(open("<KIT>/tools/freecad_load_ifc.py").read())
       print(load_ifc("<PROJECT>/out/model.ifc", doc_name="Design", view="Top"))

2. Headless, with freecadcmd (or freecad-mcp's `execute_code_headless`), e.g. to save an
   .FCStd for someone else or to check the import in CI:

       IFC_PATH=out/model.ifc FCSTD_PATH=out/model.FCStd freecadcmd <KIT>/tools/freecad_load_ifc.py

The report is the point (playbook W-CHECK-1, G-SOLID-1). It counts what FreeCAD built by IFC
class and lists walls, slabs, doors and windows with missing or invalid shapes, so Claude compares
numbers against the spec instead of trusting a screenshot. (Spaces are counted but not
shape-checked: NativeIFC doesn't build solids for IfcSpace.) Reloading closes the previous copy of the document first, so the FreeCAD view
always mirrors the current spec (W-SPEC-1): edit design.yaml, regenerate the IFC, load again.

Needs IfcOpenShell importable from FreeCAD's own Python. FreeCAD's installers bundle it; some
package builds (e.g. conda-forge) need it added: `conda install -c conda-forge ifcopenshell`
into the same environment. Tested headless on FreeCAD 1.1.3 + IfcOpenShell 0.8.5 (conda-forge),
where the legacy importer fails (it calls an IfcOpenShell 0.7 settings name) and NativeIFC works.
"""
import os

import FreeCAD


def _import(ifc_path, doc_name):
    """Import with NativeIFC (FreeCAD 1.0+, works with IfcOpenShell 0.8 and keeps the IFC lossless);
    fall back to the legacy importer (FreeCAD 0.21, or 1.x paired with IfcOpenShell 0.7)."""
    try:
        from nativeifc import ifc_import
        # strategy 2 = all children, shapemode 0 = full shapes, silent = no options dialog
        ifc_import.insert(ifc_path, doc_name, strategy=2, shapemode=0, switchwb=False, silent=True,
                          singledoc=False)
        return "NativeIFC"
    except ImportError:
        pass
    try:
        from importers import importIFC  # FreeCAD 1.0+ legacy importer
    except ImportError:
        import importIFC  # FreeCAD 0.19-0.21 (Arch workbench)
    importIFC.insert(ifc_path, doc_name)
    return "legacy importIFC"


def load_ifc(ifc_path, doc_name="Design", fcstd_path=None, view="Top"):
    """Import ifc_path into a fresh document named doc_name and return a summary dict."""
    ifc_path = os.path.abspath(ifc_path)
    if not os.path.exists(ifc_path):
        raise FileNotFoundError(ifc_path)
    if doc_name in FreeCAD.listDocuments():
        FreeCAD.closeDocument(doc_name)  # reload semantics: the doc mirrors the current spec
    doc = FreeCAD.newDocument(doc_name)
    importer = _import(ifc_path, doc.Name)
    doc.recompute()

    counts, invalid, no_shape = {}, [], []
    for obj in doc.Objects:
        ifc_class = getattr(obj, "IfcClass", None) or getattr(obj, "IfcType", None)
        if not ifc_class:
            continue
        counts[ifc_class] = counts.get(ifc_class, 0) + 1
        shape = getattr(obj, "Shape", None)
        if shape is None or ifc_class.replace("Ifc", "") not in ("Wall", "Slab", "Door", "Window"):
            continue
        if shape.isNull():
            no_shape.append(obj.Label)
        elif not shape.isValid():
            invalid.append(obj.Label)

    if FreeCAD.GuiUp:
        import FreeCADGui
        view_obj = FreeCADGui.getDocument(doc.Name).ActiveView
        {"Top": view_obj.viewTop, "Front": view_obj.viewFront,
         "Isometric": view_obj.viewIsometric}.get(view, view_obj.viewIsometric)()
        FreeCADGui.SendMsgToActiveView("ViewFit")

    if fcstd_path:
        doc.saveAs(os.path.abspath(fcstd_path))
    return {"document": doc.Name, "importer": importer, "ifc": ifc_path,
            "counts": dict(sorted(counts.items())), "invalid_shapes": invalid,
            "missing_shapes": no_shape, "saved": os.path.abspath(fcstd_path) if fcstd_path else None}


if os.environ.get("IFC_PATH"):  # headless entry point (freecadcmd)
    print("FREECAD_LOAD_IFC", load_ifc(os.environ["IFC_PATH"], os.environ.get("DOC_NAME", "Design"),
                                       os.environ.get("FCSTD_PATH")))
