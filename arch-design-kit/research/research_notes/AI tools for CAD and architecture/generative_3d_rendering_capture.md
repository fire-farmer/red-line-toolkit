# AI Generative 3D, AI Architectural Rendering, and Reality Capture: Fit with Claude as Design Partner (as of Nov 2026)

## Q1a. Text/image-to-3D generators: what they produce, formats, APIs, pricing, MCP servers

### Takeaway
Every current text- or image-to-3D generator (Meshy, Tripo, Hyper3D Rodin, Hunyuan3D, TRELLIS.2, Stability SPAR3D/SF3D, Autodesk Wonder 3D) outputs **textured polygon meshes** (GLB/FBX/OBJ/USDZ/STL), not dimensioned or parametric CAD. That makes them suitable for furniture, fixtures, entourage, sculptural objects and concept massing props, but not for buildable architecture. For orchestration by Claude, the strongest options are Meshy (official MCP server and a full REST API with remesh, quad topology and a real-world-height parameter), Hyper3D Rodin (bounding-box size conditioning, quad mode, sold by many API resellers, built into Blender MCP), and Tripo (official alpha MCP via its Blender add-on). Open-weight options (TRELLIS.2 under MIT, Hunyuan3D 2.1) need a 24 GB-class GPU, and Hunyuan's license excludes the EU, UK and South Korea.

### Cited Findings

