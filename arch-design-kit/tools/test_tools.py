#!/usr/bin/env python3
"""Tests for the kit's tools. Run: python3 -m unittest discover -s tools -p "test_*.py"

Each broken fixture must fail with the rule ID the playbook gives it, so a rule cannot
quietly stop being enforced. IFC tests skip when ifcopenshell is not installed.
"""
from __future__ import annotations

import copy
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from check_design import Checker, load, fmt, window_spans  # noqa: E402

EXAMPLE = HERE.parent / "examples" / "ranch-3bed" / "design.yaml"
PLAYBOOK_RULES = HERE.parent / "playbook" / "RULES.md"


def rules(spec: dict, severity: str | None = None) -> set[str]:
    return {f.rule for f in Checker(spec).run() if severity is None or f.severity == severity}


def two_story() -> dict:
    """A small two-story fixture with a stair, used to exercise level-to-level rules."""
    return {
        "project": {"name": "two-story", "units": "in"},
        "levels": [
            {"id": "L1", "elevation_in": 0, "ceiling_in": 108,
             "egress_doors": [{"id": "D1", "clear_width_in": 34, "clear_height_in": 80}],
             "alarms": [{"type": "smoke", "room": "LIV"}],
             "rooms": [{"id": "LIV", "type": "living", "rect": [0, 0, 288, 240],
                        "windows": [{"wall": "S", "width_in": 72, "height_in": 72, "sill_in": 18}]}],
             "stairs": [{"id": "ST1", "to_level": "L2", "risers": 16, "tread_in": 10.5, "width_in": 40,
                         "headroom_in": 84, "handrail_in": 36, "rect": [0, 240, 40, 168]}]},
            {"id": "L2", "elevation_in": 120, "ceiling_in": 96,
             "alarms": [{"type": "smoke", "room": "BR1"}, {"type": "smoke", "room": "HALL"}],
             "rooms": [{"id": "BR1", "type": "bedroom", "rect": [0, 0, 144, 144],
                        "windows": [{"wall": "S", "width_in": 30, "height_in": 60, "sill_in": 24,
                                     "egress": {"net_clear_w_in": 26, "net_clear_h_in": 40}}]},
                       {"id": "HALL", "type": "hall", "rect": [144, 0, 42, 144]}]},
        ],
    }


class ExampleSpec(unittest.TestCase):
    def test_example_has_no_errors(self):
        spec = load(str(EXAMPLE))
        errors = [f for f in Checker(spec).run() if f.severity == "ERROR"]
        self.assertEqual(errors, [], errors)

    def test_two_story_fixture_is_clean(self):
        self.assertEqual(rules(two_story(), "ERROR"), set())


