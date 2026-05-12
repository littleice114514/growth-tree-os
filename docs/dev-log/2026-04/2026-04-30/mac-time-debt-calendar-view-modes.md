# 开发日志｜Mac｜Time Debt Calendar View V1｜2026-04-30

## 1. 本轮目标

- 将 Time Debt 时间日志从单一周视图升级为统一 Calendar View。
- 支持日 / 周 / 月 / 自定义天数视图。
- 固化当前时间线、时间刻度、时间块定位、重叠事件布局和拖拽预览预留。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarViewSwitcher.tsx`
- `app/renderer/src/features/time-debt/calendar/DayCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/WeekCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/MonthCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/CustomDaysCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarTimeAxis.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventDetailPanel.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`
- `app/renderer/src/features/time-debt/calendar/calendarDateUtils.ts`
- `app/renderer/src/features/time-debt/calendar/calendarTimePositionUtils.ts`
- `app/renderer/src/features/time-debt/calendar/calendarOverlapLayoutUtils.ts`
- `app/renderer/src/features/time-debt/calendar/calendarDragPreviewUtils.ts`
- `docs/dev-log/2026-04/2026-04-30/mac-time-debt-calendar-view-modes.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 日 / 周 / 月 / 自定义天数视图实现情况

- `时间轴` tab 已更名为 `日历`。
- 新增统一 `calendarViewMode`：`day / week / month / customDays`。
- 新增 `calendarAnchorDate` 和 `customDayCount`。
- 日视图显示单日时间轴。
- 周视图显示周日到周六 7 天时间轴。
- 月视图显示 7 列、5-6 行整月网格，并显示事件摘要、今天高亮、非本月弱化、超出 `+N`。
- 自定义天数视图复用周视图网格，支持 2-9 天，上一段 / 下一段按 N 天移动。

## 5. 当前时间线与跨天自动切换

- Calendar 内部新增分钟级时钟，每 60 秒刷新一次当前时间线。
- 日 / 周 / 自定义天数视图只在包含今天的日期列显示当前时间线。
- 当前时间线标签显示 `HH:mm`。
- 如果当前范围正在查看旧的今天，跨天后自动将 anchor date 切到新日期；周 / 月视图随 anchor date 进入新周 / 新月。
- active timer 的秒级 elapsed 显示仍由原有 `timerNow` 维护，未改 active timer 存储链路。

## 6. 时间刻度优化方式

- 新增 `CalendarTimeAxis` 和 `CalendarGridLines`。
- 左侧时间不再做厚重表格卡片，整点文字贴近水平线。
- 半小时线使用更浅的 dashed line。
- 默认时间配置：`visibleStartHour=0`、`visibleEndHour=24`、`pixelsPerMinute=0.8`、`minuteStep=30`、`showHalfHourLine=true`。

## 7. 时间块定位算法

- 新增 `calendarTimePositionUtils.ts`。
- `timeToTop` 由开始分钟和可见起点计算。
- `durationToHeight` 由持续分钟计算，并保留 `minEventHeight=24`。
- `positionCalendarBlock` 对早于 / 晚于可见范围的事件做顶部 / 底部截断。
- 日 / 周 / 自定义天数视图共用同一套定位算法。

## 8. 重叠事件布局算法

- 新增 `calendarOverlapLayoutUtils.ts`。
- 同一天内按开始时间排序，按相交关系聚合 overlap group。
- 使用贪心列分配计算 `columnIndex` 和 `groupColumnCount`。
- 不重叠事件占满列宽。
- 重叠事件按并发列数并排显示：2 个约 50%，3 个约 33.33%。

## 9. 拖拽预留情况

- 新增 `dragState`、`dragPreview`、`snapToMinute`、`pixelToTime`、`timeToPixel`。
- 事件块 hover / mouse down 显示可拖拽语义。
- 拖动过程中显示半透明预览框。
- 右侧详情面板在拖拽时显示“调整中”、原时间段、预览时间段和变化量。
- 本轮不保存拖拽结果，不修改真实 logs / plans；完整拖拽创建和保存链路留作 TODO。

## 10. 未修改区域

- 未修改 3D 模块。
- 未修改 Windows skills、`.codex`、`.claude`、脚本或工具链。
- 未修改数据库结构、Reminder 存储逻辑、active timer 存储逻辑。
- 未修改财富、成长树、周回看业务逻辑。
- 未修改双端协议文件。

## 11. 验收命令

- `./node_modules/.bin/tsc --noEmit -p tsconfig.node.json`
- `./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json`
- `pnpm build`
- `./node_modules/.bin/electron-vite build`

## 12. 验收结果