**Meshy (commercial SaaS + API; official MCP)**
- The API bills in prepaid credits. Text-to-3D Preview costs 20 credits on Meshy-6 or Meshy 7.1, or 5 credits on meshy-6-lite/meshy-t2/t2.5. Refine (texturing) costs 10 credits at 2K/4K textures and 15 at 8K. Preview and Refine are billed separately, and API access requires the Pro tier or higher — [Meshy API pricing](https://docs.meshy.ai/api/pricing)
- `meshy-7` retires Dec 31, 2026 as the model for Text-to-3D preview, Image-to-3D and Multi-Image-to-3D. The web-app docs and an older homepage table give different credit costs from the API docs, so the published figures conflict — [Meshy API pricing](https://docs.meshy.ai/api/pricing); [Meshy changelog](https://docs.meshy.ai/api/changelog)
- The Remesh API exports glb, fbx, obj, usdz, blend and stl (the Japanese docs add 3mf). It offers quad or triangle topology, a target polycount (examples use 30k–50k), and real-world sizing via `resize_height`, `origin_at` ("bottom") and `auto_size`. The `lowpoly` model retired Oct 30, 2026 and meshy-5 on Oct 10, 2026 — [Meshy Remesh API](https://docs.meshy.ai/en/api/remesh); [JA docs](https://docs.meshy.ai/ja/api/remesh); [ZH docs](https://docs.meshy.ai/zh/api/remesh)
- The official MCP server is `@meshy-ai/meshy-mcp-server`, maintained by Meshy. It installs with `claude mcp add -s user meshy --env MESHY_API_KEY=... -- npx -y @meshy-ai/meshy-mcp-server` and can create, download and 3D-print models, textures, rigs and animations — [meshy-dev/meshy-mcp-server](https://github.com/meshy-dev/meshy-mcp-server); [Meshy AI integration docs](https://docs.meshy.ai/api/ai)
- Composio also offers a Meshy connector for Claude Cowork — [Composio](https://composio.dev/toolkits/meshy/framework/claude-cowork.md)
- Licensing: Free-plan outputs are CC BY 4.0 (commercial use allowed with attribution). Pro and higher plans get a private license with full commercial use. Rights follow the plan that was active when the model was generated — [Meshy pricing docs](https://docs.meshy.ai/pricing); [Meshy ownership FAQ](https://help.meshy.ai/en/articles/10137554-what-is-the-ownership-of-the-generated-models)

**Tripo (VAST; Tripo 3.x / H3.1)**
- Credits cost about $0.01 each ($1 per 100 credits), and overage on AWS Marketplace is $0.01 per credit — [AWS Marketplace listing](https://aws.amazon.com/marketplace/pp/prodview-hwlbvx7vubh7c); [WaveSpeed review](https://wavespeed.ai/blog/3d-model-access/tripo-ai-review/)
- Tripo's own H3.1 docs list Quad mesh at +5 credits and Smart low-poly at +10 credits — [Tripo developer docs v3.1](https://developers.tripo3d.com/en/models/v3-1)
- A reseller lists Image-to-3D (3.0/3.1/3.2) at 40 credits and text-to-3D at 20, with other surcharges. Reseller and official figures conflict — [3D AI Studio Tripo docs](https://www.3daistudio.com/Platform/API/Documentation/3d-generation/tripo)
- Per-call reseller prices: tripo3d v2.5 image-to-3D $0.30 and h3.1 $0.20 — [WaveSpeed Tripo collection](https://wavespeed.ai/collections/tripo3d)
- Conversion formats are GLTF, USDZ, FBX, OBJ, STL and 3MF. Quad output cannot be exported to 3MF, and turning quad on exports FBX instead of the default GLB — [3D AI Studio Tripo remesh docs](https://www.3daistudio.com/Platform/API/Documentation/remeshing/tripo); [Atlas Cloud Tripo](https://www.atlascloud.ai/models/Tripo)
- The official MCP server, `VAST-AI-Research/tripo-mcp`, is in **alpha**. It works only through the Tripo Blender Addon, needs Python 3.10+, Blender, and Claude Desktop or Cursor, and runs via `uvx tripo-mcp` — [tripo-mcp GitHub](https://github.com/VAST-AI-Research/tripo-mcp)
- Free-tier outputs are reportedly CC BY 4.0. Pro, Max and Team plans allow commercial use without attribution. This comes from vendor blog posts; I did not see Tripo's ToS — [Tripo blog](https://www.tripo3d.ai/blog/commercial-use-ai-3d-models)
- A competitor-run "arena" ranked Tripo v3.1 first at 1042 ELO (Aug 3, 2026). This is vendor marketing and unverified — [Sloyd rankings](https://www.sloyd.ai/blog/ai-3d-model-generator-rankings)

**Hyper3D Rodin (Deemos; Gen-2, Gen-2.5)**
- Runware sells Gen-2 from $0.40 per generation, or $1.20 with the HighPack add-on. Quad is the default mesh mode, with face count about 16× the quality setting — [Runware Rodin Gen-2](https://runware.ai/docs/models/hyper3d-rodin-gen-2); [schema](https://runware.ai/docs/models/hyper3d-rodin-gen-2/schema.json)
- fal.ai lists Rodin v2 at $0.40 per generation, and Gen-2.5 Fast at $0.40 with HighPack adding $0.80. EmpirioLabs lists Gen-2 at $0.80 per request — [fal Rodin v2](https://fal.ai/models/fal-ai/hyper3d/rodin/v2/api); [fal Rodin v2.5 fast](https://fal.ai/models/fal-ai/hyper3d/rodin/v2.5/fast/llms.txt); [EmpirioLabs](https://empiriolabs.ai/models/hyper3d-gen2)
- Outputs are GLB (default), FBX, OBJ, USDZ and STL. `boundingBox` sets maximum model dimensions, given as [Y, Z, X] on Runware. fal documents the axis order differently ([width, height, length]), so check it empirically — [Runware Rodin Gen-2](https://runware.ai/docs/models/hyper3d-rodin-gen-2); [fal Rodin v2](https://fal.ai/models/fal-ai/hyper3d/rodin/v2/api)
- The ComfyUI Rodin Gen-2.5 node takes a bounding box (width/height/length) of 1–1000 "world units" — [Comfy Rodin3D_Gen25 node](https://docs.comfy.org/built-in-nodes/Rodin3D_Gen25_Text.md)
- Deemos maintains a Blender MCP Rodin integration repo — [DeemosTech/blender-mcp-rodin-integration](https://github.com/DeemosTech/blender-mcp-rodin-integration)
- 80.lv coverage presents Gen-2.5 as bringing "production-level control" — [80.lv](https://80.lv/articles/how-hyper3d-rodin-gen-2-5-is-bringing-production-level-control-to-ai-3d-generation)

**Tencent Hunyuan3D (2.1 open weights; 3.0 hosted)**
- Hunyuan3D 2.1, released June 13, 2025, is billed as the "first production-ready" open model. It has a PBR texture pipeline, 3.3B (shape) + 2B (texture) parameters, and needs about 10 GB VRAM for shape, 21 GB for texture, or 29 GB for both. It runs on Win/macOS/Linux, ships a Gradio app and an API server, and has community ComfyUI nodes — [Hunyuan3D-2.1 GitHub](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1)
- License: the territory is worldwide **excluding the EU, UK and South Korea**. Products with more than 1M MAU need a separate license, and the HF card gates EU access — [HF README](https://www.huggingface.co/tencent/Hunyuan3D-2.1/blob/main/README.md); [license mirror](https://gitserver.onethingai.com/ai-models/Hunyuan3D-2.1/raw/branch/main/LICENSE)
- Hunyuan3D 3.0 launched in September 2025 as a hosted engine with free access and a Tencent Cloud API. A "Smart Topology" feature outputs tri or quad faces. I found no evidence that the 3.0 weights are open — [Tencent](https://www.tencent.com/en-us/articles/2202235.html); [Pandaily](https://pandaily.com/tencent-unveils-hunyuan-3d-3-0-ai-model-tripling-modeling-accuracy-with-free-access)
- Hunyuan3D-Omni (2025, built on 2.1) accepts point clouds, voxels, **bounding boxes** and skeletons as conditioning for geometry and pose control — [arXiv 2509.21245](https://arxiv.org/html/2509.21245v1)
- Blender MCP supports Hunyuan3D through Tencent Cloud credentials or a self-hosted local API — [blender-mcp GitHub](https://github.com/ahujasid/blender-mcp)

**Microsoft TRELLIS.2 (open, MIT)**
- TRELLIS.2 is a 4B-parameter image-to-3D model under the MIT license. It outputs GLB with PBR maps (base color, roughness, metallic, opacity) at 512³–1536³ voxel resolution. Generation takes about 3 s at 512³, 17 s at 1024³ and 60 s at 1536³ on an H100. It requires a 24 GB+ NVIDIA GPU, is Linux-tested only, and supports no text-to-3D. Its O-Voxel representation handles open, non-manifold and internal surfaces — [microsoft/TRELLIS.2](https://github.com/microsoft/TRELLIS.2); [HF card](https://huggingface.co/microsoft/trellis.2-4b); [project page](https://microsoft.github.io/TRELLIS.2)

**Stability AI SPAR3D / Stable Fast 3D**
- SPAR3D was released in January 2025 and builds on SF3D, adding a point-cloud stage that improves the backs of objects and allows editing. Both models are under the Stability Community License, which is free for commercial use below $1M annual revenue — [Stability SPAR3D](https://stability.ai/news/stable-point-aware-3d); [Stability license](https://stability.ai/license)
- SF3D (Aug 2024; **older than 2025, possibly outdated**) produces a single-image UV-unwrapped textured mesh and is built on TripoSR — [Stability SF3D](https://stability.ai/news/introducing-stable-fast-3d)

**Autodesk Wonder 3D / Project Bernini**
- Wonder 3D, a text/image-to-3D model inside **Autodesk Flow Studio** (formerly Wonder Studio, a cloud VFX/CG toolset), launched in March 2026 for all subscription tiers. Flow Studio uses credits and has a free tier — [Autodesk M&E blog, 2026-03-04](https://blogs.autodesk.com/media-and-entertainment/2026/03/04/introducing-wonder-3d-text-and-image-to-3d-in-flow-studio/); [Autodesk News](https://adsknews.autodesk.com/en/news/autodesk-flow-studio-launches-wonder-3d-gen-ai-model-to-help-creators-make-3d-characters-and-objects-faster-and-easier/); [Flow Studio](https://autodesk.com/products/flow-studio/overview)
- Project Bernini (May 2024; **older than 2025**) was an Autodesk Research proof of concept that generated 3D shapes from text, images, sketches, voxels and point clouds, trained on about 10M 3D objects. I found no 2025–2026 status update — [Architosh](https://architosh.com/2024/05/autodesk-unveils-research-project-bernini-for-ai-3d-shape-creation/); [Engineering.com](https://www.engineering.com/autodesks-project-bernini-proves-generative-cad-is-coming/); [Axios](https://www.axios.com/2024/05/08/autodesk-ai-3d-models-bernini)

**Luma Genie: DISCONTINUED**
- Genie was sunset on Jan 1, 2026, and content export still works. The Luma 3D Capture iOS app remains at v1.3.14 (Jan 2026) but is no longer on Google Play. Luma Flythroughs also shut down on Jan 1, 2026 — [App Store listing](https://apps.apple.com/app/id1615849914); [RadianceFields](https://radiancefields.com/luma-ai); [RadianceFields Flythroughs](https://radiancefields.com/luma-ai-to-sunset-flythroughs-on-january-1-2026)

**CSM.ai / Kaedim**
- Common Sense Machines (CSM) was reportedly acquired by Google on Jan 24, 2026 for Gemini 3D. This is **single-source from an aggregator; unverified** — [AI Market Watch](https://www.ai-market-watch.com/company/common-sense-machines)
- Kaedim's last funding was a $15M Series A on Mar 11, 2024. It appears active with no reported pivot — [CB Insights](https://www.cbinsights.com/company/kaedim); [parsers.vc](https://parsers.vc/startup/kaedim3d.com/)

**NVIDIA**
- Edify 3D generates editable meshes from text/image structured as USD, importable into Omniverse USD Composer. Edify SimReady auto-labels physics/material attributes. Both are from Jan 2025 coverage — [Digital Engineering 24/7](https://www.digitalengineering247.com/article/ces-2025-nvidia-add-generative-physical-ai-to-omniverse/news)
- NVIDIA's 2026 focus is Cosmos 3, an open physical-AI omni-model (64B/16B/4B) under the OpenMDW license, plus Omniverse blueprints. These are robotics/AV simulation models, not architectural asset generators — [Digital Engineering 24/7](https://www.digitalengineering247.com/article/nvidia-expands-omniverse-with-generative-physical-ai); [NVIDIA GTC 2026 blog](https://blogs.nvidia.com/blog/gtc-2026-virtual-worlds-physical-ai/)

**Other notable models and "world" generators**
- ByteDance Seed3D 1.0 (late 2025) generates simulation-ready assets from a single image via Volcano Engine — [arXiv 2510.19944](https://arxiv.org/html/2510.19944v1)
- A vendor catalog dated October 2026 marks the original Sparc3D and 2.0 variants as deprecated — [Scenario model comparison](https://help.scenario.com/en/articles/comparing-generative-3d-models/)
- **World Labs Marble** turns text or images into whole explorable 3D worlds. Splats export as SPZ (native) or PLY in about 2M- and 500K-splat versions. Meshes export as GLB: a collider mesh, plus a high-quality textured mesh of about 100–200 MB. The docs say the splat is the highest-fidelity output. GLB export and commercial rights require the Pro plan — [Marble splat export](https://docs.worldlabs.ai/marble/export/gaussian-splat.md); [Marble mesh export](https://docs.worldlabs.ai/marble/export/mesh.md); [specs](https://docs.worldlabs.ai/marble/export/specs)
- A November 2026 secondary report describes a World Labs API with a splats-to-mesh endpoint that returns GLB — [VR.org](https://vr.org/articles/world-labs-atlas-six-api-endpoints-splats-to-mesh-open-access-2026)
- A third-party guide recommends Marble 1.1 for interiors and arch-viz walkthroughs built from a room description or a single photo — [Scenario Marble guide](https://help.scenario.com/articles/4774055514-marble-by-world-labs-the-essentials)

**Blender MCP (the main open orchestration hub)**
- `ahujasid/blender-mcp`, now packaged as `mcp-for-blender`, has about 35.3k stars. It exposes 9 tools, including `execute_blender_code`, `look` (viewport/camera/multi-angle/render views), `get_scene_info`, `generate_3d`, `generate_gaussian_world`, `search_assets` and `import_asset`. It integrates Poly Haven (CC0 HDRIs, textures, models; no key), Sketchfab (key), Poly Pizza, Meshy, Tripo, Hyper3D Rodin and Hunyuan3D (own key or paid "Premium"), and World Labs (Blender 5.3+). The socket has no authentication, and arbitrary Python execution is possible. Minimal anonymous telemetry is on by default — [blender-mcp GitHub](https://github.com/ahujasid/blender-mcp)

**Benchmarks**
- 3D Arena, a Hugging Face Space, is an open pairwise-preference leaderboard for image-to-3D with about 123k votes (paper June 2025). I could not retrieve its current standings — [arXiv 2506.18787](https://arxiv.org/html/2506.18787)
- An editorial (non-vote) ranking dated 2026-03-28 put Hunyuan3D-2.5 first, TRELLIS second and Meshy 5 third — [Pixazo leaderboard](https://www.pixazo.ai/leaderboard/ai-3d-model-generation)
- Tencent published a 2026 benchmark, HY3D-Bench — [arXiv 2602.03907](https://arxiv.org/html/2602.03907v1)

### Inferences
- **Quick reference (synthesized from the findings above):**

| Tool | Output | Formats | Scale control | API | MCP | Commercial notes |
|---|---|---|---|---|---|---|
| Meshy | Textured mesh, quad remesh | glb, fbx, obj, usdz, blend, stl, 3mf | `resize_height`, `origin_at` | Yes (credits, Pro+) | Official | Free = CC BY |
| Tripo 3.x | Textured mesh, quad/smart low-poly | glb/gltf, fbx, obj, usdz, stl, 3mf | None found | Yes (~$0.01/credit) | Official alpha (via Blender) | Free = CC BY |
| Rodin Gen-2/2.5 | Textured mesh, quad default | glb, fbx, obj, usdz, stl | Bounding box | Yes (≈$0.40–1.20/gen via resellers) | In Blender MCP | Check Hyper3D ToS |
| Hunyuan3D 2.1 / 3.0 | Textured PBR mesh | Mesh (format not stated in repo) | Omni: bbox conditioning | Tencent Cloud (3.0) / self-host (2.1) | In Blender MCP | No EU/UK/KR; >1M MAU needs license |
| TRELLIS.2 | PBR mesh up to 1536³ | glb | None | Self-host only | None official | MIT |
| SPAR3D / SF3D | Single-object mesh | glb | None | Stability API / self-host | None | <$1M revenue free |
| Wonder 3D | Mesh in Flow Studio | Not verified | Not verified | Not verified | None | Autodesk credits |
| World Labs Marble | Splat world + GLB mesh | spz, ply, glb | Not verified | Yes (2026) | In Blender MCP | Pro for export/commercial |

- None of these produce dimensioned, editable B-rep/NURBS/IFC geometry. Outputs are scaled-to-fit meshes, so Claude should treat them as **props and placeholders**, never as the source of truth for building geometry. Only Meshy's `resize_height` and Rodin's / Hunyuan-Omni's bounding boxes give Claude a direct way to enforce real dimensions on generated objects (for example, a 900 mm high console).
- For a Claude-centric stack, the lowest-friction path is the Meshy MCP for a standalone asset, or Blender MCP for scene assembly with Rodin/Hunyuan/Poly Haven. The Tripo MCP is alpha and Blender-dependent.
- Licensing is a real gate for client work: free tiers (Meshy, Tripo) put outputs under public CC BY, and Hunyuan cannot be used for EU/UK/KR projects.

### Gaps
- WebFetch could not reach many vendor domains in this session (docs.meshy.ai, 3daistudio.com, digitalproduction.com and others were outside the allowed network). Figures for those vendors come from search-engine extracts of official pages, not from full-page reads.
- I found no official Hyper3D (developer.hyper3d.ai) or Tripo (tripo3d.ai/pricing) price list. Reseller prices conflict.
- No current 3D Arena standings were found, and no independent 2026 benchmark specific to architectural objects (furniture, facades) exists in what I found.
- Autodesk Wonder 3D's output formats, API and topology are unverified, and Bernini's current status is unknown.
- I found no information on Kaedim's 2026 product or pricing, or on Hunyuan3D 3.x Tencent Cloud API pricing.
- The Google acquisition of CSM is unverified.

## Q1b. AI architectural rendering and sketch-to-render tools: what they produce, APIs, pricing

### Takeaway
The market has split into two families. **Geometry-bound renderers** take a real 3D model or viewport as input: Chaos Veras (now inside every Enscape, V-Ray and Corona via Chaos Credits, with Nano Banana Pro under the hood since Veras 4.0), D5 Render 3.0's AI Agent, Lumion's AI upscalers, and Enscape's AI Enhancer. **Free-floating image generators** include web sketch-to-render tools (mnml.ai, LookX, ArchiVinci, Rendair, PromeAI), Midjourney V8, Krea, and open ComfyUI/FLUX with depth/canny ControlNet. None of the desktop renderers exposes a public generative API that Claude can call. Claude's programmatic routes are ComfyUI (self-hosted or Comfy partner nodes), model APIs (fal/Replicate/Krea), and image MCP servers.

### Cited Findings

**Chaos Veras / Enscape / V-Ray / Corona**
- Veras 3.0 (Autodesk University, Sept 2025) added image-to-video for AEC (short pans and zooms). It is sold standalone and in Enscape Premium and the ArchDesign Collection — [Chaos press](https://www.chaos.com/press/chaos-unveils-several-new-ai-tools-led-by-veras-30-with-image-to-video-generator-for-aec)
- Veras 4.0 (Feb 10, 2026) has a new rendering engine powered by Google's **Nano Banana Pro** — [Chaos press](https://www.chaos.com/press/chaos-veras-40-now-powered-by-nano-banana); [Architosh](https://architosh.com/2026/02/chaos-releases-veras-4-0-with-nano-banana-pro/); [AEC Magazine](https://aecmag.com/news/chaos-veras-4-0-powered-by-nano-banana/)
- Google's Veo 3.1 video model is part of Veras — [Chaos AI visualization](https://www.chaos.com/ai-visualization)
- Since May 27, 2026, Veras is integrated into every version of Enscape, V-Ray and Corona, billed through **Chaos Credits**. The same credit pool covers Veras, AI Upscaler, AI Enhancer and cloud rendering. Enscape 4.22 moved Veras inside the Enscape UI — [Chaos press](https://www.chaos.com/press/veras-ai-architecture-enscape-vray-corona); [Architosh](https://architosh.com/2026/05/enscape-v-ray-and-corona-get-veras-ai-integration/); [AEC Magazine](https://aecmag.com/visualisation/veras-included-with-enscape-v-ray-corona/)
- Credit costs vary by feature and output size, and monthly credits do not roll over — [Chaos Veras Boost](https://www.chaos.com/veras/boost); [Chaos Credits](https://www.chaos.com/credits)
- Plan pricing on Chaos pages conflicts. The search extract showed a "Pro" tier with 2,000 credits/month at a garbled price ("$2,900/month", likely a parsing error) and an "Ultra" tier with 6,000 credits — [Chaos Veras](https://www.chaos.com/veras); [Chaos Veras FR](https://www.chaos.com/fr/veras)
- With the Nano Banana engine, the former geometry/material overrides became **localized** and can vary across the image. Chaos markets controls for how closely the output follows the underlying geometry and composition — [EvolveLab forum](https://forum.evolvelab.io/t/veras-release-4-0-nano-banana/11184); [NTI](https://www.nti-group.com/ie/products/other-products/chaos/veras/)
- The Chaos AI Enhancer (since Enscape 4.1, 2024) improves people and vegetation assets in renders, caps output at 2048×2048, and needs a non-trial license. The preview release produced artifacts. A 2026 update added adjustment options for people, vegetation and seasonal context — [Enscape blog](https://blog.enscape3d.com/introducing-chaos-ai-enhancer); [AEC Magazine](https://aecmag.com/news/enscape-4-1-launches-with-chaos-ai-enhancer/); [Chaos Enscape latest](https://www.chaos.com/enscape/latest-version)

**D5 Render 3.0 (Feb 2026)**
- The AI Agent offers "AI Scene Match" (describe a mood, the agent generates reference images, then matches lighting and post-processing in one click), "AI Asset Recommendation" from a text or image prompt, and intent-to-scene edits in natural language. Version 2.11 (July 2025) introduced SmartPlanting, which proposes climate-adaptive landscapes from site location and design intent — [Architosh](https://architosh.com/2026/02/d5-version-3-released-new-ai-workflows/); [D5 3.0 post](https://www.d5render.com/posts/d5-render-3-0-ai-rendering-design-workflow); [D5 AI Agent docs](https://docs.d5render.com/user-guide/ai/ai-agent); [CG Channel](https://www.cgchannel.com/2025/07/dimension-5-releases-d5-render-11/)
- D5 has 15+ AI features. Free accounts get limited credits, and unlimited D5 AI comes with D5 Pro/Teams — [Informed Infrastructure](https://informedinfrastructure.com/post/d5-introduces-an-ai-powered-end-to-end-workflow-for-3d-design)

**Lumion**
- The Lumion Pro 2026 AI upscaler gives better 2× accuracy using depth and normal maps, plus a new 4× option up to 16K (15,360×8,640). It runs locally — [Lumion Pro 2026 guide](https://lumion.com/tips-guides/lumion-pro-2026-guide); [Studica](https://www.studica.com/blog/lumion-pro-2026-3d-rendering-software/)
- The Lumion Cloud AI Upscaler (Jan 20, 2026) offers 2×/4×/8× up to 96 MP — [Lumion news](https://lumion.com/news/ai-upscaler-now-live-in-lumion-cloud); [Lumion support](https://support.lumion.com/hc/en-us/articles/19738054247580)

**Twinmotion (Epic)**
- The 2026.1 release (April 2026) focused on photo matching, edge softening, lens effects and particle VFX, with no confirmed AI features. "AI Image Styles" and "AI Enhance" remain on the roadmap, and users report no availability after 2026.1 HF2 — [Twinmotion 2026.1 release notes](https://dev.epicgames.com/documentation/en-us/twinmotion/twinmotion-2026-1-release-notes); [Unreal forum](https://forums.unrealengine.com/t/ai-image-styles-ai-enhance-any-update-on-availability-after-2026-1-hf2/2728213); [CG Channel](https://www.cgchannel.com/?p=175368)

**Web sketch/photo-to-render tools (mnml.ai, LookX, ArchiVinci, Rendair, PromeAI)**
- In listicle reviews, mnml.ai ranks as "most complete" with 12+ tools, paid plans from about $19/mo, and a "steeper learning curve". LookX is "best for concepts/sketches" but has a "fragmented layout". ArchiVinci (German, founded 2024) offers Exterior/Interior render, Furnish/Modify room, Style Match and "Exact Render", with model choice and a cumbersome long form. Rendair offers sketch/photo/text-to-render and "requires prompt skill". These are mostly affiliate-style roundups — [Windows Report](https://windowsreport.com/best-architecture-ai-rendering-platform/); [MSPowerUser](https://mspoweruser.com/best-architecture-ai-rendering-platform); [Hashnode review](https://hashnode-hub.vercel.app/posts/688c7c9a7a530af42b147317); [SourceForge ArchiVinci vs LookX](https://www.sourceforge.net/software/compare/ArchiVinci-vs-LookX-AI); [mnml vs Rendair (vendor)](https://mnml.ai/ai-tools/rendair-ai-alternative); [Rendair blog (vendor)](https://rendair.ai/blog/tools-top-5-promeai-alternatives-for-architects-designers)

**Midjourney / Krea / general image models**
- Midjourney V8 (alpha, then V8.1/8.2 per resellers) is reported strong at architectural imagery, with improved "objects that require accurate geometry (… architecture)". Midjourney has **no official public API**, and third-party resellers say they are unofficial — [MindStudio](https://www.mindstudio.ai/blog/what-is-midjourney-v8-alpha-strengths-weaknesses); [WaveSpeed](https://wavespeed.ai/blog/posts/what-is-midjourney-v8-features-pricing-how-to-use-2026); [Atlas Cloud MJ v8.1](https://www.atlascloud.ai/models/midjourney/v8.1/image-to-image)
- Krea offers one REST API for 40+ image and video models (including the Krea 2 family), billed separately from app plans. Krea publishes an arch-render guide — [Krea API](https://krea.ai/features/api); [Krea blog](https://www.krea.ai/blog/best-ai-photorealistic-architectural-renders)

**Stable Diffusion / FLUX + ControlNet (open, scriptable)**
- Black Forest Labs offers FLUX.1-Depth-dev and Canny-dev (plus LoRA versions). ComfyUI uses controlnet-aux preprocessors to generate depth and lineart conditioning. Comfy's docs say Depth + Lineart "maintains spatial relationships while reinforcing outlines, suitable for architecture". There is a community FLUX depth ControlNet (Jasper) with a ComfyUI workflow, and a Comfy interior-design use-case template — [Comfy FLUX ControlNet](https://docs.comfy.org/tutorials/flux/flux-1-controlnet); [Comfy depth ControlNet](https://docs.comfy.org/tutorials/controlnet/depth-controlnet); [Jasper FLUX depth](https://huggingface.co/jasperai/Flux.1-dev-Controlnet-Depth); [Comfy AI interior design](https://comfy.org/workflows/use-cases/ai-interior-design/)
- ComfyUI also has partner nodes for Meshy (remesh) and Rodin Gen-2.5, so one Comfy graph can chain image generation and 3D — [Comfy Meshy remesh](https://docs.comfy.org/development/comfy-router/models/meshy/remesh/code.md); [Comfy Rodin node](https://docs.comfy.org/built-in-nodes/Rodin3D_Gen25_Text.md)

### Inferences
- Chaos's switch to Nano Banana Pro means "the AI renderer inside Enscape" is now essentially a frontier general image model conditioned on the viewport. Fidelity gains come with the localized-override drift that EvolveLab users describe.
- Claude cannot drive Veras, D5, Lumion or Twinmotion directly: none has a public generation API in what I found. Claude's role there is to **write the prompt, style settings and view list** for a human to paste, or to prepare the model (via Blender MCP or other CAD connectors) that the renderer consumes. Automated loops are realistic only with ComfyUI (local or hosted), fal/Replicate/Krea APIs, or image MCP servers.
- Web tools (mnml, LookX, ArchiVinci) are interchangeable for quick sketch-to-render. Choosing among them matters less than the input discipline (clean linework or depth) and prompt specificity.

### Gaps
- I found no public API for mnml.ai, LookX, ArchiVinci, Rendair or PromeAI, and their current pricing is not verified beyond mnml's "from $19/mo".
- I could not read Veras/Chaos Credits pricing accurately (conflicting, garbled values), and the per-image credit cost is unverified.
- No independent quantitative test of geometry adherence for any AI renderer turned up. Vendor claims, such as Snaptrude's "95%+ of your geometry", are unverified.
- "Enscape Impressions" could not be found. Enscape's AI design-exploration feature is known only from an AEC Magazine headline ([AEC Magazine](https://aecmag.com/visualisation/chaos-brings-ai-design-exploration-into-enscape/)).

## Q1c. Reality capture, scanning and scan-to-BIM for existing conditions

### Takeaway
Phone LiDAR and photogrammetry apps (Apple RoomPlan-based apps, Polycam, Scaniverse, KIRI) are good for sketch-grade existing conditions and context capture. Professional dimensions still need laser or E57 workflows (Matterport E57, terrestrial scanners) and scan-to-BIM tools that remain largely semi-automated. Gaussian splats have become a mainstream deliverable (SketchUp Labs, Polycam, Marble) but are visual, not metric: measured accuracy against survey methods is still a research topic. No consumer capture app found has a public API, so Claude's role is to consume exports (USDZ/OBJ/PLY/E57/DXF), not to drive the capture.

### Cited Findings
- Apple **RoomPlan** is a Swift API that uses the LiDAR Scanner and camera on iPhone/iPad to create a 3D floor plan with dimensions and furniture types. Its USDZ export is **one-way**: there is no API to load USDZ back into RoomPlan types. Apple's guidance targets single rooms up to about 30×30 ft — [Apple RoomPlan](https://developer.apple.com/augmented-reality/roomplan); [Apple dev forum](https://developer.apple.com/forums/thread/831648)
- Third-party RoomPlan/LiDAR apps export DXF. For example, Lagarsoft LiDAR Scanner exports DXF R12, USDZ and paint reports (vendor claim) — [App Store: Lagarsoft](https://apps.apple.com/us/app/lagarsoft-lidar-scanner/id6779339424)
- **Polycam** exports 15+ formats, including PLY, OBJ, FBX, DAE, STL and LAS point clouds. **E57 is explicitly not supported** (nor STEP or 3DS). Gaussian splats export as PLY (render) and GLTF (collision). Floor plans come from Space Mode, with team and floor-plan workflows pointed to the Business tier. An API directory says there is **no public REST API** — [Polycam export formats](https://learn.poly.cam/hc/en-us/articles/27756102599572); [Polycam splats to UE](https://learn.poly.cam/hc/en-us/articles/42506758152084-Export-Gaussian-Splats-from-Polycam-to-Unreal-Engine); [Polycam Basic plan](https://poly.cam/de-de/basic-plan); [thefuture3d](https://www.thefuture3d.com/software/polycam); [API Evangelist](https://providers.apievangelist.com/providers/polycam/)
- **Matterport** sells an E57 add-on (vendor-neutral ASTM E2807 format), and a high-density capture mode improves thin elements such as pipes and wiring. An **Import API (beta, Feb 2026)** lets Enterprise customers create Matterport models from E57 files programmatically; it requires the Developer Tools license. The Property Intelligence API objects have been out of beta since July 2024 — [Matterport E57 add-on](https://matterport.com/add-ons/e57); [Matterport API changelog](https://matterport.github.io/developer-docs/api-changelog/); [Import API guide](https://matterport.github.io/developer-docs/api/import/guide/)
- **Luma 3D Capture** remains on iOS (v1.3.14, Jan 2026) but is reportedly no longer actively developed, after Genie and Flythroughs were sunset — [App Store](https://apps.apple.com/app/id1615849914); [RadianceFields](https://radiancefields.com/luma-ai)
- **SketchUp Gaussian Splats** graduated to a public SketchUp Labs feature (Windows only). It is free for Pro, Pro Scan, Pro Advanced Workflows and Studio subscribers while in Labs. It views and manipulates .ply/.splat/.spz files, which must be generated elsewhere (Scaniverse, DJI Terra); Scaniverse and KIRI need paid plans for splat export. Making a surface mesh means exporting PLY into Scan Essentials, and a native terrain/surface mesh from splats is "not in the short term" — [SketchUp forum](https://forums.sketchup.com/t/gaussian-splats-have-arrived-in-sketchup-labs/347799); [SketchUp help](https://help.sketchup.com/gaussian-splats-extension); [SketchUp generating splats](https://help.sketchup.com/es/generating-gaussian-splats)
- An informal comparison of Luma, Polycam, Teleport, KIRI and Postshot rated Postshot best in quality (free, local, you own the data) and KIRI best for quality versus file size. It found Polycam and Luma "do not produce scans at the right scale" — [Kamil Maziarka, LinkedIn](https://pl.linkedin.com/in/kamilmaziarka)
- A 2026 guide reports that Postshot's free version no longer exports PLY as of a March 2026 update — [HKU 3D-scan bookstack](https://bookstack.hku.nl/books/3d-scan/page/gaussian-splatting-online-and-local/revisions/3094)
- 2026 ISPRS papers test Postshot splatting against SfM and for capturing heritage cracks, and report the MILo meshing method as promising. This shows that metric use of splats is still being validated — [ISPRS XLIX-B2-2026](https://isprs-archives.copernicus.org/articles/XLIX-B2-2026/1355/2026/isprs-archives-XLIX-B2-2026-1355-2026.pdf); [ISPRS XLVIII-2-W12-2026](https://isprs-archives.copernicus.org/articles/XLVIII-2-W12-2026/183/2026/isprs-archives-XLVIII-2-W12-2026-183-2026.pdf)
- **Scan-to-BIM:** A Matterport 2026 guide says Autodesk ReCap Pro processes scans but **does not create BIM elements itself**, and cites EdgeWise as an AI tool that extracts elements into Revit-native models. Siemens offers point-cloud-to-Revit conversion "with AI, or manually". A LinkedIn post claims ReCap Pro 2026 uses the PointFuse acquisition to auto-classify, mesh and place geometry in Revit via a plugin (unverified) — [Matterport scan-to-BIM guide](https://matterport.com/blog/best-scan-to-bim-software); [Siemens](https://www.siemens.com/en-gb/products/bim-facility-point-clouds-to-3d-models); [LinkedIn post](https://kr.linkedin.com/in/jungho-ryan-lee-19649969)
- Research such as BIMStruct3D (2026) generates IFC (walls, doors, columns) from point clouds — [arXiv 2604.24311](https://arxiv.org/html/2604.24311v1)

### Inferences
- For a small residential or interiors practice working with Claude, a practical existing-conditions stack is: a RoomPlan-based app (USDZ plus DXF) for quick room shells, then tape or laser verification of critical dimensions, then Claude reading the DXF/USDZ dimensions into its design spec. Matterport E57, or a hired scanner, applies when tolerances matter.
- Splats (Polycam, Scaniverse, Postshot, Marble) are best used as **context and presentation** layers: a site backdrop in SketchUp or Unreal, or client walkthroughs of the existing space. They are not measurement sources.
- Claude can parse exported OBJ/PLY/DXF/IFC and check dimensions, but cannot trigger captures: no public APIs exist for Polycam or the consumer apps, and Matterport's API is Enterprise-gated.

### Gaps
- I found no independent accuracy figures (mm error) for RoomPlan, Magicplan, CamToPlan or Polycam against survey-grade methods. CamToPlan did not surface at all.
- Magicplan's current export formats, API and pricing are unverified.
- XGRIDS LCC (SLAM LiDAR plus splats for AEC) surfaced only in passing and was not verified.
- Autodesk's own ReCap 2026 release notes were not checked.

## Q1d. Image-generation connectors and MCP servers in Claude's ecosystem (mood boards, concept renders)

### Takeaway
In this environment Claude has a **first-party Canva connector** with `generate-image` (text-to-image plus reference-image editing, 11 aspect ratios, async job). That covers mood boards and concept images without extra setup. Beyond it, a large set of **community** (not vendor-official) MCP servers wrap fal.ai, Replicate, OpenAI gpt-image, Google Nano Banana/Imagen and FLUX. These enable scripted render loops, including passing a Claude-built model's screenshot as a reference image.

### Cited Findings
- Canva MCP `generate-image`, observed directly from this session's tool schema on 2026-11-21: it generates an image from a text prompt or edits/restyles supplied reference images. Reference images must first be uploaded via `create-upload-url` and then passed as MEDIA IDs. Aspect ratios run from SQUARE_1_1 to LANDSCAPE_2_1 and PORTRAIT_1_2. The call returns a jobId that is polled with `get-generate-image-job`. A sibling tool, `create-design`, handles laid-out pages such as boards and posters — (Canva MCP tool definition in this Claude session; no public URL)
- Community fal-based MCP servers cover Nano Banana 2, Nano Banana Pro and GPT-Image 1.5 for Claude Code/Desktop; one lists the Nano Banana Pro tier at about $0.15/image — [glama fal-ai-mcp-server](https://glama.ai/mcp/servers/Szotasz/fal-ai-mcp-server); [lobehub mcp-fal](https://lobehub.com/fr/mcp/dandadadandan-mcp-fal)
- Multi-provider servers include imagegen-mcp (GPT-Image-1, Nano Banana, Imagen 4, Flux 1.1 via Replicate) and mcp-imagenate (Nano Banana, gpt-image, FLUX, Reve; only gpt-image supports transparent backgrounds). shinpr/mcp-image is built around Nano Banana 2/Pro for Claude Code/Cursor — [lobehub imagegen-mcp](https://lobehub.com/en/mcp/writingmate-imagegen-mcp); [mcp-imagenate README](https://cdn.jsdelivr.net/npm/mcp-imagenate@0.9.0/README.md); [mcpservers shinpr/mcp-image](https://mcpservers.org/fr/servers/shinpr/mcp-image)
- None of these image MCP servers appeared to be official vendor releases from fal, Replicate, Google or OpenAI — [OpenArt roundup](https://openart.ai/fr/blog/best-image-generation-mcp-servers-for-claude/)
- Blender MCP's `look` tool returns viewport, camera, multi-angle or render views. These give Claude a way to see its own model and a source of reference images for image generation — [blender-mcp GitHub](https://github.com/ahujasid/blender-mcp)

### Inferences
- The Canva connector is the zero-setup choice for **mood boards and loose concept imagery**. Because it accepts reference images, Claude can upload a massing screenshot or hand sketch and restyle it. The prompt field must contain the user's exact words, though, which limits how much structured prompting Claude can inject. (That constraint is stated in the tool schema.)
- For **geometry-faithful concept renders**, a Nano Banana Pro / gpt-image MCP with a reference image, or a ComfyUI depth/canny ControlNet pipeline, is closer to how Veras 4 works: an image model conditioned on a viewport.

### Gaps
- I did not verify maintenance status, security or pricing for the community image MCP servers.
- I did not test whether Canva generate-image preserves geometry from a reference image.

## Q2. Where each tool fits in the architecture workflow; client-facing vs. ideation-only

### Takeaway
AI tools are strongest at the front of the process (concept, mood, option exploration) and weakest at the back (construction-accurate depiction). Geometry-bound tools such as Veras/Enscape, D5 AI and Lumion upscaling can reach client-facing quality *if* a human checks every image against the model. Free-floating generators (Midjourney, web text-to-render, Marble worlds) should stay at ideation and mood. Generated 3D meshes belong as entourage and props from schematic design onward, not as architecture.

### Cited Findings
- Architecture Lab argues the case for AI rendering "is strongest at the front of the process and weakest at the back" and recommends a hybrid pipeline in which a human validates images before they leave the office — [Architecture Lab](https://www.architecturelab.net/how-ai-reshaped-the-render-and-what-it-still-cant-build/)
- Dan Cumberland Labs recommends keeping free-floating tools such as Midjourney (no BIM link, prone to geometry hallucination) in early concept work, and using geometry-bound tools where design fidelity matters. A companion piece describes a firm that lost a pursuit because its AI rendering "looked too perfect" — [Dan Cumberland Labs: credibility](https://dancumberlandlabs.com/blog/ai-for-architectural-renderings/); [Dan Cumberland Labs: lost pursuit](https://dancumberlandlabs.com/blog/architecture-rendering-ai/)
- Veras positions image-to-video (pans and zooms) and Nano Banana Pro rendering inside Enscape/V-Ray/Corona, the tools firms already use for presentation — [Chaos press](https://www.chaos.com/press/veras-ai-architecture-enscape-vray-corona)
- D5's Scene Match and Asset Recommendation target the scene-dressing and look-development stage. SmartPlanting targets landscape design intent — [Architosh](https://architosh.com/2026/02/d5-version-3-released-new-ai-workflows/); [CG Channel](https://www.cgchannel.com/2025/07/dimension-5-releases-d5-render-11/)
- Lumion upscalers (up to 16K local, 96 MP cloud) are final-output enhancement steps — [Lumion Pro 2026](https://lumion.com/tips-guides/lumion-pro-2026-guide); [Lumion support](https://support.lumion.com/hc/en-us/articles/19738054247580)
- Marble's guide pitches turning a room description or single photo into a walkthrough "for client review". The docs say splats beat meshes for visual quality — [Scenario Marble guide](https://help.scenario.com/articles/4774055514-marble-by-world-labs-the-essentials); [Marble mesh export](https://docs.worldlabs.ai/marble/export/mesh.md)
- TestFit's CEO argues in AEC Magazine that AI's value in AEC is in cognition and data, not geometry generation — [AEC Magazine opinion](https://aecmag.com/opinion/ai-in-aec-collapse-cognition-not-geometry/)

### Inferences
- **Stage mapping (synthesized):**
  - *Concept and mood:* Canva generate-image, Midjourney V8, Krea, Nano Banana/gpt-image MCPs, LookX/mnml sketch-to-render, Marble worlds. **Ideation only.**
  - *Massing and options:* ComfyUI depth/canny ControlNet or Veras over Claude-built massing (Blender MCP or CAD), so options stay tied to real geometry. Generated meshes (Meshy/Rodin) as placeholder props. **Internal or early-client.**
  - *Design development:* Enscape/D5/Lumion real-time rendering from the actual model, with AI Enhancer for people and vegetation, D5 Scene Match for lighting, and Veras for material and style variants with geometry adherence set high. Meshy/Rodin/Tripo furniture with real dimensions (via `resize_height` or bbox). **Client-facing with QA.**
  - *Presentation:* path-traced renders from V-Ray/Corona/D5/Lumion, AI upscaling, Veras image-to-video for motion. Splat context of existing site from Polycam/Scaniverse/Postshot in SketchUp/Unreal. **Client-facing; label AI-assisted imagery.**
  - *Existing conditions (parallel track):* RoomPlan/Magicplan DXF, Polycam OBJ/LAS, Matterport E57, then scan-to-BIM (EdgeWise/ReCap/manual Revit).
- A pure AI image should not become a contract or marketing render unless it has been checked against the model, because AI renders can show things that are not in the design.

### Gaps
- No survey data quantifies which tools firms actually use at which stage in 2026. The Chaos survey (64% experimented, 20% fully embraced) is vendor data reported secondhand, and its date is unclear.

## Q3. Limitations practitioners report (hallucinated geometry, non-buildable details, scale errors, licensing)

### Takeaway
The recurring problems are geometry drift and hallucinated elements in AI renders (including in geometry-bound tools after the Nano Banana switch), artifacts in AI enhancers, mis-scaled meshes and scans, single-object generators that cannot produce coherent buildings, and licensing traps: CC BY on free tiers, Hunyuan's EU/UK/KR exclusion, Stability's $1M threshold, and Midjourney having no official API.

### Cited Findings
- Reported secondhand from the AIA 2025 adoption study: 94% of architects worry about AI inaccuracy and 90% about authenticity. I did not check the primary AIA study — [Architecture Lab](https://www.architecturelab.net/how-ai-reshaped-the-render-and-what-it-still-cant-build/); [Dan Cumberland Labs](https://dancumberlandlabs.com/blog/ai-for-architectural-renderings/)
- Midjourney is associated with geometry hallucination in arch-viz — [Dan Cumberland Labs](https://dancumberlandlabs.com/blog/ai-for-architectural-renderings/)
- A Houzz community thread is titled "the hallucination trap" of AI renderings — [Houzz](https://www.houzz.com/discussions/6569863/the-hallucination-trap-ai-renderings)
- With Veras 4's Nano Banana engine, overrides became localized and vary across the image — [EvolveLab forum](https://forum.evolvelab.io/t/veras-release-4-0-nano-banana/11184)
- The Chaos AI Enhancer preview "could sometimes produce unwanted artifacts", and output is capped at 2048×2048 — [Enscape blog](https://blog.enscape3d.com/introducing-chaos-ai-enhancer)
- Vendor adherence claims are unverified marketing, e.g. Snaptrude's "95%+ of your geometry" — [Snaptrude](https://www.snaptrude.com/blog/the-future-of-ai-rendering)
- **Scale:** Polycam and Luma scans were found not at the right scale in an informal test — [LinkedIn comparison](https://pl.linkedin.com/in/kamilmaziarka)
- Generators normalize size unless constrained. Rodin's bounding-box axis order differs between providers — [Runware](https://runware.ai/docs/models/hyper3d-rodin-gen-2); [fal](https://fal.ai/models/fal-ai/hyper3d/rodin/v2/api)
- RoomPlan's guidance is limited to single rooms of about 30×30 ft, and its export is one-way — [Apple RoomPlan](https://developer.apple.com/augmented-reality/roomplan); [Apple forum](https://developer.apple.com/forums/thread/831648)
- **Mesh quality:** Marble's own docs say mesh exports are lower fidelity than splats — [Marble mesh docs](https://docs.worldlabs.ai/marble/export/mesh.md)
- TRELLIS.2 GLB exports default to opaque, so transparency (glass) needs manual alpha hookup. Its O-Voxel representation can produce non-manifold and internal surfaces — [TRELLIS.2 GitHub](https://github.com/microsoft/TRELLIS.2)
- **Model churn:** Meshy retired meshy-5 (Oct 10, 2026) and lowpoly (Oct 30, 2026), and meshy-7 retires Dec 31, 2026. Luma Genie and Flythroughs were sunset on Jan 1, 2026. Sparc3D variants are deprecated on Scenario — [Meshy remesh ZH](https://docs.meshy.ai/zh/api/remesh); [Meshy pricing](https://docs.meshy.ai/api/pricing); [App Store Luma](https://apps.apple.com/app/id1615849914); [Scenario](https://help.scenario.com/en/articles/comparing-generative-3d-models/)
- **Licensing:** Meshy and Tripo free-tier outputs are under CC BY 4.0 with attribution required — [Meshy pricing docs](https://docs.meshy.ai/pricing); [Tripo blog](https://www.tripo3d.ai/blog/commercial-use-ai-3d-models)
- Hunyuan3D 2.1 is excluded in the EU, UK and South Korea, and above 1M MAU needs a separate license — [HF README](https://www.huggingface.co/tencent/Hunyuan3D-2.1/blob/main/README.md)
- Stability's 3D models are free only below $1M revenue — [Stability license](https://stability.ai/license)
- World Labs commercial rights require Pro — [Marble specs](https://docs.worldlabs.ai/marble/export/specs)
- Midjourney has no official API; resellers are unofficial — [WaveSpeed](https://wavespeed.ai/blog/posts/what-is-midjourney-v8-features-pricing-how-to-use-2026)
- **Security:** Blender MCP's socket is unauthenticated and can run arbitrary Python. Telemetry is on by default and may be used for training — [blender-mcp GitHub](https://github.com/ahujasid/blender-mcp)

### Inferences
- Non-buildable detail is inherent: image models do not know structure, codes or construction logic, so AI images can show impossible cantilevers, mullion patterns that do not align, or stairs that do not resolve. Mesh generators produce watertight-looking but internally messy geometry. The mitigation is always to tie the output to a model Claude or the designer controls, and to check every image against it.
- Claude should keep a "provenance and license" note per asset: generator, model version, plan tier and license. Models retire every few months and license terms vary by plan and region.

### Gaps
- I found no systematic practitioner study (e.g., Reddit r/architecture or r/StableDiffusion threads) that could be read in full, because fetches were blocked. Opinion is drawn from commentary blogs.
- Copyright and ownership of AI renders under US/UK law was not researched; it is likely covered by other researchers or legal sources.

## Q4. How Claude should orchestrate these tools as design partner

### Takeaway
Claude is most valuable as **spec-keeper, prompt author and verifier**, not as a pixel generator. Claude owns the design spec (dimensions, materials, program). From it, Claude (1) writes structured, view-by-view render prompts for any renderer; (2) builds or exports the geometry that conditions the image (Blender MCP, `look` screenshots, depth/lineart passes for ControlNet, or a model for Enscape/D5); (3) calls APIs or MCPs where they exist (Meshy MCP, Rodin/Tripo/Hunyuan via Blender MCP, Canva or community image MCPs, ComfyUI); and (4) checks returned images and meshes against the spec (dimensions, counts, materials) before anything reaches a client.

### Cited Findings
- Blender MCP lets Claude run Python in Blender (`execute_blender_code`), inspect the scene (`get_scene_info`), see results (`look`: camera, multi-angle or render), generate assets (`generate_3d` via Meshy/Tripo/Rodin/Hunyuan), pull CC0 HDRIs and materials (Poly Haven), and generate splat worlds (World Labs). The server ships client configs for Claude Desktop and Claude Code — [blender-mcp GitHub](https://github.com/ahujasid/blender-mcp)
- The Meshy MCP installs into Claude Code with one `claude mcp add` command. Meshy's Remesh API enforces real-world height (`resize_height`), origin, quad topology and polycount, and exports FBX/GLB/USDZ/STL/BLEND for downstream renderers — [Meshy AI docs](https://docs.meshy.ai/api/ai); [Meshy Remesh](https://docs.meshy.ai/en/api/remesh)
- Rodin's bounding box and Hunyuan3D-Omni's bbox and point-cloud conditioning let a spec's dimensions constrain generation — [Runware Rodin](https://runware.ai/docs/models/hyper3d-rodin-gen-2); [Hunyuan3D-Omni](https://arxiv.org/html/2509.21245v1)
- ComfyUI depth/canny ControlNet takes depth maps or lineart (which Blender can render from Claude's model) to keep spatial relationships and outlines. Comfy partner nodes add Meshy and Rodin in the same graph — [Comfy depth ControlNet](https://docs.comfy.org/tutorials/controlnet/depth-controlnet); [Comfy FLUX ControlNet](https://docs.comfy.org/tutorials/flux/flux-1-controlnet); [Comfy Rodin node](https://docs.comfy.org/built-in-nodes/Rodin3D_Gen25_Text.md)
- Veras controls how closely output follows geometry and composition, and D5's agent accepts natural-language mood descriptions. Both are human-operated UIs that take text Claude can write — [NTI Veras](https://www.nti-group.com/ie/products/other-products/chaos/veras/); [D5 AI Agent docs](https://docs.d5render.com/user-guide/ai/ai-agent)
- Canva generate-image accepts uploaded reference images (e.g., a massing view) plus a prompt, and returns an async job — (Canva MCP tool schema in this session)
- Matterport's Import API builds models from E57 programmatically (Enterprise). Polycam has no public API — [Matterport Import API](https://matterport.github.io/developer-docs/api/import/guide/); [API Evangelist](https://providers.apievangelist.com/providers/polycam/)

### Inferences
- **Recommended handoff patterns (synthesized):**
  1. **Spec to prompt.** Claude keeps a design spec (rooms, dimensions, materials with finishes and colors, glazing, lighting time of day, camera position and lens, entourage density, style references, negative constraints). It writes one prompt block per view: subject and geometry anchor, materials, lighting and time, camera, mood, "do not add / do not change" list. The same block is reusable across Veras, D5 Scene Match, mnml/LookX, Midjourney and Canva.
  2. **Claude's model as the condition.** Claude builds massing or interiors in Blender via MCP (or exports from the CAD/BIM tools other researchers cover), renders depth, normal, lineart and clay passes from fixed cameras, then feeds them to ComfyUI ControlNet, an image MCP with a reference image, or Veras/Enscape. This keeps AI images tied to designed geometry.
  3. **Claude calls 3D generators for props.** For bespoke furniture or objects, Claude calls Meshy (MCP) or Rodin/Hunyuan (Blender MCP) with a reference image and **explicit dimensions** (Meshy `resize_height`; Rodin bbox), requests quad topology and a polycount budget, and places the result in the scene. Claude records the model version and license tier.
  4. **Claude consumes capture exports.** Claude ingests RoomPlan USDZ/DXF, Polycam OBJ/PLY/LAS or Matterport E57-derived geometry, extracts key dimensions into the spec, flags anything that needs field verification, and uses splats only as visual context.
  5. **Claude verifies outputs.** Claude reads each returned image (multimodal) against a checklist generated from the spec: window and door counts, mullion rhythm, floor count, material placement, items added or removed, and implausible structure. For meshes it checks bounding-box dimensions, scale and units, polycount and watertightness, via Blender MCP `get_scene_info` or a script. Anything that fails is regenerated or marked "concept only".
  6. **Labeling.** Claude tags deliverables as "AI-assisted concept" vs. "model-based render" so ideation imagery is not mistaken for design commitments.
- Where no API exists (Enscape, D5, Lumion, Twinmotion, Polycam, Midjourney), Claude's output is a ready-to-paste prompt, settings sheet or model file, and a human runs the tool.

### Gaps
- I did not test end-to-end how reliably Claude's multimodal checks catch geometry drift in AI renders. No published evaluation was found.
- I did not confirm whether Veras or D5 offer any scripting or plugin API, for example through the SketchUp/Revit SDK hosts, that Claude could drive.
