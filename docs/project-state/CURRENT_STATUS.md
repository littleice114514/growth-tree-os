# Current Status｜项目当前状态

> 作用：后续 Codex / Claude / GPT 开工时先读本文件，快速确认当前项目状态。本文只记录当前事实，不承载长篇历史。

## 1. 当前阶段

M-AI｜AI 工作流省 token 与双端同步优化。

## 2. 当前唯一主线

先建立省 token 的项目状态读取机制，让后续开工优先读取：

1. `docs/project-state/CURRENT_STATUS.md`
2. `docs/project-state/LOG_INDEX.md` 最近 5 条
3. `docs/project-state/NEXT_ACTION.md`

再按任务需要读取相关协议和代码。

## 3. 已完成

- 已建立双设备协同协议文件：`docs/dev-protocol/`。
- 已建立 Windows / Mac 分工规则、分支规则、日志拆分规则。
- 已完成 Life Tree 3D 的前序阶段性推进，但当前已暂停继续做 3D 业务功能。
- 已决定本轮优先级：AI 工作流优化 > 3D 交互优化 > 3D 数据联动。

## 4. 未完成

- Mac 端尚未拉取并验收本轮 AI 工作流底座。
- 后续开工规则尚需在 Mac 端实际执行一次验证。
- `LOG_INDEX.md` 需要从本轮开始持续维护最近任务索引。

## 5. 当前卡点

历史 dev-log 已经变多，如果每次开工都扫描完整日志，会浪费 token 并增加误读旧状态的风险。

## 6. 最近一次验收结果

本轮 Windows 端目标是文档与协议工作流建设。验收以文件存在、协议接入、日志写入、commit 与 push 为准，不运行业务构建。

## 7. 当前允许修改范围

- `docs/project-state/**`
- `docs/dev-protocol/**`
- `docs/dev-log/YYYY-MM/YYYY-MM-DD/win-*.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 8. 当前禁止修改范围

- 不继续改 3D 模型。
- 不继续改触控板视角控制。
- 不改 Time Debt 业务功能。
- 不改数据库结构。
- 不做页面大重构。
- 不修改 `app/renderer/**` 业务或 UI 文件。

## 9. 下一步唯一任务

Mac 端拉取 `feature/win-ai-workflow-token-saving`，检查 project-state 三件套和省 token 协议是否存在，并新增一条 Mac 同步验收日志。

## 10. Mac / Windows 双端状态

Windows：

- 当前负责 AI 工作流底座、协议文件、project-state 三件套、日志索引规则和同步说明。
- 本轮不触碰业务代码。

Mac：

- 本轮后续只负责拉取、检查、验收和写入独立 Mac 同步验收日志。
- 不在同一轮重写 project-state 和 dev-protocol 核心内容。

## 11. 当前分支建议

- Windows 本轮分支：`feature/win-ai-workflow-token-saving`
- Mac 验收同一分支：`feature/win-ai-workflow-token-saving`
- 不直接在 `main` 开发。

## 12. 当前日志策略

- `CURRENT_STATUS.md` 记录当前状态。
- `LOG_INDEX.md` 记录最近日志索引，不放完整日志正文。
- `docs/dev-log/**` 保存完整归档日志。
- 后续 Codex 默认只读 `LOG_INDEX.md` 最近 5 条；只有必要时再按索引读取相关 1 到 3 个原始日志。

