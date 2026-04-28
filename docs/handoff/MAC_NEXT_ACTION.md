# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：main
- 最新 commit：以 Windows 端最终汇报和 Mac 端 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-04-28

## 2. 本轮已完成

- 已恢复 Windows 端中断前的 rebase 状态，合并保留 Mac / Windows 两段 `DEVELOPMENT_LOG.md` 记录。
- 已建立 `.ai-workflow/` 作为跨设备 AI 工作流统一入口。
- 已同步 Win 端可复用本地 skills：`concise-dev`、`frontend-skill`、`handoff-card`、`repo-map`。
- 已建立 commands / docs / handoff 索引，说明当前未发现 repo 内 command 文件。
- 已记录敏感信息扫描口径和排除项，未纳入 `.env`、日志、pid、缓存、构建产物或本地密钥。

## 3. 本轮修改文件

- `.ai-workflow/README.md`
- `.ai-workflow/skills/concise-dev/SKILL.md`
- `.ai-workflow/skills/frontend-skill/SKILL.md`
- `.ai-workflow/skills/handoff-card/SKILL.md`
- `.ai-workflow/skills/repo-map/SKILL.md`
- `.ai-workflow/commands/README.md`
- `.ai-workflow/docs/README.md`
- `.ai-workflow/handoff/README.md`
- `docs/handoff/DEVELOPMENT_LOG.md`
- `docs/handoff/SYNC_LOG.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `git rebase --continue` 已成功完成，当前分支回到 `main`。
- `.ai-workflow/README.md` 已创建，并包含 skills / commands / docs / handoff / Mac 使用说明 / 排除项。
- 已扫描候选内容关键词：`OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GITHUB_TOKEN`、`token`、`secret`、`password`、`cookie`、`authorization`、`api_key`、`sk-`。
- `docs/P2_VISUAL_UPGRADE_LOG.md` 中的 `token` 为主题 token 语义；`pnpm-lock.yaml` 中的 `token` 为依赖名命中，均不作为密钥提交。
- 本轮未提交 `codex-live-dev.pid`。

### 未验证 / 风险

- Mac 端尚未 pull 验收。
- `.ai-workflow/skills/` 当前同步的是 Win 端可复用用户层 skills；系统/plugin/provider skills 只在 README 中索引，没有复制。
- 本轮不验证业务 UI，不运行 Electron smoke；范围仅限 AI workflow 资产同步。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Developer
cd ~/Developer
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout main
```

如果 Mac 上已经有项目：

```bash
cd ~/Developer/growth-tree-os
git status
git fetch origin
git checkout main
git pull origin main
git rev-parse --short HEAD
```

确认输出的 commit 应与 Windows 端最终汇报一致。

## 6. Mac 端环境准备

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

如需把同步的 skills 安装到 Mac Codex：

```bash
mkdir -p "$HOME/.codex/skills"
cp -R .ai-workflow/skills/concise-dev "$HOME/.codex/skills/"
cp -R .ai-workflow/skills/frontend-skill "$HOME/.codex/skills/"
cp -R .ai-workflow/skills/handoff-card "$HOME/.codex/skills/"
cp -R .ai-workflow/skills/repo-map "$HOME/.codex/skills/"
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- `git branch --show-current` 输出 `main`。
- `git status` clean。
- `ls -la .ai-workflow` 能看到 `README.md`、`skills/`、`commands/`、`docs/`、`handoff/`。
- `cat .ai-workflow/README.md` 能看到 skills / commands / docs / handoff 索引。
- `.ai-workflow/skills` 下能看到 `concise-dev`、`frontend-skill`、`handoff-card`、`repo-map`。
- `.ai-workflow/README.md` 没有真实 API key、token、cookie、password 或 authorization 值。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

拉取 Windows 端 AI workflow 同步 commit 后，确认 `.ai-workflow/README.md` 和 `.ai-workflow/skills/*/SKILL.md` 可读，并按需把 4 个同步 skills 安装到 Mac 的 `$HOME/.codex/skills`。验收后再继续推进 Dashboard Preview 真实数据融合，不要直接改数据库或 IPC。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git branch --show-current` 输出
- `git rev-parse --short HEAD` 输出
- `ls -la .ai-workflow` 输出
- `find .ai-workflow -maxdepth 3 -type f | sort` 输出
- `cat .ai-workflow/README.md` 的关键报错或缺失段落
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错

## 10. 注意事项

- 不要直接覆盖 Mac 本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- `.env`、SQLite、本地 runtime、依赖和构建产物不要提交。
- `.ai-workflow/` 是跨设备 AI workflow 入口；项目真实状态仍以 `docs/` 和代码为准。