class CodeRules(unittest.TestCase):
    def setUp(self):
        self.spec = load(str(EXAMPLE))
        self.rooms = {r["id"]: r for r in self.spec["levels"][0]["rooms"]}

    def test_units_must_be_declared(self):
        del self.spec["project"]["units"]
        self.assertIn("G-UNITS-1", rules(self.spec, "ERROR"))

    def test_small_bedroom(self):
        self.rooms["BR2"]["rect"] = [0, 0, 80, 120]
        found = rules(self.spec, "ERROR")
        self.assertIn("C-ROOM-1", found)   # 66.7 sq ft
        self.assertIn("C-ROOM-2", found)   # 6'-8" least dimension

    def test_low_ceiling_and_bath_exception(self):
        self.spec["levels"][0]["ceiling_in"] = 82          # 6'-10": fails rooms, passes baths/laundry
        findings = Checker(self.spec).run()
        where = {f.where for f in findings if f.rule == "C-CEIL-1" and f.severity == "ERROR"}
        self.assertIn("L1/GREAT", where)
        self.assertNotIn("L1/BATH2", where)
        self.assertNotIn("L1/LAUNDRY", where)

    def test_egress_window_too_small_and_sill_too_high(self):
        win = self.rooms["BR2"]["windows"][0]
        win["egress"] = {"net_clear_w_in": 18, "net_clear_h_in": 30}
        win["sill_in"] = 48
        found = rules(self.spec, "ERROR")
        self.assertTrue({"C-EGR-1", "C-EGR-2", "C-EGR-3", "C-EGR-4"} <= found, found)

    def test_bedroom_without_egress(self):
        for w in self.rooms["BR3"]["windows"]:
            w.pop("egress", None)
        self.assertIn("C-EGR-1", rules(self.spec, "ERROR"))

    def test_narrow_hall(self):
        self.rooms["HALL"]["rect"][2] = 32
        self.assertIn("C-HALL-1", rules(self.spec, "ERROR"))

    def test_egress_door(self):
        self.spec["levels"][0]["egress_doors"][0]["clear_width_in"] = 30
        self.assertIn("C-DOOR-1", rules(self.spec, "ERROR"))
        self.spec["levels"][0]["egress_doors"] = []
        self.assertIn("C-DOOR-1", rules(self.spec, "ERROR"))

    def test_bath_clearances(self):
        self.rooms["PBATH"]["fixtures"]["wc"]["side_clear_in"] = 12
        self.rooms["PBATH"]["fixtures"]["shower"] = {"w_in": 28, "d_in": 30}
        found = rules(self.spec, "ERROR")
        self.assertIn("C-BATH-1", found)
        self.assertIn("C-BATH-2", found)

    def test_alarms(self):
        lv = self.spec["levels"][0]
        lv["alarms"] = [a for a in lv["alarms"] if a["room"] != "BR3"]
        self.assertIn("C-ALARM-1", rules(self.spec, "ERROR"))
        lv["alarms"] = [{"type": "smoke", "room": r} for r in ("BR2", "BR3", "PRIMARY", "HALL")]
        self.assertIn("C-ALARM-3", rules(self.spec, "ERROR"))  # attached garage needs CO outside bedrooms

    def test_garage_into_bedroom(self):
        self.rooms["GARAGE"]["opens_to"] = ["PRIMARY"]
        self.assertIn("C-GAR-2", rules(self.spec, "ERROR"))
        del self.spec["levels"][0]["garage_separation"]
        self.assertIn("C-GAR-1", rules(self.spec, "WARN"))

    def test_window_into_garage(self):
        self.rooms["PRIMARY"]["windows"][2].pop("offset_in")
        self.assertIn("G-WIN-1", rules(self.spec, "ERROR"))

    def test_window_past_wall_end(self):
        self.rooms["BR2"]["windows"][1]["offset_in"] = 120
        self.assertIn("G-WIN-1", rules(self.spec, "ERROR"))

    def test_unreachable_room(self):
        del self.rooms["BR3"]["doors"]
        found = Checker(self.spec).run()
        self.assertIn(("G-CONN-1", "L1/BR3"), {(f.rule, f.where) for f in found if f.severity == "ERROR"})

    def test_door_on_a_wall_the_rooms_do_not_share(self):
        self.rooms["BR2"]["doors"] = [{"to": "KITCHEN", "width_in": 32}]
        self.assertIn("G-CONN-1", rules(self.spec, "ERROR"))

    def test_door_too_wide_for_shared_wall(self):
        self.rooms["BR2"]["doors"] = [{"to": "HALL", "width_in": 36}]   # shares only 36 in. with the hall
        self.assertIn("G-CONN-1", rules(self.spec, "ERROR"))

    def test_overlap(self):
        self.rooms["BR2"]["rect"] = [0, 0, 150, 132]  # runs into the hall/linen
        self.assertIn("G-OVERLAP-1", rules(self.spec, "ERROR"))

    def test_setbacks(self):
        self.spec["site"]["building_origin_in"] = [40, 600]
        self.assertIn("Z-SETBACK-1", rules(self.spec, "ERROR"))

    def test_kitchen_aisle(self):
        self.rooms["KITCHEN"]["kitchen"]["work_aisle_in"] = 40
        self.assertIn("SP-KIT-1", rules(self.spec, "WARN"))

    def test_window_fall_protection(self):
        win = self.rooms["GREAT"]["windows"][0]
        win["above_grade_in"] = 120
        self.assertIn("C-GUARD-2", rules(self.spec, "ERROR"))
        win["fall_protection"] = True
        self.assertNotIn("C-GUARD-2", rules(self.spec, "ERROR"))

    def test_local_override(self):
        self.spec["limits"] = {"hall_min_w_in": {"value": 44, "reason": "local amendment"}}
        self.assertIn("C-HALL-1", rules(self.spec, "ERROR"))

    def test_mm_units(self):
        spec = copy.deepcopy(two_story())
        spec["project"]["units"] = "mm"
        for lv in spec["levels"]:
            lv["elevation_in"] *= 25.4
            lv["ceiling_in"] *= 25.4
            for r in lv["rooms"]:
                r["rect"] = [v * 25.4 for v in r["rect"]]
                for w in r.get("windows", []):
                    for key in ("width_in", "height_in", "sill_in"):
                        w[key] *= 25.4
                    if "egress" in w:
                        w["egress"] = {k: v * 25.4 for k, v in w["egress"].items()}
            for d in lv.get("egress_doors", []):
                d["clear_width_in"] *= 25.4
                d["clear_height_in"] *= 25.4
            for st in lv.get("stairs", []):
                for key in ("tread_in", "width_in", "headroom_in", "handrail_in"):
                    st[key] *= 25.4
                st["rect"] = [v * 25.4 for v in st["rect"]]
        self.assertEqual(rules(spec, "ERROR"), set())


