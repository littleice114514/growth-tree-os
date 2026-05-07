# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：feature/mac-sync-ai-workflow-only
- 最新 commit：以本轮最终汇报和 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-05-07

## 2. 本轮已完成

- Mac 端没有 checkout / pull 整个 `feature/win-ai-workflow-token-saving` 分支。
- 已从 `origin/feature/win-ai-workflow-token-saving` 只恢复 AI 工作流文档。
- 已新增 Mac 端“仅文档同步”验收日志。
- 已确认本轮同步范围不包含 3D 模块、业务页面、模型资产、数据库修改或 Time Debt 功能。

## 3. 本轮修改文件

- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md`
- `docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md`
- `docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md`
- `docs/dev-protocol/DEV_LOG_RULES.md`
- `docs/dev-protocol/PROJECT_HANDOFF_RULES.md`
- `docs/dev-log/2026-05/2026-05-07/win-ai-workflow-token-saving.md`
- `docs/dev-log/2026-05/2026-05-07/mac-ai-workflow-sync-only-check.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `git status --short` 在恢复前为空，可以安全执行仅文档同步。
- 已执行 `git fetch origin feature/win-ai-workflow-token-saving`，只获取远端分支信息，没有 pull。
- 已在 `feature/mac-sync-ai-workflow-only` 上通过 `git restore --source` 恢复指定文档路径。
- 恢复后文件清单只包含 `docs/project-state/`、`docs/dev-protocol/`、`docs/dev-log/2026-05/2026-05-07/` 和本交接卡。

### 未验证 / 风险

- 本轮范围是文档同步，不运行前端、Electron、数据库或 3D 模块验证。
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
- `git diff --stat HEAD~1 HEAD` 只包含 `docs/project-state/`、`docs/dev-protocol/`、`docs/dev-log/`、`docs/handoff/`。
- 不应出现 `app/`、`src/`、`public/`、`assets/`、`models/`、`3d/` 或 `three` 相关代码路径。

预期结果：Mac 端已同步 AI 工作流文档，但没有带入 3D 模块或业务代码。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

读取 `docs/project-state/CURRENT_STATUS.md`、`docs/project-state/LOG_INDEX.md` 最近 5 条、`docs/project-state/NEXT_ACTION.md`，确认 AI 工作流省 token 底座是否能作为后续开工默认入口。不要默认扫描完整 `docs/dev-log` 历史，不要恢复或合并 3D 模块代码。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status --short` 输出
- `git branch --show-current` 输出
- `git rev-parse --short HEAD` 输出
- `git diff --stat HEAD~1 HEAD` 输出
- `find docs/project-state docs/dev-protocol docs/dev-log/2026-05/2026-05-07 -type f | sort` 输出
- pull、checkout 或依赖安装命令的完整报错

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status --short`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮策略是只同步 AI 工作流文档，不同步 3D 模块代码、业务页面代码、模型文件、UI 修改、数据库修改或 Time Debt 功能。
