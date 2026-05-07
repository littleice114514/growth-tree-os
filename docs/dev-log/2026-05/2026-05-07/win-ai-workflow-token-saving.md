# 开发日志｜Windows｜win-ai-workflow-token-saving｜2026-05-07

## 1. 本轮目标

建立 AI 工作流省 token 与双端同步底座，让后续 Codex / Claude / GPT 开工时优先读取 project-state 三件套和日志索引，而不是反复读取完整历史 dev-log。

## 2. 当前分支

`feature/win-ai-workflow-token-saving`

## 3. 新增文件

- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md`
- `docs/dev-log/2026-05/2026-05-07/win-ai-workflow-token-saving.md`

## 4. 更新文件

- `docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md`
- `docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md`
- `docs/dev-protocol/DEV_LOG_RULES.md`
- `docs/dev-protocol/PROJECT_HANDOFF_RULES.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 5. 核心规则

- 后续开工优先读取 `CURRENT_STATUS.md`、`LOG_INDEX.md` 最近 5 条、`NEXT_ACTION.md`。
- 禁止默认扫描完整 `docs/dev-log/**`。
- 只有 `LOG_INDEX.md` 指向且任务确实需要追溯时，才读取相关 1 到 3 个原始日志。
- 每轮结束必须更新当前状态卡、日志索引和本轮独立 dev-log。
- Mac 端同步后只做 pull 验收和独立日志记录，不重写 Windows 本轮刚建立的核心协议内容。

## 6. Mac 端下一步同步方式

Mac 端切换到 `feature/win-ai-workflow-token-saving`，拉取远端后检查：

- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md`

验收通过后新增：

- `docs/dev-log/2026-05/2026-05-07/mac-ai-workflow-sync-check.md`

## 7. 未修改区域

- 未修改 3D 模型或渲染实现。
- 未修改触控板视角控制。
- 未修改 Time Debt 业务功能。
- 未修改数据库结构。
- 未修改 `app/renderer/**` 业务或 UI 文件。

## 8. 验收命令

```bash
git status
git diff --stat
Test-Path docs/project-state/CURRENT_STATUS.md
Test-Path docs/project-state/LOG_INDEX.md
Test-Path docs/project-state/NEXT_ACTION.md
Test-Path docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md
Select-String -Path docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md -Pattern "project-state"
Select-String -Path docs/dev-protocol/DEV_LOG_RULES.md -Pattern "日志分层"
Select-String -Path docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md -Pattern "Mac 同步验收"
Select-String -Path docs/dev-protocol/PROJECT_HANDOFF_RULES.md -Pattern "CURRENT_STATUS.md"
```

## 9. 验收结果

- `docs/project-state/CURRENT_STATUS.md` 存在。
- `docs/project-state/LOG_INDEX.md` 存在。
- `docs/project-state/NEXT_ACTION.md` 存在。
- `docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md` 存在。
- `CODEX_STARTUP_CHECKLIST.md` 已加入 project-state 优先读取和禁止默认扫描 dev-log 的规则。
- `DEV_LOG_RULES.md` 已加入日志分层规则。
- `DUAL_DEVICE_WORKFLOW.md` 已加入 AI 工作流同步验收规则。
- `PROJECT_HANDOFF_RULES.md` 已加入新聊天框优先复制状态卡规则。
- `git diff --stat` 显示本轮只修改文档、日志和交接卡。
- 本轮未运行业务构建；原因是本轮不改业务代码、UI、3D 或数据库。

## 10. 风险与遗留问题

- Mac 端尚未执行同步验收。
- 后续任务需要持续维护 `LOG_INDEX.md`，否则省 token 机制会退化。

## 11. 下一步建议

Mac 端拉取远端分支，按 `docs/handoff/MAC_NEXT_ACTION.md` 执行同步验收，并提交 `docs(workflow): verify ai workflow sync on mac`。
