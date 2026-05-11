# Claude Wealth 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/claude-wealth-baseconfig-persistence-latest
- 基底分支：origin/feature/mac-time-debt-plan-flow-overlap-ui
- 当前设备：Claude（协同开发）

## 2. 本轮已完成

- 已为 Wealth 模块新增 baseConfig 持久化层：`wealthConfigStorage.ts`。
- localStorage key：`growth-tree-os:wealth-base-config:v1`。
- 已将 WealthDashboard.tsx 中硬编码的 baseConfig 改为从 storage 读取的 state。
- 已在 Overview 视图中新增「基础配置」面板，含 7 个可编辑字段 + 保存/恢复默认按钮。
- 已将 WealthDashboardPreview 从 mock 数据切换为接收真实 `DailyWealthSnapshot` + `WealthRecordSummary` props。
- WealthDashboard 现在向 WealthDashboardPreview 传入 `snapshot` 和 `summary`。
- 无 props 时仍回退 mock 数据，保持独立可用。
- `pnpm typecheck` 通过，`pnpm build` 通过。
- **P1 完成**：连续透支天数自动追踪。
  - 新建 `overdraftTracker.ts`，基于财富记录逐日计算是否超过每日安全线，从今天往回数连续透支天数。
  - 自动计算值与手动配置值取较大者作为生效值，传入 snapshot 计算链路。
  - Overview 新增「连续透支追踪」面板，显示自动计算值 / 手动值 / 生效值。
  - 连续透支 ≥ 3 天触发 system_risk 红色警告；1-2 天显示黄色提醒；0 天显示绿色正常。
  - 展示最近 5 天每日透支状态明细。
  - 不改 IPC、不改全局 store、不改数据库、不改 DashboardPreview。
  - `pnpm typecheck` / `pnpm build` / `pnpm smoke` 均通过。
- **P2 完成**：日期切换与透支天数查看。
  - `overdraftTracker.ts` 新增 `calculatePeriodOverdraftStreak`，支持今天/昨天/近7天/近30天四个周期。
  - `WealthDashboard.tsx` 新增 `selectedPeriod` 状态和「透支周期查看」面板。
  - 周期面板包含：周期选择按钮组、末尾连续透支天数、透支天数合计（如 3/7）、总支出、风险警告、每日明细。
  - 切换周期后，所有数据实时变化，无需刷新。
  - 不改 IPC、不改全局 store、不改数据库、不改 DashboardPreview。
  - `pnpm typecheck` / `pnpm build` / `pnpm smoke` 均通过。
- **P3 完成**：现金流趋势图 / 现金流质量历史。
  - `overdraftTracker.ts` 新增 `calculateCashflowTrend`、`TrendDay`、`CashflowTrend` 类型。
  - 趋势数据包含每日支出、安全线、是否透支、支出比例。
  - `WealthDashboard.tsx` 新增 `trendPeriod` 状态和「现金流质量趋势」面板。
  - 趋势面板包含：近7天/近30天切换、CSS 条形图（绿色正常/红色透支）、趋势判断文案、每日明细表格。
  - 条形高度按当日支出占最大值比例计算，hover 显示金额 tooltip。
  - 不改 IPC、不改全局 store、不改数据库、不改 DashboardPreview。
  - `pnpm typecheck` / `pnpm build` / `pnpm smoke` 均通过。
- **UI-IA 重构完成**：收敛页面入口 + 接入 P1/P2/P3 到 Overview 主视图。
  - Tab 从 5 个（Overview/Income/Expenses/Assets/Evaluation）收敛到 3 个（总览/记录/参数）。
  - Overview 主视图重排为「财务生命体征监控器」布局：
    - A. 顶部 Hero：状态标签 + 系统诊断 + 建议行动 + 连续透支/自由度/评分/未来钱 4 个关键指标
    - B. 现金流质量趋势（P3）：近7天/30天切换 + CSS 条形图 + 趋势判断文案
    - C. 周期透支明细（P2）：今天/昨天/近7天/近30天 + 连续透支天数 + 每日明细
    - D. 最近财富记录：最近 5 条，提示完整列表在「记录」页
    - E. Dashboard Preview
  - 记录 Tab：全部财富记录列表
  - 参数 Tab：基础配置 + 保存/恢复默认
  - Income/Expenses/Assets/Evaluation 不再作为独立 Tab 平铺。
  - 不改 IPC、不改全局 store、不改数据库、不改底层数据逻辑。
  - `pnpm typecheck` / `pnpm build` / `pnpm smoke` 均通过。
- **UI Polish 完成**：空状态承接 + Preview 收敛 + 零数据趋势优化。
  - RecordsTab 空状态：新增 `RecordsEmptyGuide` 组件，展示引导文案 + 3 个快捷记录类型提示卡片（收入/支出/持续消耗）。
  - Overview 的 DashboardPreview：新增 `CollapsiblePreviewPanel` 组件，默认收起，点击展开查看完整系统指标预览，减少首屏信息密度。
  - P3 零数据趋势图：当所有天支出为 0 时，显示半透明占位条 + "等待数据" 状态 + 引导文案；有数据时正常渲染。
  - 不改 IPC、不改全局 store、不改数据库、不改底层数据逻辑。
  - `pnpm typecheck` / `pnpm build` / `pnpm smoke` 均通过。
- **分类项目 MVP 完成**：财富记录分类字段从手填升级为可复用预设选择。
  - 新增 `wealthCategoryOptions.ts`，维护 8 个财富事件类型对应的默认分类预设。
  - 每种类型映射到具体的分类字段（source / category / title / assetName）。
  - `renderTypeFields` 中每个类型的分类字段下方新增 `CategoryPresetChips` 组件。
  - Chip 样式：小型 pill button，选中高亮，未选中灰色，hover 提亮。
  - 用户仍可手动输入自定义分类，chip 只是快捷填充。
  - 切换事件类型时，分类字段不自动清空，保留用户已输入内容。
  - 不改 IPC、不改全局 store、不改数据库、不改 DashboardPreview、不改 Time Debt。
  - `pnpm typecheck` / `pnpm build` / `pnpm smoke` 均通过。
