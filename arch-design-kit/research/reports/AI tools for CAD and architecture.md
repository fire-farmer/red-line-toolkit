# Claude Builds Houses Best Through Checked Code

As of November 2026, the most reliable way to have Claude model a house is for Claude Code to write parametric Python and run it in a real geometry kernel. IfcOpenShell builds the semantic IFC building, build123d or CadQuery handles precise solids, and ezdxf writes DXF plans. Scripted assertions then check the model, and only after that does a render go back to Claude for a visual look. The evidence is lopsided in a useful way. **Claude Opus 5.5 passes 100% of CadQueryEval's parametric-part tasks and has the top point estimate (61.03%) on the agentic Parametric CAD Bench v3.** Yet general vision models reach only **33–38% accuracy on floor-plan drawing comprehension**, and LLM layouts routinely misplace doors and break clearances when the model is left to judge space. Official routes multiplied in 2026. Anthropic's April 28 "Claude for Creative Work" launch added verified connectors for SketchUp, Autodesk Fusion and Blender, and Revit, Archicad, Chief Architect, Rhino, Onshape and Zoo shipped MCP servers of their own. Almost all of them need a local desktop app, are still in tech preview, or are limited to higher subscription tiers. The one option that runs on the web with nothing installed (SketchUp) produced an apartment with no bedroom doors in a published test. Generative 3D, AI rendering and reality capture supply props, images and existing-conditions context, not buildable geometry. No benchmark measures building-scale or IFC accuracy yet, so the user has to write the architectural tests (door connectivity, clearances, stair geometry, room areas); the mechanical-part benchmarks show that this kind of testing is what makes Claude dependable. The recommended setup comes in three tiers. The free tier is a headless IfcOpenShell and build123d stack in Claude Code. The mid tier adds Blender with the Bonsai MCP, plus the SketchUp connector for quick massing. The pro path runs through Chief Architect X18 or the Revit 2027.2 MCP when permit-grade documents are needed.

*Evidence labels used throughout:*

| Label | Meaning |
|---|---|
| **[Benchmark]** | A published benchmark or paper result |
| **[Docs]** | Official documentation, a connector-directory listing, or a project README describing what a tool does |
| **[Vendor claim]** | A company's or tool author's own claim, launch announcement or price |
| **[Anecdote]** | A practitioner test, blog review, forum report or opinion piece |
| **snippet** | The source was read only through search-engine summaries, not as a full page. Vendor and academic sites such as autodesk.com, graphisoft.com, trimble.com, zoo.dev, docs.meshy.ai and arxiv.org were unreachable during research. |
| **relayed** | The figure came second-hand from another research write-up rather than from the original paper |

## Claude writes CAD code near the frontier but misjudges space and drawings

