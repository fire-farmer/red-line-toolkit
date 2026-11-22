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
    """Playbook 08: the readiness gate and hook, concept mode, invariants and the concept tools.
    Several tests pin defects found by the Fable audit so they can't quietly return."""

    STATEMENT = "Every room opens onto one long garden wall that holds the family's books."

    def fresh_project(self, tmp: str, name: str = "proj") -> Path:
        import shutil
        proj = Path(tmp) / name
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
        for line in [l for l in taste.splitlines() if l.startswith("- ★")][:5]:
            taste = taste.replace(line, line + (" 4" if "dial" in line else " because I love light"), 1)
        (proj / "TASTE.md").write_text(taste)
        (proj / "PRECEDENTS.md").write_text((proj / "PRECEDENTS.md").read_text()
                                            + "\n### Magney House\n- Move to take: roof\n### Azuma House\n- Move to take: court\n")

    def choose(self, proj: Path, statement: str) -> None:
        spec = (proj / "design.yaml").read_text().replace("    status: exploring", "    status: chosen").replace(
            "    statement:                    #", f'    statement: "{statement}"  #')
        (proj / "design.yaml").write_text(spec)

    def hook(self, prompt: str, cwd: Path, session: str):
        import json
        import subprocess
        import os
        event = json.dumps({"prompt": prompt, "cwd": str(cwd), "session_id": session})
        return subprocess.run([sys.executable, str(HERE / "ready_check.py"), "--hook"], input=event,
                              capture_output=True, text=True, timeout=30,
                              env=dict(os.environ, TMPDIR=str(cwd.parent)))     # markers stay in the test's tmp

    # -- readiness -----------------------------------------------------------------------
    def test_blank_project_is_not_ready(self):
        import ready_check
        with tempfile.TemporaryDirectory() as tmp:
            result = ready_check.check(self.fresh_project(tmp))
            self.assertFalse(result["ready"])
            self.assertEqual(set(result["missing"]), {"brief", "program", "taste", "precedents", "concept"})
            self.assertEqual(result["phase"], "brief")

    def test_filled_project_with_concept_is_ready(self):
        import ready_check
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)
            self.fill(proj)
            self.assertEqual(ready_check.check(proj)["missing"], ["concept"])
            self.choose(proj, self.STATEMENT)
            self.assertTrue(ready_check.check(proj)["ready"], ready_check.check(proj)["items"])

    def test_taste_needs_the_dial(self):
        import ready_check
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)
            taste = (proj / "TASTE.md").read_text()
            for line in [l for l in taste.splitlines() if l.startswith("- ★") and "dial" not in l]:
                taste = taste.replace(line, line + " a real answer", 1)
            (proj / "TASTE.md").write_text(taste)
            self.assertIn("taste", ready_check.check(proj)["missing"])          # five answers, no dial
            (proj / "TASTE.md").write_text(taste.replace("5 provoke me):", "5 provoke me): 3"))
            self.assertNotIn("taste", ready_check.check(proj)["missing"])

    def test_tbd_answers_do_not_count(self):
        import ready_check
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)
            brief = (proj / "PROJECT-BRIEF.md").read_text().replace("<project name>", "X")
            for line in [l for l in brief.splitlines() if l.rstrip().endswith(":") and l.startswith("- ")]:
                brief = brief.replace(line, line + " TBD", 1)
            (proj / "PROJECT-BRIEF.md").write_text(brief)
            self.assertIn("brief", ready_check.check(proj)["missing"])

    def test_taste_profile_one_folder_up_counts(self):
        import ready_check
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)
            self.fill(proj)
            (Path(tmp) / "TASTE-PROFILE.md").write_text((proj / "TASTE.md").read_text())
            (proj / "TASTE.md").unlink()
            self.assertNotIn("taste", ready_check.check(proj)["missing"])

    def test_concept_statement_must_be_an_idea(self):
        from check_design import concept_status
        self.assertEqual(concept_status({"status": "chosen"})[0], "undecided")                 # empty
        self.assertEqual(concept_status({"status": "chosen", "statement": None})[0], "undecided")
        self.assertEqual(concept_status({"status": "chosen", "statement": "Modern farmhouse with a big porch"})[0],
                         "undecided")                                                         # style + feature
        self.assertEqual(concept_status({"status": "chosen", "statement": self.STATEMENT})[0], "chosen")
        self.assertEqual(concept_status({"status": "skipped", "skip_reason": "x"})[0], "undecided")
        self.assertEqual(concept_status({"status": "skipped", "skip_reason": "owner wants a builder plan"})[0], "skipped")

    def test_fallback_parser_without_pyyaml(self):
        import ready_check
        block = 'project:\n  name: X\n  phase: schematic   # note\n  concept:   # playbook 08\n' \
                f'    status: chosen  # yes\n    statement: "{self.STATEMENT}"\n  units: in\nsite: {{}}\n'
        inline = f'project:\n  phase: schematic\n  concept: {{status: chosen, statement: "{self.STATEMENT}", id: C-01}}\n'
        saved = sys.modules.get("yaml")
        sys.modules["yaml"] = None                                       # simulate macOS python3 without PyYAML
        try:
            for text in (block, inline):
                project = ready_check.read_project(text)
                self.assertEqual(project["phase"], "schematic")
                self.assertEqual(ready_check.concept_status(project["concept"])[0], "chosen", project)
        finally:
            if saved is None:
                del sys.modules["yaml"]
            else:
                sys.modules["yaml"] = saved

    # -- the hook --------------------------------------------------------------------------
    def test_hook_warns_once_per_session_even_as_gaps_close(self):
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)
            first = self.hook("lay out the floor plan", proj, f"s-{tmp}")
            self.assertEqual(first.returncode, 0)
            self.assertIn("CR-GATE-1", first.stdout)
            self.assertLess(len(first.stdout.splitlines()), 4)                  # brief, not a wall of text
            self.fill(proj)                                                    # gaps change...
            self.assertEqual(self.hook("let's start designing", proj, f"s-{tmp}").stdout, "")   # ...still once
            self.assertEqual(self.hook("what time is it?", proj, f"t-{tmp}").stdout, "")

    def test_hook_quiet_while_the_studio_runs_or_when_named(self):
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)
            self.assertEqual(self.hook("run the concept studio for this house", proj, f"a-{tmp}").stdout, "")
            (proj / "design.yaml").write_text((proj / "design.yaml").read_text().replace("phase: brief", "phase: concept"))
            self.assertEqual(self.hook("sketch the court option", proj, f"b-{tmp}").stdout, "")

    def test_hook_speaks_in_an_empty_folder_and_finds_a_project_below(self):
        with tempfile.TemporaryDirectory() as tmp:
            empty = Path(tmp) / "empty"
            empty.mkdir()
            self.assertIn("No design project", self.hook("design me a 3 bedroom house", empty, f"c-{tmp}").stdout)
            parent = Path(tmp) / "parent"
            parent.mkdir()
            self.fresh_project(str(parent), "oak-hill")
            self.assertIn("CR-GATE-1", self.hook("draw the plan", parent, f"d-{tmp}").stdout)

    def test_hook_never_breaks_a_session(self):
        import subprocess
        bad = subprocess.run([sys.executable, str(HERE / "ready_check.py"), "--hook"], input="not json",
                             capture_output=True, text=True, timeout=30)
        self.assertEqual((bad.returncode, bad.stdout), (0, ""))

    def test_design_intent_matcher(self):
        from ready_check import design_intent
        for prompt in ("let's start designing", "start modeling", "make three layouts", "give me concepts",
                       "show me some options", "build me a 3-bed", "draw a section through the stair"):
            self.assertTrue(design_intent(prompt), prompt)
        for prompt in ("what's the plan for today?", "which model are you?", "commit the files and go home",
                       "read section 3 of the brief", "interview me for the brief for our house"):
            self.assertFalse(design_intent(prompt), prompt)

    def test_hook_file_points_at_the_script(self):
        import json
        hooks = json.loads((HERE.parent / "hooks" / "hooks.json").read_text())
        self.assertIn("tools/ready_check.py", hooks["hooks"]["UserPromptSubmit"][0]["hooks"][0]["command"])

    # -- checker: concept gate, concept mode, invariants -------------------------------------
    def test_checker_concept_gate(self):
        spec = load(str(HERE.parent / "templates" / "design.yaml"))
        spec["project"]["phase"] = "schematic"
        self.assertIn("CR-GATE-1", rules(spec, "WARN"))
        spec["project"]["concept"] = {"status": "chosen", "statement": "Modern farmhouse with a porch"}
        self.assertIn("CR-GATE-1", rules(spec, "WARN"))                       # a style is not an idea
        self.assertNotIn("CR-GATE-1", rules(load(str(EXAMPLE)), "WARN"))

    def test_invariants(self):
        spec = load(str(EXAMPLE))
        self.assertNotIn("CR-KEEP-1", rules(spec, "WARN"))                    # the example's invariants hold
        spec["project"]["concept"]["invariants"].append({"all_rooms_touch": "GREAT"})
        spec["project"]["concept"]["invariants"].append({"room": "GREAT", "min_length_in": 400})
        warns = [f.message for f in Checker(spec).run() if f.rule == "CR-KEEP-1" and f.severity == "WARN"]
        self.assertEqual(len(warns), 2, warns)

    def test_concept_mode_hard_limits_only(self):
        rooms = [{"id": "BR1", "type": "bedroom", "rect": [0, 0, 120, 120]},
                 {"id": "LIV", "type": "living", "rect": [120, 0, 240, 120]}]
        sketch = {"project": {"units": "in", "phase": "concept", "area_budget_sqft": 300},
                  "levels": [{"id": "L1", "rooms": rooms}]}
        self.assertEqual(rules(sketch, "ERROR"), set())                       # no doors, alarms, windows needed
        self.assertTrue(rules(sketch, "ERROR") != rules(dict(sketch, project=dict(sketch["project"], phase="schematic")),
                                                         "ERROR"))
        sketch["project"]["area_budget_sqft"] = 600
        self.assertIn("CR-HARD-1", rules(sketch, "ERROR"))                     # 300 sq ft vs 600 ± 15%
        sketch["project"]["area_budget_sqft"] = 300
        buried = [{"id": "BR1", "type": "bedroom", "rect": [120, 120, 120, 120]}] + [
            {"id": f"R{i}", "type": "living", "rect": r} for i, r in enumerate(
                [[0, 0, 360, 120], [0, 240, 360, 120], [0, 120, 120, 120], [240, 120, 120, 120]])]
        sketch["levels"][0]["rooms"] = buried
        sketch["project"]["area_budget_sqft"] = 1300
        self.assertIn("CR-HARD-1", rules(sketch, "ERROR"))                     # bedroom with no outside wall

    # -- concept tools ---------------------------------------------------------------------
    def test_explorer_concept_mode_drops_and_keeps_range(self):
        import explore_variants
        with tempfile.TemporaryDirectory() as tmp:
            gen = HERE.parent / "examples" / "court-house" / "variants.py"
            self.assertEqual(explore_variants.main([str(gen), "--keep", "6", "--out", tmp]), 0)
            summary = (Path(tmp) / "summary.md").read_text()
            self.assertRegex(summary, r"\d+ tried · \d+ passed \(concept mode\) · [1-9]\d* dropped")   # drop path runs
            kept = sorted(Path(tmp).glob("V*.yaml"))
            self.assertEqual(len(kept), 6)
            for p in kept:
                self.assertEqual(rules(load(str(p)), "ERROR"), set())

    def test_explorer_merges_mirror_images(self):
        import explore_variants
        gen = explore_variants.load_generator(HERE.parent / "examples" / "bar-house" / "variants.py")
        variants = [{"params": c, "features": explore_variants.features(gen.generate(dict(c)))}
                    for c in explore_variants.combos(gen.PARAMS, 500, 1)]
        unique = explore_variants.dedupe(variants)
        self.assertEqual(len(unique), len(variants) // 2)                    # primary far/near is a mirror
        self.assertEqual(len({u["params"]["parti"] for u in explore_variants.select(unique, 6, ["parti"])}), 3)

    def test_deal_gives_each_lens_its_own_cards(self):
        import deal
        with tempfile.TemporaryDirectory() as tmp:
            proj = self.fresh_project(tmp)
            self.fill(proj)
            hands = deal.deal(proj, 1, deal.LENSES)
            cards = [c[1] for hand in hands.values() for c in hand if c[0] in ("analogy", "provocation", "new precedent")]
            self.assertEqual(len(cards), len(set(cards)))                     # nothing repeats across lenses
            self.assertEqual(hands, deal.deal(proj, 1, deal.LENSES))           # same round, same hand
            self.assertNotEqual(hands, deal.deal(proj, 2, deal.LENSES))        # new round, new hand

    def test_sun_numbers(self):
        import sun
        self.assertAlmostEqual(sun.noon_altitude(37.8, sun.TILT), 75.64, places=1)
        self.assertAlmostEqual(sun.noon_altitude(37.8, -sun.TILT), 28.76, places=1)
        self.assertAlmostEqual(sun.rise_bearing(37.8, sun.TILT), 59.8, places=0)

    def test_concept_board_and_blind_jury(self):
        import json
        import concept_board
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "concepts"
            folder.mkdir()
            (folder / "C-01.yaml").write_text(f"id: C-01\nlens: site\nkind: wild\nstatement: \"{self.STATEMENT}\"\n")
            (folder / "C-02.yaml").write_text("id: C-02\nlens: ritual\nkind: grounded\nstatement: Modern farmhouse with a porch\n")
            (folder / "obvious.yaml").write_text("- a center-hall colonial\n- a split-bedroom ranch\n")
            self.assertEqual(concept_board.main([tmp]), 0)
            page = (folder / "index.html").read_text()
            self.assertIn("garden wall", page)
            self.assertIn("Obvious 1", page)
            self.assertEqual(page.count('class="flag"'), 1)                   # the style statement is flagged
            self.assertEqual(concept_board.main([tmp, "--jury"]), 0)
            pack = (folder / "jury.md").read_text()
            self.assertNotIn("wild", pack)                                     # blind: no lens, kind or round
            key = json.loads((folder / "jury-key.json").read_text())
            self.assertEqual(sorted(key.values()), ["C-01", "C-02", "OBVIOUS-1", "OBVIOUS-2"])


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
