# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 当前模块：Time Debt Calendar
- 当前设备完成时间：2026-04-30 20:29 CST
- 最新 commit：以本轮最终汇报中的 `git rev-parse --short HEAD` 为准

## 2. 当前稳定能力

- Time Debt 日历支持日 / 周 / 月 / 自定义天数视图。
- 事件点击后右侧详情面板持续显示。
- Completed / Planned / Missed 事件可拖拽移动到新日期或新时间。
- Active 事件可查看详情，但不可拖拽或 resize。
- 当前时间线为左侧时间标签、1px 红线和今日列小红点。
- 重叠事件按同一天并发列布局。

## 3. 本轮已完成

- 当前时间线 overlay 提升到独立高层级，保持 `pointer-events: none`。
- 事件块颜色改为浅背景、深色左侧状态条、深色文字。
- Completed / Planned / Missed 增加上下边缘 resize。
- resize 使用 15 分钟吸附，最短 15 分钟。
- resize 后更新 Completed 日志或 Planned 计划，并同步计划提醒时间。
- 创建 `docs/handoff/TIME_DEBT_MODULE_INDEX.md`，后续替代反复阅读长日志。

## 4. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `app/renderer/src/features/time-debt/calendar/DayCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/WeekCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/CustomDaysCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarDragPreviewUtils.ts`
- `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/handoff/TIME_DEBT_MODULE_INDEX.md`

## 5. 当前未完成问题

- 月视图事件密度还未优化。
- 跨周 / 跨月复杂拖拽不在本轮范围。
- 字段系统和仪表盘只记录为 backlog，未开发。
- 需要在有真实 Time Debt 数据的环境中人工验收 resize。

## 6. 下一轮唯一目标

拖拽落位稳定 + 跨日期拖拽细节验收和修复。

## 7. 下一轮必读文件

- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/handoff/TIME_DEBT_MODULE_INDEX.md`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarDragPreviewUtils.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`

## 8. 禁止修改范围

- 不动 3D、财富、成长树、周回看。
- 不动 skills、脚本、工具链、协议文件。
- 不做 Notion API、Google Calendar / iCal、系统通知、数据库大重构。
- 不开发字段系统和仪表盘。

## 9. 验收标准

- `node_modules/.bin/tsc --noEmit -p tsconfig.node.json` 通过。
- `node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json` 通过。
- `node_modules/.bin/electron-vite dev` 可启动。
- Time Debt 页面和 Calendar 视图可打开。
- 当前时间线不遮挡点击、拖拽、resize。
- Planned / Active / Completed / Missed 颜色清楚可读。
- Completed / Planned / Missed 可通过上下边缘 resize。
- Active 不可 resize。
- resize 后事件高度和时间范围更新，详情面板持续显示。

## 10. Mac 端同步命令

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/mac-time-debt-plan-flow-overlap-ui
git pull origin feature/mac-time-debt-plan-flow-overlap-ui
git rev-parse --short HEAD
```

## 11. Backlog

- FUTURE | Property System: 为 Time Debt、Wealth、Growth Tree 提供可配置字段。
- FUTURE | Time Debt Dashboard: 展示时间结构、计划偏差、时间负债趋势、有效时间变化、分类占比、周/月热力图。