class StairAndStackRules(unittest.TestCase):
    def test_riser_too_tall(self):
        spec = two_story()
        spec["levels"][0]["stairs"][0]["risers"] = 14     # 120 / 14 = 8.57 in
        self.assertIn("C-STAIR-2", rules(spec, "ERROR"))

    def test_run_does_not_fit(self):
        spec = two_story()
        spec["levels"][0]["stairs"][0]["rect"] = [0, 240, 40, 120]   # needs 15 x 10.5 = 157.5 in
        self.assertIn("C-STAIR-6", rules(spec, "ERROR"))

    def test_stair_width_headroom_handrail_tread(self):
        spec = two_story()
        st = spec["levels"][0]["stairs"][0]
        st.update(width_in=34, headroom_in=76, handrail_in=40, tread_in=9.5)
        self.assertTrue({"C-STAIR-1", "C-STAIR-3", "C-STAIR-4", "C-STAIR-5"} <= rules(spec, "ERROR"))

    def test_cantilever_and_span(self):
        spec = two_story()
        spec["levels"][1]["rooms"].append({"id": "BONUS", "type": "bonus", "rect": [186, 0, 140, 144]})
        spec["levels"][1]["alarms"].append({"type": "smoke", "room": "BONUS"})
        found = rules(spec, "WARN")
        self.assertIn("S-STACK-1", found)  # BONUS runs 38 in past the living room below
        self.assertIn("S-SPAN-1", found)   # LIV is 20 ft clear under a floor

    def test_guard(self):
        spec = two_story()
        spec["levels"][1]["guards"] = [{"id": "LOFT", "drop_in": 120, "height_in": 34}]
        self.assertIn("C-GUARD-1", rules(spec, "ERROR"))


class Helpers(unittest.TestCase):
    def test_fmt(self):
        self.assertEqual(fmt(98.5), "8'-2 1/2\"")
        self.assertEqual(fmt(11.9999), "1'-0\"")
        self.assertEqual(fmt(7.75), "7 3/4\"")

    def test_window_spans_even_and_offset(self):
        room = {"rect": [0, 0, 120, 100], "windows": [{"wall": "S", "width_in": 30}, {"wall": "S", "width_in": 30},
                                                        {"wall": "E", "width_in": 24, "offset_in": 10}]}
        spans = [(w, a, b, line) for _, w, a, b, line in window_spans(room)]
        self.assertIn(("S", 25.0, 55.0, 0.0), spans)
        self.assertIn(("S", 65.0, 95.0, 0.0), spans)
        self.assertIn(("E", 10.0, 34.0, 120.0), spans)


class RulesAreDocumented(unittest.TestCase):
    ID = r"\b([A-Z]{1,2}-[A-Z]+-\d)\b"

    def ids(self, text: str) -> set[str]:
        import re
        return set(re.findall(self.ID, text))

    def registered(self) -> set[str]:
        """IDs defined in RULES.md: the first cell of a table row."""
        import re
        return set(re.findall(r"^\| ([A-Z]{1,2}-[A-Z]+-\d) \|", PLAYBOOK_RULES.read_text(), re.M))

    def test_every_checker_rule_is_in_the_playbook(self):
        """Every rule ID the checker can emit has an entry in playbook/RULES.md."""
        import re
        src = (HERE / "check_design.py").read_text()
        emitted = set(re.findall(r'"([A-Z]{1,2}-[A-Z]+-\d)"', src))
        self.assertEqual(emitted - self.registered(), set(), "rule IDs missing from playbook/RULES.md")

    def test_kit_cites_only_registered_rules(self):
        """No chapter, template, guide or skill cites a rule ID that RULES.md doesn't define."""
        kit = HERE.parent
        files = [p for p in kit.rglob("*.md") if "research" not in p.parts] + [kit / "templates" / "design.yaml"]
        cited = {}
        for p in files:
            for rule in self.ids(p.read_text()):
                cited.setdefault(rule, p.relative_to(kit))
        unknown = {r: str(p) for r, p in cited.items() if r not in self.registered()}
        self.assertEqual(unknown, {}, "cited rule IDs not defined in playbook/RULES.md")

    def test_every_registered_rule_is_explained_in_a_chapter(self):
        chapters = "".join(p.read_text() for p in (HERE.parent / "playbook").glob("0*.md"))
        self.assertEqual(self.registered() - self.ids(chapters), set(), "rules with no chapter text")


