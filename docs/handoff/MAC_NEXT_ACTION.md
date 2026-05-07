# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/win-ai-workflow-token-saving
- 最新 commit：以 Windows 最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-07 17:01:33 +08:00

## 2. 本轮已完成

- 新增 `docs/project-state/` 三件套：`CURRENT_STATUS.md`、`LOG_INDEX.md`、`NEXT_ACTION.md`。
- 新增 `docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md`，定义省 token 开工读取顺序。
- 更新 startup、dev-log、dual-device、handoff 协议，把 project-state 三件套接入默认工作流。
- 新增 Windows 本轮日志，记录 AI workflow 底座改动和 Mac 同步方式。
- 本轮未推进 3D、Time Debt、数据库或页面重构。

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
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- Windows 端已确认 project-state 三件套存在。
- Windows 端已确认 `AI_WORKFLOW_TOKEN_SAVING.md` 存在。
- Windows 端已确认 startup、dev-log、dual-device、handoff 协议包含省 token / project-state 规则。
- Windows 端已确认本轮改动只在文档、协议、日志和交接卡范围内。

### 未验证 / 风险

- Mac 端尚未 pull 并验收。
- 本轮不改业务代码，因此未运行 UI / 3D / build 验收。
- 后续任务必须持续维护 `LOG_INDEX.md`，否则省 token 机制会退化。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/win-ai-workflow-token-saving
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/win-ai-workflow-token-saving
git pull origin feature/win-ai-workflow-token-saving
git rev-parse --short HEAD
```

确认输出的 commit 应为 Windows 最终汇报中的 commit。

## 6. Mac 端环境准备

本轮只做文档同步验收，不需要安装新依赖。若 Mac 后续需要运行应用，再执行：

```bash
pnpm install
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查以下文件是否存在：

- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md`
- `docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md`
- `docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md`
- `docs/dev-protocol/DEV_LOG_RULES.md`
- `docs/dev-protocol/PROJECT_HANDOFF_RULES.md`

预期结果：

- project-state 三件套可作为后续开工入口。
- `CODEX_STARTUP_CHECKLIST.md` 包含先读 project-state 的规则。
- `LOG_INDEX.md` 明确默认只读最近 5 条索引。
- Mac 端不重写 Windows 本轮建立的核心协议内容。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 完成：同步 Windows 推送的 AI 工作流省 token 底座，只做文件存在检查、读取顺序验收，并新增 `docs/dev-log/2026-05/2026-05-07/mac-ai-workflow-sync-check.md`。不要改 3D、Time Debt、业务代码或 project-state 核心内容。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git branch --show-current` 输出；
- `git rev-parse --short HEAD` 输出；
- `git fetch` / `git pull` 完整报错；
- 缺失文件路径；
- 如果出现冲突，粘贴冲突文件列表。

## 10. 注意事项

- 不要直接覆盖 Mac 本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- Mac 端本轮只新增同步验收日志，避免双端同时修改协议核心文件。

