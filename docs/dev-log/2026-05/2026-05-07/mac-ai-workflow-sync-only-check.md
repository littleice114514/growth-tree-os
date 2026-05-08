# dev-log｜2026-05-07｜Mac｜AI 工作流仅文档同步验收

## 1. 本轮目标

Mac 端只同步 Windows 端推送的 AI 工作流省 token 底座文档，不同步 3D 模块、业务代码、模型资产或页面修改。

## 2. 同步方式

本轮没有直接 checkout / pull 整个 feature/win-ai-workflow-token-saving 分支，而是通过 git restore --source 只恢复指定工作流文件。

## 3. 已同步范围

- docs/project-state/
- docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md
- docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md
- docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md
- docs/dev-protocol/DEV_LOG_RULES.md
- docs/dev-protocol/PROJECT_HANDOFF_RULES.md
- docs/dev-log/2026-05/2026-05-07/win-ai-workflow-token-saving.md

## 4. 明确未同步范围

- 3D 模块代码
- 模型资产
- Time Debt 业务功能
- UI 页面代码
- 数据库结构
- 其他业务模块

## 5. Mac 端后续开工读取顺序

后续 Mac 端开工时默认读取：

1. docs/project-state/CURRENT_STATUS.md
2. docs/project-state/LOG_INDEX.md 最近 5 条
3. docs/project-state/NEXT_ACTION.md
4. 与本轮任务直接相关的协议文件
5. 与本轮任务直接相关的代码文件

禁止默认扫描完整 docs/dev-log 历史。

## 6. 验收结果

通过。Mac 端已完成 AI 工作流文档同步，未主动同步 3D 模块内容。
