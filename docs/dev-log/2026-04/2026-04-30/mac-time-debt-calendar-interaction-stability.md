# 开发日志｜Mac｜Time Debt Calendar Interaction Stability｜2026-04-30

## 1. 本轮目标

修复 Time Debt Calendar 交互稳定性：详情面板点击后持续显示；非当天事件可点击、选中、拖动；拖拽松手后真实落位并写回本地数据；重叠事件按并发列布局；当前时间线改为 Notion 风格细线；拖拽与点击不冲突。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarTimeAxis.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `app/renderer/src/features/time-debt/calendar/CustomDaysCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/DayCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/MonthCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/WeekCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarDragPreviewUtils.ts`
- `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`
- `docs/dev-log/2026-04/2026-04-30/mac-time-debt-calendar-interaction-stability.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 核心实现

- selectedEventId 持久化方案：沿用 `CalendarViewShell` 的 `selectedBlockId` 作为持久选中状态。事件点击只设置选中，不再 toggle 清空；点击其他事件切换详情；点击空白日期列清空选中；事件块阻止冒泡，避免背景网格立即取消详情。
- 非当天事件交互：日 / 周 / 自定义天数视图继续共用 `CalendarGrid` 与 `CalendarEventBlock`，每个日期列统一传入点击、拖拽、清空选中逻辑。今日高亮、网格线、当前时间线和空状态均不拦截 pointer events。
- 拖拽落位：事件块按 mouse down/up 位移区分 click 与 drag，移动小于 3px 视为点击，达到 3px 后进入拖拽。拖拽状态记录原始 X/Y、原始日期列、原始开始/结束分钟、列宽与列数；preview 同时计算横向 `deltaDays` 与纵向 15 分钟吸附。drop 后生成新 `startTime/endTime`。
- 本地持久化：Completed 日志更新 `TimeDebtLog.startTime/endTime/durationMinutes` 并调用 `saveTimeDebtLogs`；Planned/Missed 计划更新 `plannedStartTime/plannedEndTime/plannedDurationMinutes`，并同步 `TimePlanReminder.plannedStart/plannedEnd/plannedDuration`。Active 块保持可选中但不可拖动。
- 重叠布局：继续使用同一天 cluster + 最少并发列算法，事件块在列内保留 2px 间距、固定最小高度、文字 truncate，避免互相完全遮挡。
- 当前时间线：从今日列红色胶囊改为 Notion 风格绝对定位层：左侧时间标签、横跨网格的 1px 红线、今日列小红点；该层 `pointer-events: none`。月视图不显示分钟级时间线，仅弱化高亮今天日期。

## 5. 未修改区域

未修改 3D 模块、Windows skills、`.codex`、`.claude`、脚本工具链、协议文件、财富 / 成长树 / 周回看业务逻辑或数据库结构。本轮属于 Mac 默认 UI / 页面体验 / 前端交互范围，未触及跨边界。

## 6. 验收命令

- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node_modules/.bin/tsc --noEmit -p tsconfig.node.json`
- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json`
- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node_modules/.bin/electron-vite dev`

## 7. 验收结果

- TypeScript node 配置检查：通过。
- TypeScript renderer 配置检查：通过。
- Electron dev 启动：通过。`electron-vite dev` 成功构建 main/preload，renderer 在 `http://localhost:5174/` 启动，Electron app 可启动。
- 浏览器 smoke：通过。可打开本地 renderer、进入 Time Debt、切换到日历 tab；周视图可见，半小时时间轴可见，当前时间线左侧标签显示为 `5:57PM`，空状态不拦截页面渲染。
- 桌面交互验收：未做真实数据拖拽。当前本地数据为空，为避免制造用户业务数据，本轮未创建测试日志/计划；需要用户或下一轮用已有事件做点击、非当天事件拖拽和落位手感验收。

## 8. 风险与遗留问题

- 系统 PATH 仍无全局 `pnpm/npm/corepack`，本轮继续使用 Codex bundled Node 与本地 `node_modules/.bin`。
- 本轮未实现 resize 改变事件时长、跨周/跨月超长拖动、月视图拖拽和云端同步。
- 旧未渲染日历函数仍保留在 `TimeDebtDashboard.tsx`，后续可单独瘦身。

## 9. 下一步建议

下一轮优先做拖拽 resize 改时长与月视图事件密度优化；在交互稳定后，再清理 `TimeDebtDashboard.tsx` 中不再渲染的旧日历函数。
