# Current Status｜项目当前状态

> 作用：后续 Codex / Claude / GPT 开工时先读本文件，快速确认当前项目状态。本文只记录当前事实，不承载长篇历史。

## 1. 当前阶段

M13｜Time Debt Timer Stability｜P0 计时状态持久化与防卡住修复已完成。

## 2. 当前唯一主线

在已接入 AI 工作流底座的 `main` 上，按 project-state 三件套推进 Time Debt 模块的第一批 P0 稳定性修复。后续开工仍优先读取：

1. `AGENTS.md`
2. `docs/project-state/CURRENT_STATUS.md`
3. `docs/project-state/NEXT_ACTION.md`
4. `docs/project-state/LOG_INDEX.md` 最近 5 条

再按任务需要读取相关协议和代码。

## 3. 已完成

- 已建立双设备协同协议文件：`docs/dev-protocol/`。
- 已建立 Windows / Mac 分工规则、分支规则、日志拆分规则。
- 已在项目根目录新增 `AGENTS.md`，固化 Codex 工作底座 v4。
- 已建立 project-state 三件套：`CURRENT_STATUS.md`、`NEXT_ACTION.md`、`LOG_INDEX.md`。
- 已建立 Mac 接续操作卡：`docs/handoff/MAC_NEXT_ACTION.md`。
- 已将 AI 工作流底座合并进入主开发分支 `main`。
- 已完成 M13 P0：Time Debt 计时器 runningTimer localStorage 持久化、刷新恢复、beforeunload 提醒、结束成功清理、保存失败错误提示与安全清理入口。
- 已完成 Life Tree 3D 的前序阶段性推进，但当前已暂停继续做 3D 业务功能。
- 已决定本轮优先级：AI 工作流优化 > 3D 交互优化 > 3D 数据联动。

## 4. 未完成

- 后续开发任务需要持续按 `AGENTS.md` + project-state 三件套开工。
- 下一轮进入 M13 P1：Time Debt 跨天计时拆分。
- `LOG_INDEX.md` 需要持续维护最近任务索引。

## 5. 当前卡点

历史 dev-log 已经变多，如果每次开工都扫描完整日志，会浪费 token 并增加误读旧状态的风险。当前解决方式是根目录 `AGENTS.md` + project-state 三件套优先。

## 6. 最近一次验收结果

本轮目标是修复 Time Debt 计时器基础稳定性。已执行 `pnpm typecheck`；本轮不运行完整 Electron 手动验收，需另一设备或后续本地打开 Time Debt 页面确认刷新恢复、beforeunload 和 localStorage 清理。

## 7. 当前允许修改范围

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- `docs/project-state/**`
- `docs/handoff/MAC_NEXT_ACTION.md`
- 必要 dev-log

## 8. 当前禁止修改范围

- 不继续改 3D 模型。
- 不继续改触控板视角控制。
- 不改数据库结构。
- 不做页面大重构。
- 不修改 Wealth 相关文件。
- 不修改 Tree / Graph 相关文件。
- 不修改 `public/assets/**`。
- 不修改 3D 模型资源。
- 不做全局状态管理重构。

## 9. 下一步唯一任务

M13 P1｜Time Debt 跨天计时拆分。

## 10. Mac / Windows 双端状态

当前设备：

- 当前负责 Time Debt 计时器 P0 稳定性修复。
- 本轮只触碰 Time Debt 计时器相关代码和 project-state/handoff 文档。

另一台设备：

- 后续负责拉取并验收 Time Debt 计时器 P0 行为。
- 不在同一轮重写 project-state 和 dev-protocol 核心内容。

## 11. 当前分支建议

- 当前工作分支：`feature/m13-time-debt-timer-stability-p0`
- 主开发分支：`main`
- 不直接在 `main` 开发。

## 12. 当前日志策略

- `CURRENT_STATUS.md` 记录当前状态。
- `LOG_INDEX.md` 记录最近日志索引，不放完整日志正文。
- `docs/dev-log/**` 保存完整归档日志。
- 后续 Codex 默认只读 `LOG_INDEX.md` 最近 5 条；只有必要时再按索引读取相关 1 到 3 个原始日志。

## 13. 当前开工读取纪律

- 不默认读取完整 `docs/dev-log/**`。
- 不默认总结全部历史。
- 不跨模块大范围探索。
- 不在未确认分支、设备角色和文件边界前修改文件。
- 不把旧阶段日志当成当前阶段目标。

## 14. 当前验收纪律

- 文档类任务优先检查文件存在、关键规则接入和 git diff 范围。
- 业务构建只在业务代码、UI、依赖或运行路径变化时执行。
- 如果未运行业务构建，必须在 dev-log 和最终汇报中写明原因。
- GitHub push 失败时必须输出失败原因和本地状态，不得假装成功。

## 15. 当前同步纪律

- 当前设备完成后必须 push 远端 `main`。
- 另一台设备接手前必须先 `git status`。
- 另一台设备如有未提交改动，先停止并输出文件清单。
- 另一台设备验收时优先只读检查，不触碰业务代码。
- 两端不同时重写同一批协议核心文件。

## 16. 当前候选沉淀项

- project-state 三件套适合长期保留为项目级 SOP。
- 暂不新增正式 skill；先在本项目连续验证稳定性。
- 如果后续多轮都复用成功，再考虑沉淀为更通用的 skill 模板。
