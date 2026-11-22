# Code-driven and agent-controllable 3D CAD tools for Claude (as of November 2026)

Research notes compiled 2026-11-21. Method note: in this session, direct page fetches were blocked for many vendor and academic hosts (autodesk.com, aps.autodesk.com, zoo.dev, arxiv.org, blender.org / projects.blender.org, trimble.com, prnewswire.com, mindstudio.ai, focusedsketchup.com, strayspark.studio). Where those are cited, the facts come from search-engine result snippets or summaries of the page, not a full read, and are flagged "(snippet)". GitHub, PyPI and claude.com pages were read directly. The web-search budget ran out before Three.js, Shapr3D/Plasticity/Spline and some IfcOpenShell authoring questions could be searched. Those are listed under Gaps.

Big picture: on **April 28, 2026**, Anthropic's "Claude for Creative Work" launch shipped official, "Anthropic verified" connectors for **Autodesk Fusion, Blender (Blender Lab) and Trimble SketchUp**. McNeel (RhinoAI, MIT-licensed, Rhino 8/9), PTC (Onshape FeatureScript MCP, Aug 2026, early access) and Autodesk again (Fusion Compute MCP, cloud, public beta Sept 2026) followed. Community MCP servers exist for nearly every tool. The code-CAD Python libraries (CadQuery, build123d, IfcOpenShell) remain the only paths that are fully headless, free and Linux-native.

---

## Q1. For each tool, how does Claude connect (official connector, community MCP, scripting, REST)? Is it official or community? How mature is it? What OS and cost does it need?

### Takeaway
There are three official Claude-directory connectors (SketchUp, Fusion, Blender), plus official vendor MCP servers for Rhino (McNeel RhinoAI), Onshape (FeatureScript only, early access), Zoo (zoo-mcp) and Fusion's cloud (Compute MCP beta). Only SketchUp's connector is a remote, zero-install server that works from claude.ai on the web. Fusion, Blender and Rhino need the desktop app running locally on Windows or Mac. Code-CAD libraries (CadQuery, build123d, OpenSCAD, IfcOpenShell) need no connector: Claude Code writes and runs the scripts, and optional community MCPs add render and measure feedback.

### Cited Findings