- **现金流趋势图 V2 完成**：从 CSS 条形图升级为 SVG 组合图（柱状支出 + 折线收入 + 安全线 + 日记录联动）。
  - `overdraftTracker.ts`：`TrendDay` 新增 `totalIncome`/`incomeRatio`，`calculateCashflowTrend` 同时计算收入数据。
  - `overdraftTracker.ts`：新增 `buildDailyIncomeMap`，收入类型包括现实/睡后/系统/稳定理财。
  - 新建 `CashflowComboChart.tsx`：SVG 组合图组件，柱状图=支出，折线图=收入，虚线=安全线。
  - 透支日日期标签红色边框标注，hover 柱状图显示支出数据，hover 折线点显示收入数据（折线点优先级更高）。
  - 点击某一天下方显示「日记录切片」：当日收入/支出/状态 + 该日全部财富记录列表。
  - 零数据时显示半透明占位 + "等待数据"引导。
  - `CashflowTrendPanel` 改为接收 `records` prop，透传至 `CashflowComboChart`。
  - 不改 IPC、不改全局 store、不改数据库、不改 Time Debt。
  - `pnpm typecheck` / `pnpm build` / `pnpm smoke` 均通过。
- **现金流趋势图 V2 视觉重构完成**：安全线/收入线/hover/selected/透支日视觉体系重塑。
  - 收入折线：线条加粗至 0.55 SVG 单位，底部加半透明 area fill，0 值点弱化为小圆点。
  - 安全线：改为正式短虚线（4 1.8 dash），右侧带「安全线 ¥金额」标签，柔和琥珀色。
  - 柱子内部灰色竖线彻底移除，hover/selected 改为整列背景高亮带（hover 浅灰 7%, selected 12%）。
  - Tooltip 统一显示收入/支出/安全线 + 状态标签（正常/透支），不再区分 bar/dot 分别显示。
  - Selected 日期标签改为深色胶囊样式（白字 on 深色背景）。
  - 透支日：淡红柱 + 柱顶小红点 + 日期标签红色文字加粗。
  - 30 天模式日期标签稀疏化：首尾 + 每 5 天 + selected 日期永远显示。
  - 不改 IPC、不改全局 store、不改数据库、不改 Time Debt。
  - `pnpm typecheck` / `pnpm build` 均通过。

## 3. 本轮修改文件

- `app/renderer/src/features/wealth/CashflowComboChart.tsx`（新增：SVG 组合图组件，柱状+折线+安全线+日记录切片）
- `app/renderer/src/features/wealth/overdraftTracker.ts`（TrendDay 加 totalIncome/incomeRatio，新增 buildDailyIncomeMap）
- `app/renderer/src/features/wealth/WealthDashboard.tsx`（CashflowTrendPanel 替换为组合图，传入 records）
- `app/renderer/src/features/wealth/overdraftTracker.ts`（上轮新增 P3 函数）
- `app/renderer/src/features/wealth/wealthConfigStorage.ts`（上轮新建）
- `app/renderer/src/features/dashboard-preview/WealthDashboardPreview.tsx`（上轮：接收真实数据 props）

## 4. 未做事项

- ~~未做日期切换。~~ **已完成。**
- ~~未做趋势图。~~ **已完成。**
- 未做记录编辑。
- 未做 emergency_cost 记录类型。
- ~~未做连续透支天数自动追踪。~~ **已完成。**

## 5. 与 Codex 的文件边界

- Claude（Wealth）：只修改 `app/renderer/src/features/wealth/**`。
- Codex（Time Debt）：只修改 `app/renderer/src/features/time-debt/**`。
- 两者不交叉修改。

## 6. 下一步任务建议

按优先级：
1. ~~**Wealth P1**：连续透支天数自动追踪。~~ **已完成。**
2. ~~**Wealth P2**：日期切换（查看历史快照）。~~ **已完成。**
3. ~~**Wealth P3**：趋势图 / 现金流质量历史。~~ **已完成。**
4. ~~**Wealth UI-IA 重构**：收敛页面入口 + 接入 P1/P2/P3 到主视图。~~ **已完成。**
5. ~~**Wealth UI Polish**：空状态承接 + Preview 收敛 + 零数据趋势优化。~~ **已完成。**
6. ~~**Wealth 分类项目 MVP**：分类字段从手填升级为可复用预设选择。~~ **已完成。**
7. ~~**Wealth 现金流趋势图 V2**：柱状支出 + 折线收入 + 安全线 + 日记录联动。~~ **已完成。**
8. ~~**Wealth 现金流趋势图 V2 视觉重构**：安全线/收入线/hover/selected/透支日视觉体系重塑。~~ **已完成。**
9. **Wealth 日记录切片呈现优化**：记录明细呈现优化（下一轮建议）。
9. **Wealth 分类项目持久化设计**：保存用户自定义分类到 localStorage。
10. **Wealth 真实体验验收**：在 Electron 中实际操作，确认首屏体验后再推进新功能。

## 7. 手动验收方式

- 进入 Wealth 页面 → Overview → WealthDashboardPreview 区域显示真实 base config 数据。
- 修改「每日安全线」为 300 → 点击「保存配置」→ Preview 区域数据跟随变化。
- 点击「恢复默认」→ Preview 区域数据回到默认值。
- 清空 localStorage → 刷新页面 → 使用默认配置，不崩溃。
