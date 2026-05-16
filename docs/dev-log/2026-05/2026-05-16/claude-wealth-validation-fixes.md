# Wealth 统一验收缺陷修复｜第一轮

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：b61f74b feat(wealth): add quick record global shortcut

## 本轮修复内容

### 修复 A：收入来源饼图没有真正显示

根因：收入来源饼图组件已存在（IncomeBreakdownPie），但 `baseConfig.date` 从 localStorage 加载时被旧日期覆盖，导致 `referenceDate` 停留在旧日期。按"近30天"筛选时，新记录不在范围内，饼图显示空状态。

修复：见修复 B（日期修复），修复后 `referenceDate` 始终为当前本地日期，收入来源饼图能正确统计最近记录。

### 修复 B："今日"日期错误

根因：
1. `wealthConfigStorage.ts` 的 `loadWealthBaseConfig()` 返回 `{ ...defaultConfig, ...parsed }`，localStorage 中的旧 `date` 覆盖了 `defaultConfig.date`，导致日期永远停留在首次保存时。
2. 所有 `new Date().toISOString().slice(0, 10)` 使用 UTC 时区，对于 UTC+8（中国时区）会提前一天或推后一天。

修复：
- `wealthConfigStorage.ts`：新增 `getLocalDateKey()` 函数，`loadWealthBaseConfig()` 强制用当前本地日期覆盖存储值。
- `WealthDashboard.tsx`：`today` 常量改用本地日期计算。
- `WealthQuickRecordFloat.tsx`：`today` 常量改用本地日期计算。
- `wealthRecordInsights.ts`：`getDateRange()` 中的日期偏移改用 `localDateKey()` 替代 `toISOString().slice(0, 10)`。
- `overdraftTracker.ts`：`shiftDate()` 和 `buildDateRange()` 同样修复。
- `marketDataService.ts`：mock candle 日期生成修复。

### 修复 C：全部财富记录支持折叠/展开

修改 `RecordsTab`：
- 新增 `recordsExpanded` state，默认收起。
- 收起时只显示前 5 条记录。
- 底部显示「展开全部 N 条记录」按钮。
- 展开后显示全部，按钮变为「收起」。
- 只改 UI 展示，不改记录数据或存储。

## 文件变更

- `app/renderer/src/features/wealth/wealthConfigStorage.ts`（修改：强制当前日期）
- `app/renderer/src/features/wealth/WealthDashboard.tsx`（修改：today 本地日期 + 记录折叠）
- `app/renderer/src/features/wealth/WealthQuickRecordFloat.tsx`（修改：today 本地日期）
- `app/renderer/src/features/wealth/wealthRecordInsights.ts`（修改：日期偏移修复）
- `app/renderer/src/features/wealth/overdraftTracker.ts`（修改：日期偏移修复）
- `app/renderer/src/features/wealth/marketDataService.ts`（修改：candle 日期修复）

## 验证

- pnpm typecheck 通过
- pnpm build 通过
- 未修改 Time Debt
- 未修改 MainWorkspacePage
