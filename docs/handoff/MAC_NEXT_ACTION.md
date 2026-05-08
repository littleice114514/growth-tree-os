# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：feature/mac-sync-ai-workflow-only
- 最新 commit：以本轮最终汇报和 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-05-08

## 2. 本轮已完成

- 已将 Codex 工作底座 v4 固化到项目根目录 `AGENTS.md`。
- 已刷新 project-state 三件套，让后续开工优先读取 `AGENTS.md`、`CURRENT_STATUS.md`、`NEXT_ACTION.md` 和 `LOG_INDEX.md` 最近 5 条。
- 已更新本 Mac 下一步操作卡，写入另一台设备可直接执行的 pull 与验收命令。
- 已确认本轮同步范围不包含 3D 模块、业务页面、模型资产、数据库修改或 Time Debt / Wealth / Tree 业务功能。

## 3. 本轮修改文件

- `AGENTS.md`
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- 本轮开始前 `git status --short` 为空。
- 已确认根目录原本没有 `AGENTS.md`，本轮新增项目级规则文件。
- 已确认 `docs/project-state/` 与 `docs/handoff/` 存在，并更新三件套与 Mac 接续卡。
- 验收范围只包含 `AGENTS.md`、`docs/project-state/` 和 `docs/handoff/`。

### 未验证 / 风险

- 本轮范围是 AI 工作流文档固化，不运行前端、Electron、数据库或 3D 模块验证。
- 如果后续设备已有本地未提交改动，不要直接 pull，先处理本地状态。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Developer
cd ~/Developer
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git fetch origin
git checkout feature/mac-sync-ai-workflow-only
git rev-parse --short HEAD
```

如果 Mac 上已经有项目：

```bash
cd ~/Developer/growth-tree-os
git status --short
git fetch origin
git checkout feature/mac-sync-ai-workflow-only
git pull origin feature/mac-sync-ai-workflow-only
git rev-parse --short HEAD
```

确认输出的 commit 应与本轮最终汇报一致。

## 6. Mac 端环境准备

本轮只同步文档，默认不需要安装依赖或启动应用。

如下一轮要继续做工程验证，再执行：

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- `git branch --show-current` 输出 `feature/mac-sync-ai-workflow-only`。
- `git status --short` 没有输出。
- `test -f AGENTS.md` 成功。
- `test -f docs/project-state/CURRENT_STATUS.md` 成功。
- `test -f docs/project-state/NEXT_ACTION.md` 成功。
- `test -f docs/project-state/LOG_INDEX.md` 成功。
- `test -f docs/handoff/MAC_NEXT_ACTION.md` 成功。
- `git diff --name-only HEAD~1 HEAD` 不应出现 `app/`、`src/`、`public/assets/`、`models/`、`3d/` 或业务代码路径。

预期结果：另一台设备已同步项目级 AI 工作流底座，但没有带入 3D 模块或业务代码。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

读取 `AGENTS.md`、`docs/project-state/CURRENT_STATUS.md`、`docs/project-state/NEXT_ACTION.md`、`docs/project-state/LOG_INDEX.md` 最近 5 条，确认 Codex 工作底座 v4 是否能作为后续开工默认入口。不要默认扫描完整 `docs/dev-log` 历史，不要恢复或合并 3D 模块代码。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status --short` 输出
- `git branch --show-current` 输出
- `git rev-parse --short HEAD` 输出
- `git diff --name-only HEAD~1 HEAD` 输出
- `find AGENTS.md docs/project-state docs/handoff -maxdepth 2 -type f | sort` 输出
- pull、checkout 或依赖安装命令的完整报错

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status --short`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮策略是固化 AI 工作流底座，不同步 3D 模块代码、业务页面代码、模型文件、UI 修改、数据库修改或 Time Debt / Wealth / Tree 功能。
