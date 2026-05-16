# Wealth 收入来源结构图｜D1 开发记录

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：740a3bd fix(wealth): anchor mock candles to quote price

## 本轮目标

让 Wealth 不只体现节流（支出结构），也能体现开源（收入来源），新增收入来源饼图到 Wealth 总览页。

## 实现

### 数据层

`wealthRecordInsights.ts` 新增：

- `incomeTypes` — 收入类事件类型数组：`real_income`, `passive_income`, `system_income`, `stable_finance`
- `getIncomeSource(record)` — 获取收入来源标签，优先用 `source` 字段，fallback 到类型名
- `calculateIncomeBreakdown(records, period, referenceDate)` — 计算收入来源饼图数据

统计口径：

- 收入类事件：`real_income`, `passive_income`, `system_income`, `stable_finance`
- 资产变化正向流入：`asset_change` + `meta.direction = 'increase'`
- 不含：支出类、持续出血、体验出血、负向资产变化

输出指标：

- `slices` — 各来源的金额、占比、是否稳定收入、是否睡后收入
- `total` — 收入总额
- `maxSource` — 最大收入来源
- `stableRatio` — 稳定收入占比
- `passiveRatio` — 睡后收入占比

### 组件层

`IncomeBreakdownPie.tsx` 新增：

- ECharts 环形饼图（复用已有 echarts 依赖，不新增）
- 顶部指标卡片：收入总额、最大来源、稳定收入占比、睡后收入占比
- 时期切换：今天 / 近 7 天 / 近 30 天
- 饼图 tooltip 显示来源名称、金额、占比
- 来源列表：颜色圆点 + 来源名 + 稳定/睡后标签 + 金额 + 占比
- 空状态引导

### 集成层

`WealthDashboard.tsx` 修改：

- OverviewTab 新增 IncomeBreakdownPie，位置在现金流趋势和周期透支之间
- 新增 `incomePeriod` state，默认 `last30`
- OverviewTab 接收 `referenceDate` 和 `incomePeriod` props

## 文件变更

- `app/renderer/src/features/wealth/wealthRecordInsights.ts` — 新增 income breakdown 函数
- `app/renderer/src/features/wealth/IncomeBreakdownPie.tsx` — 新增收入来源饼图组件
- `app/renderer/src/features/wealth/WealthDashboard.tsx` — 集成到总览页

## 验证

- pnpm typecheck 通过
- pnpm build 通过
- 未修改 Time Debt
- 未修改 MainWorkspacePage
