# Log Index｜日志索引

> 作用：用索引替代全文扫描。后续 Codex 默认只读最近 5 条索引，只有必要时再按路径读取相关 1 到 3 个原始日志。

## 1. 读取规则

1. 默认读取最近 5 条索引。
2. 不默认扫描 `docs/dev-log/**` 全部历史。
3. 如果本轮任务需要追溯历史依据，只读取索引指向的相关日志。
4. 每次任务结束必须追加或更新一条索引。
5. 索引只放摘要，不放完整日志正文。

## 2. 日志索引模板

```md
## YYYY-MM-DD｜设备｜模块｜任务名

- 日期：
- 设备：
- 模块：
- 任务名：
- 日志文件路径：
- 修改文件：
- 完成内容：
- 验收结果：
- 遗留问题：
- 下一步：
```

## 3. 最近日志索引

## 2026-05-07｜Windows｜AI Workflow｜Token Saving Project State Workflow

- 日期：2026-05-07
- 设备：Windows
- 模块：AI Workflow / Dev Protocol / Project State
- 任务名：win-ai-workflow-token-saving
- 日志文件路径：`docs/dev-log/2026-05/2026-05-07/win-ai-workflow-token-saving.md`
- 修改文件：
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
- 完成内容：建立 project-state 三件套和省 token 开工规则，并接入启动、日志、双端和交接协议。
- 验收结果：Windows 端完成文件存在检查、关键规则检索、git diff/stat 检查；业务构建未运行，因为本轮不改业务代码。
- 遗留问题：Mac 端尚未拉取并写入同步验收日志。
- 下一步：Mac 端拉取 `feature/win-ai-workflow-token-saving`，检查文件存在和读取顺序，然后新增 `mac-ai-workflow-sync-check.md`。