- `tsconfig.node.json` 类型检查通过。
- renderer 类型检查通过。
- `pnpm build` 未运行成功：当前 shell 中 `pnpm` 不在 PATH。
- `./node_modules/.bin/electron-vite build` 未通过：当前本机 Rollup native optional dependency `@rollup/rollup-darwin-arm64` 动态库签名 / optional dependency 加载异常。
- 未完成真实桌面点击截图验收；如果本机 dev/build 仍受 Rollup native optional dependency 影响，需要在 Mac 端重装依赖后继续截图验收。

## 13. 风险与遗留问题

- 完整拖拽保存链路未实现。
- 跨天事件仅按显示日期做基础裁剪，不做复杂跨天编辑。
- 旧 `TimeDebtDashboard.tsx` 内仍保留 Today 日历小组件和部分旧周视图函数，后续可在 Calendar V1 稳定后继续瘦身。

## 14. 是否触及跨边界

- 否。本轮属于 Mac 默认负责的 UI / 页面体验 / 前端交互优化。

## 15. 下一步建议

- Mac 端启动桌面应用，按日 / 周 / 月 / 3 天 / 9 天完成截图验收。
- 创建 30 分钟、2 小时、2 个重叠、3 个重叠事件，确认高度和并排布局。
- 确认 Today、洞察、Reminder 和 active timer 无明显回归。

---

## 16. 断点续跑记录｜2026-04-30

### 断点检查结果

- 当前分支：`feature/mac-time-debt-plan-flow-overlap-ui`
- 断点起始 commit：`8a26a17 feat(time-debt): add unified calendar view modes`
- 开工前工作树：干净
- Time Debt Calendar V1 源码已存在，未发现缺失组件。
- `CalendarViewShell`、日 / 周 / 月 / 自定义天数视图、时间轴、事件块、详情面板、定位工具、重叠布局工具、拖拽预览工具均已落地。
- `TimeDebtDashboard.tsx` 中仍保留旧 Today 小日历和旧周视图函数，但当前 `日历` tab 已接入新的 `CalendarViewShell`。

### 已完成项

- 日 / 周 / 月 / 天数视图入口可见。
- 今天 / 上一段 / 下一段按钮可见。
- 月视图可显示整月网格、事件摘要、今天高亮、非本月日期弱化和 `+N`。
- 自定义天数视图可显示 2-9 天选择入口，默认 3 天。
- 时间刻度显示整点、半小时弱线和当前时间标签。
- 时间块定位、最小高度、可见范围截断工具已实现。
- 重叠事件分组和分列算法已实现。
- 拖拽预留结构已实现，本轮仍不保存真实数据。

### 本次续做项

- 使用临时 pnpm standalone 恢复 package manager 能力。
- 删除并重装 `node_modules`，修复 Rollup native optional dependency 签名 / 加载问题。
- 单独运行 Electron 安装脚本，恢复 Electron 二进制。
- 使用 Codex workspace runtime Node 运行 `typecheck`、`build` 和 `dev`。
- 用本地浏览器对 `http://localhost:5173/` 做轻量 UI smoke：Time Debt 可打开，日历 tab 可打开，日 / 月 / 天数可切换，月视图事件可选中并打开详情，洞察和提醒页面可打开。

### 验收结果

- 通过：`PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs typecheck`
- 通过：`PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs build`
- 通过：`PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs dev` 可启动 dev server 和 Electron app。
- 浏览器 smoke 通过：Time Debt 页面可打开；`日历` tab 可渲染；日 / 月 / 天数视图可切换；月视图事件点击后右侧详情面板显示任务信息；洞察和提醒页面可打开。
- 注意：普通浏览器访问 localhost 时会出现 `window.growthTree` preload 缺失错误，这是非 Electron 环境的预期限制；Electron dev 进程本身已启动。

### 未完成项 / TODO

- 未做完整拖拽保存链路，当前仅预览。
- 未做复杂跨天事件编辑。
- 未完成正式截图归档。
- 后续可清理 `TimeDebtDashboard.tsx` 中旧周视图函数，把 Today 小日历也迁入 Calendar 子模块。

### 是否触及双端边界

- 否。本次只处理 Mac 端 Time Debt UI / 前端验收与依赖环境恢复。
- 未修改 3D、Windows skills、`.codex`、`.claude`、脚本工具链、数据库结构、财富、成长树、周回看业务逻辑或协议文件。

### 下一步建议

- 在 Electron 窗口中补截图：日视图、周视图、月视图、天数入口、当前时间线、事件选中态、右侧详情面板。
- 如需验证 2/3 个重叠事件，请在 Time Debt 中补记对应测试日志后复查并排布局。
