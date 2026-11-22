# Supabase schema and RLS changes — local first

> **Paths.** `${CLAUDE_PLUGIN_ROOT}` in this doc is the toolkit's install folder: the folder above the `reference/` folder this file was read from. Claude Code substitutes it only in commands, agents and skills, not in a file read with the Read tool, so write the real path in its place before you run or open anything here.

Writing every schema and RLS change straight against the one live database, with `npm run dev` pointed at prod and RLS checked by reading SQL, lets the migrations folder drift from prod. Supabase Select 2026 (blog post `select-2026-build-anything`) shipped three things that fix that: a local stack that runs without Docker, so it works inside Claude's sandbox and one per worktree (alpha); Declarative Schemas 2.0, where schema files are the truth and the CLI's `pg-delta` engine writes the migrations; and project config in `config.toml`. `/change-heavy` and `/cleanup-light` point here for any change to a project's schema or RLS.

## Which projects

Any project with a `supabase/` directory. A project has **adopted** when its `package.json` has a `test:rls` script, the RLS harness below. That script is the marker the pipelines check; a Supabase config flag is not, because the alpha flags will change.

## The rules, once adopted

1. **Schema files are the truth.** Change `supabase/schemas/*.sql` and let the CLI generate the migration (`supabase db schema declarative sync`). Don't hand-write a migration, and don't run DDL through the Supabase MCP.
2. **Local stack first.** Every schema or RLS change is applied and exercised on the local stack before prod. Reset it as often as you like; nothing there is real.
3. **RLS is proven, not read.** `npm run test:rls` seeds two users and asserts, for every user-owned table, that neither can read or write the other's rows. A change that adds a user-owned table adds it to the harness in the same change. The harness is shown red on a deliberately broken policy when it is built and whenever its matching logic changes (R-1). A red harness blocks the run; it is not a finding to adjudicate.
4. **Prod push waits for the owner's go.** `supabase db push` is a production migration, an outward action (tier 3 in `${CLAUDE_PLUGIN_ROOT}/reference/decision-gates.md`). It runs once, after the harness is green and the run has committed, on the owner's go, and the run's report names it.

## Before adoption

Query live prod through the Supabase MCP before trusting the migrations folder, and apply DDL with `apply_migration` (not `execute_sql`) so it is at least recorded. That DDL is a production database change, so like rule 4's push it runs after the run has committed, on the owner's go. The run's report says **"RLS checked by reading, not by harness — project hasn't adopted ${CLAUDE_PLUGIN_ROOT}/reference/supabase-local.md"**, so the gap stays visible on every run that hits it.

## Adopting

A project adopts it with these steps:

1. Install the Supabase CLI. The owner runs `supabase login` once (Claude can't enter the token), then `supabase init` if there's no `config.toml`, and `supabase link` to the project. Init writes a local-only config: its auth and API values are defaults, not prod's, so never `supabase config push`.
2. `supabase db pull --declarative --remote=<ref>` writes the schema files from live prod without writing to its migration history (it signs in through a temporary login role the CLI creates; plain `supabase pull` writes prod's migration-history table). Diff them against `supabase/migrations/` and explain every difference.
3. Turn on `[experimental] stack = true` in `config.toml`; `[experimental.pgdelta] enabled = true` is the CLI default (3.2.0) and stays.
4. Squash to a baseline rather than reconcile file by file: move the hand-written migrations unchanged to a frozen folder (for example `supabase/migrations-legacy/`), and let the CLI generate one baseline migration from the pulled schema into `supabase/migrations/` (`supabase db schema declarative sync --name prod_baseline`). Prod's history is repaired before the first `supabase db push`, not at adoption: export it read-only, re-pull and require the schema to equal the committed files, then `supabase migration repair` marks the baseline applied and every other row reverted. Reverting deletes those history rows, so the go request names it as a deletion of history records.
5. Build the two-user harness, expose it as `npm run test:rls`, and show it red on a broken policy before trusting a green run.

## If the alpha breaks

The local stack is alpha and `pg-delta` is experimental for existing projects as of 2026-10-09. If either misbehaves before a project has squashed to a baseline (Adopting step 4), use the before-adoption path for that run, say so in the report, and file the failure. Nothing in the local workflow writes to prod, so falling back loses nothing; the fallback's DDL waits for the owner's go like any prod change.

Once a project has squashed to a baseline, an alpha failure halts the schema change and the run reports it: the stack is required, because DDL made outside a generated migration makes the baseline stale. If a production change can't wait, its DDL runs on the owner's go and is followed in the same run by `supabase db pull --declarative --remote=<ref>` into `supabase/schemas/`, so the next generated migration starts from the truth. The emergency change is then marked applied in production's history: generate its migration from the pulled schema (`supabase db schema declarative sync --name <name>`) and, on the owner's go, `supabase migration repair --status applied <version>` for that migration, so `supabase db push` doesn't run it twice. That generate step needs the local stack, so while the stack is the thing that's broken it waits, and nothing is pushed until it has run. File the failure, as before a baseline.
