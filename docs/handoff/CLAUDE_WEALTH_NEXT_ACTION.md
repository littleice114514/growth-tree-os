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
- **行情 K 线价格锚定修复完成**：mock candle 最后一根 close 锚定 quote.price。
- **收入来源结构图完成（路线 A）**：
  - 新增 `IncomeBreakdownPie.tsx`，ECharts 环形饼图。
  - 放在 Wealth 总览页，现金流趋势和周期透支之间。
  - 统计口径：real_income / passive_income / system_income / stable_finance / asset_change(increase)。
  - 指标：收入总额、最大来源、稳定收入占比、睡后收入占比。
  - 支持今天/近7天/近30天切换。
- **Wealth App 内快捷记录浮窗完成（路线 B）**：
  - 新增 `WealthQuickRecordFloat.tsx`，固定定位右下角。
  - 支持三类事件：收入 / 支出 / 持续出血。
  - 收入：选择来源类型（现实/睡后/系统/稳定理财/其他），写入对应 WealthRecordType。
  - 支出：选择分类（生活/学习/工具/交通/饮食/娱乐/其他），写入 real_expense。
  - 持续出血：选择周期（每天/每周/每月/每年），写入 ongoing_cost + meta.cycle。
  - 完全复用现有 appendWealthRecord，不新建记录系统。
  - 最小校验：名称非空、金额>0、持续出血必选周期。
- **Wealth 全局快捷键完成（路线 C）**：
  - 快捷键：`CommandOrControl+Alt+Z`（Mac: Option + Command + Z）。
  - 完全复用 Time Debt 快捷键架构：main → IPC → preload → renderer。
  - 触发后切换浮窗展开/收起。
  - 注册失败时安全输出日志，不崩溃。

## 3. 本轮修改文件

- `app/renderer/src/features/wealth/WealthQuickRecordForm.tsx`（新增：从浮窗拆出的表单组件）
- `app/renderer/src/features/wealth/WealthQuickRecordFloat.tsx`（重构：保留浮窗外壳 + 状态 + 保存逻辑，表单委托给 WealthQuickRecordForm）
- `app/renderer/src/features/quick-record/UnifiedQuickRecordFloat.tsx`（新增：统一记录入口外壳 + 快捷键监听）
- `app/renderer/src/pages/MainWorkspacePage.tsx`（修改：替换 TimeDebtQuickFloat 为 UnifiedQuickRecordFloat）
- `app/renderer/src/features/wealth/WealthDashboard.tsx`（修改：移除 WealthQuickRecordFloat 挂载）
- `app/main/index.ts`（修改：新增 quick-record:open IPC + Cmd+Alt+R 快捷键 + 旧快捷键重定向）
- `app/preload/index.ts`（修改：新增 quickRecord.onOpenQuickRecord）
- `app/shared/contracts.ts`（修改：新增 quickRecord 类型定义）
- `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`（更新本轮记录）
- `docs/dev-log/2026-05/2026-05-16/claude-unified-quick-record-p0b-wealth-form.md`（新增：P0-B 第二步开发记录）
- `docs/dev-log/2026-05/2026-05-16/claude-unified-quick-record-p0c-shell.md`（新增：P0-C 开发记录）
- `docs/dev-log/2026-05/2026-05-16/claude-unified-quick-record-p0d-mount.md`（新增：P0-D 开发记录）
- `docs/dev-log/2026-05/2026-05-16/claude-unified-quick-record-p0d-p0e.md`（新增：P0-D+P0-E 开发记录）

## 4. 未做事项

- 未做记录编辑。
- 未做 emergency_cost 记录类型。
- 未做全局货币系统（当前默认 ¥）。
- 未做投资模块（已有路线设计，见 `WEALTH_INVESTMENT_MODE.md`）。
- ~~未做收入来源饼图~~ → 已完成。
- ~~行情 K 线绑定 bug~~ → 已修复。
- ~~Wealth App 内快捷浮窗~~ → 已完成。
- ~~系统快捷键浮窗~~ → 已完成。
- ~~今日日期 bug~~ → 已修复。
- ~~全部记录折叠~~ → 已完成。
- **P0｜统一记录入口重构**：
  - 设计沉淀已完成，见 `docs/project-map/UNIFIED_QUICK_RECORD_MODE.md`。
  - 阶段拆分：P0-A 设计 → P0-B 组件解耦 → P0-C 统一外壳 → P0-D 主工作区挂载 → P0-E 统一快捷键 → P0-F 旧入口收口。
  - **P0-B 第一步完成**：已从 TimeDebtQuickFloat 拆出 TimeDebtQuickRecordForm，UI 行为不变。
  - **P0-B 第二步完成**：已从 WealthQuickRecordFloat 拆出 WealthQuickRecordForm，UI 行为不变。
  - **P0-C 完成**：新增 UnifiedQuickRecordFloat 统一入口外壳，含类型切换 + 复用两个 Form 组件。
  - **P0-D 完成**：统一入口已挂载到 MainWorkspacePage。移除旧 TimeDebtQuickFloat 和 WealthQuickRecordFloat 的页面挂载（源码保留）。
  - **P0-E 完成**：新增统一快捷键 `CommandOrControl+Alt+R`（choose mode）。旧快捷键兼容：Time Debt 快捷键 → 统一入口 + 默认记录时间；Wealth 快捷键 → 统一入口 + 默认记录财富。IPC 通道 `quick-record:open`。
  - 下一步：统一验收。
- **P2｜行情 K 线历史本地缓存**（后续）：保存已拉取/生成的日 K 数据到本地，支持超过 30 天的长期趋势观察。
- 未做浮窗与投资记录关联（路线 D，待定）。

## 5. 与 Codex 的文件边界

- Claude（Wealth）：只修改 `app/renderer/src/features/wealth/**`。
- Codex（Time Debt）：只修改 `app/renderer/src/features/time-debt/**`。
- 两者不交叉修改。

## 6. 下一步任务建议

详见 `docs/project-map/WEALTH_QUICK_RECORD_MODE.md`。

按优先级：
1. ~~修复行情 K 线绑定 bug~~ → 已完成。
2. ~~收入来源结构图（路线 A）~~ → 已完成。
3. ~~Wealth App 内快捷浮窗（路线 B）~~ → 已完成。
4. ~~系统快捷键 Option + Cmd + Z（路线 C）~~ → 已完成。
5. ~~统一验收缺陷修复~~ → 已完成。
6. ~~P0-A｜统一记录入口设计沉淀~~ → 已完成。
7. ~~P0-B 第一步｜拆出 TimeDebtQuickRecordForm~~ → 已完成。
8. ~~P0-B 第二步｜拆出 WealthQuickRecordForm~~ → 已完成。
9. ~~P0-C｜构建统一记录入口外壳 UnifiedQuickRecordFloat~~ → 已完成。
10. ~~P0-D｜主工作区挂载统一入口~~ → 已完成。
11. ~~P0-E｜统一快捷键 CommandOrControl+Alt+R~~ → 已完成。
12. **统一验收** — 当前下一步。
13. P2｜行情 K 线历史本地缓存 — 后续。
14. 浮窗与投资记录关联（路线 D）— 后续。

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
