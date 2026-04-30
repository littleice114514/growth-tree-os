# 开发日志｜Mac｜Time Debt Calendar UI Density｜2026-04-30

## 1. 本轮目标

精修 Time Debt Calendar UI：压缩日历事件块内容，把详细字段交给右侧详情面板；将“今日台”改名为“执行台”；移除执行台重复的大型日志/日历展示；补齐半小时时间刻度文字并弱化网格线。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventDetailPanel.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarTimeAxis.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`
- `docs/dev-log/2026-04/2026-04-30/mac-time-debt-calendar-ui-density.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 未修改区域

未触及 3D、skills、`.codex`、`.claude`、脚本、工具链、协议文件、数据库结构、全局路由、财富、成长树或周回看业务逻辑。本轮属于 Mac 默认 UI / 页面体验 / 前端交互范围，未触及跨边界。

## 5. 核心改动

- 事件块内容压缩：日 / 周 / 自定义天数视图中的 `CalendarEventBlock` 只常驻显示任务名；高度足够时显示时间范围；高度更大时才显示状态小标签。分类、项目、备注、AI 赋能比例、状态分等详细字段不再常驻显示在事件块内。
- 右侧详情面板承接字段：`CalendarEventDetailPanel` 补齐干扰源、备注/结果记录、计划时间、距离开始、Reminder/计划提示、Active 实际开始、Completed 实际开始/结束等信息，并保留开始计时、转补记、忽略、结束计时、删除日志操作。
- “今日台”改名：主 tab 显示名改为“执行台”，内部 key 仍保留 `today`，不影响 Reminder navigation intent 或页面状态。
- 执行台去重：`TodayView` 不再渲染旧 `DailyCalendarView` 大型日历/日志表，改为 `ExecutionSummaryPanel`，只保留行动入口、今日统计摘要、下一行动和诊断简报。
- 半小时时间刻度：`CalendarTimeScale` 增加 `showHalfHourLabel`，`CalendarTimeAxis` 统一显示整点与半小时文字；整点文字略重，半小时更浅，标签贴在横线左侧，无卡片/边框感。
- Notion 风格网格：整点线和半小时线继续复用 `CalendarGridLines`，降低边框透明度，去掉半小时虚线的表格感。

## 6. 验收命令

```bash
PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs typecheck
PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs build
PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs dev
```

## 7. 验收结果

- `typecheck` 通过。
- `build` 通过。
- `dev` 可启动，renderer 地址为 `http://localhost:5173/`，Electron app 开始启动。
- 浏览器 smoke：Time Debt 可打开；tab 显示为“执行台 / 日历 / 洞察”；执行台不再显示完整日历网格或完整日志列表；日历 tab 可打开；日 / 月视图可切换；半小时标签如 `9:30`、`10:30` 可见；点击已有事件后右侧详情面板包含状态、一级分类、AI 赋能比例、干扰源、结果记录等字段。
- 普通浏览器访问 renderer 仍会记录既有 Electron preload 相关 `window.growthTree` / `tree` 错误；真实 Electron dev app 已启动，本轮未修改该底层接口。

## 8. 风险与遗留问题

- 旧 `DailyCalendarView`、`TimeGrid`、`TimeBlock`、旧 `TimelineView` / `Weekly*` 函数仍保留在 `TimeDebtDashboard.tsx`，但执行台已不再渲染旧大日历。后续可在 Calendar V1 稳定后做专门瘦身。
- 本轮未实现拖拽保存，仍只保留已有拖拽预览。
- 本轮未做完整截图归档；建议下一轮在 Electron 窗口补截图。
- 系统级 `pnpm/npm/corepack` 仍不在 PATH，本轮继续使用 standalone pnpm。

## 9. 下一步建议

优先在 Electron 桌面窗口补齐截图验收：执行台、日历日视图、周视图、月视图、天数视图、半小时刻度、事件摘要、右侧详情、两个/三个重叠事件。验收稳定后，再清理 `TimeDebtDashboard.tsx` 中不再渲染的旧日历函数。