class Templates(unittest.TestCase):
    def test_spec_template_runs_clean(self):
        spec = load(str(HERE.parent / "templates" / "design.yaml"))
        self.assertEqual(rules(spec, "ERROR"), set())

    def test_empty_lists_do_not_crash(self):
        spec = {"project": {"units": "in"}, "levels": [{"id": "L1", "rooms": None, "stairs": None,
                                                        "alarms": None, "egress_doors": None}]}
        self.assertIn("C-DOOR-1", rules(spec, "ERROR"))


class Outputs(unittest.TestCase):
    def test_render_plan(self):
        import render_plan
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(render_plan.main([str(EXAMPLE), tmp]), 0)
            svg = (Path(tmp) / "L1-plan.svg").read_text()
            self.assertIn("PRIMARY BEDROOM", svg)
            self.assertEqual(svg.count(">E<"), 3)   # three egress windows marked
            self.assertIn(">D-ENTRY<", svg)        # the front door is drawn

    def test_ifc_export(self):
        try:
            import ifcopenshell  # noqa: F401
        except ImportError:
            self.skipTest("ifcopenshell not installed")
        import spec_to_ifc
        f = spec_to_ifc.build(load(str(EXAMPLE)))
        self.assertEqual(len(f.by_type("IfcSpace")), 16)
        self.assertEqual(len(f.by_type("IfcWindow")), 12)
        self.assertEqual(len(f.by_type("IfcDoor")), 12)   # 10 interior + garage + front door
        for el in f.by_type("IfcDoor") + f.by_type("IfcWindow"):
            self.assertTrue(el.FillsVoids, f"{el.Name} is not hosted in an opening")
        ext = [w for w in f.by_type("IfcWall") if w.Name.startswith("EXT")]
        self.assertGreaterEqual(len(ext), 6)


