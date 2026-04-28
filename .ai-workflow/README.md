# AI Workflow Assets｜growth-tree-os

This directory is the cross-device entry point for Codex / Claude / AI workflow assets used by `growth-tree-os`.

## 1. Asset Overview

- Project workflow docs live in `docs/`.
- Cross-device handoff docs live in `docs/handoff/`.
- Synced reusable local skills live in `.ai-workflow/skills/`.
- Command assets are indexed in `.ai-workflow/commands/`; no repo-level command files were found in this scan.
- Claude/Codex native project folders such as `.claude/`, `.codex/`, `commands/`, and `skills/` were not present in the repo at sync time.

## 2. Synced Skills

| Skill | Source on Win | Synced copy | Purpose |
| --- | --- | --- | --- |
| `concise-dev` | `C:\Users\32042\.codex\skills\concise-dev\SKILL.md` | `.ai-workflow/skills/concise-dev/SKILL.md` | Compact internal engineering summaries, scan reports, and handoff notes. |
| `frontend-skill` | `C:\Users\32042\.codex\skills\frontend-skill\SKILL.md` | `.ai-workflow/skills/frontend-skill/SKILL.md` | Visual and interaction guidance for frontend app/site work. |
| `handoff-card` | `C:\Users\32042\.codex\skills\handoff-card\SKILL.md` | `.ai-workflow/skills/handoff-card/SKILL.md` | Structured handoff cards and next-action cards. |
| `repo-map` | `C:\Users\32042\.codex\skills\repo-map\SKILL.md` | `.ai-workflow/skills/repo-map/SKILL.md` | Fast repository orientation and module map output. |

Additional installed Win skills were discovered but not copied because they are system/plugin/provider skills or deployment-specific helpers: `imagegen`, `openai-docs`, `plugin-creator`, `skill-creator`, `skill-installer`, `gh-fix-ci`, `playwright`, and `vercel-deploy`.

## 3. Commands

No project-level command directory was found during this sync:

- `.commands/`
- `commands/`
- `.claude/commands/`
- `.codex/commands/`

When commands are added later, save them under the tool-native location and add an index entry in `.ai-workflow/commands/README.md`.

## 4. Project Workflow Docs

Primary docs discovered for cross-device continuation:

- `docs/CURRENT_TASK.md`
- `docs/CURRENT_STATE.md`
- `docs/FILE_MAP.md`
- `docs/SMOKE_TEST.md`
- `docs/ARCHITECTURE.md`
- `docs/handoff/DEVELOPMENT_LOG.md`
- `docs/handoff/SYNC_LOG.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/handoff/MACBOOK_SETUP.md`
- `docs/product/DASHBOARD_FUTURE_BACKLOG.md`

Use `docs/handoff/MAC_NEXT_ACTION.md` as the latest cross-device handoff card.

## 5. Mac Usage

After pulling this repo on Mac:

```bash
cd "/Users/你的用户名/对应项目路径/growth-tree-os"
git status
git pull origin main
ls -la .ai-workflow
cat .ai-workflow/README.md
```

To install a synced skill into Mac Codex manually:

```bash
mkdir -p "$HOME/.codex/skills"
cp -R .ai-workflow/skills/concise-dev "$HOME/.codex/skills/"
cp -R .ai-workflow/skills/frontend-skill "$HOME/.codex/skills/"
cp -R .ai-workflow/skills/handoff-card "$HOME/.codex/skills/"
cp -R .ai-workflow/skills/repo-map "$HOME/.codex/skills/"
```

If Mac uses `.agents/skills` instead:

```bash
mkdir -p "$HOME/.agents/skills"
cp -R .ai-workflow/skills/concise-dev "$HOME/.agents/skills/"
cp -R .ai-workflow/skills/handoff-card "$HOME/.agents/skills/"
cp -R .ai-workflow/skills/repo-map "$HOME/.agents/skills/"
```

## 6. Save Rules For New Skills

- Keep reusable project skills under `.ai-workflow/skills/<skill-name>/SKILL.md`.
- Keep project commands under `.ai-workflow/commands/` or mirror the native `.claude/commands/` / `.codex/commands/` structure and link them here.
- Do not commit local runtime state, caches, logs, database files, cookies, tokens, or `.env` files.
- Prefer indexing existing project docs instead of duplicating large docs into `.ai-workflow/docs/`.
- When a workflow becomes stable and repeated, add it as a candidate SOP first; promote it to a skill after it proves reusable.

## 7. Exclusions And Sensitive Scan Notes

Excluded from sync:

- `.git/`, `node_modules/`, `dist/`, `build/`, `.next/`, `out/`, cache directories, logs, and pid files.
- `codex-live-dev.pid`, because it is local runtime residue.
- `pnpm-lock.yaml`, because sensitive scan matches were dependency package names containing `token`, not AI workflow assets.

Sensitive scan notes:

- `docs/P2_VISUAL_UPGRADE_LOG.md` contains the word `token` as design/theme token terminology; no secret value was identified.
- No `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `sk-` key, cookie, password, or authorization value is intentionally included in `.ai-workflow/`.
