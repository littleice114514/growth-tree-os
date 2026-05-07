# Next Action｜下一步唯一任务

## 1. 本轮唯一目标

建立 AI 工作流省 token 与双端同步底座，让后续 Codex / Claude / GPT 开工时优先读取 project-state 状态卡和日志索引，而不是反复读取完整历史 dev-log。

## 2. 本轮不做

1. 不继续改 3D 模型。
2. 不继续改触控板视角控制。
3. 不改 Time Debt 业务功能。
4. 不改数据库结构。
5. 不做页面大重构。
6. 不修改业务代码。

## 3. 必须读取的文件

后续开工默认读取顺序：

1. `docs/project-state/CURRENT_STATUS.md`
2. `docs/project-state/LOG_INDEX.md` 最近 5 条
3. `docs/project-state/NEXT_ACTION.md`
4. 与本轮任务直接相关的协议文件
5. 与本轮任务直接相关的代码文件

本轮协议相关任务还需要读取：

- `docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md`
- `docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md`
- `docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md`
- `docs/dev-protocol/DEV_LOG_RULES.md`
- `docs/dev-protocol/PROJECT_HANDOFF_RULES.md`
- `docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md`

## 4. 允许修改范围

- `docs/project-state/**`
- `docs/dev-protocol/**`
- `docs/dev-log/YYYY-MM/YYYY-MM-DD/win-*.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 5. 禁止修改范围

- `app/renderer/**`
- 数据库结构
- 3D 模型、材质、贴图、渲染实现
- Time Debt 业务功能
- Mac 端正在负责的 UI / 交互文件

## 6. 执行步骤

1. Windows 端创建或切换到 `feature/win-ai-workflow-token-saving`。
2. 新增 `docs/project-state/` 三件套。
3. 新增 `docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md`。
4. 更新 startup、dev-log、dual-device、handoff 协议。
5. 写入 Windows 本轮 dev-log。
6. 更新 `docs/handoff/MAC_NEXT_ACTION.md`。
7. 检查 `git status` 和 `git diff --stat`。
8. commit 并 push 远端分支。
9. Mac 端拉取后只做同步验收，不重写核心协议内容。

## 7. 验收标准

- `docs/project-state/CURRENT_STATUS.md` 存在。
- `docs/project-state/LOG_INDEX.md` 存在。
- `docs/project-state/NEXT_ACTION.md` 存在。
- `docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md` 存在。
- `CODEX_STARTUP_CHECKLIST.md` 已加入 project-state 优先读取规则。
- `DEV_LOG_RULES.md` 已加入日志分层规则。
- `DUAL_DEVICE_WORKFLOW.md` 已加入 Mac 同步验收规则。
- `PROJECT_HANDOFF_RULES.md` 已加入新聊天框优先复制状态卡规则。
- Windows dev-log 已写入。
- commit 与 push 完成。

## 8. 可检验信号

```bash
git branch --show-current
git status
git log --oneline -5
```

应看到：

- 当前分支：`feature/win-ai-workflow-token-saving`
- 最新 commit：`chore(workflow): add token-saving project state workflow`
- 远端存在同名分支。