**Trimble SketchUp: official remote connector (Claude directory)**
- The listing says "Create and iterate 3D models for use in SketchUp." Its tools are `build_model`, `get_docs` and `save_model`. The publisher is Trimble SketchUp, marked "Anthropic verified," category Creative, added April 2026. The remote MCP URL is `https://api.sketchup.com/mcp/v1/sketchup/mcp`. Models can be previewed in Claude or opened in SketchUp. Sign-in is required. The listing names no plan requirements or file formats. — [Claude connector directory: SketchUp](https://claude.com/marketplace/connectors/sketchup)
- Trimble announced it on Apr 28, 2026. Access needs a Claude account plus a Trimble ID, and users enable it in Claude's connector directory settings. Claude builds geometry in a **cloud SketchUp session**, checks dimensions as it goes, and on completion returns a 2D preview thumbnail and a **download link to a .skp file** (snippet). — [Trimble press release](https://news.trimble.com/2026-04-28-Trimble-Links-SketchUp-with-Anthropics-Claude,-Bringing-New-Conversational-AI-powered-Capabilities-to-3D-Modeling); [SketchUp blog](https://sketchup.trimble.com/en/blog/article/sketchup-claude-connector)
- Cost: users get a **free SketchUp entitlement to save up to 30 models**, and a paid entitlement is needed after that (snippet). — [SketchUp blog](https://sketchup.trimble.com/en/blog/article/sketchup-claude-connector); [ENGtechnica](https://engtechnica.com/trimble-connects-sketchup-with-claude-for-ai-3d-modeling/). Engineering.com instead refers to needing a **SketchUp Go subscription** to generate SKP files (snippet). — [Engineering.com](https://www.engineering.com/now-sketchup-has-an-mcp-server-for-claude-based-3d-modeling/). This conflict is unresolved.
- Claimed as zero-setup on Claude Free, Pro and Team plans (secondary). — [ChatForest review](https://chatforest.com/reviews/interior-design-architecture-mcp-servers/)
- Tool-name discrepancy: one guide says Trimble's own help pages name a Python-execution tool (`evaluate_py`) where the directory lists `build_model`. The guide also says Trimble does not document Claude Code and that Claude's code runs in Trimble's cloud, not locally (secondary). — [techdrawai](https://techdrawai.com/blog/connect-claude-to-sketchup)
- The connector makes **new models only**. It cannot open or edit an existing .skp. — [hackceleration](https://hackceleration.com/resources/integrations/claude/sketchup)
- **Community SketchUp MCPs** (need SketchUp desktop on Win/Mac and drive the Ruby API):
  - `mhyrr/sketchup-mcp`, the original. MIT, 561 stars, only 8 commits, 13 open issues and 13 open PRs, so maintenance is uncertain. It talks TCP on port 9876 from a .rbz extension. Tools: `get_scene_info`, `create_component`, `transform_component`, `set_material`, `export_scene`, `eval_ruby` (arbitrary Ruby). — [GitHub mhyrr/sketchup-mcp](https://github.com/mhyrr/sketchup-mcp)
  - `zinin/sketchup-mcp2`, a fork. FastMCP to Ruby extension over JSON-RPC. `eval_ruby` is disabled by default, and it ships a Ruby "cookbook" for framing, roofs and extrusions. — [GitHub zinin/sketchup-mcp2](https://github.com/zinin/sketchup-mcp2); [PyPI sketchup-mcp2](https://pypi.org/project/sketchup-mcp2/)
  - `darwin/supex` is direct Ruby API access (`eval_ruby`, `eval_ruby_file`), with macOS as the primary platform. — [GitHub darwin/supex](https://github.com/darwin/supex)
  - A SketchUp forum post says the community is "ahead of Trimble" and that a viewport-screenshot tool needs **SketchUp 2026+**. — [SketchUp forum](https://forums.sketchup.com/t/agentic-work-embracing-mcp-agentic-harnesses-to-survive/350957.md)

**Autodesk Fusion: official local connector, plus cloud MCPs**
- Directory listing: "Create, modify, and inspect CAD geometry in Fusion." The publisher is Autodesk, "Anthropic verified," added May 2026. It is a **local** connector ("The MCP server runs on your machine"). It requires Fusion installed and running, with the server enabled under Preferences > General > API > Fusion MCP Server. Only Claude Desktop is named. — [Claude connector directory: Autodesk Fusion](https://claude.com/marketplace/connectors/autodesk-fusion)
- It was announced Apr 28, 2026 as part of Claude for Creative Work. Claude can read geometry, modify parts, run operations through the Fusion API and **write parametric history into the active file**. It needs an **active Fusion subscription**. Asked about AutoCAD and other products, Autodesk said "Today, we're focused on the Fusion MCP integration with Claude." — [All3DP](https://all3dp.com/4/claude-comes-to-cad-anthropics-ai-can-now-help-build-3d-models-in-autodesk-fusion/); [Autodesk Fusion blog](https://www.autodesk.com/products/fusion-360/blog/fusion-comes-to-claude-for-creative-work-bringing-ai-directly-into-the-design-workflow/) (snippet); Autodesk's X post: "We have partnered with @AnthropicAI to launch the Claude connector for Fusion" — [X @adskFusion](https://x.com/adskFusion/status/2049278655462089198)
- Autodesk help says the Fusion MCP server is only available while Fusion is open (snippet). — [Autodesk Help: Connecting to the Fusion MCP Server](https://help.autodesk.com/cloudhelp/ENU/ADSKMCP-FusionDesktopMcp/files/ADSKMCP_FusionDesktopMcp_connecting_to_the_fusion_mcp_server_html.html). A secondary guide gives the local endpoint `http://127.0.0.1:27182/mcp` and the Claude Code command `claude mcp add --transport http fusion http://127.0.0.1:27182/mcp`. This is not verified against Autodesk docs. — [techdrawai](https://techdrawai.com/blog/connect-claude-to-fusion-360)
- Autodesk also published "Build Your Own Fusion Add-ins with the Fusion MCP" (title only). — [Fusion blog](https://www.autodesk.com/products/fusion-360/blog/build-your-own-fusion-add-ins-with-the-fusion-mcp/)
- **Fusion Data MCP** is a separate cloud-hosted server for Fusion Team project data and needs no running Fusion (secondary). — [developersdigest](https://www.developersdigest.tech/mcp-servers/autodesk-fusion-data-mcp)
- **Fusion Compute MCP**: public beta from about Sept 15, 2026. It is a cloud-hosted server that runs **Fusion headless in the cloud** for parametric modeling, manufacturing setup, assembly and export, "without installing Fusion locally." It requires an Autodesk sign-in (browser OAuth), an **active Fusion licence** and a **Fusion Team hub**. Autodesk help gives the endpoint `https://developer.api.autodesk.com/da/v3/mcp/fusion`; a third party gives a different URL. Sources disagree on whether it has 7 or 8 tools. Autodesk warns that tools and behavior may change (snippet). — [Autodesk Help: Fusion Compute MCP](https://help.autodesk.com/view/ADSKMCP/ENU/?guid=ADSKMCP_FusionComputeMcp_connecting_to_the_fusion_compute_mcp_server_html); [Fusion blog: Compute MCP public beta](https://www.autodesk.com/products/fusion-360/blog/fusion-compute-mcp/); [Autodesk feedback program](https://feedback.autodesk.com/key/FusionAutomationMCP)
- Community alternative: `faust-machines/fusion360-mcp-server`, "tested with Claude Code." — [GitHub faust-machines](https://github.com/faust-machines/fusion360-mcp-server)

**AutoCAD (AutoLISP / COM / .NET): no official Claude connector; community only**
- No Autodesk AutoCAD connector for Claude was found. Autodesk said it is "focused on the Fusion MCP integration." — [All3DP](https://all3dp.com/4/claude-comes-to-cad-anthropics-ai-can-now-help-build-3d-models-in-autodesk-fusion/). A Civil 3D user idea thread is still asking for an MCP that connects Claude to C3D. — [Autodesk forum idea](https://forums.autodesk.com/t5/civil-3d-ideas/mcp-to-connect-claude-to-c3d-ai-to-generate-infrastructure-parts/idi-p/14138155). One unverified secondary claim says the AutoCAD 2027 Autodesk Assistant uses MCP internally (search summary, no primary source).
- `puran-water/autocad-mcp` v3.1 is MIT with 676 stars. It has 8 consolidated tools (`drawing`, `entity`, `layer`, `block`, `annotation`, `pid`, `view`, `system`) and two backends:
  - **File IPC** drives AutoCAD LT 2024+ on Windows 10/11 and needs native Windows Python.
  - **ezdxf** is headless DXF generation on any OS, including Linux.
  - AutoLISP "was added in LT 2024 for Windows," and LT for Mac does not support it.
  - DWG open/save and PDF plotting are File-IPC-only. The ezdxf backend renders previews with matplotlib.
  - The README states that "a successful CAD command or screenshot doesn't approve a design."
  - Source: [GitHub puran-water/autocad-mcp](https://github.com/puran-water/autocad-mcp)
- Other community servers:
  - `C48H74/autocad-mcp`: COM live control of AutoCAD or Plant 3D, or ezdxf headless, with 50 tools and AutoLISP off by default. — [GitHub](https://github.com/C48H74/autocad-mcp)
  - `beiming183-cloud/AutoCAD-MCP`: client-neutral, covering full AutoCAD, LT or a headless DXF backend. — [GitHub](https://github.com/beiming183-cloud/AutoCAD-MCP)
  - `LuiccianDev/autocad-mcp`: AutoCAD 2027 and Civil 3D, with in-memory AutoLISP evaluation. — [GitHub](https://github.com/LuiccianDev/autocad-mcp)
  - `romulocorrea/autocad-mcp-lisp`: an LT 2024/2025 fork. — [GitHub](https://github.com/romulocorrea/autocad-mcp-lisp/tree/main)
  - `radwanalmsora/mcp-server-autocad-lisp-helper`: static analysis of .lsp files only. — [GitHub](https://github.com/radwanalmsora/mcp-server-autocad-lisp-helper)

**Blender: official Blender Lab connector, plus the dominant community server**
- **Official (Blender Lab)** directory listing: "Natural language interface with the Python API and documentation." The publisher is Blender Lab, "Anthropic verified," added April 2026. An add-on is required. The icon URL implies v1.0.1. — [Claude connector directory: Blender](https://claude.com/marketplace/connectors/blender)
- Secondary sources say the official server:
  - needs **Blender 5.1+**;
  - is an experimental Blender Lab project "outside the current Blender roadmap";
  - has its code at projects.blender.org/lab/blender_mcp;
  - works on any Claude plan including Free, and works with Claude Code;
  - is cited as v1.0.0 (Apr 27, 2026) and v1.0.3 (Sept 2026), with default ports given as 9876 or 9886. These values conflict.
  - Sources: [Voyager](https://voyager.so/blog/blender-mcp); [aztech3d](https://aztech3d.com/en/guides/blender-mcp-official-vs-community/); [mcp.film](https://mcp.film/mcps/blender-lab-mcp/); [strayspark (snippet)](https://www.strayspark.studio/blog/official-blender-mcp-server-comparison-2026)
- **Community: `ahujasid/mcp-for-blender`** (renamed from `blender-mcp` around Sept 16, 2026; `uvx blender-mcp` still works as a wrapper). — [GitHub issue #366](https://github.com/ahujasid/mcp-for-blender/issues/366)
  - Popularity and release pace: **35.3k stars**, 3.2k forks. It is very actively released, with **v2.3.1 on Nov 18, 2026** and about 28 releases since Sept 1, 2026. — [GitHub](https://github.com/ahujasid/mcp-for-blender); [PyPI mcp-for-blender](https://pypi.org/project/mcp-for-blender/)
  - Architecture: a socket add-on inside Blender. It needs Blender 3.0+ and Python 3.10+ with uv, runs on macOS, Linux and Windows, and Docker is supported. Setup: `claude mcp add blender uvx mcp-for-blender`, then `uvx mcp-for-blender install-addon`. — [GitHub](https://github.com/ahujasid/mcp-for-blender)
  - Tools:
    - `execute_blender_code` (arbitrary bpy) and `get_scene_info`;
    - a **`look` tool for visual verification** (viewport, camera, angles, renders);
    - asset search/import (Poly Haven, Sketchfab, Poly Pizza);
    - AI mesh generators (Hyper3D Rodin, Meshy, Tripo, Hunyuan3D, World Labs Gaussian worlds).
    - Source: [GitHub](https://github.com/ahujasid/mcp-for-blender)
  - Warnings:
    - the socket has no auth, so keep it on localhost;
    - `BLENDER_MCP_SAFE_MODE=1` optionally blocks risky scripts;
    - minimal anonymous telemetry is on by default (`DISABLE_TELEMETRY=true` turns it off);
    - run only one MCP client at a time.
    - Source: [GitHub](https://github.com/ahujasid/mcp-for-blender)

**Bonsai (formerly BlenderBIM) / IfcOpenShell: community MCPs, mature open-source library**
- `Show2Instruct/bonsai-mcp` (public 2026-07, v1.2 in 2026-08) is MIT but small: 16 stars, 9 commits. It has 14 tools:
  - query: `list_elements`, `get_psets`, `get_spatial_structure`, `get_quantities`, `get_viewport_screenshot`;
  - edit: `execute_ifc_code` (IfcOpenShell/Bonsai API with a pre-injected IFC namespace; blocks bpy), `execute_blender_code`, `save_ifc_file`, refresh and reload tools.
  - It also has two prompts, `model-audit` and `visual-verify`.
  - It needs Blender 3.6+ (4.x recommended) and Bonsai, with a bridge on 127.0.0.1:9878, so a **live Blender session is required**.
  - It is not on PyPI and not an official Bonsai release.
  - Source: [GitHub Show2Instruct/bonsai-mcp](https://github.com/Show2Instruct/bonsai-mcp)
- Its design rationale is "modern LLMs write IfcOpenShell code well, so a small set of guarded code tools covers more IFC tasks than any fixed tool list." It supersedes the earlier `ifc-bonsai-mcp`. — [GitHub ifc-bonsai-mcp](https://github.com/Show2Instruct/ifc-bonsai-mcp); search summary of [bonsai-mcp](https://github.com/Show2Instruct/bonsai-mcp)
- `JotaDeRodriguez/Bonsai_mcp` is the original BlenderMCP fork adding IFC tools. Listings call it a proof of concept, requiring Blender 4.0+ and Python 3.12+. — [mcpservers.org](https://mcpservers.org/servers/JotaDeRodriguez/Bonsai_mcp)
- **IfcOpenShell** 0.9.0.post1 was released Oct 15, 2026.
  - Wheels: Python 3.10–3.15 on **Linux x86-64/ARM64**, macOS and Windows.
  - Schemas: IFC2x3, IFC4, IFC4x1, IFC4x2, IFC4x3.
  - Licence: LGPL-3.0+. — [PyPI ifcopenshell](https://pypi.org/project/ifcopenshell/)
  - Components include ifcopenshell-python, IfcConvert ("convert IFC to many other formats"), Bonsai (GPL-3.0, "graphical native IFC authoring platform"), ifcpatch, ifctester (IDS auditing) and ifcedit (CLI wrapper over `ifcopenshell.api` mutation functions). It is also distributed via conda-forge, Docker Hub and Pyodide WASM wheels. — [GitHub IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell)

**FreeCAD: community MCP; free and open source; BIM workbench**
- `neka-nat/freecad-mcp` is the de facto standard: 3.4k stars, 394 forks, 23 open issues, 27 open PRs.
  - It is an add-on workbench inside FreeCAD; you click "Start RPC Server", then configure `uvx freecad-mcp` in Claude Desktop.
  - It can create and edit objects, run Python inside FreeCAD, inspect documents and run FEM.
  - Its docs cover headless scripts, remote connections, HTTP transport and Docker. FreeCAD must otherwise stay open with the RPC server running.
  - Source: [GitHub neka-nat/freecad-mcp](https://github.com/neka-nat/freecad-mcp)
- Directory listings report 10 tools (`create_document`, `create_object`, `edit_object`, `delete_object`, …). — [addmcp](https://addmcp.net/servers/freecad-mcp). FreeCAD 1.0/1.1 are supported. — [mcp.directory](https://mcp.directory/blog/freecad-mcp-complete-guide-2026). Older forks (`bonninr/freecad_mcp`, `contextform/freecad-mcp`) are reportedly not updated since 2025, so treat them as **likely abandoned** (search summary; verify). — [mcp.so listing](https://mcp.so/servers/freecad-mcp)
- The BIM workbench was merged with Arch in FreeCAD 1.0. — [FreeCAD docs: BIM Workbench](https://github.com/FreeCAD/FreeCAD-documentation/blob/main/wiki/BIM_Workbench.md). IFC import/export goes through IfcOpenShell, whose Python must match FreeCAD's. IFC requires objects to sit inside a Building (optionally a Storey), and the exporter adds a default Site. — [FreeCAD manual: BIM modeling](https://github.com/yorikvanhavre/FreeCAD-manual/blob/master/working_with_freecad/bim_modeling.md)

**Code-CAD libraries: Claude Code writes and runs the scripts; optional MCPs**
- **CadQuery**: 6.1k stars, Apache-2.0. "Built to be used as a Python library without any GUI." Installs with `pip install cadquery` (Python 3.9–3.12 only), though conda is the "better supported option." Outputs STEP, DXF, STL, VRML, AMF and 3MF. — [GitHub CadQuery](https://github.com/CadQuery/cadquery)
- **build123d**: 3.8k stars, Apache-2.0. A parametric BREP framework on OpenCascade, derived partly from CadQuery, supporting Python 3.11–3.14 via `pip install build123d`. Imports SVG/STEP and exports STEP/STL. The browser/VS Code OCP Viewer is optional. — [GitHub build123d](https://github.com/gumyr/build123d)
- build123d MCP servers:
  - `pzfreo/build123d-mcp` (Apache-2.0, 157 stars, 609 commits, "active development"): persistent session, render previews (PNG/SVG/DXF), measure, feature inspection, printability checks, STEP/STL import, snapshots. Exports STEP/STL/DXF/SVG. Its dev container installs display packages for **headless rendering**. — [GitHub pzfreo/build123d-mcp](https://github.com/pzfreo/build123d-mcp)
  - `jdilla1277/agentcad`: CLI plus MCP, build123d by default and CadQuery as a compatibility mode. — [GitHub agentcad](https://github.com/jdilla1277/agentcad)
  - `Casys-AI/mcp-build123d`: Deno; returns STEP/STL/GLB plus exact mass properties. — [GitHub](https://github.com/Casys-AI/mcp-build123d)
  - `dmilad/ocp-viewer-mcp`: screenshots the OCP viewer for visual feedback (CadQuery/build123d). — [GitHub](https://github.com/dmilad/ocp-viewer-mcp)
- **OpenSCAD** (all community):
  - `quellant/openscad-mcp`: render, export and analyze. In Claude Code you add it with `claude mcp add openscad --transport stdio -- uv run --with git+https://github.com/quellant/openscad-mcp.git openscad-mcp`, and with the Claude CLI you "MUST explicitly grant permissions using `--allowedTools`." — [GitHub quellant/openscad-mcp](https://github.com/quellant/openscad-mcp)
  - Other servers: [PyPI openscad-mcp-server](https://pypi.org/project/openscad-mcp-server/) and [jkoets/OpenSCAD-MCP](https://github.com/jkoets/OpenSCAD-MCP).
  - Claude Code skills (no MCP) that auto-render PNG previews so the agent can "see and self-correct": [andreahaku/openscad_claude_skill](https://github.com/andreahaku/openscad_claude_skill) and [iancanderson/openscad-agent](https://github.com/iancanderson/openscad-agent).

**Zoo.dev (formerly KittyCAD): official MCP, KCL language, Design Studio, Zookeeper agent**
- `KittyCAD/mcp` (`zoo-mcp`) is the official server: MIT, but only 12 stars, despite 291 commits.
  - Tools: `execute_kcl` (mock preflight, then real execution), `mock_execute_kcl`, modeling sessions, `import_cad_file`, `snapshot` plus camera/selection tools, measurement queries, and KCL samples ("Aquarium").
  - Auth: `uvx zoo-mcp auth login` (browser device flow), or set **`ZOO_API_TOKEN` on headless systems**.
  - Prebuilt binaries for **Linux x86_64/arm64**, macOS and Windows.
  - Transports: stdio, or `--transport streamable-http`.
  - Claude Code setup: `claude mcp add --scope project "Zoo-MCP" uv -- --directory "$PWD"/src/zoo_mcp run server.py`.
  - Source: [GitHub KittyCAD/mcp](https://github.com/KittyCAD/mcp)
- Zoo docs: setup is `uvx zoo-mcp` with `ZOO_API_TOKEN`. The assistant saves `main.kcl` and runs it via `kcl_path`. MCP-triggered billable API operations **share the monthly allowance with Zookeeper reasoning time** and are not covered by "unlimited CAD modeling" (snippet). — [Zoo MCP docs](https://zoo.dev/docs/developer-tools/mcp)
- KCL is "a domain-specific, parametric CAD programming language." Zookeeper is Zoo's conversational CAD agent and generates parametric KCL (snippet). — [Zoo FAQ](https://zoo.dev/docs/faq); [Announcing Zookeeper](https://zoo.dev/blog/announcing-zookeeper)
- Zoo Design Studio is MIT-licensed (1.3k stars) and hybrid point-and-click, with everything stored as KCL. Its **3D view is a video stream from a hosted geometry engine**, meaning the kernel runs in Zoo's cloud. — [GitHub KittyCAD/modeling-app](https://github.com/KittyCAD/modeling-app)
- Pricing (third-party, unverified against zoo.dev):
  - Free: about 20 Zookeeper minutes per month (~$10 of usage); the free tier may allow training on your data.
  - Plus: $20/mo for about 400 minutes; overage reported at $0.50/min.
  - Pro: $99/mo.
  - Team: $399/mo.
  - Sources: [skipthecad](https://skipthecad.com/generators/zoo-zookeeper/); [cadalts](https://cadalts.com/tools/zoo/); [agentery](https://agentery.com/agents/zookeeper)

**Onshape (PTC): official FeatureScript MCP (early access), plus community REST MCP**
- PTC launched the **Onshape FeatureScript MCP Server** in early access on Aug 13, 2026 via Onshape Labs. It lets engineers create **custom CAD features** in natural language with coding LLMs such as Claude, ChatGPT and Gemini, and it is reached through the Onshape App Store (snippet). — [PTC press release](https://www.ptc.com/en/news/2026/onshape-launches-featurescript-mcp-server); [DEVELOP3D](https://develop3d.com/cad/onshape-featurescript-mcp-lets-users-build-custom-cad-features-fast/)
- One guide gives `claude mcp add --transport http onshape https://fs-mcp.labs.onshape.app/mcp` (unverified). — [buildcad.ai](https://buildcad.ai/guides/cad-mcp-servers). Onshape's blog presents a fuller "Onshape MCP server, a toolkit for custom agents" as future work (snippet). — [Onshape blog](https://www.onshape.com/en/blog/ai-artificial-intelligence-cloud-native-cad-pdm-platform)
- Community `hedless/onshape-mcp` (MIT, 170 stars) has 45 tools over the Onshape REST API: documents, sketches (rect/circle/line/arc), extrude/revolve/fillet/chamfer/patterns/boolean, assemblies and mates, interference check, variables, `eval_featurescript`, and export. Auth is Onshape API keys (HMAC). — [GitHub hedless/onshape-mcp](https://github.com/hedless/onshape-mcp)
- Conflicting claim: an Aug 2026 page says PTC provides no official Onshape MCP. This predates or ignores the launch. — [innfactory](https://innfactory.ai/en/services/companygpt/integrations/onshape/)

**Rhino + Grasshopper (McNeel): official RhinoAI MCP; strong community server**
- `mcneel/RhinoAI` ("AI features for Rhino") is MIT, with 427 stars and 931 commits on the `rhino-9.x` branch. Claude Desktop users install the `connector.mcpb` (v0.1.6) from releases, and it installs the Rhino plugin. — [GitHub mcneel/RhinoAI](https://github.com/mcneel/RhinoAI)
- The router defaults to Rhino 8. You target Rhino 9 via the connector setting in Claude Desktop, or via `-v 9` in Claude Code. **Grasshopper 2 tools require Rhino 9.** — [McNeel RhinoAI troubleshooting](https://mcneel.github.io/RhinoAI/docs/troubleshooting/). There is a Claude Code plugin guide. — [McNeel RhinoMCP docs: Claude Code](https://mcneel.github.io/RhinoMCP/docs/getting-started/cc-plugin/)
- Rhino 9 was reportedly released on Oct 27, 2026 with RhinoAI built in. Tools are grouped into read-only, modify and destructive, but external MCP clients still see every tool even when some are switched off (secondary). — [archicoder](https://archicoder.com/posts/rhino-mcp-ai-agents-in-rhino-and-grasshopper/). Framing: "Rhino 9 ships an MIT-licensed MCP bridge. You bring the model, you pay for it." — [Construction Industry AI](https://www.constructionindustry.ai/product/rhino-9-rhinoai-mcp-mit-licence-bring-your-own-model/); see also [AEC Magazine: Rhino World 2026](https://aecmag.com/cad/rhino-world-2026-mcneel-lets-ai-in/)
- A McNeel forum report says older install instructions no longer apply cleanly because Claude Desktop overwrites manual config edits. — [McNeel Discourse](https://discourse.mcneel.com/t/rhino-mcp-server/216568)
- Community `jingcheng-chen/rhinomcp` (MIT, 1.2k stars, 388 commits, actively developed, has a Claude Code plugin):
  - Requirements: **Rhino 8.20+ on Windows or macOS** (.NET 8), installed with `uvx rhinomcp`.
  - Tools: `execute_rhinoscript_python_code`, `execute_rhinocommon_csharp_code`, `run_command`, `capture_viewport` (image plus metadata), about 25 Grasshopper `gh_*` tools (add/connect components, set sliders, run solution) and about 50 modeling tools.
  - Source: [GitHub jingcheng-chen/rhinomcp](https://github.com/jingcheng-chen/rhinomcp)
  - Another community option is `EaseHee/rhino-mcp` (Rhino 8/9, C# bridge, Grasshopper). — [GitHub EaseHee/rhino-mcp](https://github.com/easehee/rhino-mcp). A `rhino3dm-mcp` package also exists on PyPI. — [PyPI rhino3dm-mcp](https://pypi.org/project/rhino3dm-mcp/0.7.0/)

**Three.js / browser procedural modeling**
- three.js ships exporters for **glTF (GLTFExporter), OBJ, STL, PLY, USDZ, DRACO**, plus EXR/KTX2 textures, in `examples/jsm/exporters`. — [GitHub three.js exporters](https://github.com/mrdoob/three.js/tree/dev/examples/jsm/exporters)

### Inferences
- **The connection model decides who can use what.** Only the SketchUp connector is a remote, cloud-run MCP, which is why it works in claude.ai on the web with nothing installed. Fusion's and Blender's official connectors are local servers, so they need Claude Desktop (or Claude Code on the same machine) plus the app running. Fusion Compute MCP, Zoo MCP (API) and Onshape (REST, FeatureScript MCP) are cloud paths that could in principle be reached from Claude Code on the web, *if* the environment's network allowlist permits the hosts. This session's own fetch failures for autodesk.com and zoo.dev show that allowlisting matters.
- Summary matrix (synthesized from the findings above):

| Tool | Claude path | Official? | OS | Cost | Maturity signal |
|---|---|---|---|---|---|
| SketchUp connector | Remote MCP in Claude directory | Trimble official | Any (cloud) | 30 free saved models, then paid SketchUp | New (Apr 2026), new models only |
| SketchUp community MCPs | Local MCP + Ruby extension | Community | Win/Mac (SketchUp desktop) | SketchUp licence | Small repos, uneven upkeep |
| Fusion connector | Local MCP inside Fusion | Autodesk official | Win/Mac | Active Fusion subscription | New (Apr/May 2026) |
| Fusion Compute MCP | Cloud MCP (headless Fusion) | Autodesk official | Any (cloud) | Fusion licence + Team hub | Public beta (Sept 2026) |
| AutoCAD MCPs | Local MCP via AutoLISP/COM; ezdxf headless | Community only | Windows (LT 2024+); ezdxf on any OS | AutoCAD/LT licence; ezdxf free | puran-water 676 stars |
| Blender Lab connector | Local MCP + add-on | Blender Lab official (experimental) | Win/Mac/Linux | Free | v1.0.x (2026) |
| mcp-for-blender (ahujasid) | Local MCP + add-on | Community | Win/Mac/Linux, Docker | Free (optional paid asset/AI APIs) | 35k stars, weekly releases |
| Bonsai MCP | Local MCP + Blender bridge | Community | Win/Mac/Linux | Free | Tiny (16 stars), 2026 |
| FreeCAD MCP (neka-nat) | Local MCP + RPC add-on | Community | Win/Mac/Linux | Free | 3.4k stars |
| CadQuery / build123d | Claude Code runs Python; optional MCPs | Open-source libs | Linux/Mac/Win, headless | Free | Mature libs |
| OpenSCAD | Claude Code runs CLI; community MCPs | Open-source | Any, headless | Free | Many small MCPs |
| Zoo | zoo-mcp (stdio/HTTP) + cloud API | Zoo official | Linux/Mac/Win binaries; cloud kernel | Metered (Free / $20 / $99 / $399 tiers) | Official but low adoption (12 stars) |
| Onshape | FeatureScript MCP (official, early access); REST MCP (community) | Both | Any (cloud) | Onshape plan (details unknown) | Early access |
| Rhino/Grasshopper | RhinoAI MCP (official) or rhinomcp (community) | Both | Win/Mac | Rhino licence; BYO model | Official since 2026; community 1.2k stars |
| Three.js | Claude writes JS; browser or artifact renders | n/a | Any browser | Free | Lightweight |

- **Abandonment flags:** the older FreeCAD MCP forks (not updated since 2025); `mhyrr/sketchup-mcp` (8 commits, large open PR backlog); the 2025-era CadQuery MCP listed on Glama. Each of these is likely stale.

### Gaps
- I could not read the full text of Trimble's help page for the connector: exact tool behavior (`build_model` vs `evaluate_py`), export formats beyond .skp, and whether a paid SketchUp Go/Pro plan is needed beyond the 30 free models.
- Blender Lab MCP's exact tool list, minimum version and port could not be verified (projects.blender.org and blender.org blocked).
- Onshape FeatureScript MCP plan requirements and pricing were not found.
- Rhino licence pricing and Zoo's official pricing page were not retrieved.
- Shapr3D, Plasticity and Spline: no searches were possible (search budget exhausted). Whether they have meaningful agent hooks is unknown from this research.
- No GitHub last-commit dates were visible on the fetched repo pages. Maturity is inferred from stars, commits, PyPI release dates and changelogs.

---

## Q2. What are each tool's strengths and weaknesses for architectural modeling (walls, floors, roofs, openings, stairs) versus mechanical parts?

### Takeaway
For buildings, the strongest agent-drivable paths are **SketchUp** (official connector: quick massing, good at repetitive elements, weak on precise dimensions and circulation logic), **Blender + Bonsai/IfcOpenShell** (true semantic IFC walls, slabs and openings, with per-storey plan screenshots for checking) and **Rhino/Grasshopper** (parametric facades and forms). Fusion, Onshape, Zoo, CadQuery and build123d are B-rep mechanical-part tools. They are precise and parametric but have no building semantics. FreeCAD sits in between: a BIM workbench with IFC export, but it is clunkier to drive headless.

### Cited Findings
- **SketchUp connector, house and room tests:**
  - A FOCUSED SketchUp tester found that "precise dimensions were the first crack": the room was close but not exact, and the shelving depth was wrong for real built-ins. Furniture came out as generic stand-ins ("A box that means 'chair'"). The clear win was evenly spaced repetitive geometry (shelves). (snippet) — [FOCUSED SketchUp](https://focusedsketchup.com/blog/can-claude-model-in-sketchup-i-tested-the-connector/)
  - MindStudio tested a one-bedroom apartment. It had **no door between living room and bedroom and no door from bedroom to bathroom**. SketchUp produced "the most usable output and also the most structurally absurd one." (snippet) — [MindStudio](https://www.mindstudio.ai/blog/claude-3-creative-app-mcp-connectors-blender-adobe-sketchup)
  - Across reviews:
    - when iterating, Claude sometimes resets an earlier dimension to a round number without flagging it;
    - curved surfaces, freeform roofs and compound miters are weak;
    - your installed extensions and plugins are not available in the session;
    - models are not stored between chats;
    - the verdict is "good enough for a first massing or blocking model, not good enough to hand to a builder."
    - These come from the search summary and the attribution is spread across the sources below. — [justnecessary substack](https://justnecessary.substack.com/p/sketchup-claude-the-ai-connector); [meltflexai](https://www.meltflexai.com/blog/connect-claude-to-sketchup); [techdrawai](https://techdrawai.com/blog/connect-claude-to-sketchup)
- **SketchUp community MCP:** the `zinin/sketchup-mcp2` Ruby cookbook explicitly covers **framing, roofs and extrusions**, which suits building elements. — [GitHub zinin/sketchup-mcp2](https://github.com/zinin/sketchup-mcp2)
- **Bonsai/IfcOpenShell:** the tools expose the IFC spatial structure, property sets and quantities. `get_viewport_screenshot` supports named views or azimuth/elevation, **per-storey floor plans**, and **color-by-IFC-class shading**. — [GitHub Show2Instruct/bonsai-mcp](https://github.com/Show2Instruct/bonsai-mcp). Bonsai is "a graphical native IFC authoring platform." — [GitHub IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell)
- **FreeCAD BIM:** IFC export requires a Site → Building → (Storey) hierarchy, so generation scripts must build it. — [FreeCAD manual: BIM modeling](https://github.com/yorikvanhavre/FreeCAD-manual/blob/master/working_with_freecad/bim_modeling.md)
- **Rhino/Grasshopper:** rhinomcp exposes about 25 Grasshopper tools (add and connect components, set sliders, run solution) alongside RhinoCommon C# and Python execution. — [GitHub jingcheng-chen/rhinomcp](https://github.com/jingcheng-chen/rhinomcp). Grasshopper 2 via RhinoAI needs Rhino 9. — [McNeel troubleshooting](https://mcneel.github.io/RhinoAI/docs/troubleshooting/)
- **Fusion:** it writes parametric history into the active file through the Fusion API. — [All3DP](https://all3dp.com/4/claude-comes-to-cad-anthropics-ai-can-now-help-build-3d-models-in-autodesk-fusion/). Compute MCP's scope is "parametric modeling, manufacturing setup, assembly, and export," which is mechanical and manufacturing oriented (snippet). — [Autodesk Help: Fusion Compute MCP](https://help.autodesk.com/view/ADSKMCP/ENU/?guid=ADSKMCP_FusionComputeMcp_connecting_to_the_fusion_compute_mcp_server_html). A vendor critique is titled "Autodesk Fusion MCP: Faster CAD, Same Bottleneck" (title only). — [CoLab](https://www.colabsoftware.com/post/autodesk-fusion-mcp-faster-cad-same-bottleneck)
- **Onshape:** the FeatureScript MCP targets custom-feature authoring, not general modeling. — [PTC](https://www.ptc.com/en/news/2026/onshape-launches-featurescript-mcp-server). The community REST MCP covers sketches, extrudes, patterns, assemblies and mates, which are mechanical primitives. — [GitHub hedless/onshape-mcp](https://github.com/hedless/onshape-mcp)
- **AutoCAD MCPs** lean toward 2D drafting: layers, blocks, annotation, P&ID symbols. — [GitHub puran-water/autocad-mcp](https://github.com/puran-water/autocad-mcp)
- **Blender (generic bpy):** strengths are visualization, materials and assets (Poly Haven HDRIs and textures), plus AI mesh generators. — [GitHub ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender)

### Inferences
- For the end user's stated goal (prompting Claude to model houses), a two-track recommendation fits the evidence:
  - **Quick, conversational massing with nothing installed:** the SketchUp connector from claude.ai or Claude Desktop, with the expectation of checking doors, circulation and dimensions by hand.
  - **Precise, semantic, editable building models from Claude Code:** IfcOpenShell scripts (headless) or Bonsai MCP (live Blender), producing IFC that downstream BIM tools can open.
- Mechanical B-rep tools (build123d, CadQuery, Fusion, Onshape, Zoo) can model walls and slabs as boxes with booleaned openings. They yield geometry with no IFC semantics (no IfcWall or IfcDoor), and sweeps and lofts, which roofs and stairs need, are exactly where benchmarks show LLM failure rates rise (see Q4).
- Generic bpy in Blender gives mesh geometry. It is good for visualization and renders, but walls lack thickness semantics and dimensions unless Bonsai is used.

### Gaps
- No source directly compared these tools on a standard house-modeling task (walls, roofs, stairs) with measured accuracy.
- I found no reports specifically on stair or roof generation quality by any connector, beyond the "freeform roofs weak" note for SketchUp.

---

## Q3. What file formats does each tool read and write (IFC, STEP, STL, OBJ, glTF/GLB, USD, DXF/DWG, 3DM, SKP)?

### Takeaway
IFC is native only to the IfcOpenShell, Bonsai and FreeCAD BIM paths. STEP comes from the B-rep tools (CadQuery, build123d, Fusion, Onshape, Zoo). The SketchUp connector delivers .skp. DWG needs real AutoCAD, while ezdxf gives DXF headless. three.js and build123d MCPs give glTF/GLB for web viewing.

### Cited Findings
- SketchUp connector: a .skp download link plus a 2D preview thumbnail (snippet). — [Trimble press release](https://news.trimble.com/2026-04-28-Trimble-Links-SketchUp-with-Anthropics-Claude,-Bringing-New-Conversational-AI-powered-Capabilities-to-3D-Modeling). The community `mhyrr/sketchup-mcp` has an `export_scene` tool for "various formats." — [GitHub](https://github.com/mhyrr/sketchup-mcp)
- CadQuery: STEP, DXF, STL, VRML, AMF, 3MF. — [GitHub CadQuery](https://github.com/CadQuery/cadquery)
- build123d: import SVG/STEP, export STEP/STL. — [GitHub build123d](https://github.com/gumyr/build123d). build123d-mcp exports STEP/STL/DXF/SVG and imports STEP/STL. — [GitHub pzfreo/build123d-mcp](https://github.com/pzfreo/build123d-mcp). `mcp-build123d` returns STEP/STL/GLB. — [GitHub Casys-AI/mcp-build123d](https://github.com/Casys-AI/mcp-build123d)
- OpenSCAD (dkpoulsen Node MCP): compiles to STL, OFF, AMF, 3MF, CSG (search summary). — [Glama listing](https://images.glama.ai/mcp/servers/dkpoulsen/openscad-mcp)
- IfcOpenShell: reads and writes IFC2x3/IFC4/IFC4x1/IFC4x2/IFC4x3. — [PyPI](https://pypi.org/project/ifcopenshell/). IfcConvert converts IFC to "many other formats" (the specific list is not confirmed on the page). — [GitHub IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell). Bonsai MCP has `save_ifc_file`. — [GitHub Show2Instruct/bonsai-mcp](https://github.com/Show2Instruct/bonsai-mcp)
- FreeCAD: IFC via IfcOpenShell. — [FreeCAD manual](https://github.com/yorikvanhavre/FreeCAD-manual/blob/master/working_with_freecad/bim_modeling.md)
- AutoCAD MCP: DXF on both backends; DWG open/save and PDF plot only via File IPC (live AutoCAD LT on Windows). — [GitHub puran-water/autocad-mcp](https://github.com/puran-water/autocad-mcp)
- Onshape community MCP: `export_part_studio` and `export_assembly` (formats not enumerated on the page). — [GitHub hedless/onshape-mcp](https://github.com/hedless/onshape-mcp)
- Zoo MCP: `import_cad_file`. Export formats are not listed in the README. — [GitHub KittyCAD/mcp](https://github.com/KittyCAD/mcp). Third-party pages say Zoo produces "downloadable STEP or STL exports" as a separate export step. — [cadalts](https://cadalts.com/tools/zoo/)
- Fusion Compute MCP includes "export" (formats not specified, snippet). — [Autodesk Help](https://help.autodesk.com/view/ADSKMCP/ENU/?guid=ADSKMCP_FusionComputeMcp_connecting_to_the_fusion_compute_mcp_server_html)
- three.js: GLTFExporter (glTF/GLB), OBJ, STL, PLY, USDZ, DRACO. — [GitHub three.js exporters](https://github.com/mrdoob/three.js/tree/dev/examples/jsm/exporters)

### Inferences
- A robust house pipeline is: author in IfcOpenShell → IFC (semantic master) → IfcConvert, or Blender → glTF/OBJ for web preview, with DXF plans from ezdxf. STEP is not a natural building-exchange format.
- If the end user needs .skp, only SketchUp tools (connector or Ruby MCP) produce it natively.

### Gaps
- Blender, Rhino (.3dm), Fusion (.f3d) and Onshape export lists were not verified from primary pages in this session. Blender's broad import/export (glTF, USD, OBJ, FBX, STL) and Rhino's .3dm native format are well known but not cited here.
- IfcConvert's exact output list was not confirmed.
- I found no source on whether the SketchUp connector can export anything besides .skp.

---

## Q4. What do practitioners and benchmarks report about the reliability of LLM-driven modeling (accuracy, failure modes, need for render-and-check loops)?

### Takeaway
Simple parametric parts now compile and run reliably. A late-2026 third-party run of Claude Opus 5.5 on Text2CAD-Bench saw only about 2–4% CadQuery run failures. Accuracy collapses on advanced features (sweeps, lofts, patterns) and on spatial logic such as door placement. Every serious practitioner tool adds a **render / measure / validate feedback loop**, and the measured gains from a single repair round are large.

### Cited Findings
- **Text2CAD-Bench** (May 2026, 600 human-curated examples): text-to-CAD "remains largely unsolved beyond basic geometry." Performance "degrades substantially on L3 advanced features." **Python CadQuery representations beat command-sequence formats** because models exploit pretrained code skill (snippet). — [arXiv 2605.18430](https://arxiv.org/pdf/2605.18430). The Hugging Face listing shows Claude-4.5-Sonnet at CD 66.90, invalidity ratio 41.3% and IoU 0.43, which doesn't match the paper's own table (conflict noted in the search summary). — [HF dataset AICAD/Text2CAD-Bench](https://huggingface.co/datasets/AICAD/Text2CAD-Bench)
- **Third-party verifier on the Text2CAD-Bench preview** (151 prompts, dated 2026-10-08), run with `claude-opus-5-5`:
  - Run failures: 4/151 (~2.6%) in "pro" style and 3/151 (~2.0%) in "geo" style.
  - Size mismatches: 3/117 and 8/117.
  - After **one repair round**: 1 failure remained per style, with 0 size mismatches.
  - Noise floor: repeat runs varied by about 2 failures.
  - Failures concentrate in L2/L3 (**sweeps, lofts, patterns**), and L1 almost never fails. Some 60-second timeouts were CPU contention, not the model.
  - Caveat: the bounding-box size check misses missing holes.
  - Cost: about $5 for 7 batches.
  - Source: [GitHub CY-HYUN/text2cad-verifier](https://github.com/CY-HYUN/text2cad-verifier)
- **BenchCAD** (May 2026): Claude Opus 4.7 scored 0.801 total, and Opus 4.7 thinking 0.829 (snippet). — [arXiv 2605.10865](https://arxiv.org/pdf/2605.10865). An aggregator lists Opus 5.5 at 0.962 "with tools," but its dates and model names are inconsistent, so treat this as unverified. — [klu.ai](https://klu.ai/benchmarks/benchcad)
- **CadBench** (May 2026): CAD-Coder had the highest valid-shape rate among image-conditioned methods. Accuracy drops on photorealistic renders (ΔIoU −0.073) and more on multi-view input (−0.184) (snippet). — [arXiv 2605.10873](https://arxiv.org/html/2605.10873v1)
- **CADPrompt / CADCodeVerify** (ICLR 2025; preprint Oct 2024, so **possibly outdated**): 200 prompts with expert CadQuery code. Compile rates were GPT-4 96.5%, Gemini 85% and CodeLlama 73.5%. Its central idea is a visual-feedback verify loop (snippet). — [arXiv 2410.05340](https://arxiv.org/pdf/2410.05340); [ICLR 2025 paper](https://proceedings.iclr.cc/paper_files/paper/2025/file/81a934cd364e18ea6fdeaf57a93c17d4-Paper-Conference.pdf)
- **CAD-Coder** (2025): Mean CD 6.54, Median CD 0.17 and 1.45% invalidity on Text2CAD (snippet). — [arXiv 2505.19713](https://arxiv.org/html/2505.19713v3). **CAD-Recode** reconstructs point clouds to Python CAD code. Its successor "cadrille" reports DeepCAD IoU 92.2 and Fusion360 IoU 84.6 (via the BenchCAD snippet). — [arXiv 2605.10865](https://arxiv.org/pdf/2605.10865)
- **Feedback loops in engineering-validated CAD** (2026 preprints):
  - 400 first attempts produced no strict-passing artifact, and one FEA-feedback round added only one strict pass, though repeated loops compound gains.
  - Another paper notes that more iterations can become unstable.
  - Without a planner agent, Claude Sonnet 4.5 and Opus 4.5 "exhibit larger degradation," so explicit task decomposition matters.
  - The search summary attributes these across two papers; the exact attribution is uncertain. — [arXiv 2605.19717 Physics-in-the-Loop](https://arxiv.org/pdf/2605.19717); [arXiv 2605.17448 FEA feedback](https://arxiv.org/pdf/2605.17448)
  - Related work: [RA-CAD post-execution critique, arXiv 2608.05714](https://arxiv.org/pdf/2608.05714); [RealCADBench, arXiv 2609.03773](https://arxiv.org/pdf/2609.03773); [Parametric CAD Bench v3 (agentic CAD from text and engineering drawings), arXiv 2611.02659](https://arxiv.org/pdf/2611.02659). For these only the titles were seen; results were not retrieved.
- **Tool authors' own evidence for render/measure loops:**
  - build123d-mcp's author reports that a CADGenBench score rose from 0.360 to 0.457 and CAD validity from 88% to 100% with the MCP's incremental build/validate workflow (self-reported). — [GitHub pzfreo/build123d-mcp](https://github.com/pzfreo/build123d-mcp)
  - OpenSCAD skills auto-render PNGs so the agent can "see and self-correct." — [andreahaku/openscad_claude_skill](https://github.com/andreahaku/openscad_claude_skill)
  - A CAD Agent skill uses VTK-rendered images as feedback for build123d. — [mcpmarket CAD Agent](https://mcpmarket.com/tools/skills/cad-agent)
  - Bonsai MCP ships a `visual-verify` prompt and per-storey plan screenshots. — [GitHub Show2Instruct/bonsai-mcp](https://github.com/Show2Instruct/bonsai-mcp)
  - ahujasid's MCP added a `look` tool for viewport and render checks. — [GitHub ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender)
  - rhinomcp has `capture_viewport`. — [GitHub jingcheng-chen/rhinomcp](https://github.com/jingcheng-chen/rhinomcp)
- **Practitioner reports on official connectors:** SketchUp dims are "close but not exact," doors are missing in an apartment layout, and dimensions get silently reset to round numbers on iteration (see Q2 sources). — [FOCUSED SketchUp](https://focusedsketchup.com/blog/can-claude-model-in-sketchup-i-tested-the-connector/); [MindStudio](https://www.mindstudio.ai/blog/claude-3-creative-app-mcp-connectors-blender-adobe-sketchup)
- **Skeptical vendor view:** "the commands might be technically correct, but there is no feedback loop" and "Claude can't interpret B-rep geometry." This comes from a competing CAD-AI vendor, so it is biased. — [Leo AI: Claude for CAD review](https://www.getleo.ai/blog/claude-for-cad-full-review-2026)
- **Safety and operational failure modes:**
  - Arbitrary code execution tools (`execute_blender_code`, `eval_ruby`, `execute_lisp`) run with no authentication on localhost sockets. — [GitHub ahujasid](https://github.com/ahujasid/mcp-for-blender); [sketchup-mcp2](https://pypi.org/project/sketchup-mcp2/); [puran-water](https://github.com/puran-water/autocad-mcp)
  - Long or complex requests time out, so break them into smaller steps. — [GitHub mhyrr/sketchup-mcp](https://github.com/mhyrr/sketchup-mcp)
  - Poly Haven downloads freeze the Blender UI. — [GitHub ahujasid](https://github.com/ahujasid/mcp-for-blender)

### Inferences
- Code execution is no longer the bottleneck for frontier Claude models: run failures are only a few percent on standard parts. The bottlenecks are **semantic and spatial correctness**: whether the right features exist, dimensions hold through iteration, and doors connect the rooms. A render-and-check loop (screenshots from several angles plus programmatic measurement) should be treated as mandatory, and architectural checks such as "every room has a door" and "stair rise/run within code" should be scripted as assertions rather than left to visual review.
- All the quantitative benchmarks are mechanical-part datasets. There is no evidence base for building-scale accuracy, so the end user should plan to verify dimensions, openings and code compliance manually.

### Gaps
- No academic benchmark of LLM architectural or BIM model generation (walls, roofs, stairs, IFC validity) was found. Show2Instruct mentions "IFC-CoPilot: A Tool-Based Framework for LLM-Driven IFC Building Design," but I could not retrieve its results. — [GitHub Show2Instruct/ifc-bonsai-mcp](https://github.com/Show2Instruct/ifc-bonsai-mcp)
- Exact Claude numbers from the Text2CAD-Bench and BenchCAD papers could not be verified (arXiv blocked).
- I found no practitioner reliability reports for the Fusion connector, RhinoAI or Zoo MCP specifically.

---

## Q5. Which tools can run fully headless in a Linux container (relevant for Claude Code on the web)?

### Takeaway
Fully headless and Linux-native: **CadQuery, build123d (and their MCPs), OpenSCAD, IfcOpenShell, ezdxf (DXF), three.js code generation, and the Zoo MCP**, though Zoo's geometry engine runs in Zoo's cloud. Cloud APIs reachable from Linux if the network allows: **Fusion Compute MCP, the Onshape REST and FeatureScript MCPs, and the Zoo API**. **Not headless:** the official Fusion desktop connector, Rhino/RhinoAI, AutoCAD File IPC and the SketchUp community MCPs. Blender and FreeCAD have headless modes, but their MCP servers expect a live GUI session.

### Cited Findings
- CadQuery was "built to be used as a Python library without any GUI." It installs via pip/conda. Its built-in visualization (trame/vtk) appears to need a display. — [GitHub CadQuery](https://github.com/CadQuery/cadquery)
- build123d installs with `pip install build123d` (Python 3.11–3.14). — [GitHub build123d](https://github.com/gumyr/build123d). The build123d-mcp dev container installs display packages for "headless rendering," and Codespaces is offered. — [GitHub pzfreo/build123d-mcp](https://github.com/pzfreo/build123d-mcp)
- IfcOpenShell has Linux x86-64/ARM64 wheels for Python 3.10–3.15. — [PyPI](https://pypi.org/project/ifcopenshell/). It is also distributed on Docker Hub, conda-forge and as Pyodide WASM. — [GitHub IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell)
- The AutoCAD MCP ezdxf backend runs on "any platform (Linux, macOS, WSL)" without AutoCAD and renders previews with matplotlib. File IPC is Windows-only. — [GitHub puran-water/autocad-mcp](https://github.com/puran-water/autocad-mcp)
- Zoo MCP has Linux binaries, and `ZOO_API_TOKEN` is for headless systems. — [GitHub KittyCAD/mcp](https://github.com/KittyCAD/mcp). Design Studio's geometry engine is hosted (a video stream). — [GitHub KittyCAD/modeling-app](https://github.com/KittyCAD/modeling-app)
- Fusion Compute MCP "allows your AI client to discover and invoke Autodesk Fusion headless in the cloud" (snippet). — [Autodesk Help](https://help.autodesk.com/view/ADSKMCP/ENU/?guid=ADSKMCP_FusionComputeMcp_connecting_to_the_fusion_compute_mcp_server_html)
- The Fusion desktop connector requires Fusion installed and running locally. — [Claude directory: Fusion](https://claude.com/marketplace/connectors/autodesk-fusion)
- The Onshape community MCP uses the REST API with API keys and needs no local CAD. — [GitHub hedless/onshape-mcp](https://github.com/hedless/onshape-mcp)
- The SketchUp connector runs in Trimble's cloud, and Claude Code use is undocumented. — [techdrawai](https://techdrawai.com/blog/connect-claude-to-sketchup); [Claude directory: SketchUp](https://claude.com/marketplace/connectors/sketchup)
- rhinomcp needs Rhino 8.20+ on Windows/macOS. — [GitHub jingcheng-chen/rhinomcp](https://github.com/jingcheng-chen/rhinomcp)
- `mcp-for-blender` supports Linux and Docker, but the add-on must run inside Blender. The README mentions "headless" only for injecting credentials via environment variables. — [GitHub ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender)
- Bonsai MCP needs a running Blender with its bridge on 127.0.0.1:9878; headless is not supported as described. — [GitHub Show2Instruct/bonsai-mcp](https://github.com/Show2Instruct/bonsai-mcp)
- FreeCAD MCP docs cover headless scripts, HTTP transport and Docker, but by default FreeCAD must be open with the RPC server running. — [GitHub neka-nat/freecad-mcp](https://github.com/neka-nat/freecad-mcp). FreeCAD's docs say a script file is the recommended headless approach, but "not all workbench modules are automatically available in headless mode." That matters for BIM/Arch (snippet). — [FreeCAD docs: Headless FreeCAD](https://reqrefusion.github.io/FreeCAD-Documentation-html/wiki/Headless_FreeCAD.html)

### Inferences
- For **Claude Code on the web**, the most dependable pattern is a pip-installed stack that needs no MCP server: Claude writes Python and runs it, then renders PNG previews for itself. A typical stack:
  - `ifcopenshell` for semantic IFC houses;
  - `build123d` or `cadquery` for precise solids and STEP;
  - `ezdxf` for 2D plans;
  - `trimesh`, `pyrender` or `matplotlib` for preview images (these renderers are general knowledge, not verified this session).
  - Outputs can be glTF for a three.js viewer page.
- Blender's background mode (`blender -b --python script.py`) should allow headless bpy and Bonsai scripting in a container. This is widely documented, but **not verified in this session** because blender.org was unreachable. It bypasses the MCP servers, which all assume a GUI session.
- Cloud MCPs (Fusion Compute, Zoo, Onshape) need the container's network allowlist to include their API hosts plus OAuth or API-key credentials, and they carry licence costs.

### Gaps
- No source confirmed whether the Blender Lab official MCP or `mcp-for-blender` works with `blender --background`.
- No source confirmed whether FreeCAD 1.1's BIM/Arch modules import cleanly under FreeCADCmd on Linux.
- I could not search for three.js-based procedural architecture tools or headless three.js rendering (search budget exhausted).
- Whether remote claude.ai connectors (SketchUp) can be used from Claude Code on the web sessions was not documented in any source found.