class CreativeLayer(unittest.TestCase):
    """Playbook 08: the readiness gate, the hook and the variant explorer."""

    def fresh_project(self, tmp: str) -> Path:
        import shutil
        proj = Path(tmp) / "proj"
        shutil.copytree(HERE.parent / "templates", proj)
        return proj

    def fill(self, proj: Path) -> None:
        brief = (proj / "PROJECT-BRIEF.md").read_text().replace("<project name>", "Oak Hill")
        for i, line in enumerate([l for l in brief.splitlines() if l.rstrip().endswith(":") and l.startswith("- ")][:8]):
            brief = brief.replace(line, f"{line} answer {i}", 1)
        (proj / "PROJECT-BRIEF.md").write_text(brief)
        program = (proj / "PROGRAM.md").read_text().replace(
            "| … | | | | | | | |",
            "\n".join(f"| R{i} | Room {i} | bedroom | 11×12 | 132 | x | bed | |" for i in range(6)))
        (proj / "PROGRAM.md").write_text(program)
        taste = (proj / "TASTE.md").read_text()
        starred = [l for l in taste.splitlines() if l.startswith("- ★")][:5]
        for line in starred:
            taste = taste.replace(line, line + (" 4" if "dial" in line else " because I love light"), 1)
        (proj / "TASTE.md").write_text(taste)
        (proj / "PRECEDENTS.md").write_text((proj / "PRECEDENTS.md").read_text()
                                            + "\n### Magney House\n- Move to take: roof\n### Azuma House\n- Move to take: court\n")

    def test_blank_project_is_not_ready(self):
        import ready_check
        with tempfile.TemporaryDirectory() as tmp:
            result = ready_check.check(self.fresh_project(tmp))
            self.assertFalse(result["ready"])
            self.assertEqual(set(result["missing"]), {"brief", "program", "taste", "precedents", "concept"})

    def test_filled_project_with_concept_is_ready(self):
        import ready_check
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)
            self.fill(proj)
            self.assertEqual(ready_check.check(proj)["missing"], ["concept"])
            spec = (proj / "design.yaml").read_text().replace(
                "    status: exploring", "    status: chosen").replace(
                "    statement:                    #", '    statement: "A house that is one long wall."  #')
            (proj / "design.yaml").write_text(spec)
            self.assertTrue(ready_check.check(proj)["ready"], ready_check.check(proj)["items"])

    def test_deliberate_skip_counts_as_decided(self):
        import ready_check
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)
            self.fill(proj)
            spec = (proj / "design.yaml").read_text().replace("    status: exploring", "    status: skipped").replace(
                '    # skip_reason: "owner wants a straightforward builder-style plan"',
                '    skip_reason: "owner wants a builder plan"')
            (proj / "design.yaml").write_text(spec)
            self.assertTrue(ready_check.check(proj)["concept_decided"])

    def test_hook_warns_once_and_only_for_design_prompts(self):
        import json
        import subprocess
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)

            def run(prompt, session):
                event = json.dumps({"prompt": prompt, "cwd": str(proj), "session_id": session})
                return subprocess.run([sys.executable, str(HERE / "ready_check.py"), "--hook"], input=event,
                                      capture_output=True, text=True, timeout=30)
            first = run("lay out the floor plan", f"s-{tmp}")
            self.assertEqual(first.returncode, 0)
            self.assertIn("CR-GATE-1", first.stdout)
            self.assertEqual(run("lay out the floor plan", f"s-{tmp}").stdout, "")   # once per session
            self.assertEqual(run("what time is it?", f"t-{tmp}").stdout, "")           # not a design prompt
            bad = subprocess.run([sys.executable, str(HERE / "ready_check.py"), "--hook"], input="not json",
                                 capture_output=True, text=True, timeout=30)
            self.assertEqual((bad.returncode, bad.stdout), (0, ""))                     # never breaks a session

    def test_hook_file_points_at_the_script(self):
        import json
        hooks = json.loads((HERE.parent / "hooks" / "hooks.json").read_text())
        command = hooks["hooks"]["UserPromptSubmit"][0]["hooks"][0]["command"]
        self.assertIn("tools/ready_check.py", command)
        self.assertTrue((HERE / "ready_check.py").exists())

    def test_checker_warns_without_a_concept(self):
        spec = load(str(HERE.parent / "templates" / "design.yaml"))
        self.assertIn("CR-GATE-1", rules(spec, "WARN"))
        self.assertNotIn("CR-GATE-1", rules(load(str(EXAMPLE)), "WARN"))

    def test_explorer_keeps_different_partis_that_pass(self):
        import explore_variants
        with tempfile.TemporaryDirectory() as tmp:
            gen = HERE.parent / "examples" / "bar-house" / "variants.py"
            self.assertEqual(explore_variants.main([str(gen), "--n", "200", "--keep", "6", "--out", tmp]), 0)
            kept = sorted(Path(tmp).glob("V*.yaml"))
            self.assertEqual(len(kept), 6)
            partis = {load(str(p))["project"]["name"].split("·")[1].strip() for p in kept}
            self.assertEqual(partis, {"linear", "L", "U"})        # range, not six copies of one idea
            for p in kept:
                self.assertEqual(rules(load(str(p)), "ERROR"), set())
            self.assertTrue((Path(tmp) / "index.html").exists())


class FreeCADLoader(unittest.TestCase):
    """Runs tools/freecad_load_ifc.py in a real FreeCAD. Set FREECADCMD to its freecadcmd binary
    (or have freecadcmd on PATH); skipped otherwise."""

    def test_freecad_sees_what_the_spec_says(self):
        import json
        import os
        import shutil
        import subprocess
        try:
            import spec_to_ifc
        except SystemExit:
            self.skipTest("ifcopenshell not installed")
        exe = os.environ.get("FREECADCMD") or shutil.which("freecadcmd")
        if not exe:
            self.skipTest("freecadcmd not available")
        with tempfile.TemporaryDirectory() as tmp:
            ifc = Path(tmp) / "model.ifc"
            spec_to_ifc.build(load(str(EXAMPLE))).write(str(ifc))
            env = dict(os.environ, IFC_PATH=str(ifc), FCSTD_PATH=str(Path(tmp) / "model.FCStd"))
            out = subprocess.run([exe, str(HERE / "freecad_load_ifc.py")], env=env, capture_output=True,
                                 text=True, timeout=600, cwd=tmp).stdout
            line = next((l for l in out.splitlines() if l.startswith("FREECAD_LOAD_IFC")), None)
            self.assertIsNotNone(line, out[-2000:])
            report = json.loads(line.split(" ", 1)[1].replace("'", '"').replace("None", "null"))
            counts = {k.replace("Ifc", ""): v for k, v in report["counts"].items()}
            self.assertEqual((counts.get("Space"), counts.get("Window"), counts.get("Door")), (16, 12, 12))
            self.assertEqual(report["invalid_shapes"], [])
            self.assertEqual(report["missing_shapes"], [])
            self.assertTrue((Path(tmp) / "model.FCStd").exists())


if __name__ == "__main__":
    unittest.main()
