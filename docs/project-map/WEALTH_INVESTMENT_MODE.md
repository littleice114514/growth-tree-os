# Wealth 投资模块开发模式

## 1. 路线来源

本文件用于保存 Wealth 投资模块通过活点地图确认后的开发模式，供后续 Claude / Codex / 新聊天框继续读取。
本模块不是券商交易系统，也不是投资推荐系统，而是 growth-tree-os 中的个人财富行为约束模块。

## 2. A+B+C 模式定义

### A｜投资记录底座

目标：先让用户能在 Wealth 中手动记录投资相关信息。

包含：
- 投资资产名称
- 资产类型
- 投入本金
- 当前估值
- 定投金额
- 定投频率
- 状态：进行中 / 暂停
- 备注

本阶段只做手动记录和本地持久化，不做图表、不做行情、不做建议。

### B｜投资结构看板

目标：把 A 阶段记录的数据汇总成可读结构。

包含：
- 投资本金合计
- 当前估值合计
- 浮动盈亏
- 资产占比
- 定投计划汇总
- 投资金额与可投资结余 / 安全线之间的关系

本阶段可以做基础汇总卡片，但不接 ECharts，除非后续任务明确要求。

### C｜投资决策约束系统

目标：把投资行为和个人现金流、安全线、时间负债系统连接起来。

包含：
- 当前是否具备继续投资条件
- 是否挤压生活现金流
- 是否低于安全线
- 是否需要暂停定投
- 是否存在单一资产占比过高
- 输出约束型提醒，不输出买卖建议

本阶段不做行情预测、不做收益承诺、不做自动投资建议。

## 3. 当前完成进度

- 已完成：
  - Wealth 已有 base config 本地持久化
  - `app/shared/wealth.ts` 中已有 `stable_finance`、`asset_change`、`assetType`、`financeType`、`investableSurplus` 等语义预留
  - A｜投资记录底座 MVP：手动录入/编辑/保存/刷新后不丢，localStorage key `growth-tree-os:wealth-investment-records:v1`
  - B｜投资结构看板 MVP：投资本金合计、当前估值合计、浮动盈亏、盈亏率、资产数量、进行中定投数、每月预计定投、资产类型分布、状态分布、约束型安全提醒
  - C｜投资决策约束系统 MVP：安全线约束、定投压力约束、单一资产集中度约束、状态纪律约束，全部为规则型提醒，无买卖建议
- 未完成：
  - A+B+C 整体验收与 UI 收口
- 当前处于：
  - A+B+C MVP 全部完成，下一轮做整体验收，不新增新能力

## 4. 下一步唯一任务

下一轮只做：
Wealth 投资模块 A+B+C 整体验收与 UI 收口，不新增新能力。

## 5. 文件边界

允许修改：
- `app/renderer/src/features/wealth/**/*`
- `app/shared/wealth.ts`（如确有必要补类型）
- `docs/project-map/WEALTH_INVESTMENT_MODE.md`
- `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-13/claude-wealth-investment-mode.md`

禁止修改：
- `app/renderer/src/features/time-debt/**/*`
- `TimeDebtQuickFloat.tsx`
- Codex Time Debt handoff
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/project-map/MAP_STATUS.md`
- `package.json`
- db / ipc / store 底层结构
- 3D / SystemX / AI Map / Tree / Nodes / Obsidian 相关模块

## 6. 验收标准

- `pnpm typecheck` 通过
- `pnpm build` 通过
- Wealth 页面不白屏
- 投资记录区域可见
- 可新增 / 编辑投资记录
- 刷新后投资数据不丢
- 原 Wealth base config 不丢
- Time Debt 不受影响

## 7. 禁止事项

- 不接真实券商 API
- 不接实时行情
- 不做交易功能
- 不做自动投资建议
- 不做收益承诺
- 不做行情预测
- 不接 ECharts
- 不碰 Time Debt
- 不改 project-state 三件套
- 不改 MAP_STATUS
