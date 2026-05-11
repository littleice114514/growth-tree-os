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
- **P2 完成**：日期切换与透支天数查看。
- **P3 完成**：现金流趋势图 / 现金流质量历史。
- **UI-IA 重构完成**：收敛页面入口 + 接入 P1/P2/P3 到 Overview 主视图。
- **UI Polish 完成**：空状态承接 + Preview 收敛 + 零数据趋势优化。
- **分类项目 MVP 完成**：财富记录分类字段从手填升级为可复用预设选择。
- **现金流趋势图 V2 完成**：从 CSS 条形图升级为 SVG 组合图（柱状支出 + 折线收入 + 安全线 + 日记录联动）。
- **现金流趋势图 V2 视觉重构完成**：安全线/收入线/hover/selected/透支日视觉体系重塑。
- **ECharts 图表路线切换完成**：废弃手写 SVG 壳子，改用 echarts-for-react 实现柱状图 + markLine 安全线 + Tooltip。
  - 安装 `echarts` 6.0.0 + `echarts-for-react` 3.0.6 依赖。
  - `CashflowComboChart.tsx` 完全重写：SVG → ECharts BarChart。
  - 支出柱状图：正常=低饱和绿色，透支=柔和红色，圆角柱顶。
  - 安全线：markLine 虚线，右侧标签「安全线 ¥X」，琥珀色。
  - Tooltip：触发方式=axis，显示日期、收入、支出、安全线、状态（正常/透支）。
  - 图例：支出、每日安全线。
  - X 轴：7 天全部显示，30 天稀疏 + 旋转 30°。
  - 点击柱状图：日记录切片联动保留。
  - 零数据状态保留。
  - 收入折线暂不渲染，收入数据通过 Tooltip 和日记录切片展示。
  - 不改 IPC、不改全局 store、不改数据库、不改 Time Debt。
  - `pnpm typecheck` 通过，`pnpm build` 通过。

## 3. 本轮修改文件

- `app/renderer/src/features/wealth/CashflowComboChart.tsx`（完全重写：SVG → ECharts）
- `package.json`（新增 echarts + echarts-for-react 依赖）
- `pnpm-lock.yaml`（新增 echarts + echarts-for-react 依赖）
- `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`（更新本轮记录）

## 4. 未做事项

- 未做收入主折线（收入不每天都有，容易贴底消失，暂放 Tooltip）。
- 未做记录编辑。
- 未做 emergency_cost 记录类型。

## 5. 与 Codex 的文件边界

- Claude（Wealth）：只修改 `app/renderer/src/features/wealth/**`。
- Codex（Time Debt）：只修改 `app/renderer/src/features/time-debt/**`。
- 两者不交叉修改。

## 6. 下一步任务建议

按优先级：
1. **Wealth ECharts 图表 UI smoke 与日记录切片优化**（下一轮唯一建议）。
2. Wealth 分类项目持久化设计：保存用户自定义分类到 localStorage。
3. Wealth 真实体验验收：在 Electron 中实际操作，确认首屏体验后再推进新功能。

## 7. 手动验收方式

- 进入 Wealth 页面 → Overview → 现金流趋势图显示 ECharts 柱状图（非 SVG）。
- hover 柱状图 → Tooltip 显示日期、收入、支出、安全线、状态。
- 点击某一天 → 下方日记录切片切换到对应日期。
- 切换近 7 天 / 近 30 天 → 图表更新，30 天标签不挤。
- 安全线虚线可见，右端标签清晰。
- 透支日柱子为红色，正常日为绿色。
- 新增财富记录弹窗仍可用。
- 参数页仍可用。
- Time Debt 页面仍能打开。