**Code generation is now very good.** This is where the strongest evidence about Claude and CAD sits. CadQueryEval has 25 CadQuery tasks, and a part passes only if it is watertight, a single component, within 1.0 mm on its bounding box and within 2% on volume. **claude-opus-5.5 scored 100%**, tied for first. Claude Fable 5 and Opus 5 scored 80%, and Sonnet 4.6 managed only 40% [Benchmark] ([danwahl/cadqueryeval](https://github.com/danwahl/cadqueryeval)). The ranking is not monotonic: Sonnet 4.6 trails Sonnet 4.5's 48%. With only 25 tasks, gaps under roughly 20 points are noise. The practical lesson is to use the newest Opus-class model and not read meaning into small differences.

The harder, agentic Parametric CAD Bench v3 has 100 tasks covering text-to-CAD creation, create-and-edit, and reconstruction from engineering drawings. **Claude Code running Opus 5.5 posted the highest overall point estimate, 61.03%, and the best score for rebuilding parts from dimensioned engineering drawings, 84.66%.** The authors say the top entries are statistically tied. Create-and-edit was the weakest workflow, topping out at 44.37% (GPT-6 Astra with Codex), so edits deserve extra verification [Benchmark, snippet] ([arXiv 2611.02659](https://arxiv.org/html/2611.02659v1); [CAD Bench V3 leaderboard](https://cadbench.ai/leaderboard)).

An independent October 2026 run of `claude-opus-5-5` on 151 Text2CAD-Bench preview prompts found **run failures of only 2.0–2.6%**. One repair round cut that to one failure per prompt style. The remaining failures clustered in sweeps, lofts and patterns, and the author warns that a bounding-box size check cannot detect a missing hole [Benchmark] ([CY-HYUN/text2cad-verifier](https://github.com/CY-HYUN/text2cad-verifier)). The full Text2CAD-Bench paper still calls text-to-CAD "largely unsolved beyond basic geometry." It also finds that **Python CadQuery code beats CAD command sequences**, because models can use their pretrained coding skill [Benchmark, snippet] ([arXiv 2605.18430](https://arxiv.org/html/2605.18430v1)).

**Perception and spatial judgment are where Claude falls down, and Anthropic says so itself.** Its docs state that "Claude's spatial reasoning abilities are limited" and warn against using it "for tasks requiring perfect precision" without human oversight [Docs] ([Anthropic vision docs](https://docs.anthropic.com/en/docs/vision)). ArchPlanVQA found that **general vision-language models reach only about 33–38% accuracy on architectural floor-plan CAD drawings** [Benchmark, snippet] ([ArchPlanVQA](https://dx.doi.org/10.1061/JCCEE5.CPENG-7571)). AEC-Bench ran Claude Code with Opus 4.6 and Sonnet 4.6 on 196 tasks over real construction drawing sets. The agents failed at visual grounding, at checking every sheet, and at coordinating across documents. They improved sharply only when given structured drawing data. Note that Nomic, which built the benchmark, sells such tools [Benchmark] ([AEC-Bench](https://github.com/nomic-ai/aec-bench); [arXiv 2603.29199](https://arxiv.org/html/2603.29199)).

BenchCAD's code and text understanding scores (0.82–0.84) far exceeded its image scores (0.46–0.59). Replacing a text edit instruction with a target render dropped every model to near zero [Benchmark, relayed] ([torno research note](https://github.com/luisg0nc/torno/issues/42)). FloorplanQA (ICML 2026) found that **a JSON-only layout beat every image condition**. A Python interpreter lifted placement accuracy from 64.5% to 95.0% but *cut* shortest-path accuracy from 25.0% to 12.5%, and planning tasks averaged only 5–45% [Benchmark; tool ablation via snippet] ([FloorplanQA](https://github.com/OldDeLorean/FloorplanQA); [arXiv 2507.07644](https://arxiv.org/html/2507.07644)).

Taken together, these results point to one pattern. Images help Claude when they carry dimensions it can read as text, as in Opus 5.5's 84.66% on dimensioned drawings. They hurt when Claude must infer sizes from pixels. This is an inference across benchmarks, not a controlled result. Resolution makes the gap concrete. Claude downscales images whose long edge exceeds 1568 px [Docs] ([Claude vision docs](https://platform.claude.com/docs/build-with-claude/vision)). A 36-inch ARCH D sheet therefore arrives at about 43.6 px per paper inch, and 3/32-inch annotation text ends up about 4 px tall, which is illegible. Crop sheets, or give Claude vector text and DXF data instead.

**The failures that matter most are silent.** In a documented six-agent test, **9 of 16 failures went unreported**. One was a CadQuery union that dropped a part's core (7,065 mm³ against 10,323 mm³ expected) while the solid still reported `valid=True`. The same write-up records three more failures:

- a sensor case modeled at 48.5 × 12.5 mm when the real part is 55.2 × 21.3 mm;
- a FreeCAD MCP that reported success after a failure;
- an FEM load off by 1000× because of a units error.

All of these are [Anecdote, relayed] ([torno research note](https://github.com/luisg0nc/torno/issues/42)). In a Revit MCP test, Claude decoded the levels and all 21 room names correctly but got room areas wrong, because Revit measures to wall centerlines [Anecdote, snippet] ([meltflexai](https://www.meltflexai.com/blog/connect-claude-to-revit)). Floor-plan generation research catalogs rooms with improper dimensions, furniture overlapping walls and illogical door placement, and traces these errors to under-specified prompts. That paper reports no quantitative rates [Benchmark] ([arXiv 2509.00543](https://arxiv.org/html/2509.00543v1)). AECBench separately finds LLM weaknesses "in interpreting knowledge from tables in building codes" [Benchmark] ([AECBench](https://archiai-lab.github.io/AECBench.github.io/)). Zoo's documentation confirms the default behavior: when key dimensions are missing, its text-to-CAD fills them with "industry-standard assumptions" [Docs] ([Zoo Text-to-CAD docs](https://docs.zoo.dev/docs/zoo-design-studio/text-to-cad)).

**The fixes with the best evidence are deterministic.** CADTests' B-rep checks agreed with human judges **0.938 of the time, versus 0.474 for a vision-model judge**. Feeding the check results back to the model raised pass rates from 0.715 to 0.810 [Benchmark, relayed] ([arXiv 2605.07807](https://arxiv.org/html/2605.07807)). By contrast, in CADCodeVerify a model answered questions about its own render correctly only 65–68% of the time [Benchmark, older work] ([arXiv 2410.05340](https://arxiv.org/html/2410.05340v1)). In ProCAD, asking for missing sizes before modeling cut Chamfer distance by 79.9% [Benchmark, relayed] ([arXiv 2602.03045](https://arxiv.org/pdf/2602.03045)). Correction rounds pay off early and then flatten: Query2CAD gained 23.1 points over a 53.6% first attempt, mostly in the first round [Benchmark, relayed] ([torno research note](https://github.com/luisg0nc/torno/issues/42)). The build123d-mcp author reports that an incremental build-and-validate loop raised a CADGenBench score from 0.360 to 0.457 and validity from 88% to 100% [Vendor claim] ([pzfreo/build123d-mcp](https://github.com/pzfreo/build123d-mcp)).

The caveat for a house builder is large: **every quantitative benchmark above uses mechanical parts.** Research found no benchmark of LLM-generated walls, roofs, stairs or IFC validity. Architectural accuracy therefore has to be enforced by the user's own tests.

| Evidence | What it measures | Claude result | Label |
|---|---|---|---|
| CadQueryEval | 25 CadQuery parts; pass = watertight, one solid, bbox ±1 mm, volume ±2% | Opus 5.5: 100%; Sonnet 4.6: 40% | Benchmark |
| Parametric CAD Bench v3 | 100 agentic tasks: create, edit, rebuild from drawings | Claude Code + Opus 5.5: 61.03% overall; 84.66% from dimensioned drawings | Benchmark, snippet |
| text2cad-verifier | 151 Text2CAD-Bench preview prompts | opus-5-5: 2.0–2.6% run failures; ~1 per style after one repair round | Benchmark (third party) |
| ArchPlanVQA | VLM questions about floor-plan CAD drawings | General VLMs 33–38% (Claude not isolated) | Benchmark, snippet |
| FloorplanQA | Spatial questions over symbolic layouts | JSON beats images; a code tool helps metric questions but hurts path planning | Benchmark, partly snippet |
| CADTests | Deterministic B-rep checks vs. a vision judge | 0.938 vs. 0.474 agreement with humans | Benchmark, relayed |

## Only one official CAD connector works with nothing installed

Anthropic's "Claude for Creative Work" launch on April 28, 2026 shipped connectors for Adobe Creative Cloud, Ableton, Affinity, Splice, Resolume, **Blender, Autodesk Fusion and Trimble SketchUp**. Most outlets counted nine connectors, and Anthropic also joined the Blender Development Fund as a patron [Vendor claim] ([MacRumors](https://www.macrumors.com/2026/04/28/claude-creative-tool-connectors/); [9to5Mac](https://9to5mac.com/2026/04/28/anthropic-releases-9-new-claude-connectors-for-creative-tools-including-blender-and-adobe/)). The connection model matters more than the brand, because it decides where each tool can be used.

### SketchUp: the only remote connector

**SketchUp's connector is the only remote one.** Trimble hosts it at `api.sketchup.com` with three tools (`build_model`, `get_docs`, `save_model`), and the listing is marked "Anthropic verified." It works from claude.ai in a browser with nothing installed [Docs] ([Claude directory: SketchUp](https://claude.com/marketplace/connectors/sketchup)). Claude builds geometry in a cloud SketchUp session and returns a 2D thumbnail plus a .skp download link [Vendor claim, snippet] ([Trimble](https://news.trimble.com/2026-04-28-Trimble-Links-SketchUp-with-Anthropics-Claude,-Bringing-New-Conversational-AI-powered-Capabilities-to-3D-Modeling)).

Cost is unresolved. Trimble's blog describes a **free allowance to save up to 30 models**, while Engineering.com says a SketchUp Go subscription is needed to generate SKP files. Both were read as snippets [Vendor claim, snippet] ([SketchUp blog](https://sketchup.trimble.com/en/blog/article/sketchup-claude-connector); [Engineering.com](https://www.engineering.com/now-sketchup-has-an-mcp-server-for-claude-based-3d-modeling/)). The connector makes **new models only** and cannot edit an existing .skp [Anecdote] ([hackceleration](https://hackceleration.com/resources/integrations/claude/sketchup)). Trimble told Engineering.com that Claude is "the only 3rd-party AI Assistant that Trimble SketchUp is officially supporting" [Vendor claim, snippet] ([Engineering.com](https://www.engineering.com/now-sketchup-has-an-mcp-server-for-claude-based-3d-modeling/)).

House-scale tests show what the connector is good for.

- **FOCUSED SketchUp:** the tester found that "precise dimensions were the first crack." The room came out close but not exact, shelving depth was wrong for built-ins, and furniture arrived as generic boxes. Evenly spaced repetitive geometry worked well [Anecdote, snippet] ([FOCUSED SketchUp](https://focusedsketchup.com/blog/can-claude-model-in-sketchup-i-tested-the-connector/)).
- **MindStudio:** the one-bedroom apartment had **no door between living room and bedroom, and none from bedroom to bathroom**. The reviewer called it "the most usable output and also the most structurally absurd one" [Anecdote, snippet] ([MindStudio](https://www.mindstudio.ai/blog/claude-3-creative-app-mcp-connectors-blender-adobe-sketchup)).
- **Other reviewers** report four further problems. Claude silently resets earlier dimensions to round numbers when iterating. It struggles with freeform roofs and compound miters. It cannot see your installed extensions. The model is lost between chats. Their verdict: "good enough for a first massing or blocking model, not good enough to hand to a builder" [Anecdote, snippet; attribution spread across sources] ([justnecessary](https://justnecessary.substack.com/p/sketchup-claude-the-ai-connector); [techdrawai](https://techdrawai.com/blog/connect-claude-to-sketchup)).

Community SketchUp MCPs drive the Ruby API inside desktop SketchUp on Windows or Mac. `zinin/sketchup-mcp2` ships a Ruby cookbook for framing, roofs and extrusions, and disables arbitrary Ruby by default. The original `mhyrr/sketchup-mcp` has 561 stars but only 8 commits and a backlog of open PRs [Docs] ([zinin/sketchup-mcp2](https://github.com/zinin/sketchup-mcp2); [mhyrr/sketchup-mcp](https://github.com/mhyrr/sketchup-mcp)).

### Fusion and Blender: local connectors

**Fusion's and Blender's official connectors are local.** The Fusion server "runs on your machine" and needs Fusion open with its MCP server enabled in Preferences [Docs] ([Claude directory: Fusion](https://claude.com/marketplace/connectors/autodesk-fusion)). It writes parametric history into the active file and requires an active Fusion subscription. Autodesk said it is "focused on the Fusion MCP integration," which leaves AutoCAD with no official connector [Vendor claim] ([All3DP](https://all3dp.com/4/claude-comes-to-cad-anthropics-ai-can-now-help-build-3d-models-in-autodesk-fusion/)). Fusion Compute MCP has been in public beta since about September 15, 2026. It runs Fusion headless in Autodesk's cloud and needs a Fusion licence plus a Fusion Team hub. Its scope (parametric modeling, manufacturing setup, assembly, export) is mechanical [Docs, snippet] ([Autodesk Help](https://help.autodesk.com/view/ADSKMCP/ENU/?guid=ADSKMCP_FusionComputeMcp_connecting_to_the_fusion_compute_mcp_server_html)).

The Blender Lab connector exposes Blender's Python API through a required add-on [Docs] ([Claude directory: Blender](https://claude.com/marketplace/connectors/blender)). Secondary guides call it an experimental project that needs Blender 5.1+, and they give conflicting version numbers and ports [Anecdote] ([aztech3d](https://aztech3d.com/en/guides/blender-mcp-official-vs-community/)).

The community `mcp-for-blender` (formerly `blender-mcp`) is the dominant Blender server [Docs] ([ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender)):

- **35.3k stars**, with v2.3.1 shipped on **November 18, 2026**.
- Runs on macOS, Linux, Windows and Docker.
- Adds a `look` tool for viewport and render checks, Poly Haven assets, and hooks into the Meshy, Tripo, Rodin and Hunyuan3D generators.
- Its localhost socket has no authentication and executes arbitrary Python.
- Anonymous telemetry is on by default.

For buildings, the important Blender route is **Bonsai MCP**, which drives a live Blender + Bonsai session. It offers `execute_ifc_code`, queries for spatial structure and quantities, per-storey floor-plan screenshots, and shading by IFC class. It is a tiny project (16 stars). Its author argues that "modern LLMs write IfcOpenShell code well, so a small set of guarded code tools covers more IFC tasks than any fixed tool list" [Docs] ([Show2Instruct/bonsai-mcp](https://github.com/Show2Instruct/bonsai-mcp)).

### Rhino, Onshape, Zoo, AutoCAD and FreeCAD

McNeel's official **RhinoAI** is MIT-licensed and installs into Claude Desktop as a `.mcpb` bundle. Its Grasshopper 2 tools require Rhino 9, which reportedly shipped on October 27, 2026 with RhinoAI built in. McNeel's stance is "bring your own model" [Docs; release date from a secondary source] ([mcneel/RhinoAI](https://github.com/mcneel/RhinoAI); [McNeel troubleshooting](https://mcneel.github.io/RhinoAI/docs/troubleshooting/); [Construction Industry AI](https://www.constructionindustry.ai/product/rhino-9-rhinoai-mcp-mit-licence-bring-your-own-model/)). The community `rhinomcp` (1.2k stars; Rhino 8.20+ on Windows or macOS) adds viewport capture and about 25 Grasshopper tools. That makes it the strongest agent route to parametric facades and complex roof forms [Docs] ([jingcheng-chen/rhinomcp](https://github.com/jingcheng-chen/rhinomcp)).

PTC's Onshape FeatureScript MCP (early access since August 13, 2026) writes custom features rather than general models [Vendor claim, snippet] ([PTC](https://www.ptc.com/en/news/2026/onshape-launches-featurescript-mcp-server)). Zoo's official `zoo-mcp` has Linux binaries and supports a headless API token, but its geometry kernel runs in Zoo's cloud and the repo has only 12 stars [Docs] ([KittyCAD/mcp](https://github.com/KittyCAD/mcp); [KittyCAD/modeling-app](https://github.com/KittyCAD/modeling-app)).

AutoCAD has only community servers. `puran-water/autocad-mcp` (676 stars) drives AutoCAD LT 2024+ on Windows for DWG and PDF output, or **generates DXF headlessly on any OS through ezdxf**. Its README states the right attitude: "a successful CAD command or screenshot doesn't approve a design" [Docs] ([puran-water/autocad-mcp](https://github.com/puran-water/autocad-mcp)).

FreeCAD's `freecad-mcp` (3.4k stars) needs FreeCAD open with an RPC server running. FreeCAD's BIM workbench exports IFC only when objects sit inside a Site–Building–Storey hierarchy. Its docs also warn that not every workbench loads in headless mode [Docs; headless note via snippet] ([neka-nat/freecad-mcp](https://github.com/neka-nat/freecad-mcp); [FreeCAD manual](https://github.com/yorikvanhavre/FreeCAD-manual/blob/master/working_with_freecad/bim_modeling.md); [FreeCAD headless docs](https://reqrefusion.github.io/FreeCAD-Documentation-html/wiki/Headless_FreeCAD.html)).

### Code-CAD libraries: no connector needed

The code-CAD libraries need no connector at all, because Claude Code writes and runs them directly.

- **CadQuery** (Apache-2.0, 6.1k stars) was "built to be used as a Python library without any GUI." It exports STEP, DXF, STL and 3MF [Docs] ([CadQuery](https://github.com/CadQuery/cadquery)).
- **build123d** (Apache-2.0, 3.8k stars) runs on Python 3.11–3.14 [Docs] ([build123d](https://github.com/gumyr/build123d)).
- **Optional MCPs add feedback.** `build123d-mcp` renders previews, measures parts and checks printability, and its dev container is set up for headless rendering. `agentcad` enforces "Inspect, Specify, Build, Validate, Deliver" against a recorded `spec.json` [Docs] ([pzfreo/build123d-mcp](https://github.com/pzfreo/build123d-mcp); [agentcad](https://github.com/jdilla1277/agentcad)).
- **OpenSCAD skills** auto-render PNGs so the agent can "see and self-correct" [Docs] ([openscad-agent](https://github.com/iancanderson/openscad-agent)).
- **IfcOpenShell 0.9.0.post1** (October 15, 2026; LGPL) ships Linux x86-64 and ARM64 wheels for Python 3.10–3.15, and reads and writes IFC2x3 through IFC4x3. Around it sit IfcConvert, the `ifctester` auditor for IDS (buildingSMART's Information Delivery Specification) rule files, and Pyodide WASM builds [Docs] ([PyPI ifcopenshell](https://pypi.org/project/ifcopenshell/); [IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell)).
- **three.js** exports glTF, OBJ, STL and USDZ for browser viewers [Docs] ([three.js exporters](https://github.com/mrdoob/three.js/tree/dev/examples/jsm/exporters)).

Shapr3D, Plasticity and Spline were not researched.

| Tool | How Claude connects | Runs where / cost | Key formats | Maturity and reliability signal | House fit |
|---|---|---|---|---|---|
| SketchUp connector | Remote MCP (Trimble, Anthropic-verified) from claude.ai or Desktop | Trimble cloud; 30 free saved models, then paid (sources conflict) | .skp + 2D preview | New (Apr 2026); new models only; tests show missing doors and drifting dimensions | Quick massing |
| SketchUp community MCPs | Local MCP + Ruby extension | Win/Mac desktop; SketchUp licence | .skp, scene export | Uneven upkeep; sketchup-mcp2 has framing/roof cookbook | Editable framing and roofs |
| Fusion connector | Local MCP inside Fusion (Autodesk) | Win/Mac; Fusion subscription | Fusion native | New; writes parametric history; no practitioner reliability reports found | Fabricated components only |
| Fusion Compute MCP | Cloud MCP, headless Fusion (beta) | Cloud; licence + Team hub | Export (formats unlisted) | Public beta since ~Sept 2026 (snippet) | Mechanical |
| Blender Lab connector | Local MCP + add-on | Win/Mac/Linux; free | Blender's own | Experimental; conflicting version reports | Visualization meshes |
| mcp-for-blender | Local MCP + add-on (community) | Win/Mac/Linux, Docker; free plus paid generator APIs | Blender's own; generator meshes | 35.3k stars, frequent releases; unauthenticated socket | Look/render loop, props |
| Bonsai MCP | Local MCP + live Blender/Bonsai | Win/Mac/Linux; free | IFC | 16 stars; ships a visual-verify prompt | Semantic IFC editing |
| RhinoAI / rhinomcp | Local MCP (McNeel MIT / community) | Win/Mac; Rhino licence, bring your own model | .3dm | 427 / 1.2k stars; viewport capture | Facades, complex roofs |
| Onshape / Zoo | Cloud MCP or REST | Cloud; plan-based or metered | STEP/STL via export | Early access; Zoo repo 12 stars | Mechanical |
| AutoCAD MCPs | Community; AutoLISP/COM, or ezdxf headless | LT 2024+ on Windows; ezdxf free anywhere | DWG (Windows only), DXF | puran-water 676 stars | 2D DXF plans |
| FreeCAD MCP | Community RPC add-on | Win/Mac/Linux; free | IFC via IfcOpenShell | 3.4k stars; a false-success report | BIM workbench, clunky headless |
| CadQuery / build123d / OpenSCAD | Claude Code runs scripts; optional MCPs | Anywhere, headless; free | STEP, STL, DXF, 3MF | Best-benchmarked route | Precise parts; no IFC semantics |
| IfcOpenShell | Claude Code runs scripts | Anywhere, headless; free | IFC2x3–IFC4x3 | Mature library; no LLM-on-IFC benchmark | Semantic building master |

## BIM vendors shipped MCP servers in 2026, then gated them by version and tier

Every BIM-platform source in this section was read through search-engine summaries, because the vendor sites were unreachable during research. Treat the specifics as snippet-grade, especially prices, which third parties report inconsistently.

### Revit: two official tracks, both unfinished

Autodesk has two Revit tracks, and neither is finished. The built-in **Autodesk Assistant in Revit 2027 is still a Tech Preview**. In AEC Magazine's hands-on test it could create schedules and tag elements, but it **could not modify existing elements** [Anecdote] ([AEC Magazine](https://aecmag.com/bim/giving-ai-actual-write-access-in-revit/)). The separate **Revit Public MCP Server** is a local STDIO server "currently supported only on Autodesk Revit 2027.2." It ships as three installers (Read-Tools, Write-Tools and Experimental-Tools), and the write and experimental sets "continue to evolve" [Docs] ([Autodesk MCP help](https://help.autodesk.com/cloudhelp/ENU/ADSKMCP-RevitMcp/files/ADSKMCP_RevitMcp_revit_mcp_server_html.html)). Autodesk's June 17 launch post describes a "Trusted Write" mode for reversible changes [Vendor claim] ([Autodesk blog](https://www.autodesk.com/blogs/aec/2026/06/17/revit-public-mcp-server/)).

Community bridges go further. AEC Magazine connected Claude through MCP and pyRevit to the Revit API. It got room-by-room ceilings and finishes, an edited floor type, a new roof and an adjusted scope box; one geometry-modification task was "blocked" [Anecdote] ([AEC Magazine](https://aecmag.com/bim/giving-ai-actual-write-access-in-revit/)). `Demolinator/revit-mcp-plugin` installs as a Claude Code plugin with 48 tools for Revit 2024–2027. The `Sam-AEC` bridge blocks writes until a plan is approved [Docs] ([Demolinator](https://github.com/Demolinator/revit-mcp-plugin); [Sam-AEC](https://github.com/Sam-AEC/Autodesk-Revit-MCP-Server)). In practice, BIMsmith watched Claude chain five MCP queries (doors, stairs, corridors, rooms, railings) to answer one question. The reviewer found that "the questions Claude asks back are often as useful as the answers" [Anecdote] ([BIMsmith](https://blog.bimsmith.com/Revit-2027-What-the-Built-In-MCP-Server-Actually-Does-in-Practice)).

Full Revit costs about **$3,005/yr** and Revit LT about $540–560 [Vendor claim, snippet] ([RenderAHouse](https://www.renderahouse.com/blog/revit-pricing); [Novedge](https://novedge.com/products/buy-revit-lt-subscription); [Helonic](https://helonic.com/blog/revit-cost)). Revit LT has historically not supported add-ins or the Revit API, so the MCP routes almost certainly require full Revit. This was not verified for 2027.

### Archicad, Chief Architect and Vectorworks

Graphisoft limits agent access by plan tier. The **Public Archicad MCP Server (Beta)** connects "namely Claude Desktop and Cursor," and it can also point at local models through LM Studio or Ollama [Docs] ([Graphisoft help](https://help.graphisoft.com/AC/30/INT/Topics/001_GettingHelp/AI_Assistant/public_mcp_connection.html); [Graphisoft AI Solutions](https://www.graphisoft.com/en-us/plans-and-products/ai-solutions/)). It is available only on the Collaborate and Max plans. **Archicad Studio, the solo tier, explicitly excludes it** [Docs] ([Archicad Studio](https://www.graphisoft.com/en-us/plans-and-products/archicad-studio/)). G2 lists Collaborate at $400 per seat per month [Vendor claim] ([G2](https://g2.com/products/archicad/pricing)). The community workaround is the open-source Tapir add-on. Its `tapir-archicad-mcp` generates "191+ MCP tools" from Archicad's JSON API; whether it works on Studio is unverified [Docs] ([tapir-archicad-mcp](https://pypi.org/project/tapir-archicad-mcp/)).

Chief Architect is the residential-native exception. **Premier X18 (Build 28.2.1.14) includes an experimental MCP server.** It is off by default, names Claude Code, Codex and Copilot as clients, and states that web-based clients are not compatible [Docs] ([Chief Architect KB-03256](https://www.chiefarchitect.com/support/article/KB-03256/enabling-and-configuring-the-chief-architect-mcp-server.html)). It costs $1,995/yr and runs on Windows and macOS [Vendor claim, snippet] ([RenderAHouse](https://www.renderahouse.com/blog/chief-architect-pricing)). A community toolkit for it notes that "deleting is refused over MCP" [Docs] ([sam2kb toolkit](https://github.com/sam2kb/chief-architect-mcp-toolkit)).

Vectorworks Architect ($1,530/yr, Mac-native) has an AI Assistant that answers help-system questions and an AI Visualizer. No Vectorworks MCP server was confirmed [Docs] ([Vectorworks](https://customers.vectorworks.net/subscriptions); [Engineering.com](https://www.engineering.com/vectorworks-launches-new-ai-assistant-preview-built-for-designers/)).

### Open BIM: the most scriptable path

The open path is the most scriptable of all. IFC 4.3 became **ISO 16739-1:2024** [Docs] ([buildingSMART](https://www.buildingsmart.org/ifc-4-3-formally-approved-and-published-as-an-iso-standard/)). IfcOpenShell's high-level `ifcopenshell.api` creates projects, units, the site–building–storey hierarchy, walls, openings and the doors that fill them, and its docs include full worked examples [Docs] ([IfcOpenShell code examples](https://docs.ifcopenshell.org/ifcopenshell-python/code_examples.html); [feature module](https://docs.ifcopenshell.org/autoapi/ifcopenshell/api/feature/index.html)).

Bonsai, the free authoring front end, is labeled **alpha** at v0.9.1. It generates plans, sections, elevations, sheets and schedules linked to the IFC model. It computes vector section cuts from the IFC rather than from the Blender mesh, and outputs sheets as SVG [Docs] ([Bonsai Studio](https://bonsaibim.org/studio.html); [OSArch wiki](https://wiki.osarch.org/bonsai-exporting-2d-documentation/)). The OpenAEC Foundation has already published Claude Code skills for creating IfcOpenShell models, including wall types with material layers [Docs] ([OpenAEC skills](https://skills.lc/OpenAEC-Foundation/Computational-Design-Day-Delft-March-2026/openaec-foundation-computational-design-day-delft-march-2026-claude-skills-ifcopenshell-impl-ifcos-impl-creation-skill-md)). The cloud BIM platform Qonic and the coordination tool Revizto have also shipped MCP servers, and Revizto bundles Claude skills [Vendor claim] ([AEC Magazine: Qonic](https://aecmag.com/bim/qonic-ai-launches-inside-bim-platform/); [AEC Magazine: Revizto](https://aecmag.com/collaboration/revizto-putting-the-i-in-bim-to-work/)).

### AI-native design platforms: feasibility tools, not custom houses

AI-native design platforms target feasibility studies and multifamily housing, not custom houses, and none showed an MCP server.

- **Hypar** discontinued text-to-BIM because it proved "too constraining," and pivoted to space planning [Anecdote] ([ArchPulse](https://www.archpulse.co/tool/hypar)).
- **Snaptrude** advertises 14 AI agents and RVT/IFC export, but reviewers say the exports can need cleanup [Vendor claim; Anecdote] ([Snaptrude](https://www.snaptrude.com/vs/revit); [Techvernia](https://techvernia.com/pages/reviews/architecture/snaptrude.html)).
- **Arcol** has a free Solo plan and says its data model is built for agents, but no public MCP was found [Vendor claim] ([aec+tech](https://www.aecplustech.com/tools/arcol); [Arcol manifesto](https://arcol.io/blog/arcol-manifesto-2.0)).
- **TestFit's** generative Site Solver starts at $15,000/yr, and **Finch3D** starts at €49/mo for multifamily unit mix [Vendor claim] ([Hektar](https://www.hektar.ai/post/comparing-early-stage-feasibility-tools-2026-forma-giraffe-finch-testfit-hektar); [Illustrarch](https://illustrarch.com/articles/75056-finch3d-review.html)).
- **Maket.ai** is the residential exception. It costs about $20/mo with DXF and PDF export, but its dimensions need manual checking [Vendor claim; Anecdote] ([AI Building Tools](https://aibuildingtools.com/tools/maket); [Formas.ai](https://www.formas.ai/articles/maket-ai)).
- **Higharc** ($95M Series C, June 2026) and **Swapp** (construction-document automation inside Revit and Archicad) sell to production builders and firms through custom pilots [Vendor claim] ([Higharc](https://www.higharc.com/newsroom/higharc-95m-series-c-for-homebuilding-ai); [Futurepedia](https://www.futurepedia.io/tool/swapp)).

One 2026 guide states flatly that "no AI-generated floor plan, as of September 2026, can be submitted for a building permit" [Anecdote] ([Illustrarch](https://illustrarch.com/interior-design/floor-plans/74667-ai-floor-plan-generator.html); [Zekaiwork](https://zekaiwork.com/best-ai-floor-plan-generators/)).

### Code compliance and safety

Code-compliance AI exists but has not been audited on custom homes. UpCodes Plan Review is in Enterprise early access. No third-party audit shows whether it catches residential egress, stair or energy-code problems [Anecdote] ([AI Home Building](https://aihomebuilding.com/stories/ai-native-qa-qc-upcodes-plan-review-residential-gap)). City-run tools report **75% accuracy (Archistar, Austin pilot) and about 87–92% (CivCheck, Seattle proof of value)** [Vendor claim] ([Smart Cities Dive](https://www.smartcitiesdive.com/news/ai-building-permits-austin-honolulu-los-angeles/751159/)).

The vendors converge on one safety pattern: a human approves changes before the AI writes them. Examples are Autodesk's Trusted Write, Graphisoft's "approved batch edits" and Chief Architect's no-delete rule. An AEC Magazine column argues that MCP "is the wrong shape" for agentic BIM because it does not handle delegated authority [Anecdote] ([AEC Magazine](https://aecmag.com/ai/agentic-bims-missing-infrastructure/)). Nemetschek's new Creator platform is built so that the AI orchestrates while deterministic BIM software does the precise calculations. That is the same division of labor the benchmarks support [Vendor claim] ([ENGtechnica](https://engtechnica.com/nemetschek-creator-combines-agentic-ai-with-decades-of-bim-engineering/)).

| Platform | Claude path | Status (Nov 2026) | Approx. cost (snippet) | Solo-house fit |
|---|---|---|---|---|
| Chief Architect Premier X18 | Local MCP; Claude Code named | Experimental, off by default; no delete over MCP | $1,995/yr | Best residential pro fit |
| Revit 2027.2 | Public MCP (read/write/experimental) or pyRevit community bridges | Tech Preview | ~$3,005/yr; LT ~$540 but MCP likely unsupported | Only if collaborators need RVT |
| Archicad 30 | Public MCP (Collaborate/Max only); Tapir community MCP | Beta | Collaborate ~$400/seat/mo | Studio tier lacks MCP |
| Vectorworks Architect | None confirmed | AI Assistant preview | $1,530/yr | No Claude control found |
| IfcOpenShell + Bonsai | Python in Claude Code; Bonsai MCP | Library mature; Bonsai alpha | Free | Most scriptable path |
| Snaptrude / Arcol / Hypar | File exchange (IFC, RVT, CSV) | No MCP found | Free tiers to ~$100/user/mo | Early massing only |
| Maket.ai | File exchange (DXF, PDF) | Shipping | ~$20/mo | Program exploration only |

## Generators, renderers and scanners supply props, pictures and context, not the building

### Text- and image-to-3D: meshes, not CAD

**Every current text- or image-to-3D generator outputs textured polygon meshes, not dimensioned or parametric CAD.** That holds for Meshy, Tripo, Hyper3D Rodin, Hunyuan3D, TRELLIS.2, Stability's SPAR3D and Autodesk's Wonder 3D. All of them are therefore sources of props and placeholders: furniture, fixtures, entourage and sculptural objects.

Meshy fits Claude best. It maintains an official MCP server that installs in Claude Code with one `claude mcp add` command [Docs] ([meshy-mcp-server](https://github.com/meshy-dev/meshy-mcp-server)). Its Remesh API sets real-world size through `resize_height` and `origin_at`, offers quad topology and a polycount target, and exports GLB, FBX, OBJ, USDZ, BLEND and STL [Docs, snippet] ([Meshy Remesh API](https://docs.meshy.ai/en/api/remesh)). API access requires the Pro tier or higher [Docs, snippet] ([Meshy API pricing](https://docs.meshy.ai/api/pricing)). Rodin accepts a bounding box and costs roughly $0.40–1.20 per generation through resellers. The resellers document its axis order differently, so check it empirically [Docs] ([Runware](https://runware.ai/docs/models/hyper3d-rodin-gen-2); [fal](https://fal.ai/models/fal-ai/hyper3d/rodin/v2/api)). Tripo's official MCP is alpha and works only through its Blender add-on [Docs] ([tripo-mcp](https://github.com/VAST-AI-Research/tripo-mcp)).

The open-weight options carry hardware and licence costs. TRELLIS.2 is MIT-licensed, but it only takes images and needs a 24 GB+ NVIDIA GPU on Linux [Docs] ([TRELLIS.2](https://github.com/microsoft/TRELLIS.2)). **Hunyuan3D 2.1's licence excludes the EU, UK and South Korea** [Docs] ([Hunyuan3D-2.1 README](https://www.huggingface.co/tencent/Hunyuan3D-2.1/blob/main/README.md)). Free-tier Meshy outputs are licensed CC BY 4.0, so they require attribution [Docs, snippet] ([Meshy pricing docs](https://docs.meshy.ai/pricing)). Models churn fast: meshy-7 retires on December 31, 2026 [Docs, snippet] ([Meshy API pricing](https://docs.meshy.ai/api/pricing)), and Luma's Genie shut down on January 1, 2026 [Anecdote] ([RadianceFields](https://radiancefields.com/luma-ai)). World Labs Marble turns text or a photo into an explorable Gaussian-splat world and can export a GLB mesh. Its own docs rank the mesh below the splat in fidelity, and export and commercial rights require the Pro plan [Docs] ([Marble mesh export](https://docs.worldlabs.ai/marble/export/mesh.md); [Marble specs](https://docs.worldlabs.ai/marble/export/specs)).

| Generator | Output | Dimension control | Claude path | Licence trap |
|---|---|---|---|---|
| Meshy | Textured mesh; quad remesh | `resize_height`, `origin_at` | Official MCP | Free tier CC BY; API needs Pro |
| Hyper3D Rodin | Mesh; quad by default | Bounding box (axis order varies by reseller) | Via mcp-for-blender or reseller APIs | Check terms of service |
| Tripo 3.x | Mesh; quad or low-poly | None found | Official alpha MCP via Blender add-on | Free tier CC BY |
| Hunyuan3D 2.1 | PBR mesh | Bounding box only in the Omni variant | Via mcp-for-blender or self-hosted | Excludes EU/UK/KR |
| TRELLIS.2 | PBR GLB | None | Self-hosted (24 GB GPU) | MIT |
| World Labs Marble | Splat world + GLB mesh | Not verified | Via mcp-for-blender | Pro for export and commercial use |

### AI rendering: geometry-bound renderers and free-floating generators

AI rendering has split into geometry-bound renderers and free-floating image generators. **No desktop renderer was found to expose a generation API Claude can call.** Chaos Veras 4.0 (February 2026) runs on Google's Nano Banana Pro. Since May 27, 2026 it has been built into every version of Enscape, V-Ray and Corona and billed through Chaos Credits [Vendor claim] ([Chaos Veras 4.0](https://www.chaos.com/press/chaos-veras-40-now-powered-by-nano-banana); [Chaos integration](https://www.chaos.com/press/veras-ai-architecture-enscape-vray-corona)). EvolveLab users report that after the switch, material and style overrides became localized and vary across the image. That is geometry drift inside a supposedly "geometry-bound" tool [Anecdote] ([EvolveLab forum](https://forum.evolvelab.io/t/veras-release-4-0-nano-banana/11184)). D5 Render 3.0 adds an AI agent for mood-matched lighting and asset suggestions. Lumion upscales locally to 16K. Twinmotion 2026.1 shipped no confirmed AI features [Vendor claim] ([Architosh on D5](https://architosh.com/2026/02/d5-version-3-released-new-ai-workflows/); [Lumion](https://lumion.com/tips-guides/lumion-pro-2026-guide); [Twinmotion release notes](https://dev.epicgames.com/documentation/en-us/twinmotion/twinmotion-2026-1-release-notes)). Midjourney V8 has no official API [Anecdote] ([WaveSpeed](https://wavespeed.ai/blog/posts/what-is-midjourney-v8-features-pricing-how-to-use-2026)).

Claude can automate rendering through three routes:

- **ComfyUI with FLUX depth and canny ControlNets.** Comfy's docs say combining Depth and Lineart "maintains spatial relationships while reinforcing outlines, suitable for architecture" [Docs] ([Comfy FLUX ControlNet](https://docs.comfy.org/tutorials/flux/flux-1-controlnet); [Comfy depth ControlNet](https://docs.comfy.org/tutorials/controlnet/depth-controlnet)).
- **Model APIs such as Krea's** [Docs] ([Krea API](https://krea.ai/features/api)).
- **Community image MCP servers** that wrap Nano Banana Pro (about $0.15 per image), gpt-image and FLUX. None of them is an official vendor release [Anecdote] ([glama fal MCP](https://glama.ai/mcp/servers/Szotasz/fal-ai-mcp-server); [OpenArt roundup](https://openart.ai/fr/blog/best-image-generation-mcp-servers-for-claude/)).

Claude sessions that have the Canva connector can also use its `generate-image` tool with reference images for mood boards. This was observed in a session's tool schema; no public documentation was cited.

Practitioners agree that the case for AI rendering "is strongest at the front of the process and weakest at the back" [Anecdote] ([Architecture Lab](https://www.architecturelab.net/how-ai-reshaped-the-render-and-what-it-still-cant-build/)). One firm reportedly lost a pursuit because its AI rendering "looked too perfect" [Anecdote] ([Dan Cumberland Labs](https://dancumberlandlabs.com/blog/architecture-rendering-ai/)).

### Reality capture: Claude consumes the exports

Reality capture supplies existing conditions, and Claude can only work with the exported files; it cannot trigger a capture.

- **Apple RoomPlan** produces dimensioned room shells from iPhone or iPad LiDAR. Apple's guidance targets single rooms up to about 30×30 ft, and its USDZ export is one-way [Docs] ([Apple RoomPlan](https://developer.apple.com/augmented-reality/roomplan); [Apple forum](https://developer.apple.com/forums/thread/831648)).
- **Polycam** exports more than 15 formats, including OBJ, PLY and LAS, but **not E57**, and it has no public REST API [Docs] ([Polycam formats](https://learn.poly.cam/hc/en-us/articles/27756102599572); [API Evangelist](https://providers.apievangelist.com/providers/polycam/)). An informal comparison found that Polycam and Luma "do not produce scans at the right scale" [Anecdote] ([LinkedIn](https://pl.linkedin.com/in/kamilmaziarka)).
- **Matterport** sells E57 export and an Enterprise-only Import API (beta since February 2026) [Docs] ([Matterport E57](https://matterport.com/add-ons/e57); [Matterport Import API](https://matterport.github.io/developer-docs/api/import/guide/)).
- **Gaussian splats** are now mainstream; SketchUp Labs can view them on Windows. Their use for measurement is still being validated in 2026 ISPRS papers [Docs; Benchmark] ([SketchUp help](https://help.sketchup.com/gaussian-splats-extension); [ISPRS 2026](https://isprs-archives.copernicus.org/articles/XLIX-B2-2026/1355/2026/isprs-archives-XLIX-B2-2026-1355-2026.pdf)).
- **Scan-to-BIM** remains semi-automated. ReCap Pro processes scans but does not create BIM elements itself [Vendor claim] ([Matterport scan-to-BIM guide](https://matterport.com/blog/best-scan-to-bim-software)).

The workable pattern is to capture with a RoomPlan-based app, verify critical dimensions with a tape or laser measure, and have Claude read the DXF or USDZ into the spec. Splats serve only as visual context.

## Where Claude runs and what it touches decide what it can verify

### The four Claude surfaces reach different tools

- **claude.ai in a browser** reaches only remote connectors. Among CAD tools that means only SketchUp (claimed to work on Free, Pro and Team plans [Anecdote] ([ChatForest](https://chatforest.com/reviews/interior-design-architecture-mcp-servers/))), plus image tools. The web app is the place for drafting the spec, conversational massing and reviewing renders, not for checked geometry.
- **Claude Desktop** on a Windows or Mac workstation reaches every local vendor server: Fusion, Blender, RhinoAI, Revit's Public MCP, Archicad's Public MCP and Chief Architect's MCP. Every official BIM vendor server is local, and Chief Architect explicitly excludes web clients [Docs] ([Chief Architect KB-03256](https://www.chiefarchitect.com/support/article/KB-03256/enabling-and-configuring-the-chief-architect-mcp-server.html)).
- **Claude Code on the same machine** reaches all of those plus anything it can run.
- **Claude Code on the web runs in a Linux container.** The dependable stack there is pip-installable and headless: IfcOpenShell (Linux wheels), build123d or CadQuery, ezdxf and OpenSCAD [Docs] ([PyPI ifcopenshell](https://pypi.org/project/ifcopenshell/); [puran-water/autocad-mcp](https://github.com/puran-water/autocad-mcp)). Cloud MCPs (Fusion Compute, Zoo, Onshape) are reachable only if the environment's network allowlist includes their hosts and credentials are supplied. This research session's own fetches of autodesk.com and zoo.dev were blocked.

Three questions remain open. Blender's background mode (`blender -b --python`) should allow headless bpy and Bonsai scripting in a container, but this was not verified, and every Blender MCP server assumes a live desktop session. No source documents whether the remote SketchUp connector can be used from Claude Code. No published test of Claude's computer use driving a desktop CAD application was found, so screenshot-and-click control is a last resort.

The agent wrapper matters as much as the surface. The top Parametric CAD Bench v3 entries run inside Claude Code or another agent that executes code, not single-shot chat [Benchmark, snippet] ([arXiv 2611.02659](https://arxiv.org/html/2611.02659v1)). AEC-Bench likewise runs the Claude Code CLI inside Docker task containers [Docs] ([AEC-Bench](https://github.com/nomic-ai/aec-bench)).

### File formats decide what Claude can check

Formats decide what Claude can check. Claude reads and writes text, and the evidence consistently favors text: code beats command sequences, JSON beats images, and structured drawing data beats raw sheets. That points toward text formats that a script can validate, with binary formats passing through a vendor connector or a conversion library. This is an inference; no benchmark compares file formats directly.

| Format | Produced by | Can Claude read and check it as text? | Role in a house pipeline |
|---|---|---|---|
| JSON spec | Claude and the user | Yes | Source of truth for program, dimensions and tests |
| Python source (IfcOpenShell, build123d, bpy) | Claude Code | Yes; diffable in git | The parametric model itself |
| IFC (STEP physical file) | IfcOpenShell, Bonsai, FreeCAD, Revit, Archicad, Snaptrude | Yes; validate with `ifctester` | Semantic building master |
| STEP | CadQuery, build123d, Fusion, Onshape, Zoo | Text, but B-rep heavy | Precise components and fabrication |
| DXF | ezdxf, AutoCAD, Maket, RoomPlan-based apps | Yes (ASCII); generate with ezdxf, don't hand-write | 2D plans, existing conditions |
| SVG | Bonsai sheets, scripts | Yes | Plan and section presentation |
| glTF/OBJ/USDZ | three.js, Blender, 3D generators | glTF JSON and OBJ yes; GLB/USDZ are binary | Web viewing, props |
| .skp, .rvt, .dwg, .3dm, .f3d, .blend | Vendor apps | No (binary) | Only through connectors |

### Prompting habits that carry over to CAD

Anthropic's general prompting guidance carries over directly [Docs] ([Use XML tags](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags); [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices); [Extended thinking tips](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/extended-thinking-tips)):

- Wrap each kind of content (units and conventions, program, constraints, acceptance tests) in its own XML tag.
- Phrase instructions positively: write "keep every wall 140 mm thick, defined as `WALL_T`," not "don't vary wall thickness."
- Give three to five examples.
- Prefer extended thinking for multi-step reasoning. Nobody has tested thinking budgets on CAD specifically, and CADCodeVerify found that more reasoning effort did not help monotonically [Benchmark, relayed].

CAD practice adds four habits:

- **Give every critical dimension with its unit.** Zoo's example prompt is "600mm diameter, 50mm thick, with a 200mm hole in the middle" [Docs] ([Zoo Text-to-CAD docs](https://docs.zoo.dev/docs/zoo-design-studio/text-to-cad)).
- **Supply target bounding boxes and component counts.** They double as spec and test oracle, the way CadQueryEval's prompts do [Benchmark] ([cadqueryeval](https://github.com/danwahl/cadqueryeval)).
- **Describe the end state, and build scenes one change at a time** [Anecdote] ([blendermcp.org](https://blendermcp.org/setup/claude/index.md)).
- **Treat images as expensive.** One builder found that screenshots roughly quadrupled cost: a 1280 px image is about 1,600 tokens, and Claude Code drops the oldest images in long sessions. The builder settled on "numbers first, then one picture" [Anecdote, relayed] ([torno research note](https://github.com/luisg0nc/torno/issues/42)).

Any localhost bridge that executes code (`execute_blender_code`, `eval_ruby`, AutoLISP) runs without authentication. Keep it bound to localhost, run one MCP client at a time, and set `BLENDER_MCP_SAFE_MODE=1` and `DISABLE_TELEMETRY=true` where they are offered [Docs] ([mcp-for-blender](https://github.com/ahujasid/mcp-for-blender)).

## Conclusion: adopt the open stack first and make the tests the spec

The 2026 connector wave made it easier to start a model, but it did not make Claude more accurate. In the evidence, accuracy comes from a geometry kernel plus checks, and the free open stack provides both with the strongest benchmark support. The bottleneck has moved from "can Claude write code that runs?" (2–3% run failures) to "does the spec say enough, and will a test catch the silent error?" For a solo tool-builder, the most valuable asset is therefore a reusable library of architectural assertions, packaged as a Claude Code skill and enforced with hooks. Nobody has benchmarked this for buildings, and it is exactly the piece that makes Claude reliable on houses. Vendors are converging on the same design: Nemetschek Creator lets AI orchestrate while BIM software calculates, and Autodesk's Trusted Write gates changes behind approval. A toolkit built as spec → code → checks will therefore carry over to Chief Architect or Revit MCP later. The JSON spec and the test suite stay the same, and only the kernel behind them changes. Three things remain unknown: building-scale accuracy (no benchmark exists), whether Bonsai's alpha status matters for real drawing sets, and the true cost of the SketchUp connector.

### Recommended stack in three tiers

| Tier | Authoring (source of truth) | Deterministic checks | Look and render | Drawings and exchange | Approx. cost | Claude surface |
|---|---|---|---|---|---|---|
| **Zero-cost, headless, open** | JSON spec → IfcOpenShell Python (walls, slabs, openings, doors, spaces, storeys); build123d or CadQuery for precise components | Python assertions: overlaps and clearances, door-connectivity graph, areas vs. program, stair geometry vs. your adopted code, B-rep volume and bbox; `ifctester` IDS rules | Headless PNG previews (plan + axonometric) via build123d-mcp or Blender background mode (unverified); three.js glTF viewer | IFC master; DXF via ezdxf; STEP for components | $0 beyond the Claude plan | Claude Code (web or local); claude.ai for spec and review |
| **Mid tier, desktop** | Same scripts, plus Blender + Bonsai + Bonsai MCP for live IFC edits | Same suite, plus Bonsai per-storey plan screenshots and shading by IFC class | mcp-for-blender `look`; Poly Haven materials; ComfyUI depth/lineart or an image MCP for concept renders; Meshy or Rodin props with explicit dimensions | Bonsai SVG/PDF sheets; SketchUp connector .skp for quick massing; RoomPlan-based app for existing conditions | Free software plus metered APIs (Meshy Pro tier, Rodin ~$0.40–1.20/gen, Nano Banana Pro ~$0.15/image); SketchUp paid after 30 saved models | Claude Desktop + Claude Code on a Windows/Mac/Linux workstation |
| **Pro path** | Chief Architect Premier X18 via its experimental MCP for residential construction documents; or full Revit 2027.2 with the Public MCP or a pyRevit bridge if collaborators need RVT; Rhino 9 + RhinoAI/Grasshopper for complex forms | The same JSON spec and test suite; re-check the model through MCP queries; human code review | Enscape or V-Ray with Veras, or D5, all operated by a human; Claude writes prompts and view lists | Vendor drawing sets; IFC export for checking | Chief $1,995/yr; Revit ~$3,005/yr; Rhino licence (price not retrieved); Chaos Credits | Claude Code or Desktop on Windows or Mac |

**Zero-cost tier.** This tier is the default, not a compromise. Everything in it runs headless on Linux, every artifact is text Claude can diff and test, and it matches the conditions under which Claude scored best: code against a real kernel, run inside an agent. IfcOpenShell supplies real building semantics (IfcWall, IfcDoor, spaces, storeys), which box-and-boolean modeling in build123d cannot. Reserve build123d for components such as stair stringers, joinery or custom fixtures that need STEP. The weak spots are rendering from a container, which was not verified, and drawing sets: Bonsai produces the best free plans and sections but needs Blender.

**Mid tier.** This tier adds the visual loop and fast conversation. Use the SketchUp connector as a sketchpad for massing and client talk, then rebuild the result in code, because the tests show it drops doors and drifts dimensions. Use generated meshes only as dimensioned props, and record the generator, model version, plan tier and licence for each one, given CC BY free tiers, Hunyuan's regional exclusions and model retirements every few months.

**Pro path.** Take this only when the deliverable becomes a permit set. For single-family work, Chief Architect X18 is the stronger fit: it is residential-native, its MCP names Claude Code, and it costs less than Revit. Revit is worth it only for RVT collaboration. Rhino 9 covers facades and roofs that resist plain extrusion. Fusion, Onshape and Zoo belong only to fabricated components. Archicad makes sense only on the Collaborate plan.

### The loop the evidence supports

| Step | What Claude does | Gate before moving on | Evidence |
|---|---|---|---|
| 1. Spec with units | Writes or completes a JSON spec: units, measurement convention (finish face vs. centerline), axes and origin, room program with target areas and adjacencies, constraints citing code clauses, acceptance tests. Asks about every missing dimension before modeling. | Spec validates; every dimension has a unit and a source | Clarifying first cut Chamfer distance 79.9% [Benchmark, relayed]; under-specified prompts drive layout errors [Benchmark]; centerline-area and 1000× unit failures [Anecdote] |
| 2. Parametric code | Generates an IfcOpenShell or build123d script with named parameters at the top; one change per step | Script runs in the kernel with no exceptions | Code beats command sequences [Benchmark, snippet]; agent harness tops CAD Bench v3 [Benchmark, snippet]; Opus 5.5 at 100% on CadQueryEval [Benchmark] |
| 3. Deterministic checks | Runs the assertion suite and reports each pass or fail; states compliance only from a passing test | Bbox/volume within tolerance; zero overlaps; every space has a door and is reachable from the entry; clear widths, corridors and stairs per adopted code; areas within ±%; IDS passes | B-rep checks 0.938 vs. 0.474 for vision [Benchmark, relayed]; 9 of 16 failures silent [Anecdote, relayed]; code tool lifts placement 64.5% → 95.0% but path planning needs a real graph algorithm [Benchmark] |
| 4. Render to look | Renders one plan and one axonometric, cropped to a legible resolution; looks for what tests cannot encode, and turns each finding into a new test | Human or Claude flags issues | Self-judgment of renders 65–68% correct [Benchmark, older]; screenshots ~4× cost [Anecdote, relayed]; 1568 px downscale [Docs] |
| 5. Iterate | Fixes failures in at most one or two repair rounds; commits only versions that pass; hooks enforce the cycle | Last passing version kept in git | One repair round leaves ~1 failure [Benchmark]; Query2CAD gains mostly in round one [Benchmark, relayed]; edit is the weakest workflow at 44.37% [Benchmark, snippet] |

A prompt skeleton that encodes the loop, following Anthropic's XML-tag guidance and the CAD findings above:

```xml
<role>Residential designer detailing to [adopted code edition + local amendments]</role>
<units_and_conventions>Millimetres. Dimensions to finish face unless noted. Origin at the
SW exterior corner, +X east, +Z up. Wall assemblies defined once as named constants (WALL_T, ...).</units_and_conventions>
<program>[table: space, target area, minimum dimension, adjacent to, storey]</program>
<constraints>[door clear widths, corridor widths, stair riser/tread/headroom limits, setbacks:
each with its clause reference]</constraints>
<deliverable>house.py using ifcopenshell.api; every dimension a named constant at the top;
writes house.ifc, plan.dxf (ezdxf), plan.png, axo.png</deliverable>
<acceptance_tests>[areas within ±5%, overlaps = 0, every space has a door, all spaces reachable
from the entry, stair checks pass, IDS file passes]</acceptance_tests>
<process>Before modeling, list each missing dimension as a question. After building, run the
tests and report every result. Claim compliance only from a passing test. Change one thing per
iteration and keep the last passing version committed.</process>
```

Two existing tools show how to package this. agentcad's Inspect-Specify-Build-Validate-Deliver gates check each stage against a recorded `spec.json` ([agentcad](https://github.com/jdilla1277/agentcad)), and practitioners already use UserPromptSubmit, PostToolUse and Stop hooks in Claude Code to keep the build-and-check cycle running [Anecdote, relayed] ([torno research note](https://github.com/luisg0nc/torno/issues/42)). Built that way, the loop becomes a Claude Code skill: drop in a new house spec, and Claude has to pass your tests before it shows you a render.
