# Time Debt 任务名与一级分类统一底座

## 本轮目标

- 让 Time Debt 正常记录和右下角浮窗快速记录共用任务名候选来源。
- 让两边一级分类选项统一为：工作 / 学习 / 休息 / 生活 / 其他。
- 让浮窗最近任务点击后同时回填任务名和一级分类。
- 保持浮窗结束计时写入正常 Time Debt logs。

## 记录来源诊断

- 正常记录入口：`TimeDebtDashboard.tsx` 的 `EntryModal`。
- 正常记录字段：`LogDraft.title` / `PlanDraft.title`，`LogDraft.primaryCategory` / `PlanDraft.primaryCategory`。
- 浮窗原任务来源：`TimeDebtQuickFloat.tsx` 内部 `loadRecentTaskOptions()`。
- 浮窗原分类来源：`TimeDebtQuickRecordForm.tsx` 内部分类常量。
- 两边已有共同写入层：`appendTimeDebtLog()`。

## 实施记录

- 新增 `timeDebtTaskCatalog.ts`，集中提供 `getRecentTimeDebtTasks()`、`getPrimaryCategories()`、`normalizeTimeDebtPrimaryCategory()`。
- `TimeDebtQuickFloat.tsx` 改为从统一 helper 读取最近任务。
- `TimeDebtQuickRecordForm.tsx` 改为从统一 helper 读取分类选项和归一化分类。
- `TimeDebtDashboard.tsx` 的任务历史候选改为复用 `getRecentTimeDebtTasks(logs, plans)`。
- `TimeDebtDashboard.tsx` 的一级分类候选改为固定五项统一来源。
- `timeDebtQuickTimer.ts` 开始计时时使用统一分类归一化。

## 验证结果

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 启动成功。
- 真实 Electron UI smoke：
  - Time Debt 页面正常打开。
  - 右下角浮窗可展开。
  - 一级分类选项包含工作 / 学习 / 休息 / 生活 / 其他。
  - `统一任务库测试 / 学习` 可开始计时。
  - 计时中卡片显示任务名和分类。
  - 结束计时后写入正常 Time Debt logs。
  - 最近任务出现 `统一任务库测试`。
  - 点击最近任务后任务名和分类回填正确。
  - Time Debt 页面不白屏。
  - Wealth 页面不白屏。
  - `Cmd+Option+T` 可从收起态重新展开浮窗。

## 遗留与下一步

- 本轮没有修改 Wealth、main/preload/ipc、Settings、package.json 或 project-state 三件套。
- 本轮没有做 ECharts、首页饼图、桌面浮窗、结束补充框或 AI 赋能占比。
- 下一轮建议：等待用户明确指令；若继续 Time Debt，优先做结束计时补充框第一阶段。
