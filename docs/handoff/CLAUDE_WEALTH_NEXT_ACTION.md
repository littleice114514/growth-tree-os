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
- **ECharts 图表语义修正完成**：柱状图=支出，蓝色折线=收入，橙色虚线=安全线。
- **ECharts 坐标轴修正完成**：Y 轴金额刻度可见，安全线残缺 label 已移除，金额格式统一为轻量 formatCurrency。
- **Wealth Records Insight MVP 完成**：
  - 记录搜索框：支持按类型、分类、备注、触发器、日期、金额关键词过滤。
  - 记录分组视图：支持按日期/类型/分类三种分组模式切换。
  - 支出类型占比饼图：ECharts PieChart，支持今天/近7天/近30天切换。
  - 饼图统计口径：仅 real_expense/ongoing_cost/experience_cost 支出类记录。
  - 饼图 Tooltip 显示分类名称、金额、占比百分比。
  - 饼图下方显示分类列表（颜色圆点+分类名+金额+占比）。
  - 无支出数据时显示空状态引导。
  - 新增 utility 文件 `wealthRecordInsights.ts`：搜索、分组、支出分类聚合。
  - 新增组件文件 `ExpenseBreakdownPie.tsx`：ECharts PieChart 支出占比饼图。

## 3. 本轮修改文件

- `app/renderer/src/features/wealth/wealthRecordInsights.ts`（新增：搜索/分组/支出聚合 utility）
- `app/renderer/src/features/wealth/ExpenseBreakdownPie.tsx`（新增：ECharts 支出占比饼图组件）
- `app/renderer/src/features/wealth/WealthDashboard.tsx`（修改：RecordsTab 增加搜索/分组/饼图）
- `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`（更新本轮记录）

## 4. 未做事项

- 未做记录编辑。
- 未做 emergency_cost 记录类型。
- 未做全局货币系统（当前默认 ¥）。
- 未做投资模块（已有路线设计，见 `WEALTH_INVESTMENT_MODE.md`）。
- 未做收入来源饼图（路线 A，已规划）。
- 未做 Wealth App 内快捷浮窗（路线 B，已规划）。
- 未做系统快捷键浮窗（路线 C，已规划）。
- 未做浮窗与投资记录关联（路线 D，待定）。
- 行情 K 线绑定 bug 未修（当前最高优先级）。

## 5. 与 Codex 的文件边界

- Claude（Wealth）：只修改 `app/renderer/src/features/wealth/**`。
- Codex（Time Debt）：只修改 `app/renderer/src/features/time-debt/**`。
- 两者不交叉修改。

## 6. 下一步任务建议

详见 `docs/project-map/WEALTH_QUICK_RECORD_MODE.md`。

按优先级：
1. **修复行情 K 线绑定 bug** — 当前最优先。
2. **收入来源结构图（路线 A）** — 饼图展示收入来源占比，放在 Wealth 总览中。
3. **Wealth App 内快捷浮窗（路线 B）** — 支持收入/支出/持续出血三类快速记录。
4. **系统快捷键 Option + Cmd + Z（路线 C）** — 浮窗稳定后再做。

## 7. 手动验收方式

- 进入 Wealth 页面 → 记录页 → 页面顶部出现开销去向饼图。
- 切换今天/近7天/近30天 → 饼图和分类列表更新。
- 饼图下方显示分类列表（颜色圆点+金额+占比）。
- 无支出数据时显示空状态引导文字。
- 搜索框输入「饮食」→ 过滤显示分类含饮食的记录。
- 搜索框输入「订阅」→ 过滤显示含订阅的记录。
- 点击「按日期」→ 记录按日期分组显示。
- 点击「按类型」→ 记录按类型（真实支出/睡后收入等）分组显示。
- 点击「按分类」→ 记录按分类（饮食/交通等）分组显示。
- 现金流趋势图仍正常显示（柱状图=支出，蓝线=收入，橙色虚线=安全线）。
- 新增财富记录弹窗仍可用。
- 参数页仍可用。
- Time Debt 页面仍能打开。
